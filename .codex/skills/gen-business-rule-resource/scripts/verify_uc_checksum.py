#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify a frozen UC checksum across deterministic newline forms")
    parser.add_argument("path")
    parser.add_argument("--expected", required=True, help="Expected SHA-256, with or without sha256: prefix")
    args = parser.parse_args()

    path = Path(args.path)
    data = path.read_bytes()
    canonical_lf = data.replace(b"\r\n", b"\n").replace(b"\r", b"\n")
    candidates = {
        "raw-bytes": sha256(data),
        "canonical-lf": sha256(canonical_lf),
        "canonical-crlf": sha256(canonical_lf.replace(b"\n", b"\r\n")),
    }
    expected = args.expected.removeprefix("sha256:")
    matched_via = next((name for name, value in candidates.items() if value == expected), None)
    print(json.dumps({
        "path": path.as_posix(),
        "algorithm": "sha256",
        "expected": expected,
        "matches": matched_via is not None,
        "matched_via": matched_via,
        "candidate_hashes": candidates,
    }, ensure_ascii=False, indent=2))
    return 0 if matched_via else 2


if __name__ == "__main__":
    raise SystemExit(main())
