#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path


def scalar(value):
    if value is None:
        return "`null`"
    if isinstance(value, bool):
        return "`true`" if value else "`false`"
    if isinstance(value, (dict, list)):
        return f"`{json.dumps(value, ensure_ascii=False, separators=(',', ':'))}`"
    return str(value).replace("|", "\\|").replace("\n", " ")


def field(lines, label, value):
    lines.append(f"- **{label}:** {scalar(value)}")


def nested(lines, title, value, level=3):
    if lines and lines[-1] != "":
        lines.append("")
    lines.extend([f"{'#' * level} {title}", ""])
    if isinstance(value, dict):
        if not value:
            lines.append("- _(empty)_")
        for key, item in value.items():
            label = key.replace("_", " ").title()
            if isinstance(item, (dict, list)):
                nested(lines, label, item, min(level + 1, 6))
            else:
                field(lines, label, item)
    elif isinstance(value, list):
        if not value:
            lines.append("- _(empty)_")
        for index, item in enumerate(value, 1):
            if isinstance(item, (dict, list)):
                nested(lines, f"Item {index}", item, min(level + 1, 6))
            else:
                lines.append(f"- {scalar(item)}")
    elif value is None:
        lines.append("- `null`")
    else:
        lines.append(scalar(value))
    lines.append("")


def model_summary(model, effective=False):
    keys = ("effective_model_id", "effective_snapshot", "effective_reasoning_effort") if effective else (
        "requested_model_id", "requested_reasoning_effort", "requested_reasoning_mode"
    )
    return " / ".join(scalar(model.get(key)) for key in keys)


def repair_table(lines, repairs):
    if lines and lines[-1] != "":
        lines.append("")
    lines.extend([
        "### Repair iterations", "",
        "| Repair ID | Category | Trigger | Error fingerprint | Requirement IDs | Model/config | Start ISO/epoch ms | End ISO/epoch ms | Duration seconds | Tokens | Status | Sub-prompt/evidence |",
        "|---|---|---|---|---|---|---|---|---:|---:|---|---|",
    ])
    if not repairs:
        lines.append("| — | — | — | — | — | — | — | — | — | — | — | No repair iterations |")
    for repair in repairs:
        wall = repair.get("timing_wall_clock", {})
        evidence = " / ".join(str(value) for value in (
            repair.get("sub_prompt_path"), repair.get("evidence_before"), repair.get("evidence_after")
        ) if value)
        cells = [
            repair.get("repair_id"), repair.get("category"), repair.get("trigger"),
            repair.get("error_fingerprint"), repair.get("requirement_ids"),
            model_summary(repair.get("model", {})),
            f"{scalar(wall.get('started_at'))} / {scalar(wall.get('started_epoch_ms'))}",
            f"{scalar(wall.get('ended_at'))} / {scalar(wall.get('ended_epoch_ms'))}",
            repair.get("duration_seconds"), repair.get("total_tokens"), repair.get("status"), evidence,
        ]
        lines.append("| " + " | ".join(scalar(cell) for cell in cells) + " |")
    lines.append("")
    for repair in repairs:
        nested(lines, f"{repair.get('repair_id', 'Repair')} complete record", repair, 4)


