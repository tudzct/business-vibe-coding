#!/usr/bin/env python3
"""Validate a defects handoff and its one-prompt-per-defect Markdown set."""

import argparse
import json
import re
import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts"))
from metrics_contract import ROOT, writable


HASH = re.compile(r"sha256:[0-9a-f]{64}\Z")
SAFE_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]*\Z")
BR_ID = re.compile(r"BR-[A-Z0-9][A-Z0-9-]*-\d+\Z")
FLOW_ID = re.compile(r"(?:BF|AF|EF)-\d+\Z")
FLOW_STEP_ID = re.compile(r"((?:BF|AF|EF)-\d+)\.[0-9]+[a-z]?\Z")
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
REQUIRED_SCALARS = (
    "artifact_type", "uc_id", "run_id", "repair_index",
)
REQUIRED_ARRAYS = (
    "affected_br_ids",
)
REQUIRED_HEADINGS = ("Evidence", "Required correction", "Scope", "Completion")
CORRECTION_INSTRUCTION = (
    "Apply the smallest change that corrects this defect while preserving Prompts A-F "
    "and unrelated behavior."
)
PROHIBITED = (
    "new features, speculative refactors, schema/public-API/ownership decisions without "
    "researcher approval, and all test creation/execution."
)
PLACEHOLDERS = (
    "<UC-ID>", "<RUN-ID>", "<N>", "<BR-ID>", "<bounded defect>",
    "<exact source/build/runtime evidence>", "<paths>", "<BR IDs>",
    "<lint/typecheck/build/runtime observation>",
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def nonempty(value, label):
    require(isinstance(value, str) and value.strip(), f"{label} must be non-empty")
    return value


def normalized(value):
    return value.replace("\r\n", "\n").replace("\r", "\n").strip("\n")


def safe_relative(value, label):
    value = nonempty(value, label).replace("\\", "/")
    path = Path(value)
    require(not path.is_absolute() and ".." not in path.parts, f"{label} must be repository-relative")
    return value


def unique_strings(value, pattern, label):
    require(isinstance(value, list) and len(value) == len(set(value)), f"{label} is invalid")
    require(all(isinstance(item, str) and pattern.fullmatch(item) for item in value),
            f"{label} is invalid")
    return value


def validate_handoff(value, path=None):
    require(isinstance(value, dict) and set(value) == ROOT_FIELDS, "handoff root fields mismatch")
    require(value["schema_version"] == 1 and value["artifact_type"] == "defects-handoff",
            "handoff schema/type mismatch")
    uc_id = nonempty(value.get("uc_id"), "handoff.uc_id")
    run_id = nonempty(value.get("run_id"), "handoff.run_id")
    require(SAFE_ID.fullmatch(uc_id) and SAFE_ID.fullmatch(run_id), "handoff identity is unsafe")
    if path is not None:
        expected = (ROOT / "docs/02-construction/implementation" / uc_id / "runs" /
                    run_id / "defects-handoff.json").resolve()
        require(path.resolve() == expected, "handoff path does not match its UC/run identity")
    require(HASH.fullmatch(str(value.get("source_revision"))), "handoff source revision is invalid")
    require(HASH.fullmatch(str(value.get("canonical_defects_sha256"))) and
            HASH.fullmatch(str(value.get("accepted_results_sha256"))),
            "handoff checksums are invalid")
    defects = value.get("defects")
    require(isinstance(defects, list) and value.get("defect_count") == len(defects),
            "handoff defect_count mismatch")
    require(value.get("status") == ("ready" if defects else "no_repair_required"),
            "handoff status does not match its defects")
    seen = set()
    for index, defect in enumerate(defects):
        label = f"handoff.defects[{index}]"
        require(isinstance(defect, dict) and set(defect) == DEFECT_FIELDS,
                f"{label} fields mismatch")
        defect_id = nonempty(defect.get("defect_id"), f"{label}.defect_id")
        require(SAFE_ID.fullmatch(defect_id) and defect_id not in seen,
                f"{label}.defect_id is invalid or duplicated")
        seen.add(defect_id)
        require(HASH.fullmatch(str(defect.get("fingerprint"))) and
                HASH.fullmatch(str(defect.get("source_revision"))), f"{label} hashes are invalid")
        require(defect.get("stage") in {"initial", "final"} and
                defect.get("category") in {"technical", "business_rule", "flow"} and
                defect.get("status") == "open" and type(defect.get("blocks_execution")) is bool,
                f"{label} classification is invalid")
        nonempty(defect.get("trigger"), f"{label}.trigger")
        nonempty(defect.get("description"), f"{label}.description")
        unique_strings(defect.get("affected_br_ids"), BR_ID, f"{label}.affected_br_ids")
        flow_ids = unique_strings(defect.get("affected_flow_ids"), FLOW_ID,
                                  f"{label}.affected_flow_ids")
        step_ids = unique_strings(defect.get("affected_flow_step_ids"), FLOW_STEP_ID,
                                  f"{label}.affected_flow_step_ids")
        step_parents = {FLOW_STEP_ID.fullmatch(item).group(1) for item in step_ids}
        require(step_parents <= set(flow_ids),
                f"{label} contains a Flow step without its parent")
        if defect["category"] == "flow":
            require(flow_ids and step_parents == set(flow_ids),
                    f"{label} must identify at least one exact step for every affected Flow")
        elif defect["category"] == "technical" and flow_ids and not defect["blocks_execution"]:
            require(step_parents == set(flow_ids),
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
            safe_relative(item.get("original_path"), f"{evidence_label}.original_path")
            safe_relative(item.get("source_file"), f"{evidence_label}.source_file")
            require(HASH.fullmatch(str(item.get("sha256"))) and
                    HASH.fullmatch(str(item.get("source_revision"))),
                    f"{evidence_label} hashes are invalid")
            require(item.get("kind") in {"text", "json", "image", "binary"},
                    f"{evidence_label}.kind is invalid")
            for field in ("media_type", "locator", "observed_fact", "defect_finding"):
                nonempty(item.get(field), f"{evidence_label}.{field}")
            start, end = item.get("line_start"), item.get("line_end")
            require((start is None and end is None) or
                    (type(start) is int and type(end) is int and 1 <= start <= end),
                    f"{evidence_label} line range is invalid")
        correction = defect.get("required_correction")
        require(isinstance(correction, dict) and set(correction) == CORRECTION_FIELDS,
                f"{label}.required_correction fields mismatch")
        require(correction.get("mode") in {"verbatim_authoritative", "evidence_derived"},
                f"{label}.required_correction.mode is invalid")
        nonempty(correction.get("representation"), f"{label}.required_correction.representation")
        nonempty(correction.get("text"), f"{label}.required_correction.text")
        definitions = correction.get("supporting_definitions")
        require(isinstance(definitions, list) and all(isinstance(item, str) and item.strip()
                                                      for item in definitions),
                f"{label}.required_correction.supporting_definitions is invalid")
    return value


def load_handoff(path):
    path = writable(path)
    require(path.is_file(), "defects handoff does not exist")
    return path, validate_handoff(json.loads(path.read_text(encoding="utf-8-sig")), path)


def scalar(value):
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] == '"':
        return json.loads(value)
    if len(value) >= 2 and value[0] == value[-1] == "'":
        return value[1:-1]
    return value


def parse_prompt(path):
    text = path.read_text(encoding="utf-8-sig")
    lines = text.splitlines()
    require(lines and lines[0].strip() == "---", f"{path}: missing frontmatter start")
    try:
        end = next(index for index in range(1, len(lines)) if lines[index].strip() == "---")
    except StopIteration as exc:
        raise ValueError(f"{path}: missing frontmatter end") from exc
    raw_fields = {}
    for line in lines[1:end]:
        if not line.strip():
            continue
        require(":" in line, f"{path}: invalid frontmatter line: {line}")
        key, value = line.split(":", 1)
        key = key.strip()
        require(key not in raw_fields, f"{path}: duplicate frontmatter field {key}")
        raw_fields[key] = value.strip()
    require(set(raw_fields) == set(REQUIRED_SCALARS + REQUIRED_ARRAYS),
            f"{path}: frontmatter fields mismatch")
    fields = {key: scalar(raw_fields[key]) for key in REQUIRED_SCALARS}
    require(fields["artifact_type"] == "bug-fixing-sub-prompt", f"{path}: invalid artifact_type")
    arrays = {}
    for key in REQUIRED_ARRAYS:
        try:
            arrays[key] = json.loads(raw_fields[key])
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path}: {key} must be a JSON array") from exc
        require(isinstance(arrays[key], list) and all(isinstance(item, str) for item in arrays[key]),
                f"{path}: {key} must contain only strings")
    require(not any(token in text for token in PLACEHOLDERS), f"{path}: unresolved template placeholder")
    body = "\n".join(lines[end + 1:])
    headings = tuple(re.findall(r"(?m)^##\s+(.+?)\s*$", body))
    require(headings == REQUIRED_HEADINGS, f"{path}: section headings must match template exactly")
    sections = {}
    for heading in REQUIRED_HEADINGS:
        match = re.search(rf"(?ms)^## {re.escape(heading)}\s*$\n(.*?)(?=^## |\Z)", body)
        require(match, f"{path}: missing {heading} section")
        sections[heading] = match.group(1).strip()
        require(sections[heading], f"{path}: empty {heading} section")
    return fields, arrays, sections


