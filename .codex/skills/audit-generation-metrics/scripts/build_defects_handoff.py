#!/usr/bin/env python3
"""Build the validated, minimal handoff for accepted Audit defects."""

import argparse
import json
import mimetypes
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
BR_ID = re.compile(r"BR-[A-Z0-9][A-Z0-9-]*-\d+\Z")
FLOW_ID = re.compile(r"(?:BF|AF|EF)-\d+\Z")
FLOW_STEP_ID = re.compile(r"((?:BF|AF|EF)-\d+)\.([0-9]+[a-z]?)\Z")
ROOT_FIELDS = {
    "schema_version", "artifact_type", "uc_id", "run_id", "source_revision",
    "canonical_defects_sha256", "accepted_results_sha256", "status",
    "defect_count", "defects",
}
DEFECT_FIELDS = {
    "defect_id", "fingerprint", "stage", "source_revision", "category",
    "trigger", "description", "status", "blocks_execution", "affected_br_ids",
    "affected_flow_ids", "affected_flow_step_ids", "affected_files", "evidence",
    "required_correction",
}
EVIDENCE_FIELDS = {
    "original_path", "sha256", "source_revision", "kind", "media_type",
    "source_file", "line_start", "line_end", "locator", "content",
    "observed_fact", "defect_finding",
}
CORRECTION_FIELDS = {"mode", "representation", "text", "supporting_definitions"}
ENRICHMENT_FIELDS = {
    "defect_id", "affected_flow_step_ids", "affected_files",
    "evidence_annotations", "required_correction",
}
ANNOTATION_FIELDS = {
    "source_file", "line_start", "line_end", "locator", "observed_fact",
    "defect_finding",
}
TEXT_SUFFIXES = {
    ".txt", ".log", ".md", ".jsonl", ".yaml", ".yml", ".xml", ".html",
    ".css", ".js", ".jsx", ".ts", ".tsx", ".sql", ".dbml", ".csv",
}


def canonical_hash(value):
    return digest(json.dumps(value, ensure_ascii=False, sort_keys=True,
                             separators=(",", ":")).encode("utf-8"))


