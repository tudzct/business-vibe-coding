#!/usr/bin/env python3
"""Validate flow observations, calculate completion accuracy, and persist evidence."""

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens/scripts"))
from metrics_contract import ROOT, atomic_write, context, digest, epoch, read_json, require, run_lock, writable
from runtime_contract import method, configured_rubric, validate_runtime, complete_chain

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
    version, rubric = method(data)
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
    attempts, validate_target = validate_runtime(data, definitions, validate_evidence) if version == 2 else ({}, None)

    results = []
    for definition, assessed in zip(definitions, supplied):
        outcome = assessed.get("terminal_outcome")
        validate_observation(outcome, f"{definition['flow_id']} outcome")
        if validate_target:
            validate_target(outcome, "terminal_outcome", definition["flow_id"], True)
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
            if validate_target:
                validate_target(step, step_definition["step_id"], definition["flow_id"], critical)
            blocking_failure = blocking_failure or (critical and step["status"] == "unmet")
            critical_unknown = critical_unknown or (critical and step["status"] == "not_evaluable")
            deviations += int(not critical and step["status"] == "unmet")
            computed_steps.append({**step, "completion_critical": critical})
        chain_complete = complete_chain(assessed, definition, attempts) if version == 2 else True
        if blocking_failure or outcome["status"] == "unmet":
            status = "incorrect"
        elif critical_unknown or outcome["status"] == "not_evaluable" or not chain_complete:
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
        **({"schema_version": version, "rubric_id": rubric} if version == 2 else {}),
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
             f"Rubric: {method(result['input'])[1]}",
             f"Source revision: {result['input']['source_revision']}",
             f"Flow accuracy: {str(accuracy) + '%' if accuracy is not None else 'N/A'}",
             f"Flow error: {str(error) + '%' if error is not None else 'N/A'}",
             f"Evaluated coverage: {result['evaluated_coverage_percent']}%",
             f"Accuracy bounds: {result['accuracy_lower_bound_percent']}%–{result['accuracy_upper_bound_percent']}%", "",
             f"Flows: {counts['correct']} correct, {counts['incorrect']} incorrect, "
             f"{counts['not_evaluable']} not evaluable, {counts['total']} total", "",
             "| Flow | Type | Status | Noncritical deviations |", "|---|---|---|---:|"]
    for flow in result["flows"]:
        lines.append(f"| {flow['flow_id']} | {flow['type']} | {flow['status']} | {flow['noncritical_deviations']} |")
    lines.append("")
    for limitation in result["input"]["limitations"]:
        lines.append(json.dumps(limitation, ensure_ascii=False) if isinstance(limitation, dict) else limitation)
    if method(result["input"])[0] == 2:
        lines.extend(["", "## Observation trace", ""])
        for observation in result["input"]["observations"]:
            lines.append(f"- {observation['observation_id']} / {observation['flow_id']}: "
                         f"{observation['started_at']} to {observation['ended_at']}; {observation['state']}; "
                         f"entry {observation['entry_point']}; end {observation['end_state']}")
            for action in observation["actions"]:
                lines.append(f"  {action['sequence']}. {action['action']} -> {action['actual_result']} "
                             f"({', '.join(action['target_ids'])})")
        lines.extend(["", "Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input."])
    lines.append("")
    return "\n".join(lines)


def validate_run_result(run, folder, result):
    """Same validation for dry-run, commit and aggregation; no mutations."""
    require(all(run.get(key) == result["input"].get(key) for key in ("uc_id", "run_id")), "run identity mismatch")
    version, rubric = method(result["input"])
    require(configured_rubric(run, folder, validate_evidence, result["input"]["baseline"]) == rubric,
            "assessment differs from frozen configuration rubric")
    destination = folder / "flow-accuracy" / result["assessment_id"]
    json_path = destination.with_name(destination.name + ".json")
    md_path = destination.with_name(destination.name + ".md")
    if json_path.exists():
        require(read_json(json_path) == result, "assessment artifact is immutable")
    if md_path.exists() and version == 2:
        require(md_path.read_text(encoding="utf-8") == markdown(result), "assessment report is immutable")
    block = run.get("flow_accuracy")
    history = []
    if block is not None:
        require(method(block) == (version, rubric), "initial/final flow rubric changed")
        history = block.get("assessments")
        require(isinstance(history, list), "invalid flow history")
    previous = next((r for r in history if r.get("assessment_id") == result["assessment_id"]), None)
    if previous is not None:
        require(previous == result, "assessment ID is immutable")
        return
    require(result["stage"] != "initial" or not history, "initial assessment must be first")
    require(result["stage"] != "final" or (history and history[0].get("stage") == "initial"),
            "final assessment requires an immutable initial assessment")
    if history:
        require(history[0]["input"]["baseline"] == result["input"]["baseline"], "flow baseline changed")
        require(all(method(r["input"]) == (version, rubric) for r in history), "mixed method history")
        if version == 2:
            previous_end = max(epoch(r["input"]["captured_at"]) for r in history)
            old_ids = {o["observation_id"] for r in history for o in r["input"]["observations"]}
            require(epoch(result["input"]["captured_at"]) > previous_end, "final audit must be captured again")
            for observation in result["input"]["observations"]:
                require(observation["observation_id"] not in old_ids and epoch(observation["started_at"]) > previous_end,
                        "final audit requires fresh observations, including after skipped repair")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, type=Path)
    parser.add_argument("--assessment", required=True, type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    path, run, folder = context(args.run_json)
    result = calculate(read_json(args.assessment))
    validate_run_result(run, folder, result)
    if not args.dry_run:
        with run_lock(folder):
            run = read_json(path)
            validate_run_result(run, folder, result)
            version, rubric = method(result["input"])
            destination = folder / "flow-accuracy" / result["assessment_id"]
            json_path = destination.with_name(destination.name + ".json")
            md_path = destination.with_name(destination.name + ".md")
            if run.get("flow_accuracy") is None:
                run["flow_accuracy"] = {"schema_version": version, "rubric_id": rubric, "assessments": []}
            block = run["flow_accuracy"]
            require(method(block) == (version, rubric), "unknown flow schema")
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
            if not json_path.exists():
                atomic_write(json_path, result)
            if not md_path.exists():
                atomic_write(md_path, markdown(result), raw=True)
    version, rubric = method(result["input"])
    print(json.dumps({"schema_version": version, "rubric_id": rubric,
                      **{key: value for key, value in result.items() if key != "input"}}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, TypeError, KeyError) as exc:
        raise SystemExit(f"flow assessment error: {exc}")
