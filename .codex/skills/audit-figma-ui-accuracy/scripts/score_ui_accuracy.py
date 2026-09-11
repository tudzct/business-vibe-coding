#!/usr/bin/env python3
"""Validate screenshot-backed judgments, compute the Security UI rubric, persist."""

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "measure-uc-workflow-tokens/scripts"))
from metrics_contract import ROOT, atomic_write, context, digest, epoch, read_json, require, run_lock, writable

WEIGHTS = {"visible_elements": 20, "hierarchy_layout": 25, "spacing_dimensions": 15,
           "typography_colors_assets": 15, "interaction_states": 15, "responsive_behavior": 10}


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def evidence(item):
    require(isinstance(item, dict) and nonempty(item.get("path")), "evidence path required")
    path = writable(ROOT / item["path"])
    require(path.is_file() and digest(path.read_bytes()) == item.get("sha256"),
            f"missing or changed evidence: {item['path']}")
    return path


def checkpoints(rows):
    require(isinstance(rows, list) and rows, "nonempty checkpoint inventory required")
    ids = [r.get("id") for r in rows]
    require(all(nonempty(i) for i in ids) and len(set(ids)) == len(ids), "duplicate/missing checkpoint ID")
    for row in rows:
        require(row.get("status") in ("met", "unmet", "not_evaluable"), "invalid checkpoint status")
        require(nonempty(row.get("rationale")), "checkpoint observation required")
        require(isinstance(row.get("evidence"), list) and row["evidence"], "checkpoint evidence required")
        for ref in row["evidence"]:
            evidence(ref)
    unknown = sum(r["status"] == "not_evaluable" for r in rows)
    return {"total": len(rows), "met": sum(r["status"] == "met" for r in rows),
            "unmet": sum(r["status"] == "unmet" for r in rows), "not_evaluable": unknown}


def uc_key(value):
    return re.sub(r"(?<=-)0+(?=\d)", "", str(value).upper())


