#!/usr/bin/env python3
"""Validate a frozen flow baseline without auditing source code."""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts"))
from flow_baseline_contract import validate_baseline


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("baseline", type=Path)
    args = parser.parse_args()
    path = args.baseline
    data = json.loads(path.read_text(encoding="utf-8"))
    _, counts = validate_baseline(data)
    print(json.dumps({"status": "valid", "uc_id": data["uc_id"], "counts": counts}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise SystemExit(f"flow baseline error: {exc}")
