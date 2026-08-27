#!/usr/bin/env python3
"""Render canonical security evaluation JSON as a safe Markdown view."""

import argparse
import hashlib
import json
from pathlib import Path


def cell(value) -> str:
    if value is None:
        return "`null`"
    if isinstance(value, bool):
        return "`true`" if value else "`false`"
    return str(value).replace("|", "\\|").replace("\n", " ")


def bullet(label: str, value) -> str:
    return f"- **{label}:** {cell(value)}"


def table(headers: list[str], rows: list[list]) -> list[str]:
    if not rows:
        return ["_(none)_", ""]
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    lines.extend("| " + " | ".join(cell(value) for value in row) + " |" for row in rows)
    return lines + [""]


def render_v5(data: dict) -> list[str]:
    result = data["result"]
    source = data["source"]
    refs = data["refs"]
    execution = data.get("execution", {})
    lines = [
        "## Result", "",
        bullet("Status", result["status"]),
        bullet("Potential findings", result["potential_findings"]),
        bullet("Unscored observations", result["unscored_observations"]),
        bullet("A01", result.get("by_category", {}).get("A01", 0)),
        bullet("A02", result.get("by_category", {}).get("A02", 0)), "",
        "## Source integrity", "",
        bullet("Evaluation scope", data["evaluation_scope"]),
        bullet("Source root", data["source_root"]),
        bullet("Contributing UC range", f"{data['contributing_uc_range']['from']} → {data['contributing_uc_range']['to']}"),
        bullet("Frozen hash", source["frozen_hash"]),
        bullet("After hash", source["after_hash"]),
        bullet("Unchanged", source["unchanged"]), "",
        "## Evaluator references", "",
        bullet("Criteria catalog", f"{refs['criteria_catalog']['id']} — {refs['criteria_catalog']['path']}@{refs['criteria_catalog']['checksum']}"),
        bullet("Policy", f"{refs['policy']['id']} — {refs['policy']['path']}@{refs['policy']['checksum']}"),
        bullet("Tool lock", f"{refs['tool_lock']['id']} — {refs['tool_lock']['path']}@{refs['tool_lock']['checksum']}"), "",
        "## Tool execution", "",
    ]
    tool_rows = [[key, tool.get("name"), tool.get("status"), tool.get("exit_code"), tool.get("image")] for key, tool in execution.get("tools", {}).items()]
    lines.extend(table(["Kind", "Tool", "Status", "Exit", "Image"], tool_rows))
    coverage = data.get("coverage", {})
    for title, key in (("Authentication and role contexts", "contexts"), ("Runtime targets", "target_sets"), ("Coverage units", "units")):
        lines.extend([f"## {title}", ""])
        rows = [[item.get("id"), item.get("status"), item.get("reason_code", "")] for item in coverage.get(key, [])]
        lines.extend(table(["ID", "Status", "Reason"], rows))
    lines.extend(["## Findings", ""])
    finding_rows = [[item.get("id"), item.get("tool"), item.get("criterion_id"), item.get("rule_id"), item.get("category"), ", ".join(item.get("cwe_ids", [])), item.get("status"), item.get("triage")] for item in data.get("findings", [])]
    lines.extend(table(["ID", "Tool", "Criterion", "Rule", "Category", "CWE", "Status", "Triage"], finding_rows))
    lines.extend(["## Limitations", ""])
    limitations = coverage.get("limitations", [])
    if limitations:
        for item in limitations:
            lines.append(f"- {cell(item.get('code'))}: {cell(item.get('detail'))}" if isinstance(item, dict) else f"- {cell(item)}")
        lines.append("")
    else:
        lines.extend(["_(none recorded)_", ""])
    runtime = execution.get("runtime", {})
    lines.extend(["## Research environment", ""])
    for label, url in runtime.get("urls", {}).items():
        lines.append(bullet(label.replace("_", " ").title(), url))
    lines.extend([bullet("Stack left running", runtime.get("stack_left_running")), bullet("Safe down command", runtime.get("down_command")), ""])
    return lines


