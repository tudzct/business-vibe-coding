#!/usr/bin/env python3
"""Validate a Defects Handoff and its AI-authored sub-prompts."""

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
FRONTMATTER_FIELDS = {
    "artifact_type", "uc_id", "run_id", "repair_index", "defect_id",
    "defect_fingerprint", "source_revision",
}
REQUIRED_HEADINGS = ("Evidence", "Required correction", "Scope", "Completion")
COMPLETION = (
    "Report changed files, verification evidence, and the reassessment of every "
    "affected target. Preserve first-pass evidence without overwriting it."
)
PLACEHOLDERS = (
    "<UC-ID>", "<RUN-ID>", "<N>", "<DEFECT-ID>",
    "<64 lowercase hex characters>", "<bounded defect>", "<defect category>",
    "<complete defect description>", "<ordered steps required to reproduce the defect>",
    "<repository-relative source or evidence path>", "<start>", "<end>",
    "<exact locator>", "<exact evidence-backed finding>",
    "<relevant source/build/runtime content>",
    "<expected correct behavior after the defect is repaired>",
    "<affected files from the handoff, or None>",
    "<BR IDs, Flow IDs/steps, UI targets, technical targets, or None>",
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def nonempty(value, label):
    require(isinstance(value, str) and value.strip(), f"{label} must be non-empty")
    return value.strip()


def normalized(value):
    return value.replace("\r\n", "\n").replace("\r", "\n").strip()


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


def validate_handoff(value, path=None):
    require(isinstance(value, dict) and set(value) == ROOT_FIELDS,
            "handoff root fields mismatch")
    require(value.get("schema_version") == 2
            and value.get("artifact_type") == "defects-handoff",
            "handoff schema/type mismatch")
    uc_id = nonempty(value.get("uc_id"), "handoff.uc_id")
    run_id = nonempty(value.get("run_id"), "handoff.run_id")
    require(SAFE_ID.fullmatch(uc_id) and SAFE_ID.fullmatch(run_id),
            "handoff identity is unsafe")
    if path is not None:
        expected = (ROOT / "docs/02-construction/implementation" / uc_id / "runs" /
                    run_id / "defects-handoff.json").resolve()
        require(path.resolve() == expected,
                "handoff path does not match its UC/run identity")
    require(HASH.fullmatch(str(value.get("source_revision"))),
            "handoff source revision is invalid")
    require(HASH.fullmatch(str(value.get("canonical_defects_sha256")))
            and HASH.fullmatch(str(value.get("accepted_results_sha256"))),
            "handoff checksums are invalid")
    defects = value.get("defects")
    require(isinstance(defects, list), "handoff defects must be an array")
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


def load_handoff(path):
    path = writable(path)
    require(path.is_file(), "defects handoff does not exist")
    value = json.loads(path.read_text(encoding="utf-8-sig"))
    return path, validate_handoff(value, path)


def scalar(value):
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] == '"':
        return json.loads(value)
    if len(value) >= 2 and value[0] == value[-1] == "'":
        return value[1:-1]
    return value


def section(body, heading, path):
    match = re.search(rf"(?ms)^## {re.escape(heading)}\s*$\n(.*?)(?=^## |\Z)", body)
    require(match is not None, f"{path}: missing {heading} section")
    value = match.group(1).strip()
    require(value, f"{path}: empty {heading} section")
    return value


def ordered_unique(values):
    return list(dict.fromkeys(values))


def parse_prompt(path):
    text = path.read_text(encoding="utf-8-sig")
    require(not any(token in text for token in PLACEHOLDERS),
            f"{path}: unresolved template placeholder")
    lines = text.splitlines()
    require(lines and lines[0].strip() == "---", f"{path}: missing frontmatter start")
    try:
        end = next(index for index in range(1, len(lines)) if lines[index].strip() == "---")
    except StopIteration as exc:
        raise ValueError(f"{path}: missing frontmatter end") from exc
    fields = {}
    for line in lines[1:end]:
        if not line.strip():
            continue
        require(":" in line, f"{path}: invalid frontmatter line: {line}")
        key, value = line.split(":", 1)
        key = key.strip()
        require(key not in fields, f"{path}: duplicate frontmatter field {key}")
        fields[key] = scalar(value)
    require(set(fields) == FRONTMATTER_FIELDS, f"{path}: frontmatter fields mismatch")
    require(fields["artifact_type"] == "bug-fixing-sub-prompt",
            f"{path}: invalid artifact_type")
    body = "\n".join(lines[end + 1:])
    sections = {heading: section(body, heading, path) for heading in REQUIRED_HEADINGS}
    scope = sections["Scope"]
    step_ids = ordered_unique(re.findall(r"\b(?:BF|AF|EF)-\d+\.[0-9]+[a-z]?\b", scope))
    flow_ids = ordered_unique(re.findall(r"\b(?:BF|AF|EF)-\d+\b", scope))
    arrays = {
        "affected_br_ids": ordered_unique(re.findall(r"\bBR-[A-Z0-9][A-Z0-9-]*-\d+\b", scope)),
        "affected_flow_ids": flow_ids,
        "affected_flow_step_ids": step_ids,
        "affected_api_ids": ordered_unique(re.findall(r"\bAPI-[A-Z0-9]+(?:-[A-Z0-9]+)*\b", scope)),
    }
    return fields, arrays, sections


def require_value(section_text, value, message):
    require(normalized(str(value)) in normalized(section_text), message)