def render_report(data, source, digest):
    config = data.get("experiment_configuration", {})
    generation = data.get("generation_model", {})
    audit = data.get("audit_model", {})
    baseline = data.get("baseline", {})
    wall = data.get("timing_wall_clock", {})
    seconds = data.get("timing_seconds", {})
    tokens = data.get("tokens", {})
    complexity = data.get("complexity", {})
    repairs = data.get("repairs", [])
    security = data.get("security", {})

    lines = [
        f"# Use-case generation audit — {data['run_id']}", "",
        "> Researcher-readable deterministic view of the canonical JSON. This Markdown is not evidence or a source of truth.", "",
        "## Identification", "",
    ]
    identification = [
        ("Run ID", data.get("run_id")),
        ("Run status", data.get("run_status")),
        ("Unified experiment configuration ID/path/checksum", f"{scalar(config.get('configuration_id'))} / {scalar(config.get('artifact'))} / {scalar(config.get('checksum'))}"),
        ("Comparison group ID and researcher ID", f"{scalar(config.get('comparison_group_id'))} / {scalar(config.get('researcher_id'))}"),
        ("Use case ID and name", f"{scalar(data.get('uc_id'))} / {scalar(data.get('uc_name'))}"),
        ("Replicate index and run order", f"{scalar(data.get('replicate_index'))} / {scalar(data.get('run_order'))}"),
        ("Audit protocol", data.get("audit_protocol")),
        ("Input-bundle/code revision", baseline.get("source_revision")),
        ("Confirmed model-selection artifact", config.get("run_activation")),
        ("Run-specific model-selection projection", config.get("run_projection")),
        ("Model-selection gate version", data.get("model_selection_gate_version")),
        ("Generation model requested label", generation.get("requested_label")),
        ("Generation requested model/reasoning", model_summary(generation)),
        ("Generation effective model/snapshot/reasoning", model_summary(generation, True)),
        ("Generation telemetry limitation", generation.get("telemetry_unavailable_reason")),
        ("Audit requested model/reasoning", model_summary(audit)),
        ("Audit effective model/snapshot/reasoning", model_summary(audit, True)),
        ("Audit telemetry limitation", audit.get("telemetry_unavailable_reason")),
        ("Codex client pre-generation version", generation.get("codex_client", {}).get("pre_generation_version") if isinstance(generation.get("codex_client"), dict) else generation.get("codex_client_version")),
        ("Audit Codex client version", audit.get("codex_client_version")),
        ("Model configuration key", data.get("model_configuration_key")),
        ("UC complexity level and score", f"{scalar(complexity.get('level'))} / {scalar(complexity.get('score'))}"),
    ]
    for label, value in identification:
        field(lines, label, value)
    nested(lines, "Complexity rationale/components", complexity.get("components", {}))
    nested(lines, "Baseline", baseline)

    lines.extend(["## Generation efficiency", ""])
    efficiency = [
        ("Timing method", data.get("timing_method")),
        ("First generation start ISO/epoch ms", f"{scalar(wall.get('initial_started_at'))} / {scalar(wall.get('initial_started_epoch_ms'))}"),
        ("First generation end ISO/epoch ms", f"{scalar(wall.get('initial_ended_at'))} / {scalar(wall.get('initial_ended_epoch_ms'))}"),
        ("First generation duration seconds", seconds.get("initial")),
        ("All sub-prompt count", data.get("all_sub_prompt_count", len(repairs))),
        ("Security repair sub-prompt count", data.get("security_repair_sub_prompt_count", sum(1 for item in repairs if item.get("category") == "security"))),
        ("Total all-repair duration seconds", seconds.get("all_repairs")),
        ("Total security-repair duration seconds", seconds.get("security_repairs")),
        ("Whole-UC duration seconds", seconds.get("whole_uc")),
        ("Initial input/output/total tokens", f"{scalar(tokens.get('initial_input'))} / {scalar(tokens.get('initial_output'))} / {scalar(tokens.get('initial_total'))}"),
        ("All repair tokens", tokens.get("all_repairs_total")),
        ("Whole-UC tokens", tokens.get("whole_uc_total")),
        ("Token telemetry limitation", tokens.get("unavailable_reason")),
    ]
    for label, value in efficiency:
        field(lines, label, value)
    nested(lines, "Initial generation and build evidence", data.get("initial_generation", {}))
    repair_table(lines, repairs)

    lines.extend(["## Manual baseline", ""])
    estimates = data.get("manual_estimates_minutes", [])
    for index in range(3):
        field(lines, f"Expert {index + 1} estimate", estimates[index] if index < len(estimates) else None)
    field(lines, "Median manual estimate minutes", data.get("manual_estimate_median_minutes"))
    field(lines, "Mean manual estimate minutes", data.get("manual_estimate_mean_minutes"))
    lines.append("")

    lines.extend(["## Supporting quality metrics", ""])
    for label, key in (
        ("UI accuracy percentage", "ui_accuracy_percent"),
        ("UI accuracy status/evidence", "ui_accuracy_status"),
        ("Flow accuracy percentage", "flow_accuracy_percent"),
        ("Flow accuracy status/evidence", "flow_accuracy_status"),
    ):
        field(lines, label, data.get(key))
    nested(lines, "Figma evidence", data.get("figma", {}))
    nested(lines, "Flow checkpoints", data.get("flow_checkpoints", []))
    nested(lines, "Runtime verification", data.get("runtime_verification"))

    lines.extend(["## Prompt E source-based security assessment", ""])
    field(lines, "Frozen selected SR total", security.get("total"))
    field(lines, "Security result counts", {key: security.get(key) for key in ("met", "unmet", "not_evaluable")})
    field(lines, "Security source revision", security.get("source_revision"))
    field(lines, "Final source hash after terminal repair", data.get("final_source_hash"))
    nested(lines, "Category totals", security.get("categories", {}))
    nested(lines, "Frozen security requirements and generation evidence", security.get("requirements", []))

    lines.extend(["## Audit provenance", ""])
    provenance = [
        ("Canonical JSON", source.as_posix()), ("Canonical SHA-256", digest),
        ("Researcher/auditor", config.get("researcher_id")), ("Prompt artifact", baseline.get("prompt")),
        ("Schema artifact", baseline.get("schema")), ("Configuration artifact", config.get("artifact")),
        ("Run activation artifact", config.get("run_activation")),
        ("Unknown/unavailable fields", "Preserved as `null` or explicit unavailable reasons from canonical JSON."),
    ]
    for label, value in provenance:
        field(lines, label, value)
    lines.append("")

    mapped = {
        "run_id", "run_status", "model_selection_gate_version", "experiment_configuration",
        "uc_id", "uc_name", "replicate_index", "run_order",
        "audit_protocol", "generation_model", "audit_model", "baseline", "timing_method",
        "timing_wall_clock", "timing_seconds", "tokens", "initial_generation", "security", "repairs",
        "manual_estimates_minutes", "manual_estimate_median_minutes", "manual_estimate_mean_minutes",
        "figma", "ui_accuracy_percent", "ui_accuracy_status", "flow_accuracy_percent",
        "flow_accuracy_status", "flow_checkpoints", "runtime_verification", "complexity",
        "final_source_hash", "model_configuration_key", "security_repair_sub_prompt_count",
        "all_sub_prompt_count",
    }
    additional = {key: value for key, value in data.items() if key not in mapped}
    if additional:
        nested(lines, "Additional canonical fields", additional, 2)

    return "\n".join(lines).rstrip() + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    raw = args.input.read_bytes()
    data = json.loads(raw)
    for required in ("run_id", "uc_id", "run_status"):
        if required not in data:
            raise SystemExit(f"missing required field: {required}")
    if data["run_status"] != "complete":
        raise SystemExit("experiment report can be rendered only from a complete canonical run")
    security = data.get("security")
    if not isinstance(security, dict):
        raise SystemExit("missing source-based security assessment")
    counts = [security.get(key) for key in ("total", "met", "unmet", "not_evaluable")]
    if any(not isinstance(value, int) or isinstance(value, bool) or value < 0 for value in counts):
        raise SystemExit("complete source-based security counts must be non-negative integers")
    if sum(counts[1:]) != counts[0]:
        raise SystemExit("source-based security result counts must sum to total")
    requirements = security.get("requirements")
    if not isinstance(requirements, list) or len(requirements) != counts[0]:
        raise SystemExit("complete runs require one source-based assessment row per frozen SR")
    valid_statuses = {"met", "unmet", "not_evaluable"}
    for index, requirement in enumerate(requirements):
        if not isinstance(requirement, dict):
            raise SystemExit(f"security requirement row {index} must be an object")
        for field in ("sr_id", "sec_id", "category", "rationale"):
            if not isinstance(requirement.get(field), str) or not requirement[field].strip():
                raise SystemExit(f"security requirement row {index} has invalid {field}")
        if requirement.get("status") not in valid_statuses:
            raise SystemExit(f"security requirement row {index} has invalid status")
        evidence = requirement.get("evidence")
        if not isinstance(evidence, list) or not evidence or any(not isinstance(item, str) or not item.strip() for item in evidence):
            raise SystemExit(f"security requirement row {index} has invalid evidence")
    output = args.output or args.input.with_suffix(".md")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render_report(data, args.input, hashlib.sha256(raw).hexdigest()), encoding="utf-8")
    print(output)


if __name__ == "__main__":
    main()
