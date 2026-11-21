#!/usr/bin/env python3
"""Assemble, score, and validate one evidence-backed per-defect Repair attempt."""

import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / ".codex/scripts"))
from metrics_contract import atomic_write, read_json, run_lock  # noqa: E402

sys.path.insert(0, str(ROOT / ".codex/skills/audit-flow-accuracy/scripts"))
from score_flow_accuracy import (calculate as calculate_flow_accuracy,  # noqa: E402
                                 integrate_result as integrate_flow_result,
                                 markdown as flow_markdown)

from assemble_repair_assessment import (assemble_assessment,  # noqa: E402
                                        build_canonical_repair_update)
from validate_repair_rounds import validate_data as validate_repair_data  # noqa: E402


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(path_or_bytes):
    raw = path_or_bytes.read_bytes() if isinstance(path_or_bytes, Path) else path_or_bytes
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def atomic_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            json.dump(payload, handle, indent=2, ensure_ascii=False)
            handle.write("\n")
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def run_cmd(cmd, cwd=ROOT):
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=60)
    if res.returncode != 0:
        raise RuntimeError(f"Command failed ({cmd}):\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
    return res.stdout.strip()


def get_changed_files(passed_files=None):
    if passed_files:
        return sorted([f.replace("\\", "/") for f in passed_files])

    changed = set()
    try:
        res = subprocess.run(
            ["git", "status", "--porcelain", "finalsource"],
            cwd=ROOT,
            capture_output=True,
            text=True
        )
        if res.returncode == 0:
            for line in res.stdout.strip().splitlines():
                if line.strip():
                    fpath = line.strip().split()[-1].replace("\\", "/")
                    changed.add(fpath)
    except Exception:
        pass

    if not changed:
        try:
            res = subprocess.run(
                ["git", "diff", "--name-only", "HEAD", "finalsource"],
                cwd=ROOT,
                capture_output=True,
                text=True
            )
            if res.returncode == 0:
                for line in res.stdout.strip().splitlines():
                    if line.strip():
                        changed.add(line.strip().replace("\\", "/"))
        except Exception:
            pass

    verified = []
    for value in sorted(changed):
        path = Path(value)
        absolute = path if path.is_absolute() else ROOT / path
        require(absolute.is_file(), f"Changed source file not found: {value}")
        require(absolute.is_relative_to(ROOT / "finalsource"),
                f"Repair changed file is outside finalsource: {value}")
        verified.append(absolute.relative_to(ROOT).as_posix())
    return verified


def configured_flow_ids(run_data, run_dir, explicit=None):
    if explicit:
        return list(dict.fromkeys(explicit))

    baseline_file = (
        ROOT / "docs/02-construction/implementation" / run_data["uc_id"] / "flow-baseline.json"
    )
    if baseline_file.is_file():
        with open(baseline_file, "r", encoding="utf-8") as handle:
            values = json.load(handle).get("ordered_flow_ids", [])
        if values:
            return list(dict.fromkeys(values))

    candidates = [p for p in sorted((run_dir / "flow-accuracy").glob("*initial*.json"))
                  if not p.name.endswith(".input.json") and not p.name.endswith("-input.json")]
    for candidate in candidates:
        with open(candidate, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
        flows = payload.get("flows") or payload.get("input", {}).get("flows") or []
        values = [item.get("flow_id") for item in flows if item.get("flow_id")]
        if values:
            return list(dict.fromkeys(values))
    raise ValueError("Could not resolve the active UC flow inventory from baseline or initial assessment")


def initial_assessment(run_dir):
    candidates = [p for p in sorted((run_dir / "flow-accuracy").glob("assessment-*-initial.json"))
                  if not p.name.endswith(".input.json") and not p.name.endswith("-input.json")]
    if not candidates:
        candidates = [p for p in sorted((run_dir / "flow-accuracy").glob("*initial*.json"))
                      if not p.name.endswith(".input.json") and not p.name.endswith("-input.json")]
    require(len(candidates) == 1,
            f"Expected one initial assessment in {run_dir / 'flow-accuracy'}, found {len(candidates)}")
    with open(candidates[0], "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if isinstance(payload.get("input"), dict) and isinstance(payload["input"].get("flows"), list):
        payload = payload["input"]
    require(isinstance(payload.get("flows"), list), "initial assessment requires a flows array")
    return payload


def verification_flow_definition(flow):
    return {
        "flow_id": flow["flow_id"],
        "source_anchor": flow.get("source_anchor"),
        "steps": [{
            "step_id": step["step_id"],
            "text": step.get("text"),
            "completion_critical": step.get("completion_critical"),
            "criticality_reason": step.get("criticality_reason")
        } for step in flow.get("steps", [])],
        "terminal_outcome": {
            "text": (flow.get("terminal_outcome") or {}).get("text")
        }
    }


def verification_flow_skeleton(flow):
    return {
        "flow_id": flow["flow_id"],
        "observation_id": None,
        "entry_point": None,
        "entry_kind": None,
        "actual_preconditions": None,
        "end_state": None,
        "state": None,
        "actions": [],
        "steps": [{
            "step_id": step["step_id"],
            "status": None,
            "rationale": None,
            "evidence": []
        } for step in flow.get("steps", [])],
        "terminal_outcome": {
            "status": None,
            "rationale": None,
            "evidence": []
        }
    }


def prepare_verification(run_path, run_data, run_dir, evidence_root, assessment_id,
                         flow_ids, defect_id):
    require(run_data.get("run_status") not in {"complete", "blocked", "stopped", "repair_declined"},
            "terminal runs cannot prepare another Repair attempt")
    require(run_data.get("gates", {}).get("current") == "repair",
            "Repair verification preparation requires the active Repair gate")
    require(run_data.get("repair_authorization", {}).get("approved") is True,
            "Repair verification preparation requires recorded researcher authorization")
    require(run_data.get("repair_status") in {"not_started", "in_progress"},
            "Repair verification may be prepared only while Repair is not started or in progress")
    initial_defects = {
        item.get("defect_id") for item in run_data.get("defects", [])
        if item.get("stage") == "initial"
    }
    require(defect_id in initial_defects, "--defect-id must identify one immutable initial defect")

    assessment = initial_assessment(run_dir)
    flows = assessment["flows"]
    require([item.get("flow_id") for item in flows] == flow_ids,
            "initial assessment flow inventory/order differs from the active flow baseline")
    ordered_br_ids = run_data.get("business_rules", {}).get("ordered_br_ids")
    require(isinstance(ordered_br_ids, list), "canonical ordered BR inventory is required")

    plan = {
        "artifact_type": "repair-verification-plan",
        "uc_id": run_data["uc_id"],
        "run_id": run_data["run_id"],
        "assessment_id": assessment_id,
        "defect_id": defect_id,
        "flows": [verification_flow_definition(flow) for flow in flows],
        "ordered_br_ids": ordered_br_ids
    }
    results = {
        "uc_id": run_data["uc_id"],
        "run_id": run_data["run_id"],
        "assessment_id": assessment_id,
        "captured_at": None,
        "limitations": [],
        "execution_blocker_defect_ids": [],
        "flows": [verification_flow_skeleton(flow) for flow in flows],
        "business_rules": [{
            "br_id": br_id,
            "status": None,
            "rationale": None,
            "evidence": [],
            "runtime_observation_ids": []
        } for br_id in ordered_br_ids],
        "defects": [{
            "defect_id": defect_id,
            "status": None,
            "evidence": []
        }]
    }

    plan_path = evidence_root / "verification-plan.json"
    results_path = evidence_root / "verification-results.json"
    require(not plan_path.exists() and not results_path.exists(),
            "Repair verification artifacts already exist for this assessment; use a new assessment ID")
    atomic_json(plan_path, plan)
    atomic_json(results_path, results)
    run_data["repair_status"] = "in_progress"
    run_data["run_status"] = "active"
    atomic_json(run_path, run_data)
    return plan_path, results_path


def validate_verification_results(path, run_data, assessment_id, flow_ids, defect_id):
    require(path.is_file(), f"Repair verification results not found: {path}")
    with open(path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    require(data.get("uc_id") == run_data["uc_id"], "verification UC identity mismatch")
    require(data.get("run_id") == run_data["run_id"], "verification run identity mismatch")
    require(data.get("assessment_id") == assessment_id, "verification assessment identity mismatch")
    recorded = [item.get("flow_id") for item in data.get("flows", [])]
    require(recorded == flow_ids,
            "verification flow inventory/order must exactly match verification-plan.json; "
            "restore the prepared inventory and retry this attempt")
    business_rules = data.get("business_rules")
    require(isinstance(business_rules, list), "verification business_rules results must be an array")
    ordered_br_ids = run_data.get("business_rules", {}).get("ordered_br_ids", [])
    require([item.get("br_id") for item in business_rules] == ordered_br_ids,
            "verification BR inventory/order must exactly match verification-plan.json; "
            "restore the prepared inventory and retry this attempt")
    require(isinstance(data.get("defects"), list)
            and [item.get("defect_id") for item in data["defects"]] == [defect_id],
            "verification defects must contain exactly the current fixed defect")
    observation_ids = set()
    for flow in data["flows"]:
        flow_id = flow["flow_id"]
        observation_id = flow.get("observation_id")
        require(isinstance(observation_id, str) and observation_id.strip(),
                f"{flow_id} requires an observation_id")
        require(observation_id not in observation_ids,
                f"duplicate observation_id: {observation_id}")
        observation_ids.add(observation_id)
        actions = flow.get("actions")
        require(isinstance(actions, list) and actions,
                f"{flow_id} requires an actual runtime action sequence")
        first_targets = actions[0].get("target_ids", [])
        require("entry" in first_targets,
                f"{flow_id} first action must include the entry target")
        if flow.get("entry_kind") == "ui":
            evidence = actions[0].get("evidence", [])
            require(any(isinstance(item, dict) and item.get("kind") == "ui" for item in evidence),
                    f"{flow_id} UI entry requires UI evidence on its first action")
        if flow_id.startswith(("AF-", "EF-")):
            require(any("branch" in action.get("target_ids", []) for action in actions),
                    f"{flow_id} requires an observed branch action")
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", type=Path, required=True)
    parser.add_argument("--assessment-id", required=True)
    parser.add_argument("--verification-results", type=Path)
    parser.add_argument("--defect-id", required=True,
                        help="The one fixed defect verified by this attempt")
    parser.add_argument("--changed-files", nargs="*", default=None,
                        help="Explicit list of changed source files in finalsource")
    parser.add_argument("--flow-ids", nargs="*", default=None,
                        help="Exact flow inventory; defaults to the frozen baseline")
    parser.add_argument("--prepare", action="store_true",
                        help="Create the bounded verification plan and full results skeleton")
    args = parser.parse_args()

    run_path = args.run_json.resolve()
    with open(run_path, "r", encoding="utf-8") as f:
        run_data = json.load(f)

    uc_id = run_data["uc_id"]
    run_id = run_data["run_id"]
    assessment_id = args.assessment_id
    run_dir = ROOT / "docs/02-construction/implementation" / uc_id / "runs" / run_id
    evidence_root = run_dir / "flow-accuracy" / "evidence" / assessment_id
    flow_ids = configured_flow_ids(run_data, run_dir, args.flow_ids)
    if args.prepare:
        require(args.verification_results is None,
                "--verification-results cannot be combined with --prepare")
        require(args.changed_files is None,
                "--changed-files cannot be combined with --prepare")
        evidence_root.mkdir(parents=True, exist_ok=True)
        plan_path, results_path = prepare_verification(
            run_path, run_data, run_dir, evidence_root, assessment_id, flow_ids, args.defect_id
        )
        print(f"Prepared bounded Repair verification plan: {plan_path.relative_to(ROOT)}")
        print(f"Prepared full verification results skeleton: {results_path.relative_to(ROOT)}")
        return

    require(evidence_root.is_dir(), f"Repair evidence directory not found: {evidence_root}")
    now_iso = datetime.now(timezone.utc).astimezone().isoformat()
    results_path = (args.verification_results.resolve() if args.verification_results
                    else evidence_root / "verification-results.json")
    validate_verification_results(results_path, run_data, assessment_id, flow_ids, args.defect_id)

    deployment_path = evidence_root / "_runtime" / "deployment.json"
    require(deployment_path.is_file(),
            f"Actual runtime deployment evidence not found: {deployment_path}")

    # Source manifest
    source_dir = evidence_root / "_source"
    source_dir.mkdir(parents=True, exist_ok=True)
    changed_files = get_changed_files(args.changed_files)
    manifest_files = []
    for c in changed_files:
        cp = ROOT / c if not Path(c).is_absolute() else Path(c)
        if cp.is_file():
            manifest_files.append({"path": cp.relative_to(ROOT).as_posix(), "sha256": digest(cp)})
    manifest_path = source_dir / "repair-source-manifest.json"
    if manifest_path.exists():
        existing_manifest = read_json(manifest_path)
        require(existing_manifest.get("files") == manifest_files,
                "Repair source changed after this attempt manifest was captured; use a new assessment ID")
    else:
        atomic_json(manifest_path, {"captured_at": now_iso, "files": manifest_files})
    print(f"=== Running Repair Verification for {run_id} ===")
    print(f"1. Verified evidence-backed results for {len(flow_ids)} configured flows.")
    print("2. Saved the Repair source manifest.")

    # Build and validate the complete canonical candidate before any run-state write.
    print("3. Assembling and validating the complete Repair candidate...")
    uc_lower = uc_id.lower().replace("-", "")
    final_assessment_path = run_dir / "flow-accuracy" / f"assessment-{uc_lower}-final.json"
    prompt_dir = run_dir / "repairs"
    with run_lock(run_dir):
        current_run = read_json(run_path)
        require(current_run == run_data,
                "Canonical Run changed during Repair verification; retry against the current state")
        assessment, source_revision, assembled_changed_files = assemble_assessment(
            current_run, run_dir, assessment_id, "final", changed_files=changed_files,
            verification_results_path=results_path
        )
        candidate_run = build_canonical_repair_update(
            current_run, source_revision, assembled_changed_files, assessment["assessment_id"],
            verification_results_path=results_path, defect_id=args.defect_id
        )
        flow_result = calculate_flow_accuracy(assessment)
        candidate_run, flow_summary = integrate_flow_result(candidate_run, run_dir, flow_result)
        terminal = candidate_run.get("repair_status") in {"completed", "unresolved", "blocked"}
        repair_validation = validate_repair_data(candidate_run, prompt_dir, terminal)

        # Persist derived artifacts first. Canonical Run is the final commit point.
        result_path = run_dir / "flow-accuracy" / f"{flow_result['assessment_id']}.json"
        result_md_path = run_dir / "flow-accuracy" / f"{flow_result['assessment_id']}.md"
        atomic_write(final_assessment_path, assessment)
        if not result_path.exists():
            atomic_write(result_path, flow_result)
        if not result_md_path.exists():
            atomic_write(result_md_path, flow_markdown(flow_result), raw=True)
        atomic_write(run_path, candidate_run)

    print("4. Flow assessment validated and integrated:",
          json.dumps(flow_summary, ensure_ascii=False))
    print("5. Repair attempt validated:",
          json.dumps(repair_validation, ensure_ascii=False))
    updated_run = candidate_run
    if updated_run.get("repair_status") in {"completed", "unresolved", "blocked"}:
        metrics_script = ROOT / ".codex/skills/audit-generation-metrics/scripts/calculate_metrics.py"
        summary_out = run_cmd([sys.executable, str(metrics_script), str(run_path)])
        print("6. Final pre/post-Repair summary:", summary_out)
    print("\n=== REPAIR DEFECT ATTEMPT RECORDED ===")


if __name__ == "__main__":
    main()
