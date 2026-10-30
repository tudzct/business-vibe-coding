#!/usr/bin/env python3
"""Assemble a canonical Schema v2 final-stage assessment and repair records for Repair verification."""

import argparse
import copy
import hashlib
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
SHA = re.compile(r"sha256:[0-9a-f]{64}")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(path):
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def evidence_object(item, source_rev, observation_id, flow_id, captured_at):
    require(isinstance(item, dict), "verification evidence entry must be an object")
    require(item.get("path"), "verification evidence path is required")
    path = ROOT / item["path"]
    require(path.is_file(), f"verification evidence file not found: {item['path']}")
    actual_hash = digest(path)
    if item.get("sha256"):
        require(item["sha256"] == actual_hash, f"verification evidence hash changed: {item['path']}")
    require(item.get("kind"), f"verification evidence kind is required: {item['path']}")
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "sha256": actual_hash,
        "kind": item["kind"],
        "source_revision": source_rev,
        "sanitized": item.get("sanitized", True),
        "locator": item.get("locator", "recorded runtime evidence"),
        "observation_id": observation_id,
        "flow_id": flow_id,
        "captured_at": item.get("captured_at", captured_at),
        "target_ids": item.get("target_ids", []),
    }


def get_changed_files(manifest_path=None, passed_files=None):
    if passed_files:
        return sorted([f.replace("\\", "/") for f in passed_files])

    changed = set()
    if manifest_path and manifest_path.is_file():
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                mdata = json.load(f)
                for item in mdata.get("files", []):
                    changed.add(item["path"].replace("\\", "/"))
        except Exception:
            pass

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

    return sorted(list(changed))


def compute_source_revision(manifest_path, changed_files=None):
    if manifest_path and manifest_path.is_file():
        return digest(manifest_path)
    h = hashlib.sha256()
    if changed_files:
        for f in sorted(changed_files):
            p = ROOT / f if not Path(f).is_absolute() else Path(f)
            if p.is_file():
                h.update(f.encode())
                h.update(p.read_bytes())
    else:
        raise ValueError("Cannot compute Repair source revision without a manifest or changed files")
    return "sha256:" + h.hexdigest()


