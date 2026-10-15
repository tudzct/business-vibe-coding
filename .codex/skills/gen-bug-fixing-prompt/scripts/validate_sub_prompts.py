#!/usr/bin/env python3
"""Validate the complete one-prompt-per-initial-defect handoff."""

import argparse
import json
import re
import sys
from pathlib import Path


MEASURE_SCRIPTS = Path(__file__).resolve().parents[2] / "measure-uc-workflow" / "scripts"
sys.path.insert(0, str(MEASURE_SCRIPTS))

from metrics_contract import ROOT, atomic_write, context, read_json, run_lock, writable


REQUIRED_SCALARS = (
    "artifact_type",
    "uc_id",
    "run_id",
    "repair_index",
    "defect_id",
    "defect_fingerprint",
    "category",
    "trigger",
    "source_revision",
)
REQUIRED_ARRAYS = ("affected_br_ids", "affected_flow_ids")
REQUIRED_HEADINGS = ("Evidence", "Required correction", "Scope", "Completion")
TEMPLATE_PLACEHOLDERS = (
    "<UC-ID>",
    "<RUN-ID>",
    "<N>",
    "<DEFECT-ID>",
    "sha256:<64 lowercase hex characters>",
    "<technical|business_rule|flow>",
    "<TRIGGER>",
    "<BR-ID>",
    "<FLOW-ID>",
    "<bounded defect>",
    "<evidence path>",
    "sha256:<checksum>",
    "<exact observed source/build/runtime fact>",
    "<bounded correction instruction derived from the canonical defect and evidence>",
    "<paths>",
    "<BR IDs>",
    "<Flow IDs>",
    "<lint/typecheck/build/runtime observation>",
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


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

    fields = {}
    for line in lines[1:end]:
        if not line.strip():
            continue
        require(":" in line, f"{path}: invalid frontmatter line: {line}")
        key, value = line.split(":", 1)
        key = key.strip()
        require(key not in fields, f"{path}: duplicate frontmatter field {key}")
        fields[key] = value.strip()

    for key in REQUIRED_SCALARS + REQUIRED_ARRAYS:
        require(key in fields, f"{path}: missing {key}")
    require(fields["artifact_type"] == "bug-fixing-sub-prompt", f"{path}: invalid artifact_type")
    require(not any(token in text for token in TEMPLATE_PLACEHOLDERS),
            f"{path}: unresolved template placeholder")

    arrays = {}
    for key in REQUIRED_ARRAYS:
        try:
            arrays[key] = json.loads(fields[key])
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path}: {key} must be a JSON array") from exc
        require(isinstance(arrays[key], list) and all(isinstance(item, str) for item in arrays[key]),
                f"{path}: {key} must contain only strings")

    body = "\n".join(lines[end + 1:])
    sections = {}
    for heading in REQUIRED_HEADINGS:
        match = re.search(rf"(?ms)^## {re.escape(heading)}\s*$\n(.*?)(?=^## |\Z)", body)
        require(match, f"{path}: missing {heading} section")
        sections[heading] = match.group(1).strip()
        require(sections[heading], f"{path}: empty {heading} section")
    return {key: scalar(value) for key, value in fields.items()}, arrays, sections


