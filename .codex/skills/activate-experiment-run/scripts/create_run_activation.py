#!/usr/bin/env python3
"""Create one immutable run-activation receipt from a Confirmed configuration."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "gen-coding-prompt/scripts"))
from validate_prompt_contract import validate_prompt


def fail(message: str) -> None:
    raise SystemExit(f"run activation error: {message}")


def repository_root() -> Path:
    root = Path.cwd().resolve()
    if not (root / ".git").exists():
        fail("run this command from the repository root")
    return root


def relative_to_root(path: Path, root: Path) -> str:
    try:
        return path.resolve().relative_to(root).as_posix()
    except ValueError:
        fail(f"path must be inside repository: {path}")


def validate_configuration(root: Path, configuration: Path) -> None:
    validator = root / ".codex/skills/run-business-vibe-coding/scripts/validate_experiment_configuration.py"
    completed = subprocess.run(
        [sys.executable, str(validator), str(configuration)],
        cwd=root,
        text=True,
        capture_output=True,
    )
    if completed.returncode:
        fail(completed.stderr.strip() or completed.stdout.strip() or "configuration is invalid")


def load_json(path: Path, label: str) -> dict:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"cannot read {label}: {exc}")
    if not isinstance(data, dict):
        fail(f"{label} must contain a JSON object")
    return data


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("configuration", help="Confirmed configuration JSON under docs/05-experiments/configurations")
    parser.add_argument("uc_id", help="Use-case ID, e.g. UC-01")
    parser.add_argument("run_id", help="Configured run ID")
    parser.add_argument("--prompt", type=Path, help="Approved prompt; defaults to the UC/variant canonical path")
    parser.add_argument("--dry-run", action="store_true", help="Validate without writing activation")
    args = parser.parse_args()

    root = repository_root()
    configuration = (root / args.configuration).resolve() if not Path(args.configuration).is_absolute() else Path(args.configuration).resolve()
    configuration_rel = relative_to_root(configuration, root)
    if not configuration_rel.startswith("docs/05-experiments/configurations/"):
        fail("configuration must be stored under docs/05-experiments/configurations/")
    if not configuration.is_file():
        fail(f"configuration does not exist: {configuration_rel}")

    validate_configuration(root, configuration)
    config = load_json(configuration, "configuration")
    uc_entries = [item for item in config["use_cases"] if item.get("uc_id") == args.uc_id]
    run_entries = [item for item in config["runs"] if item.get("run_id") == args.run_id]
    if len(uc_entries) != 1:
        fail(f"configuration has no unique entry for {args.uc_id}")
    if len(run_entries) != 1 or run_entries[0].get("uc_id") != args.uc_id:
        fail(f"configuration has no {args.uc_id}/{args.run_id} run assignment")

    baseline_rel = uc_entries[0].get("business_rule_baseline")
    if not isinstance(baseline_rel, str) or not baseline_rel:
        fail("configuration UC entry has no business_rule_baseline")
    baseline = (root / baseline_rel).resolve()
    relative_to_root(baseline, root)
    if not baseline.is_file():
        fail(f"Business Rule baseline does not exist: {baseline_rel}")
    baseline_data = load_json(baseline, "Business Rule baseline")
    if baseline_data.get("status") != "Frozen" or baseline_data.get("uc_id") != args.uc_id:
        fail("Business Rule baseline is not frozen for the requested UC")
    if baseline_data.get("ordered_br_ids") != uc_entries[0].get("ordered_br_ids"):
        fail("configuration BR IDs do not exactly match the frozen baseline")

    if config.get("schema_version") in {"2.2", "2.3"}:
        flow_baseline_rel = uc_entries[0].get("flow_baseline")
        if not isinstance(flow_baseline_rel, str) or not flow_baseline_rel:
            fail("configuration UC entry has no flow_baseline")
        flow_baseline = (root / flow_baseline_rel).resolve()
        relative_to_root(flow_baseline, root)
        if not flow_baseline.is_file():
            fail(f"Flow baseline does not exist: {flow_baseline_rel}")
        flow_data = load_json(flow_baseline, "Flow baseline")
        if flow_data.get("status") != "Frozen" or flow_data.get("uc_id") != args.uc_id:
            fail("Flow baseline is not frozen for the requested UC")

    variant = run_entries[0].get("prompt_variant", "full")
    suffix = "rq3-coding-prompt" if variant == "rq3" else "business-coding-prompt"
    prompt = args.prompt or root / f"docs/02-construction/coding-prompts/{args.uc_id}-{suffix}.md"
    prompt_result = validate_prompt(configuration, args.uc_id, args.run_id, prompt)
    output = root / "docs/02-construction/implementation" / args.uc_id / "runs" / args.run_id / "run-activation.json"
    if output.exists():
        fail(f"refusing to overwrite existing receipt: {relative_to_root(output, root)}")
    receipt = {
        "artifact_type": "run-activation",
        "gate_version": 5,
        "uc_id": args.uc_id,
        "run_id": args.run_id,
        "prompt_variant": run_entries[0].get("prompt_variant", "full"),
        "configuration_artifact": configuration_rel,
        "configuration_checksum": "sha256:" + hashlib.sha256(configuration.read_bytes()).hexdigest(),
        "activated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "status": "Confirmed",
        "approved_prompt": prompt_result["prompt"],
    }
    if args.dry_run:
        print(json.dumps({"status": "valid", "prompt_variant": variant, "approved_prompt": receipt["approved_prompt"]}, indent=2))
        return
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "activated", "path": relative_to_root(output, root), "configuration_checksum": receipt["configuration_checksum"]}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, TypeError, KeyError) as exc:
        fail(str(exc))
