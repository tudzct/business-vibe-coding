#!/usr/bin/env python3
"""Validate and calculate deterministic use-case generation audit metrics."""

import json
import re
import statistics
import sys
from datetime import datetime
from pathlib import Path


def number(value, field):
    if value is None:
        return None
    if not isinstance(value, (int, float)) or isinstance(value, bool) or value < 0:
        raise ValueError(f"{field} must be a non-negative number or null")
    return value


def required_text(value, field):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a non-empty string")
    return value.strip()


def timestamp_pair(iso_value, epoch_ms_value, field):
    iso_text = required_text(iso_value, f"{field}.iso")
    if not isinstance(epoch_ms_value, int) or isinstance(epoch_ms_value, bool) or epoch_ms_value < 0:
        raise ValueError(f"{field}.epoch_ms must be a non-negative integer")
    try:
        parsed = datetime.fromisoformat(iso_text.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(f"{field}.iso must be valid ISO-8601") from exc
    if parsed.tzinfo is None:
        raise ValueError(f"{field}.iso must include a timezone")
    parsed_epoch_ms = round(parsed.timestamp() * 1000)
    if abs(parsed_epoch_ms - epoch_ms_value) > 1000:
        raise ValueError(f"{field} ISO and epoch values differ by more than one second")
    return epoch_ms_value


def validate_model(model, field, allow_same=False, enforce_selection=True):
    if not isinstance(model, dict):
        raise ValueError(f"{field} must be an object")
    label = required_text(model.get("requested_label"), f"{field}.requested_label")
    model_id = required_text(model.get("requested_model_id"), f"{field}.requested_model_id")
    effort = required_text(model.get("requested_reasoning_effort"), f"{field}.requested_reasoning_effort")
    mode = required_text(model.get("requested_reasoning_mode"), f"{field}.requested_reasoning_mode")
    if allow_same and model_id == "same-as-generation":
        if effort != "same-as-generation" or mode != "same-as-generation":
            raise ValueError(f"{field} must use same-as-generation consistently")
        return label, model_id, effort, mode
    forbidden_requested = {"null", "unknown", "not-requested", "not-specified", "unavailable"}
    if enforce_selection and (label.lower() in forbidden_requested or model_id.lower() in forbidden_requested):
        raise ValueError(f"{field} requested model fields must come from a confirmed model selection")
    if effort not in {"none", "low", "medium", "high", "xhigh", "max"}:
        raise ValueError(f"{field}.requested_reasoning_effort is invalid")
    if mode not in {"standard", "pro"}:
        raise ValueError(f"{field}.requested_reasoning_mode is invalid")
    if label.lower() == "sol light" and (model_id != "gpt-5.6-sol" or effort != "low"):
        raise ValueError("Sol Light must map to gpt-5.6-sol with low reasoning effort")
    if label.lower() == "luna medium" and (model_id != "gpt-5.6-luna" or effort != "medium"):
        raise ValueError("Luna Medium must map to gpt-5.6-luna with medium reasoning effort")
    if label.lower() == "terra medium" and (model_id != "gpt-5.6-terra" or effort != "medium"):
        raise ValueError("Terra Medium must map to gpt-5.6-terra with medium reasoning effort")
    return label, model_id, effort, mode


def main(path_string):
    path = Path(path_string)
    data = json.loads(path.read_text(encoding="utf-8"))
    legacy_pre_gate = data.get("legacy_pre_gate") is True

    replicate_index = data.get("replicate_index")
    if not isinstance(replicate_index, int) or isinstance(replicate_index, bool) or replicate_index < 1:
        raise ValueError("replicate_index must be a positive integer")
    run_order = data.get("run_order")
    if not legacy_pre_gate and (not isinstance(run_order, int) or isinstance(run_order, bool) or run_order < 1):
        raise ValueError("run_order must be a positive integer for gate-version-2 runs")
    audit_protocol = data.get("audit_protocol")
    if audit_protocol not in {"fixed", "matched", "cross"}:
        raise ValueError("audit_protocol must be fixed, matched, or cross")
    gate_version = data.get("model_selection_gate_version")
    if not legacy_pre_gate and gate_version not in {2, 3}:
        raise ValueError("model_selection_gate_version must be 2 or 3 for new runs; only historical runs may set legacy_pre_gate=true")
    if not legacy_pre_gate:
        configuration = data.get("experiment_configuration")
        if not isinstance(configuration, dict):
            raise ValueError("experiment_configuration must be an object for gate-version-2 runs")
        for field in ("configuration_id", "comparison_group_id", "researcher_id", "artifact", "run_projection"):
            required_text(configuration.get(field), f"experiment_configuration.{field}")
        checksum = required_text(configuration.get("checksum"), "experiment_configuration.checksum")
        if re.fullmatch(r"sha256:[0-9a-f]{64}", checksum.lower()) is None:
            raise ValueError("experiment_configuration.checksum must be a complete SHA-256 checksum")
        run_id = required_text(data.get("run_id"), "run_id")
        if run_id not in configuration["run_projection"]:
            raise ValueError("experiment_configuration.run_projection must identify run_id")
    _, generation_id, generation_effort, generation_mode = validate_model(
        data.get("generation_model"), "generation_model", enforce_selection=not legacy_pre_gate
    )
    validate_model(data.get("audit_model"), "audit_model", allow_same=True, enforce_selection=not legacy_pre_gate)
    data["model_configuration_key"] = f"{generation_id}::{generation_effort}::{generation_mode}::r{replicate_index}"

    if "business" in data:
        raise ValueError("business metrics are outside this research scope")

    security = data.setdefault("security", {})
    for obsolete_field in ("evaluation_stage", "tool_evidence"):
        if obsolete_field in security:
            raise ValueError(f"security.{obsolete_field} is not part of source-based generation scoring")
    run_complete = data.get("run_status") == "complete"
    if run_complete:
        source_revision = required_text(security.get("source_revision"), "security.source_revision")
        if re.fullmatch(r"sha256:[0-9a-f]{64}", source_revision.lower()) is None:
            raise ValueError("security.source_revision must be a complete SHA-256 checksum")
    security_total = number(security.get("total"), "security.total")
    security_met = number(security.get("met"), "security.met")
    security_unmet = number(security.get("unmet"), "security.unmet")
    security_unknown = number(security.get("not_evaluable", 0), "security.not_evaluable")
    if run_complete and None in (security_total, security_met, security_unmet, security_unknown):
        raise ValueError("complete runs require non-null security total, met, unmet, and not_evaluable counts")
    if run_complete and any(not isinstance(value, int) or isinstance(value, bool) for value in (security_total, security_met, security_unmet, security_unknown)):
        raise ValueError("complete source-based security counts must be integers")
    if None not in (security_total, security_met, security_unmet, security_unknown) and security_met + security_unmet + security_unknown != security_total:
        raise ValueError("security counts must sum to security.total")
    security["acceptance_percent"] = None if not security_total or security_met is None else round(security_met / security_total * 100, 2)

    categories = security.setdefault("categories", {})
    allowed_categories = tuple(f"A{index:02d}" for index in range(1, 11))
    unexpected = set(categories) - set(allowed_categories)
    if unexpected:
        raise ValueError(f"security categories outside research scope: {sorted(unexpected)}")
    if run_complete and set(categories) != set(allowed_categories):
        raise ValueError("complete runs must contain source-based totals for every A01-A10 category")
    category_sums = {"total": 0, "met": 0, "unmet": 0, "not_evaluable": 0}
    complete_categories = True
    for category in allowed_categories:
        values = categories.setdefault(category, {})
        category_total = number(values.get("total"), f"security.categories.{category}.total")
        category_met = number(values.get("met"), f"security.categories.{category}.met")
        category_unmet = number(values.get("unmet"), f"security.categories.{category}.unmet")
        category_unknown = number(values.get("not_evaluable", 0), f"security.categories.{category}.not_evaluable")
        if None in (category_total, category_met, category_unmet, category_unknown):
            complete_categories = False
        else:
            if run_complete and any(not isinstance(value, int) or isinstance(value, bool) for value in (category_total, category_met, category_unmet, category_unknown)):
                raise ValueError(f"{category} source-based security counts must be integers")
            if category_met + category_unmet + category_unknown != category_total:
                raise ValueError(f"{category} security counts must sum to category total")
            category_sums["total"] += category_total
            category_sums["met"] += category_met
            category_sums["unmet"] += category_unmet
            category_sums["not_evaluable"] += category_unknown
        values["coverage_percent"] = None if not category_total or category_met is None else round(category_met / category_total * 100, 2)
    if complete_categories:
        for field, value in category_sums.items():
            existing = security_total if field == "total" else security.get(field)
            if existing is not None and existing != value:
                raise ValueError(f"security.{field} must equal the sum of active security categories")
            security[field] = value
        security["acceptance_percent"] = None if not security["total"] else round(security["met"] / security["total"] * 100, 2)

    requirements = security.get("requirements", [])
    if not isinstance(requirements, list):
        raise ValueError("security.requirements must be an array")
    if run_complete and len(requirements) != security_total:
        raise ValueError("complete runs require exactly one source-based assessment row per frozen SR")
    seen_sr_ids = set()
    seen_sec_ids = set()
    requirement_counts = {"met": 0, "unmet": 0, "not_evaluable": 0}
    category_requirement_counts = {
        category: {"total": 0, "met": 0, "unmet": 0, "not_evaluable": 0}
        for category in allowed_categories
    }
    for index, requirement in enumerate(requirements):
        if not isinstance(requirement, dict):
            raise ValueError(f"security.requirements[{index}] must be an object")
        sr_id = required_text(requirement.get("sr_id"), f"security.requirements[{index}].sr_id")
        sec_id = required_text(requirement.get("sec_id"), f"security.requirements[{index}].sec_id")
        category = required_text(requirement.get("category"), f"security.requirements[{index}].category")
        if sr_id in seen_sr_ids:
            raise ValueError(f"duplicate source-based SR result: {sr_id}")
        if sec_id in seen_sec_ids:
            raise ValueError(f"duplicate source-based SEC result: {sec_id}")
        if category not in allowed_categories:
            raise ValueError(f"security.requirements[{index}].category is invalid")
        if re.fullmatch(r"SEC-A[0-9]{2}-[0-9]{2}", sec_id) is None or sec_id[4:7] != category:
            raise ValueError(f"security.requirements[{index}].sec_id must match its category")
        status = requirement.get("status")
        if status not in requirement_counts:
            raise ValueError(f"security.requirements[{index}].status is invalid")
        evidence = requirement.get("evidence")
        if not isinstance(evidence, list) or not evidence or any(not isinstance(item, str) or not item.strip() for item in evidence):
            raise ValueError(f"security.requirements[{index}].evidence must contain inspectable evidence")
        required_text(requirement.get("rationale"), f"security.requirements[{index}].rationale")
        seen_sr_ids.add(sr_id)
        seen_sec_ids.add(sec_id)
        requirement_counts[status] += 1
        category_requirement_counts[category]["total"] += 1
        category_requirement_counts[category][status] += 1
    if run_complete:
        frozen_sec_ids = security.get("frozen_sec_ids")
        if not isinstance(frozen_sec_ids, list) or len(frozen_sec_ids) != security_total or set(frozen_sec_ids) != seen_sec_ids:
            raise ValueError("security.requirements SEC IDs must exactly match security.frozen_sec_ids")
        for status, count in requirement_counts.items():
            if security.get(status) != count:
                raise ValueError(f"security.{status} must equal source-based requirement rows")
        for category, counts in category_requirement_counts.items():
            for field, count in counts.items():
                if categories[category].get(field) != count:
                    raise ValueError(f"security.categories.{category}.{field} must equal source-based requirement rows")

    if data.get("timing_method") != "system_timestamp_delta":
        raise ValueError("timing_method must be system_timestamp_delta")
    wall_clock = data.get("timing_wall_clock")
    if not isinstance(wall_clock, dict):
        raise ValueError("timing_wall_clock must be an object")
    initial_start_ms = timestamp_pair(
        wall_clock.get("initial_started_at"), wall_clock.get("initial_started_epoch_ms"), "timing_wall_clock.initial_start"
    )
    initial_end_ms = timestamp_pair(
        wall_clock.get("initial_ended_at"), wall_clock.get("initial_ended_epoch_ms"), "timing_wall_clock.initial_end"
    )
    if initial_end_ms < initial_start_ms:
        raise ValueError("initial end timestamp must not precede start timestamp")
    timing = data.setdefault("timing_seconds", {})
    initial_time = round((initial_end_ms - initial_start_ms) / 1000, 3)
    supplied_initial = number(timing.get("initial"), "timing_seconds.initial")
    if supplied_initial is not None and abs(supplied_initial - initial_time) > 0.001:
        raise ValueError("timing_seconds.initial must equal the system timestamp delta")
    timing["initial"] = initial_time
    repairs = data.get("repairs", [])
    if not isinstance(repairs, list):
        raise ValueError("repairs must be an array")
    allowed_repair_categories = {"technical", "security", "ui", "flow"}
    allowed_repair_triggers = {"syntax", "compile", "lint", "runtime", "sca", "security_review", "ui_review", "flow_review"}
    seen_repair_ids = set()
    repair_durations = []
    for index, repair in enumerate(repairs):
        if not isinstance(repair, dict):
            raise ValueError(f"repairs[{index}] must be an object")
        repair_id = required_text(repair.get("repair_id"), f"repairs[{index}].repair_id")
        if repair_id in seen_repair_ids:
            raise ValueError(f"duplicate repair_id: {repair_id}")
        seen_repair_ids.add(repair_id)
        required_text(repair.get("sub_prompt_path"), f"repairs[{index}].sub_prompt_path")
        category = repair.get("category")
        if category not in allowed_repair_categories:
            raise ValueError(f"repairs[{index}].category is invalid")
        if repair.get("trigger") not in allowed_repair_triggers:
            raise ValueError(f"repairs[{index}].trigger is invalid")
        required_text(repair.get("error_fingerprint"), f"repairs[{index}].error_fingerprint")
        requirement_ids = repair.get("requirement_ids")
        if not isinstance(requirement_ids, list) or any(not isinstance(value, str) or not value.strip() for value in requirement_ids):
            raise ValueError(f"repairs[{index}].requirement_ids must be an array of non-empty strings")
        if category == "security" and not any(value.startswith("SR-") for value in requirement_ids):
            raise ValueError(f"repairs[{index}] security repair must reference at least one SR ID")
        for field in ("source_revision_before", "source_revision_after", "evidence_before", "evidence_after"):
            required_text(repair.get(field), f"repairs[{index}].{field}")
        files_changed = repair.get("files_changed")
        if not isinstance(files_changed, list) or any(not isinstance(value, str) or not value.strip() for value in files_changed):
            raise ValueError(f"repairs[{index}].files_changed must be an array of non-empty strings")
        if repair.get("status") not in {"resolved", "unresolved", "blocked"}:
            raise ValueError(f"repairs[{index}].status is invalid")
        if repair.get("timing_method") != "system_timestamp_delta":
            raise ValueError(f"repairs[{index}].timing_method must be system_timestamp_delta")
        repair_wall_clock = repair.get("timing_wall_clock")
        if not isinstance(repair_wall_clock, dict):
            raise ValueError(f"repairs[{index}].timing_wall_clock must be an object")
        repair_start_ms = timestamp_pair(
            repair_wall_clock.get("started_at"), repair_wall_clock.get("started_epoch_ms"), f"repairs[{index}].start"
        )
        repair_end_ms = timestamp_pair(
            repair_wall_clock.get("ended_at"), repair_wall_clock.get("ended_epoch_ms"), f"repairs[{index}].end"
        )
        if repair_end_ms < repair_start_ms:
            raise ValueError(f"repairs[{index}] end timestamp must not precede start timestamp")
        duration = round((repair_end_ms - repair_start_ms) / 1000, 3)
        supplied_duration = number(repair.get("duration_seconds"), f"repairs[{index}].duration_seconds")
        if supplied_duration is not None and abs(supplied_duration - duration) > 0.001:
            raise ValueError(f"repairs[{index}].duration_seconds must equal the system timestamp delta")
        repair["duration_seconds"] = duration
        repair_durations.append(duration)
        repair_model = repair.get("model")
        if not isinstance(repair_model, dict):
            raise ValueError(f"repairs[{index}].model must record the repair model configuration")
        executed_model_id = repair_model.get("effective_model_id") or repair_model.get("requested_model_id")
        required_text(executed_model_id, f"repairs[{index}].model model ID")
        repair_effort = required_text(repair_model.get("requested_reasoning_effort"), f"repairs[{index}].model.requested_reasoning_effort")
        repair_mode = required_text(repair_model.get("requested_reasoning_mode"), f"repairs[{index}].model.requested_reasoning_mode")
        if repair_effort not in {"none", "low", "medium", "high", "xhigh", "max"}:
            raise ValueError(f"repairs[{index}].model.requested_reasoning_effort is invalid")
        if repair_mode not in {"standard", "pro"}:
            raise ValueError(f"repairs[{index}].model.requested_reasoning_mode is invalid")
    security_repairs = [repair for repair in repairs if repair.get("category") == "security"]
    security_durations = [number(repair.get("duration_seconds"), "repair.duration_seconds") for repair in security_repairs]
    timing["security_repairs"] = None if any(value is None for value in security_durations) else round(sum(security_durations), 3)
    timing["all_repairs"] = None if any(value is None for value in repair_durations) else round(sum(repair_durations), 3)
    timing["whole_uc"] = None if initial_time is None or timing["all_repairs"] is None else round(initial_time + timing["all_repairs"], 3)
    data["security_repair_sub_prompt_count"] = len(security_repairs)
    data["all_sub_prompt_count"] = len(repairs)

    tokens = data.setdefault("tokens", {})
    initial_tokens = number(tokens.get("initial_total"), "tokens.initial_total")
    repair_values = [number(r.get("total_tokens"), "repair.total_tokens") for r in repairs]
    tokens["all_repairs_total"] = None if any(v is None for v in repair_values) else sum(repair_values)
    tokens["whole_uc_total"] = None if initial_tokens is None or tokens["all_repairs_total"] is None else initial_tokens + tokens["all_repairs_total"]

    estimates = data.get("manual_estimates_minutes", [])
    values = [number(e.get("minutes"), "manual_estimates_minutes.minutes") for e in estimates]
    values = [v for v in values if v is not None]
    data["manual_estimate_median_minutes"] = statistics.median(values) if len(values) >= 3 else None
    data["manual_estimate_mean_minutes"] = round(statistics.mean(values), 2) if len(values) >= 3 else None

    complexity = data.get("complexity", {})
    parts = complexity.get("components", {})
    if parts:
        for name, value in parts.items():
            if not isinstance(value, int) or value not in (0, 1, 2):
                raise ValueError(f"complexity.components.{name} must be 0, 1, or 2")
        score = sum(parts.values())
        complexity["score"] = score
        complexity["level"] = "Low" if score <= 4 else "Medium" if score <= 9 else "High"

    for field in ("ui_accuracy_percent", "flow_accuracy_percent"):
        value = data.get(field)
        if value is not None and (not isinstance(value, (int, float)) or not 0 <= value <= 100):
            raise ValueError(f"{field} must be between 0 and 100 or null")

    print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: calculate_metrics.py <audit.json>")
    try:
        main(sys.argv[1])
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise SystemExit(f"audit error: {exc}")
