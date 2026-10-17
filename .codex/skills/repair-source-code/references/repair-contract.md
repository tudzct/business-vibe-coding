# Repair contract

One Repair invocation consumes the complete immutable prompt set generated from the initial canonical defect inventory. Canonical defect categories are exactly `technical`, `business_rule` and `flow`. `blocks_execution` is a Boolean priority flag, never a category. Prompt files, initial defects and initial BR/Flow evidence remain immutable throughout Repair.

The `repairs` array records rounds, not prompt count and not newly discovered defects. It contains at most ten entries with consecutive `round_index` values beginning at 1. Each round records a unique `repair_id`, prompt directory, source revisions before/after, unioned affected BR/Flow IDs, changed files, evidence before/after, effective model, outcome (`in_progress`, `resolved`, `unresolved` or `blocked`) and `defect_attempts`. Round 1 contains every initial defect exactly once; each later round contains exactly the defects reported unresolved by the preceding round. A defect attempt retains its original defect ID, fingerprint and prompt path and records only the round result (`resolved` or `unresolved`) plus evidence. An indirectly corrected defect is `resolved`; its initial record and prompt are not removed. The subordinate verifier uses the current round's unresolved attempts as final-stage defect coverage and never appends a new canonical defect.

Repairs require closed source telemetry, persisted first-pass BR/Flow/defect assessment, a complete validated prompt set and explicit researcher authorization after source measurement. Record live timestamp segment IDs and exact turn IDs. The internal telemetry engine finalizes per-turn/per-phase tokens after gate confirmation. The whole Repair work turn is indivisible; do not invent a token split by prompt, defect or round. Never append current-turn token estimates as final values.

Sub-prompt generation is a phase-level Repair execution segment and has no defect/round repair ID. Each correction round requires its own live START/END pair with `--repair-id` matching that round's canonical record. START immediately before the first source mutation in the round; END after correction, integrated BR/Flow/runtime verification and final evidence/hash/status persistence. Keep the subordinate audit within the interval and token label; never open overlapping Audit timers or double-count it. End before a blocker resolution, researcher wait or response. Persist raw identity/ISO/epoch endpoints and segment references. `metrics.repair_timing` may retain round-level timing internally, while the reported Repair total includes sub-prompt generation and every round without publishing a separate sub-prompt metric. Captures use `generation_execution_with_repair_audit_v2`.

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
