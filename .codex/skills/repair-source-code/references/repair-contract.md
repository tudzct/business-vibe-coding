# Repair contract

One Repair invocation consumes the complete immutable prompt set generated from the initial canonical defect inventory. Canonical defect categories are exactly `technical`, `business_rule` and `flow`. `blocks_execution` is a Boolean priority flag, never a category. Prompt files, initial defects and initial BR/Flow evidence remain immutable throughout Repair.

The `repairs` array records rounds, not prompt count and not newly discovered defects. It contains at most ten entries with consecutive `round_index` values beginning at 1. Each round records a unique `repair_id`, prompt directory, source revisions before/after, unioned affected BR/Flow IDs, changed files, evidence before/after, effective model, outcome (`in_progress`, `resolved`, `unresolved` or `blocked`) and `defect_attempts`. Round 1 contains every initial defect exactly once; each later round contains exactly the defects reported unresolved by the preceding round. A defect attempt retains its original defect ID, fingerprint and prompt path and records only the round result (`resolved` or `unresolved`) plus evidence. An indirectly corrected defect is `resolved`; its initial record and prompt are not removed. The subordinate verifier uses the current round's unresolved attempts as final-stage defect coverage and never appends a new canonical defect.

Repairs require closed source telemetry, persisted first-pass BR/Flow/defect assessment, a complete validated prompt set and explicit researcher authorization after source measurement. Record live timestamp segment IDs and exact turn IDs. The internal telemetry engine finalizes per-turn/per-phase tokens after gate confirmation. The whole Repair work turn is indivisible; do not invent a token split by prompt, defect or round. Never append current-turn token estimates as final values.

Repair uses two phase-level execution segments and no defect/round timing identity: one segment covers complete sub-prompt generation and one segment covers the complete source-correction invocation, including every round, integrated BR/Flow/runtime verification and final evidence/hash/status persistence. Open the correction segment immediately before the first source mutation and close it once before the invocation returns, waits for the researcher or resolves an external blocker. Never open per-round or overlapping Audit timers, split tokens by prompt/defect/round or double-count an interval. Canonical round records remain functional evidence only. Persist raw identity/ISO/epoch endpoints and segment references. The reported Repair total combines both whole turns and both execution segments. Captures use `generation_execution_with_repair_audit_v2`.

Canonical summary fields are `repair_round_limit: 10`, `repair_rounds_completed`, `repair_status` (`not_started`, `in_progress`, `completed`, `unresolved` or `blocked`) and `repair_prompt_directory`. `all_sub_prompt_count` equals the immutable initial defect count, never the number of rounds. Successful completion requires every fixed defect resolved, every BR `met`, every Flow `correct`, Flow Accuracy `100%`, and no technical/execution blocker. Round-10 exhaustion is `repair_status: unresolved` with terminal `run_status: stopped`; an authority/input/schema blocker is `repair_status: blocked` with terminal `run_status: blocked`.

Each canonical round uses this shape; arrays retain canonical defect order:

```json
{
  "repair_id": "repair-round-001",
  "round_index": 1,
  "prompt_directory": "docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs",
  "source_revision_before": "sha256:<64-hex>",
  "source_revision_after": "sha256:<64-hex>",
  "affected_br_ids": ["<BR-ID>"],
  "affected_flow_ids": ["<FLOW-ID>"],
  "evidence_before": [{"path": "<repository-relative-path>", "sha256": "sha256:<64-hex>"}],
  "changed_files": ["finalsource/<path>"],
  "evidence_after": [{"path": "<repository-relative-path>", "sha256": "sha256:<64-hex>"}],
  "defect_attempts": [{
    "defect_id": "<initial-defect-id>",
    "defect_fingerprint": "sha256:<initial-fingerprint>",
    "prompt_path": "<repository-relative-prompt-path>",
    "prompt_sha256": "sha256:<prompt-checksum>",
    "status": "resolved",
    "evidence": [{"path": "<repository-relative-path>", "sha256": "sha256:<64-hex>"}]
  }],
  "outcome": "resolved",
  "model": {"effective_model_id": "<exact-id>"}
}
```

Create the record as `outcome: in_progress` and set `repair_status: in_progress` before its START capture. Atomically complete the evidence, source revision and outcome before END, and increment `repair_rounds_completed` only for a completed round. Validate the full set with `scripts/validate_repair_rounds.py`; never infer a missing record after the turn.

## Verification results handoff

Each subordinate verification writes one `verification-results.json` under the round's evidence directory. It records observed results; it is not a substitute for runtime evidence. Flow, BR and defect arrays preserve their frozen canonical order. Every evidence entry uses a repository-relative path to an existing sanitized file.

```json
{
  "uc_id": "<UC-ID>",
  "run_id": "<RUN-ID>",
  "assessment_id": "<ASSESSMENT-ID>",
  "captured_at": "<ISO-8601>",
  "limitations": [],
  "execution_blocker_defect_ids": [],
  "flows": [{
    "flow_id": "<FLOW-ID>",
    "observation_id": "<UNIQUE-OBSERVATION-ID>",
    "entry_point": "<OBSERVED-ENTRY-POINT>",
    "entry_kind": "ui",
    "actual_preconditions": "<OBSERVED-PRECONDITIONS>",
    "end_state": "<OBSERVED-END-STATE>",
    "state": "completed",
    "actions": [{
      "sequence": 1,
      "action": "<ACTION-PERFORMED>",
      "actual_result": "<OBSERVED-RESULT>",
      "target_ids": ["<STEP-ID>"],
      "evidence": [{"path": "<PATH>", "kind": "runtime_trace", "target_ids": ["<STEP-ID>"]}]
    }],
    "steps": [{
      "step_id": "<STEP-ID>",
      "status": "met",
      "rationale": "<EVIDENCE-BASED-RATIONALE>",
      "evidence": [{"path": "<PATH>", "kind": "runtime_trace", "target_ids": ["<STEP-ID>"]}]
    }],
    "terminal_outcome": {
      "status": "met",
      "rationale": "<EVIDENCE-BASED-RATIONALE>",
      "evidence": [{"path": "<PATH>", "kind": "runtime_trace", "target_ids": ["terminal_outcome"]}]
    }
  }],
  "business_rules": [{
    "br_id": "<BR-ID>",
    "status": "met",
    "rationale": "<EVIDENCE-BASED-RATIONALE>",
    "evidence": ["<PATH>"],
    "runtime_observation_ids": ["<OBSERVATION-ID>"]
  }],
  "defects": [{
    "defect_id": "<IMMUTABLE-DEFECT-ID>",
    "status": "resolved",
    "evidence": ["<PATH>"]
  }]
}
```

Allowed BR/step/terminal statuses are `met`, `unmet` and `not_evaluable`. Allowed defect statuses are `resolved` and `unresolved`. The assembler validates identities, frozen inventories, evidence existence and hashes; it never supplies a successful default.

For a ready runtime, each observation's evidence files stay under `<assessment-id>/<observation-id>/`; its first action covers `entry`, its last action covers `terminal_outcome`, and every recorded step target is linked to an actual action. The `_runtime/deployment.json` record contains the observed Compose major version, project and service identities.

If execution remains blocked, `_runtime/deployment.json` records `status: "BLOCKED"`, `verified: false`, the Compose major version, an empty service list when nothing started, and the actual blocker reason. `execution_blocker_defect_ids` lists the unresolved blocking defects, `flows` preserves the frozen flow-ID order without invented observations, every BR is recorded `unmet`, and the blocking defect remains `unresolved`. The scorer then records every Flow as incorrect without manufacturing runtime evidence.