def expected_content(value):
    if isinstance(value, str):
        return normalized(value)
    if value is None:
        return None
    return normalized(json.dumps(value, ensure_ascii=False, indent=2))


def require_evidence(path, section, evidence):
    normalized_section = normalized(section)
    for index, item in enumerate(evidence, 1):
        for label, value in (
            ("original path", item["original_path"]),
            ("SHA-256", item["sha256"]),
            ("source revision", item["source_revision"]),
            ("source file", item["source_file"]),
            ("locator", item["locator"]),
            ("observed fact", item["observed_fact"]),
            ("defect finding", item["defect_finding"]),
        ):
            require(normalized(str(value)) in normalized_section,
                    f"{path}: evidence {index} {label} is missing or changed")
        content = expected_content(item["content"])
        if content is not None:
            require(content in normalized_section,
                    f"{path}: evidence {index} content is missing or changed")


def require_correction(path, section, correction):
    normalized_section = normalized(section)
    require(CORRECTION_INSTRUCTION in section, f"{path}: correction instruction mismatch")
    require(normalized(correction["text"]) in normalized_section,
            f"{path}: exact correction text is missing or changed")
    for definition in correction["supporting_definitions"]:
        require(normalized(definition) in normalized_section,
                f"{path}: supporting definition is missing or changed")


