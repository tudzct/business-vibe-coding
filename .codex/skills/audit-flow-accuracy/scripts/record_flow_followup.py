#!/usr/bin/env python3
"""Persist flow progress or researcher/LLM results without altering source or telemetry."""

import argparse
import copy
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens/scripts"))
from metrics_contract import ROOT, atomic_write, context, read_json, require, run_lock
from flow_summary import current_assessment, fingerprint, markdown, refresh_summary


def prepare(run, folder, payload=None):
    # Full audit validation is read-only here, including the prior immutable assessments.
    sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "audit-generation-metrics/scripts"))
    from calculate_metrics import validate_flow
    from score_flow_accuracy import calculate
    validate_flow(run, folder)
    updated = copy.deepcopy(run)
    if payload is not None:
        record = copy.deepcopy(payload)
        if record.get("mode") == "llm_measurement":
            record["runtime_result"] = calculate(record.pop("runtime_assessment"))
        parent = current_assessment(updated)
        recorded_source = (run.get("business_rules") or {}).get("source_revision")
        require(recorded_source is None or recorded_source == parent["input"]["source_revision"],
                "current source record differs from the flow assessment; do not mix revisions")
        require(record.get("assessment_id") == parent["assessment_id"] and
                record.get("assessment_sha256") == fingerprint(parent), "follow-up must target current immutable assessment")
        history = updated["flow_accuracy"].setdefault("followups", [])
        previous = next((r for r in history if r.get("followup_id") == record.get("followup_id")), None)
        require(previous is None or previous == record, "follow-up ID is immutable")
        if previous is None:
            history.append(record)
    summary = refresh_summary(updated, folder)
    validate_flow(updated, folder)
    return updated, summary


def persist(path, run, folder, summary):
    # Preserve append-only records first; mirrors are recoverable from canonical JSON.
    for record in run["flow_accuracy"].get("followups", []):
        target = folder / "flow-accuracy/followups" / (record["followup_id"] + ".json")
        require(not target.exists() or read_json(target) == record, "follow-up artifact is immutable")
    for record in run["flow_accuracy"].get("followups", []):
        target = folder / "flow-accuracy/followups" / (record["followup_id"] + ".json")
        if not target.exists():
            atomic_write(target, record)
    atomic_write(path, run)
    atomic_write(folder / "flow-accuracy/current.json", summary)
    atomic_write(folder / "flow-accuracy/current.md", markdown(summary), raw=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, type=Path)
    parser.add_argument("--input", type=Path, help="LLM-prepared follow-up JSON; omit to save current partial progress")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    path, run, folder = context(args.run_json)
    require(path.is_relative_to(ROOT / "docs/05-experiments") or path.is_relative_to(folder),
            "flow follow-up writes only canonical experiment/run JSON")
    reserved = (folder / "flow-accuracy").resolve()
    require(not path.is_relative_to(reserved), "canonical JSON cannot be a flow evidence artifact")
    payload = read_json(args.input) if args.input else None
    if args.dry_run:
        _, summary = prepare(run, folder, payload)
    else:
        with run_lock(folder):
            updated, summary = prepare(read_json(path), folder, payload)
            persist(path, updated, folder, summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, TypeError, KeyError) as exc:
        raise SystemExit(f"flow follow-up error: {exc}")
