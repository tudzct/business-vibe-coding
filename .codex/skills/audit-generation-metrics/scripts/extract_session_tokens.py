#!/usr/bin/env python3
"""Compatibility entrypoint: legacy live/latest-session extraction is retired."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens" / "scripts"))
from measure_uc_tokens import main

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] not in ("list", "close-phase", "finalize-workflow", "-h", "--help"):
        sys.exit("Legacy extraction flags are retired. In a later turn use measure_uc_tokens.py "
                 "close-phase/finalize-workflow with --run-json, --selection and --measurement-turn-id. "
                 "Historical run JSON is preserved; no latest-session guessing or live-turn updates.")
    try:
        main()
    except (ValueError, KeyError, OSError) as exc:
        sys.exit(f"measurement error: {exc}")