def assemble_assessment(run_data, run_dir, assessment_id=None, stage="final", source_rev=None,
                        changed_files=None, verification_results_path=None):
    uc_id = run_data["uc_id"]
    run_id = run_data["run_id"]
    uc_lower = uc_id.lower().replace("-", "")

    if not assessment_id:
        assessment_id = f"asm-{uc_lower}-{stage}"

    # Locate initial assessment input
    initial_path = run_dir / "flow-accuracy" / f"assessment-{uc_lower}-initial.json"
    if not initial_path.is_file():
        initial_candidates = list((run_dir / "flow-accuracy").glob("assessment-*-initial.json"))
        if not initial_candidates:
            initial_candidates = list((run_dir / "flow-accuracy").glob("*initial*.json"))
        require(len(initial_candidates) == 1,
                f"Expected one initial assessment in {run_dir / 'flow-accuracy'}, found {len(initial_candidates)}")
        initial_path = initial_candidates[0]

    with open(initial_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if "input" in data and isinstance(data["input"], dict) and "flows" in data["input"]:
        data = copy.deepcopy(data["input"])

    evidence_root = run_dir / "flow-accuracy" / "evidence" / assessment_id
    require(evidence_root.is_dir(), f"Evidence directory not found: {evidence_root}")

    # Determine source revision
    manifest_path = evidence_root / "_source" / "repair-source-manifest.json"
    if not changed_files:
        changed_files = get_changed_files(manifest_path)
    if not source_rev:
        source_rev = compute_source_revision(manifest_path, changed_files)

    verification_results_path = (
        verification_results_path or evidence_root / "verification-results.json"
    )
    require(verification_results_path.is_file(),
            f"Verification results not found: {verification_results_path}")
    with open(verification_results_path, "r", encoding="utf-8") as handle:
        verification = json.load(handle)
    require(verification.get("uc_id") == uc_id, "verification UC identity mismatch")
    require(verification.get("run_id") == run_id, "verification run identity mismatch")
    require(verification.get("assessment_id") == assessment_id,
            "verification assessment identity mismatch")
    if verification.get("source_revision"):
        require(verification["source_revision"] == source_rev,
                "verification source revision mismatch")

    now_iso = datetime.now(timezone.utc).astimezone().isoformat()

    data["uc_id"] = uc_id
    data["run_id"] = run_id
    data["baseline"] = data.get("baseline") or data.get("input", {}).get("baseline")
    if not data["baseline"]:
        uc_baseline_path = ROOT / "docs/02-construction/implementation" / uc_id / "flow-baseline.json"
        if uc_baseline_path.is_file():
            data["baseline"] = {
                "path": uc_baseline_path.relative_to(ROOT).as_posix(),
                "sha256": digest(uc_baseline_path)
            }
    data["assessment_id"] = assessment_id
    data["stage"] = stage
    data["source_revision"] = source_rev
    data["captured_at"] = now_iso
    data["limitations"] = verification.get("limitations", [])
    data["execution_blocker_defect_ids"] = verification.get("execution_blocker_defect_ids", [])
    if "input" in data and isinstance(data["input"], dict):
        data["input"]["uc_id"] = uc_id
        data["input"]["run_id"] = run_id
        data["input"]["assessment_id"] = assessment_id
        data["input"]["stage"] = stage
        data["input"]["source_revision"] = source_rev
        data["input"]["baseline"] = data["baseline"]
        data["input"]["limitations"] = data["limitations"]
        data["input"]["execution_blocker_defect_ids"] = data["execution_blocker_defect_ids"]

    # Runtime deployment
    deployment_json_path = evidence_root / "_runtime" / "deployment.json"
    require(deployment_json_path.is_file(),
            f"Actual runtime deployment evidence not found: {deployment_json_path}")
    with open(deployment_json_path, "r", encoding="utf-8") as f:
        dep_content = json.load(f)
    runtime_status = dep_content.get("status", "ready")
    require(runtime_status in {"ready", "BLOCKED", "unverified"},
            "deployment evidence has an invalid runtime status")
    require(dep_content.get("compose_version") in {2, 5},
            "deployment evidence requires Docker Compose major version 2 or 5")
    services = dep_content.get("services", [])
    require(isinstance(services, list), "deployment services must be an array")
    deployment_verified = dep_content.get("verified", runtime_status == "ready")
    require(type(deployment_verified) is bool, "deployment verified must be Boolean")
    if runtime_status == "ready":
        require(deployment_verified and services,
                "ready runtime requires verified observed services")
        require(isinstance(dep_content.get("compose_project"), str)
                and dep_content["compose_project"].strip(),
                "ready runtime requires the observed Compose project")
        for service in services:
            require(isinstance(service, dict) and all(
                isinstance(service.get(key), str) and service[key].strip()
                for key in ("name", "container_id", "image_id", "state")
            ), "each observed service requires name, container_id, image_id and state")
    else:
        require(not deployment_verified,
                "blocked or unverified runtime cannot claim a verified deployment")
        require(isinstance(dep_content.get("reason"), str) and dep_content["reason"].strip(),
                "blocked or unverified runtime requires the actual reason")

    deploy_rel = deployment_json_path.relative_to(ROOT).as_posix()
    deploy_hash = digest(deployment_json_path)

    data["runtime"] = {
        "status": runtime_status,
        "compose_version": dep_content["compose_version"],
        "reason": dep_content.get("reason", "Runtime deployment inspected for this Repair round."),
        "compose_project": dep_content.get("compose_project"),
        "services": services,
        "deployment": {
            "source_revision": source_rev,
            "verified": deployment_verified,
            "evidence": [
                {
                    "path": deploy_rel,
                    "sha256": deploy_hash,
                    "kind": "deployment" if runtime_status == "ready" else "limitation",
                    "source_revision": source_rev,
                    "sanitized": True,
                    "locator": "Docker Compose runtime inspection",
                    "observation_id": None
                }
            ]
        }
    }

    verification_flows = verification.get("flows")
    require(isinstance(verification_flows, list), "verification flows must be an array")
    expected_flow_ids = [flow["flow_id"] for flow in data["flows"]]
    require([flow.get("flow_id") for flow in verification_flows] == expected_flow_ids,
            "verification flow inventory/order differs from the frozen assessment")

    execution_blocked = bool(data["execution_blocker_defect_ids"])
    require(execution_blocked == (runtime_status == "BLOCKED"),
            "execution blocker IDs and runtime BLOCKED status must agree")
    if execution_blocked:
        data["observations"] = []
        return data, source_rev, changed_files
    require(runtime_status == "ready",
            "non-blocked Repair verification requires a ready runtime")

    observations = []
    for flow, result in zip(data["flows"], verification_flows):
        flow_id = flow["flow_id"]
        observation_id = result.get("observation_id")
        require(observation_id, f"verification observation_id is required for {flow_id}")
        require(isinstance(result.get("actions"), list) and result["actions"],
                f"verification actions are required for {flow_id}")

        actions = []
        for action in result["actions"]:
            require(action.get("action") and action.get("actual_result"),
                    f"verification action/result is required for {flow_id}")
            evidence = [
                evidence_object(item, source_rev, observation_id, flow_id, now_iso)
                for item in action.get("evidence", [])
            ]
            require(evidence, f"verification action evidence is required for {flow_id}")
            actions.append({
                "sequence": action.get("sequence", len(actions) + 1),
                "at": action.get("at", now_iso),
                "action": action["action"],
                "actual_result": action["actual_result"],
                "target_ids": action.get("target_ids", []),
                "evidence": evidence,
            })

        observations.append({
            "observation_id": observation_id,
            "uc_id": uc_id,
            "run_id": run_id,
            "stage": stage,
            "source_revision": source_rev,
            "baseline": data.get("baseline") or data.get("input", {}).get("baseline"),
            "flow_id": flow_id,
            "planned_at": result.get("planned_at", now_iso),
            "started_at": result.get("started_at", now_iso),
            "ended_at": result.get("ended_at", now_iso),
            "time_limit_seconds": result.get("time_limit_seconds", 180),
            "scope": result.get("scope", f"Runtime observation of {flow_id}"),
            "actual_preconditions": result.get("actual_preconditions", "Recorded runtime preconditions"),
            "entry_point": result.get("entry_point", "runtime"),
            "entry_kind": result.get("entry_kind", "ui"),
            "end_state": result.get("end_state", "Recorded runtime end state"),
            "state": result.get("state", "completed"),
            "actions": actions,
        })

        step_results = {item.get("step_id"): item for item in result.get("steps", [])}
        require(set(step_results) == {step["step_id"] for step in flow["steps"]},
                f"verification step inventory differs for {flow_id}")
        for step in flow["steps"]:
            verdict = step_results[step["step_id"]]
            require(verdict.get("status") in {"met", "unmet", "not_evaluable"},
                    f"invalid verification status for {step['step_id']}")
            evidence = [
                evidence_object(item, source_rev, observation_id, flow_id, now_iso)
                for item in verdict.get("evidence", [])
            ]
            require(evidence, f"verification evidence is required for {step['step_id']}")
            step["status"] = verdict["status"]
            step["observation_id"] = observation_id
            step["rationale"] = verdict.get("rationale", "")
            step["required_runtime_kinds"] = sorted({item["kind"] for item in evidence})
            step["evidence_requirement_rationale"] = verdict.get(
                "evidence_requirement_rationale", "Recorded runtime evidence supports this verdict."
            )
            step["evidence"] = evidence
            step["source_findings"] = verdict.get("source_findings", [])

        terminal = result.get("terminal_outcome")
        require(isinstance(terminal, dict), f"terminal outcome verification is required for {flow_id}")
        require(terminal.get("status") in {"met", "unmet", "not_evaluable"},
                f"invalid terminal outcome status for {flow_id}")
        terminal_evidence = [
            evidence_object(item, source_rev, observation_id, flow_id, now_iso)
            for item in terminal.get("evidence", [])
        ]
        require(terminal_evidence, f"terminal outcome evidence is required for {flow_id}")
        flow["completion_observation_id"] = observation_id
        flow["terminal_outcome"].update({
            "status": terminal["status"],
            "observation_id": observation_id,
            "rationale": terminal.get("rationale", ""),
            "evidence": terminal_evidence,
            "required_runtime_kinds": sorted({item["kind"] for item in terminal_evidence}),
            "evidence_requirement_rationale": terminal.get(
                "evidence_requirement_rationale", "Recorded runtime evidence supports this verdict."
            ),
            "source_findings": terminal.get("source_findings", []),
        })

    data["observations"] = observations

    return data, source_rev, changed_files


def update_canonical_repairs(run_json_path, source_rev, changed_files=None, assessment_id=None,
                             verification_results_path=None):
    with open(run_json_path, "r", encoding="utf-8") as f:
        run_data = json.load(f)

    uc_lower = run_data["uc_id"].lower().replace("-", "")
    if not assessment_id:
        assessment_id = f"asm-{uc_lower}-final"

    run_dir = ROOT / "docs/02-construction/implementation" / run_data["uc_id"] / "runs" / run_data["run_id"]
    evidence_root = run_dir / "flow-accuracy" / "evidence" / assessment_id
    require(evidence_root.is_dir(), f"Evidence directory not found: {evidence_root}")

    verification_results_path = (
        verification_results_path or evidence_root / "verification-results.json"
    )
    require(verification_results_path.is_file(),
            f"Verification results not found: {verification_results_path}")
    with open(verification_results_path, "r", encoding="utf-8") as handle:
        verification = json.load(handle)
    require(verification.get("uc_id") == run_data["uc_id"], "verification UC identity mismatch")
    require(verification.get("run_id") == run_data["run_id"], "verification run identity mismatch")
    require(verification.get("assessment_id") == assessment_id,
            "verification assessment identity mismatch")

    if not changed_files:
        changed_files = get_changed_files(evidence_root / "_source" / "repair-source-manifest.json")

    # Collect all evidence files under evidence_root
    evidence_after = []
    if evidence_root.is_dir():
        for p in sorted(evidence_root.rglob("*")):
            if p.is_file() and not p.name.startswith("."):
                evidence_after.append({
                    "path": p.relative_to(ROOT).as_posix(),
                    "sha256": digest(p)
                })

    initial_defects = [row for row in run_data.get("defects", []) if row.get("stage") == "initial"]
    prompts_dir = run_dir / "repairs"
    repairs = run_data.get("repairs") or []
    active_round = None
    if repairs:
        last_round = repairs[-1]
        if last_round.get("outcome") == "in_progress":
            active_round = last_round
            expected_defect_ids = [item["defect_id"] for item in last_round.get("defect_attempts", [])]
        elif last_round.get("outcome") == "unresolved":
            require(len(repairs) < 10, "Repair round limit exhausted; an eleventh round is forbidden")
            expected_defect_ids = [
                item["defect_id"] for item in last_round.get("defect_attempts", [])
                if item.get("status") == "unresolved"
            ]
        else:
            raise ValueError("Cannot append verification to a terminal Repair run")
    else:
        expected_defect_ids = [item["defect_id"] for item in initial_defects]
    require(expected_defect_ids, "No unresolved immutable defects are eligible for this Repair round")
    initial_by_id = {item["defect_id"]: item for item in initial_defects}
    require(all(identity in initial_by_id for identity in expected_defect_ids),
            "Repair round references a defect outside the immutable initial inventory")
    target_defects = [initial_by_id[identity] for identity in expected_defect_ids]

    defect_results = verification.get("defects")
    require(isinstance(defect_results, list), "verification defects must be an array")
    require([item.get("defect_id") for item in defect_results]
            == expected_defect_ids,
            "verification defect inventory/order differs from the active immutable Repair targets")
    defect_attempts = []
    for df, verdict in zip(target_defects, defect_results):
        did = df["defect_id"]
        matches = list(prompts_dir.glob(f"repair-*-{did}.md"))
        require(len(matches) == 1, f"Expected one Repair prompt for {did}, found {len(matches)}")
        pfile = matches[0] if matches else (prompts_dir / f"repair-{did}.md")
        require(verdict.get("status") in {"resolved", "unresolved"},
                f"invalid verification defect status for {did}")
        verdict_evidence = []
        for item in verdict.get("evidence", []):
            path_value = item.get("path") if isinstance(item, dict) else item
            require(path_value, f"verification defect evidence path is required for {did}")
            path = ROOT / path_value
            require(path.is_file(), f"verification defect evidence not found: {path_value}")
            verdict_evidence.append({"path": path.relative_to(ROOT).as_posix(), "sha256": digest(path)})
        require(verdict_evidence, f"verification defect evidence is required for {did}")
        defect_attempts.append({
            "defect_id": did,
            "defect_fingerprint": df["fingerprint"],
            "prompt_path": pfile.relative_to(ROOT).as_posix(),
            "prompt_sha256": digest(pfile),
            "status": verdict["status"],
            "evidence": verdict_evidence
        })

    all_resolved = all(item["status"] == "resolved" for item in defect_attempts)

    if active_round is not None:
        round0 = active_round
        round0["source_revision_after"] = source_rev
        round0["changed_files"] = changed_files
        round0["evidence_after"] = evidence_after
        round0["defect_attempts"] = defect_attempts
    else:
        expected_directory = prompts_dir.relative_to(ROOT).as_posix()
        if repairs:
            source_before = repairs[-1].get("source_revision_after")
            ev_before = repairs[-1].get("evidence_after", [])
        else:
            source_before = (
                run_data.get("business_rules", {}).get("initial", {}).get("source_revision")
                or (initial_defects[0].get("source_revision") if initial_defects else None)
                or run_data.get("source_revision")
            )
            initial_dirs = [
                item for item in (run_dir / "flow-accuracy" / "evidence").iterdir()
                if item.is_dir() and "initial" in item.name.lower()
            ]
            require(len(initial_dirs) == 1,
                    f"Expected one initial evidence directory, found {len(initial_dirs)}")
            ev_before = [
                {"path": item.relative_to(ROOT).as_posix(), "sha256": digest(item)}
                for item in sorted(initial_dirs[0].rglob("*"))
                if item.is_file() and not item.name.startswith(".")
            ]
        require(source_before, "Could not determine source_revision_before for Repair round")
        require(ev_before, "Could not determine evidence_before for Repair round")
        model_id = (
            run_data.get("generation_model", {}).get("effective_model_id")
            or run_data.get("generation_model", {}).get("requested_model_id")
        )
        require(model_id, "Could not determine the effective model for Repair round")
        round_index = len(repairs) + 1
        round0 = {
            "repair_id": f"repair-round-{round_index:03d}",
            "round_index": round_index,
            "prompt_directory": expected_directory,
            "source_revision_before": source_before,
            "source_revision_after": source_rev,
            "affected_br_ids": list(dict.fromkeys(
                value for defect in target_defects for value in defect.get("affected_br_ids", [])
            )),
            "affected_flow_ids": list(dict.fromkeys(
                value for defect in target_defects for value in defect.get("affected_flow_ids", [])
            )),
            "evidence_before": ev_before,
            "changed_files": changed_files,
            "evidence_after": evidence_after,
            "defect_attempts": defect_attempts,
            "outcome": "in_progress",
            "model": {"effective_model_id": model_id},
        }
        repairs.append(round0)
        run_data["repairs"] = repairs

    if not round0.get("defect_attempts"):
        round0["defect_attempts"] = defect_attempts

    br_results = verification.get("business_rules")
    require(isinstance(br_results, list), "verification business_rules must be an array")
    ordered_br_ids = run_data.get("business_rules", {}).get("ordered_br_ids", [])
    require([item.get("br_id") for item in br_results] == ordered_br_ids,
            "verification BR inventory/order differs from the frozen baseline")
    final_requirements = []
    for verdict in br_results:
        require(verdict.get("status") in {"met", "unmet", "not_evaluable"},
                f"invalid verification BR status for {verdict.get('br_id')}")
        evidence_paths = []
        for item in verdict.get("evidence", []):
            path_value = item.get("path") if isinstance(item, dict) else item
            require(path_value, f"verification BR evidence path is required for {verdict['br_id']}")
            path = ROOT / path_value
            require(path.is_file(), f"verification BR evidence not found: {path_value}")
            evidence_paths.append(path.relative_to(ROOT).as_posix())
        require(evidence_paths, f"verification BR evidence is required for {verdict['br_id']}")
        row = {
            "br_id": verdict["br_id"],
            "status": verdict["status"],
            "rationale": verdict.get("rationale", ""),
            "evidence": evidence_paths,
            "runtime_observation_ids": verdict.get("runtime_observation_ids", []),
        }
        if verdict.get("blocking_defect_ids"):
            row["blocking_defect_ids"] = verdict["blocking_defect_ids"]
        final_requirements.append(row)

    bf_final = {
        "source_revision": source_rev,
        "assessed_at": verification.get("captured_at", datetime.now(timezone.utc).astimezone().isoformat()),
        "assessment_id": assessment_id,
        "stage": "final",
        "requirements": final_requirements,
        "total": len(final_requirements),
        "met": sum(item["status"] == "met" for item in final_requirements),
        "unmet": sum(item["status"] == "unmet" for item in final_requirements),
        "not_evaluable": sum(item["status"] == "not_evaluable" for item in final_requirements),
    }
    run_data["business_rules"]["final"] = bf_final
    run_data["business_rules"]["source_revision"] = source_rev

    all_br_met = bf_final["met"] == bf_final["total"]
    all_flows_met = all(
        all(step.get("status") == "met" for step in flow.get("steps", []))
        and flow.get("terminal_outcome", {}).get("status") == "met"
        for flow in verification.get("flows", [])
    )
    completed = all_resolved and all_br_met and all_flows_met
    if not completed:
        require(not all_resolved,
                "Unmet BR/Flow verification requires a corresponding unresolved immutable defect")
    round0["outcome"] = "resolved" if completed else "unresolved"
    run_data["repair_rounds_completed"] = len(run_data["repairs"])
    if completed:
        run_data["repair_status"] = "completed"
        run_data["run_status"] = "complete"
    elif len(run_data["repairs"]) >= 10:
        run_data["repair_status"] = "unresolved"
        run_data["run_status"] = "stopped"
    else:
        run_data["repair_status"] = "in_progress"
        run_data["run_status"] = "active"

    with open(run_json_path, "w", encoding="utf-8") as f:
        json.dump(run_data, f, indent=2, ensure_ascii=False)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", type=Path, required=True)
    parser.add_argument("--assessment-id", default=None)
    parser.add_argument("--stage", default="final")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--verification-results", type=Path)
    parser.add_argument("--changed-files", nargs="*", default=None)
    parser.add_argument("--update-repairs", action="store_true",
                        help="Also update canonical run repairs array and business_rules.final")
    args = parser.parse_args()

    with open(args.run_json, "r", encoding="utf-8") as f:
        run_data = json.load(f)

    run_dir = ROOT / "docs/02-construction/implementation" / run_data["uc_id"] / "runs" / run_data["run_id"]
    assessment, source_rev, changed_files = assemble_assessment(
        run_data, run_dir, args.assessment_id, args.stage, changed_files=args.changed_files,
        verification_results_path=args.verification_results
    )

    out_path = args.output or (run_dir / "flow-accuracy" / f"assessment-{run_data['uc_id'].lower().replace('-', '')}-final.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(assessment, f, indent=2, ensure_ascii=False)
    print(f"Assembled final assessment at: {out_path.relative_to(ROOT)}")
    print(f"Audited source revision: {source_rev}")

    if args.update_repairs:
        update_canonical_repairs(
            args.run_json, source_rev, changed_files, assessment["assessment_id"],
            verification_results_path=args.verification_results
        )
        print("Updated canonical run repairs array and final BR snapshot.")


if __name__ == "__main__":
    main()
