#!/usr/bin/env python3
"""Validate a confirmed Business Rule experiment configuration."""

import json
import sys
from pathlib import Path

EFFORTS = {"none", "low", "medium", "high", "xhigh", "max"}
MODES = {"standard", "pro"}
PROTOCOLS = {"fixed", "matched", "cross"}


def text(value, field):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a non-empty string")
    return value.strip()


def positive(value, field):
    if not isinstance(value, int) or isinstance(value, bool) or value < 1:
        raise ValueError(f"{field} must be a positive integer")
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
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("artifact_type") != "experiment-configuration" or data.get("status") != "Confirmed":
        raise ValueError("configuration must be Confirmed")
    for field in ("configuration_id", "comparison_group_id", "researcher_id", "decided_at", "sheet_revision"):
        text(data.get(field), field)
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
        uc_id = text(uc.get("uc_id"), f"use_cases[{index}].uc_id")
        if uc_id in uc_ids:
            raise ValueError(f"duplicate UC ID: {uc_id}")
        uc_ids.add(uc_id)
        ids = uc.get("ordered_br_ids")
        if not isinstance(ids, list) or not ids or len(ids) != len(set(ids)) or any(not isinstance(v, str) or not v.strip() for v in ids):
            raise ValueError(f"use_cases[{index}].ordered_br_ids must be a non-empty unique string array")
        text(uc.get("business_rule_baseline"), f"use_cases[{index}].business_rule_baseline")

    runs = data.get("runs")
    if not isinstance(runs, list) or not runs:
        raise ValueError("runs must be non-empty")
    run_ids, orders, assignments = set(), set(), set()
    for index, run in enumerate(runs):
        prefix = f"runs[{index}]"
        run_id = text(run.get("run_id"), prefix + ".run_id")
        uc_id = text(run.get("uc_id"), prefix + ".uc_id")
        if run_id in run_ids or uc_id not in uc_ids:
            raise ValueError(f"{prefix} has duplicate run ID or unknown UC")
        run_ids.add(run_id)
        order = positive(run.get("run_order"), prefix + ".run_order")
        if order in orders:
            raise ValueError(f"duplicate run_order: {order}")
        orders.add(order)
        replicate = positive(run.get("replicate_index"), prefix + ".replicate_index")
        validate_model(run, prefix)
        key = (uc_id, run["requested_model_id"], run["requested_reasoning_effort"], run["requested_reasoning_mode"], replicate)
        if key in assignments:
            raise ValueError(f"duplicate UC/model/replicate assignment: {key}")
        assignments.add(key)
        text(run.get("auditor_assignment"), prefix + ".auditor_assignment")
    return data


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: validate_experiment_configuration.py <configuration.json>")
    try:
        result = validate(Path(sys.argv[1]))
        print(json.dumps({"status": "valid", "configuration_id": result["configuration_id"], "use_cases": len(result["use_cases"]), "runs": len(result["runs"])}, indent=2))
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise SystemExit(f"experiment configuration error: {exc}")
