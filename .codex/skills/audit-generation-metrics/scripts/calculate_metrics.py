#!/usr/bin/env python3
"""Validate and calculate deterministic Business Rule generation metrics."""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow" / "scripts"))
from metrics_contract import atomic_write, validate_metrics, context, run_lock, epoch, digest
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "audit-flow-accuracy" / "scripts"))
from score_flow_accuracy import calculate as calculate_flow, validate_run_result, validate_evidence
from runtime_contract import method, configured_rubric
from flow_summary import validate_followups

STATUSES = {"met", "unmet", "not_evaluable"}
FLOW_STATUSES = {"scored", "repair_required", "not_evaluable", "partial"}
BR_RESULT_POLICY = "accepted-br-audit-results-v1"


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


def br_fingerprint(value):
    return digest(json.dumps(value, sort_keys=True, separators=(",", ":")).encode())


def initial_br_parent(data):
    assessments = (data.get("flow_accuracy") or {}).get("assessments", [])
    matches = [row for row in assessments if row.get("stage") == "initial"]
    if len(matches) != 1:
        raise ValueError("BR follow-up requires exactly one initial flow assessment")
    source = (matches[0].get("input") or {}).get("source_revision")
    if not isinstance(source, str) or re.fullmatch(r"sha256:[0-9a-f]{64}", source) is None:
        raise ValueError("BR follow-up source revision is invalid")
    return matches[0]


def accepted_br_summary(data):
    """Project immutable first-pass BR evidence plus append-only audit follow-ups."""
    business = data.get("business_rules") or {}
    ordered = business.get("ordered_br_ids")
    if not isinstance(ordered, list) or not ordered or len(ordered) != len(set(ordered)):
        raise ValueError("ordered_br_ids must be a non-empty unique array")
    initial = business.get("initial")
    validated = json.loads(json.dumps(initial)) if initial is not None else None
    validate_snapshot(validated, ordered, "business_rules.initial")
    if validated != initial:
        raise ValueError("persist validated business_rules.initial counts before follow-up")
    parent = initial_br_parent(data)
    source_revision = parent["input"]["source_revision"]
    selected = {
        row["br_id"]: {
            "br_id": row["br_id"], "status": row["status"],
            "result_source": "assessment", "record_id": "business_rules.initial",
            "evidence": list(row["evidence"]), "rationale": row["rationale"],
        }
        for row in initial["requirements"]
    }
    history = business.get("followups", [])
    if not isinstance(history, list):
        raise ValueError("business_rules.followups must be an array")
    if history and business.get("source_revision") != source_revision:
        raise ValueError("BR and Flow follow-ups must identify the same source revision")
    seen, last_time, applied = set(), epoch(parent["input"].get("captured_at")), []
    for record in history:
        if not isinstance(record, dict) or record.get("schema_version") != 1:
            raise ValueError("invalid BR follow-up schema")
        identity = record.get("followup_id")
        if not isinstance(identity, str) or re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", identity) is None:
            raise ValueError("unsafe BR follow-up ID")
        if identity in seen:
            raise ValueError("duplicate BR follow-up ID")
        seen.add(identity)
        if record.get("parent_stage") != "initial" or record.get("snapshot_sha256") != br_fingerprint(initial):
            raise ValueError("BR follow-up parent snapshot mismatch")
        if record.get("uc_id") != data.get("uc_id") or record.get("run_id") != data.get("run_id"):
            raise ValueError("BR follow-up run mismatch")
        if record.get("source_revision") != source_revision or record.get("source_unchanged") is not True:
            raise ValueError("BR follow-up source revision mismatch")
        recorded_at = epoch(record.get("recorded_at"))
        if recorded_at < last_time:
            raise ValueError("BR follow-ups are out of order")
        last_time = recorded_at
        if not isinstance(record.get("request_turn_id"), str) or not record["request_turn_id"].strip():
            raise ValueError("BR follow-up researcher request turn required")
        mode = record.get("mode")
        if mode not in {"researcher_result", "llm_reaudit"}:
            raise ValueError("invalid BR follow-up mode")
        results = record.get("results")
        if not isinstance(results, list) or not results:
            raise ValueError("BR follow-up results are required")
        ids = [row.get("br_id") for row in results]
        if len(ids) != len(set(ids)) or not set(ids) <= set(ordered):
            raise ValueError("BR follow-up IDs must identify frozen rules exactly once")
        if any(row.get("status") not in STATUSES for row in results):
            raise ValueError("invalid BR follow-up status")
        if mode == "researcher_result":
            text = record.get("researcher_result")
            if not isinstance(text, str) or not text.strip():
                raise ValueError("researcher BR verdict text required")
            if any(set(row) != {"br_id", "status"} for row in results):
                raise ValueError("researcher BR verdict must not fabricate evidence")
        else:
            if "researcher_result" in record:
                raise ValueError("LLM BR re-audit cannot be researcher-attributed")
            for row in results:
                evidence = row.get("evidence")
                if (not isinstance(evidence, list) or not evidence
                        or any(not isinstance(value, str) or not value.strip() for value in evidence)
                        or not isinstance(row.get("rationale"), str) or not row["rationale"].strip()):
                    raise ValueError("LLM BR re-audit requires evidence and rationale")
        applied.append(identity)
        for result in results:
            prior = selected[result["br_id"]]
            if result["status"] == "not_evaluable" and prior["status"] != "not_evaluable":
                continue
            if mode == "researcher_result":
                evidence = [f"Researcher verdict {identity}: {record['researcher_result']}"]
                rationale = record["researcher_result"]
            else:
                evidence = list(result["evidence"])
                rationale = result["rationale"]
            selected[result["br_id"]] = {
                "br_id": result["br_id"], "status": result["status"],
                "result_source": mode, "record_id": identity,
                "evidence": evidence, "rationale": rationale,
            }
    rows = [selected[br_id] for br_id in ordered]
    counts = {status: sum(row["status"] == status for row in rows) for status in STATUSES}
    return {
        "selection_policy": BR_RESULT_POLICY,
        "source_revision": source_revision,
        "followup_ids": applied,
        "counts": {"total": len(rows), **counts},
        "requirements": rows,
        "pending_br_ids": [row["br_id"] for row in rows if row["status"] == "not_evaluable"],
    }


