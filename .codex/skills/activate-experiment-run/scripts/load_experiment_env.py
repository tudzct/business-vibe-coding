#!/usr/bin/env python3
"""Create/read the root experiment .env and validate researcher defaults."""

import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
REQUIRED = (
    "RESEARCHER_ID", "COMPARISON_GROUP_ID", "PROMPT_VARIANT",
    "GENERATION_MODEL_LABEL", "GENERATION_MODEL_ID",
    "GENERATION_REASONING_EFFORT", "GENERATION_REASONING_MODE",
    "AUDIT_PROTOCOL", "AUDITOR_ASSIGNMENT", "REPLICATE_COUNT",
    "EXPERIMENT_UC_ORDER", "FIGMA_DATASET_VERSION",
)


def parse_env(path):
    values = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ensure", action="store_true", help="create .env from .env.example when absent")
    args = parser.parse_args()
    env_path = ROOT / ".env"
    example = ROOT / ".env.example"
    created = False
    if not env_path.exists() and args.ensure:
        if not example.is_file():
            raise SystemExit("experiment env error: missing .env.example")
        shutil.copyfile(example, env_path)
        created = True
    if not env_path.is_file():
        raise SystemExit("experiment env error: missing .env; run with --ensure")
    values = parse_env(env_path)
    missing = [key for key in REQUIRED if not values.get(key)]
    if missing:
        print(json.dumps({"status": "needs-researcher-input", "created": created, "path": ".env", "missing": missing}, indent=2))
        return 3
    if values["PROMPT_VARIANT"] not in {"full", "rq3"}:
        raise SystemExit("experiment env error: PROMPT_VARIANT must be full or rq3")
    if values["GENERATION_REASONING_EFFORT"] not in {"none", "low", "medium", "high", "xhigh", "max"}:
        raise SystemExit("experiment env error: invalid GENERATION_REASONING_EFFORT")
    if values["GENERATION_REASONING_MODE"] not in {"standard", "pro"}:
        raise SystemExit("experiment env error: invalid GENERATION_REASONING_MODE")
    if values["AUDIT_PROTOCOL"] not in {"fixed", "matched", "cross"}:
        raise SystemExit("experiment env error: invalid AUDIT_PROTOCOL")
    try:
        replicate_count = int(values["REPLICATE_COUNT"])
    except ValueError as exc:
        raise SystemExit("experiment env error: REPLICATE_COUNT must be a positive integer") from exc
    if replicate_count < 1:
        raise SystemExit("experiment env error: REPLICATE_COUNT must be a positive integer")
    ucs = [item.strip().upper() for item in values["EXPERIMENT_UC_ORDER"].split(",") if item.strip()]
    if not ucs or len(ucs) != len(set(ucs)) or any(not re.fullmatch(r"UC-\d{2}", item) for item in ucs):
        raise SystemExit("experiment env error: EXPERIMENT_UC_ORDER must contain unique UC-XX values")
    activation_path = ROOT / "resource/figma-design-dataset/active-dataset.json"
    activation = json.loads(activation_path.read_text(encoding="utf-8"))
    if activation.get("status") != "Confirmed" or activation.get("dataset_version") != values["FIGMA_DATASET_VERSION"]:
        raise SystemExit("experiment env error: FIGMA_DATASET_VERSION does not match active-dataset.json")
    manifest = ROOT / activation["manifest_path"]
    actual_hash = "sha256:" + hashlib.sha256(manifest.read_bytes()).hexdigest()
    if activation.get("manifest_sha256") != actual_hash:
        raise SystemExit("experiment env error: active Figma manifest checksum mismatch")
    print(json.dumps({"status": "ready-for-configuration-gate", "created": created,
                      "researcher_id": values["RESEARCHER_ID"],
                      "comparison_group_id": values["COMPARISON_GROUP_ID"],
                      "prompt_variant": values["PROMPT_VARIANT"],
                      "generation_model": {"label": values["GENERATION_MODEL_LABEL"],
                                           "model_id": values["GENERATION_MODEL_ID"],
                                           "reasoning_effort": values["GENERATION_REASONING_EFFORT"],
                                           "reasoning_mode": values["GENERATION_REASONING_MODE"]},
                      "audit_protocol": values["AUDIT_PROTOCOL"],
                      "auditor_assignment": values["AUDITOR_ASSIGNMENT"],
                      "replicate_count": replicate_count, "uc_order": ucs,
                      "figma_dataset": {"dataset_version": activation["dataset_version"],
                                        "manifest_path": activation["manifest_path"],
                                        "manifest_sha256": actual_hash}}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
