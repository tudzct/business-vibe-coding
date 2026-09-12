#!/usr/bin/env python3
"""Read-only validation of Full/RQ3 prompt identity, structure and activation links."""

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens/scripts"))
from metrics_contract import ROOT, digest, read_json, require, writable
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "run-business-vibe-coding/scripts"))
from validate_experiment_configuration import validate as validate_configuration


def normalize_variant(value):
    require(value in {"full", "rq3", "rq3-ad"}, "unsupported prompt variant")
    return "rq3" if value == "rq3-ad" else value


def prompt_metadata(path):
    content = path.read_text(encoding="utf-8-sig")
    match = re.match(r"\A---\n(.*?)\n---(?:\n|$)", content, re.S)
    require(match is not None, "prompt needs scalar YAML frontmatter")
    metadata = {}
    for line in match[1].splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        field = re.fullmatch(r"([a-z_]+):\s*(.*?)\s*", line)
        require(field is not None and field[1] not in metadata, "invalid/duplicate prompt metadata")
        value = field[2]
        if value.startswith('"'):
            value = json.loads(value)
        elif value.startswith("'") and value.endswith("'"):
            value = value[1:-1].replace("''", "'")
        metadata[field[1]] = value
    # Ignore fenced examples when identifying actual prompt sections.
    body = content[match.end():]
    visible, fence = [], None
    for line in body.splitlines():
        marker = re.match(r"^\s*(`{3,}|~{3,})", line)
        if marker:
            if fence is None:
                fence = marker[1]
            elif marker[1][0] == fence[0] and len(marker[1]) >= len(fence):
                fence = None
            continue
        if fence is None:
            visible.append(line)
    headings = re.findall(r"^##\s+Prompt\s+([A-Z])\s*:", "\n".join(visible), re.M)
    return metadata, body, headings


def validate_prompt(configuration, uc_id, run_id, prompt, activation=None, allow_draft=False):
    configuration, prompt = writable(configuration), writable(prompt)
    config = validate_configuration(configuration)
    assignments = [r for r in config["runs"] if r.get("uc_id") == uc_id and r.get("run_id") == run_id]
    require(len(assignments) == 1, "prompt needs unique configured UC/run")
    variant = normalize_variant(assignments[0].get("prompt_variant", "full"))
    meta, body, headings = prompt_metadata(prompt)
    require(meta.get("artifact_type") == "business-coding-prompt" and meta.get("uc_id") == uc_id, "prompt UC/type mismatch")
    require(meta.get("status") in ({"Draft", "Approved"} if allow_draft else {"Approved"}), "prompt approval status mismatch")
    # Missing Full metadata and rq3-ad are historical read aliases only.
    actual = normalize_variant(meta.get("prompt_variant", "full"))
    require(actual == variant, "configuration/prompt variant mismatch")
    require(headings == list("ABCDEF" if variant == "full" else "ABCD"), "prompt sections must match configured variant exactly")
    require(prompt.name.endswith("-rq3-coding-prompt.md" if variant == "rq3" else "-business-coding-prompt.md"), "prompt filename/variant mismatch")
    uc = next(u for u in config["use_cases"] if u["uc_id"] == uc_id)
    baseline = read_json(writable(ROOT / uc["business_rule_baseline"]))
    require(baseline.get("status") == "Frozen" and baseline.get("uc_id") == uc_id, "BR baseline identity mismatch")
    require(meta.get("source_use_case") == baseline.get("use_case_path"), "prompt source UC mismatch")
    if variant == "rq3":
        require(not any(k in meta for k in ("business_rule_resource", "business_rule_baseline")), "RQ3 cannot link BR generation inputs")
        require(not re.search(r"\bPrompt\s+[EF]\b|\bBR-[A-Z0-9-]+\b|business-rule(?:s|-baseline)|\bcontext\s+\w+\s+inv\b", body, re.I),
                "RQ3 contains excluded prompt/BR/OCL references; inspect source provenance")
    else:
        require(meta.get("business_rule_baseline") == uc["business_rule_baseline"], "Full BR baseline reference mismatch")
        require(meta.get("business_rule_resource") == baseline.get("business_rule_resource_path"), "Full BR resource reference mismatch")
    reference = {"path": prompt.relative_to(ROOT).as_posix(), "sha256": digest(prompt.read_bytes())}
    if activation is not None:
        receipt = read_json(writable(activation))
        require(receipt.get("status") == "Confirmed" and receipt.get("artifact_type") == "run-activation", "invalid activation")
        require(receipt.get("uc_id") == uc_id and receipt.get("run_id") == run_id, "activation UC/run mismatch")
        require(normalize_variant(receipt.get("prompt_variant", "full")) == variant, "activation/prompt variant mismatch")
        require(receipt.get("configuration_artifact") == configuration.relative_to(ROOT).as_posix()
                and receipt.get("configuration_checksum") == digest(configuration.read_bytes()), "activation configuration mismatch")
        if receipt.get("gate_version", 0) >= 5 or "approved_prompt" in receipt:
            require(receipt.get("approved_prompt") == reference, "activated prompt is immutable")
    return {"status": "valid", "uc_id": uc_id, "run_id": run_id, "prompt_variant": variant, "prompt": reference}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--configuration", required=True, type=Path)
    parser.add_argument("--uc-id", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--prompt", required=True, type=Path)
    parser.add_argument("--activation", type=Path)
    parser.add_argument("--allow-draft", action="store_true")
    args = parser.parse_args()
    print(json.dumps(validate_prompt(args.configuration, args.uc_id, args.run_id, args.prompt,
                                     args.activation, args.allow_draft), indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, TypeError, KeyError) as exc:
        raise SystemExit(f"prompt contract error: {exc}")
