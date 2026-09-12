#!/usr/bin/env python3
"""Validate flow observations, calculate completion accuracy, and persist evidence."""

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens/scripts"))
from metrics_contract import ROOT, atomic_write, context, digest, epoch, read_json, require, run_lock, writable

OBSERVATION_STATUSES = {"met", "unmet", "not_evaluable"}
FLOW_TYPES = ("main", "alternative", "exception")


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def validate_evidence(item):
    require(isinstance(item, dict) and nonempty(item.get("path")), "evidence path required")
    path = writable(ROOT / item["path"])
    require(path.is_file(), f"missing evidence: {item['path']}")
    require(item.get("sha256") == digest(path.read_bytes()), f"changed evidence: {item['path']}")
    return path


def validate_observation(item, label):
    require(isinstance(item, dict) and item.get("status") in OBSERVATION_STATUSES, f"invalid {label} status")
    require(nonempty(item.get("rationale")), f"{label} rationale required")
    refs = item.get("evidence")
    require(isinstance(refs, list) and refs, f"{label} evidence required")
    for ref in refs:
        validate_evidence(ref)


def validate_baseline(data):
    require(data.get("schema_version") == 1 and data.get("artifact_type") == "flow-baseline", "invalid baseline schema")
    require(data.get("status") == "Frozen" and nonempty(data.get("uc_id")), "baseline must be Frozen")
    uc_path = writable(ROOT / data.get("use_case_path", ""))
    require(uc_path.is_file(), "baseline UC path missing")
    require(data.get("use_case_sha256") == digest(uc_path.read_bytes()), "frozen UC changed")
    epoch(data.get("frozen_at"))
    flows = data.get("flows")
    require(isinstance(flows, list) and flows, "nonempty flow baseline required")
    ids = [row.get("flow_id") for row in flows]
    require(ids == data.get("ordered_flow_ids") and len(ids) == len(set(ids)), "flow order/identity mismatch")
    counts = {kind: sum(row.get("type") == kind for row in flows) for kind in FLOW_TYPES}
    counts["total"] = len(flows)
    require(counts["main"] > 0 and data.get("counts") == counts, "baseline counts mismatch")
    for flow in flows:
        require(flow.get("type") in FLOW_TYPES and nonempty(flow.get("title")), "invalid flow definition")
        require(nonempty(flow.get("source_anchor")) and nonempty(flow.get("terminal_outcome")), "flow provenance/outcome required")
        steps = flow.get("steps")
        require(isinstance(steps, list) and steps, f"{flow.get('flow_id')} needs steps")
        step_ids = [step.get("step_id") for step in steps]
        require(all(nonempty(value) for value in step_ids) and len(step_ids) == len(set(step_ids)), "invalid step IDs")
        for step in steps:
            require(nonempty(step.get("text")) and type(step.get("completion_critical")) is bool, "invalid baseline step")
            require(nonempty(step.get("criticality_reason")), "criticality reason required")
    return flows, counts


