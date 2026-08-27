#!/usr/bin/env python3
"""Emit one local system instant as timezone-qualified ISO-8601 and epoch milliseconds."""

import json
from datetime import datetime


now = datetime.now().astimezone()
print(json.dumps({
    "at": now.isoformat(timespec="milliseconds"),
    "epoch_ms": round(now.timestamp() * 1000),
}))
