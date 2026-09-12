#!/usr/bin/env python3
"""Validate and calculate deterministic Business Rule generation metrics."""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens" / "scripts"))
from metrics_contract import atomic_write, validate_metrics, context, run_lock
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "audit-flow-accuracy" / "scripts"))
from score_flow_accuracy import calculate as calculate_flow, validate_run_result, validate_evidence
from runtime_contract import method, configured_rubric

STATUSES = {"met", "unmet", "not_evaluable"}
FLOW_STATUSES = {"scored", "repair_required", "not_evaluable"}


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


def validate_flow(data, folder):
    block = data.get("flow_accuracy")
    if not isinstance(block, dict):
        raise ValueError("Audit requires a persisted flow assessment")
    version, rubric = method(block)
    if configured_rubric(data, folder, validate_evidence) != rubric:
        raise ValueError("flow rubric differs from frozen configuration")
    assessments = block.get("assessments")
    current_id = block.get("current_assessment_id")
    if not isinstance(assessments, list) or not assessments or not isinstance(current_id, str):
        raise ValueError("flow_accuracy current assessment is missing")
    matches = [item for item in assessments if isinstance(item, dict) and item.get("assessment_id") == current_id]
    if len(matches) != 1:
        raise ValueError("flow_accuracy current assessment must resolve exactly once")
    current = matches[0]
    if version == 2 and current_id != assessments[-1].get("assessment_id"):
        raise ValueError("current flow assessment must be the latest immutable entry")
    ids = [item.get("assessment_id") for item in assessments]
    if len(ids) != len(set(ids)) or assessments[0].get("stage") != "initial":
        raise ValueError("invalid immutable flow history")
    for index, assessment in enumerate(assessments):
        if method(assessment.get("input", {})) != (version, rubric):
            raise ValueError("mixed flow rubrics in one run")
        if version == 2:
            recalculated = calculate_flow(assessment["input"])
            if recalculated != assessment:
                raise ValueError("persisted flow assessment differs from validated evidence/scoring")
            prior_run = {**data, "flow_accuracy": {**block, "assessments": assessments[:index]}}
            validate_run_result(prior_run, folder, recalculated)
    if version == 2 and data.get("run_status") == "complete" and current.get("stage") != "final":
        raise ValueError("complete runtime-v2 run requires a fresh final flow audit")
    if version == 2 and current.get("stage") == "final" and current["input"]["source_revision"] != data.get("business_rules", {}).get("source_revision"):
        raise ValueError("final BR/flow source revision mismatch")
    status = current.get("status")
    if status not in FLOW_STATUSES or data.get("flow_accuracy_status") != status:
        raise ValueError("flow_accuracy status mismatch")
    counts = current.get("counts")
    if not isinstance(counts, dict) or counts.get("total") != counts.get("correct", 0) + counts.get("incorrect", 0) + counts.get("not_evaluable", 0):
        raise ValueError("flow_accuracy counts do not reconcile")
    if data.get("flow_accuracy_percent") != current.get("flow_accuracy_percent") or data.get("flow_error_percent") != current.get("flow_error_percent"):
        raise ValueError("flow percentage mismatch")
    return {"schema_version": version, "rubric_id": rubric, **{key: current.get(key) for key in ("assessment_id", "status", "counts", "flow_accuracy_percent", "flow_error_percent", "evaluated_coverage_percent", "accuracy_lower_bound_percent", "accuracy_upper_bound_percent")}}


def calculate(path_string):
    path = Path(path_string)
    data = json.loads(path.read_text(encoding="utf-8"))
    # Audit validates telemetry committed by a confirmed gate, without overwriting it.
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
    _, _, folder = context(path)
    flow_summary = validate_flow(data, folder)
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
                      "flow_accuracy": flow_summary, "repairs": len(repairs)}, ensure_ascii=False, indent=2))


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
