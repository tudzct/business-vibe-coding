#!/usr/bin/env python3
"""Validate and calculate deterministic Business Rule generation metrics."""

import json
import re
import sys
from pathlib import Path

STATUSES = {"met", "unmet", "not_evaluable"}


def validate_tokens(tokens):
    if not isinstance(tokens, dict):
        raise ValueError("tokens must be an object")
    new_fields = {
        "prompt_generation_total",
        "code_generation_total",
        "implementation_total",
        "overall_total",
    }
    if not any(field in tokens for field in new_fields):
        # Completed historical runs retain the former initial/repair schema.
        return
    prompt = tokens.get("prompt_generation_total")
    code = tokens.get("code_generation_total")
    repairs = tokens.get("repair_total")
    implementation = tokens.get("implementation_total")
    overall = tokens.get("overall_total")
    for field, value in {
        "prompt_generation_total": prompt,
        "code_generation_total": code,
        "repair_total": repairs,
        "implementation_total": implementation,
        "overall_total": overall,
    }.items():
        if value is not None and (not isinstance(value, int) or isinstance(value, bool) or value < 0):
            raise ValueError(f"tokens.{field} must be a non-negative integer or null")
    if tokens.get("initial_total") != code:
        raise ValueError("tokens.initial_total must mirror code_generation_total")
    if code is not None and repairs is not None and implementation != code + repairs:
        raise ValueError("tokens.implementation_total must equal code_generation_total + repair_total")
    if tokens.get("total") != implementation:
        raise ValueError("tokens.total must mirror implementation_total")
    if prompt is not None and implementation is not None and overall != prompt + implementation:
        raise ValueError("tokens.overall_total must equal prompt_generation_total + implementation_total")
    if (prompt is None or implementation is None) and overall is not None:
        raise ValueError("tokens.overall_total must be null when a required stage is unavailable")


def validate_snapshot(snapshot, ordered, field):
    if not isinstance(snapshot, dict):
        raise ValueError(f"{field} must be an object")
    rows = snapshot.get("requirements")
    if not isinstance(rows, list):
        raise ValueError(f"{field}.requirements must be an array")
    ids = []
    counts = {status: 0 for status in STATUSES}
    for index, row in enumerate(rows):
        if not isinstance(row, dict) or not isinstance(row.get("br_id"), str):
            raise ValueError(f"{field}.requirements[{index}] has no BR ID")
        if row.get("status") not in STATUSES:
            raise ValueError(f"{field}.requirements[{index}] has invalid status")
        evidence = row.get("evidence")
        if not isinstance(evidence, list) or not evidence or any(not isinstance(v, str) or not v.strip() for v in evidence):
            raise ValueError(f"{field}.requirements[{index}] needs inspectable evidence")
        if not isinstance(row.get("rationale"), str) or not row["rationale"].strip():
            raise ValueError(f"{field}.requirements[{index}] needs rationale")
        ids.append(row["br_id"])
        counts[row["status"]] += 1
    if ids != ordered:
        raise ValueError(f"{field} BR IDs must exactly match baseline order")
    snapshot["total"] = len(rows)
    for status, count in counts.items():
        snapshot[status] = count
    snapshot["acceptance_percent"] = None if not rows else round(counts["met"] / len(rows) * 100, 2)


def main(path_string):
    path = Path(path_string)
    data = json.loads(path.read_text(encoding="utf-8"))
    business = data.get("business_rules")
    if not isinstance(business, dict):
        raise ValueError("business_rules must be an object")
    ordered = business.get("ordered_br_ids")
    if not isinstance(ordered, list) or not ordered or len(ordered) != len(set(ordered)):
        raise ValueError("ordered_br_ids must be a non-empty unique array")
    validate_snapshot(business.get("initial"), ordered, "business_rules.initial")
    validate_snapshot(business.get("final"), ordered, "business_rules.final")
    revision = business.get("source_revision")
    if data.get("run_status") == "complete" and (not isinstance(revision, str) or re.fullmatch(r"sha256:[0-9a-f]{64}", revision.lower()) is None):
        raise ValueError("complete runs need a full final-source SHA-256")
    repairs = data.get("repairs", [])
    if not isinstance(repairs, list):
        raise ValueError("repairs must be an array")
    for index, repair in enumerate(repairs):
        ids = repair.get("affected_br_ids", []) if isinstance(repair, dict) else None
        if not isinstance(ids, list) or any(value not in ordered for value in ids):
            raise ValueError(f"repairs[{index}].affected_br_ids is invalid")
    data["all_sub_prompt_count"] = len(repairs)
    validate_tokens(data.get("tokens"))
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"run_id": data.get("run_id"), "business_rules": business["final"], "repairs": len(repairs)}, indent=2))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: calculate_metrics.py <run.json>")
    try:
        main(sys.argv[1])
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise SystemExit(f"metrics error: {exc}")
