"""Flow-only progress and append-only follow-ups; original assessments stay immutable."""

import json
import re

from metrics_contract import digest, epoch, read_json, require


def fingerprint(value):
    return digest(json.dumps(value, sort_keys=True, separators=(",", ":")).encode())


def current_assessment(run):
    block = run.get("flow_accuracy") or {}
    matches = [a for a in block.get("assessments", [])
               if a.get("assessment_id") == block.get("current_assessment_id")]
    require(len(matches) == 1, "current flow assessment must resolve exactly once")
    return matches[0]


def pending_details(flow, assessment):
    targets = [{"target_id": s["step_id"], "reason": s["rationale"]}
               for s in flow["steps"] if s["completion_critical"] and s["status"] == "not_evaluable"]
    outcome = flow["terminal_outcome"]
    if outcome["status"] == "not_evaluable":
        targets.append({"target_id": "terminal_outcome", "reason": outcome["rationale"]})
    if not targets:
        targets.append({"target_id": "completion_observation",
                        "reason": "Connected runtime completion has not been established."})
    return {"flow_id": flow["flow_id"], "missing_targets": targets,
            "limitations": assessment["input"].get("limitations", []),
            "attempts": [{k: o[k] for k in ("observation_id", "state", "end_state")}
                         for o in assessment["input"].get("observations", []) if o["flow_id"] == flow["flow_id"]],
            "resolution_options": ["researcher_result", "llm_measurement"]}


def summarize(assessment, followups):
    flows = [{"flow_id": f["flow_id"], "type": f["type"], "status": f["status"],
              "result_source": "assessment", "record_id": assessment["assessment_id"]}
             for f in assessment["flows"]]
    by_id = {f["flow_id"]: f for f in flows}
    pending_inputs = {f["flow_id"]: (f, assessment) for f in assessment["flows"]}
    applied = []
    for record in followups:
        if record["assessment_id"] != assessment["assessment_id"]:
            continue
        applied.append(record["followup_id"])
        for result in record["results"]:
            row = by_id[result["flow_id"]]
            require(row["status"] == "not_evaluable", "follow-up can only resolve pending flows")
            row.update(status=result["status"], result_source=record["mode"], record_id=record["followup_id"])
            if record["mode"] == "llm_measurement":
                measured = record["runtime_result"]
                pending_inputs[row["flow_id"]] = (next(f for f in measured["flows"]
                                                     if f["flow_id"] == row["flow_id"]), measured)
    total = len(flows)
    require(total > 0 and assessment["counts"]["total"] == total, "flow inventory/count mismatch")
    require(all(f["status"] in {"correct", "incorrect", "not_evaluable"} for f in flows), "invalid flow status")
    correct = sum(f["status"] == "correct" for f in flows)
    incorrect = sum(f["status"] == "incorrect" for f in flows)
    evaluated = correct + incorrect
    unknown = total - evaluated
    manual = sum(f["result_source"] == "researcher_result" and f["status"] != "not_evaluable" for f in flows)
    pending = [pending_details(*pending_inputs[f["flow_id"]]) for f in flows if f["status"] == "not_evaluable"]
    return {"schema_version": 1, "assessment_id": assessment["assessment_id"], "stage": assessment["stage"],
            "source_revision": assessment["input"]["source_revision"],
            "rubric_id": assessment["input"].get("rubric_id", "completion-critical-flow-v1"),
            "followup_ids": applied, "status": "partial" if unknown and evaluated else
            ("not_evaluable" if unknown else ("repair_required" if incorrect else "scored")),
            "measurement_status": "partial" if unknown and evaluated else ("not_evaluable" if unknown else "complete"),
            "has_incorrect_flows": bool(incorrect),
            "result_basis": "includes_researcher_results" if manual else "rubric_evidence",
            "researcher_result_count": manual,
            "counts": {**{k: assessment["counts"][k] for k in ("main", "alternative", "exception", "total")},
                       "correct": correct, "incorrect": incorrect, "not_evaluable": unknown, "evaluated": evaluated},
            "flow_accuracy_percent": round(100 * correct / total, 6) if not unknown else None,
            "flow_error_percent": round(100 * incorrect / total, 6) if not unknown else None,
            "evaluated_accuracy_percent": round(100 * correct / evaluated, 6) if evaluated else None,
            "evaluated_error_percent": round(100 * incorrect / evaluated, 6) if evaluated else None,
            "evaluated_coverage_percent": round(100 * evaluated / total, 6),
            "accuracy_lower_bound_percent": round(100 * correct / total, 6),
            "accuracy_upper_bound_percent": round(100 * (correct + unknown) / total, 6),
            "flows": flows, "pending_flows": pending}


