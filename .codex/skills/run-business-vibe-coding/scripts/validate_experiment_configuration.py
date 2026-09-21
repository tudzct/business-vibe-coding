#!/usr/bin/env python3
"""Validate a confirmed Business Rule experiment configuration."""

import hashlib
import json
import sys
from datetime import datetime
from pathlib import Path

EFFORTS = {"none", "low", "medium", "high", "xhigh", "max"}
MODES = {"standard", "pro"}
PROTOCOLS = {"fixed", "matched", "cross"}
PROMPT_VARIANTS = {"full", "rq3"}
SCHEMA_VERSION = "2.4"
TIMING_METHOD = "system_timestamp_delta"
RUNTIME_FLOW_RUBRIC = "completion-critical-flow-runtime-v2"
ROOT = Path(__file__).resolve().parents[4]


def unique_object(pairs):
    data = {}
    for key, value in pairs:
        if key in data:
            raise ValueError(f"duplicate JSON field: {key}")
        data[key] = value
    return data


def invalid_constant(value):
    raise ValueError(f"non-finite JSON value: {value}")


def read_configuration_json(path):
    data = json.loads(path.read_text(encoding="utf-8-sig"), object_pairs_hook=unique_object,
                      parse_constant=invalid_constant)
    if not isinstance(data, dict):
        raise ValueError(f"JSON object required: {path}")
    return data


def flow_rubric(data):
    expected = RUNTIME_FLOW_RUBRIC
    actual = data.get("flow_audit_rubric")
    if actual != expected:
        raise ValueError("flow_audit_rubric does not match configuration schema")
    return actual


def text(value, field):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a non-empty string")
    if "<" in value or ">" in value:
        raise ValueError(f"{field} contains an unresolved template placeholder")
    return value.strip()


def positive(value, field):
    if not isinstance(value, int) or isinstance(value, bool) or value < 1:
        raise ValueError(f"{field} must be a positive integer")
    return value


def identifier(value, field):
    value = text(value, field)
    if value in {".", ".."} or not all(c.isalnum() or c in "-_." for c in value):
        raise ValueError(f"{field} must be a safe identifier, not a path")
    return value


def validate_model(model, field):
    if not isinstance(model, dict):
        raise ValueError(f"{field} must be an object")
    text(model.get("requested_label"), field + ".requested_label")
    text(model.get("requested_model_id"), field + ".requested_model_id")
    if text(model.get("requested_reasoning_effort"), field + ".requested_reasoning_effort") not in EFFORTS:
        raise ValueError(f"{field} has invalid reasoning effort")
    if text(model.get("requested_reasoning_mode"), field + ".requested_reasoning_mode") not in MODES:
        raise ValueError(f"{field} has invalid reasoning mode")


