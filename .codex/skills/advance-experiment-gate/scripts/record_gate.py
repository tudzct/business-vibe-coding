#!/usr/bin/env python3
"""Persist one validated experiment gate transition after its internal action succeeds."""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens/scripts"))
from metrics_contract import atomic_write, context, read_json, require, run_lock

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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, type=Path)
    parser.add_argument("--gate", required=True, choices=NEXT)
    parser.add_argument("--outcome", required=True)
    parser.add_argument("--turn-id", required=True)
    args = parser.parse_args()
    path, _, folder = context(args.run_json)
    require(args.outcome in NEXT[args.gate], "invalid outcome for gate")
    with run_lock(folder):
        run = read_json(path)
        gates = run.setdefault("gates", {"current": args.gate, "history": []})
        require(gates.get("current") == args.gate, "gate is not current")
        require(isinstance(gates.get("history"), list), "invalid gate history")
        require(not any(row.get("gate") == args.gate for row in gates["history"]), "gate already closed")
        receipt = {"gate": args.gate, "outcome": args.outcome, "turn_id": args.turn_id,
                   "confirmed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")}
        gates["history"].append(receipt)
        gates["current"] = NEXT[args.gate][args.outcome]
        atomic_write(path, run)
    print(json.dumps({"status": "closed", "receipt": receipt, "next_gate": gates["current"]}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise SystemExit(f"gate error: {exc}")