def validate(handoff_path, prompt_dir):
    _, handoff = load_handoff(handoff_path)
    require(handoff["status"] == "ready" and handoff["defects"],
            "no repair prompts are required by this handoff")
    prompt_dir = writable(prompt_dir)
    expected_dir = (ROOT / "docs/02-construction/implementation" / handoff["uc_id"] /
                    "runs" / handoff["run_id"] / "repairs").resolve()
    require(prompt_dir == expected_dir, "prompt directory does not match the handoff identity")
    files = sorted(prompt_dir.glob("repair-*.md")) if prompt_dir.is_dir() else []
    require(len(files) == handoff["defect_count"],
            f"expected {handoff['defect_count']} repair prompts, found {len(files)}")
    seen = set()
    for index, (path, defect) in enumerate(zip(files, handoff["defects"]), 1):
        fields, arrays, sections = parse_prompt(path)
        defect_id = defect["defect_id"]
        require(path.name == f"repair-{index:03d}-{defect_id}.md", f"{path}: filename mismatch")
        require(fields["uc_id"] == handoff["uc_id"] and fields["run_id"] == handoff["run_id"],
                f"{path}: handoff identity mismatch")
        require(fields["repair_index"] == str(index), f"{path}: repair_index mismatch")
        require(defect_id not in seen, f"{path}: duplicate defect identity")
        seen.add(defect_id)
        require(arrays["affected_br_ids"] == defect["affected_br_ids"],
                f"{path}: affected_br_ids mismatch")
        require_evidence(path, sections["Evidence"], defect["evidence"])
        require_correction(path, sections["Required correction"], defect["required_correction"])
        for affected_file in defect["affected_files"]:
            require(affected_file in sections["Scope"], f"{path}: affected file missing from Scope")
        if not defect["affected_files"]:
            require("None" in sections["Scope"], f"{path}: empty affected files must be recorded as None")
        for br_id in defect["affected_br_ids"]:
            require(br_id in sections["Scope"], f"{path}: affected BR missing from Scope")
        require(PROHIBITED in sections["Scope"], f"{path}: prohibited-change boundary mismatch")
        require(
            "Record changed files, verification evidence, time/tokens and reassessment "
            "of affected BRs. Do not overwrite first-pass evidence." in sections["Completion"],
            f"{path}: completion contract mismatch",
        )
    return {
        "uc_id": handoff["uc_id"], "run_id": handoff["run_id"],
        "prompt_count": len(files),
        "prompt_paths": [path.relative_to(ROOT).as_posix() for path in files],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--handoff", required=True, type=Path)
    parser.add_argument("--prompt-dir", type=Path)
    parser.add_argument("--check-handoff-only", action="store_true")
    args = parser.parse_args()
    if args.check_handoff_only:
        path, handoff = load_handoff(args.handoff.resolve())
        result = {
            "handoff": path.relative_to(ROOT).as_posix(), "uc_id": handoff["uc_id"],
            "run_id": handoff["run_id"], "status": handoff["status"],
            "defect_count": handoff["defect_count"],
        }
    else:
        require(args.prompt_dir is not None, "--prompt-dir is required unless --check-handoff-only is used")
        result = validate(args.handoff.resolve(), args.prompt_dir.resolve())
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise SystemExit(f"sub-prompt validation error: {exc}") from exc
