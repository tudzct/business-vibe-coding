#!/usr/bin/env python3
import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Optional


def repo_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / "PROJECT_CONTEXT.md").is_file():
            return parent
    raise SystemExit("Không tìm thấy repository root chứa PROJECT_CONTEXT.md")


ROOT = repo_root()
DATASET_ROOT = ROOT / "resource/figma-design-dataset"


def select_dataset(version: Optional[str]) -> Path:
    if version:
        candidate = DATASET_ROOT / version
        if not (candidate / "manifest.json").is_file():
            raise FileNotFoundError(f"Dataset version không tồn tại hoặc thiếu manifest: {version}")
        return candidate
    candidates = sorted(
        path for path in DATASET_ROOT.iterdir()
        if path.is_dir() and (path / "manifest.json").is_file()
    )
    if not candidates:
        raise FileNotFoundError("Chưa có full offline Figma dataset")
    return candidates[-1]


def normalize_uc(value: str) -> str:
    match = re.search(r"(?i)uc[-_ ]*0*(\d{1,3})", value)
    if not match:
        raise ValueError(f"Không nhận diện được UC từ: {value}")
    return f"UC-{int(match.group(1)):03d}"


def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def verify(dataset: Path) -> list[dict]:
    results = []
    for line in (dataset / "checksums.sha256").read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        expected, relative = line.split("  ", 1)
        target = dataset / relative
        actual = digest(target) if target.is_file() else None
        results.append({"path": relative, "ok": actual == expected, "expected": expected, "actual": actual})
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Resolve immutable UC to frozen Figma dataset")
    parser.add_argument("target", nargs="?", help="UC ID or UC file path")
    parser.add_argument("--validate-all", action="store_true")
    parser.add_argument("--dataset-version", help="Tên thư mục dataset bất biến cần dùng")
    args = parser.parse_args()
    try:
        dataset = select_dataset(args.dataset_version)
    except FileNotFoundError as error:
        print(json.dumps({"status": "no-dataset", "error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 4
    manifest = json.loads((dataset / "manifest.json").read_text(encoding="utf-8"))
    checks = verify(dataset)
    integrity_ok = all(item["ok"] for item in checks)
    if args.validate_all:
        print(json.dumps({"dataset_id": manifest["dataset_id"], "integrity_ok": integrity_ok, "files": checks}, ensure_ascii=False, indent=2))
        return 0 if integrity_ok else 2
    if not args.target:
        parser.error("cần target hoặc --validate-all")
    try:
        key = normalize_uc(args.target)
    except ValueError as error:
        print(json.dumps({"error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 2
    entry = manifest["use_cases"].get(key)
    if entry is None:
        print(json.dumps({"error": f"{key} không có trong manifest"}, ensure_ascii=False), file=sys.stderr)
        return 2
    node = manifest["nodes"].get(entry["node_id"]) if entry["node_id"] else None
    output = {"uc_id": key, "status": entry["status"], "dataset_id": manifest["dataset_id"], "node_id": entry["node_id"], "integrity_ok": integrity_ok}
    if node:
        output.update({"frame_name": node["frame_name"], "snapshot_dir": str(dataset / node["snapshot_dir"]) if node["snapshot_dir"] else None})
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0 if entry["status"] in {"complete", "no-design"} and integrity_ok else 3


if __name__ == "__main__":
    raise SystemExit(main())
