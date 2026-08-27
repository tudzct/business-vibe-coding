#!/usr/bin/env python3
"""Validate the unified experiment configuration without mutating artifacts."""

import json
import re
import sys
from pathlib import Path

CATALOG_RELATIVE_PATH = "docs/00-context/security/OWASP-2025-SECURITY-CATALOG.json"
CATALOG_PATH = Path(__file__).resolve().parents[4] / CATALOG_RELATIVE_PATH


def load_active_sec_ids():
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    requirements = catalog.get("requirements")
    if not isinstance(requirements, list) or not requirements:
        raise ValueError("canonical security catalog must contain requirements")
    sec_ids = [item.get("sec_id") for item in requirements if isinstance(item, dict)]
    if len(sec_ids) != len(requirements) or any(not isinstance(value, str) for value in sec_ids):
        raise ValueError("every canonical catalog requirement must have a string sec_id")
    if len(sec_ids) != len(set(sec_ids)):
        raise ValueError("canonical security catalog contains duplicate sec_id values")
    active_prefixes = tuple(f"SEC-A{index:02d}-" for index in range(1, 11))
    if any(not value.startswith(active_prefixes) for value in sec_ids):
        raise ValueError("canonical security catalog contains an out-of-scope SEC ID")
    return frozenset(sec_ids)


ACTIVE_SEC_IDS = load_active_sec_ids()
EFFORTS = {"none", "low", "medium", "high", "xhigh", "max"}
MODES = {"standard", "pro"}
PROTOCOLS = {"fixed", "matched", "cross"}


def fail(message):
    raise ValueError(message)


def text(value, field):
    if not isinstance(value, str) or not value.strip():
        fail(f"{field} must be a non-empty string")
    return value.strip()


def positive_integer(value, field):
    if not isinstance(value, int) or isinstance(value, bool) or value < 1:
        fail(f"{field} must be a positive integer")
    return value


def validate_model(model, field):
    if not isinstance(model, dict):
        fail(f"{field} must be an object")
    label = text(model.get("requested_label"), f"{field}.requested_label")
    model_id = text(model.get("requested_model_id"), f"{field}.requested_model_id")
    effort = text(model.get("requested_reasoning_effort"), f"{field}.requested_reasoning_effort")
    mode = text(model.get("requested_reasoning_mode"), f"{field}.requested_reasoning_mode")
    if effort not in EFFORTS or mode not in MODES:
        fail(f"{field} has an invalid reasoning tuple")
    fixed = {
        "Sol Light": ("gpt-5.6-sol", "low", "standard"),
        "Luna Medium": ("gpt-5.6-luna", "medium", "standard"),
        "Terra Medium": ("gpt-5.6-terra", "medium", "standard"),
    }
    if label in fixed and (model_id, effort, mode) != fixed[label]:
        fail(f"{field} does not match the fixed {label} tuple")


def validate(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("artifact_type") != "experiment-configuration" or data.get("status") != "Confirmed":
        fail("artifact_type must be experiment-configuration and status must be Confirmed")
    for field in ("configuration_id", "comparison_group_id", "researcher_id", "decided_at"):
        text(data.get(field), field)
    catalog = text(data.get("catalog_revision"), "catalog_revision")
    if not catalog.startswith(f"{CATALOG_RELATIVE_PATH}@sha256:") or re.search(r"@sha256:[0-9a-f]{64}$", catalog.lower()) is None:
        fail("catalog_revision must reference the canonical JSON catalog and end with a complete SHA-256 checksum")
    audit = data.get("audit_design")
    if not isinstance(audit, dict) or audit.get("protocol") not in PROTOCOLS:
        fail("audit_design.protocol must be fixed, matched, or cross")
    protocol = audit["protocol"]
    if protocol == "fixed":
        validate_model(audit.get("fixed_auditor"), "audit_design.fixed_auditor")

    use_cases = data.get("use_cases")
    if not isinstance(use_cases, list) or not use_cases:
        fail("use_cases must be a non-empty array")
    uc_ids = set()
    for index, use_case in enumerate(use_cases):
        prefix = f"use_cases[{index}]"
        uc_id = text(use_case.get("uc_id"), f"{prefix}.uc_id")
        if uc_id in uc_ids:
            fail(f"duplicate UC ID: {uc_id}")
        uc_ids.add(uc_id)
        scope = use_case.get("security_scope")
        if not isinstance(scope, dict) or scope.get("selection_mode") not in {"researcher_selected", "all_catalog"}:
            fail(f"{prefix}.security_scope is invalid")
        selected = scope.get("selected_sec_ids")
        if not isinstance(selected, list) or not selected or len(selected) != len(set(selected)):
            fail(f"{prefix}.selected_sec_ids must be a non-empty unique array")
        if not set(selected) <= ACTIVE_SEC_IDS:
            fail(f"{prefix}.selected_sec_ids contains inactive or invalid IDs")
        if scope["selection_mode"] == "all_catalog" and set(selected) != ACTIVE_SEC_IDS:
            fail(f"{prefix} all_catalog must contain all {len(ACTIVE_SEC_IDS)} active SEC IDs")
        expected = {
            f"A{category:02d}": sum(value.startswith(f"SEC-A{category:02d}-") for value in selected)
            for category in range(1, 11)
        }
        expected["overall"] = len(selected)
        if scope.get("category_totals") != expected:
            fail(f"{prefix}.category_totals does not match selected SEC IDs")

    runs = data.get("runs")
    if not isinstance(runs, list) or not runs:
        fail("runs must be a non-empty array")
    run_ids, run_orders, replicate_keys = set(), set(), set()
    for index, run in enumerate(runs):
        prefix = f"runs[{index}]"
        run_id = text(run.get("run_id"), f"{prefix}.run_id")
        uc_id = text(run.get("uc_id"), f"{prefix}.uc_id")
        if run_id in run_ids or uc_id not in uc_ids:
            fail(f"{prefix} has a duplicate run ID or unknown UC")
        run_ids.add(run_id)
        order = positive_integer(run.get("run_order"), f"{prefix}.run_order")
        if order in run_orders:
            fail(f"duplicate run_order: {order}")
        run_orders.add(order)
        replicate = positive_integer(run.get("replicate_index"), f"{prefix}.replicate_index")
        validate_model(run, prefix)
        key = (uc_id, run["requested_model_id"], run["requested_reasoning_effort"], run["requested_reasoning_mode"], replicate)
        if key in replicate_keys:
            fail(f"duplicate UC/model/replicate assignment: {key}")
        replicate_keys.add(key)
        assignment = text(run.get("auditor_assignment"), f"{prefix}.auditor_assignment")
        if protocol == "fixed" and assignment != "fixed-auditor":
            fail(f"{prefix}.auditor_assignment must be fixed-auditor")
        if protocol == "matched" and assignment != "same-as-generation":
            fail(f"{prefix}.auditor_assignment must be same-as-generation")
        if protocol == "cross" and assignment in {"fixed-auditor", "same-as-generation"}:
            fail(f"{prefix}.auditor_assignment must identify an explicit cross auditor")
    return data


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: validate_experiment_configuration.py <configuration.json>")
    try:
        result = validate(Path(sys.argv[1]))
        print(json.dumps({"status": "valid", "configuration_id": result["configuration_id"], "use_cases": len(result["use_cases"]), "runs": len(result["runs"])}, indent=2))
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise SystemExit(f"experiment configuration error: {exc}")
