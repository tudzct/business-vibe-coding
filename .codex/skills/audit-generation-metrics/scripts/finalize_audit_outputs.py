#!/usr/bin/env python3
"""Commit a self-contained Audit handoff and compact canonical score record."""

import argparse
import copy
import json
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts"))
from metrics_contract import atomic_write, context, digest, read_json, require, run_lock, writable

from build_defects_handoff import canonical_hash, validate_handoff
from compact_audit_contract import artifact_hash, hash_value


STATUSES = {"correct", "incorrect", "not_evaluable"}


def compact_rows(rows, key):
    result = []
    for row in rows:
        projected = {key: row[key], "status": row["status"]}
        require(projected["status"] in STATUSES, f"invalid {key} result")
        if key == "flow_id":
            projected["type"] = row["type"]
            for field in ("result_source", "record_id", "assessment_id", "stage", "source_revision"):
                if field in row:
                    projected[field] = row[field]
        if projected["status"] == "incorrect":
            causes = row.get("caused_by_defect_ids")
            require(isinstance(causes, list) and causes, f"incorrect {key} needs defect IDs")
            projected["caused_by_defect_ids"] = list(causes)
        elif projected["status"] == "not_evaluable":
            reason = row.get("unavailable_reason")
            require(isinstance(reason, str) and reason.strip(), f"{key} needs unavailable reason")
            projected["unavailable_reason"] = reason
        result.append(projected)
    return result


def compact_snapshot(snapshot, key):
    rows = compact_rows(snapshot["requirements" if key == "br_id" else "flows"], key)
    counts = {status: sum(row["status"] == status for row in rows) for status in STATUSES}
    require(snapshot["total"] == len(rows) if key == "br_id" else
            snapshot["counts"]["total"] == len(rows), "Audit inventory total mismatch")
    for status, count in counts.items():
        require((snapshot[status] if key == "br_id" else snapshot["counts"][status]) == count,
                "Audit result counts mismatch")
    if key == "br_id":
        return {"requirements": rows, "total": len(rows), **counts}
    return rows


def compact_defect(defect):
    fields = ("defect_id", "fingerprint", "category", "affected_br_ids",
              "affected_flow_ids", "blocks_execution", "source_revision", "stage", "status")
    result = {key: copy.deepcopy(defect[key]) for key in fields}
    for field in ("reported_by", "researcher_followup_id"):
        if field in defect:
            result[field] = defect[field]
    return result


def compact_followups(records, target_key):
    result = []
    for item in records:
        projected = {key: copy.deepcopy(item[key]) for key in
                     ("followup_id", "mode", "recorded_at", "request_turn_id") if key in item}
        projected["results"] = [{target_key: row[target_key], "status": row["status"]}
                                for row in item["results"]]
        if item.get("execution_blocker_defect_ids"):
            projected["execution_blocker_defect_ids"] = list(item["execution_blocker_defect_ids"])
        result.append(projected)
    return result