def calculate(data):
    for key in ("uc_id", "run_id", "assessment_id", "source_revision"):
        require(nonempty(data.get(key)), f"missing {key}")
    require(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", data["assessment_id"]), "unsafe assessment ID")
    require(data.get("stage") in ("initial", "final"), "invalid stage")
    require(re.fullmatch(r"sha256:[0-9a-f]{64}", data["source_revision"].lower()), "invalid source revision")
    require(isinstance(data.get("limitations"), list), "limitations list required")
    epoch(data.get("captured_at"))
    baseline_path = validate_evidence(data.get("baseline"))
    baseline = read_json(baseline_path)
    definitions, type_counts = validate_baseline(baseline)
    require(baseline.get("uc_id") == data.get("uc_id"), "baseline UC mismatch")
    supplied = data.get("flows")
    require(isinstance(supplied, list), "flow observations required")
    require([row.get("flow_id") for row in supplied] == baseline["ordered_flow_ids"], "assessment flow inventory mismatch")

    results = []
    for definition, assessed in zip(definitions, supplied):
        outcome = assessed.get("terminal_outcome")
        validate_observation(outcome, f"{definition['flow_id']} outcome")
        steps = assessed.get("steps")
        require(isinstance(steps, list), "step observations required")
        require([row.get("step_id") for row in steps] == [row["step_id"] for row in definition["steps"]],
                f"step inventory mismatch: {definition['flow_id']}")
        blocking_failure = False
        critical_unknown = False
        deviations = 0
        computed_steps = []
        for step_definition, step in zip(definition["steps"], steps):
            validate_observation(step, step_definition["step_id"])
            critical = step_definition["completion_critical"]
            blocking_failure = blocking_failure or (critical and step["status"] == "unmet")
            critical_unknown = critical_unknown or (critical and step["status"] == "not_evaluable")
            deviations += int(not critical and step["status"] == "unmet")
            computed_steps.append({**step, "completion_critical": critical})
        if blocking_failure or outcome["status"] == "unmet":
            status = "incorrect"
        elif critical_unknown or outcome["status"] == "not_evaluable":
            status = "not_evaluable"
        else:
            status = "correct"
        results.append({"flow_id": definition["flow_id"], "type": definition["type"], "status": status,
                        "noncritical_deviations": deviations, "terminal_outcome": outcome, "steps": computed_steps})

    total = len(results)
    correct = sum(row["status"] == "correct" for row in results)
    incorrect = sum(row["status"] == "incorrect" for row in results)
    unknown = total - correct - incorrect
    exact = unknown == 0
    return {
        "assessment_id": data["assessment_id"],
        "stage": data["stage"],
        "input_sha256": digest(json.dumps(data, sort_keys=True, separators=(",", ":")).encode()),
        "status": "not_evaluable" if unknown else ("repair_required" if incorrect else "scored"),
        "counts": {**type_counts, "correct": correct, "incorrect": incorrect, "not_evaluable": unknown},
        "flow_error_percent": round(100 * incorrect / total, 6) if exact else None,
        "flow_accuracy_percent": round(100 * (total - incorrect) / total, 6) if exact else None,
        "evaluated_coverage_percent": round(100 * (total - unknown) / total, 6),
        "accuracy_lower_bound_percent": round(100 * correct / total, 6),
        "accuracy_upper_bound_percent": round(100 * (correct + unknown) / total, 6),
        "flows": results,
        "input": data,
    }


def markdown(result):
    counts = result["counts"]
    accuracy = result["flow_accuracy_percent"]
    error = result["flow_error_percent"]
    lines = [f"# Flow accuracy: {result['assessment_id']}", "", f"Status: {result['status']}",
             f"Flow accuracy: {str(accuracy) + '%' if accuracy is not None else 'N/A'}",
             f"Flow error: {str(error) + '%' if error is not None else 'N/A'}",
             f"Evaluated coverage: {result['evaluated_coverage_percent']}%",
             f"Accuracy bounds: {result['accuracy_lower_bound_percent']}%–{result['accuracy_upper_bound_percent']}%", "",
             f"Flows: {counts['correct']} correct, {counts['incorrect']} incorrect, "
             f"{counts['not_evaluable']} not evaluable, {counts['total']} total", "",
             "| Flow | Type | Status | Noncritical deviations |", "|---|---|---|---:|"]
    for flow in result["flows"]:
        lines.append(f"| {flow['flow_id']} | {flow['type']} | {flow['status']} | {flow['noncritical_deviations']} |")
    lines.extend(["", *result["input"]["limitations"], ""])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, type=Path)
    parser.add_argument("--assessment", required=True, type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    path, run, folder = context(args.run_json)
    result = calculate(read_json(args.assessment))
    require(all(run.get(key) == result["input"].get(key) for key in ("uc_id", "run_id")), "run identity mismatch")
    if not args.dry_run:
        with run_lock(folder):
            run = read_json(path)
            require(all(run.get(key) == result["input"].get(key) for key in ("uc_id", "run_id")), "run identity changed")
            if run.get("flow_accuracy") is None:
                run["flow_accuracy"] = {"schema_version": 1, "rubric_id": "completion-critical-flow-v1", "assessments": []}
            block = run["flow_accuracy"]
            require(block.get("schema_version") == 1 and block.get("rubric_id") == "completion-critical-flow-v1", "unknown flow schema")
            history = block.get("assessments")
            require(isinstance(history, list), "invalid flow history")
            previous = next((row for row in history if row.get("assessment_id") == result["assessment_id"]), None)
            if previous:
                require(previous == result, "assessment ID is immutable")
            else:
                require(result["stage"] != "initial" or not history, "initial assessment must be first")
                require(result["stage"] != "final" or (history and history[0].get("stage") == "initial"),
                        "final assessment requires an immutable initial assessment")
                if history:
                    require(history[0]["input"]["baseline"] == result["input"]["baseline"], "flow baseline changed")
                history.append(result)
                block["current_assessment_id"] = result["assessment_id"]
                run["flow_accuracy_percent"] = result["flow_accuracy_percent"]
                run["flow_error_percent"] = result["flow_error_percent"]
                run["flow_accuracy_status"] = result["status"]
                atomic_write(path, run)
            destination = folder / "flow-accuracy" / result["assessment_id"]
            atomic_write(destination.with_name(destination.name + ".json"), result)
            atomic_write(destination.with_name(destination.name + ".md"), markdown(result), raw=True)
    print(json.dumps({key: value for key, value in result.items() if key != "input"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
