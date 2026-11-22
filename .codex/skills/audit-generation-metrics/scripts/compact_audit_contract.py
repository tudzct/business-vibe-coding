"""Structural checks for the compact, accepted Audit result format."""

import json
import re

from metrics_contract import ROOT, digest, epoch, read_json, require, writable

STATUSES = {"correct", "incorrect", "not_evaluable"}
SHA = re.compile(r"sha256:[0-9a-f]{64}\Z")


def hash_value(value):
    return digest(json.dumps(value, ensure_ascii=False, sort_keys=True,
                             separators=(",", ":")).encode("utf-8"))


def artifact_hash(value):
    return digest((json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))


def validate_rows(rows, identities, key, defects):
    require(isinstance(rows, list) and all(isinstance(row, dict) for row in rows),
            f"{key} results must be objects")
    require([row.get(key) for row in rows] == identities,
            f"{key} inventory/order differs from its frozen baseline")
    require(all(row.get("status") in STATUSES for row in rows),
            f"invalid {key} result")
    for row in rows:
        causes = row.get("caused_by_defect_ids", [])
        reason = row.get("unavailable_reason")
        if row["status"] == "incorrect":
            require(isinstance(causes, list) and causes and len(causes) == len(set(causes))
                    and all(identity in defects and row[key] in defects[identity][
                        "affected_br_ids" if key == "br_id" else "affected_flow_ids"]
                        for identity in causes), f"incorrect {key} has invalid defect links")
            require(reason in (None, ""), f"incorrect {key} cannot be unavailable")
        elif row["status"] == "not_evaluable":
            require(not causes and isinstance(reason, str) and reason.strip(),
                    f"not_evaluable {key} needs its unavailable reason")
        else:
            require(not causes and reason in (None, ""), f"correct {key} has cause metadata")
    return {status: sum(row["status"] == status for row in rows) for status in STATUSES}


