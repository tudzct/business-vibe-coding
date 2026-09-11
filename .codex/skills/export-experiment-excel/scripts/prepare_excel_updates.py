#!/usr/bin/env python3
"""Resolve an AI-inspected Excel mapping into traceable scalar updates; no XLSX writes."""

import argparse
import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens/scripts"))
from metrics_contract import ROOT, atomic_write, digest, read_json, require, validate_metrics, writable

IDENTITY = {"uc_id", "run_id", "prompt_variant", "replicate_index", "run_order", "generation_model.requested_model_id"}
SCOPES = {"prompt_generation", "source_generation", "repair", "workflow"}
VALUE_TAIL = (r"(?:tokens\.(?:input_tokens|cached_input_tokens|output_tokens|reasoning_output_tokens|total_tokens)"
              r"|duration_seconds|workflow_turn_count|tool_call_count|model_call_count)")


def validate_profile_field(profile, scope, field):
    if profile != "measure_telemetry_only" or field is None:
        return
    if scope == "workflow":
        expected = rf"metrics\.workflow\.{VALUE_TAIL}"
    else:
        expected = rf"metrics\.phases\.{re.escape(scope)}\.values\.{VALUE_TAIL}"
    require(re.fullmatch(expected, field) is not None,
            f"field is outside Measure telemetry scope {scope}: {field}")


def lookup(record, field):
    require(isinstance(field, str) and field, "missing or ambiguous field")
    for part in field.split("."):
        require(part not in ("__proto__", "constructor", "prototype") and re.fullmatch(r"[A-Za-z0-9_]+", part),
                "invalid JSON path")
        if isinstance(record, dict) and part in record:
            record = record[part]
        elif isinstance(record, list) and part.isdigit() and int(part) < len(record):
            record = record[int(part)]
        else:
            raise ValueError(f"missing field: {field}")
    return record


def resolve_value(record, field, kind, conversion):
    if field.startswith("metrics."):
        metrics = record.get("metrics")
        require(isinstance(metrics, dict) and metrics.get("schema_version") == 1, "no phase-aware finalized metrics")
        validate_metrics(metrics)
        require(metrics.get("uc_id") == record.get("uc_id") and metrics.get("run_id") == record.get("run_id"),
                "metrics/run identity mismatch")
        if field.startswith("metrics.phases."):
            parts = field.split(".")
            require(len(parts) >= 5 and parts[3] == "values", "map phase values, not phase internals")
            phase = metrics["phases"][parts[2]]
            require(phase.get("status") == "closed", phase.get("reason") or "phase is not closed")
        else:
            require(field.startswith("metrics.workflow."), "map workflow values, not telemetry internals")
            require(metrics.get("status") == "finalized", "workflow metrics are not finalized")
    if field == "ui_accuracy_percent" and "ui_accuracy" in record:
        require(record.get("ui_accuracy_status") in ("scored", "repair_required", "similarity_pending"),
                "UI score is unavailable")
    value = lookup(record, field)
    require(value is not None, f"null/unavailable source value: {field}")
    require(not isinstance(value, str) or value.strip(), f"empty source value: {field}")
    allowed = {"number": type(value) in (int, float), "integer": type(value) is int,
               "string": isinstance(value, str), "boolean": type(value) is bool}
    require(allowed.get(kind, False), f"source type does not match {kind}")
    if type(value) in (int, float):
        require(math.isfinite(value), "non-finite numeric value")
    if conversion == "seconds_to_minutes":
        require(field.endswith(".duration_seconds") and kind == "number", "seconds conversion requires duration field")
        value /= 60
    elif conversion == "percent_to_fraction":
        require(field.endswith("_percent") and kind == "number" and 0 <= value <= 100, "percent conversion requires 0..100 percent field")
        value /= 100
    else:
        require(conversion == "identity", "unknown conversion")
    return value


