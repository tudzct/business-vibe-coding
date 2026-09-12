#!/usr/bin/env python3
"""Persist one validated experiment gate transition after its internal action succeeds."""

import argparse
import copy
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens/scripts"))
from metrics_contract import ROOT, atomic_write, context, digest, read_json, require, run_lock, validate_metrics, writable
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "gen-coding-prompt/scripts"))
from validate_prompt_contract import validate_prompt, normalize_variant, validate_configuration
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "audit-generation-metrics/scripts"))
from calculate_metrics import validate_flow, validate_snapshot

NEXT = {
    "configuration": {"confirmed": "prompt"},
    "prompt": {"confirmed": "source"},
    "source": {"confirmed": "first_pass_audit"},
    "first_pass_audit": {"confirmed": "repair_decision"},
    "repair_decision": {"authorized": "repair", "skipped": "final_audit"},
    "repair": {"confirmed": "final_audit"},
    "final_audit": {"confirmed": "final_metrics"},
    "final_metrics": {"confirmed": None},
}


def snapshot_hash(value):
    return digest(json.dumps(value, sort_keys=True, separators=(",", ":")).encode())


def closed_phase(run, phase):
    metrics = run.get("metrics")
    require(isinstance(metrics, dict), "gate requires persisted telemetry")
    validate_metrics(metrics)
    require(all(metrics.get(k) == run[k] for k in ("uc_id", "run_id")), "telemetry identity mismatch")
    require(metrics.get("phases", {}).get(phase, {}).get("status") == "closed", f"{phase} telemetry must be closed")


def audit_evidence(run, folder, stage):
    business = run.get("business_rules") or {}
    ordered = business.get("ordered_br_ids")
    require(isinstance(ordered, list) and ordered and len(ordered) == len(set(ordered)), "BR baseline IDs required")
    baseline = read_json(writable(ROOT / business.get("baseline", "")))
    require(baseline.get("status") == "Frozen" and baseline.get("uc_id") == run["uc_id"]
            and baseline.get("ordered_br_ids") == ordered, "BR baseline mismatch")
    snapshot = business.get(stage)
    validated = copy.deepcopy(snapshot)
    validate_snapshot(validated, ordered, f"business_rules.{stage}")
    require(validated == snapshot, "persist validated BR counts before closing Audit Gate")
    summary = validate_flow(run, folder)
    block = run["flow_accuracy"]
    current = next(r for r in block["assessments"] if r["assessment_id"] == block["current_assessment_id"])
    require(current.get("stage") == stage, f"gate requires {stage} flow assessment")
    require(all(current["input"].get(k) == run[k] for k in ("uc_id", "run_id")), "audit identity mismatch")
    source = current["input"].get("source_revision")
    require(isinstance(source, str) and re.fullmatch(r"sha256:[0-9a-f]{64}", source), "audited source hash required")
    if stage == "final":
        require(source == business.get("source_revision"), "final BR/flow source hash mismatch")
    return {"business_rules_sha256": snapshot_hash(snapshot), "flow_assessment_id": summary["assessment_id"],
            "flow_assessment_sha256": snapshot_hash(current), "source_revision": source}


