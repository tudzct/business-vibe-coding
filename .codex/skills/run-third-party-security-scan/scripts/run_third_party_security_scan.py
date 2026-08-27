#!/usr/bin/env python3
"""Run independent Semgrep/ZAP evaluation against frozen final source."""

import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from validate_evaluation_policy import validate
from validate_evaluation_input import validate as validate_input


EXCLUDED_PARTS = {"node_modules", "dist", ".env", ".git"}


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


def run(command: list[str], env: dict[str, str], log_path: Path) -> int:
    with log_path.open("a", encoding="utf-8") as log:
        return subprocess.run(command, cwd=env["REPO_ROOT"], env=env, check=False, stdout=log, stderr=subprocess.STDOUT).returncode


def image_id(image: str, env: dict[str, str]) -> Optional[str]:
    result = subprocess.run(["docker", "image", "inspect", "--format", "{{.Id}}", image], cwd=env["REPO_ROOT"], env=env, check=False, capture_output=True, text=True)
    return result.stdout.strip() or None


def env_port(path: Path, name: str, default: int) -> int:
    if not path.is_file():
        return default
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith(f"{name}="):
            value = stripped.split("=", 1)[1].strip()
            try:
                port = int(value)
            except ValueError as exc:
                raise SystemExit(f"scan error: {name} must be a valid port") from exc
            if not 1 <= port <= 65535:
                raise SystemExit(f"scan error: {name} must be a valid port")
            return port
    return default


