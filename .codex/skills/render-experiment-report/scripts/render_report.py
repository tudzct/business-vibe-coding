#!/usr/bin/env python3
"""Render canonical Business Rule run JSON as Markdown."""

import argparse
import hashlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens" / "scripts"))
from metrics_contract import metrics_markdown, atomic_write


def optional_ui_lines(data):
    """UI is supplementary; incomplete optional data must not stop the report."""
    try:
        return _ui_lines(data)
    except (KeyError, TypeError, AttributeError, ValueError):
        return ["## Optional Figma UI accuracy", "",
                "UI result: N/A (optional assessment data is incomplete or unsupported).",
                "This does not block the experiment report or change its run status.", ""]


def _ui_lines(data):
    lines = []
    ui = data.get("ui_accuracy")
    if data.get("ui_accuracy_status") in ("researcher_managed", "measured"):
        lines.extend(["## Researcher-managed Figma/UI accuracy", "",
                      f"Status: {data.get('ui_accuracy_status')}",
                      f"Accuracy (%): {data.get('ui_accuracy_percent') if data.get('ui_accuracy_percent') is not None else 'N/A'}",
                      f"Evidence: {data.get('ui_accuracy_evidence') or 'N/A'}",
                      f"Recorded by: {data.get('ui_accuracy_recorded_by') or 'N/A'}", ""])
    elif ui:
        if not isinstance(ui, dict) or not isinstance(ui.get("assessments"), list):
            raise ValueError("Optional UI assessment is incomplete")
        current = next((item for item in ui.get("assessments", [])
                        if isinstance(item, dict) and item.get("assessment_id") == ui.get("current_assessment_id")), None)
        if current is None:
            raise ValueError("UI current assessment is missing")
        lines.extend(["## Figma UI accuracy", "",
                      f"Assessment: `{current['assessment_id']}` ({current['stage']})",
                      f"Status: {current['status']}",
                      ("UI checkpoints: " +
                       (f"{current['checkpoint_totals']['met']} met, {current['checkpoint_totals']['unmet']} unmet, "
                        f"{current['checkpoint_totals']['not_evaluable']} not evaluable, "
                        f"{current['checkpoint_totals']['total']} total"
                        if current.get('checkpoint_totals') else "N/A")),
                      f"Weighted accuracy (%): {current['weighted_percent'] if current['weighted_percent'] is not None else 'N/A'}",
                      f"Structural coverage (%): {current['structural_coverage_percent'] if current['structural_coverage_percent'] is not None else 'N/A'}",
                      "Perceptual similarity (separate): " + json.dumps(current['input'].get('perceptual_similarity'), ensure_ascii=False),
                      "Evidence and limitations: canonical ui_accuracy.assessments and run ui-accuracy reports.", ""])
    return lines


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    raw = args.input.read_bytes()
    data = json.loads(raw)
    business = data.get("business_rules", {})
    final = business.get("final", {})
    rows = final.get("requirements")
    if data.get("run_status") != "complete" or not isinstance(rows, list):
        raise ValueError("input must be a complete run with final Business Rule results")
    lines = [
        f"# Experiment run {data.get('run_id', '')}", "",
        f"- UC: `{data.get('uc_id', '')}`",
        f"- Prompt variant: `{data.get('prompt_variant', 'full')}`",
        f"- Canonical input: `{args.input}`",
        f"- Input SHA-256: `{hashlib.sha256(raw).hexdigest()}`", "",
        "## Final Business Rule assessment", "",
        "| BR ID | Status | Evidence |", "|---|---|---|"
    ]
    for row in rows:
        evidence = "; ".join(row.get("evidence", [])).replace("|", "\\|")
        lines.append(f"| {row.get('br_id', '')} | {row.get('status', '')} | {evidence} |")
    lines.extend(["", (f"BR counts: {final.get('met', 0)} met, {final.get('unmet', 0)} unmet, "
                        f"{final.get('not_evaluable', 0)} not evaluable, {final.get('total', 0)} total"), ""])
    flow = data.get("flow_accuracy")
    if flow:
        current = next((item for item in flow.get("assessments", [])
                        if item.get("assessment_id") == flow.get("current_assessment_id")), None)
        if current is None:
            raise ValueError("Flow current assessment is missing")
        counts = current.get("counts", {})
        lines.extend(["## Flow accuracy", "", f"Assessment: `{current['assessment_id']}` ({current['stage']})",
                      f"Rubric: `{flow.get('rubric_id', 'completion-critical-flow-v1')}`; compare only runs with the same rubric.",
                      f"Status: {current['status']}",
                      f"Flows: {counts.get('correct', 0)} correct, {counts.get('incorrect', 0)} incorrect, "
                      f"{counts.get('not_evaluable', 0)} not evaluable, {counts.get('total', 0)} total",
                      f"Flow error (%): {current.get('flow_error_percent') if current.get('flow_error_percent') is not None else 'N/A'}",
                      f"Flow accuracy (%): {current.get('flow_accuracy_percent') if current.get('flow_accuracy_percent') is not None else 'N/A'}",
                      f"Evaluated coverage (%): {current.get('evaluated_coverage_percent')}",
                      f"Accuracy bounds (%): {current.get('accuracy_lower_bound_percent')}–{current.get('accuracy_upper_bound_percent')}", ""])
    lines.extend(optional_ui_lines(data))
    if data.get("metrics") is not None:
        lines.append(metrics_markdown(data["metrics"]))
    elif data.get("metrics_schema_version") in (1, 2, 3):
        lines.extend(["Metrics pending: confirm the next telemetry gate after work completion.", ""])
    else:
        lines.extend(["Legacy run: historical metrics retain their original scope; no phase split was reconstructed.", ""])
    output = "\n".join(lines)
    if args.output:
        atomic_write(args.output, output, raw=True)
    else:
        print(output, end="")


if __name__ == "__main__":
    main()