def validate(run, folder):
    require(run.get("audit_result_format") == "compact-v1", "unknown compact Audit format")
    business = run.get("business_rules") or {}
    flow = run.get("flow_accuracy") or {}
    br_ids = business.get("ordered_br_ids")
    require(isinstance(br_ids, list) and br_ids and len(br_ids) == len(set(br_ids)),
            "ordered BR baseline IDs required")
    br_baseline = read_json(writable(ROOT / business["baseline"]))
    require(br_baseline.get("ordered_br_ids") == br_ids and br_baseline.get("uc_id") == run["uc_id"],
            "BR baseline identity/inventory changed")
    br_source = writable(ROOT / br_baseline["business_rule_path"])
    require(br_source.is_file() and digest(br_source.read_bytes()) == br_baseline.get("business_rule_sha256"),
            "frozen BR specification checksum changed")
    flow_baseline = read_json(writable(ROOT / "docs/02-construction/implementation" /
                                       run["uc_id"] / "flow-baseline.json"))
    flow_ids = flow_baseline.get("ordered_flow_ids")
    require(isinstance(flow_ids, list) and flow_ids, "frozen Flow inventory required")
    uc_source = writable(ROOT / flow_baseline["use_case_path"])
    require(uc_source.is_file() and digest(uc_source.read_bytes()) == flow_baseline.get("use_case_sha256"),
            "frozen UC checksum changed")
    configuration = run.get("experiment_configuration") or {}
    config_path = writable(ROOT / configuration["artifact"])
    require(config_path.is_file() and digest(config_path.read_bytes()) == configuration.get("checksum"),
            "pinned configuration checksum changed")
    defects = run.get("defects")
    require(isinstance(defects, list), "canonical defect links required")
    by_defect = {row.get("defect_id"): row for row in defects if isinstance(row, dict)}
    require(len(by_defect) == len(defects), "duplicate or invalid defect ID")
    for defect in defects:
        require(defect.get("category") in {"business_rule", "flow", "technical", "ui"}
                and defect.get("status") in {"open", "resolved"}
                and type(defect.get("blocks_execution")) is bool
                and SHA.fullmatch(str(defect.get("fingerprint")))
                and SHA.fullmatch(str(defect.get("source_revision")))
                and isinstance(defect.get("affected_br_ids"), list)
                and isinstance(defect.get("affected_flow_ids"), list)
                and set(defect["affected_br_ids"]) <= set(br_ids)
                and set(defect["affected_flow_ids"]) <= set(flow_ids),
                "invalid compact defect link")
    for stage in ("initial", "final"):
        snapshot = business.get(stage)
        require(isinstance(snapshot, dict), f"business_rules.{stage} missing")
        counts = validate_rows(snapshot.get("requirements"), br_ids, "br_id", by_defect)
        require(snapshot.get("total") == len(br_ids)
                and all(snapshot.get(key) == value for key, value in counts.items()),
                f"business_rules.{stage} counts mismatch")
    assessments = flow.get("assessments")
    require(isinstance(assessments, list) and assessments
            and assessments[0].get("stage") == "initial", "compact initial Flow assessment missing")
    first = assessments[0]
    first_counts = validate_rows(first.get("flows"), flow_ids, "flow_id", by_defect)
    require(all(first["counts"].get(key) == value for key, value in first_counts.items())
            and first["counts"].get("total") == len(flow_ids), "initial Flow counts mismatch")
    require(SHA.fullmatch(str(first.get("source_revision")))
            and first.get("flow_accuracy_percent") ==
            (None if first_counts["not_evaluable"] else
             round(100 * first_counts["correct"] / len(flow_ids), 6)),
            "initial Flow source/accuracy mismatch")
    epoch(first.get("captured_at"))
    observation_ids = first.get("observation_ids")
    require(isinstance(observation_ids, list) and len(observation_ids) == len(set(observation_ids)),
            "initial Flow observation IDs are invalid")
    blueprint = flow.get("repair_blueprint") or {}
    require([row.get("flow_id") for row in blueprint.get("flows", [])] == flow_ids,
            "Repair Flow blueprint differs from frozen inventory")
    require(blueprint.get("schema_version") == flow.get("schema_version")
            and blueprint.get("rubric_id") == flow.get("rubric_id")
            and flow.get("selection_policy") == "accepted-audit-results-v1",
            "compact Flow rubric/selection policy mismatch")
    summary = flow.get("current_summary") or {}
    current_counts = validate_rows(summary.get("flows"), flow_ids, "flow_id", by_defect)
    require(summary.get("counts", {}).get("total") == len(flow_ids)
            and all(summary["counts"].get(key) == value for key, value in current_counts.items()),
            "accepted Flow counts mismatch")
    unknown = current_counts["not_evaluable"]
    require(summary.get("flow_accuracy_percent") ==
            (None if unknown else round(100 * current_counts["correct"] / len(flow_ids), 6))
            and summary.get("flow_error_percent") ==
            (None if unknown else round(100 * current_counts["incorrect"] / len(flow_ids), 6)),
            "accepted Flow percentages mismatch")
    require(run.get("flow_accuracy_percent") == summary.get("flow_accuracy_percent")
            and run.get("flow_error_percent") == summary.get("flow_error_percent")
            and run.get("flow_accuracy_status") == summary.get("status"),
            "canonical Flow percentages mismatch")
    current = next((row for row in assessments
                    if row.get("assessment_id") == flow.get("current_assessment_id")), None)
    require(current is not None, "current Flow assessment missing")
    current_source = current.get("source_revision") or current.get("input", {}).get("source_revision")
    if current.get("stage") == "final":
        require(current_source == business.get("source_revision"),
                "final BR/Flow source revision mismatch")
    if run.get("repairs"):
        require(current.get("stage") == "final", "repaired source requires final Flow assessment")
    if run.get("run_status") == "complete" and current.get("stage") != "final":
        require(run.get("repair_skip_reason"), "unchanged completion needs no-repair decision")
    handoff_path = writable(folder / "defects-handoff.json")
    require(handoff_path.is_file(), "Audit handoff missing")
    # Import lazily because the Handoff builder also imports the metrics helpers.
    from build_defects_handoff import validate_handoff
    handoff = validate_handoff(read_json(handoff_path), run["uc_id"], run["run_id"])
    require(run.get("audit_handoff_sha256") == artifact_hash(handoff), "Audit handoff changed")
    accepted = run.get("audit_accepted_results") or {}
    require(accepted.get("business_rules") and accepted.get("flows")
            and [row.get("br_id") for row in accepted["business_rules"]] == br_ids
            and [row.get("flow_id") for row in accepted["flows"]] == flow_ids
            and all(row.get("status") in STATUSES for row in
                    accepted["business_rules"] + accepted["flows"])
            and handoff["accepted_results_sha256"] == hash_value(accepted),
            "accepted Audit score snapshot changed")
    initial_defects = [row for row in defects if row.get("stage") == "initial"]
    require(handoff["canonical_defects_sha256"] == hash_value(initial_defects),
            "handoff defect links changed")
    handoff_by_id = {row["defect_id"]: row for row in handoff["defects"]}
    selected_ids = run.get("audit_handoff_defect_ids")
    require(isinstance(selected_ids, list)
            and selected_ids == [row["defect_id"] for row in handoff["defects"]]
            and set(selected_ids) <= {row["defect_id"] for row in initial_defects
                                      if row["status"] == "open"},
            "handoff does not cover the selected Audit defect inventory")
    for defect in initial_defects:
        if defect["defect_id"] not in set(selected_ids):
            continue
        item = handoff_by_id[defect["defect_id"]]
        require(item["fingerprint"] == defect["fingerprint"]
                and item["category"] == defect["category"]
                and set(item["scope"]["affected_br_ids"]) <= set(defect["affected_br_ids"])
                and set(item["scope"]["affected_flow_ids"]) <= set(defect["affected_flow_ids"]),
                "handoff scope differs from canonical defect links")
    incorrect_br_ids = {row["br_id"] for row in accepted["business_rules"]
                        if row["status"] == "incorrect"}
    incorrect_flow_ids = {row["flow_id"] for row in accepted["flows"]
                          if row["status"] == "incorrect"}
    covered_br_ids = {identity for item in handoff["defects"]
                      for identity in item["scope"]["affected_br_ids"]}
    covered_flow_ids = {identity for item in handoff["defects"]
                        for identity in item["scope"]["affected_flow_ids"]}
    require(incorrect_br_ids <= covered_br_ids and incorrect_flow_ids <= covered_flow_ids
            and covered_br_ids <= incorrect_br_ids and covered_flow_ids <= incorrect_flow_ids,
            "handoff affected targets differ from accepted incorrect scores")
    blockers = [row for row in initial_defects if row["status"] == "open"
                and row["blocks_execution"]]
    if accepted["execution_blocked"]:
        require(blockers and incorrect_br_ids == set(br_ids)
                and incorrect_flow_ids == set(flow_ids)
                and {identity for row in blockers for identity in row["affected_br_ids"]} == set(br_ids)
                and {identity for row in blockers for identity in row["affected_flow_ids"]} == set(flow_ids),
                "system blocker must mark the complete frozen BR/Flow inventory incorrect")
    else:
        require(not blockers, "open system blocker needs execution_blocked result")
    require(handoff["source_revision"] == first.get("source_revision")
            and SHA.fullmatch(str(business.get("source_revision"))),
            "Audit source revision mismatch")
    return summary
