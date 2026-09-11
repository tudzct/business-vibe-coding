#!/usr/bin/env python3
"""Legacy instant output; identity-bound arguments forward to the shared capture helper."""

import json
import sys
from pathlib import Path
from datetime import datetime


if __name__ == "__main__":
    if len(sys.argv) > 1:
        import runpy
        target = Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens" / "scripts"
        sys.path.insert(0, str(target))
        runpy.run_path(str(target / "capture_timestamp.py"), run_name="__main__")
    else:
        now = datetime.now().astimezone()
        print(json.dumps({"at": now.isoformat(timespec="milliseconds"),
                          "epoch_ms": round(now.timestamp() * 1000)}))