def calculate(data):
    for key in ("uc_id", "run_id", "assessment_id", "source_revision", "dataset_id", "dataset_version"):
        require(nonempty(data.get(key)), f"missing {key}")
    require(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", data["assessment_id"]), "unsafe assessment ID")
    require(data.get("stage") in ("initial", "final"), "invalid stage")
    epoch(data.get("captured_at"))
    require(isinstance(data.get("limitations"), list), "limitations list required")
    resolver = read_json(evidence(data["resolver_evidence"]))
    require(uc_key(resolver.get("uc_id")) == uc_key(data["uc_id"]) and
            resolver.get("dataset_id") == data["dataset_id"], "resolver identity mismatch")
    status = data.get("design_status")
    require(status in ("complete", "no-design", "blocked"), "invalid design status")
    if status != "blocked":
        require(resolver.get("status") == status and resolver.get("integrity_ok") is True,
                "complete/no-design requires checksum-valid resolver receipt")
    result = {"assessment_id": data["assessment_id"], "stage": data["stage"],
              "input_sha256": digest(json.dumps(data, sort_keys=True).encode()),
              "weighted_percent": None, "structural_coverage_percent": None, "input": data}
    if status != "complete":
        require(nonempty(data.get("reason")), "unavailable design needs reason")
        result.update(status="not_applicable" if status == "no-design" else "not_evaluable", reason=data["reason"])
        return result
    inventory = read_json(evidence(data["inventory_evidence"]))
    for key in ("reference_screenshots", "runtime_screenshots"):
        require(isinstance(data.get(key), list) and data[key], f"missing {key}")
        for ref in data[key]:
            screenshot = evidence(ref).read_bytes()
            require(screenshot.startswith(b"\x89PNG\r\n\x1a\n") or screenshot.startswith(b"\xff\xd8\xff"),
                    "screenshot evidence must be PNG or JPEG")
            if key == "runtime_screenshots":
                require(ref.get("source_revision") == data["source_revision"], "stale runtime screenshot")
                for field in ("state", "browser", "fonts"):
                    require(nonempty(ref.get(field)), f"screenshot missing {field}")
                require(all(type(ref.get("viewport", {}).get(k)) is int and ref["viewport"][k] > 0
                            for k in ("width", "height")), "invalid screenshot viewport")
                require(type(ref.get("device_scale")) in (int, float) and ref["device_scale"] > 0,
                        "invalid screenshot device scale")
                epoch(ref.get("captured_at"))
    structural = checkpoints(data.get("structure"))
    require([r["id"] for r in data["structure"]] == inventory.get("visible_node_ids"), "structure inventory mismatch")
    categories = data.get("categories", {})
    require(set(categories) == set(WEIGHTS), "all six fixed categories required")
    require(set(inventory.get("category_checkpoint_ids", {})) == set(WEIGHTS), "invalid frozen category inventory")
    counts = {}
    for key in WEIGHTS:
        counts[key] = checkpoints(categories[key])
        require([r["id"] for r in categories[key]] == inventory["category_checkpoint_ids"][key],
                f"checkpoint inventory changed: {key}")
    result["categories"] = counts
    result["structure"] = structural
    if not structural["not_evaluable"]:
        result["structural_coverage_percent"] = round(100 * structural["met"] / structural["total"], 6)
    sim = data.get("perceptual_similarity", {})
    require(type(sim.get("deterministic_environment")) is bool, "similarity environment flag required")
    value = sim.get("value")
    if value is not None:
        require(type(value) in (int, float) and 0 <= value <= 1, "similarity must be 0..1")
        require(all(nonempty(sim.get(k)) for k in ("method", "version")) and isinstance(sim.get("settings"), dict),
                "similarity method/version/settings required")
        receipt = read_json(evidence(sim["evidence"]))
        require(all(receipt.get(k) == sim[k] for k in ("value", "method", "version", "settings")),
                "similarity receipt mismatch")
        for key in ("reference_screenshots", "runtime_screenshots"):
            require(receipt.get(key + "_sha256") == [r["sha256"] for r in data[key]], "similarity screenshot mismatch")
    if value is None or not sim["deterministic_environment"]:
        require(nonempty(sim.get("reason")), "similarity limitation required")
    if structural["not_evaluable"] or any(c["not_evaluable"] for c in counts.values()):
        result.update(status="not_evaluable", reason="Unresolved evidence in structural/category checkpoints")
    else:
        result["weighted_percent"] = round(sum(WEIGHTS[k] * c["met"] / c["total"] for k, c in counts.items()), 6)
        missed = structural["unmet"] or any(c["unmet"] for c in counts.values()) or (value is not None and value < .90)
        result["status"] = "repair_required" if missed else (
            "similarity_pending" if value is None and sim["deterministic_environment"] else "scored")
    return result


def markdown(result):
    value = result["weighted_percent"]
    lines = [f"# UI accuracy: {result['assessment_id']}", "", f"Status: {result['status']}",
             f"Weighted UI accuracy: {str(value) + '%' if value is not None else 'N/A'}",
             f"Structural coverage: {result['structural_coverage_percent']}",
             f"Source revision: {result['input']['source_revision']}", "",
             "Full checkpoint observations, limitations and screenshot hashes are retained in the adjacent JSON.", ""]
    if "categories" in result:
        lines += ["| Category | Weight | Met | Total | Not evaluable |", "|---|---:|---:|---:|---:|"]
        for key, c in result["categories"].items():
            lines.append(f"| {key} | {WEIGHTS[key]} | {c['met']} | {c['total']} | {c['not_evaluable']} |")
    lines += ["", "Perceptual similarity (separate): " + json.dumps(result["input"].get("perceptual_similarity"), ensure_ascii=False),
              "", result.get("reason", ""), *result["input"]["limitations"], ""]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", required=True, type=Path)
    parser.add_argument("--assessment", required=True, type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    path, run, folder = context(args.run_json)
    result = calculate(read_json(args.assessment))
    require(all(run[k] == result["input"][k] for k in ("uc_id", "run_id")), "run identity mismatch")
    if not args.dry_run:
        with run_lock(folder):
            run = read_json(path)
            require(all(run[k] == result["input"][k] for k in ("uc_id", "run_id")), "run identity changed before save")
            if run.get("ui_accuracy") is None:
                run["ui_accuracy"] = {"schema_version": 1, "rubric_id": "security-ui-weighted-v1", "assessments": []}
            block = run["ui_accuracy"]
            require(block.get("schema_version") == 1 and block.get("rubric_id") == "security-ui-weighted-v1", "unknown UI schema")
            history = block["assessments"]
            previous = next((r for r in history if r["assessment_id"] == result["assessment_id"]), None)
            if previous:
                require(previous == result, "assessment ID is immutable")
            else:
                require(result["stage"] != "initial" or not history, "initial assessment must be first and immutable")
                for old in history:
                    for key in ("dataset_id", "dataset_version"):
                        require(old["input"][key] == result["input"][key], "frozen dataset changed")
                    if old["input"].get("design_status") == "complete":
                        require(result["input"].get("design_status") != "no-design", "cannot replace a referenced design with N/A")
                        if result["input"].get("design_status") == "complete":
                            require(old["input"]["inventory_evidence"] == result["input"]["inventory_evidence"], "frozen comparison inventory changed")
                history.append(result)
                block["current_assessment_id"] = result["assessment_id"]
                run["ui_accuracy_percent"] = result["weighted_percent"]
                run["ui_accuracy_status"] = result["status"]
                atomic_write(path, run)
            destination = folder / "ui-accuracy" / result["assessment_id"]
            atomic_write(destination.with_name(destination.name + ".json"), result)
            atomic_write(destination.with_name(destination.name + ".md"), markdown(result), raw=True)
    print(json.dumps({k: v for k, v in result.items() if k != "input"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
