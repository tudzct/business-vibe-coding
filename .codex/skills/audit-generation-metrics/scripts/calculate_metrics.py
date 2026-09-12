#!/usr/bin/env python3
"""Validate and calculate deterministic Business Rule generation metrics."""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens" / "scripts"))
from metrics_contract import atomic_write, validate_metrics, context, run_lock

STATUSES = {"met", "unmet", "not_evaluable"}
UI_STATUSES = {"scored", "repair_required", "similarity_pending", "not_evaluable", "not_applicable"}


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
    snapshot.pop("acceptance_percent", None)


def validate_ui(data):
    block = data.get("ui_accuracy")
    if not isinstance(block, dict) or block.get("schema_version") != 1 or block.get("rubric_id") != "business-ui-weighted-v1":
        raise ValueError("schema-v1 Audit requires a persisted Figma UI assessment, including N/A status")
    assessments = block.get("assessments")
    current_id = block.get("current_assessment_id")
    if not isinstance(assessments, list) or not assessments or not isinstance(current_id, str):
        raise ValueError("ui_accuracy current assessment is missing")
    matches = [item for item in assessments if isinstance(item, dict) and item.get("assessment_id") == current_id]
    if len(matches) != 1:
        raise ValueError("ui_accuracy current assessment must resolve exactly once")
    current = matches[0]
    status = current.get("status")
    if status not in UI_STATUSES or data.get("ui_accuracy_status") != status:
        raise ValueError("ui_accuracy status mismatch")
    weighted = current.get("weighted_percent")
    if weighted is not None and (not isinstance(weighted, (int, float)) or not 0 <= weighted <= 100):
        raise ValueError("ui_accuracy weighted percentage is invalid")
    if data.get("ui_accuracy_percent") != weighted:
        raise ValueError("ui_accuracy percentage mismatch")
    totals = current.get("checkpoint_totals")
    if current.get("input", {}).get("design_status") == "complete":
        if not isinstance(totals, dict) or any(type(totals.get(k)) is not int or totals[k] < 0
                                               for k in ("total", "met", "unmet", "not_evaluable")):
            raise ValueError("ui_accuracy checkpoint totals are missing or invalid")
        if totals["total"] != totals["met"] + totals["unmet"] + totals["not_evaluable"]:
            raise ValueError("ui_accuracy checkpoint totals do not reconcile")
    elif totals is not None:
        raise ValueError("unavailable/no-design UI assessment must not fabricate checkpoint totals")
    structure = current.get("structure")
    similarity = current.get("input", {}).get("perceptual_similarity")
    return {
        "assessment_id": current_id,
        "status": status,
        "checkpoint_totals": totals,
        "weighted_percent": weighted,
        "structural_coverage_percent": current.get("structural_coverage_percent"),
        "structural_counts": structure,
        "perceptual_similarity": similarity,
        "reason": current.get("reason"),
    }


def calculate(path_string):
    path = Path(path_string)
    data = json.loads(path.read_text(encoding="utf-8"))
    # Audit validates Measure's committed values, but never recalculates or overwrites them.
    if data.get("metrics") is not None:
        validate_metrics(data["metrics"])
        if any(data["metrics"].get(k) != data.get(k) for k in ("uc_id", "run_id")):
            raise ValueError("metrics UC/run identity mismatch")
    business = data.get("business_rules")
    if not isinstance(business, dict):
        raise ValueError("business_rules must be an object")
    ordered = business.get("ordered_br_ids")
    if not isinstance(ordered, list) or not ordered or len(ordered) != len(set(ordered)):
        raise ValueError("ordered_br_ids must be a non-empty unique array")
    validate_snapshot(business.get("initial"), ordered, "business_rules.initial")
    validate_snapshot(business.get("final"), ordered, "business_rules.final")
    ui_summary = validate_ui(data) if data.get("metrics_schema_version") in (1, 2, 3) else None
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
    atomic_write(path, data)
    print(json.dumps({"run_id": data.get("run_id"), "business_rules": business["final"],
                      "ui_accuracy": ui_summary, "repairs": len(repairs)}, ensure_ascii=False, indent=2))


def main(path_string):
    _, _, folder = context(path_string)
    with run_lock(folder):
        calculate(path_string)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: calculate_metrics.py <run.json>")
    try:
        main(sys.argv[1])
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise SystemExit(f"metrics error: {exc}")