def render_v3(data: dict) -> list[str]:
    run = data.get("run", {})
    source = run.get("source", {})
    lines = [
        "## Result", "",
        bullet("Status", data.get("result")),
        bullet("Potential findings", data.get("potential_findings", 0)),
        bullet("Unscored observations", data.get("unscored_observations", 0)),
        bullet("A01", data.get("by_category", {}).get("A01", 0)),
        bullet("A02", data.get("by_category", {}).get("A02", 0)), "",
        "## Source integrity", "",
        bullet("Before hash", source.get("before_hash", data.get("source_revision"))),
        bullet("After hash", source.get("after_hash", data.get("source_revision"))),
        bullet("Unchanged", source.get("unchanged")), "",
        "## Evaluator policy", "",
        bullet("Policy", data.get("policy_id")), "",
        "## Tool execution", "",
    ]
    tool_rows = [[key, tool.get("name"), tool.get("status"), tool.get("exit_code"), tool.get("image")] for key, tool in data.get("tools", {}).items()]
    lines.extend(table(["Kind", "Tool", "Status", "Exit", "Image"], tool_rows))
    lines.extend(["## Findings", ""])
    finding_rows = [[item.get("finding_id"), item.get("tool"), item.get("tool_rule_id"), item.get("category"), ", ".join(item.get("cwe_ids", [])), item.get("status"), item.get("triage")] for item in data.get("findings", [])]
    lines.extend(table(["ID", "Tool", "Rule", "Category", "CWE", "Status", "Triage"], finding_rows))
    coverage = data.get("coverage", {})
    lines.extend(["## Recorded coverage", "", bullet("Source paths", ", ".join(coverage.get("source_paths", []))), bullet("Runtime targets", ", ".join(coverage.get("runtime_targets", []))), bullet("Authentication contexts", ", ".join(coverage.get("authentication_contexts", [])) or "none"), "", "## Limitations", ""])
    lines.extend([f"- {cell(value)}" for value in coverage.get("known_limitations", [])] or ["_(none recorded)_"])
    lines.extend(["", "## Research environment", ""])
    deployment = run.get("deployment", {})
    for label, url in deployment.get("urls", {}).items():
        lines.append(bullet(label.replace("_", " ").title(), url))
    lines.extend([bullet("Stack left running", deployment.get("stack_left_running")), bullet("Safe down command", deployment.get("down_command")), ""])
    return lines


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    raw = args.input.read_bytes()
    data = json.loads(raw)
    schema = data.get("schema_version")
    if data.get("artifact_type") == "security-evaluation-summary" and schema == 5:
        for required in ("evaluation_id", "evaluation_scope", "source_root", "contributing_uc_range", "source", "refs", "result"):
            if required not in data:
                raise SystemExit(f"missing required field: {required}")
        evaluation_id = data["evaluation_id"]
        body = render_v5(data)
    elif data.get("artifact_type") == "security-evaluation-summary" and schema == 4:
        for required in ("evaluation_id", "uc_id", "run_id", "source", "refs", "result"):
            if required not in data:
                raise SystemExit(f"missing required field: {required}")
        evaluation_id = data["evaluation_id"]
        body = render_v5({**data, "evaluation_scope": "historical_per_uc_final_source", "source_root": "finalsource/", "contributing_uc_range": {"from": data["uc_id"], "to": data["uc_id"]}})
    elif str(schema).startswith("3") and data.get("evaluation_type") == "independent_final_source_security_tool_evaluation":
        evaluation_id = data.get("run", {}).get("run_id")
        if not evaluation_id:
            raise SystemExit("missing required field: run.run_id")
        body = render_v3(data)
    else:
        raise SystemExit("unsupported security evaluation schema")
    output = args.output or args.input.with_name("evaluation-report.md")
    digest = hashlib.sha256(raw).hexdigest()
    lines = [
        f"# Security evaluation report — {evaluation_id}", "",
        bullet("Canonical JSON", args.input.as_posix()),
        bullet("Canonical SHA-256", digest),
        bullet("Report type", "Deterministic on-demand view; not source of truth."), "",
        "> No finding means only that configured rules found nothing within recorded coverage; it does not prove absence of A01/A02 vulnerabilities.", "",
    ]
    lines.extend(body)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    print(output)


if __name__ == "__main__":
    main()