def validate(path):
    path = path.resolve()
    if not path.is_relative_to(ROOT / "docs/05-experiments/configurations"):
        raise ValueError("configuration must be stored under docs/05-experiments/configurations")
    data = read_configuration_json(path)
    schema_version = data.get("schema_version")
    if schema_version != SCHEMA_VERSION:
        raise ValueError(f"schema_version must be {SCHEMA_VERSION}")
    rubric = flow_rubric(data)
    if data.get("artifact_type") != "experiment-configuration" or data.get("status") != "Confirmed":
        raise ValueError("configuration must be Confirmed")
    for field in ("configuration_id", "comparison_group_id", "researcher_id", "decided_at", "sheet_revision"):
        text(data.get(field), field)
    identifier(data["configuration_id"], "configuration_id")
    decided = datetime.fromisoformat(data["decided_at"].replace("Z", "+00:00"))
    if decided.tzinfo is None:
        raise ValueError("decided_at must include a timezone")
    timing_method = data.get("timing_method")
    if timing_method != TIMING_METHOD:
        raise ValueError(f"schema {schema_version} timing_method must be {TIMING_METHOD}")
    # Offline database contract: migration_head, dbml_sha256, schema_fingerprint_sha256.
    # Runtime history/drift checks belong to generation/audit, never Measure.
    sys.path.insert(0, str(ROOT / ".codex/skills/gen-coding-prompt/scripts"))
    from database_baseline import validate_input
    validate_input(data)
    figma = data.get("figma_dataset")
    if not isinstance(figma, dict):
        raise ValueError(f"schema {schema_version} requires figma_dataset")
    version = text(figma.get("dataset_version"), "figma_dataset.dataset_version")
    manifest_value = text(figma.get("manifest_path"), "figma_dataset.manifest_path")
    expected_path = f"resource/figma-design-dataset/{version}/manifest.json"
    if manifest_value.replace("\\", "/") != expected_path:
        raise ValueError("figma_dataset manifest path/version mismatch")
    manifest_path = (ROOT / manifest_value).resolve()
    if not manifest_path.is_relative_to(ROOT / "resource/figma-design-dataset"):
        raise ValueError("figma_dataset manifest must stay inside the dataset directory")
    if not manifest_path.is_file():
        raise ValueError("figma_dataset manifest does not exist")
    expected_hash = "sha256:" + hashlib.sha256(manifest_path.read_bytes()).hexdigest()
    if figma.get("manifest_sha256") != expected_hash:
        raise ValueError("figma_dataset manifest checksum mismatch")
    manifest = read_configuration_json(manifest_path)
    if manifest.get("dataset_version") != version or manifest.get("overall_status") != "complete":
        raise ValueError("figma_dataset must reference a complete matching version")
    audit = data.get("audit_design")
    if not isinstance(audit, dict) or audit.get("protocol") not in PROTOCOLS:
        raise ValueError("audit_design.protocol is invalid")
    if audit["protocol"] == "fixed":
        validate_model(audit.get("fixed_auditor"), "audit_design.fixed_auditor")

    use_cases = data.get("use_cases")
    if not isinstance(use_cases, list) or not use_cases:
        raise ValueError("use_cases must be non-empty")
    uc_ids = set()
    for index, uc in enumerate(use_cases):
        if not isinstance(uc, dict):
            raise ValueError(f"use_cases[{index}] must be an object")
        uc_id = identifier(uc.get("uc_id"), f"use_cases[{index}].uc_id")
        if uc_id in uc_ids:
            raise ValueError(f"duplicate UC ID: {uc_id}")
        uc_ids.add(uc_id)
        ids = uc.get("ordered_br_ids")
        if not isinstance(ids, list) or not ids or any(not isinstance(v, str) or not v.strip() for v in ids) or len(ids) != len(set(ids)):
            raise ValueError(f"use_cases[{index}].ordered_br_ids must be a non-empty unique string array")
        text(uc.get("business_rule_baseline"), f"use_cases[{index}].business_rule_baseline")
        text(uc.get("flow_baseline"), f"use_cases[{index}].flow_baseline")

    runs = data.get("runs")
    if not isinstance(runs, list) or not runs:
        raise ValueError("runs must be non-empty")
    run_ids, orders, assignments = set(), set(), set()
    for index, run in enumerate(runs):
        prefix = f"runs[{index}]"
        if not isinstance(run, dict):
            raise ValueError(f"{prefix} must be an object")
        run_id = identifier(run.get("run_id"), prefix + ".run_id")
        uc_id = identifier(run.get("uc_id"), prefix + ".uc_id")
        if run_id in run_ids or uc_id not in uc_ids:
            raise ValueError(f"{prefix} has duplicate run ID or unknown UC")
        run_ids.add(run_id)
        order = positive(run.get("run_order"), prefix + ".run_order")
        if order in orders:
            raise ValueError(f"duplicate run_order: {order}")
        orders.add(order)
        replicate = positive(run.get("replicate_index"), prefix + ".replicate_index")
        validate_model(run, prefix)
        variant = run.get("prompt_variant")
        if variant not in PROMPT_VARIANTS:
            raise ValueError(f"{prefix}.prompt_variant must be one of {sorted(PROMPT_VARIANTS)}")
        key = (uc_id, variant, run["requested_model_id"], run["requested_reasoning_effort"], run["requested_reasoning_mode"], replicate)
        if key in assignments:
            raise ValueError(f"duplicate UC/variant/model/replicate assignment: {key}")
        assignments.add(key)
        text(run.get("auditor_assignment"), prefix + ".auditor_assignment")
        if "flow_audit_rubric" in run and run["flow_audit_rubric"] != rubric:
            raise ValueError("run-level rubric cannot override comparison-group rubric")
    # One evidence standard across Full/RQ3/models, including other configurations in the group.
    for peer_path in path.parent.glob("*.json"):
        if peer_path.resolve() == path.resolve():
            continue
        peer = read_configuration_json(peer_path)
        if peer.get("artifact_type") == "experiment-configuration" and peer.get("configuration_id") == data["configuration_id"]:
            raise ValueError("duplicate configuration_id; select a unique immutable configuration")
        if (peer.get("artifact_type") == "experiment-configuration" and peer.get("status") == "Confirmed"
                and peer.get("comparison_group_id") == data["comparison_group_id"] and flow_rubric(peer) != rubric):
            raise ValueError("comparison group mixes flow audit rubrics; use a new comparison_group_id")
    return data


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: validate_experiment_configuration.py <configuration.json>")
    try:
        result = validate(Path(sys.argv[1]))
        print(json.dumps({"status": "valid", "configuration_id": result["configuration_id"], "flow_audit_rubric": flow_rubric(result), "use_cases": len(result["use_cases"]), "runs": len(result["runs"])}, indent=2))
    except (OSError, ValueError, TypeError, KeyError, AttributeError) as exc:
        raise SystemExit(f"experiment configuration error: {exc}")
