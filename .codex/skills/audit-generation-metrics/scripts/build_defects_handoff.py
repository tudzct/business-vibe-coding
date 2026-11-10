#!/usr/bin/env python3
"""Build the validated Defects Handoff from accepted Audit results."""

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts"))
from metrics_contract import (ROOT, atomic_write, context, digest, read_json,
                              require, run_lock, writable)
from validate_experiment_configuration import validate as validate_configuration

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "audit-flow-accuracy" / "scripts"))
from flow_summary import accepted_summary as accepted_flow_summary
from score_flow_accuracy import validate_defects

from calculate_metrics import accepted_br_summary, br_summary_snapshot


HASH = re.compile(r"sha256:[0-9a-f]{64}\Z")
SAFE_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]*\Z")
BR_ID = re.compile(r"BR-[A-Z0-9][A-Z0-9-]*-\d+\Z")
FLOW_ID = re.compile(r"(?:BF|AF|EF)-\d+\Z")
FLOW_STEP_ID = re.compile(r"((?:BF|AF|EF)-\d+)\.([0-9]+[a-z]?)\Z")
API_ID = re.compile(r"API-[A-Z0-9]+(?:-[A-Z0-9]+)*\Z")
ROOT_FIELDS = {
    "schema_version", "artifact_type", "uc_id", "run_id", "source_revision",
    "canonical_defects_sha256", "accepted_results_sha256", "status", "defects",
}
DEFECT_FIELDS = {
    "defect_id", "fingerprint", "category", "title", "description",
    "reproduction_steps", "scope", "evidence", "required_correction",
}
SCOPE_FIELDS = {
    "affected_br_ids", "affected_flow_ids", "affected_flow_step_ids",
    "affected_api_ids", "affected_ui_targets", "affected_files",
}
EVIDENCE_FIELDS = {
    "source_file", "line_start", "line_end", "locator", "defect_finding", "content",
}
ENRICHMENT_FIELDS = {
    "defect_id", "title", "description", "reproduction_steps",
    "affected_flow_step_ids", "affected_api_ids", "affected_ui_targets",
    "affected_files", "evidence_annotations", "required_correction",
}
ANNOTATION_FIELDS = {
    "source_file", "line_start", "line_end", "locator", "defect_finding", "content",
}


def canonical_hash(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True,
                     separators=(",", ":")).encode("utf-8")
    return digest(raw)


