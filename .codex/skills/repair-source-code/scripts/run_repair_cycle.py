#!/usr/bin/env python3
"""Assemble, score, and validate one evidence-backed Repair verification round."""

import argparse
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(path_or_bytes):
    raw = path_or_bytes.read_bytes() if isinstance(path_or_bytes, Path) else path_or_bytes
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def run_cmd(cmd, cwd=ROOT):
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=60)
    if res.returncode != 0:
        raise RuntimeError(f"Command failed ({cmd}):\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
    return res.stdout.strip()


def get_changed_files(passed_files=None):
    if passed_files:
        return sorted([f.replace("\\", "/") for f in passed_files])

    changed = set()
    try:
        res = subprocess.run(
            ["git", "status", "--porcelain", "finalsource"],
            cwd=ROOT,
            capture_output=True,
            text=True
        )
        if res.returncode == 0:
            for line in res.stdout.strip().splitlines():
                if line.strip():
                    fpath = line.strip().split()[-1].replace("\\", "/")
                    changed.add(fpath)
    except Exception:
        pass

    if not changed:
        try:
            res = subprocess.run(
                ["git", "diff", "--name-only", "HEAD", "finalsource"],
                cwd=ROOT,
                capture_output=True,
                text=True
            )
            if res.returncode == 0:
                for line in res.stdout.strip().splitlines():
                    if line.strip():
                        changed.add(line.strip().replace("\\", "/"))
        except Exception:
            pass

    verified = []
    for value in sorted(changed):
        path = Path(value)
        absolute = path if path.is_absolute() else ROOT / path
        require(absolute.is_file(), f"Changed source file not found: {value}")
        require(absolute.is_relative_to(ROOT / "finalsource"),
                f"Repair changed file is outside finalsource: {value}")
        verified.append(absolute.relative_to(ROOT).as_posix())
    require(verified, "No changed Repair source files were supplied or detected")
    return verified


def configured_flow_ids(run_data, run_dir, explicit=None):
    if explicit:
        return list(dict.fromkeys(explicit))

    baseline_file = (
        ROOT / "docs/02-construction/implementation" / run_data["uc_id"] / "flow-baseline.json"
    )
    if baseline_file.is_file():
        with open(baseline_file, "r", encoding="utf-8") as handle:
            values = json.load(handle).get("ordered_flow_ids", [])
        if values:
            return list(dict.fromkeys(values))

    for candidate in sorted((run_dir / "flow-accuracy").glob("*initial*.json")):
        with open(candidate, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
        flows = payload.get("flows") or payload.get("input", {}).get("flows") or []
        values = [item.get("flow_id") for item in flows if item.get("flow_id")]
        if values:
            return list(dict.fromkeys(values))
    raise ValueError("Could not resolve the active UC flow inventory from baseline or initial assessment")


def validate_verification_results(path, run_data, assessment_id, flow_ids):
    require(path.is_file(), f"Repair verification results not found: {path}")
    with open(path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    require(data.get("uc_id") == run_data["uc_id"], "verification UC identity mismatch")
    require(data.get("run_id") == run_data["run_id"], "verification run identity mismatch")
    require(data.get("assessment_id") == assessment_id, "verification assessment identity mismatch")
    recorded = [item.get("flow_id") for item in data.get("flows", [])]
    require(recorded == flow_ids,
            "verification flow inventory/order must exactly match the active flow baseline")
    require(isinstance(data.get("business_rules"), list),
            "verification business_rules results must be an array")
    require(isinstance(data.get("defects"), list),
            "verification defects results must be an array")
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", type=Path, required=True)
    parser.add_argument("--assessment-id", required=True)
    parser.add_argument("--verification-results", type=Path)
    parser.add_argument("--changed-files", nargs="*", default=None,
                        help="Explicit list of changed source files in finalsource")
    parser.add_argument("--flow-ids", nargs="*", default=None,
                        help="Exact flow inventory; defaults to the frozen baseline")
    args = parser.parse_args()

    run_path = args.run_json.resolve()
    with open(run_path, "r", encoding="utf-8") as f:
        run_data = json.load(f)

    uc_id = run_data["uc_id"]
    run_id = run_data["run_id"]
    assessment_id = args.assessment_id
    run_dir = ROOT / "docs/02-construction/implementation" / uc_id / "runs" / run_id
    evidence_root = run_dir / "flow-accuracy" / "evidence" / assessment_id
    require(evidence_root.is_dir(), f"Repair evidence directory not found: {evidence_root}")

    now_iso = datetime.now(timezone.utc).astimezone().isoformat()
    flow_ids = configured_flow_ids(run_data, run_dir, args.flow_ids)
    results_path = (args.verification_results.resolve() if args.verification_results
                    else evidence_root / "verification-results.json")
    validate_verification_results(results_path, run_data, assessment_id, flow_ids)

    deployment_path = evidence_root / "_runtime" / "deployment.json"
    require(deployment_path.is_file(),
            f"Actual runtime deployment evidence not found: {deployment_path}")

    # Source manifest
    source_dir = evidence_root / "_source"
    source_dir.mkdir(parents=True, exist_ok=True)
    changed_files = get_changed_files(args.changed_files)
    manifest_files = []
    for c in changed_files:
        cp = ROOT / c if not Path(c).is_absolute() else Path(c)
        if cp.is_file():
            manifest_files.append({"path": cp.relative_to(ROOT).as_posix(), "sha256": digest(cp)})
    (source_dir / "repair-source-manifest.json").write_text(json.dumps({"captured_at": now_iso, "files": manifest_files}, indent=2), encoding="utf-8")
    print(f"=== Running Repair Verification for {run_id} ===")
    print(f"1. Verified evidence-backed results for {len(flow_ids)} configured flows.")
    print("2. Saved the Repair source manifest.")

    # Run assemble_repair_assessment.py
    print("3. Assembling Schema v2 assessment and updating repairs array...")
    assemble_script = ROOT / ".codex/skills/repair-source-code/scripts/assemble_repair_assessment.py"
    assemble_cmd = [
        sys.executable, str(assemble_script),
        "--run-json", str(run_path),
        "--assessment-id", assessment_id,
        "--verification-results", str(results_path),
        "--update-repairs"
    ]
    if changed_files:
        assemble_cmd.extend(["--changed-files", *changed_files])
    run_cmd(assemble_cmd)

    # Run score_flow_accuracy.py
    uc_lower = uc_id.lower().replace("-", "")
    final_assessment_path = run_dir / "flow-accuracy" / f"assessment-{uc_lower}-final.json"
    print(f"4. Scoring flow accuracy ({final_assessment_path.name})...")
    scorer_script = ROOT / ".codex/skills/audit-flow-accuracy/scripts/score_flow_accuracy.py"
    score_out = run_cmd([
        sys.executable, str(scorer_script),
        "--run-json", str(run_path),
        "--assessment", str(final_assessment_path)
    ])
    print("   Scorer output:", score_out)

    # Validate repair rounds
    prompt_dir = run_dir / "repairs"
    print("5. Validating the recorded Repair round...")
    val_script = ROOT / ".codex/skills/repair-source-code/scripts/validate_repair_rounds.py"
    with open(run_path, "r", encoding="utf-8") as handle:
        updated_run = json.load(handle)
    validation_cmd = [
        sys.executable, str(val_script),
        "--run-json", str(run_path),
        "--prompt-dir", str(prompt_dir)
    ]
    if updated_run.get("repair_status") in {"completed", "unresolved", "blocked"}:
        validation_cmd.append("--final")
    val_out = run_cmd(validation_cmd)
    print("   Validation result:", val_out)
    print("\n=== REPAIR VERIFICATION ROUND RECORDED ===")


if __name__ == "__main__":
    main()
