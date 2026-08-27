#!/usr/bin/env python3
"""Render Prompt E deterministically from selected canonical SEC records."""

import argparse
import json
import re
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_CATALOG = REPO_ROOT / "docs/00-context/security/OWASP-2025-SECURITY-CATALOG.json"
UC_PATTERN = re.compile(r"UC-\d{3,}")


def fail(message):
    raise ValueError(message)


def load_catalog(path):
    catalog = json.loads(path.read_text(encoding="utf-8"))
    if catalog.get("generation_contract", {}).get("projection_mode") != "exact-selected-records":
        fail("catalog does not declare exact-selected-records projection")
    requirements = catalog.get("requirements")
    if not isinstance(requirements, list) or not requirements:
        fail("catalog requirements must be a non-empty array")
    by_id = {}
    for item in requirements:
        if not isinstance(item, dict) or not isinstance(item.get("sec_id"), str):
            fail("every catalog requirement must have a string sec_id")
        if item["sec_id"] in by_id:
            fail(f"duplicate SEC ID: {item['sec_id']}")
        if item.get("security_point") != 1:
            fail(f"{item['sec_id']} must declare security_point=1")
        by_id[item["sec_id"]] = item
    return catalog, by_id


def requirement_id(uc_id, sec_id):
    if not sec_id.startswith("SEC-"):
        fail(f"invalid SEC ID: {sec_id}")
    return f"SR-{uc_id}-{sec_id[4:]}"


def render_field(label, value):
    return f"**{label}:**\n\n{value}"


def render_requirement(uc_id, item):
    fields = [
        f"### Security Requirement: {item['security_point_name']}",
        "",
        render_field("Requirement ID", requirement_id(uc_id, item["sec_id"])),
        "",
        render_field("OWASP category", item["owasp"]),
        "",
        render_field("SEC ID", item["sec_id"]),
        "",
        render_field("Security point", item["security_point"]),
        "",
        render_field("Vulnerability name", item["vulnerability_name"]),
        "",
        render_field("Applicability", item["applicability"]),
        "",
        render_field("Required condition", item["pass_condition"]),
        "",
        render_field("Source mappings", item["source_mappings"]),
        "",
        render_field("Primary source URL", item["primary_source_url"]),
        "",
        render_field("ASVS category", item["asvs_category"]),
        "",
        render_field("ASVS requirement verbatim", item["asvs_requirement_verbatim"]),
        "",
        render_field("ASVS applicability", item["asvs_applicability"]),
        "",
        render_field("ASVS MUST DO", item["asvs_must_do"]),
        "",
        render_field("ASVS MUST NOT DO", item["asvs_must_not"]),
        "",
        render_field("ASVS acceptance criteria", item["asvs_acceptance_criteria"]),
        "",
        render_field("Suggested SAST evidence", item["suggested_sast_evidence"]),
        "",
        render_field("Suggested DAST evidence", item["suggested_dast_evidence"]),
        "",
        render_field("ASVS PDF location", item["asvs_pdf_location"]),
    ]
    return "\n".join(str(value) for value in fields)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--uc-id", required=True)
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--selected", nargs="+")
    group.add_argument("--all", action="store_true")
    args = parser.parse_args()

    if UC_PATTERN.fullmatch(args.uc_id) is None:
        fail("--uc-id must use canonical form such as UC-001")

    catalog, by_id = load_catalog(args.catalog)
    selected = list(by_id) if args.all else args.selected
    if len(selected) != len(set(selected)):
        fail("selected SEC IDs must be unique")
    unknown = [sec_id for sec_id in selected if sec_id not in by_id]
    if unknown:
        fail(f"unknown SEC IDs: {', '.join(unknown)}")

    sections = [
        "## Prompt E: Security Requirements",
        "",
        "The following requirements are an exact projection of the canonical JSON catalog. "
        "Do not reinterpret, expand, merge, split, or supplement them.",
        "",
    ]
    sections.extend(render_requirement(args.uc_id, by_id[sec_id]) for sec_id in selected)
    print("\n\n".join(sections))


if __name__ == "__main__":
    main()