def prepare(mapping):
    require(mapping.get("schema_version") == 1, "unknown mapping schema")
    profile = mapping.get("profile", "all_available")
    require(profile in ("all_available", "measure_telemetry_only"), "unknown export profile")
    scope = mapping.get("measurement_scope")
    if profile == "measure_telemetry_only":
        require(scope in SCOPES, "Measure export requires one exact measurement_scope")
        require(len(mapping.get("sources", [])) == 1, "Measure export requires exactly one canonical run source")
    else:
        require(scope is None, "measurement_scope is only valid for Measure telemetry export")
    require(Path(mapping["repo_root"]).resolve() == ROOT, "repo_root must be the Business repository")
    workbook = (ROOT / mapping["workbook"]).resolve()
    require(workbook.is_file() and workbook.suffix.lower() == ".xlsx", "existing .xlsx workbook required")
    require(digest(workbook.read_bytes()) == mapping["workbook_sha256"], "workbook changed since inspection")
    sources, errors, seen_sources = [], [], set()
    for source in mapping["sources"]:
        path = writable(ROOT / source)
        require(path not in seen_sources, "duplicate source path")
        seen_sources.add(path)
        require(path.is_relative_to(ROOT / "docs/05-experiments") and path.parent.parent == ROOT / "docs/05-experiments"
                and path.parent.name != "configurations" and path.suffix == ".json", "source must be canonical UC/run JSON")
        try:
            raw = path.read_bytes()
            record = json.loads(raw.decode("utf-8-sig"))
            require(isinstance(record, dict) and record.get("uc_id") == path.parent.name and record.get("run_id") == path.stem,
                    "canonical path/identity mismatch")
            sources.append((str(path), digest(raw), record))
        except (OSError, ValueError) as error:
            errors.append({"path": str(path), "reason": str(error)})
    updates, seen = [], set()
    require(isinstance(mapping.get("cells"), list) and mapping["cells"], "no writable result cells identified; report unresolved destinations without exporting")
    for cell in mapping["cells"]:
        require(isinstance(cell.get("sheet"), str) and cell["sheet"], "sheet required")
        require(re.fullmatch(r"[A-Z]{1,3}[1-9][0-9]{0,6}", cell.get("cell", "")), "single A1 cell required")
        key = (cell["sheet"], cell["cell"])
        require(key not in seen, f"duplicate target {key}")
        seen.add(key)
        require("expected_value" in cell and cell.get("basis") and cell.get("review_range"), "observed cell/header context required")
        require(type(cell.get("overwrite_existing", False)) is bool, "invalid overwrite flag")
        validate_profile_field(profile, scope, cell.get("field"))
        update = dict(cell, value="N/A", reason=None, source=None, source_sha256=None)
        try:
            identity = cell.get("identity", {})
            require(identity and set(identity) <= IDENTITY and "uc_id" in identity, "unresolved/invalid run identity")
            require(not errors, "candidate result unreadable; cannot establish unique identity (see source_errors)")
            matches = []
            for source, checksum, record in sources:
                try:
                    match = all(lookup(record, k) == v for k, v in identity.items())
                except ValueError:
                    match = False
                if match:
                    matches.append((source, checksum, record))
            require(len(matches) == 1, f"expected one source record, found {len(matches)}")
            source, checksum, record = matches[0]
            update.update(source=source, source_sha256=checksum)
            require(cell.get("field") is not None, cell.get("unresolved_reason") or "metric/units ambiguous")
            update["value"] = resolve_value(record, cell["field"], cell.get("type"), cell.get("conversion", "identity"))
        except (ValueError, KeyError, TypeError, IndexError) as error:
            update["reason"] = str(error)
        updates.append(update)
    return {"schema_version": 1, "profile": profile, "measurement_scope": scope,
            "repo_root": str(ROOT), "workbook": str(workbook),
            "workbook_sha256": mapping["workbook_sha256"], "updates": updates,
            "issues": mapping.get("issues", []), "source_errors": errors,
            "filled_count": sum(u["reason"] is None for u in updates),
            "na_count": sum(u["reason"] is not None for u in updates)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mapping", required=True, type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    result = prepare(read_json(args.mapping))
    if args.output:
        atomic_write(args.output, result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