def compact(run, handoff):
    require(run.get("audit_result_format") is None, "Audit outputs already compacted")
    require(not run.get("repairs") and not run.get("repair_prompt_directory"),
            "compact Audit before prompt generation and Repair")
    business = run["business_rules"]
    flow = run["flow_accuracy"]
    summary = flow["current_summary"]
    require(not summary.get("pending_flows"), "resolve pending Flow verdicts before handoff")
    require(not any(row["status"] == "not_evaluable" for row in business["final"]["requirements"]),
            "resolve pending BR verdicts before handoff")
    assessments = flow["assessments"]
    require(assessments and assessments[0]["stage"] == "initial", "initial Flow assessment missing")
    require(len(assessments) == 1, "compact initial Audit before Repair final assessment")
    initial = assessments[0]
    require(initial["assessment_id"] == flow["current_assessment_id"], "Flow assessment mismatch")
    require(initial["input"]["source_revision"] == business["source_revision"]
            == handoff["source_revision"], "audited source revision mismatch")
    blueprint = {key: copy.deepcopy(initial["input"][key])
                 for key in ("schema_version", "rubric_id", "baseline")}
    blueprint["flows"] = [{
        "flow_id": item["flow_id"], "source_anchor": item["source_anchor"],
        "steps": [{key: copy.deepcopy(step[key]) for key in
                   ("step_id", "text", "completion_critical", "criticality_reason")}
                  for step in item["steps"]],
        "terminal_outcome": {"text": item["terminal_outcome"]["text"]},
    } for item in initial["input"]["flows"]]
    initial_rows = compact_rows(initial["flows"], "flow_id")
    flow_rows = compact_snapshot(summary, "flow_id")
    br_initial = compact_snapshot(business["initial"], "br_id")
    br_final = compact_snapshot(business["final"], "br_id")
    ids = [row["br_id"] for row in br_initial["requirements"]]
    require(ids == business["ordered_br_ids"]
            and [row["br_id"] for row in br_final["requirements"]] == ids,
            "BR baseline inventory changed")
    flow_ids = [row["flow_id"] for row in initial_rows]
    require([row["flow_id"] for row in flow_rows] == flow_ids,
            "Flow baseline inventory changed")
    defects = [compact_defect(item) for item in run["defects"]]
    handoff_ids = {item["defect_id"] for item in handoff["defects"]}
    incorrect_br_ids = {row["br_id"] for row in br_final["requirements"]
                        if row["status"] == "incorrect"}
    incorrect_flow_ids = {row["flow_id"] for row in flow_rows
                          if row["status"] == "incorrect"}
    selected_ids = {item["defect_id"] for item in defects if item["status"] == "open"
                    and (item["category"] in {"technical", "ui"}
                         or bool(set(item["affected_br_ids"]) & incorrect_br_ids)
                         or bool(set(item["affected_flow_ids"]) & incorrect_flow_ids))}
    require(handoff_ids == selected_ids,
            "handoff must contain every selected repairable Audit defect")
    result = copy.deepcopy(run)
    result["audit_result_format"] = "compact-v1"
    result["audit_handoff_defect_ids"] = [item["defect_id"] for item in handoff["defects"]]
    result["audit_accepted_results"] = {
        "business_rules": [{"br_id": row["br_id"], "status": row["status"]}
                           for row in br_final["requirements"]],
        "flows": [{"flow_id": row["flow_id"], "status": row["status"]}
                  for row in flow_rows],
        "execution_blocked": bool(summary.get("execution_blocked")),
    }
    require(handoff["accepted_results_sha256"] == hash_value(result["audit_accepted_results"]),
            "handoff accepted results differ from Audit scores")
    result["defects"] = defects
    result["business_rules"]["initial"] = br_initial
    result["business_rules"]["final"] = br_final
    result["business_rules"]["followups"] = compact_followups(
        business.get("followups", []), "br_id")
    result["flow_accuracy"] = {
        "schema_version": flow["schema_version"],
        "rubric_id": flow["rubric_id"],
        "selection_policy": flow["selection_policy"],
        "current_assessment_id": flow["current_assessment_id"],
        "repair_blueprint": blueprint,
        "assessments": [{
            "assessment_id": initial["assessment_id"], "stage": "initial",
            "status": initial["status"], "counts": initial["counts"],
            "flow_accuracy_percent": initial["flow_accuracy_percent"],
            "flow_error_percent": initial["flow_error_percent"],
            "source_revision": initial["input"]["source_revision"],
            "captured_at": initial["input"]["captured_at"],
            "observation_ids": [item["observation_id"] for item in
                                initial["input"].get("observations", [])],
            "flows": initial_rows,
        }],
        "current_summary": {**summary, "flows": flow_rows, "pending_flows": []},
    }
    result["flow_accuracy"]["followups"] = compact_followups(
        flow.get("followups", []), "flow_id")
    result["audit_initial_flow_progress_sha256"] = digest(json.dumps(
        result["flow_accuracy"]["current_summary"], sort_keys=True,
        separators=(",", ":")).encode("utf-8"))
    return result