def validate_followups(run, folder):
    # Lazy imports allow the original scorer to use this projection unchanged.
    from score_flow_accuracy import calculate, validate_evidence
    from runtime_contract import configured_rubric, method
    block = run["flow_accuracy"]
    history = block.get("followups", [])
    require(isinstance(history, list), "invalid flow follow-up history")
    assessments = {a["assessment_id"]: a for a in block["assessments"]}
    accepted, ids = [], set()
    for record in history:
        require(isinstance(record, dict) and record.get("schema_version") == 1, "invalid follow-up schema")
        identity = record.get("followup_id")
        require(isinstance(identity, str) and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", identity), "unsafe follow-up ID")
        require(identity not in ids, "duplicate follow-up ID")
        ids.add(identity)
        artifact = folder / "flow-accuracy/followups" / (identity + ".json")
        if artifact.exists():
            require(read_json(artifact) == record, "follow-up artifact changed")
        parent = assessments.get(record.get("assessment_id"))
        require(parent is not None and record.get("assessment_sha256") == fingerprint(parent), "follow-up parent changed")
        for key in ("uc_id", "run_id", "stage", "source_revision", "baseline"):
            require(record.get(key) == parent["input"].get(key), f"follow-up {key} mismatch")
        require(all(record[k] == run[k] for k in ("uc_id", "run_id")), "follow-up run mismatch")
        require(record.get("source_unchanged") is True, "flow follow-up cannot change source")
        require(record.get("mode") in {"researcher_result", "llm_measurement"}, "choose a follow-up mode")
        require(isinstance(record.get("request_turn_id"), str) and record["request_turn_id"].strip(), "researcher request turn required")
        recorded = epoch(record.get("recorded_at"))
        prior = [r for r in accepted if r["assessment_id"] == record["assessment_id"]]
        previous_end = max([epoch(parent["input"]["captured_at"])] + [epoch(r["recorded_at"]) for r in prior])
        require(recorded >= previous_end, "follow-up predates previous results")
        parent_index = block["assessments"].index(parent)
        if parent_index + 1 < len(block["assessments"]):
            require(recorded <= epoch(block["assessments"][parent_index + 1]["input"]["captured_at"]),
                    "follow-up cannot revise a superseded source stage")
        progress = summarize(parent, accepted)
        pending = {f["flow_id"] for f in progress["pending_flows"]}
        results = record.get("results")
        require(isinstance(results, list) and results, "nonempty per-flow results required")
        target_ids = [r.get("flow_id") for r in results]
        require(len(target_ids) == len(set(target_ids)) and set(target_ids) <= pending, "results must identify pending flows exactly once")
        require(all(r.get("status") in {"correct", "incorrect", "not_evaluable"} for r in results), "invalid flow result")
        if record["mode"] == "researcher_result":
            require(isinstance(record.get("researcher_result"), str) and record["researcher_result"].strip(), "researcher result text required")
            require("runtime_result" not in record, "researcher result must not fabricate runtime evidence")
        else:
            measured = record.get("runtime_result")
            require(isinstance(measured, dict) and isinstance(measured.get("input"), dict), "LLM assessment required")
            require(calculate(measured["input"]) == measured, "LLM result differs from evidence/scoring")
            require(method(measured["input"]) == method(parent["input"]), "follow-up rubric changed")
            require(configured_rubric(run, folder, validate_evidence, record["baseline"]) == method(measured["input"])[1], "configuration rubric mismatch")
            for key in ("uc_id", "run_id", "stage", "source_revision", "baseline"):
                require(measured["input"].get(key) == record[key], f"runtime follow-up {key} mismatch")
            require(measured["assessment_id"] == identity, "runtime assessment ID must equal follow-up ID")
            require(identity not in assessments, "follow-up needs a distinct assessment ID")
            require(previous_end <= epoch(measured["input"]["captured_at"]) <= recorded, "runtime capture outside follow-up interval")
            prior_inputs = [a["input"] for a in block["assessments"]] + [r["runtime_result"]["input"] for r in accepted if r["mode"] == "llm_measurement"]
            old_ids = {o["observation_id"] for data in prior_inputs for o in data.get("observations", [])}
            for observation in measured["input"].get("observations", []):
                require(observation["observation_id"] not in old_ids and epoch(observation["started_at"]) > previous_end,
                        "follow-up requires fresh runtime observations")
            scored = {f["flow_id"]: f["status"] for f in measured["flows"]}
            require(all(scored[r["flow_id"]] == r["status"] for r in results), "follow-up verdict mismatch")
        accepted.append(record)
    return summarize(current_assessment(run), accepted)


def refresh_summary(run, folder):
    summary = validate_followups(run, folder)
    run["flow_accuracy"]["current_summary"] = summary
    for key in ("flow_accuracy_percent", "flow_error_percent"):
        run[key] = summary[key]
    run["flow_accuracy_status"] = summary["status"]
    return summary


def markdown(summary):
    def shown(key):
        value = summary[key]
        return "N/A" if value is None else str(value)
    lines = ["# Flow measurement progress", "", f"Assessment: {summary['assessment_id']} ({summary['stage']})",
             f"Source revision: {summary['source_revision']}", f"Status: {summary['status']}",
             f"Result basis: {summary['result_basis']}", f"Known incorrect flows: {summary['counts']['incorrect']}",
             f"Whole-baseline accuracy (%): {shown('flow_accuracy_percent')}",
             f"Evaluated-only accuracy (%): {shown('evaluated_accuracy_percent')}",
             f"Evaluated-only error (%): {shown('evaluated_error_percent')}",
             f"Evaluated coverage (%): {shown('evaluated_coverage_percent')}",
             f"Accuracy bounds (%): {summary['accuracy_lower_bound_percent']}–{summary['accuracy_upper_bound_percent']}",
             "", "| Flow | Result | Source | Record |", "|---|---|---|---|"]
    for flow in summary["flows"]:
        lines.append(f"| {flow['flow_id']} | {flow['status']} | {flow['result_source']} | {flow['record_id']} |")
    for pending in summary["pending_flows"]:
        lines += ["", f"Pending: {pending['flow_id']}"]
        lines += [f"- {t['target_id']}: {t['reason']}" for t in pending["missing_targets"]]
        lines += ["Limitations: " + json.dumps(pending["limitations"], ensure_ascii=False)]
        lines += ["Attempts: " + json.dumps(pending["attempts"], ensure_ascii=False)]
    if summary["pending_flows"]:
        lines += ["", "Researcher chooses the next action:",
                  "1. Researcher supplies per-flow results; the LLM records them and recalculates JSON.",
                  "2. LLM continues bounded measurement and automatically persists validated results.",
                  "Neither choice permits application source changes, fixes, mocks or audit-only endpoints."]
    return "\n".join(lines) + "\n"