def wait_for_url(url: str, timeout_seconds: int = 180) -> bool:
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=5) as response:
                if 200 <= response.status < 500:
                    return True
        except (urllib.error.URLError, TimeoutError):
            pass
        time.sleep(2)
    return False


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--evaluation-input", required=True, type=Path, help="approved product-level final-source evaluation input")
    args = parser.parse_args()

    repo = Path(__file__).resolve().parents[4]
    evaluation_input_path = args.evaluation_input.resolve()
    evaluation_input = validate_input(evaluation_input_path)
    policy_path = (repo / evaluation_input["policy"]["path"]).resolve()
    if file_hash(policy_path) != evaluation_input["policy"]["checksum"].lower():
        raise SystemExit("scan error: evaluation input policy checksum does not match")
    policy = validate(policy_path, require_approved=True)
    if policy["policy_id"] != evaluation_input["policy"]["id"]:
        raise SystemExit("scan error: evaluation input policy id does not match")
    output = repo / evaluation_input["output"]["directory"]
    if output.exists() and any(output.iterdir()):
        raise SystemExit(f"scan error: immutable output directory is not empty: {output}")

    version_lock_path = repo / policy["tool_version_lock"]
    if not version_lock_path.is_file() or file_hash(version_lock_path) != policy["tool_version_lock_checksum"].lower():
        raise SystemExit(f"scan error: approved tool-version lock checksum does not match {version_lock_path}")
    version_lock = json.loads(version_lock_path.read_text(encoding="utf-8"))
    for tool in ("semgrep", "zap"):
        rule_policy_path = repo / policy[tool]["policy"]
        if not rule_policy_path.is_file() or file_hash(rule_policy_path) != policy[tool]["policy_checksum"].lower():
            raise SystemExit(f"scan error: approved {tool} policy checksum does not match {rule_policy_path}")
    if policy["zap"].get("strict_rule_execution", False):
        raise SystemExit("scan error: this runner cannot prove strict ZAP rule execution; use a default-off Automation Framework executor or keep strict_execution=false")

    before = tree_hash(repo / "finalsource")
    if before.lower() != evaluation_input["scope"]["frozen_hash"].lower():
        raise SystemExit("scan error: current finalsource hash differs from the approved evaluation input")
    started = datetime.now(timezone.utc).astimezone().isoformat()
    temp_context = tempfile.TemporaryDirectory(prefix="security-scan-")
    temporary_output = Path(temp_context.name)
    execution_log = temporary_output / "execution.log"
    env = os.environ.copy()
    env.update({
        "REPO_ROOT": str(repo),
        "SCAN_OUTPUT_DIR": str(temporary_output),
        "SEMGREP_IMAGE": version_lock["semgrep_image"],
        "ZAP_IMAGE": version_lock["zap_image"],
    })
    context_secret_available = {
        context["id"]: bool(os.environ.get(context.get("auth", {}).get("secret_env", "")))
        for context in policy["coverage"]["contexts"]
        if context.get("auth", {}).get("mode") in {"bearer_env", "cookie_env"}
    }
    app_port = env_port(repo / "finalsource/.env", "APP_PORT", 8080)
    backend_port = env_port(repo / "finalsource/.env", "BACKEND_PORT", 3000)
    urls = {
        "frontend": f"http://localhost:{app_port}",
        "proxied_api_health": f"http://localhost:{app_port}/api/health",
        "backend_api_health": f"http://localhost:{backend_port}/api/health",
        "swagger_ui": f"http://localhost:{backend_port}/docs",
        "openapi_json": f"http://localhost:{backend_port}/docs-json",
    }
    base_compose = ["docker", "compose", "--env-file", "finalsource/.env", "-f", "finalsource/compose.yaml"]
    deployment_exit = run(base_compose + ["up", "--build", "-d", "database", "backend", "frontend"], env, execution_log)
    if deployment_exit != 0:
        raise SystemExit("scan error: docker compose up failed; security tools were not started")
    print("Research environment is starting; the Compose stack will remain running after the scan.", flush=True)
    for label, url in urls.items():
        print(f"{label}: {url}", flush=True)
    frontend_ready = wait_for_url(urls["frontend"])
    backend_ready = wait_for_url(urls["backend_api_health"])
    if not frontend_ready or not backend_ready:
        raise SystemExit("scan error: FE/BE health verification failed; security tools were not started")
    print("FE and BE are reachable. Starting approved Semgrep and ZAP scans.", flush=True)

    scan_compose = ["docker", "compose", "--env-file", "finalsource/.env", "-f", "finalsource/compose.yaml", "-f", "security-tools/compose.security-scan.yaml", "run", "--rm"]
    semgrep_exit = run(scan_compose + ["semgrep"], env, execution_log)
    zap_exit = run(scan_compose + ["zap"], env, execution_log)
    after = tree_hash(repo / "finalsource")
    ended = datetime.now(timezone.utc).astimezone().isoformat()
    manifest = {
        "schema_version": 2,
        "evaluation_id": evaluation_input["evaluation_id"],
        "evaluation_scope": "current_final_source",
        "source_root": evaluation_input["scope"]["source_root"],
        "contributing_uc_range": evaluation_input["scope"]["contributing_uc_range"],
        "tool_contracts": evaluation_input["tools"],
        "evaluation_stage": "independent_final_source",
        "started_at": started,
        "ended_at": ended,
        "source": {"before_hash": before, "after_hash": after, "unchanged": before == after},
        "deployment": {
            "status": "completed",
            "compose_up_exit_code": deployment_exit,
            "frontend_health": "passed" if frontend_ready else "failed",
            "backend_health": "passed" if backend_ready else "failed",
            "urls": urls,
            "stack_left_running": True,
            "down_command": "docker compose --env-file finalsource/.env -f finalsource/compose.yaml down"
        },
        "tools": {
            "sast": {"name": "semgrep", "image": env["SEMGREP_IMAGE"], "image_id": image_id(env["SEMGREP_IMAGE"], env), "exit_code": semgrep_exit, "status": "completed" if semgrep_exit == 0 and (temporary_output / "semgrep.raw.json").exists() else "failed"},
            "dast": {"name": "zap", "image": env["ZAP_IMAGE"], "image_id": image_id(env["ZAP_IMAGE"], env), "exit_code": zap_exit, "status": "completed" if zap_exit in {0, 1, 2} and (temporary_output / "zap.raw.json").exists() else "failed"},
        },
        "policy_ref": {
            "path": policy_path.relative_to(repo).as_posix(),
            "checksum": file_hash(policy_path),
            "id": policy["policy_id"],
        },
        "criteria_catalog_ref": policy["criteria_catalog"],
        "tool_lock_ref": {
            "path": policy["tool_version_lock"],
            "checksum": policy["tool_version_lock_checksum"],
            "id": version_lock.get("lock_id")
        },
        "coverage_execution": {
            "capabilities": ["anonymous_openapi"],
            "context_secret_available": context_secret_available,
        },
    }
    manifest_path = temporary_output / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if before != after:
        raise SystemExit("scan error: source hash changed during third-party tool execution")
    if manifest["tools"]["sast"]["status"] != "completed" or manifest["tools"]["dast"]["status"] != "completed":
        raise SystemExit(f"scan error: tool execution incomplete; inspect {manifest_path}")
    normalizer = Path(__file__).with_name("normalize_scan_results.py")
    temporary_summary = temporary_output / "evaluation-summary.json"
    subprocess.run([sys.executable, str(normalizer), "--policy", str(policy_path), "--manifest", str(manifest_path), "--semgrep", str(temporary_output / "semgrep.raw.json"), "--zap", str(temporary_output / "zap.raw.json"), "--output", str(temporary_summary)], cwd=repo, check=True)
    validator = Path(__file__).with_name("validate_evaluation_summary.py")
    subprocess.run([sys.executable, str(validator), str(temporary_summary)], cwd=repo, check=True, stdout=subprocess.DEVNULL)
    output.mkdir(parents=True, exist_ok=False)
    normalized_path = output / "evaluation-summary.json"
    normalized_path.write_bytes(temporary_summary.read_bytes())
    temp_context.cleanup()
    print(json.dumps({"status": "completed", "research_environment": urls, "stack_left_running": True, "down_command": manifest["deployment"]["down_command"], "evaluation_summary": str(normalized_path)}, indent=2))


if __name__ == "__main__":
    main()
