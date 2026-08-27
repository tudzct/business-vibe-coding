#!/usr/bin/env python3
"""Propose or create an Approved SR-blind final-source evaluation input."""

import argparse
import hashlib
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

EXCLUDED_PARTS = {"node_modules", "dist", ".env", ".git"}
SAFE_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}")
UC_ID = re.compile(r"UC-[0-9]{3}")


def tree_hash(root: Path) -> str:
    digest = hashlib.sha256()
    for path in sorted(item for item in root.rglob("*") if item.is_file() and not EXCLUDED_PARTS.intersection(item.parts)):
        digest.update(path.relative_to(root).as_posix().encode())
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return f"sha256:{digest.hexdigest()}"


def file_hash(path: Path) -> str:
    return f"sha256:{hashlib.sha256(path.read_bytes()).hexdigest()}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--evaluation-id", required=True)
    parser.add_argument("--researcher", required=True)
    parser.add_argument("--uc-from", required=True)
    parser.add_argument("--uc-to", required=True)
    parser.add_argument("--policy", required=True, type=Path)
    parser.add_argument("--approve", action="store_true")
    args = parser.parse_args()
    if not SAFE_ID.fullmatch(args.evaluation_id):
        raise SystemExit("input error: invalid evaluation ID")
    if not args.researcher.strip():
        raise SystemExit("input error: researcher is required")
    if not UC_ID.fullmatch(args.uc_from) or not UC_ID.fullmatch(args.uc_to):
        raise SystemExit("input error: UC range values must match UC-NNN")

    repo = Path(__file__).resolve().parents[4]
    policy_path = (repo / args.policy).resolve()
    try:
        policy_rel = policy_path.relative_to(repo).as_posix()
    except ValueError as exc:
        raise SystemExit("input error: policy must be inside the repository") from exc
    if not policy_path.is_file():
        raise SystemExit(f"input error: policy does not exist: {policy_rel}")

    scan_scripts = repo / ".codex/skills/run-third-party-security-scan/scripts"
    sys.path.insert(0, str(scan_scripts))
    from validate_evaluation_policy import validate

    policy = validate(policy_path, require_approved=True)
    frozen_hash = tree_hash(repo / "finalsource")
    approved_at = datetime.now(timezone.utc).astimezone().isoformat()
    output_dir = f"docs/03-audit/security-tools/finalsource/{args.evaluation_id}/"
    data = {
        "artifact_type": "final-source-security-evaluation-input",
        "schema_version": 1,
        "evaluation_id": args.evaluation_id,
        "status": "Approved" if args.approve else "Proposed",
        "researcher": args.researcher,
        "approved_at": approved_at if args.approve else None,
        "scope": {"kind": "current_final_source", "source_root": "finalsource/", "frozen_hash": frozen_hash, "categories": ["A01", "A02"], "contributing_uc_range": {"from": args.uc_from, "to": args.uc_to}},
        "policy": {"path": policy_rel, "checksum": file_hash(policy_path), "id": policy["policy_id"]},
        "tools": {
            "semgrep": {"enabled": True, "input_contract": "templates/security-evaluation/semgrep-evaluation-input.template.json", "output_contract": "templates/security-evaluation/semgrep-evaluation-output.template.json"},
            "zap": {"enabled": True, "input_contract": "templates/security-evaluation/zap-evaluation-input.template.json", "output_contract": "templates/security-evaluation/zap-evaluation-output.template.json"},
        },
        "output": {"directory": output_dir, "canonical_summary": "evaluation-summary.json"},
    }
    if not args.approve:
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return

    input_path = repo / "docs/03-audit/security-tools/finalsource/inputs" / f"{args.evaluation_id}.json"
    result_dir = repo / output_dir
    if input_path.exists():
        raise SystemExit(f"input error: immutable input already exists: {input_path.relative_to(repo)}")
    if result_dir.exists() and any(result_dir.iterdir()):
        raise SystemExit(f"input error: immutable output already exists: {result_dir.relative_to(repo)}")
    input_path.parent.mkdir(parents=True, exist_ok=True)
    input_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    validator = scan_scripts / "validate_evaluation_input.py"
    try:
        subprocess.run([sys.executable, str(validator), str(input_path)], cwd=repo, check=True)
    except subprocess.CalledProcessError:
        input_path.unlink(missing_ok=True)
        raise
    print(json.dumps({"status": "created", "evaluation_input": input_path.relative_to(repo).as_posix(), "frozen_hash": frozen_hash}, separators=(",", ":")))


if __name__ == "__main__":
    main()