def cleanup_targets(folder, initial, followups=(), defects=()):
    identities = list(dict.fromkeys([initial["assessment_id"]]
                                   + [row["followup_id"] for row in followups]))
    require(all(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", identity)
                for identity in identities), "unsafe Audit assessment/follow-up ID")
    flow_dir = writable(folder / "flow-accuracy")
    candidates = []
    for identity in identities:
        candidates.extend([flow_dir / f"{identity}.json", flow_dir / f"{identity}.md",
                           flow_dir / f"{identity}.input.json",
                           flow_dir / f"{identity}-input.json",
                           flow_dir / f"{identity}.requirements.json",
                           flow_dir / "evidence" / identity])
    evidence_root = writable(flow_dir / "evidence")
    for defect in defects:
        for ref in defect.get("evidence", []):
            path = writable(Path(__file__).resolve().parents[4] / ref["path"])
            require(path.is_relative_to(evidence_root),
                    "Audit evidence cleanup must stay in the active run evidence directory")
            candidates.append(path)
    candidates = list(dict.fromkeys(candidates))
    for target in candidates:
        resolved = writable(target)
        require(resolved.is_relative_to(flow_dir) and resolved != flow_dir,
                "Audit cleanup target escapes Flow directory")
    if flow_dir.is_dir():
        unexpected = [path for path in flow_dir.rglob("*") if path.is_file()
                      and not any(path == target or path.is_relative_to(target)
                                  for target in candidates)]
        require(not unexpected,
                "unrecognized temporary Audit artifact; inspect and remove before finalization: "
                + ", ".join(str(path.relative_to(folder)) for path in unexpected[:5]))
    return candidates


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    path, run, folder = context(args.run_json)
    with run_lock(folder):
        if run.get("audit_result_format") == "compact-v1":
            from compact_audit_contract import validate as validate_compact_audit
            validate_compact_audit(run, folder)
            targets = cleanup_targets(folder, run["flow_accuracy"]["assessments"][0],
                                      run["flow_accuracy"].get("followups", [])
                                      + run["business_rules"].get("followups", []))
            if not args.dry_run:
                for target in targets:
                    if target.is_dir():
                        shutil.rmtree(target)
                    elif target.is_file():
                        target.unlink()
            print(json.dumps({"status": "valid" if args.dry_run else "compacted",
                              "defect_count": len(run["defects"]),
                              "audit_artifacts": [str(item) for item in targets if item.exists()]},
                             ensure_ascii=False, indent=2))
            return
        handoff_path = writable(folder / "defects-handoff.json")
        require(handoff_path.is_file(), "validated Defects Handoff is required")
        handoff = validate_handoff(read_json(handoff_path), run["uc_id"], run["run_id"])
        result = compact(run, handoff)
        require(handoff["canonical_defects_sha256"] in
                {canonical_hash(run["defects"]), canonical_hash(result["defects"])},
                "handoff does not match canonical Audit defects")
        handoff["canonical_defects_sha256"] = canonical_hash(result["defects"])
        result["audit_handoff_sha256"] = artifact_hash(handoff)
        initial = run["flow_accuracy"]["assessments"][0]
        targets = cleanup_targets(folder, initial,
                                  run["flow_accuracy"].get("followups", [])
                                  + run["business_rules"].get("followups", []),
                                  run["defects"])
        if not args.dry_run:
            atomic_write(handoff_path, handoff)
            for target in targets:
                if target.is_dir():
                    shutil.rmtree(target)
                elif target.is_file():
                    target.unlink()
            flow_dir = folder / "flow-accuracy"
            require(not flow_dir.is_dir() or not any(item.is_file() for item in flow_dir.rglob("*")),
                    "temporary Audit files remain after finalization")
            atomic_write(path, result)
    print(json.dumps({"status": "valid" if args.dry_run else "compacted",
                      "defect_count": len(handoff["defects"]),
                      "audit_artifacts": [str(item) for item in targets if item.exists()]},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, TypeError) as exc:
        raise SystemExit(f"Audit finalization error: {exc}")
