#!/usr/bin/env python3
"""Render canonical Business Rule run JSON as Markdown."""

import argparse
import hashlib
import json
from pathlib import Path


def metric(value):
    return "N/A" if value is None else value


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    raw = args.input.read_bytes()
    data = json.loads(raw)
    business = data.get("business_rules", {})
    final = business.get("final", {})
    tokens = data.get("tokens", {})
    rows = final.get("requirements")
    if data.get("run_status") != "complete" or not isinstance(rows, list):
        raise ValueError("input must be a complete run with final Business Rule results")
    lines = [
        f"# Experiment run {data.get('run_id', '')}", "",
        f"- UC: `{data.get('uc_id', '')}`",
        f"- Prompt variant: `{data.get('prompt_variant', 'full')}`",
        f"- Canonical input: `{args.input}`",
        f"- Input SHA-256: `{hashlib.sha256(raw).hexdigest()}`", "",
        "## Token telemetry", "",
        "| Stage | Tokens |", "|---|---:|",
        f"| Prompt generation | {metric(tokens.get('prompt_generation_total'))} |",
        f"| First-pass code generation | {metric(tokens.get('code_generation_total', tokens.get('initial_total')))} |",
        f"| Repairs | {metric(tokens.get('repair_total'))} |",
        f"| Implementation total | {metric(tokens.get('implementation_total', tokens.get('total')))} |",
        f"| Overall total | {metric(tokens.get('overall_total'))} |", "",
        "## Final Business Rule assessment", "",
        "| BR ID | Status | Evidence |", "|---|---|---|"
    ]
    for row in rows:
        evidence = "; ".join(row.get("evidence", [])).replace("|", "\\|")
        lines.append(f"| {row.get('br_id', '')} | {row.get('status', '')} | {evidence} |")
    lines.extend(["", f"Met: {final.get('met', 0)}/{final.get('total', 0)} ({final.get('acceptance_percent', 'N/A')}%)", ""])
    output = "\n".join(lines)
    if args.output:
        args.output.write_text(output, encoding="utf-8")
    else:
        print(output, end="")


if __name__ == "__main__":
    main()
