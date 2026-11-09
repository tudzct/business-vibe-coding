#!/usr/bin/env python3
"""Validate one fixed prompt set and its bounded per-defect Repair attempts."""

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
PROMPT_VALIDATOR = ROOT / ".codex/skills/gen-bug-fixing-prompt/scripts"
sys.path.insert(0, str(PROMPT_VALIDATOR))
from validate_sub_prompts import parse_prompt  # noqa: E402

SHA = re.compile(r"sha256:[0-9a-f]{64}")
SAFE_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]*")
ROUND_OUTCOMES = {"in_progress", "resolved", "unresolved", "blocked"}
ATTEMPT_STATUSES = {"resolved", "unresolved"}
CATEGORIES = {"technical", "business_rule", "flow"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(path):
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def repository_path(value, label):
    require(isinstance(value, str) and value, f"{label} required")
    path = (ROOT / value).resolve()
    require(path.is_relative_to(ROOT), f"{label} must stay inside repository")
    return path


def validate_evidence(value, label):
    require(isinstance(value, list) and value, f"{label} must be a non-empty array")
    for index, item in enumerate(value):
        require(isinstance(item, dict), f"{label}[{index}] must be an object")
        path = repository_path(item.get("path"), f"{label}[{index}].path")
        require(path.is_file(), f"{label}[{index}] evidence file missing")
        require(item.get("sha256") == digest(path), f"{label}[{index}] checksum mismatch")


def prompt_inventory(run, prompt_dir, all_defects):
    files = sorted(prompt_dir.glob("repair-*.md")) if prompt_dir.is_dir() else []
    require(files, "validated repair prompt set is required")
    require(len(files) == len(all_defects),
            "repair prompt count must match the immutable defect inventory")
    result = {}
    selected = []
    for expected_index, (path, defect) in enumerate(zip(files, all_defects), 1):
        fields, arrays, sections = parse_prompt(path)
        defect_id = defect["defect_id"]
        require(defect_id not in result, f"{path}: duplicate defect")
        require(fields["repair_index"] == str(expected_index)
                and path.name == f"repair-{expected_index:03d}-{defect_id}.md",
                f"{path}: prompt index or filename mismatch")
        require(fields["uc_id"] == run["uc_id"] and fields["run_id"] == run["run_id"],
                f"{path}: run identity mismatch")
        require(arrays["affected_br_ids"] == defect["affected_br_ids"],
                f"{path}: affected BR set differs from the immutable defect")
        evidence = defect.get("evidence")
        require(isinstance(evidence, list) and evidence, f"{path}: recorded evidence missing")
        for reference in evidence:
            require(isinstance(reference, dict), f"{path}: invalid recorded evidence reference")
            evidence_path = reference.get("path")
            evidence_sha = reference.get("sha256")
            require(isinstance(evidence_path, str) and evidence_path in sections["Evidence"]
                    and isinstance(evidence_sha, str) and evidence_sha in sections["Evidence"],
                    f"{path}: recorded evidence differs from fixed prompt")
        result[defect_id] = {
            "path": path.relative_to(ROOT).as_posix(),
            "sha256": digest(path),
            "affected_br_ids": defect["affected_br_ids"],
            "affected_flow_ids": defect["affected_flow_ids"],
        }
        selected.append(defect)
    return result, selected


def validate(run_path, prompt_dir, final=False):
    run = json.loads(run_path.read_text(encoding="utf-8-sig"))
    require(isinstance(run, dict), "canonical run must be an object")
    for key in ("uc_id", "run_id"):
        require(isinstance(run.get(key), str) and SAFE_ID.fullmatch(run[key]),
                f"canonical {key} must be a safe identifier")
    expected_prompt_dir_path = (ROOT / "docs/02-construction/implementation" / run["uc_id"] /
                                "runs" / run["run_id"] / "repairs").resolve()
    require(prompt_dir.resolve() == expected_prompt_dir_path,
            "repair prompts must use the active run's canonical repairs directory")

    all_defects = run.get("defects")
    require(isinstance(all_defects, list)
            and all(isinstance(item, dict) and item.get("stage") == "initial" for item in all_defects),
            "Repair must retain only the immutable initial defect inventory")
    require(all(item.get("category") in CATEGORIES for item in all_defects),
            "initial defect category must be technical, business_rule or flow")
    require(all(isinstance(item.get("blocks_execution"), bool) for item in all_defects),
            "initial defects require a Boolean blocks_execution flag")
    require(all(SHA.fullmatch(item.get("fingerprint") or "") for item in all_defects),
            "initial defect fingerprints must be SHA-256 values")
    all_defect_ids = [item.get("defect_id") for item in all_defects]
    require(len(all_defect_ids) == len(set(all_defect_ids))
            and all(SAFE_ID.fullmatch(value or "") for value in all_defect_ids),
            "initial defect IDs must be unique and safe")
    prompts, defects = prompt_inventory(run, prompt_dir, all_defects)
    require(defects and all(item.get("status") == "open" for item in defects),
            "every prompted defect must remain open before Repair")
    defect_ids = [item["defect_id"] for item in defects]
    expected_directory = prompt_dir.relative_to(ROOT).as_posix()

    require(run.get("repair_round_limit", 10) == 10, "repair_round_limit must be 10")
    require(run.get("repair_prompt_directory") == expected_directory,
            "canonical repair_prompt_directory mismatch")
    require(run.get("all_sub_prompt_count") == len(defects),
            "all_sub_prompt_count must match the fixed repair prompt set")
    repairs = run.get("repairs")
    require(isinstance(repairs, list) and len(repairs) <= len(defect_ids) * 10,
            "repairs may contain at most ten attempts per fixed defect")

    repair_ids = set()
    completed_attempts = 0
    terminal_outcome = None
    previous_revision_after = None
    attempt_counts = {defect_id: 0 for defect_id in defect_ids}
    terminal_results = {}
    current_position = 0
    for index, repair in enumerate(repairs, 1):
        label = f"repairs[{index - 1}]"
        require(isinstance(repair, dict), f"{label} must be an object")
        require(current_position < len(defect_ids),
                f"{label} appears after every fixed defect reached a terminal result")
        expected_defect_id = defect_ids[current_position]
        repair_id = repair.get("repair_id")
        require(SAFE_ID.fullmatch(repair_id or "") and repair_id not in repair_ids,
                f"{label}.repair_id must be unique and safe")
        repair_ids.add(repair_id)
        require(repair.get("round_index") == index, f"{label}.round_index must be consecutive")
        require(repair.get("prompt_directory") == expected_directory, f"{label} prompt directory mismatch")
        require(SHA.fullmatch(repair.get("source_revision_before") or ""),
                f"{label}.source_revision_before invalid")
        if previous_revision_after is not None:
            require(repair["source_revision_before"] == previous_revision_after,
                    f"{label}.source_revision_before must equal the preceding attempt result")
        validate_evidence(repair.get("evidence_before"), f"{label}.evidence_before")
        model = repair.get("model")
        require(isinstance(model, dict) and isinstance(model.get("effective_model_id"), str)
                and model["effective_model_id"], f"{label}.model invalid")
        outcome = repair.get("outcome")
        require(outcome in ROUND_OUTCOMES, f"{label}.outcome invalid")
        attempts = repair.get("defect_attempts")
        require(isinstance(attempts, list) and len(attempts) == 1
                and isinstance(attempts[0], dict),
                f"{label}.defect_attempts must contain exactly one defect")
        attempt = attempts[0]
        attempt_label = f"{label}.defect_attempts[0]"
        require(attempt.get("defect_id") == expected_defect_id,
                f"{label} must finish the current defect before advancing")
        defect = defects[current_position]
        expected_attempt_index = attempt_counts[expected_defect_id] + 1
        require(attempt.get("attempt_index") == expected_attempt_index <= 10,
                f"{attempt_label}.attempt_index must be consecutive and at most ten")
        require(attempt.get("defect_fingerprint") == defect["fingerprint"],
                f"{attempt_label} fingerprint changed")
        require(attempt.get("prompt_path") == prompts[expected_defect_id]["path"]
                and attempt.get("prompt_sha256") == prompts[expected_defect_id]["sha256"],
                f"{attempt_label} prompt identity changed")
        require(repair.get("affected_br_ids") == prompts[expected_defect_id]["affected_br_ids"],
                f"{label}.affected_br_ids mismatch")
        require(repair.get("affected_flow_ids") == prompts[expected_defect_id]["affected_flow_ids"],
                f"{label}.affected_flow_ids mismatch")

        if outcome == "in_progress":
            require(not final and index == len(repairs),
                    "only the current non-final defect attempt may be in progress")
            require(attempt.get("status") in (None, "in_progress"),
                    f"{attempt_label} in-progress status invalid")
            terminal_outcome = outcome
            break

        require(SHA.fullmatch(repair.get("source_revision_after") or ""),
                f"{label}.source_revision_after invalid")
        require(isinstance(repair.get("changed_files"), list)
                and all(isinstance(value, str) and value for value in repair["changed_files"]),
                f"{label}.changed_files invalid")
        validate_evidence(repair.get("evidence_after"), f"{label}.evidence_after")
        require(attempt.get("status") in ATTEMPT_STATUSES, f"{attempt_label}.status invalid")
        validate_evidence(attempt.get("evidence"), f"{attempt_label}.evidence")
        require((attempt["status"] == "resolved" and outcome == "resolved")
                or (attempt["status"] == "unresolved" and outcome in {"unresolved", "blocked"}),
                f"{label} outcome differs from its defect result")

        completed_attempts += 1
        attempt_counts[expected_defect_id] = expected_attempt_index
        terminal_outcome = outcome
        previous_revision_after = repair["source_revision_after"]
        if outcome == "blocked":
            require(index == len(repairs), f"{label} blocked outcome must be the last attempt")
            break
        if attempt["status"] == "resolved":
            terminal_results[expected_defect_id] = "resolved"
            current_position += 1
        elif expected_attempt_index == 10:
            terminal_results[expected_defect_id] = "unresolved"
            current_position += 1

    require(run.get("repair_rounds_completed") == completed_attempts,
            "repair_rounds_completed mismatch")
    status = run.get("repair_status")
    if not repairs:
        require(status == "not_started" and completed_attempts == 0,
                "an unstarted Repair requires not_started status and zero completed attempts")
    elif terminal_outcome == "in_progress":
        require(status == "in_progress", "an active attempt requires in_progress Repair status")
    if final:
        require(repairs and terminal_outcome != "in_progress", "final Repair cannot retain an in-progress attempt")
        if terminal_outcome == "blocked":
            require(status == "blocked" and run.get("run_status") == "blocked",
                    "blocked Repair needs blocked terminal status")
        else:
            require(current_position == len(defect_ids),
                    "final Repair must process every fixed defect sequentially")
        if terminal_outcome != "blocked" and all(
                terminal_results.get(defect_id) == "resolved" for defect_id in defect_ids):
            require(status == "completed" and run.get("run_status") == "complete",
                    "resolved Repair needs completed/complete status")
            business = (run.get("business_rules") or {}).get("final") or {}
            require(business.get("met") == business.get("total") and business.get("unmet") == 0
                    and business.get("not_evaluable") == 0,
                    "completed Repair requires every BR met")
            require(run.get("flow_accuracy_percent") == 100,
                    "completed Repair requires 100% Flow Accuracy")
        elif terminal_outcome != "blocked":
            require(status == "unresolved" and run.get("run_status") == "stopped",
                    "a fully processed Repair with unresolved defects must stop honestly")
    unresolved_ids = [defect_id for defect_id in defect_ids
                      if terminal_results.get(defect_id) != "resolved"]
    return {"run_id": run["run_id"], "prompt_count": len(prompts),
            "attempts_completed": completed_attempts, "repair_status": status,
            "attempts_by_defect": attempt_counts,
            "unresolved_defect_ids": unresolved_ids}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, type=Path)
    parser.add_argument("--prompt-dir", required=True, type=Path)
    parser.add_argument("--final", action="store_true")
    args = parser.parse_args()
    result = validate(args.run_json.resolve(), args.prompt_dir.resolve(), args.final)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        raise SystemExit(f"repair validation error: {exc}")
