#!/usr/bin/env python3
"""Render Prompt E deterministically from a frozen Business Rule resource."""

import argparse
import json
from pathlib import Path


def require_text(value, field):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a non-empty string")
    return value


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("resource", type=Path)
    args = parser.parse_args()
    data = json.loads(args.resource.read_text(encoding="utf-8"))
    if data.get("artifact_type") != "business-rule-resource" or data.get("status") != "Frozen":
        raise ValueError("resource must be a Frozen business-rule-resource")
    rules = data.get("rules")
    ordered = data.get("ordered_br_ids")
    if not isinstance(rules, list) or not rules or not isinstance(ordered, list):
        raise ValueError("rules and ordered_br_ids must be non-empty arrays")
    by_id = {}
    for index, rule in enumerate(rules):
        if not isinstance(rule, dict):
            raise ValueError(f"rules[{index}] must be an object")
        br_id = require_text(rule.get("br_id"), f"rules[{index}].br_id")
        if br_id in by_id:
            raise ValueError(f"duplicate BR ID: {br_id}")
        by_id[br_id] = rule
    if ordered != list(by_id) or set(ordered) != set(by_id):
        raise ValueError("ordered_br_ids must exactly match rules in source order")

    out = [
        "## Prompt E: Business Rules Compliance", "",
        "### Objective: Implement the complete frozen Business Rule set for this use case without changing its meaning.", "",
        "The ordered Rule IDs below MUST exactly match the frozen Business Rule baseline. Every rule appears exactly once in this projection; one implementation control may enforce multiple rules when appropriate.", "",
    ]
    for br_id in ordered:
        rule = by_id[br_id]
        out.extend([
            f"### Business Rule: {br_id}", "",
            f"- **Name:** {require_text(rule.get('name'), br_id + '.name')}",
            f"- **Representation:** {require_text(rule.get('representation'), br_id + '.representation')}",
            f"- **Expression / authoritative text:** {require_text(rule.get('expression_or_text'), br_id + '.expression_or_text')}",
            f"- **Context:** {require_text(rule.get('context'), br_id + '.context')}",
            f"- **Enforcement layer:** {', '.join(rule.get('enforcement_layers', [])) or 'unresolved'}",
            f"- **Failure behavior:** {require_text(rule.get('failure_behavior'), br_id + '.failure_behavior')}",
            f"- **Traceability:** {', '.join(rule.get('traceability', [])) or 'unresolved'}", ""
        ])
    out.extend([
        "Preserve every Rule ID, OCL expression and authoritative natural-language constraint exactly.", "",
        "Prompts A and D must reference applicable Rule IDs without redefining them. Backend/database enforcement remains authoritative across trust boundaries; frontend enforcement is an additional user-experience control.", "",
        "Do not invent missing thresholds, statuses, ownership, schema, enforcement layers or failure behavior. Record unresolved source information and stop for the researcher when it changes implementation.",
    ])
    print("\n".join(out).rstrip())


if __name__ == "__main__":
    main()
