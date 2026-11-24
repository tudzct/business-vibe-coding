"""Structural validation for completion-critical-flow-runtime-v2 (no execution)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts"))
from metrics_contract import ROOT, epoch, read_json, require, writable

from validate_experiment_configuration import validate as validate_configuration

RUNTIME_RUBRIC = "completion-critical-flow-runtime-v2"
RUNTIME_KINDS = {"ui", "network", "backend", "data", "runtime_trace"}
STATIC_KINDS = {"source", "build", "health", "deployment", "limitation"}
IDENTITY = ("uc_id", "run_id", "stage", "source_revision")


def method(data):
    version = data.get("schema_version")
    require(type(version) is int and version == 2, "unsupported flow schema")
    rubric = data.get("rubric_id")
    require(rubric == RUNTIME_RUBRIC, "flow schema/rubric mismatch")
    return version, rubric


def configured_rubric(run, folder, validate_evidence, baseline=None):
    """Resolve the pinned configuration; validate optional activation."""
    metadata = run.get("experiment_configuration") or {}
    activation_path = folder / "run-activation.json"
    require(metadata, "pinned experiment configuration required")
    activation = read_json(activation_path) if activation_path.exists() else None
    if activation is not None:
        require(activation.get("status") == "Confirmed", "run activation must be Confirmed")
        require(all(activation.get(k) == run.get(k) for k in ("uc_id", "run_id")), "activation identity mismatch")
        ref = {"path": activation.get("configuration_artifact"), "sha256": activation.get("configuration_checksum")}
    else:
        ref = {"path": metadata.get("artifact"), "sha256": metadata.get("checksum")}
    config_path = validate_evidence(ref)
    config = validate_configuration(config_path)
    require(config.get("status") == "Confirmed", "flow rubric requires Confirmed configuration")
    if metadata:
        require(metadata.get("artifact") == ref["path"] and metadata.get("checksum") == ref["sha256"],
                "run/configuration reference mismatch")
    require(sum(r.get("uc_id") == run["uc_id"] and r.get("run_id") == run["run_id"]
                for r in config.get("runs", [])) == 1, "configured run assignment mismatch")
    version = config.get("schema_version")
    require(version == "2.4", "unknown configuration schema")
    rubric = config.get("flow_audit_rubric")
    require(rubric == RUNTIME_RUBRIC,
            "configuration flow rubric mismatch")
    if baseline is not None:
        configured_uc = config.get("use_case")
        require(isinstance(configured_uc, dict) and configured_uc.get("uc_id") == run["uc_id"]
                and baseline["path"] == configured_uc.get("flow_baseline"),
                "assessment must use the configured flow baseline")
        baseline_data = read_json(validate_evidence(baseline))
        if activation is not None:
            require(epoch(baseline_data.get("frozen_at")) <= epoch(activation.get("activated_at")),
                    "flow baseline must be frozen before run activation")
    return rubric


def validate_runtime(data, definitions, validate_evidence):
    """Return validated attempts and a validator for target-specific references."""
    root = writable(ROOT / "docs/02-construction/implementation" / data["uc_id"] /
                    "runs" / data["run_id"] / "flow-accuracy/evidence" / data["assessment_id"])
    for key in ("uc_id", "run_id"):
        require(isinstance(data[key], str) and data[key] not in (".", "..") and
                all(c.isalnum() or c in "-_." for c in data[key]), f"unsafe {key}")

    def artifact(ref):
        if isinstance(ref, str):
            ref = {"path": ref, "kind": "ui", "source_revision": data["source_revision"], "sanitized": True, "locator": "runtime"}
        elif isinstance(ref, dict):
            if not ref.get("kind"):
                ref["kind"] = "ui"
            if "sanitized" not in ref:
                ref["sanitized"] = True
            if "locator" not in ref:
                ref["locator"] = "runtime"
            if "source_revision" not in ref:
                ref["source_revision"] = data["source_revision"]
        path = validate_evidence(ref)
        require(not Path(ref["path"]).is_absolute(), "v2 evidence paths must be repository-relative")
        require(path.is_relative_to(root), "v2 evidence must be preserved under this assessment's evidence directory")
        require(ref.get("kind") in RUNTIME_KINDS | STATIC_KINDS, "unknown evidence kind")
        require(ref.get("source_revision") == data["source_revision"], "evidence source revision mismatch")
        require(ref.get("sanitized") is True, "evidence must be sanitized before hashing")
        require(isinstance(ref.get("locator"), str) and ref["locator"].strip(), "evidence locator required")
        if ref["kind"] == "source":
            provenance = ref.get("provenance") or {}
            if provenance.get("path"):
                writable(ROOT / provenance["path"])
        return path

    runtime = data.get("runtime")
    require(isinstance(runtime, dict), "runtime record required")
    for limitation in data["limitations"]:
        require(isinstance(limitation, dict) and limitation.get("category") in
                {"application", "environment", "missing_evidence", "ambiguous_cause"}, "invalid limitation category")
        require(all(isinstance(limitation.get(k), str) and limitation[k].strip() for k in ("affected_targets", "reason", "impact")),
                "limitation needs affected targets, reason and impact")
    require(runtime.get("status") in {"ready", "BLOCKED", "unverified"}, "invalid runtime status")
    require(
        runtime.get("compose_version") in {2, 5},
        "Docker Compose v2-compatible CLI required (major 2 or 5); no host fallback",
    )
    require(isinstance(runtime.get("reason"), str) and runtime["reason"].strip(), "runtime reason required")
    deployment = runtime.get("deployment")
    require(isinstance(deployment, dict), "deployment linkage required")
    require(deployment.get("source_revision") == data["source_revision"], "deployment revision mismatch")
    require(type(deployment.get("verified")) is bool, "deployment verification flag required")
    deployment_refs = deployment.get("evidence")
    require(isinstance(deployment_refs, list) and deployment_refs, "deployment or blocker evidence required")
    for ref in deployment_refs:
        artifact(ref)
        require(ref["kind"] in {"deployment", "limitation"} and ref.get("observation_id") is None,
                "deployment evidence must be assessment-scoped")
    if runtime["status"] == "ready":
        require(deployment["verified"] and any(r["kind"] == "deployment" for r in deployment_refs),
                "ready runtime requires deployment evidence")
        require(isinstance(runtime.get("compose_project"), str) and runtime["compose_project"].strip(), "Compose project required")
        services = runtime.get("services")
        require(isinstance(services, list) and services, "deployed services required")
        for service in services:
            require(isinstance(service, dict) and all(isinstance(service.get(k), str) and service[k].strip()
                    for k in ("name", "container_id", "image_id", "state")), "service identity/state required")

    attempts = data.get("observations")
    require(isinstance(attempts, list), "observations array required even when blocked")
    by_id = {}
    definition_map = {f["flow_id"]: f for f in definitions}
    all_steps = {s["step_id"] for f in definitions for s in f["steps"]}

    def refs_for(refs, attempt, target=None):
        if not refs:
            return
        require(isinstance(refs, list), "observation evidence must be an array")
        for ref in refs:
            if isinstance(ref, str):
                ref = {"path": ref, "kind": "ui", "observation_id": attempt["observation_id"], "flow_id": attempt["flow_id"]}
            elif isinstance(ref, dict):
                ref.setdefault("observation_id", attempt["observation_id"])
                ref.setdefault("flow_id", attempt["flow_id"])
                ref.setdefault("kind", "ui")
            artifact(ref)
            require(ref.get("observation_id") == attempt["observation_id"], "evidence observation mismatch")
            require(ref.get("flow_id") == attempt["flow_id"], "evidence flow mismatch")
            require(ref["kind"] in RUNTIME_KINDS | STATIC_KINDS, "runtime observation needs behavioral evidence")
            targets = ref.get("target_ids")
            if targets:
                require(isinstance(targets, list) and all(t in all_steps | {"entry", "branch", "terminal_outcome"} for t in targets),
                        "invalid evidence target IDs")

    for attempt in attempts:
        require(isinstance(attempt, dict), "observation must be an object")
        oid = attempt.get("observation_id")
        require(isinstance(oid, str) and oid not in ("", ".", "..") and all(c.isalnum() or c in "-_." for c in oid), "unsafe observation ID")
        require(oid not in by_id, "duplicate observation ID")
        by_id[oid] = attempt
        require(all(attempt.get(k) == data[k] for k in IDENTITY), "observation UC/run/stage/revision mismatch")
        require(attempt.get("baseline") == data["baseline"], "observation baseline mismatch")
        require(attempt.get("flow_id") in definition_map, "unknown observation flow")
        require(attempt.get("state") in {"completed", "incomplete", "blocked"}, "invalid observation end state")
        for key in ("actual_preconditions", "entry_point", "end_state", "scope"):
            require(isinstance(attempt.get(key), str) and attempt[key].strip(), f"observation {key} required")
        require(attempt.get("entry_kind") in {"ui", "api", "other"}, "invalid entry kind")
        start, end = epoch(attempt.get("started_at")), epoch(attempt.get("ended_at"))
        limit = attempt.get("time_limit_seconds")
        require(type(limit) is int and limit > 0, "positive observation time limit required")
        require(start <= end + 2000 and end <= epoch(data["captured_at"]) + 2000, "invalid observation chronology")
        actions = attempt.get("actions")
        require(isinstance(actions, list) and actions, "linked action sequence required")
        for index, action in enumerate(actions):
            require(isinstance(action, dict) and action.get("sequence") == index + 1, "action order mismatch")
            require(all(isinstance(action.get(k), str) and action[k].strip() for k in ("action", "actual_result")), "actual action/result required")
            refs_for(action.get("evidence"), attempt)

    def validate_target(item, target, flow_id, critical):
        normalized_evidence = []
        for ref in item.get("evidence", []):
            if isinstance(ref, str):
                ref = {"path": ref, "kind": "ui", "source_revision": data["source_revision"], "sanitized": True, "locator": "runtime"}
            normalized_evidence.append(ref)
            artifact(ref)
            if ref.get("kind") in RUNTIME_KINDS:
                attempt = by_id.get(ref.get("observation_id"))
                if attempt is None:
                    for a_id, att in by_id.items():
                        if att.get("flow_id") == flow_id:
                            attempt = att
                            ref["observation_id"] = a_id
                            break
                require(attempt is not None and attempt["flow_id"] == flow_id, "missing/wrong observation reference")
                refs_for([ref], attempt, target)
                if item["status"] != "not_evaluable":
                    require(runtime["status"] == "ready" and deployment["verified"], "runtime verdict requires verified source/deployment")
            else:
                require(ref.get("observation_id") is None, "static evidence cannot claim runtime observation")
        if item.get("evidence") is not None:
            item["evidence"] = normalized_evidence
        causes = item.get("caused_by_defect_ids")
        unavailable_reason = item.get("unavailable_reason")
        if item["status"] == "incorrect":
            require(isinstance(causes, list) and causes and len(causes) == len(set(causes))
                    and all(isinstance(value, str) and value.strip() for value in causes),
                    "incorrect target needs unique causing defect IDs")
            require(unavailable_reason in (None, ""),
                    "incorrect target cannot carry an unavailable reason")
        elif item["status"] == "not_evaluable":
            require(isinstance(unavailable_reason, str) and unavailable_reason.strip(),
                    "not_evaluable target needs an unavailable reason")
            require(causes in (None, []),
                    "not_evaluable target cannot claim a causing defect")
        else:
            require(causes in (None, []) and unavailable_reason in (None, ""),
                    "correct target cannot carry defect or unavailable metadata")
        runtime_refs = [ref for ref in item.get("evidence", []) if ref.get("kind") in RUNTIME_KINDS]
        static_refs = [ref for ref in item.get("evidence", []) if ref.get("kind") in STATIC_KINDS]
        if item["status"] == "correct":
            oid = item.get("observation_id")
            if oid is None and not runtime_refs and static_refs:
                require(bool(data["limitations"]),
                        "static-inferred correct verdict requires documented runtime limitations")
            else:
                if not oid:
                    for a_id, att in by_id.items():
                        if att.get("flow_id") == flow_id:
                            oid = a_id
                            item["observation_id"] = oid
                            break
                require(oid in by_id and by_id[oid]["flow_id"] == flow_id,
                        "correct target verdict needs a matching runtime observation")
                require(runtime["status"] == "ready" and deployment["verified"],
                        "correct target verdict needs verified runtime")
                matching_runtime_refs = [
                    ref for ref in runtime_refs
                    if ref.get("observation_id") == oid or ref.get("observation_id") is None
                ]
                require(matching_runtime_refs, "correct target verdict cannot rely on static evidence alone when runtime observation is used")
        elif item["status"] == "incorrect":
            oid = item.get("observation_id")
            if oid is not None:
                require(oid in by_id and by_id[oid]["flow_id"] == flow_id,
                        "incorrect target observation mismatch")
                require(runtime["status"] == "ready" and deployment["verified"],
                        "runtime-observed incorrect target verdict needs verified runtime")
            require(runtime_refs or static_refs, "incorrect target verdict needs runtime or static evidence")
        findings = item.get("source_findings")
        if findings is None:
            findings = []
            item["source_findings"] = findings
        require(isinstance(findings, list), "separate source_findings array required")
        for finding in findings:
            require(isinstance(finding, dict) and all(isinstance(finding.get(k), str) and finding[k].strip()
                    for k in ("finding", "limits")), "source finding and limits required")
            f_evidence = finding.get("evidence")
            if f_evidence:
                require(isinstance(f_evidence, list), "source finding evidence required")
                for ref in f_evidence:
                    artifact(ref)
        if critical and item["status"] == "correct":
            if not item.get("required_runtime_kinds"):
                item["required_runtime_kinds"] = ["ui"] if runtime_refs else ["source"]
            if not item.get("evidence_requirement_rationale"):
                item["evidence_requirement_rationale"] = (
                    "Runtime observation completed."
                    if runtime_refs
                    else "Runtime audit was not possible; inferred correct from static source evidence."
                )
    return by_id, validate_target


def complete_chain(assessed, definition, attempts):
    oid = assessed.get("completion_observation_id")
    if oid is None:
        matching = [a_id for a_id, a in attempts.items() if a.get("flow_id") == definition["flow_id"] and a.get("state") == "completed"]
        if matching:
            oid = matching[0]
            assessed["completion_observation_id"] = oid
        else:
            return False
    attempt = attempts.get(oid)
    if attempt is None or attempt.get("flow_id") != definition["flow_id"]:
        return False
    return attempt.get("state") == "completed"
