#!/usr/bin/env python3
"""Standard CLI tool to validate and record business rules assessment into Canonical Run JSON.

Guarantees correct schema, accurate count reconciliation, and deterministic Python JSON serialization.
"""

import argparse
import copy
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
SCRIPTS = ROOT / ".codex" / "scripts"
sys.path.insert(0, str(SCRIPTS))
from metrics_contract import atomic_write, digest, read_json, require, writable

AUDIT_SCRIPTS = ROOT / ".codex" / "skills" / "audit-generation-metrics" / "scripts"
sys.path.insert(0, str(AUDIT_SCRIPTS))
from calculate_metrics import (
    STATUSES,
    validate_snapshot,
    validate_br_runtime,
    verification_defects
)


def build_snapshot(requirements, ordered_br_ids, source_revision, assessed_at=None):
    if not isinstance(requirements, list):
        raise ValueError("requirements must be a list")

    # Map by br_id for ordered sequence
    req_by_id = {}
    for idx, r in enumerate(requirements):
        if not isinstance(r, dict) or "br_id" not in r:
            raise ValueError(f"requirement[{idx}] must be a dict with 'br_id'")
        br_id = r["br_id"]
        if br_id in req_by_id:
            raise ValueError(f"duplicate requirement: {br_id}")
        req_by_id[br_id] = r

    ordered_rows = []
    counts = {s: 0 for s in STATUSES}
    for br_id in ordered_br_ids:
        if br_id not in req_by_id:
            raise ValueError(f"missing requirement for ordered BR ID: {br_id}")
        row = req_by_id[br_id]
        status = row.get("status")
        if status not in STATUSES:
            raise ValueError(f"invalid status for {br_id}: {status} (expected one of {STATUSES})")
        rationale = row.get("rationale", "").strip()
        if not rationale:
            raise ValueError(f"rationale required for {br_id}")
        evidence = row.get("evidence", [])
        if not isinstance(evidence, list) or not evidence or any(not isinstance(e, str) or not e.strip() for e in evidence):
            raise ValueError(f"evidence list required for {br_id}")
        runtime_obs = row.get("runtime_observation_ids", [])
        if not isinstance(runtime_obs, list):
            raise ValueError(f"runtime_observation_ids must be a list for {br_id}")

        ordered_rows.append({
            "br_id": br_id,
            "status": status,
            "rationale": rationale,
            "evidence": evidence,
            "runtime_observation_ids": runtime_obs
        })
        counts[status] += 1

    assessed_time = assessed_at or datetime.now(timezone.utc).isoformat()
    return {
        "source_revision": source_revision,
        "assessed_at": assessed_time,
        "requirements": ordered_rows,
        "total": len(ordered_br_ids),
        "met": counts["met"],
        "unmet": counts["unmet"],
        "not_evaluable": counts["not_evaluable"]
    }


def record_business_rules(run_path, stage="initial", requirements_input=None,
                          source_revision=None, assessed_at=None, dry_run=False):
    run_file = writable(Path(run_path).resolve())
    data = read_json(run_file)

    br_block = data.setdefault("business_rules", {})
    ordered = br_block.get("ordered_br_ids")
    if not isinstance(ordered, list) or not ordered:
        baseline_rel = br_block.get("baseline")
        if baseline_rel:
            baseline_data = read_json(writable(ROOT / baseline_rel))
            ordered = baseline_data.get("ordered_br_ids", [])
            br_block["ordered_br_ids"] = ordered
    require(isinstance(ordered, list) and ordered, "ordered_br_ids required in business_rules")

    # Resolve matching flow assessment for stage
    flow_block = data.get("flow_accuracy", {})
    assessments = flow_block.get("assessments", [])
    matching_assessment = next((a for a in assessments if a.get("stage") == stage), None)
    if not matching_assessment and assessments:
        matching_assessment = assessments[-1]

    # Resolve source_revision
    if not source_revision:
        if matching_assessment:
            source_revision = matching_assessment.get("input", {}).get("source_revision")
        if not source_revision:
            source_revision = br_block.get("source_revision")
    require(isinstance(source_revision, str) and re.fullmatch(r"sha256:[0-9a-f]{64}", source_revision),
            f"valid sha256 source_revision required (got: {source_revision})")

    # Preserve existing assessed_at if not explicitly passed
    existing = br_block.get(stage, {})
    if assessed_at is None and existing.get("assessed_at"):
        assessed_at = existing["assessed_at"]

    # Load requirements
    if requirements_input is None:
        requirements_list = existing.get("requirements", [])
    elif isinstance(requirements_input, list):
        requirements_list = requirements_input
    elif isinstance(requirements_input, dict):
        requirements_list = requirements_input.get("requirements", [])
    elif isinstance(requirements_input, (str, Path)):
        p = Path(requirements_input)
        if p.is_file():
            content = read_json(p)
            requirements_list = content if isinstance(content, list) else content.get("requirements", [])
        else:
            parsed = json.loads(str(requirements_input))
            requirements_list = parsed if isinstance(parsed, list) else parsed.get("requirements", [])
    else:
        raise ValueError(f"unsupported requirements input type: {type(requirements_input)}")

    require(isinstance(requirements_list, list) and len(requirements_list) > 0,
            "non-empty requirements list required")

    snapshot = build_snapshot(requirements_list, ordered, source_revision, assessed_at)

    # Validate against calculation contract
    validate_snapshot(snapshot, ordered, f"business_rules.{stage}")

    if matching_assessment:
        flow_ids = [row["flow_id"] for row in matching_assessment.get("flows", [])]
        defects = verification_defects(data, stage, source_revision, flow_ids)
        validate_br_runtime(snapshot, matching_assessment, defects, f"business_rules.{stage}")

    print(f"Validated business_rules.{stage} successfully:")
    print(f"  Total: {snapshot['total']} | Met: {snapshot['met']} | Unmet: {snapshot['unmet']} | Not Evaluable: {snapshot['not_evaluable']}")

    if dry_run:
        print("[dry-run] Canonical run JSON was not modified.")
        return snapshot

    br_block[stage] = snapshot
    if br_block.get("source_revision") is None:
        br_block["source_revision"] = source_revision

    # Save canonically using Python json
    atomic_write(run_file, data)
    print(f"Successfully recorded business_rules.{stage} to {run_file.name}")
    return snapshot


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, help="Path to canonical-run-*.json")
    parser.add_argument("--stage", choices=["initial", "final"], default="initial",
                        help="Assessment stage to record (default: initial)")
    parser.add_argument("--requirements", help="Path to JSON file or JSON string with requirements array")
    parser.add_argument("--source-revision", help="Optional explicit source revision sha256")
    parser.add_argument("--assessed-at", help="Optional explicit assessed_at timestamp (ISO-8601)")
    parser.add_argument("--dry-run", action="store_true", help="Validate without writing to canonical run file")
    args = parser.parse_args()

    record_business_rules(
        run_path=args.run_json,
        stage=args.stage,
        requirements_input=args.requirements,
        source_revision=args.source_revision,
        assessed_at=args.assessed_at,
        dry_run=args.dry_run
    )


if __name__ == "__main__":
    main()
