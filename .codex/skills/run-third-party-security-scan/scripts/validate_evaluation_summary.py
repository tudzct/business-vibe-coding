#!/usr/bin/env python3
"""Validate the compact canonical evaluation summary without extra packages."""

import json
import re
import sys
from pathlib import Path

from sr_blind_contract import assert_sr_blind


SHA256 = re.compile(r"sha256:[0-9a-f]{64}")
COVERAGE_STATUSES = {"evaluated", "not_evaluable", "scan_failed"}
RESULT_STATUSES = {"no_finding_detected", "potential_findings_detected", "scan_failed"}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def validate(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    assert_sr_blind(data)
    require(data.get("artifact_type") == "security-evaluation-summary", "artifact_type is invalid")
    require(data.get("schema_version") == 5, "schema_version must be 5")
    for field in ("evaluation_id",):
        require(isinstance(data.get(field), str) and bool(data[field]), f"{field} is required")
    require(data.get("evaluation_scope") == "current_final_source", "evaluation_scope must be current_final_source")
    require(data.get("source_root") == "finalsource/", "source_root must be finalsource/")
    uc_range = data.get("contributing_uc_range", {})
    for field in ("from", "to"):
        require(isinstance(uc_range.get(field), str) and re.fullmatch(r"UC-[0-9]{3}", uc_range[field]) is not None, f"contributing_uc_range.{field} is invalid")
    source = data.get("source", {})
    for field in ("frozen_hash", "after_hash"):
        require(isinstance(source.get(field), str) and SHA256.fullmatch(source[field]) is not None, f"source.{field} is invalid")
    require(isinstance(source.get("unchanged"), bool), "source.unchanged must be boolean")
    for name in ("criteria_catalog", "policy", "tool_lock"):
        ref = data.get("refs", {}).get(name, {})
        require(all(isinstance(ref.get(field), str) and ref[field] for field in ("path", "id")), f"refs.{name} path/id are required")
        require(isinstance(ref.get("checksum"), str) and SHA256.fullmatch(ref["checksum"]) is not None, f"refs.{name}.checksum is invalid")
    result = data.get("result", {})
    require(result.get("status") in RESULT_STATUSES, "result.status is invalid")
    for field in ("potential_findings", "unscored_observations"):
        require(isinstance(result.get(field), int) and result[field] >= 0, f"result.{field} must be a non-negative integer")
    coverage = data.get("coverage", {})
    for group in ("contexts", "target_sets", "units"):
        observations = coverage.get(group)
        require(isinstance(observations, list), f"coverage.{group} must be a list")
        ids = []
        for item in observations:
            require(isinstance(item, dict) and isinstance(item.get("id"), str) and item["id"], f"coverage.{group} item id is required")
            require(item.get("status") in COVERAGE_STATUSES, f"coverage.{group} item status is invalid")
            if item["status"] == "not_evaluable":
                require(isinstance(item.get("reason_code"), str) and item["reason_code"], f"coverage.{group} not_evaluable requires reason_code")
            ids.append(item["id"])
        require(len(ids) == len(set(ids)), f"coverage.{group} ids must be unique")
    require(isinstance(coverage.get("limitations"), list), "coverage.limitations must be a list")
    require(isinstance(data.get("findings"), list), "findings must be a list")
    return data


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: validate_evaluation_summary.py <evaluation-summary.json>")
    try:
        result = validate(Path(sys.argv[1]))
        print(json.dumps({"status": "valid", "evaluation_id": result["evaluation_id"]}, separators=(",", ":")))
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise SystemExit(f"evaluation summary error: {exc}")
