#!/usr/bin/env python3
"""Validate the approved product-level final-source evaluation input."""

import json
import re
import sys
from pathlib import Path

from sr_blind_contract import assert_sr_blind


SHA256 = re.compile(r"sha256:[0-9a-f]{64}")
UC_ID = re.compile(r"UC-[0-9]{3}")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def validate(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    assert_sr_blind(data)
    require(data.get("artifact_type") == "final-source-security-evaluation-input", "artifact_type is invalid")
    require(data.get("schema_version") == 1, "schema_version must be 1")
    require(data.get("status") == "Approved", "evaluation input must be Approved")
    for field in ("evaluation_id", "researcher", "approved_at"):
        require(isinstance(data.get(field), str) and bool(data[field].strip()), f"{field} is required")
    scope = data.get("scope", {})
    require(scope.get("kind") == "current_final_source", "scope.kind must be current_final_source")
    require(scope.get("source_root") == "finalsource/", "scope.source_root must be finalsource/")
    require(scope.get("categories") == ["A01", "A02"], "scope.categories must be exactly [A01, A02]")
    require(isinstance(scope.get("frozen_hash"), str) and SHA256.fullmatch(scope["frozen_hash"]) is not None, "scope.frozen_hash is invalid")
    uc_range = scope.get("contributing_uc_range", {})
    for field in ("from", "to"):
        require(isinstance(uc_range.get(field), str) and UC_ID.fullmatch(uc_range[field]) is not None, f"scope.contributing_uc_range.{field} is invalid")
    policy = data.get("policy", {})
    for field in ("path", "id"):
        require(isinstance(policy.get(field), str) and bool(policy[field]), f"policy.{field} is required")
    require(isinstance(policy.get("checksum"), str) and SHA256.fullmatch(policy["checksum"]) is not None, "policy.checksum is invalid")
    tools = data.get("tools", {})
    for name in ("semgrep", "zap"):
        tool = tools.get(name, {})
        require(tool.get("enabled") is True, f"tools.{name}.enabled must be true")
        for field in ("input_contract", "output_contract"):
            require(isinstance(tool.get(field), str) and bool(tool[field]), f"tools.{name}.{field} is required")
    expected_directory = f"docs/03-audit/security-tools/finalsource/{data['evaluation_id']}/"
    output = data.get("output", {})
    require(output.get("directory") == expected_directory, f"output.directory must be {expected_directory}")
    require(output.get("canonical_summary") == "evaluation-summary.json", "output.canonical_summary must be evaluation-summary.json")
    return data


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: validate_evaluation_input.py <evaluation-input.json>")
    try:
        result = validate(Path(sys.argv[1]))
        print(json.dumps({"status": "valid", "evaluation_id": result["evaluation_id"]}, separators=(",", ":")))
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise SystemExit(f"evaluation input error: {exc}")
