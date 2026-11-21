# Repair contract

One Repair invocation consumes the complete immutable prompt set recorded for the run. The completed prompt set and the current application source under `finalsource/` are the only implementation-input sources. Configuration, Canonical Run, baseline and assessment artifacts are control-plane state handled by execute-only helpers; they do not authorize the AI to open those files or derive additional correction requirements from them. Canonical defect categories are exactly `technical`, `business_rule`, `flow` and `ui`. `blocks_execution` is a Boolean priority flag, never a category. Prompt files, fixed defects and initial BR/Flow evidence remain immutable throughout Repair.

Before each attempt, `scripts/run_repair_cycle.py --prepare` reads sealed control-plane state internally and writes two bounded current-attempt verification artifacts: `verification-plan.json` and a full `verification-results.json` skeleton. They expose the exact ordered Flow/BR inventories and verification structure needed for this attempt, but no prior verdicts, prior runtime evidence or additional implementation requirements. The Repair agent may use them only for current-attempt verification; this does not authorize direct access to Configuration, Canonical Run, BR baseline or Flow baseline.

The `repairs` array records chronological per-defect attempts, not prompt count and not newly discovered defects. It contains at most `repair_round_limit` entries for each fixed defect, so its total upper bound is the prompt count multiplied by ten. Every record has a consecutive global `round_index`, while its single `defect_attempts` member has an `attempt_index` beginning at 1 for that defect. At the start of every attempt, reopen and read the current defect's immutable completed sub-prompt in full to clearly re-establish the defect, its required correction and its permitted scope before making further source changes. Apply it to the accumulated current source; do not reset the complete source or mechanically repeat the previous implementation. Process the fixed prompt order sequentially: the next record targets the same defect after an unresolved attempt below ten, or the next defect only after the current defect is resolved or reaches its tenth unresolved attempt. Never batch defects in one record, revisit a resolved defect or append an eleventh attempt. An indirectly corrected later defect is verified and recorded resolved when its turn arrives; its initial record and prompt are not removed. The subordinate verifier checks the current fixed defect and never appends a new canonical defect.

Repairs require closed source telemetry, persisted first-pass BR/Flow/defect assessment, a complete validated prompt set and explicit researcher authorization after source measurement. Record live timestamp segment IDs and exact turn IDs. The internal telemetry engine finalizes per-turn/per-phase tokens after gate confirmation. The whole Repair work turn is indivisible; do not invent a token split by prompt, defect or attempt. Never append current-turn token estimates as final values.

Sub-prompt Generation and Repair are separate core telemetry phases. The measured and closed `sub_prompt_generation` phase covers the complete immutable prompt set and is never included in Repair totals. Repair has one phase-level execution segment covering the complete source-correction invocation, including every defect attempt, integrated BR/Flow/runtime verification and final evidence/hash/status persistence. Prepare the first attempt, open the Repair segment immediately before its first source mutation, and keep it open across all retries and later attempts. A recoverable verifier/package error never closes this segment. Close it once only after terminal `repair_status` is persisted as `completed`, `unresolved` or genuinely `blocked`. Never open per-attempt or overlapping Audit timers, split tokens by prompt/defect/attempt or double-count an interval. Canonical attempt records remain functional evidence only. Persist raw identity/ISO/epoch endpoints and segment references. Captures use `generation_execution_with_separate_sub_prompt_and_repair_v3`.

Canonical summary fields are `repair_round_limit: 10`, `repair_rounds_completed`, `repair_status` (`not_started`, `in_progress`, `completed`, `unresolved` or `blocked`) and `repair_prompt_directory`. `repair_round_limit` is the per-defect attempt limit; `repair_rounds_completed` is the total number of completed per-defect attempts. `all_sub_prompt_count` equals the fixed defect count, never the attempt count. Successful completion requires every fixed defect resolved, every BR `correct`, every Flow `correct`, Flow Accuracy `100%`, and no technical/execution blocker. After all prompts have been processed, any defect that exhausted ten attempts remains unresolved and produces `repair_status: unresolved` with terminal `run_status: stopped`; one exhausted defect never prevents later defects from being processed. An authority/input/schema blocker is `repair_status: blocked` with terminal `run_status: blocked`.

Each canonical record uses this shape; records retain prompt order and attempts for one defect remain consecutive:

```json
{
  "repair_id": "repair-attempt-001",
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
    "attempt_index": 1,
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

Each record contains exactly one `defect_attempts` member. Set `repair_status: in_progress` before correction. After runtime evidence is captured, `run_repair_cycle.py` builds the completed Repair/BR candidate and final Flow assessment in memory, validates both together, and commits them only after every validator passes. A failed candidate consumes no attempt, changes no canonical Repair/BR/Flow result and remains recoverable within the open Repair interval. Increment `repair_rounds_completed` only for a committed completed attempt. The single phase-level Repair timer remains open across all records. Validate the full sequence with `scripts/validate_repair_rounds.py`; never infer a missing record after the turn.

## Verification results handoff

Each subordinate verification completes the helper-prepared `verification-results.json` under the current attempt's evidence directory. It records observed results; it is not a substitute for runtime evidence. Flow and BR arrays must retain every prepared entry in exact order even for a BR-only or single-Flow defect; the defects array contains exactly the current fixed defect. Every evidence entry uses a repository-relative path to an existing sanitized file. Inventory, identity, structure and evidence-package validation errors are recoverable: correct the package against `verification-plan.json` and retry within the still-open Repair interval, up to the skill's retry limit. They are not external blockers.

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
      "target_ids": ["entry"],
      "evidence": [{"path": "<UI-EVIDENCE-PATH>", "kind": "ui", "target_ids": ["entry"]}]
    }],
    "steps": [{
      "step_id": "<STEP-ID>",
      "status": "correct",
      "rationale": "<EVIDENCE-BASED-RATIONALE>",
      "evidence": [{"path": "<PATH>", "kind": "runtime_trace", "target_ids": ["<STEP-ID>"]}]
    }],
    "terminal_outcome": {
      "status": "correct",
      "rationale": "<EVIDENCE-BASED-RATIONALE>",
      "evidence": [{"path": "<PATH>", "kind": "runtime_trace", "target_ids": ["terminal_outcome"]}]
    }
  }],
  "business_rules": [{
    "br_id": "<BR-ID>",
    "status": "correct",
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

Allowed BR/step/terminal statuses are `correct`, `incorrect` and `not_evaluable`. Allowed defect statuses are `resolved` and `unresolved`. The assembler validates identities, frozen inventories, evidence existence and hashes; it never supplies a successful default.

For a ready runtime, every Flow uses a unique observation ID and its evidence files stay under `<assessment-id>/<observation-id>/`. The first action covers `entry`; when `entry_kind` is `ui`, that action includes evidence with `kind: ui`. The last action covers `terminal_outcome`, every recorded step target is linked to an actual action, and every Alternative or Exception Flow includes an observed `branch` target in its action sequence. The `_runtime/deployment.json` record contains the observed Compose major version, project and service identities.

If execution remains blocked, `_runtime/deployment.json` records `status: "BLOCKED"`, `verified: false`, the Compose major version, an empty service list when nothing started, and the actual blocker reason. `execution_blocker_defect_ids` lists the unresolved blocking defects, `flows` preserves the frozen flow-ID order without invented observations, every BR is recorded `incorrect`, and the blocking defect remains `unresolved`. The scorer then records every Flow as incorrect without manufacturing runtime evidence.
