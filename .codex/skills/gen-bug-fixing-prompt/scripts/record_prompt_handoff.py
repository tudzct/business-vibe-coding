#!/usr/bin/env python3
"""Validate a generated prompt set and record its minimal Canonical Run handoff."""

import argparse
import hashlib
import json
import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts"))
from metrics_contract import ROOT, atomic_write, context, read_json, run_lock
from validate_sub_prompts import load_handoff, require, validate


def canonical_hash(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True,
                     separators=(",", ":")).encode("utf-8")
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def record(handoff_path, prompt_dir):
    handoff_path, handoff = load_handoff(handoff_path)
    require(handoff["status"] == "ready" and len(handoff["defects"]) > 0,
            "no prompt handoff is required")
    run_path = (ROOT / "docs/04-experiments" / handoff["uc_id"] /
                f"canonical-run-{handoff['run_id']}.json").resolve()
    run_path, run, folder = context(run_path)
    require(run["uc_id"] == handoff["uc_id"] and run["run_id"] == handoff["run_id"],
            "Canonical Run identity does not match handoff")
    prompt_dir = prompt_dir.resolve()
    result = validate(handoff_path, prompt_dir)
    with run_lock(folder):
        run = read_json(run_path)
        require(canonical_hash(run.get("defects")) == handoff["canonical_defects_sha256"],
                "Canonical defect inventory changed after Audit handoff")
        require(run.get("repairs") == [] and run.get("repair_rounds_completed", 0) == 0,
                "prompt handoff must be recorded before Repair execution")
        relative_prompt_dir = prompt_dir.relative_to(ROOT).as_posix()
        require(run.get("repair_prompt_directory") in (None, "", relative_prompt_dir),
                "Canonical Run already points to another repair prompt directory")
        run["repair_prompt_directory"] = relative_prompt_dir
        run["all_sub_prompt_count"] = result["prompt_count"]
        run["repair_round_limit"] = 10
        run["repair_rounds_completed"] = 0
        run["repair_status"] = "not_started"
        atomic_write(run_path, run)
    return {
        "uc_id": handoff["uc_id"], "run_id": handoff["run_id"],
        "repair_prompt_directory": relative_prompt_dir,
        "all_sub_prompt_count": result["prompt_count"],
        "repair_round_limit": 10, "repair_rounds_completed": 0,
        "repair_status": "not_started",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--handoff", required=True, type=Path)
    parser.add_argument("--prompt-dir", required=True, type=Path)
    args = parser.parse_args()
    print(json.dumps(record(args.handoff.resolve(), args.prompt_dir.resolve()),
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise SystemExit(f"prompt handoff error: {exc}") from exc
