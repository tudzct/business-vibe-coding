#!/usr/bin/env python3
"""Assemble, score, and validate one evidence-backed per-defect Repair attempt."""

import argparse
import hashlib
import json
import os
import re
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


def verification_schemas(assessment_id, defect_id):
    return {
        "verification_results": {
            "required_top_level": [
                "uc_id", "run_id", "assessment_id", "captured_at",
                "limitations", "execution_blocker_defect_ids", "flows",
                "business_rules", "defects"
            ],
            "flow_action_example": {
                "sequence": 1,
                "action": "<ACTION-PERFORMED>",
                "actual_result": "<OBSERVED-RESULT>",
                "target_ids": ["entry"],
                "evidence": [{
                    "path": f"docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/flow-accuracy/evidence/{assessment_id}/<observation-id>/<file>",
                    "kind": "ui",
                    "target_ids": ["entry"]
                }]
            },
            "flow_rules": [
                "Each flow requires a unique non-empty observation_id, entry_point, entry_kind ('ui'|'api'|'other'), actual_preconditions, end_state, state ('completed'|'incomplete'|'blocked'), and non-empty actions.",
                "First action must include non-empty evidence; when entry_kind is 'ui', first action evidence must include kind 'ui' and target_ids covering 'entry'.",
                "Last action of a completed flow should cover 'terminal_outcome'; Alternative/Exception flows must include an action targeting 'branch'."
            ],
            "target_status_rules": {
                "correct": "Do NOT include caused_by_defect_ids or unavailable_reason.",
                "incorrect": "MUST include non-empty unique caused_by_defect_ids and NO unavailable_reason.",
                "not_evaluable": "MUST include non-empty unavailable_reason and NO caused_by_defect_ids."
            },
            "defect_example": {
                "defect_id": defect_id,
                "status": "resolved",
                "evidence": [
                    f"docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/flow-accuracy/evidence/{assessment_id}/<observation-id>/<file>"
                ]
            }
        },
        "deployment": {
            "path": f"docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/flow-accuracy/evidence/{assessment_id}/_runtime/deployment.json",
            "capture_command": (
                f"python -B .codex/skills/repair-source-code/scripts/run_repair_cycle.py "
                f"--run-json <canonical.json> --assessment-id {assessment_id} --defect-id {defect_id} --capture-deployment"
            ),
            "ready_example": {
                "status": "ready",
                "compose_version": 2,
                "verified": True,
                "compose_project": "<OBSERVED-COMPOSE-PROJECT>",
                "reason": "Frontend and backend containers rebuilt and healthy.",
                "services": [{
                    "name": "backend",
                    "container_id": "<CONTAINER-ID>",
                    "image_id": "<IMAGE-ID>",
                    "state": "running"
                }]
            }
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
        "ordered_br_ids": ordered_br_ids,
        "schemas": verification_schemas(assessment_id, defect_id),
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


def parse_compose_major(compose_dir):
    out = run_cmd(["docker", "compose", "-f", "compose.yaml", "version", "--format", "json"], cwd=compose_dir)
    version_text = ""
    try:
        version_text = str(json.loads(out).get("version", ""))
    except json.JSONDecodeError:
        version_text = out
    match = re.search(r"(\d+)", version_text)
    require(match is not None, f"Could not determine Docker Compose version from: {out}")
    major = int(match.group(1))
    require(major in {2, 5}, f"Unsupported Docker Compose major version {major}; expected 2 or 5")
    return major


def parse_compose_ps(raw):
    text = raw.strip()
    if not text:
        return []
    if text.startswith("["):
        rows = json.loads(text)
        require(isinstance(rows, list), "docker compose ps JSON output must be an array")
        return rows
    rows = []
    for line in text.splitlines():
        line = line.strip()
        if line:
            rows.append(json.loads(line))
    return rows


def extract_compose_label(labels_value, key):
    if isinstance(labels_value, dict):
        return labels_value.get(key)
    if isinstance(labels_value, str):
        for part in labels_value.split(","):
            name, sep, val = part.partition("=")
            if sep and name.strip() == key:
                return val.strip()
    return None


def capture_deployment_evidence(evidence_root):
    compose_dir = ROOT / "finalsource"
    compose_file = compose_dir / "compose.yaml"
    require(compose_file.is_file(), f"Compose file not found: {compose_file}")
    compose_version = parse_compose_major(compose_dir)
    ps_raw = run_cmd(["docker", "compose", "-f", "compose.yaml", "ps", "--format", "json"], cwd=compose_dir)
    rows = parse_compose_ps(ps_raw)
    require(rows, "No running Docker Compose services observed; start backend/frontend before capturing deployment")

    compose_project = None
    services = []
    non_running = []
    for item in rows:
        name = item.get("Service") or item.get("Name")
        container_id = item.get("ID")
        labels = item.get("Labels")
        if not compose_project:
            compose_project = item.get("Project") or extract_compose_label(labels, "com.docker.compose.project")
        image_id = extract_compose_label(labels, "com.docker.compose.image") or item.get("Image")
        state = item.get("State")
        if state != "running":
            non_running.append(f"{name or container_id}={state}")
        services.append({
            "name": name,
            "container_id": container_id,
            "image_id": image_id,
            "state": state,
        })

    require(not non_running, f"All observed Compose services must be running: {', '.join(non_running)}")
    require(isinstance(compose_project, str) and compose_project.strip(),
            "Could not determine Compose project name from docker compose ps output")
    for idx, svc in enumerate(services):
        for field in ("name", "container_id", "image_id", "state"):
            require(isinstance(svc.get(field), str) and svc[field].strip(),
                    f"Captured Compose service[{idx}] missing {field}")

    deployment_path = evidence_root / "_runtime" / "deployment.json"
    payload = {
        "status": "ready",
        "compose_version": compose_version,
        "verified": True,
        "compose_project": compose_project,
        "reason": "Observed running Docker Compose services via docker compose ps.",
        "services": services,
    }
    atomic_json(deployment_path, payload)
    return deployment_path, payload


def display_path(path):
    resolved = path.resolve()
    return resolved.relative_to(ROOT).as_posix() if resolved.is_relative_to(ROOT) else str(path)


def check_evidence_items(items, label, evidence_root, errors, require_ui=False):
    if not isinstance(items, list) or not items:
        errors.append(f"{label} must be a non-empty evidence array")
        return
    saw_ui = False
    for idx, item in enumerate(items):
        entry_label = f"{label}[{idx}]"
        if isinstance(item, str):
            raw_path = item
            kind = "ui"
        elif isinstance(item, dict):
            raw_path = item.get("path")
            kind = item.get("kind") or "ui"
        else:
            errors.append(f"{entry_label} must be a path string or evidence object")
            continue
        if kind == "ui":
            saw_ui = True
        if not isinstance(raw_path, str) or not raw_path.strip():
            errors.append(f"{entry_label}.path is required")
            continue
        p = Path(raw_path)
        if p.is_absolute():
            errors.append(f"{entry_label}.path must be repository-relative: {raw_path}")
            continue
        resolved = (ROOT / p).resolve()
        if not resolved.is_file():
            errors.append(f"{entry_label}.path file not found: {raw_path}")
        elif not resolved.is_relative_to(evidence_root.resolve()):
            errors.append(f"{entry_label}.path must stay under {display_path(evidence_root)}: {raw_path}")
    if require_ui and not saw_ui:
        errors.append(f"{label} requires at least one entry with kind 'ui'")


def validate_target_verdict(verdict, label, errors):
    if not isinstance(verdict, dict):
        errors.append(f"{label} must be an object")
        return
    status = verdict.get("status")
    if status not in {"correct", "incorrect", "not_evaluable"}:
        errors.append(f"{label}.status must be 'correct', 'incorrect', or 'not_evaluable'")
        return
    causes = verdict.get("caused_by_defect_ids")
    unavailable = verdict.get("unavailable_reason")
    if status == "correct":
        if causes not in (None, []):
            errors.append(f"{label} has status 'correct' and must NOT carry caused_by_defect_ids")
        if unavailable not in (None, ""):
            errors.append(f"{label} has status 'correct' and must NOT carry unavailable_reason")
    elif status == "incorrect":
        if not (isinstance(causes, list) and causes and len(causes) == len(set(causes))
                and all(isinstance(v, str) and v.strip() for v in causes)):
            errors.append(f"{label} has status 'incorrect' and requires non-empty unique caused_by_defect_ids")
        if unavailable not in (None, ""):
            errors.append(f"{label} has status 'incorrect' and must NOT carry unavailable_reason")
    else:
        if not (isinstance(unavailable, str) and unavailable.strip()):
            errors.append(f"{label} has status 'not_evaluable' and requires non-empty unavailable_reason")
        if causes not in (None, []):
            errors.append(f"{label} has status 'not_evaluable' and must NOT carry caused_by_defect_ids")


def validate_deployment_evidence(deployment_path, execution_blocked):
    errors = []
    if not deployment_path.is_file():
        errors.append(
            f"Actual runtime deployment evidence not found: {display_path(deployment_path)} "
            f"(run with --capture-deployment or write _runtime/deployment.json)"
        )
        return errors
    try:
        dep = json.loads(deployment_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return [f"Could not parse {display_path(deployment_path)}: {exc}"]

    if not isinstance(dep, dict):
        return ["_runtime/deployment.json must be a JSON object"]
    runtime_status = dep.get("status", "ready")
    if runtime_status not in {"ready", "BLOCKED", "unverified"}:
        errors.append("_runtime/deployment.json.status must be 'ready', 'BLOCKED', or 'unverified'")
    if dep.get("compose_version") not in {2, 5}:
        errors.append("_runtime/deployment.json.compose_version must be integer 2 or 5")
    verified = dep.get("verified", runtime_status == "ready")
    if type(verified) is not bool:
        errors.append("_runtime/deployment.json.verified must be Boolean")
    services = dep.get("services")
    if not isinstance(services, list):
        errors.append("_runtime/deployment.json.services must be an array")
        services = []

    if runtime_status == "ready":
        if execution_blocked:
            errors.append("_runtime/deployment.json.status cannot be 'ready' when execution_blocker_defect_ids is non-empty")
        if verified is not True:
            errors.append("_runtime/deployment.json.verified must be true when status is 'ready'")
        if not (isinstance(dep.get("compose_project"), str) and dep["compose_project"].strip()):
            errors.append("_runtime/deployment.json.compose_project is required when status is 'ready'")
        if not services:
            errors.append("_runtime/deployment.json.services must be non-empty when status is 'ready'")
        for idx, svc in enumerate(services):
            if not isinstance(svc, dict) or not all(
                isinstance(svc.get(k), str) and svc[k].strip()
                for k in ("name", "container_id", "image_id", "state")
            ):
                errors.append(
                    f"_runtime/deployment.json.services[{idx}] requires non-empty name, container_id, image_id, state"
                )
    else:
        if verified is not False:
            errors.append("_runtime/deployment.json.verified must be false when status is BLOCKED/unverified")
        if not (isinstance(dep.get("reason"), str) and dep["reason"].strip()):
            errors.append("_runtime/deployment.json.reason is required when status is BLOCKED/unverified")
    return errors


def validate_verification_results(path, run_data, assessment_id, flow_ids, defect_id,
                                  evidence_root=None, deployment_path=None):
    require(path.is_file(), f"Repair verification results not found: {path}")
    with open(path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    if evidence_root is None:
        evidence_root = path.parent

    errors = []
    if data.get("uc_id") != run_data["uc_id"]:
        errors.append("uc_id mismatch")
    if data.get("run_id") != run_data["run_id"]:
        errors.append("run_id mismatch")
    if data.get("assessment_id") != assessment_id:
        errors.append("assessment_id mismatch")

    blocker_ids = data.get("execution_blocker_defect_ids", [])
    if not isinstance(blocker_ids, list):
        errors.append("execution_blocker_defect_ids must be an array")
        blocker_ids = []
    execution_blocked = bool(blocker_ids)

    flows = data.get("flows")
    if not isinstance(flows, list) or [item.get("flow_id") for item in flows] != flow_ids:
        errors.append(
            "flows inventory/order must exactly match verification-plan.json; "
            "restore the prepared inventory and retry this attempt"
        )
    else:
        observation_ids = set()
        for idx, flow in enumerate(flows):
            flow_id = flow.get("flow_id", f"flows[{idx}]")
            flabel = f"flows[{idx}] ({flow_id})"
            if not execution_blocked:
                observation_id = flow.get("observation_id")
                if not (isinstance(observation_id, str) and observation_id.strip()):
                    errors.append(f"{flabel}.observation_id is required")
                elif observation_id in observation_ids:
                    errors.append(f"{flabel}.observation_id is duplicated: {observation_id}")
                else:
                    observation_ids.add(observation_id)
                for req_str in ("entry_point", "actual_preconditions", "end_state"):
                    val = flow.get(req_str)
                    if not (isinstance(val, str) and val.strip()):
                        errors.append(f"{flabel}.{req_str} is required")
                entry_kind = flow.get("entry_kind")
                if entry_kind not in {"ui", "api", "other"}:
                    errors.append(f"{flabel}.entry_kind must be 'ui', 'api', or 'other'")
                if flow.get("state") not in {"completed", "incomplete", "blocked"}:
                    errors.append(f"{flabel}.state must be 'completed', 'incomplete', or 'blocked'")
                actions = flow.get("actions")
                if not isinstance(actions, list) or not actions:
                    errors.append(f"{flabel}.actions must be a non-empty array")
                else:
                    for aidx, action in enumerate(actions):
                        alabel = f"{flabel}.actions[{aidx}]"
                        if not isinstance(action, dict):
                            errors.append(f"{alabel} must be an object")
                            continue
                        if not (isinstance(action.get("action"), str) and action["action"].strip()):
                            errors.append(f"{alabel}.action is required")
                        if not (isinstance(action.get("actual_result"), str) and action["actual_result"].strip()):
                            errors.append(f"{alabel}.actual_result is required")
                        check_evidence_items(
                            action.get("evidence"),
                            f"{alabel}.evidence",
                            evidence_root,
                            errors,
                            require_ui=(aidx == 0 and entry_kind == "ui"),
                        )
            steps = flow.get("steps")
            if not isinstance(steps, list) or not steps:
                errors.append(f"{flabel}.steps must be a non-empty array")
            else:
                for sidx, step in enumerate(steps):
                    sid = step.get("step_id", f"step[{sidx}]") if isinstance(step, dict) else f"step[{sidx}]"
                    validate_target_verdict(step, f"{flabel}.steps[{sidx}] ({sid})", errors)
            validate_target_verdict(flow.get("terminal_outcome"), f"{flabel}.terminal_outcome", errors)

    business_rules = data.get("business_rules")
    ordered_br_ids = run_data.get("business_rules", {}).get("ordered_br_ids", [])
    if not isinstance(business_rules, list):
        errors.append("business_rules must be an array")
    elif [item.get("br_id") for item in business_rules] != ordered_br_ids:
        errors.append(
            "business_rules inventory/order must exactly match verification-plan.json; "
            "restore the prepared inventory and retry this attempt"
        )
    else:
        for bidx, br in enumerate(business_rules):
            bid = br.get("br_id", f"br[{bidx}]") if isinstance(br, dict) else f"br[{bidx}]"
            validate_target_verdict(br, f"business_rules[{bidx}] ({bid})", errors)
            if isinstance(br, dict) and br.get("status") == "correct" and br.get("blocking_defect_ids"):
                errors.append(f"business_rules[{bidx}] ({bid}) has status 'correct' and must NOT carry blocking_defect_ids")

    defects = data.get("defects")
    if not isinstance(defects, list) or [item.get("defect_id") for item in defects] != [defect_id]:
        errors.append(f"defects must contain exactly the current fixed defect [{defect_id}]")
    else:
        dverdict = defects[0]
        if dverdict.get("status") not in {"resolved", "unresolved"}:
            errors.append(f"defects[0] ({defect_id}).status must be 'resolved' or 'unresolved'")
        check_evidence_items(dverdict.get("evidence"), f"defects[0] ({defect_id}).evidence", evidence_root, errors)

    if deployment_path is not None:
        errors.extend(validate_deployment_evidence(deployment_path, execution_blocked))

    if errors:
        bullet_list = "\n- ".join(errors)
        raise ValueError(f"Repair verification validation failed ({len(errors)} issue(s)):\n- {bullet_list}")
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
    parser.add_argument("--capture-deployment", action="store_true",
                        help="Inspect live Docker Compose services and write _runtime/deployment.json")
    parser.add_argument("--validate-only", action="store_true",
                        help="Validate verification-results.json and _runtime/deployment.json without committing")
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
        require(not args.capture_deployment and not args.validate_only,
                "--prepare cannot be combined with --capture-deployment or --validate-only")
        evidence_root.mkdir(parents=True, exist_ok=True)
        plan_path, results_path = prepare_verification(
            run_path, run_data, run_dir, evidence_root, assessment_id, flow_ids, args.defect_id
        )
        print(f"Prepared bounded Repair verification plan: {plan_path.relative_to(ROOT)}")
        print(f"Prepared full verification results skeleton: {results_path.relative_to(ROOT)}")
        return

    require(evidence_root.is_dir(), f"Repair evidence directory not found: {evidence_root}")
    if args.capture_deployment:
        require(args.verification_results is None and not args.validate_only,
                "--capture-deployment cannot be combined with --verification-results or --validate-only")
        deployment_path, payload = capture_deployment_evidence(evidence_root)
        print(f"Captured runtime deployment evidence: {deployment_path.relative_to(ROOT)}")
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return

    now_iso = datetime.now(timezone.utc).astimezone().isoformat()
    results_path = (args.verification_results.resolve() if args.verification_results
                    else evidence_root / "verification-results.json")
    deployment_path = evidence_root / "_runtime" / "deployment.json"
    validate_verification_results(
        results_path, run_data, assessment_id, flow_ids, args.defect_id,
        evidence_root=evidence_root, deployment_path=deployment_path
    )
    if args.validate_only:
        print(json.dumps({
            "valid": True,
            "assessment_id": assessment_id,
            "defect_id": args.defect_id,
            "verification_results": results_path.relative_to(ROOT).as_posix(),
            "deployment": deployment_path.relative_to(ROOT).as_posix(),
        }, ensure_ascii=False, indent=2))
        return

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
        summary_out = run_cmd([sys.executable, "-B", str(metrics_script), str(run_path)])
        print("6. Final pre/post-Repair summary:", summary_out)
    print("\n=== REPAIR DEFECT ATTEMPT RECORDED ===")


if __name__ == "__main__":
    main()