def apply_br_followup(data, record):
    """Append one validated BR part of the existing combined audit follow-up."""
    updated_record = json.loads(json.dumps(record))
    business = data.get("business_rules")
    if not isinstance(business, dict):
        raise ValueError("business_rules is required for a BR follow-up")
    history = business.setdefault("followups", [])
    previous = next((row for row in history
                     if row.get("followup_id") == updated_record.get("followup_id")), None)
    if previous is not None and previous != updated_record:
        raise ValueError("BR follow-up ID is immutable")
    if previous is None:
        history.append(updated_record)
    return accepted_br_summary(data)


def br_summary_snapshot(summary):
    rows = [{"br_id": row["br_id"], "status": row["status"],
             "evidence": list(row["evidence"]), "rationale": row["rationale"]}
            for row in summary["requirements"]]
    counts = summary["counts"]
    return {"requirements": rows, "total": counts["total"], "met": counts["met"],
            "unmet": counts["unmet"], "not_evaluable": counts["not_evaluable"]}


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
    if current_id != assessments[-1].get("assessment_id"):
        raise ValueError("current flow assessment must be the latest immutable entry")
    ids = [item.get("assessment_id") for item in assessments]
    if len(ids) != len(set(ids)) or assessments[0].get("stage") != "initial":
        raise ValueError("invalid immutable flow history")
    for index, assessment in enumerate(assessments):
        if method(assessment.get("input", {})) != (version, rubric):
            raise ValueError("mixed flow rubrics in one run")
        recalculated = calculate_flow(assessment["input"])
        if recalculated != assessment:
            raise ValueError("persisted flow assessment differs from validated evidence/scoring")
        # Researcher replies recorded after this capture do not alter its chronology.
        prior_followups = [r for r in block.get("followups", []) if not (
            r.get("mode") == "researcher_result"
            and epoch(r["recorded_at"]) > epoch(assessment["input"]["captured_at"]))]
        prior_run = {**data, "flow_accuracy": {**block, "assessments": assessments[:index],
                                               "followups": prior_followups}}
        validate_run_result(prior_run, folder, recalculated)
    if data.get("run_status") == "complete" and current.get("stage") != "final":
        validate_unchanged_initial(data, current)
    if (current.get("stage") == "final" or data.get("run_status") == "complete") and current["input"]["source_revision"] != data.get("business_rules", {}).get("source_revision"):
        raise ValueError("final BR/flow source revision mismatch")
    summary = validate_followups(data, folder)
    stored_summary = block.get("current_summary")
    if stored_summary != summary:
        raise ValueError("flow progress differs from immutable assessments/follow-ups")
    effective = summary
    status = effective.get("status")
    if status not in FLOW_STATUSES or data.get("flow_accuracy_status") != status:
        raise ValueError("flow_accuracy status mismatch")
    counts = effective.get("counts")
    if not isinstance(counts, dict) or counts.get("total") != counts.get("correct", 0) + counts.get("incorrect", 0) + counts.get("not_evaluable", 0):
        raise ValueError("flow_accuracy counts do not reconcile")
    if data.get("flow_accuracy_percent") != effective.get("flow_accuracy_percent") or data.get("flow_error_percent") != effective.get("flow_error_percent"):
        raise ValueError("flow percentage mismatch")
    return {**summary, "schema_version": version, "rubric_id": rubric}


def validate_unchanged_initial(data, current):
    """Reuse first-pass evidence only when no correction changed the audited source."""
    business = data.get("business_rules") or {}
    if current.get("stage") != "initial" or data.get("repairs"):
        raise ValueError("repaired source requires its integrated final assessment")
    if not isinstance(data.get("repair_skip_reason"), str) or not data["repair_skip_reason"].strip():
        raise ValueError("unchanged-source completion needs a recorded no-repair decision")
    revision = current.get("input", {}).get("source_revision")
    if not isinstance(revision, str) or not re.fullmatch(r"sha256:[0-9a-f]{64}", revision):
        raise ValueError("initial audited source hash required")
    accepted = accepted_br_summary(data)
    if revision != business.get("source_revision") or business.get("final") != br_summary_snapshot(accepted):
        raise ValueError("unchanged-source completion must preserve the accepted initial BR results and source hash")


def terminal_assessment_stage(data):
    """Choose existing terminal evidence, never demand a separate audit turn."""
    block = data.get("flow_accuracy") or {}
    matches = [a for a in block.get("assessments", [])
               if a.get("assessment_id") == block.get("current_assessment_id")]
    if len(matches) != 1:
        raise ValueError("terminal flow assessment must resolve exactly once")
    current = matches[0]
    if current.get("stage") != "final":
        validate_unchanged_initial(data, current)
    return current["stage"]


def calculate(path_string):
    path = Path(path_string)
    data = json.loads(path.read_text(encoding="utf-8"))
    # Audit validates telemetry committed by a telemetry-close command, without overwriting it.
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