def artifact_hash(value):
    raw = (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    return digest(raw)


def nonempty(value, label):
    require(isinstance(value, str) and value.strip(), f"{label} must be nonempty")
    return value.strip()


def safe_relative(value, label):
    value = nonempty(value, label).replace("\\", "/")
    path = Path(value)
    require(not path.is_absolute() and ".." not in path.parts,
            f"{label} must be repository-relative")
    return value


def string_array(value, label, pattern=None, allow_empty=True):
    require(isinstance(value, list), f"{label} must be an array")
    require(allow_empty or value, f"{label} must not be empty")
    require(all(isinstance(item, str) and item.strip() for item in value),
            f"{label} contains an empty value")
    require(len(value) == len(set(value)), f"{label} contains duplicates")
    if pattern is not None:
        require(all(pattern.fullmatch(item) for item in value),
                f"{label} contains an invalid ID")
    return value


def read_payload(argument):
    if argument is None:
        return {"defects": []}
    require(argument == "-", "Audit enrichment must be supplied through stdin")
    raw = sys.stdin.read()
    require(raw.strip(), "Audit enrichment stdin is empty")
    payload = json.loads(raw)
    require(isinstance(payload, dict) and set(payload) == {"defects"},
            "Audit enrichment must contain only defects")
    require(isinstance(payload["defects"], list),
            "Audit enrichment defects must be an array")
    return payload


def enrichment_by_id(payload):
    result = {}
    for index, item in enumerate(payload["defects"]):
        label = f"enrichment.defects[{index}]"
        require(isinstance(item, dict) and set(item) == ENRICHMENT_FIELDS,
                f"{label} fields mismatch")
        identity = nonempty(item.get("defect_id"), f"{label}.defect_id")
        require(SAFE_ID.fullmatch(identity) and identity not in result,
                f"{label}.defect_id is invalid or duplicated")
        nonempty(item.get("title"), f"{label}.title")
        nonempty(item.get("description"), f"{label}.description")
        string_array(item.get("reproduction_steps"),
                     f"{label}.reproduction_steps", allow_empty=False)
        string_array(item.get("affected_flow_step_ids"),
                     f"{label}.affected_flow_step_ids", FLOW_STEP_ID)
        string_array(item.get("affected_api_ids"),
                     f"{label}.affected_api_ids", API_ID)
        string_array(item.get("affected_ui_targets"),
                     f"{label}.affected_ui_targets")
        files = string_array(item.get("affected_files"), f"{label}.affected_files")
        for path in files:
            safe_relative(path, f"{label}.affected_files")
        nonempty(item.get("required_correction"), f"{label}.required_correction")
        annotations = item.get("evidence_annotations")
        require(isinstance(annotations, dict),
                f"{label}.evidence_annotations must be an object")
        for path, annotation in annotations.items():
            safe_relative(path, f"{label}.evidence_annotations path")
            require(isinstance(annotation, dict) and set(annotation) == ANNOTATION_FIELDS,
                    f"{label}.evidence_annotations[{path}] fields mismatch")
            safe_relative(annotation.get("source_file"),
                          f"{label}.evidence_annotations[{path}].source_file")
            start, end = annotation.get("line_start"), annotation.get("line_end")
            require((start is None and end is None) or
                    (type(start) is int and type(end) is int and 1 <= start <= end),
                    f"{label}.evidence_annotations[{path}] line range is invalid")
            nonempty(annotation.get("locator"),
                     f"{label}.evidence_annotations[{path}].locator")
            nonempty(annotation.get("defect_finding"),
                     f"{label}.evidence_annotations[{path}].defect_finding")
            if annotation.get("content") is not None:
                nonempty(annotation["content"],
                         f"{label}.evidence_annotations[{path}].content")
        result[identity] = item
    return result


def configuration_for(run):
    reference = run.get("experiment_configuration")
    require(isinstance(reference, dict), "canonical experiment_configuration is required")
    relative = safe_relative(reference.get("artifact"), "experiment_configuration.artifact")
    path = writable(ROOT / relative)
    require(path.is_file(), "pinned experiment configuration is missing")
    raw = path.read_bytes()
    require(reference.get("checksum") == digest(raw),
            "pinned experiment configuration checksum changed")
    configuration = validate_configuration(path)
    require(configuration.get("configuration_id") == reference.get("configuration_id"),
            "configuration identity mismatch")
    require(configuration["use_case"]["uc_id"] == run.get("uc_id"),
            "configuration UC mismatch")
    assignments = [row for row in configuration["runs"]
                   if row.get("run_id") == run.get("run_id")]
    require(len(assignments) == 1, "configuration run assignment mismatch")
    return configuration


def frozen_sources(configuration):
    uc = configuration["use_case"]
    br_baseline_path = writable(ROOT / safe_relative(
        uc["business_rule_baseline"], "use_case.business_rule_baseline"))
    flow_baseline_path = writable(ROOT / safe_relative(
        uc["flow_baseline"], "use_case.flow_baseline"))
    br_baseline = read_json(br_baseline_path)
    flow_baseline = read_json(flow_baseline_path)
    br_path = writable(ROOT / safe_relative(
        br_baseline.get("business_rule_path"), "business_rule_baseline.business_rule_path"))
    flow_path = writable(ROOT / safe_relative(
        flow_baseline.get("use_case_path"), "flow_baseline.use_case_path"))
    require(br_path.is_file()
            and digest(br_path.read_bytes()) == br_baseline.get("business_rule_sha256"),
            "business-rule specification checksum changed")
    require(flow_path.is_file()
            and digest(flow_path.read_bytes()) == flow_baseline.get("use_case_sha256"),
            "frozen UC checksum changed")
    contracts = {}
    for index, entry in enumerate(uc.get("api_contracts", [])):
        api_id = nonempty(entry.get("api_id"), f"use_case.api_contracts[{index}].api_id")
        require(API_ID.fullmatch(api_id) and api_id not in contracts,
                "configured API ID is invalid or duplicated")
        api_path = writable(ROOT / safe_relative(
            entry.get("path"), f"use_case.api_contracts[{index}].path"))
        raw = api_path.read_bytes()
        require(entry.get("sha256") == digest(raw),
                f"API contract checksum changed: {api_id}")
        contracts[api_id] = raw.decode("utf-8-sig").strip()
    return br_baseline, flow_baseline, br_path, flow_path, contracts


def heading_section(text, heading):
    match = re.search(rf"(?m)^### {re.escape(heading)}[ \t]*\r?$", text)
    require(match is not None, f"missing {heading} section")
    tail = text[match.end():]
    next_heading = re.search(r"(?m)^###? [^\r\n]+", tail)
    return tail[:next_heading.start()] if next_heading else tail


def optional_heading_section(text, heading):
    match = re.search(rf"(?m)^### {re.escape(heading)}[ \t]*\r?$", text)
    if match is None:
        return None
    tail = text[match.end():]
    next_heading = re.search(r"(?m)^###? [^\r\n]+", tail)
    return tail[:next_heading.start()] if next_heading else tail


def unwrapped(section):
    fence = re.search(r"(?:```|~~~)[^\r\n]*\r?\n(.*?)(?:```|~~~)", section, re.S)
    return (fence.group(1) if fence else section).strip()


def br_blocks(text):
    rules = unwrapped(heading_section(text, "Rule Definitions"))
    pattern = re.compile(
        r"(?m)^(BR-[A-Z0-9][A-Z0-9-]*-\d+)(?=[ \t]*(?::|-)[ \t]+\S)")
    matches = list(pattern.finditer(rules))
    require(matches, "business-rule specification contains no rule blocks")
    blocks = {}
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(rules)
        blocks[match.group(1)] = rules[match.start():end].strip()
    utilities = unwrapped(heading_section(text, "OCL Utility Definitions"))
    return blocks, utilities


def referenced_utilities(rule_text, utilities):
    if not utilities:
        return []
    starts = list(re.finditer(
        r"(?m)^(?:[A-Za-z_][A-Za-z0-9_]*\.)?([A-Za-z_][A-Za-z0-9_]*)\s*\([^\r\n]*\)\s*:",
        utilities))
    selected = []
    for index, match in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else len(utilities)
        block = utilities[match.start():end].strip()
        if re.search(rf"(?:\.|\b){re.escape(match.group(1))}\s*\(", rule_text):
            selected.append(block)
    return selected


def flow_sections(text):
    result = {}
    basic = heading_section(text, "Basic Flow")
    flow_match = re.search(r"(?m)^Flow ID:\s*(BF-\d+)\s*$", basic)
    require(flow_match is not None, "Basic Flow ID is missing")
    result[flow_match.group(1)] = basic[flow_match.end():].strip()
    for heading, prefix in (("Alternative Flow", "AF"), ("Exception Flow", "EF")):
        section = optional_heading_section(text, heading)
        if section is None:
            continue
        matches = list(re.finditer(rf"(?m)^({prefix}-\d+):\s*\S.*$", section))
        for index, match in enumerate(matches):
            end = matches[index + 1].start() if index + 1 < len(matches) else len(section)
            result[match.group(1)] = section[match.start():end].strip()
    return result


def flow_step_lines(parent_id, section):
    result = {}
    if parent_id.startswith("BF-"):
        pattern = re.compile(rf"(?m)^({re.escape(parent_id)}\.[0-9]+[a-z]?):\s*\S.*$")
        for match in pattern.finditer(section):
            result[match.group(1)] = match.group(0).strip()
        return result
    pattern = re.compile(r"(?m)^([0-9]+[a-z]?)\s*:\s*\S.*$")
    for match in pattern.finditer(section):
        result[f"{parent_id}.{match.group(1)}"] = match.group(0).strip()
    return result


def complete_correction(br_ids, flow_ids, step_ids, api_ids, ui_targets,
                        br_text, flow_text, api_contracts, expected_behavior):
    parts = []
    if br_ids:
        blocks, utilities = br_blocks(br_text)
        require(all(identity in blocks for identity in br_ids),
                "affected BR is absent from frozen specification")
        selected = "\n\n".join(blocks[identity] for identity in br_ids)
        parts.extend([
            f"Affected Business Rule IDs: {', '.join(br_ids)}.",
            "Authoritative Business Rule definitions:",
            f"```ocl\n{selected}\n```",
        ])
        definitions = referenced_utilities(selected, utilities)
        if definitions:
            parts.extend([
                "Referenced OCL Utility Definitions:",
                "\n\n".join(f"```ocl\n{item}\n```" for item in definitions),
            ])
    if flow_ids:
        sections = flow_sections(flow_text)
        require(all(identity in sections for identity in flow_ids),
                "affected Flow is absent from frozen UC")
        available = {}
        for identity in flow_ids:
            available.update(flow_step_lines(identity, sections[identity]))
        require(step_ids and all(identity in available for identity in step_ids),
                "affected Flow step is absent from frozen UC")
        selected_steps = "\n\n".join(available[identity] for identity in step_ids)
        selected_flows = "\n\n".join(sections[identity] for identity in flow_ids)
        parts.extend([
            f"Affected Flow IDs: {', '.join(flow_ids)}.",
            f"Affected Flow step IDs: {', '.join(step_ids)}.",
            "Authoritative affected Flow steps:",
            f"```text\n{selected_steps}\n```",
            "Complete affected Flow definitions and outcome semantics:",
            f"```text\n{selected_flows}\n```",
        ])
    if api_ids:
        require(all(identity in api_contracts for identity in api_ids),
                "affected API is absent from the checksum-pinned configuration")
        parts.append(f"Affected API IDs: {', '.join(api_ids)}.")
        for identity in api_ids:
            parts.extend([
                f"Authoritative contract for {identity}:",
                f"```text\n{api_contracts[identity]}\n```",
            ])
    if ui_targets:
        parts.append(f"Affected functional UI targets: {', '.join(ui_targets)}.")
    parts.extend([
        "Required observable behavior after repair:",
        nonempty(expected_behavior, "required_correction"),
    ])
    return "\n\n".join(parts)


def evidence_content(path, raw, annotation, start, end):
    supplied = annotation.get("content")
    if supplied is not None:
        return nonempty(supplied, "evidence.content")
    try:
        decoded = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise ValueError(
            f"binary or image evidence requires a textual content annotation: {path}") from exc
    if start is not None:
        lines = decoded.splitlines()
        require(end <= len(lines), f"evidence line bounds exceed file: {path}")
        decoded = "\n".join(lines[start - 1:end])
    if path.suffix.lower() == ".json" and start is None:
        decoded = json.dumps(json.loads(decoded), ensure_ascii=False, indent=2)
    return nonempty(decoded, "evidence.content")


def enriched_evidence(reference, annotation):
    relative = safe_relative(reference.get("path"), "evidence.path")
    path = writable(ROOT / relative)
    raw = path.read_bytes()
    require(reference.get("sha256") == digest(raw), f"changed evidence: {relative}")
    start, end = annotation["line_start"], annotation["line_end"]
    return {
        "source_file": safe_relative(annotation["source_file"], "evidence.source_file"),
        "line_start": start,
        "line_end": end,
        "locator": nonempty(annotation["locator"], "evidence.locator"),
        "defect_finding": nonempty(annotation["defect_finding"],
                                   "evidence.defect_finding"),
        "content": evidence_content(path, raw, annotation, start, end),
    }


def build_defect(defect, enrichment, incorrect_br_ids, incorrect_flow_ids,
                 br_text, flow_text, api_contracts):
    affected_br_ids = [identity for identity in defect["affected_br_ids"]
                       if identity in incorrect_br_ids]
    affected_flow_ids = [identity for identity in defect["affected_flow_ids"]
                         if identity in incorrect_flow_ids]
    step_ids = list(enrichment["affected_flow_step_ids"])
    step_parents = {FLOW_STEP_ID.fullmatch(item).group(1) for item in step_ids}
    require(step_parents <= set(affected_flow_ids),
            f"{defect['defect_id']} affected Flow step has no affected parent")
    if affected_flow_ids and not defect["blocks_execution"]:
        require(step_parents == set(affected_flow_ids),
                f"{defect['defect_id']} must identify exact steps for every affected Flow")
    annotations = enrichment["evidence_annotations"]
    known_paths = {item["path"] for item in defect["evidence"]}
    require(set(annotations) == known_paths,
            f"{defect['defect_id']} must annotate every immutable evidence item exactly once")
    evidence = [enriched_evidence(item, annotations[item["path"]])
                for item in defect["evidence"]]
    scope = {
        "affected_br_ids": affected_br_ids,
        "affected_flow_ids": affected_flow_ids,
        "affected_flow_step_ids": step_ids,
        "affected_api_ids": list(enrichment["affected_api_ids"]),
        "affected_ui_targets": list(enrichment["affected_ui_targets"]),
        "affected_files": [safe_relative(item, f"{defect['defect_id']}.affected_files")
                           for item in enrichment["affected_files"]],
    }
    correction = complete_correction(
        affected_br_ids, affected_flow_ids, step_ids,
        scope["affected_api_ids"], scope["affected_ui_targets"],
        br_text, flow_text, api_contracts, enrichment["required_correction"])
    return {
        "defect_id": defect["defect_id"],
        "fingerprint": defect["fingerprint"],
        "category": defect["category"],
        "title": enrichment["title"],
        "description": enrichment["description"],
        "reproduction_steps": list(enrichment["reproduction_steps"]),
        "scope": scope,
        "evidence": evidence,
        "required_correction": correction,
    }


def validate_handoff(value, expected_uc=None, expected_run=None):
    require(isinstance(value, dict) and set(value) == ROOT_FIELDS,
            "handoff root fields mismatch")
    require(value.get("schema_version") == 2
            and value.get("artifact_type") == "defects-handoff",
            "handoff schema/type mismatch")
    uc_id = nonempty(value.get("uc_id"), "handoff.uc_id")
    run_id = nonempty(value.get("run_id"), "handoff.run_id")
    require(SAFE_ID.fullmatch(uc_id) and SAFE_ID.fullmatch(run_id),
            "handoff identity is unsafe")
    if expected_uc is not None:
        require(uc_id == expected_uc and run_id == expected_run,
                "handoff identity mismatch")
    require(HASH.fullmatch(str(value.get("source_revision"))),
            "handoff source_revision is invalid")
    require(HASH.fullmatch(str(value.get("canonical_defects_sha256")))
            and HASH.fullmatch(str(value.get("accepted_results_sha256"))),
            "handoff checksum is invalid")
    defects = value.get("defects")
    require(isinstance(defects, list), "handoff defects must be an array")
    require(value.get("status") == ("ready" if defects else "no_repair_required"),
            "handoff status does not match defects")
    identities = set()
    for index, defect in enumerate(defects):
        label = f"handoff.defects[{index}]"
        require(isinstance(defect, dict) and set(defect) == DEFECT_FIELDS,
                f"{label} fields mismatch")
        defect_id = nonempty(defect.get("defect_id"), f"{label}.defect_id")
        require(SAFE_ID.fullmatch(defect_id) and defect_id not in identities,
                f"{label}.defect_id is invalid or duplicated")
        identities.add(defect_id)
        require(HASH.fullmatch(str(defect.get("fingerprint"))),
                f"{label}.fingerprint is invalid")
        require(defect.get("category") in {"business_rule", "flow", "technical", "ui"},
                f"{label}.category is invalid")
        for field in ("title", "description", "required_correction"):
            nonempty(defect.get(field), f"{label}.{field}")
        string_array(defect.get("reproduction_steps"),
                     f"{label}.reproduction_steps", allow_empty=False)
        scope = defect.get("scope")
        require(isinstance(scope, dict) and set(scope) == SCOPE_FIELDS,
                f"{label}.scope fields mismatch")
        string_array(scope["affected_br_ids"], f"{label}.scope.affected_br_ids", BR_ID)
        flow_ids = string_array(scope["affected_flow_ids"],
                                f"{label}.scope.affected_flow_ids", FLOW_ID)
        step_ids = string_array(scope["affected_flow_step_ids"],
                                f"{label}.scope.affected_flow_step_ids", FLOW_STEP_ID)
        string_array(scope["affected_api_ids"], f"{label}.scope.affected_api_ids", API_ID)
        string_array(scope["affected_ui_targets"], f"{label}.scope.affected_ui_targets")
        for item in string_array(scope["affected_files"], f"{label}.scope.affected_files"):
            safe_relative(item, f"{label}.scope.affected_files")
        step_parents = {FLOW_STEP_ID.fullmatch(item).group(1) for item in step_ids}
        require(step_parents <= set(flow_ids),
                f"{label} contains a Flow step without its parent Flow")
        if defect["category"] == "flow":
            require(flow_ids and step_parents == set(flow_ids),
                    f"{label} must identify exact steps for every affected Flow")
        evidence = defect.get("evidence")
        require(isinstance(evidence, list) and evidence,
                f"{label}.evidence must be a non-empty array")
        for evidence_index, item in enumerate(evidence):
            evidence_label = f"{label}.evidence[{evidence_index}]"
            require(isinstance(item, dict) and set(item) == EVIDENCE_FIELDS,
                    f"{evidence_label} fields mismatch")
            safe_relative(item.get("source_file"), f"{evidence_label}.source_file")
            start, end = item.get("line_start"), item.get("line_end")
            require((start is None and end is None) or
                    (type(start) is int and type(end) is int and 1 <= start <= end),
                    f"{evidence_label} line range is invalid")
            for field in ("locator", "defect_finding", "content"):
                nonempty(item.get(field), f"{evidence_label}.{field}")
    return value


def build(run_path, output, payload):
    _, run, folder = context(run_path)
    require(not run.get("repairs") and run.get("repair_rounds_completed", 0) == 0,
            "defects handoff is frozen once correction activity starts")
    require(run.get("repair_prompt_directory") in (None, "")
            and run.get("all_sub_prompt_count", 0) == 0,
            "defects handoff must be built before another operation consumes Audit results")
    configuration = configuration_for(run)
    br_baseline, flow_baseline, br_path, flow_path, api_contracts = frozen_sources(configuration)
    br_summary = accepted_br_summary(run)
    flow_summary = accepted_flow_summary(run)
    require(run.get("business_rules", {}).get("final") == br_summary_snapshot(br_summary),
            "persist validated accepted BR results before building handoff")
    require(run.get("flow_accuracy", {}).get("current_summary") == flow_summary,
            "persist validated accepted Flow results before building handoff")
    require(not br_summary["pending_br_ids"] and not flow_summary["pending_flows"],
            "accepted Audit results still contain not_evaluable targets")
    ordered_flows = flow_baseline.get("ordered_flow_ids")
    require(isinstance(ordered_flows, list), "flow baseline inventory is missing")
    defects = validate_defects(run, ordered_flow_ids=ordered_flows)
    incorrect_br_ids = {row["br_id"] for row in br_summary["requirements"]
                        if row["status"] == "incorrect"}
    incorrect_flow_ids = {row["flow_id"] for row in flow_summary["flows"]
                          if row["status"] == "incorrect"}
    selected = [row for row in defects if row["status"] == "open" and (
        row["category"] in {"technical", "ui"}
        or bool(set(row["affected_br_ids"]) & incorrect_br_ids)
        or bool(set(row["affected_flow_ids"]) & incorrect_flow_ids)
    )]
    enrichments = enrichment_by_id(payload)
    require(set(enrichments) == {row["defect_id"] for row in selected},
            "Audit enrichment must describe every selected repairable defect exactly once")
    br_text = br_path.read_text(encoding="utf-8-sig")
    flow_text = flow_path.read_text(encoding="utf-8-sig")
    built = [build_defect(row, enrichments[row["defect_id"]],
                          incorrect_br_ids, incorrect_flow_ids,
                          br_text, flow_text, api_contracts)
             for row in selected]
    source_revision = br_summary["source_revision"]
    require(HASH.fullmatch(str(source_revision)), "accepted source revision is invalid")
    accepted = {
        "business_rules": [{"br_id": row["br_id"], "status": row["status"]}
                           for row in br_summary["requirements"]],
        "flows": [{"flow_id": row["flow_id"], "status": row["status"]}
                  for row in flow_summary["flows"]],
        "execution_blocked": bool(flow_summary.get("execution_blocked")),
    }
    handoff = {
        "schema_version": 2,
        "artifact_type": "defects-handoff",
        "uc_id": run["uc_id"],
        "run_id": run["run_id"],
        "source_revision": source_revision,
        "canonical_defects_sha256": canonical_hash(run["defects"]),
        "accepted_results_sha256": canonical_hash(accepted),
        "status": "ready" if built else "no_repair_required",
        "defects": built,
    }
    validate_handoff(handoff, run["uc_id"], run["run_id"])
    expected = writable(folder / "defects-handoff.json")
    target = writable(output) if output is not None else expected
    require(target == expected, "defects handoff must use the active run's canonical path")
    return handoff, target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True)
    parser.add_argument("--output")
    parser.add_argument("--input", help="Use '-' for Audit enrichment supplied through stdin")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    run_path = writable(args.run_json)
    payload = read_payload(args.input)
    _, _, folder = context(run_path)
    with run_lock(folder):
        handoff, target = build(run_path, args.output, payload)
        if not args.dry_run:
            atomic_write(target, handoff)
            persisted = read_json(target)
            require(persisted == handoff, "persisted handoff differs from validated value")
            validate_handoff(persisted, handoff["uc_id"], handoff["run_id"])
    print(json.dumps({
        "status": "valid" if args.dry_run else "written",
        "artifact": target.relative_to(ROOT).as_posix(),
        "handoff_status": handoff["status"],
        "defect_count": len(handoff["defects"]),
        "sha256": artifact_hash(handoff),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, UnicodeError, json.JSONDecodeError, ValueError, TypeError, KeyError) as exc:
        raise SystemExit(f"defects handoff error: {exc}") from exc
