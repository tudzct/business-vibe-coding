#!/usr/bin/env python3
"""Persist accepted BR/Flow follow-up results without altering source or telemetry."""

import argparse
import copy
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts"))
from metrics_contract import ROOT, atomic_write, context, read_json, require, run_lock
from flow_summary import RESULT_POLICY, current_assessment, fingerprint, refresh_report, refresh_summary


def prepare(run, folder, payload=None):
    # Audit validation is read-only here, including the prior immutable assessments.
    sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "audit-generation-metrics/scripts"))
    from calculate_metrics import accepted_br_summary, apply_br_followup, validate_flow
    from score_flow_accuracy import calculate
    validate_flow(run, folder)
    updated = copy.deepcopy(run)
    updated["flow_accuracy"]["selection_policy"] = RESULT_POLICY
    combined = isinstance(payload, dict) and any(
        key in payload for key in ("flow", "business_rules", "defects")
    )
    if combined:
        require(set(payload) <= {"flow", "business_rules", "defects"},
                "combined audit follow-up has unknown fields")
        flow_record = payload.get("flow")
        br_record = payload.get("business_rules")
        defect_records = payload.get("defects", [])
        require(isinstance(defect_records, list), "combined audit follow-up defects must be an array")
        require(isinstance(flow_record, dict) or isinstance(br_record, dict) or bool(defect_records),
                "combined audit follow-up requires results or researcher defects")
        if isinstance(flow_record, dict) and isinstance(br_record, dict):
            require(flow_record.get("followup_id") == br_record.get("followup_id"),
                    "combined BR/flow results must share one follow-up ID")
    else:
        flow_record, br_record, defect_records = payload, None, []

    followup_records = [record for record in (flow_record, br_record) if isinstance(record, dict)]
    followup_ids = {record.get("followup_id") for record in followup_records}
    if defect_records:
        require(all(isinstance(defect, dict) for defect in defect_records),
                "researcher defect must be an object")
        require(all(record.get("mode") == "researcher_result" for record in followup_records),
                "researcher defects require researcher-result follow-up records")
        defect_followup_ids = {defect.get("researcher_followup_id") for defect in defect_records}
        if followup_records:
            require(len(followup_ids) == 1 and None not in followup_ids,
                    "researcher defects require one shared follow-up ID")
            followup_id = next(iter(followup_ids))
            require(defect_followup_ids == {followup_id},
                    "researcher defect attribution mismatch")
        else:
            require(len(defect_followup_ids) == 1 and None not in defect_followup_ids,
                    "researcher defects require one shared follow-up ID")
            require(all(defect.get("category") == "technical"
                        and defect.get("blocks_execution") is False for defect in defect_records),
                    "defect-only follow-up supports non-blocking technical defects only")
            followup_id = next(iter(defect_followup_ids))
        require(updated.get("repairs") == [] and updated.get("repair_prompt_directory") is None
                and updated.get("all_sub_prompt_count") in (None, 0)
                and updated.get("repair_status") in (None, "not_started"),
                "researcher defects must be recorded before prompt generation or repair")
        assessment = current_assessment(updated)
        source_revision = assessment["input"]["source_revision"]
        known_flow_ids = [row["flow_id"] for row in assessment["flows"]]
        known_br_ids = (updated.get("business_rules") or {}).get("ordered_br_ids", [])
        researcher_evidence_root = (folder / "flow-accuracy" / "evidence").resolve()
        for defect in defect_records:
            require(defect.get("reported_by") == "researcher"
                    and defect.get("researcher_followup_id") == followup_id,
                    "researcher defect attribution mismatch")
            require(defect.get("stage") == "initial" and defect.get("status") == "open",
                    "researcher defect must be an open initial finding")
            require(defect.get("source_revision") == source_revision,
                    "researcher defect source revision mismatch")
            for ref in defect.get("evidence", []):
                require(isinstance(ref, dict) and isinstance(ref.get("path"), str),
                        "researcher defect evidence path required")
                evidence_path = (ROOT / ref["path"]).resolve()
                require(evidence_path.is_relative_to(researcher_evidence_root),
                        "researcher defect evidence must belong to the active run")
            updated.setdefault("defects", []).append(copy.deepcopy(defect))

        from score_flow_accuracy import validate_defects
        validate_defects(updated, "initial", source_revision, known_flow_ids)

        negative_br_ids = {
            row.get("br_id") for row in (br_record or {}).get("results", [])
            if row.get("status") == "unmet"
        }
        negative_flow_ids = {
            row.get("flow_id") for row in (flow_record or {}).get("results", [])
            if row.get("status") == "incorrect"
        }
        require(negative_br_ids <= set(known_br_ids) and negative_flow_ids <= set(known_flow_ids),
                "researcher defect follow-up references an unknown frozen target")

        blocker_ids = [row["defect_id"] for row in defect_records if row["blocks_execution"]]
        if blocker_ids:
            require(isinstance(flow_record, dict) and isinstance(br_record, dict),
                    "researcher execution blocker requires complete BR and Flow results")
            require({row.get("br_id") for row in br_record.get("results", [])} == set(known_br_ids)
                    and all(row.get("status") == "unmet" for row in br_record["results"]),
                    "researcher execution blocker must mark every frozen BR unmet")
            require({row.get("flow_id") for row in flow_record.get("results", [])} == set(known_flow_ids)
                    and all(row.get("status") == "incorrect" for row in flow_record["results"]),
                    "researcher execution blocker must mark every frozen Flow incorrect")
            flow_record = copy.deepcopy(flow_record)
            flow_record["execution_blocker_defect_ids"] = blocker_ids

    researcher_negative_br_ids = {
        row.get("br_id") for row in (br_record or {}).get("results", [])
        if (br_record or {}).get("mode") == "researcher_result" and row.get("status") == "unmet"
    }
    researcher_negative_flow_ids = {
        row.get("flow_id") for row in (flow_record or {}).get("results", [])
        if (flow_record or {}).get("mode") == "researcher_result" and row.get("status") == "incorrect"
    }
    if researcher_negative_br_ids or researcher_negative_flow_ids:
        initial_defects = [row for row in updated.get("defects", [])
                           if isinstance(row, dict) and row.get("stage") == "initial"
                           and row.get("status") == "open"]
        covered_br_ids = {value for row in initial_defects for value in row.get("affected_br_ids", [])}
        covered_flow_ids = {value for row in initial_defects for value in row.get("affected_flow_ids", [])}
        require(researcher_negative_br_ids <= covered_br_ids,
                "researcher unmet BR result requires a canonical affected defect")
        require(researcher_negative_flow_ids <= covered_flow_ids,
                "researcher incorrect Flow result requires a canonical affected defect")
    if flow_record is not None:
        require(isinstance(flow_record, dict), "flow follow-up must be an object")
        record = copy.deepcopy(flow_record)
        if record.get("mode") == "llm_measurement":
            record["runtime_result"] = calculate(record.pop("runtime_assessment"))
        history = updated["flow_accuracy"].setdefault("followups", [])
        previous = next((r for r in history if r.get("followup_id") == record.get("followup_id")), None)
        require(previous is None or previous == record, "follow-up ID is immutable")
        parent = next((a for a in updated["flow_accuracy"]["assessments"]
                       if a["assessment_id"] == record.get("assessment_id")), None)
        require(parent is not None and record.get("assessment_sha256") == fingerprint(parent),
                "follow-up must identify its immutable evidence assessment")
        if previous is None and record.get("mode") == "llm_measurement":
            require(parent == current_assessment(updated), "LLM observation requires the current source assessment")
            recorded_source = (run.get("business_rules") or {}).get("source_revision")
            require(recorded_source is None or recorded_source == parent["input"]["source_revision"],
                    "current source record differs from the flow assessment; do not mix runtime revisions")
        if previous is None:
            history.append(record)
    br_summary = apply_br_followup(updated, br_record) if br_record is not None else accepted_br_summary(updated)
    summary = refresh_summary(updated, folder)
    validate_flow(updated, folder)
    result = {"business_rules": br_summary, "flow_accuracy": summary,
              "researcher_defects_added": len(defect_records)} if combined else summary
    return updated, result


def persist(path, run, folder, summary):
    # Follow-ups are validated append-only records in canonical JSON.
    atomic_write(path, run)
    refresh_report(path, run)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, type=Path)
    parser.add_argument("--input", help="Audit follow-up JSON path, or '-' for stdin; omit to refresh results")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    path, run, folder = context(args.run_json)
    require(path.is_relative_to(ROOT / "docs/04-experiments"),
            "flow follow-up writes only canonical experiment JSON under docs/04-experiments")
    reserved = (folder / "flow-accuracy").resolve()
    require(not path.is_relative_to(reserved), "canonical JSON cannot be a flow evidence artifact")
    payload = json.load(sys.stdin) if args.input == "-" else (read_json(Path(args.input)) if args.input else None)
    if args.dry_run:
        _, summary = prepare(run, folder, payload)
    else:
        with run_lock(folder):
            updated, summary = prepare(read_json(path), folder, payload)
            persist(path, updated, folder, summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, TypeError, KeyError) as exc:
        raise SystemExit(f"flow follow-up error: {exc}")
