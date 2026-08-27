#!/usr/bin/env python3
"""Validate and normalize a catalog-bound third-party evaluation policy."""

import hashlib
import json
import re
import sys
from pathlib import Path

from sr_blind_contract import assert_sr_blind
from validate_security_criteria import validate as validate_catalog


SHA256 = re.compile(r"sha256:[0-9a-f]{64}")
AUTH_MODES = {"none", "bearer_env", "cookie_env"}
APPLICABILITY = {"required", "if_present"}


def fail(message: str) -> None:
    raise ValueError(message)


def text(value, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        fail(f"{field} must be a non-empty string")
    return value


def checksum(value, field: str) -> str:
    value = text(value, field).lower()
    if SHA256.fullmatch(value) is None:
        fail(f"{field} must be a complete SHA-256 checksum")
    return value


def file_hash(path: Path) -> str:
    return f"sha256:{hashlib.sha256(path.read_bytes()).hexdigest()}"


def unique_ids(items: list, field: str) -> None:
    ids = [text(item.get("id"), f"{field}[].id") for item in items if isinstance(item, dict)]
    if len(ids) != len(items) or len(ids) != len(set(ids)):
        fail(f"{field} must contain objects with unique non-empty ids")


def coverage_contract(data: dict) -> dict:
    if not isinstance(data, dict):
        fail("coverage_contract must be an object")
    source_paths = data.get("source_paths")
    contexts = data.get("contexts")
    target_sets = data.get("target_sets")
    probes = data.get("probes")
    limitations = data.get("known_limitations")
    if not isinstance(source_paths, list) or not source_paths or not all(isinstance(value, str) and value for value in source_paths):
        fail("coverage_contract.source_paths must be a non-empty string list")
    for field, value in (("contexts", contexts), ("target_sets", target_sets), ("probes", probes), ("known_limitations", limitations)):
        if not isinstance(value, list):
            fail(f"coverage_contract.{field} must be a list")
    unique_ids(contexts, "coverage_contract.contexts")
    unique_ids(target_sets, "coverage_contract.target_sets")
    unique_ids(probes, "coverage_contract.probes")
    context_ids = {item["id"] for item in contexts}
    target_ids = {item["id"] for item in target_sets}
    for index, context in enumerate(contexts):
        if context.get("applicability") not in APPLICABILITY:
            fail(f"coverage_contract.contexts[{index}].applicability is invalid")
        auth = context.get("auth")
        if not isinstance(auth, dict) or auth.get("mode") not in AUTH_MODES:
            fail(f"coverage_contract.contexts[{index}].auth.mode is invalid")
        if auth["mode"] != "none":
            secret_env = text(auth.get("secret_env"), f"coverage_contract.contexts[{index}].auth.secret_env")
            if re.fullmatch(r"[A-Z][A-Z0-9_]*", secret_env) is None:
                fail(f"coverage_contract.contexts[{index}].auth.secret_env must be an uppercase environment name")
    for index, target in enumerate(target_sets):
        text(target.get("kind"), f"coverage_contract.target_sets[{index}].kind")
        target_contexts = target.get("contexts")
        if not isinstance(target_contexts, list) or not target_contexts or not set(target_contexts).issubset(context_ids):
            fail(f"coverage_contract.target_sets[{index}].contexts must reference declared contexts")
        for field in ("include", "exclude"):
            if not isinstance(target.get(field), list) or not all(isinstance(value, str) for value in target[field]):
                fail(f"coverage_contract.target_sets[{index}].{field} must be a string list")
    for index, probe in enumerate(probes):
        if probe.get("category") not in {"A01", "A02"}:
            fail(f"coverage_contract.probes[{index}].category must be A01 or A02")
        if probe.get("target_set") not in target_ids:
            fail(f"coverage_contract.probes[{index}].target_set must reference a declared target")
        if not isinstance(probe.get("contexts"), list) or not set(probe["contexts"]).issubset(context_ids):
            fail(f"coverage_contract.probes[{index}].contexts must reference declared contexts")
        if probe.get("applicability") not in APPLICABILITY:
            fail(f"coverage_contract.probes[{index}].applicability is invalid")
        if not isinstance(probe.get("required_capabilities"), list) or not all(isinstance(value, str) and value for value in probe["required_capabilities"]):
            fail(f"coverage_contract.probes[{index}].required_capabilities must be a string list")
    for index, limitation in enumerate(limitations):
        if not isinstance(limitation, dict):
            fail(f"coverage_contract.known_limitations[{index}] must be an object")
        text(limitation.get("code"), f"coverage_contract.known_limitations[{index}].code")
        text(limitation.get("detail"), f"coverage_contract.known_limitations[{index}].detail")
    return data


def semgrep_links(path: Path) -> dict[str, str]:
    rule_id = None
    links: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        match = re.match(r"\s*- id:\s*(\S+)\s*$", line)
        if match:
            rule_id = match.group(1)
            continue
        match = re.search(r"criterion_id:\s*([A-Z0-9-]+)", line)
        if match and rule_id:
            links[rule_id] = match.group(1)
    return links


def zap_rule_ids(path: Path) -> set[str]:
    ids = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped and not stripped.startswith("#"):
            ids.add(stripped.split()[0])
    return ids


def validate(path: Path, require_approved: bool = False) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    assert_sr_blind(data)
    if data.get("artifact_type") != "third-party-security-evaluation-policy":
        fail("artifact_type must be third-party-security-evaluation-policy")
    if data.get("schema_version") != 4:
        fail("schema_version must be 4")
    if data.get("status") not in {"Draft", "Approved"}:
        fail("policy status must be Draft or Approved")
    if require_approved and data["status"] != "Approved":
        fail("evaluation policy must be Approved")
    for field in ("policy_id", "research_product_id"):
        text(data.get(field), field)
    if data["status"] == "Approved":
        text(data.get("researcher"), "researcher")
        text(data.get("decided_at"), "decided_at")
    if data.get("evaluation_target") != "current_final_source":
        fail("evaluation_target must be current_final_source")
    if data.get("scope") != ["A01", "A02"]:
        fail("scope must be exactly [A01, A02]")

    repo = Path(__file__).resolve().parents[4]
    refs = data.get("refs")
    if not isinstance(refs, dict):
        fail("refs must be an object")
    catalog_ref = refs.get("criteria_catalog")
    lock_ref = refs.get("tool_lock")
    bundles = refs.get("rule_bundles")
    if not isinstance(catalog_ref, dict) or not isinstance(lock_ref, dict) or not isinstance(bundles, dict):
        fail("refs.criteria_catalog, refs.tool_lock and refs.rule_bundles are required")
    catalog_path = repo / text(catalog_ref.get("path"), "refs.criteria_catalog.path")
    catalog_checksum = checksum(catalog_ref.get("checksum"), "refs.criteria_catalog.checksum")
    if not catalog_path.is_file() or file_hash(catalog_path) != catalog_checksum:
        fail("criteria catalog checksum does not match")
    catalog = validate_catalog(catalog_path, require_approved=require_approved)
    if catalog["catalog_id"] != catalog_ref.get("id"):
        fail("criteria catalog id does not match")

    lock_path = repo / text(lock_ref.get("path"), "refs.tool_lock.path")
    lock_checksum = checksum(lock_ref.get("checksum"), "refs.tool_lock.checksum")
    if not lock_path.is_file() or file_hash(lock_path) != lock_checksum:
        fail("tool lock checksum does not match")

    bundle_paths = {}
    strict_execution = None
    for tool in ("semgrep", "zap"):
        item = bundles.get(tool)
        if not isinstance(item, dict):
            fail(f"refs.rule_bundles.{tool} must be an object")
        bundle_path = repo / text(item.get("path"), f"refs.rule_bundles.{tool}.path")
        bundle_checksum = checksum(item.get("checksum"), f"refs.rule_bundles.{tool}.checksum")
        if not bundle_path.is_file() or file_hash(bundle_path) != bundle_checksum:
            fail(f"{tool} rule bundle checksum does not match")
        bundle_paths[tool] = bundle_path
        if tool == "zap":
            strict_execution = item.get("strict_execution")
            if not isinstance(strict_execution, bool):
                fail("refs.rule_bundles.zap.strict_execution must be boolean")

    enabled = data.get("enabled_criteria")
    if not isinstance(enabled, list) or not enabled or not all(isinstance(value, str) and value for value in enabled):
        fail("enabled_criteria must be a non-empty string list")
    if len(enabled) != len(set(enabled)):
        fail("enabled_criteria must be unique")
    by_id = {item["id"]: item for item in catalog["criteria"]}
    if not set(enabled).issubset(by_id):
        fail("enabled_criteria reference unknown catalog criteria")
    selected = [by_id[item] for item in enabled]
    expected_semgrep = {item["rule_id"]: item["id"] for item in selected if item["tool"] == "semgrep"}
    expected_zap = {item["rule_id"] for item in selected if item["tool"] == "zap"}
    if semgrep_links(bundle_paths["semgrep"]) != expected_semgrep:
        fail("Semgrep rule ids/criterion links do not exactly match enabled criteria")
    if zap_rule_ids(bundle_paths["zap"]) != expected_zap:
        fail("ZAP rule ids do not exactly match enabled criteria")

    normalized = {
        "artifact_type": data["artifact_type"],
        "schema_version": data["schema_version"],
        "policy_id": data["policy_id"],
        "status": data["status"],
        "researcher": data.get("researcher"),
        "decided_at": data.get("decided_at"),
        "scope": data["scope"],
        "evaluation_target": data["evaluation_target"],
        "research_product_id": data["research_product_id"],
        "criteria_catalog": {"path":catalog_ref["path"],"checksum":catalog_checksum,"id":catalog["catalog_id"]},
        "tool_version_lock": lock_ref["path"],
        "tool_version_lock_checksum": lock_checksum,
        "semgrep": {"policy":bundles["semgrep"]["path"],"policy_checksum":checksum(bundles["semgrep"]["checksum"], "semgrep checksum"),"enabled_rule_ids":list(expected_semgrep),"classification":[{"rule_id":item["rule_id"],"criterion_id":item["id"],"category":item["category"],"cwe_ids":item["classification"]["cwe_ids"]} for item in selected if item["tool"] == "semgrep"]},
        "zap": {"policy":bundles["zap"]["path"],"policy_checksum":checksum(bundles["zap"]["checksum"], "zap checksum"),"strict_rule_execution":strict_execution,"enabled_rule_ids":list(expected_zap),"classification":[{"rule_id":item["rule_id"],"criterion_id":item["id"],"category":item["category"],"cwe_ids":item["classification"]["cwe_ids"]} for item in selected if item["tool"] == "zap"]},
        "coverage": coverage_contract(data.get("coverage_contract")),
    }
    return normalized


if __name__ == "__main__":
    if len(sys.argv) not in {2, 3} or (len(sys.argv) == 3 and sys.argv[2] != "--require-approved"):
        raise SystemExit("usage: validate_evaluation_policy.py <evaluation-policy.json> [--require-approved]")
    try:
        validated = validate(Path(sys.argv[1]), require_approved=len(sys.argv) == 3)
        print(json.dumps({"status":"valid","policy_id":validated["policy_id"],"policy_status":validated["status"],"schema_version":validated["schema_version"],"criteria":len(validated["semgrep"]["enabled_rule_ids"])+len(validated["zap"]["enabled_rule_ids"])}, separators=(",", ":")))
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise SystemExit(f"evaluation policy error: {exc}")