def validate(run_path, prompt_dir):
    run = json.loads(run_path.read_text(encoding="utf-8-sig"))
    require(isinstance(run, dict), "canonical run must be an object")
    uc_id = run.get("uc_id")
    run_id = run.get("run_id")
    require(isinstance(uc_id, str) and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", uc_id),
            "canonical uc_id must be a safe identifier")
    require(isinstance(run_id, str) and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", run_id),
            "canonical run_id must be a safe identifier")
    expected_prompt_dir = (ROOT / "docs/02-construction/implementation" / uc_id /
                           "runs" / run_id / "repairs").resolve()
    require(prompt_dir.resolve() == expected_prompt_dir,
            "repair prompts must use the active run's canonical repairs directory")
    require(run.get("repairs") == [], "prompt set must be generated before repair execution")

    defects = run.get("defects")
    require(isinstance(defects, list), "canonical defects must be an array")
    require(all(isinstance(item, dict) and item.get("stage") == "initial" for item in defects),
            "prompt generation requires the immutable initial defect inventory only")
    selected = [item for item in defects if isinstance(item, dict)
                and item.get("stage") == "initial" and item.get("status") == "open"]
    require(selected, "no evidenced open initial defect to prompt")

    defect_ids = [item.get("defect_id") for item in selected]
    require(all(isinstance(value, str) and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", value)
                for value in defect_ids), "invalid canonical defect_id")
    require(len(defect_ids) == len(set(defect_ids)), "duplicate canonical defect_id")

    files = sorted(prompt_dir.glob("repair-*.md")) if prompt_dir.is_dir() else []
    require(len(files) == len(selected),
            f"expected {len(selected)} repair prompts, found {len(files)}")

    seen = set()
    by_id = {item["defect_id"]: item for item in selected}
    for path in files:
        fields, arrays, sections = parse_prompt(path)
        defect_id = fields["defect_id"]
        require(defect_id in by_id, f"{path}: unknown defect_id {defect_id}")
        require(defect_id not in seen, f"{path}: duplicate defect prompt {defect_id}")
        seen.add(defect_id)
        defect = by_id[defect_id]
        expected_index = selected.index(defect) + 1
        require(fields["uc_id"] == uc_id and fields["run_id"] == run_id,
                f"{path}: active-run identity mismatch")
        require(fields["repair_index"] == str(expected_index), f"{path}: repair_index mismatch")
        require(path.name == f"repair-{expected_index:03d}-{defect_id}.md", f"{path}: filename mismatch")
        require(fields["defect_fingerprint"] == defect.get("fingerprint"), f"{path}: fingerprint mismatch")
        require(fields["category"] == defect.get("category"), f"{path}: category mismatch")
        require(fields["trigger"] == defect.get("trigger"), f"{path}: trigger mismatch")
        require(fields["source_revision"] == defect.get("source_revision"), f"{path}: source revision mismatch")
        require(arrays["affected_br_ids"] == defect.get("affected_br_ids"), f"{path}: affected BR mismatch")
        require(arrays["affected_flow_ids"] == defect.get("affected_flow_ids"), f"{path}: affected Flow mismatch")
        evidence = defect.get("evidence")
        require(isinstance(evidence, list) and evidence, f"{path}: canonical evidence missing")
        for reference in evidence:
            require(isinstance(reference, dict), f"{path}: invalid canonical evidence reference")
            evidence_path = reference.get("path")
            evidence_sha = reference.get("sha256")
            require(isinstance(evidence_path, str) and evidence_path in sections["Evidence"],
                    f"{path}: evidence path missing from prompt")
            require(isinstance(evidence_sha, str) and evidence_sha in sections["Evidence"],
                    f"{path}: evidence checksum missing from prompt")

    require(seen == set(defect_ids), "generated prompt set is incomplete")
    return {"run_id": run_id, "prompt_count": len(files), "prompt_paths": [str(path) for path in files]}


def validate_and_record_handoff(run_path, prompt_dir):
    run_path, _, folder = context(run_path)
    prompt_dir = writable(prompt_dir)
    with run_lock(folder):
        result = validate(run_path, prompt_dir)
        run = read_json(run_path)
        relative_prompt_dir = prompt_dir.relative_to(ROOT).as_posix()
        existing = run.get("repair_prompt_directory")
        require(existing in (None, relative_prompt_dir),
                "canonical run already points to a different repair prompt directory")
        run["repair_prompt_directory"] = relative_prompt_dir
        run["all_sub_prompt_count"] = result["prompt_count"]
        run["repair_round_limit"] = 10
        run["repair_rounds_completed"] = 0
        run["repair_status"] = "not_started"
        atomic_write(run_path, run)
    result["repair_prompt_directory"] = relative_prompt_dir
    result["handoff_recorded"] = True
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-json", required=True, type=Path)
    parser.add_argument("--prompt-dir", required=True, type=Path)
    parser.add_argument("--record-handoff", action="store_true")
    args = parser.parse_args()
    if args.record_handoff:
        result = validate_and_record_handoff(args.run_json.resolve(), args.prompt_dir.resolve())
    else:
        result = validate(args.run_json.resolve(), args.prompt_dir.resolve())
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
