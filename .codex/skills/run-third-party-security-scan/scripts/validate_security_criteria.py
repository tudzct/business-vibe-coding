#!/usr/bin/env python3
"""Validate the canonical SR-blind third-party security criteria catalog."""

import json
import re
import sys
from pathlib import Path

from sr_blind_contract import assert_sr_blind


CRITERION_ID = re.compile(r"TSC-A0[12]-(SEMGREP|ZAP)-[A-Z0-9-]+")
HTTPS = re.compile(r"https://\S+")
TOOLS = {"semgrep", "zap"}
CATEGORIES = {"A01", "A02"}
MATURITY = {"release", "beta", "alpha", "candidate"}
DETECTORS = {"static-search", "static-taint", "passive", "active", "tool-assisted"}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def validate(path: Path, require_approved: bool = False) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    assert_sr_blind(data)
    require(data.get("artifact_type") == "third-party-security-criteria-catalog", "artifact_type is invalid")
    require(data.get("schema_version") == 1, "schema_version must be 1")
    require(data.get("status") in {"Draft", "Approved"}, "catalog status is invalid")
    if require_approved:
        require(data["status"] == "Approved", "criteria catalog must be Approved")
    require(data.get("scope") == ["A01", "A02"], "scope must be exactly [A01, A02]")
    require(isinstance(data.get("catalog_id"), str) and data["catalog_id"], "catalog_id is required")
    if data["status"] == "Approved":
        require(isinstance(data.get("researcher"), str) and data["researcher"], "Approved catalog requires researcher")
        require(isinstance(data.get("decided_at"), str) and data["decided_at"], "Approved catalog requires decided_at")

    sources = data.get("sources")
    require(isinstance(sources, list) and sources, "sources must be a non-empty list")
    source_ids = []
    for index, source in enumerate(sources):
        require(isinstance(source, dict), f"sources[{index}] must be an object")
        for field in ("id", "publisher", "title", "source_type", "version_or_revision", "retrieved_at"):
            require(isinstance(source.get(field), str) and source[field], f"sources[{index}].{field} is required")
        require(isinstance(source.get("url"), str) and HTTPS.fullmatch(source["url"]), f"sources[{index}].url must be HTTPS")
        source_ids.append(source["id"])
    require(len(source_ids) == len(set(source_ids)), "source ids must be unique")

    criteria = data.get("criteria")
    require(isinstance(criteria, list) and criteria, "criteria must be a non-empty list")
    ids, tool_rule_pairs = [], []
    source_id_set = set(source_ids)
    for index, criterion in enumerate(criteria):
        require(isinstance(criterion, dict), f"criteria[{index}] must be an object")
        criterion_id = criterion.get("id")
        require(isinstance(criterion_id, str) and CRITERION_ID.fullmatch(criterion_id), f"criteria[{index}].id is invalid")
        require(criterion.get("category") in CATEGORIES, f"criteria[{index}].category is invalid")
        require(criterion.get("tool") in TOOLS, f"criteria[{index}].tool is invalid")
        require(criterion.get("detector_type") in DETECTORS, f"criteria[{index}].detector_type is invalid")
        require(criterion.get("maturity") in MATURITY, f"criteria[{index}].maturity is invalid")
        for field in ("title", "rule_id", "rule_origin", "severity", "detection_intent", "applicability", "rule_reference"):
            require(isinstance(criterion.get(field), str) and criterion[field], f"criteria[{index}].{field} is required")
        require(HTTPS.fullmatch(criterion["rule_reference"]) is not None, f"criteria[{index}].rule_reference must be HTTPS")
        classification = criterion.get("classification")
        require(isinstance(classification, dict) and classification.get("owasp_top10") == "2025", f"criteria[{index}].classification is invalid")
        for field in ("cwe_ids", "wasc_ids"):
            require(isinstance(classification.get(field), list), f"criteria[{index}].classification.{field} must be a list")
        for field in ("evidence_fields", "limitations", "source_ids"):
            require(isinstance(criterion.get(field), list) and criterion[field], f"criteria[{index}].{field} must be non-empty")
        require(set(criterion["source_ids"]).issubset(source_id_set), f"criteria[{index}].source_ids reference unknown sources")
        if criterion["tool"] == "semgrep":
            require(criterion["rule_origin"] == "project-custom", f"criteria[{index}] Semgrep rule origin must be project-custom")
            require(criterion["maturity"] == "candidate", f"criteria[{index}] custom Semgrep maturity must be candidate")
        ids.append(criterion_id)
        tool_rule_pairs.append((criterion["tool"], criterion["rule_id"]))
    require(len(ids) == len(set(ids)), "criterion ids must be unique")
    require(len(tool_rule_pairs) == len(set(tool_rule_pairs)), "tool/rule_id pairs must be unique")
    return data


if __name__ == "__main__":
    if len(sys.argv) not in {2, 3} or (len(sys.argv) == 3 and sys.argv[2] != "--require-approved"):
        raise SystemExit("usage: validate_security_criteria.py <criteria-catalog.json> [--require-approved]")
    try:
        result = validate(Path(sys.argv[1]), require_approved=len(sys.argv) == 3)
        print(json.dumps({"status":"valid","catalog_id":result["catalog_id"],"catalog_status":result["status"],"criteria":len(result["criteria"])}, separators=(",", ":")))
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise SystemExit(f"criteria catalog error: {exc}")