def artifact_hash(value):
    raw = (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    return digest(raw)


def nonempty(value, label):
    require(isinstance(value, str) and value.strip(), f"{label} must be nonempty")
    return value.strip()


def safe_relative(value, label):
    value = nonempty(value, label).replace("\\", "/")
    path = Path(value)
    require(not path.is_absolute() and ".." not in path.parts, f"{label} must be repository-relative")
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
    require(isinstance(payload["defects"], list), "Audit enrichment defects must be an array")
    return payload


def enrichment_by_id(payload):
    result = {}
    for index, item in enumerate(payload["defects"]):
        label = f"enrichment.defects[{index}]"
        require(isinstance(item, dict) and set(item) <= ENRICHMENT_FIELDS,
                f"{label} has unsupported fields")
        identity = nonempty(item.get("defect_id"), f"{label}.defect_id")
        require(identity not in result, "duplicate enrichment defect_id")
        annotations = item.get("evidence_annotations", {})
        require(isinstance(annotations, dict), f"{label}.evidence_annotations must be an object")
        for path, annotation in annotations.items():
            safe_relative(path, f"{label}.evidence_annotations path")
            require(isinstance(annotation, dict) and set(annotation) <= ANNOTATION_FIELDS,
                    f"{label} has invalid evidence annotation")
        result[identity] = item
    return result


def configuration_for(run):
    reference = run.get("experiment_configuration")
    require(isinstance(reference, dict), "canonical experiment_configuration is required")
    relative = safe_relative(reference.get("artifact"), "experiment_configuration.artifact")
    path = writable(ROOT / relative)
    require(path.is_file(), "pinned experiment configuration is missing")
    raw = path.read_bytes()
    require(reference.get("checksum") == digest(raw), "pinned experiment configuration checksum changed")
    configuration = validate_configuration(path)
    require(configuration.get("configuration_id") == reference.get("configuration_id"),
            "configuration identity mismatch")
    require(configuration["use_case"]["uc_id"] == run.get("uc_id"), "configuration UC mismatch")
    assignments = [row for row in configuration["runs"] if row.get("run_id") == run.get("run_id")]
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
    require(br_path.is_file() and digest(br_path.read_bytes()) == br_baseline.get("business_rule_sha256"),
            "business-rule specification checksum changed")
    require(flow_path.is_file() and digest(flow_path.read_bytes()) == flow_baseline.get("use_case_sha256"),
            "frozen UC checksum changed")
    return br_baseline, flow_baseline, br_path, flow_path


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
    pattern = re.compile(r"(?m)^(BR-[A-Z0-9][A-Z0-9-]*-\d+)(?=[ \t]*(?::|-)[ \t]+\S)")
    matches = list(pattern.finditer(rules))
    require(matches, "business-rule specification contains no rule blocks")
    blocks = {}
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(rules)
        blocks[match.group(1)] = rules[match.start():end].strip()
    utilities = unwrapped(heading_section(text, "OCL Utility Definitions"))
    return blocks, utilities


def correction_representation(text):
    if re.search(r"(?m)^\s*inv(?:\s|:)", text):
        return "OCL invariant"
    if re.search(r"(?m)^\s*pre(?:\s|:)", text):
        return "OCL precondition"
    if re.search(r"(?m)^\s*post(?:\s|:)", text):
        return "OCL postcondition"
    return "natural language"


def referenced_utilities(rule_text, utilities):
    if not utilities:
        return []
    starts = list(re.finditer(r"(?m)^(?:[A-Za-z_][A-Za-z0-9_]*\.)?([A-Za-z_][A-Za-z0-9_]*)\s*\([^\r\n]*\)\s*:", utilities))
    selected = []
    for index, match in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else len(utilities)
        block = utilities[match.start():end].strip()
        name = match.group(1)
        if re.search(rf"(?:\.|\b){re.escape(name)}\s*\(", rule_text):
            selected.append(block)
    return selected


def br_correction(ids, specification):
    blocks, utilities = br_blocks(specification)
    require(ids and all(identity in blocks for identity in ids), "affected BR is absent from frozen specification")
    text = "\n\n".join(blocks[identity] for identity in ids)
    return {
        "mode": "verbatim_authoritative",
        "representation": correction_representation(text),
        "text": text,
        "supporting_definitions": referenced_utilities(text, utilities),
    }


def flow_sections(text):
    result = {}
    basic = heading_section(text, "Basic Flow")
    flow_match = re.search(r"(?m)^Flow ID:\s*(BF-\d+)\s*$", basic)
    require(flow_match is not None, "Basic Flow ID is missing")
    basic_body = basic[flow_match.end():].strip()
    result[flow_match.group(1)] = basic_body
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
    """Return canonical step IDs and verbatim source lines in source order."""
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


def flow_correction(ids, step_ids, specification):
    sections = flow_sections(specification)
    require(ids and all(identity in sections for identity in ids), "affected Flow is absent from frozen UC")
    require(step_ids, "a Flow defect must identify at least one exact affected Flow step")
    requested = set(step_ids)
    step_parents = set()
    for step_id in step_ids:
        match = FLOW_STEP_ID.fullmatch(step_id)
        require(match is not None and match.group(1) in ids, "affected Flow step has no affected parent")
        step_parents.add(match.group(1))
    require(step_parents == set(ids), "each affected Flow must identify at least one exact affected step")
    available = {}
    for identity in ids:
        available.update(flow_step_lines(identity, sections[identity]))
    missing = requested - set(available)
    require(not missing, f"affected Flow step is absent from frozen UC: {sorted(missing)}")
    selected = [line for identity, line in available.items() if identity in requested]
    return {
        "mode": "verbatim_authoritative",
        "representation": "flow step",
        "text": "\n\n".join(selected),
        "supporting_definitions": [],
    }


def validate_correction(value, label, mode=None):
    require(isinstance(value, dict) and set(value) == CORRECTION_FIELDS,
            f"{label} fields mismatch")
    require(value.get("mode") in {"verbatim_authoritative", "evidence_derived"},
            f"{label}.mode is invalid")
    if mode is not None:
        require(value["mode"] == mode, f"{label}.mode must be {mode}")
    nonempty(value.get("representation"), f"{label}.representation")
    nonempty(value.get("text"), f"{label}.text")
    definitions = value.get("supporting_definitions")
    require(isinstance(definitions, list) and all(isinstance(item, str) and item.strip()
                                                  for item in definitions),
            f"{label}.supporting_definitions is invalid")
    return value


def evidence_kind(path, media_type):
    if path.suffix.lower() == ".json":
        return "json"
    if media_type.startswith("image/"):
        return "image"
    if media_type.startswith("text/") or path.suffix.lower() in TEXT_SUFFIXES:
        return "text"
    return "binary"


def enriched_evidence(reference, annotation, defect):
    relative = safe_relative(reference.get("path"), "evidence.path")
    path = writable(ROOT / relative)
    raw = path.read_bytes()
    require(reference.get("sha256") == digest(raw), f"changed evidence: {relative}")
    annotation = annotation or {}
    start, end = annotation.get("line_start"), annotation.get("line_end")
    require((start is None and end is None) or
            (type(start) is int and type(end) is int and 1 <= start <= end),
            f"invalid evidence line bounds: {relative}")
    media_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    kind = evidence_kind(path, media_type)
    content = None
    if kind in {"text", "json"}:
        decoded = raw.decode("utf-8-sig")
        if start is not None:
            lines = decoded.splitlines()
            require(end <= len(lines), f"evidence line bounds exceed file: {relative}")
            decoded = "\n".join(lines[start - 1:end])
        if kind == "json" and start is None:
            content = json.loads(decoded)
        else:
            content = decoded
    source_file = safe_relative(annotation.get("source_file", relative), "evidence.source_file")
    locator = annotation.get("locator") or (f"lines {start}-{end}" if start is not None else relative)
    observed = annotation.get("observed_fact") or defect["trigger"]
    finding = annotation.get("defect_finding") or defect["description"]
    return {
        "original_path": relative,
        "sha256": reference["sha256"],
        "source_revision": reference["source_revision"],
        "kind": kind,
        "media_type": media_type,
        "source_file": source_file,
        "line_start": start,
        "line_end": end,
        "locator": nonempty(locator, "evidence.locator"),
        "content": content,
        "observed_fact": nonempty(observed, "evidence.observed_fact"),
        "defect_finding": nonempty(finding, "evidence.defect_finding"),
    }


def build_defect(defect, enrichment, unmet, incorrect, br_text, flow_text):
    category = defect["category"]
    affected_br_ids = list(defect["affected_br_ids"])
    affected_flow_ids = list(defect["affected_flow_ids"])
    if category == "business_rule":
        affected_br_ids = [identity for identity in affected_br_ids if identity in unmet]
    elif category == "flow":
        affected_flow_ids = [identity for identity in affected_flow_ids if identity in incorrect]
    steps = enrichment.get("affected_flow_step_ids", [])
    require(isinstance(steps, list) and len(steps) == len(set(steps))
            and all(isinstance(item, str) and FLOW_STEP_ID.fullmatch(item) for item in steps),
            f"{defect['defect_id']} affected_flow_step_ids is invalid")
    step_parents = {FLOW_STEP_ID.fullmatch(item).group(1) for item in steps}
    require(step_parents <= set(affected_flow_ids),
            f"{defect['defect_id']} affected Flow step has no affected parent")
    if category == "flow":
        require(affected_flow_ids and step_parents == set(affected_flow_ids),
                f"{defect['defect_id']} must identify at least one exact step for every affected Flow")
    elif category == "technical" and affected_flow_ids and not defect["blocks_execution"]:
        require(step_parents == set(affected_flow_ids),
                f"{defect['defect_id']} must identify exact steps for every affected Flow")
    files = enrichment.get("affected_files", [])
    require(isinstance(files, list) and len(files) == len(set(files)),
            f"{defect['defect_id']} affected_files is invalid")
    files = [safe_relative(item, f"{defect['defect_id']} affected_files") for item in files]
    annotations = enrichment.get("evidence_annotations", {})
    known_paths = {item["path"] for item in defect["evidence"]}
    require(set(annotations) <= known_paths, f"{defect['defect_id']} annotates unknown evidence")
    evidence = [enriched_evidence(item, annotations.get(item["path"]), defect)
                for item in defect["evidence"]]
    for path, annotation in annotations.items():
        source_file = annotation.get("source_file")
        if source_file:
            source_file = safe_relative(source_file, f"{defect['defect_id']} evidence source_file")
            if source_file not in files:
                files.append(source_file)
    if category == "business_rule":
        require("required_correction" not in enrichment,
                f"{defect['defect_id']} BR correction is derived from the frozen specification")
        correction = br_correction(affected_br_ids, br_text)
    elif category == "flow":
        require("required_correction" not in enrichment,
                f"{defect['defect_id']} Flow correction is derived from the frozen UC")
        correction = flow_correction(affected_flow_ids, steps, flow_text)
    else:
        correction = validate_correction(enrichment.get("required_correction"),
                                         f"{defect['defect_id']}.required_correction",
                                         "evidence_derived")
    return {
        "defect_id": defect["defect_id"],
        "fingerprint": defect["fingerprint"],
        "stage": defect["stage"],
        "source_revision": defect["source_revision"],
        "category": category,
        "trigger": defect["trigger"],
        "description": defect["description"],
        "status": "open",
        "blocks_execution": defect["blocks_execution"],
        "affected_br_ids": affected_br_ids,
        "affected_flow_ids": affected_flow_ids,
        "affected_flow_step_ids": steps,
        "affected_files": files,
        "evidence": evidence,
        "required_correction": correction,
    }


def validate_handoff(value, expected_uc=None, expected_run=None):
    require(isinstance(value, dict) and set(value) == ROOT_FIELDS, "handoff root fields mismatch")
    require(value.get("schema_version") == 1 and value.get("artifact_type") == "defects-handoff",
            "handoff schema/type mismatch")
    if expected_uc is not None:
        require(value.get("uc_id") == expected_uc and value.get("run_id") == expected_run,
                "handoff identity mismatch")
    require(HASH.fullmatch(str(value.get("source_revision"))) is not None,
            "handoff source_revision is invalid")
    require(HASH.fullmatch(str(value.get("canonical_defects_sha256"))) is not None
            and HASH.fullmatch(str(value.get("accepted_results_sha256"))) is not None,
            "handoff checksum is invalid")
    defects = value.get("defects")
    require(isinstance(defects, list) and value.get("defect_count") == len(defects),
            "handoff defect_count mismatch")
    require(value.get("status") == ("ready" if defects else "no_repair_required"),
            "handoff status does not match defects")
    ids = set()
    for index, defect in enumerate(defects):
        label = f"handoff.defects[{index}]"
        require(isinstance(defect, dict) and set(defect) == DEFECT_FIELDS,
                f"{label} fields mismatch")
        identity = nonempty(defect.get("defect_id"), f"{label}.defect_id")
        require(identity not in ids, "handoff contains duplicate defect IDs")
        ids.add(identity)
        require(HASH.fullmatch(str(defect.get("fingerprint"))) is not None
                and HASH.fullmatch(str(defect.get("source_revision"))) is not None,
                f"{label} hashes are invalid")
        require(defect.get("stage") in {"initial", "final"}
                and defect.get("category") in {"business_rule", "flow", "technical"}
                and defect.get("status") == "open" and type(defect.get("blocks_execution")) is bool,
                f"{label} classification is invalid")
        nonempty(defect.get("trigger"), f"{label}.trigger")
        nonempty(defect.get("description"), f"{label}.description")
        for field, pattern in (("affected_br_ids", BR_ID), ("affected_flow_ids", FLOW_ID),
                               ("affected_flow_step_ids", FLOW_STEP_ID)):
            rows = defect.get(field)
            require(isinstance(rows, list) and len(rows) == len(set(rows))
                    and all(pattern.fullmatch(str(item)) for item in rows),
                    f"{label}.{field} is invalid")
        flow_ids = set(defect["affected_flow_ids"])
        step_parents = {FLOW_STEP_ID.fullmatch(item).group(1)
                        for item in defect["affected_flow_step_ids"]}
        require(step_parents <= flow_ids, f"{label} contains a Flow step without its parent Flow")
        if defect["category"] == "flow":
            require(flow_ids and step_parents == flow_ids,
                    f"{label} must identify at least one exact step for every affected Flow")
        elif defect["category"] == "technical" and flow_ids and not defect["blocks_execution"]:
            require(step_parents == flow_ids,
                    f"{label} must identify exact steps for every affected Flow")
        files = defect.get("affected_files")
        require(isinstance(files, list) and len(files) == len(set(files)),
                f"{label}.affected_files is invalid")
        for item in files:
            safe_relative(item, f"{label}.affected_files")
        evidence = defect.get("evidence")
        require(isinstance(evidence, list) and evidence, f"{label}.evidence is required")
        for evidence_index, item in enumerate(evidence):
            evidence_label = f"{label}.evidence[{evidence_index}]"
            require(isinstance(item, dict) and set(item) == EVIDENCE_FIELDS,
                    f"{evidence_label} fields mismatch")
            require(HASH.fullmatch(str(item.get("sha256"))) is not None
                    and HASH.fullmatch(str(item.get("source_revision"))) is not None,
                    f"{evidence_label} hashes are invalid")
            safe_relative(item.get("original_path"), f"{evidence_label}.original_path")
            safe_relative(item.get("source_file"), f"{evidence_label}.source_file")
            require(item.get("kind") in {"text", "json", "image", "binary"},
                    f"{evidence_label}.kind is invalid")
            nonempty(item.get("media_type"), f"{evidence_label}.media_type")
            nonempty(item.get("locator"), f"{evidence_label}.locator")
            nonempty(item.get("observed_fact"), f"{evidence_label}.observed_fact")
            nonempty(item.get("defect_finding"), f"{evidence_label}.defect_finding")
        validate_correction(defect.get("required_correction"), f"{label}.required_correction")
    return value


def build(run_path, output, payload):
    _, run, folder = context(run_path)
    require(not run.get("repairs") and run.get("repair_rounds_completed", 0) == 0,
            "defects handoff is frozen once correction activity starts")
    require(run.get("repair_prompt_directory") in (None, "")
            and run.get("all_sub_prompt_count", 0) == 0,
            "defects handoff must be built before a later operation consumes Audit results")
    configuration = configuration_for(run)
    br_baseline, flow_baseline, br_path, flow_path = frozen_sources(configuration)
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
    unmet = {row["br_id"] for row in br_summary["requirements"] if row["status"] == "unmet"}
    incorrect = {row["flow_id"] for row in flow_summary["flows"] if row["status"] == "incorrect"}
    selected = [row for row in defects if row["status"] == "open" and (
        row["category"] == "technical"
        or (row["category"] == "business_rule" and set(row["affected_br_ids"]) & unmet)
        or (row["category"] == "flow" and set(row["affected_flow_ids"]) & incorrect)
    )]
    enrichments = enrichment_by_id(payload)
    selected_ids = {row["defect_id"] for row in selected}
    require(set(enrichments) <= selected_ids, "enrichment references a non-repairable defect")
    br_text = br_path.read_text(encoding="utf-8-sig")
    flow_text = flow_path.read_text(encoding="utf-8-sig")
    built = [build_defect(row, enrichments.get(row["defect_id"], {}), unmet, incorrect,
                          br_text, flow_text) for row in selected]
    source_revision = br_summary["source_revision"]
    require(HASH.fullmatch(str(source_revision)) is not None, "accepted source revision is invalid")
    accepted = {
        "business_rules": [{"br_id": row["br_id"], "status": row["status"]}
                           for row in br_summary["requirements"]],
        "flows": [{"flow_id": row["flow_id"], "status": row["status"]}
                  for row in flow_summary["flows"]],
        "execution_blocked": bool(flow_summary.get("execution_blocked")),
    }
    handoff = {
        "schema_version": 1,
        "artifact_type": "defects-handoff",
        "uc_id": run["uc_id"],
        "run_id": run["run_id"],
        "source_revision": source_revision,
        "canonical_defects_sha256": canonical_hash(run["defects"]),
        "accepted_results_sha256": canonical_hash(accepted),
        "status": "ready" if built else "no_repair_required",
        "defect_count": len(built),
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
        "defect_count": handoff["defect_count"],
        "sha256": artifact_hash(handoff),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, UnicodeError, json.JSONDecodeError, ValueError, TypeError, KeyError) as exc:
        raise SystemExit(f"defects handoff error: {exc}")