def authoritative_blocks(value):
    return [normalized(match.group(2)) for match in
            re.finditer(r"(?ms)```([A-Za-z0-9_-]*)[ \t]*\n(.*?)\n```", value)]


def expected_behavior(value):
    marker = "Required observable behavior after repair:"
    if marker not in value:
        return normalized(value)
    return normalized(value.split(marker, 1)[1])


def validate_prompt(path, index, handoff, defect):
    fields, arrays, sections = parse_prompt(path)
    defect_id = defect["defect_id"]
    require(path.name == f"repair-{index:03d}-{defect_id}.md", f"{path}: filename mismatch")
    expected_fields = {
        "artifact_type": "bug-fixing-sub-prompt",
        "uc_id": handoff["uc_id"],
        "run_id": handoff["run_id"],
        "repair_index": str(index),
        "defect_id": defect_id,
        "defect_fingerprint": defect["fingerprint"],
        "source_revision": handoff["source_revision"],
    }
    require(fields == expected_fields, f"{path}: frontmatter differs from the Handoff")
    full_text = path.read_text(encoding="utf-8-sig")
    require(re.search(rf"(?m)^# Repair {index}\s+(?:—|-)\s+.*{re.escape(defect['title'])}.*$",
                      full_text), f"{path}: bounded defect title is missing")
    evidence_section = sections["Evidence"]
    require_value(evidence_section, defect["category"],
                  f"{path}: Evidence category is missing")
    require(re.search(r"(?m)^- Description:\s*\S", evidence_section),
            f"{path}: generated Description is missing")
    for step in defect["reproduction_steps"]:
        require_value(evidence_section, step,
                      f"{path}: reproduction step is missing: {step}")
    for evidence_index, item in enumerate(defect["evidence"], 1):
        line_text = "N/A" if item["line_start"] is None else f"{item['line_start']}-{item['line_end']}"
        for label, value in (("source file", item["source_file"]),
                             ("line range", line_text),
                             ("locator", item["locator"]),
                             ("defect finding", item["defect_finding"]),
                             ("content", item["content"])):
            require_value(evidence_section, value,
                          f"{path}: Evidence {evidence_index} {label} is missing or changed")
    correction_section = sections["Required correction"]
    require(expected_behavior(defect["required_correction"]) in normalized(correction_section),
            f"{path}: required observable behavior is missing or changed")
    for block in authoritative_blocks(defect["required_correction"]):
        require(block in normalized(correction_section),
                f"{path}: authoritative correction content is missing or changed")
    scope = defect["scope"]
    scope_section = sections["Scope"]
    for field in ("affected_br_ids", "affected_flow_ids", "affected_flow_step_ids",
                  "affected_api_ids", "affected_ui_targets", "affected_files"):
        for value in scope[field]:
            require_value(scope_section, value, f"{path}: Scope omits {field} value {value}")
    if not any(scope.values()):
        require("None" in scope_section, f"{path}: empty Scope must be recorded as None")
    require(normalized(sections["Completion"]) == COMPLETION,
            f"{path}: Completion contract mismatch")
    require(set(arrays["affected_br_ids"]) == set(scope["affected_br_ids"]),
            f"{path}: Scope BR inventory mismatch")
    require(set(arrays["affected_flow_ids"]) == set(scope["affected_flow_ids"]),
            f"{path}: Scope Flow inventory mismatch")
    require(set(arrays["affected_flow_step_ids"]) == set(scope["affected_flow_step_ids"]),
            f"{path}: Scope Flow-step inventory mismatch")
    require(set(arrays["affected_api_ids"]) == set(scope["affected_api_ids"]),
            f"{path}: Scope API inventory mismatch")


def validate(handoff_path, prompt_dir):
    _, handoff = load_handoff(handoff_path)
    require(handoff["status"] == "ready" and handoff["defects"],
            "no repair prompts are required by this handoff")
    prompt_dir = writable(prompt_dir)
    expected_dir = (ROOT / "docs/02-construction/implementation" / handoff["uc_id"] /
                    "runs" / handoff["run_id"] / "repairs").resolve()
    require(prompt_dir == expected_dir,
            "prompt directory does not match the Handoff identity")
    files = sorted(prompt_dir.glob("repair-*.md")) if prompt_dir.is_dir() else []
    require(len(files) == len(handoff["defects"]),
            f"expected {len(handoff['defects'])} repair prompts, found {len(files)}")
    for index, (path, defect) in enumerate(zip(files, handoff["defects"]), 1):
        validate_prompt(path, index, handoff, defect)
    return {
        "uc_id": handoff["uc_id"],
        "run_id": handoff["run_id"],
        "prompt_count": len(files),
        "prompt_paths": [path.relative_to(ROOT).as_posix() for path in files],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--handoff", required=True, type=Path)
    parser.add_argument("--prompt-dir", type=Path)
    parser.add_argument("--check-handoff-only", action="store_true")
    args = parser.parse_args()
    if args.check_handoff_only:
        path, handoff = load_handoff(args.handoff.resolve())
        result = {
            "handoff": path.relative_to(ROOT).as_posix(),
            "uc_id": handoff["uc_id"],
            "run_id": handoff["run_id"],
            "status": handoff["status"],
            "defect_count": len(handoff["defects"]),
        }
    else:
        require(args.prompt_dir is not None,
                "--prompt-dir is required unless --check-handoff-only is used")
        result = validate(args.handoff.resolve(), args.prompt_dir.resolve())
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise SystemExit(f"sub-prompt validation error: {exc}") from exc
