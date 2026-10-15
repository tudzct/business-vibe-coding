#!/usr/bin/env python3
"""Validate flow observations, calculate completion accuracy, and persist evidence."""

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow/scripts"))
from metrics_contract import ROOT, atomic_write, context, digest, epoch, read_json, require, run_lock, writable
from runtime_contract import method, configured_rubric, validate_runtime, complete_chain
from flow_summary import refresh_report, refresh_summary

OBSERVATION_STATUSES = {"met", "unmet", "not_evaluable"}
FLOW_TYPES = ("main", "alternative", "exception")
FLOW_PREFIX_TYPES = {"BF": "main", "AF": "alternative", "EF": "exception"}
DEFECT_CATEGORIES = {"business_rule", "flow", "technical"}
DEFECT_STATUSES = {"open", "resolved"}


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def validate_evidence(item):
    require(isinstance(item, dict) and nonempty(item.get("path")), "evidence path required")
    path = writable(ROOT / item["path"])
    require(path.is_file(), f"missing evidence: {item['path']}")
    require(item.get("sha256") == digest(path.read_bytes()), f"changed evidence: {item['path']}")
    return path


def validate_defects(run, stage=None, source_revision=None, ordered_flow_ids=None):
    """Validate the canonical, append-only defect inventory and select one audit stage."""
    defects = run.get("defects")
    require(isinstance(defects, list), "canonical defects must be an array")
    ordered_br_ids = (run.get("business_rules") or {}).get("ordered_br_ids", [])
    require(isinstance(ordered_br_ids, list), "ordered BR IDs required for defect validation")
    known_br_ids = set(ordered_br_ids)
    known_flow_ids = set(ordered_flow_ids or [])
    ids, fingerprints, selected = set(), set(), []
    for index, defect in enumerate(defects):
        label = f"defects[{index}]"
        require(isinstance(defect, dict), f"{label} must be an object")
        defect_id = defect.get("defect_id")
        require(isinstance(defect_id, str) and
                re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", defect_id), f"{label} has unsafe defect_id")
        require(defect_id not in ids, "duplicate defect_id")
        ids.add(defect_id)
        fingerprint = defect.get("fingerprint")
        require(isinstance(fingerprint, str) and
                re.fullmatch(r"sha256:[0-9a-f]{64}", fingerprint), f"{label} has invalid fingerprint")
        identity = (defect.get("stage"), defect.get("source_revision"), fingerprint)
        require(identity not in fingerprints, "one root cause must be recorded as one defect per source stage")
        fingerprints.add(identity)
        require(defect.get("stage") in {"initial", "final"}, f"{label} has invalid stage")
        revision = defect.get("source_revision")
        require(isinstance(revision, str) and
                re.fullmatch(r"sha256:[0-9a-f]{64}", revision), f"{label} has invalid source_revision")
        require(defect.get("category") in DEFECT_CATEGORIES, f"{label} has invalid category")
        require(nonempty(defect.get("trigger")) and nonempty(defect.get("description")),
                f"{label} needs trigger and description")
        require(defect.get("status") in DEFECT_STATUSES, f"{label} has invalid status")
        if defect["stage"] == "initial":
            require(defect["status"] == "open", "initial defects are immutable first-pass findings")
        require(type(defect.get("blocks_execution")) is bool, f"{label} needs blocks_execution")
        affected_br_ids = defect.get("affected_br_ids")
        affected_flow_ids = defect.get("affected_flow_ids")
        require(isinstance(affected_br_ids, list) and len(affected_br_ids) == len(set(affected_br_ids))
                and set(affected_br_ids) <= known_br_ids, f"{label} has invalid affected_br_ids")
        require(isinstance(affected_flow_ids, list) and len(affected_flow_ids) == len(set(affected_flow_ids)),
                f"{label} has invalid affected_flow_ids")
        if ordered_flow_ids is not None:
            require(set(affected_flow_ids) <= known_flow_ids, f"{label} has unknown affected_flow_ids")
        require(defect["category"] != "business_rule" or affected_br_ids,
                f"{label} business_rule defect needs an affected BR")
        require(defect["category"] != "flow" or affected_flow_ids,
                f"{label} flow defect needs an affected Flow")
        evidence = defect.get("evidence")
        require(isinstance(evidence, list) and evidence, f"{label} needs evidence")
        for ref in evidence:
            validate_evidence(ref)
            require(ref.get("source_revision") == revision, f"{label} evidence source revision mismatch")
        if (stage is None or defect["stage"] == stage) and (
                source_revision is None or revision == source_revision):
            selected.append(defect)
    return selected


def verification_defects(run, stage, source_revision, ordered_flow_ids):
    """Use immutable initial targets for Repair's final-stage verifier."""
    selected = validate_defects(run, stage, source_revision, ordered_flow_ids)
    if stage != "final" or not run.get("repairs"):
        return selected
    require(not selected, "Repair verification must not append final-stage defects")
    latest = run["repairs"][-1]
    require(isinstance(latest, dict), "latest Repair round must be an object")
    require(latest.get("source_revision_after") == source_revision,
            "Repair verifier source revision differs from the latest round")
    attempts = latest.get("defect_attempts")
    require(isinstance(attempts, list), "latest Repair round needs defect_attempts")
    unresolved_ids = [item.get("defect_id") for item in attempts
                      if isinstance(item, dict) and item.get("status") == "unresolved"]
    require(len(unresolved_ids) == len(set(unresolved_ids)),
            "latest Repair round has duplicate unresolved defect IDs")
    initial = validate_defects(run, "initial", ordered_flow_ids=ordered_flow_ids)
    by_id = {item["defect_id"]: item for item in initial}
    require(set(unresolved_ids) <= set(by_id),
            "Repair verifier references a defect outside the immutable initial inventory")
    return [by_id[identity] for identity in unresolved_ids]


def validate_observation(item, label):
    require(isinstance(item, dict) and item.get("status") in OBSERVATION_STATUSES, f"invalid {label} status")
    require(nonempty(item.get("rationale")), f"{label} rationale required")
    refs = item.get("evidence")
    require(isinstance(refs, list) and refs, f"{label} evidence required")
    for ref in refs:
        validate_evidence(ref)


def source_flow_ids(raw):
    """Extract the ordered flow inventory without interpreting flow semantics."""
    content = raw.decode("utf-8-sig")
    headings = list(re.finditer(r"(?m)^(##|###)\s+([^\r\n]+?)\s*\r?$", content))
    require(headings, "frozen UC flow headings missing")
    scope, result, basic_counts = "", [], {}
    for index, heading in enumerate(headings):
        level, title = heading.group(1), heading.group(2).strip()
        if level == "##":
            variant = re.match(r"(UC-[0-9]+(?:\.[0-9]+)?)\s+UI Variant\b", title, re.I)
            scope = f"{variant.group(1).upper()}/" if variant else ""
            continue
        end = headings[index + 1].start() if index + 1 < len(headings) else len(content)
        section = content[heading.end():end]
        if re.fullmatch(r"(?:Basic|Main) Flow", title, re.I):
            count = basic_counts.get(scope, 0) + 1
            basic_counts[scope] = count
            result.append(f"{scope}BF-{count}")
        elif re.fullmatch(r"Alternative Flow", title, re.I):
            result.extend(f"{scope}{value}" for value in re.findall(r"(?m)^(AF-[0-9]+)(?=:)", section))
        elif re.fullmatch(r"Exception Flow", title, re.I):
            result.extend(f"{scope}{value}" for value in re.findall(r"(?m)^(EF-[0-9]+)(?=:)", section))
    require(result and len(result) == len(set(result)), "frozen UC flow IDs missing or duplicated")
    return result


def flow_type(flow_id):
    match = re.fullmatch(r"(?:UC-[0-9]+(?:\.[0-9]+)?/)?(BF|AF|EF)-[0-9]+", flow_id or "")
    require(match is not None, f"invalid flow ID: {flow_id}")
    return FLOW_PREFIX_TYPES[match.group(1)]


def validate_baseline(data):
    expected_fields = {"schema_version", "artifact_type", "status", "uc_id", "use_case_path",
                       "use_case_sha256", "ordered_flow_ids", "frozen_at"}
    require(set(data) == expected_fields, "invalid flow baseline fields")
    require(data.get("schema_version") == 1 and data.get("artifact_type") == "flow-baseline", "invalid baseline schema")
    require(data.get("status") == "Frozen" and nonempty(data.get("uc_id")), "baseline must be Frozen")
    uc_path = writable(ROOT / data.get("use_case_path", ""))
    require(uc_path.is_file(), "baseline UC path missing")
    raw = uc_path.read_bytes()
    require(data.get("use_case_sha256") == digest(raw), "frozen UC changed")
    epoch(data.get("frozen_at"))
    ids = data.get("ordered_flow_ids")
    require(isinstance(ids, list) and ids and all(nonempty(value) for value in ids), "ordered flow IDs required")
    require(len(ids) == len(set(ids)), "duplicate flow IDs")
    for flow_id in ids:
        flow_type(flow_id)
    require(ids == source_flow_ids(raw), "frozen UC/flow baseline order conflict")
    counts = {kind: sum(flow_type(value) == kind for value in ids) for kind in FLOW_TYPES}
    counts["total"] = len(ids)
    require(counts["main"] > 0, "flow baseline needs a Basic/Main Flow")
    return ids, counts


def assessment_definitions(supplied, ordered_ids):
    """Validate the auditor's UC-derived flow breakdown used by the runtime rubric."""
    require([row.get("flow_id") for row in supplied] == ordered_ids, "assessment flow inventory mismatch")
    definitions, all_steps = [], set()
    for assessed in supplied:
        flow_id = assessed["flow_id"]
        require(nonempty(assessed.get("source_anchor")), f"{flow_id} frozen UC source anchor required")
        steps = assessed.get("steps")
        require(isinstance(steps, list) and steps, f"{flow_id} needs UC-derived steps")
        step_definitions = []
        for step in steps:
            step_id = step.get("step_id")
            require(nonempty(step_id) and step_id.startswith(flow_id + "."), f"invalid step ID for {flow_id}")
            require(step_id not in all_steps, "duplicate step ID")
            all_steps.add(step_id)
            require(nonempty(step.get("text")) and type(step.get("completion_critical")) is bool,
                    f"invalid UC-derived step: {step_id}")
            require(nonempty(step.get("criticality_reason")), f"criticality reason required: {step_id}")
            step_definitions.append({key: step[key] for key in
                                     ("step_id", "text", "completion_critical", "criticality_reason")})
        outcome = assessed.get("terminal_outcome") or {}
        require(nonempty(outcome.get("text")), f"{flow_id} UC-derived terminal outcome required")
        definitions.append({"flow_id": flow_id, "type": flow_type(flow_id),
                            "source_anchor": assessed["source_anchor"], "steps": step_definitions,
                            "terminal_outcome": outcome["text"]})
    return definitions


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
    ordered_ids, type_counts = validate_baseline(baseline)
    require(baseline.get("uc_id") == data.get("uc_id"), "baseline UC mismatch")
    supplied = data.get("flows")
    require(isinstance(supplied, list), "flow observations required")
    definitions = assessment_definitions(supplied, ordered_ids)
    attempts, validate_target = validate_runtime(data, definitions, validate_evidence)

    blocker_ids = data.get("execution_blocker_defect_ids", [])
    require(isinstance(blocker_ids, list) and len(blocker_ids) == len(set(blocker_ids))
            and all(nonempty(value) for value in blocker_ids), "invalid execution blocker defect IDs")
    if blocker_ids:
        require(data["runtime"].get("status") == "BLOCKED",
                "execution-blocked assessment requires a blocked runtime")
        results = [{
            "flow_id": definition["flow_id"], "type": definition["type"],
            "status": "incorrect", "noncritical_deviations": 0,
            "execution_blocker_defect_ids": list(blocker_ids),
            "terminal_outcome": {
                "text": definition["terminal_outcome"], "status": "unmet",
                "blocking_defect_ids": list(blocker_ids),
            },
            "steps": [{**step, "status": "not_evaluable",
                       "blocking_defect_ids": list(blocker_ids)} for step in definition["steps"]],
        } for definition in definitions]
        return {
            "schema_version": version, "rubric_id": rubric,
            "assessment_id": data["assessment_id"], "stage": data["stage"],
            "input_sha256": digest(json.dumps(data, sort_keys=True, separators=(",", ":")).encode()),
            "status": "repair_required",
            "execution_blocked": True,
            "execution_blocker_defect_ids": list(blocker_ids),
            "counts": {**type_counts, "correct": 0, "incorrect": len(results), "not_evaluable": 0},
            "flow_error_percent": 100.0, "flow_accuracy_percent": 0.0,
            "evaluated_coverage_percent": 100.0,
            "accuracy_lower_bound_percent": 0.0, "accuracy_upper_bound_percent": 0.0,
            "flows": results, "input": data,
        }

    results = []
    for definition, assessed in zip(definitions, supplied):
        outcome = assessed.get("terminal_outcome")
        validate_observation(outcome, f"{definition['flow_id']} outcome")
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
            validate_target(step, step_definition["step_id"], definition["flow_id"], critical)
            blocking_failure = blocking_failure or (critical and step["status"] == "unmet")
            critical_unknown = critical_unknown or (critical and step["status"] == "not_evaluable")
            deviations += int(not critical and step["status"] == "unmet")
            computed_steps.append({**step, "completion_critical": critical})
        chain_complete = complete_chain(assessed, definition, attempts)
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
        "schema_version": version, "rubric_id": rubric,
        "assessment_id": data["assessment_id"],
        "stage": data["stage"],
        "input_sha256": digest(json.dumps(data, sort_keys=True, separators=(",", ":")).encode()),
        "status": "not_evaluable" if unknown else ("repair_required" if incorrect else "scored"),
        "execution_blocked": False,
        "execution_blocker_defect_ids": [],
        "counts": {**type_counts, "correct": correct, "incorrect": incorrect,
                   "not_evaluable": unknown},
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
    shown = lambda value: "N/A" if value is None else f"{value}%"
    lines = [f"# Flow accuracy: {result['assessment_id']}", "", f"Status: {result['status']}",
             f"Rubric: {method(result['input'])[1]}",
             f"Source revision: {result['input']['source_revision']}",
             f"Flow accuracy: {shown(accuracy)}",
             f"Flow error: {shown(error)}",
             f"Evaluated coverage: {result['evaluated_coverage_percent']}%",
             f"Execution blocked: {'yes' if result.get('execution_blocked') else 'no'}",
             f"Execution blocker defects: {', '.join(result.get('execution_blocker_defect_ids', [])) or 'none'}",
             f"Accuracy bounds: {shown(result['accuracy_lower_bound_percent'])} to "
             f"{shown(result['accuracy_upper_bound_percent'])}", "",
             f"Flows: {counts['correct']} correct, {counts['incorrect']} incorrect, "
             f"{counts['not_evaluable']} not evaluable, "
             f"{counts['total']} total", "",
             "| Flow | Type | Status | Noncritical deviations |", "|---|---|---|---:|"]
    for flow in result["flows"]:
        lines.append(f"| {flow['flow_id']} | {flow['type']} | {flow['status']} | {flow['noncritical_deviations']} |")
    lines.append("")
    for limitation in result["input"]["limitations"]:
        lines.append(json.dumps(limitation, ensure_ascii=False) if isinstance(limitation, dict) else limitation)
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
    flow_ids = [flow["flow_id"] for flow in result["flows"]]
    stage_defects = verification_defects(
        run, result["stage"], result["input"]["source_revision"], flow_ids)
    open_defects = {item["defect_id"]: item for item in stage_defects if item["status"] == "open"}
    open_blocker_ids = {identity for identity, item in open_defects.items() if item["blocks_execution"]}
    blocker_ids = result["input"].get("execution_blocker_defect_ids", [])
    blocked = bool(blocker_ids)
    if blocked:
        require(blocker_ids and set(blocker_ids) == open_blocker_ids,
                "execution blocker IDs must identify every open system blocker for this source stage")
        require(result.get("execution_blocked") is True
                and result.get("execution_blocker_defect_ids") == blocker_ids
                and result["counts"]["incorrect"] == result["counts"]["total"]
                and all(flow["status"] == "incorrect" for flow in result["flows"]),
                "system execution blocking must make the complete frozen flow inventory incorrect")
        require(result["flow_accuracy_percent"] == 0.0 and result["flow_error_percent"] == 100.0,
                "system execution blocking must score zero accuracy")
        all_br_ids = set((run.get("business_rules") or {}).get("ordered_br_ids", []))
        all_flow_ids = set(flow_ids)
        affected_br_ids = {value for identity in blocker_ids for value in open_defects[identity]["affected_br_ids"]}
        affected_flow_ids = {value for identity in blocker_ids for value in open_defects[identity]["affected_flow_ids"]}
        require(affected_br_ids == all_br_ids and affected_flow_ids == all_flow_ids,
                "execution blockers must cover the complete frozen BR and Flow inventories")
    else:
        require(not blocker_ids and result.get("execution_blocked") is False
                and result.get("execution_blocker_defect_ids") == [],
                "non-blocked assessments cannot carry execution blockers")
        require(not open_blocker_ids,
                "an open system-blocking defect requires a complete execution-blocked assessment")
        for flow in result["flows"]:
            if flow["status"] == "incorrect":
                require(any(flow["flow_id"] in defect["affected_flow_ids"]
                            for defect in open_defects.values()),
                        f"incorrect Flow lacks a canonical affected defect: {flow['flow_id']}")
    destination = folder / "flow-accuracy" / result["assessment_id"]
    json_path = destination.with_name(destination.name + ".json")
    md_path = destination.with_name(destination.name + ".md")
    if json_path.exists():
        require(read_json(json_path) == result, "assessment artifact is immutable")
    if md_path.exists():
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
        followups = block.get("followups", [])
        previous_end = max([epoch(r["input"]["captured_at"]) for r in history] +
                           [epoch(r["recorded_at"]) for r in followups
                            if r["assessment_id"] in {a["assessment_id"] for a in history}])
        old_ids = {o["observation_id"] for r in history for o in r["input"]["observations"]}
        old_ids.update(o["observation_id"] for r in followups if r["mode"] == "llm_measurement"
                       for o in r["runtime_result"]["input"].get("observations", []))
        require(epoch(result["input"]["captured_at"]) > previous_end, "new final assessment must follow prior evidence capture")
        for observation in result["input"]["observations"]:
            require(observation["observation_id"] not in old_ids and epoch(observation["started_at"]) > previous_end,
                    "new final assessments require fresh observations")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, type=Path)
    parser.add_argument("--assessment", required=True, type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    path, run, folder = context(args.run_json)
    require(path.is_relative_to(ROOT / "docs/04-experiments"), "flow scores require canonical experiment JSON")
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
            summary = refresh_summary(run, folder)
            atomic_write(path, run)
            if not json_path.exists():
                atomic_write(json_path, result)
            if not md_path.exists():
                atomic_write(md_path, markdown(result), raw=True)
            refresh_report(path, run)
    version, rubric = method(result["input"])
    if args.dry_run:
        import copy
        preview = copy.deepcopy(run)
        block = preview.setdefault("flow_accuracy", None)
        if block is None:
            block = preview["flow_accuracy"] = {"schema_version": version, "rubric_id": rubric, "assessments": []}
        if not any(a["assessment_id"] == result["assessment_id"] for a in block["assessments"]):
            block["assessments"].append(result)
            block["current_assessment_id"] = result["assessment_id"]
        summary = refresh_summary(preview, folder)
    print(json.dumps({"schema_version": version, "rubric_id": rubric,
                      **{key: value for key, value in result.items() if key != "input"},
                      "current_summary": summary},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, TypeError, KeyError) as exc:
        raise SystemExit(f"flow assessment error: {exc}")
