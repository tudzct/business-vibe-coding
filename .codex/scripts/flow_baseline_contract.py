"""Deterministic structural contract for a frozen flow baseline."""

import re

from metrics_contract import ROOT, digest, epoch, require, writable


FLOW_TYPES = ("main", "alternative", "exception")
FLOW_PREFIX_TYPES = {"BF": "main", "AF": "alternative", "EF": "exception"}


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def source_flow_ids(raw):
    """Extract the ordered flow inventory without interpreting flow semantics."""
    content = raw.decode("utf-8-sig")
    headings = list(re.finditer(r"(?m)^(##|###)\s+([^\r\n]+?)\s*\r?$", content))
    require(headings, "frozen UC flow headings missing")
    scope, result, basic_counts = "", [], {}
    for index, heading in enumerate(headings):
        level, title = heading.group(1), heading.group(2).strip()
        if level == "##":
            variant = re.match(r"(UC-[0-9]+(?:\.[0-9]+)?)\s+UI Variant\b", title, re.I)
            scope = f"{variant.group(1).upper()}/" if variant else ""
            continue
        end = headings[index + 1].start() if index + 1 < len(headings) else len(content)
        section = content[heading.end():end]
        if re.fullmatch(r"(?:Basic|Main) Flow", title, re.I):
            count = basic_counts.get(scope, 0) + 1
            basic_counts[scope] = count
            result.append(f"{scope}BF-{count}")
        elif re.fullmatch(r"Alternative Flow", title, re.I):
            result.extend(f"{scope}{value}" for value in re.findall(r"(?m)^(AF-[0-9]+)(?=:)", section))
        elif re.fullmatch(r"Exception Flow", title, re.I):
            result.extend(f"{scope}{value}" for value in re.findall(r"(?m)^(EF-[0-9]+)(?=:)", section))
    require(result and len(result) == len(set(result)), "frozen UC flow IDs missing or duplicated")
    return result


def flow_type(flow_id):
    match = re.fullmatch(r"(?:UC-[0-9]+(?:\.[0-9]+)?/)?(BF|AF|EF)-[0-9]+", flow_id or "")
    require(match is not None, f"invalid flow ID: {flow_id}")
    return FLOW_PREFIX_TYPES[match.group(1)]


def validate_baseline(data):
    expected_fields = {"schema_version", "artifact_type", "status", "uc_id", "use_case_path",
                       "use_case_sha256", "ordered_flow_ids", "frozen_at"}
    require(set(data) == expected_fields, "invalid flow baseline fields")
    require(data.get("schema_version") == 1 and data.get("artifact_type") == "flow-baseline",
            "invalid baseline schema")
    require(data.get("status") == "Frozen" and nonempty(data.get("uc_id")), "baseline must be Frozen")
    uc_path = writable(ROOT / data.get("use_case_path", ""))
    require(uc_path.is_file(), "baseline UC path missing")
    raw = uc_path.read_bytes()
    require(data.get("use_case_sha256") == digest(raw), "frozen UC changed")
    epoch(data.get("frozen_at"))
    ids = data.get("ordered_flow_ids")
    require(isinstance(ids, list) and ids and all(nonempty(value) for value in ids), "ordered flow IDs required")
    require(len(ids) == len(set(ids)), "duplicate flow IDs")
    for flow_id in ids:
        flow_type(flow_id)
    require(ids == source_flow_ids(raw), "frozen UC/flow baseline order conflict")
    counts = {kind: sum(flow_type(value) == kind for value in ids) for kind in FLOW_TYPES}
    counts["total"] = len(ids)
    require(counts["main"] > 0, "flow baseline needs a Basic/Main Flow")
    return ids, counts