def prepare_transition(run, folder, gate, outcome, turn_id, reason=None):
    """Validate the common pipeline and its evidence; mutate only the in-memory copy."""
    require(gate in NEXT and outcome in NEXT[gate], "invalid gate/outcome")
    gates = run.get("gates")
    require(isinstance(gates, dict) and gates.get("current") == gate, "gate is not current")
    history = gates.get("history")
    require(isinstance(history, list), "invalid gate history")
    expected = "configuration"
    for row in history:
        require(row.get("gate") == expected and row.get("outcome") in NEXT.get(expected, {}), "invalid gate sequence")
        expected = NEXT[expected][row["outcome"]]
    require(expected == gate, "gate history does not reach current gate")
    require(isinstance(turn_id, str) and turn_id.strip(), "confirmation turn ID required")
    require(not any(r.get("turn_id") == turn_id for r in history), "one gate operation per turn")
    config_ref = run.get("experiment_configuration") or {}
    config_path = writable(ROOT / config_ref.get("artifact", ""))
    require(config_path.is_file() and digest(config_path.read_bytes()) == config_ref.get("checksum"), "configuration checksum mismatch")
    config = validate_configuration(config_path)
    assignments = [r for r in config["runs"] if r.get("uc_id") == run["uc_id"] and r.get("run_id") == run["run_id"]]
    require(len(assignments) == 1, "gate needs configured UC/run")
    variant = normalize_variant(assignments[0].get("prompt_variant", "full"))
    require(normalize_variant(run.get("prompt_variant", "full")) == variant, "canonical run/configuration variant mismatch")
    if gate not in {"configuration", "prompt"}:
        activation = read_json(folder / "run-activation.json")
        require(activation.get("uc_id") == run["uc_id"] and activation.get("run_id") == run["run_id"]
                and activation.get("status") == "Confirmed", "gate activation mismatch")
        require(activation.get("configuration_artifact") == config_ref["artifact"]
                and activation.get("configuration_checksum") == config_ref["checksum"], "activation/configuration mismatch")
        require(normalize_variant(activation.get("prompt_variant", "full")) == variant, "gate activation variant mismatch")
    evidence = {}
    if gate in {"prompt", "source"}:
        reference = run.get("coding_prompt") or {}
        prompt = writable(ROOT / reference.get("path", ""))
        require(prompt.is_file() and digest(prompt.read_bytes()) == reference.get("sha256"), "approved coding_prompt reference required")
        result = validate_prompt(config_path, run["uc_id"], run["run_id"], prompt,
                                 folder / "run-activation.json" if gate == "source" else None)
        require(normalize_variant(run.get("prompt_variant", "full")) == result["prompt_variant"], "run/prompt variant mismatch")
        closed_phase(run, "prompt_generation" if gate == "prompt" else "source_generation")
        evidence["coding_prompt"] = reference
    if gate in {"first_pass_audit", "repair_decision", "repair", "final_audit", "final_metrics"}:
        closed_phase(run, "source_generation")
    if gate in {"first_pass_audit", "final_audit", "final_metrics"}:
        evidence = audit_evidence(run, folder, "initial" if gate == "first_pass_audit" else "final")
    if gate in {"repair_decision", "repair", "final_audit", "final_metrics"}:
        first = next((r for r in history if r["gate"] == "first_pass_audit"), None)
        require(first is not None, "first-pass audit must precede repair/finalization")
        recorded = first.get("evidence") or {}
        # Historical gate receipts may lack hashes; never fabricate or rewrite them.
        if recorded:
            require(recorded.get("business_rules_sha256") == snapshot_hash(run["business_rules"]["initial"]), "initial BR evidence changed")
            initial = next((r for r in run["flow_accuracy"]["assessments"] if r["assessment_id"] == recorded.get("flow_assessment_id")), None)
            require(initial is not None and snapshot_hash(initial) == recorded.get("flow_assessment_sha256"), "initial flow evidence changed")
    if gate == "repair_decision":
        audit_evidence(run, folder, "initial")
        if outcome == "skipped":
            require(isinstance(reason, str) and reason.strip(), "skip requires the researcher's reason")
            require(not run.get("repairs"), "cannot skip already executed repair")
            run["repair_skip_reason"] = reason
        run["repair_authorization"] = {"approved": outcome == "authorized", "turn_id": turn_id}
    if gate == "repair":
        decision = next((r for r in history if r["gate"] == "repair_decision"), None)
        approval = run.get("repair_authorization") or {}
        require(decision and decision["outcome"] == "authorized" and approval.get("approved") is True
                and approval.get("turn_id") == decision["turn_id"], "repair authorization mismatch")
        closed_phase(run, "repair")
    if gate == "final_metrics":
        require(run.get("metrics", {}).get("status") == "finalized", "final workflow metrics must be persisted")
    receipt = {"gate": gate, "outcome": outcome, "turn_id": turn_id,
               "confirmed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")}
    if evidence:
        receipt["evidence"] = evidence
    if gate == "repair_decision" and outcome == "skipped":
        receipt["reason"] = reason
    history.append(receipt)
    gates["current"] = NEXT[gate][outcome]
    return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, type=Path)
    parser.add_argument("--gate", required=True, choices=NEXT)
    parser.add_argument("--outcome", required=True)
    parser.add_argument("--turn-id", required=True)
    parser.add_argument("--reason", help="Researcher's recorded reason when skipping repair")
    parser.add_argument("--dry-run", action="store_true", help="Validate the pending transition without writing")
    args = parser.parse_args()
    path, _, folder = context(args.run_json)
    require(args.outcome in NEXT[args.gate], "invalid outcome for gate")
    if args.dry_run:
        run = read_json(path)
        prepare_transition(run, folder, args.gate, args.outcome, args.turn_id, args.reason)
        print(json.dumps({"status": "valid", "next_gate": run["gates"]["current"]}, indent=2))
        return
    with run_lock(folder):
        run = read_json(path)
        receipt = prepare_transition(run, folder, args.gate, args.outcome, args.turn_id, args.reason)
        gates = run["gates"]
        atomic_write(path, run)
    print(json.dumps({"status": "closed", "receipt": receipt, "next_gate": gates["current"]}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, TypeError, KeyError) as exc:
        raise SystemExit(f"gate error: {exc}")
