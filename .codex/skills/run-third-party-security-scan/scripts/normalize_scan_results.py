#!/usr/bin/env python3
"""Normalize raw Semgrep/ZAP output into one compact canonical JSON artifact."""

import argparse
import json
from collections import Counter
from pathlib import Path

from validate_evaluation_policy import validate


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def raw_findings(semgrep: dict, zap: dict) -> list[dict]:
    findings = [{"tool": "semgrep", "rule_id": str(item.get("check_id", ""))} for item in semgrep.get("results", [])]
    for site in zap.get("site", []):
        for alert in site.get("alerts", []):
            findings.append({"tool": "zap", "rule_id": str(alert.get("pluginid", ""))})
    return findings


def classification_for(classifications: dict, tool: str, raw_rule_id: str):
    direct = classifications.get((tool, raw_rule_id))
    if direct or tool != "semgrep":
        return direct
    suffix_matches = [
        mapping for (mapped_tool, mapped_id), mapping in classifications.items()
        if mapped_tool == tool and raw_rule_id.endswith(f".{mapped_id}")
    ]
    return suffix_matches[0] if len(suffix_matches) == 1 else None


def observed_coverage(policy: dict, manifest: dict) -> dict:
    coverage = policy["coverage"]
    capabilities = set(manifest.get("coverage_execution", {}).get("capabilities", []))
    available = manifest.get("coverage_execution", {}).get("context_secret_available", {})
    contexts = []
    for context in coverage["contexts"]:
        context_id = context["id"]
        auth_mode = context.get("auth", {}).get("mode")
        if auth_mode == "none" and "anonymous_openapi" in capabilities:
            contexts.append({"id": context_id, "status": "evaluated"})
        elif auth_mode in {"bearer_env", "cookie_env"} and not available.get(context_id, False):
            contexts.append({"id": context_id, "status": "not_evaluable", "reason_code": "credential_unavailable"})
        else:
            contexts.append({"id": context_id, "status": "not_evaluable", "reason_code": "authenticated_executor_not_configured"})

    context_status = {item["id"]: item for item in contexts}
    targets = []
    for target in coverage["target_sets"]:
        for context_id in target.get("contexts", []):
            context = context_status.get(context_id, {"status": "not_evaluable", "reason_code": "context_not_declared"})
            item = {"id": f"{target['id']}:{context_id}", "status": context["status"]}
            if context.get("reason_code"):
                item["reason_code"] = context["reason_code"]
            targets.append(item)

    units = []
    for probe in coverage["probes"]:
        required_contexts = [context_status.get(value, {}) for value in probe.get("contexts", [])]
        if required_contexts and all(value.get("status") == "evaluated" for value in required_contexts) and "authorization_matrix" in capabilities:
            units.append({"id": probe["id"], "status": "evaluated"})
        else:
            units.append({"id": probe["id"], "status": "not_evaluable", "reason_code": "probe_executor_or_context_unavailable"})
    return {"contexts": contexts, "target_sets": targets, "units": units, "limitations": coverage["known_limitations"]}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--policy", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--semgrep", required=True, type=Path)
    parser.add_argument("--zap", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    policy = validate(args.policy, require_approved=True)
    manifest = load(args.manifest)
    classifications = {}
    for tool in ("semgrep", "zap"):
        for item in policy[tool]["classification"]:
            classifications[(tool, str(item["rule_id"]))] = item

    normalized = []
    counters = Counter()
    for finding in raw_findings(load(args.semgrep), load(args.zap)):
        counters[finding["tool"]] += 1
        finding_id = f"{finding['tool'].upper()}-{counters[finding['tool']]:04d}"
        mapping = classification_for(classifications, finding["tool"], finding["rule_id"])
        if mapping:
            normalized.append({
                "id": finding_id,
                "tool": finding["tool"],
                "rule_id": finding["rule_id"],
                "criterion_id": mapping["criterion_id"],
                "category": mapping["category"],
                "cwe_ids": mapping.get("cwe_ids", []),
                "status": "potential_finding",
                "triage": "pending_researcher",
            })
        else:
            normalized.append({
                "id": finding_id,
                "tool": finding["tool"],
                "rule_id": finding["rule_id"],
                "category": None,
                "status": "unscored_observation",
                "triage": "outside_policy",
            })

    configured = [item for item in normalized if item["status"] == "potential_finding"]
    category_counts = Counter(item["category"] for item in configured)
    tool_counts = Counter(item["tool"] for item in configured)
    tools_complete = all(item.get("status") == "completed" for item in manifest.get("tools", {}).values())
    summary = {
        "artifact_type": "security-evaluation-summary",
        "schema_version": 5,
        "evaluation_id": manifest["evaluation_id"],
        "evaluation_scope": manifest["evaluation_scope"],
        "source_root": manifest["source_root"],
        "contributing_uc_range": manifest["contributing_uc_range"],
        "source": {
            "frozen_hash": manifest["source"]["before_hash"],
            "after_hash": manifest["source"]["after_hash"],
            "unchanged": manifest["source"]["unchanged"],
        },
        "refs": {
            "criteria_catalog": manifest["criteria_catalog_ref"],
            "policy": manifest["policy_ref"],
            "tool_lock": manifest["tool_lock_ref"],
        },
        "result": {
            "status": "potential_findings_detected" if configured else "no_finding_detected" if tools_complete else "scan_failed",
            "potential_findings": len(configured),
            "unscored_observations": sum(item["status"] == "unscored_observation" for item in normalized),
            "by_category": {"A01": category_counts["A01"], "A02": category_counts["A02"]},
            "by_tool": {"semgrep": tool_counts["semgrep"], "zap": tool_counts["zap"]},
        },
        "execution": {
            "started_at": manifest["started_at"],
            "ended_at": manifest["ended_at"],
            "contracts": manifest["tool_contracts"],
            "tools": manifest["tools"],
            "rule_scope": {
                "semgrep": {"configured": len(policy["semgrep"]["enabled_rule_ids"])},
                "zap": {"configured": len(policy["zap"]["enabled_rule_ids"]), "strict_execution": policy["zap"].get("strict_rule_execution", False)},
            },
            "runtime": manifest["deployment"],
        },
        "coverage": observed_coverage(policy, manifest),
        "findings": normalized,
    }
    args.output.write_text(json.dumps(summary, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
