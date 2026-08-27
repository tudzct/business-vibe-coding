# Repair artifact and metric contract

## Required repair record

```json
{
  "repair_id": "repair-001",
  "sub_prompt_path": "docs/02-construction/implementation/UC-001/sub-prompts/repair-001.md",
  "category": "technical",
  "trigger": "compile",
  "error_fingerprint": "stable normalized error identifier",
  "requirement_ids": [],
  "source_revision_before": "revision or hash",
  "source_revision_after": "revision or hash",
  "timing_method": "system_timestamp_delta",
  "timing_wall_clock": {
    "started_at": "2026-08-14T10:48:11.102+07:00",
    "started_epoch_ms": 1786679291102,
    "ended_at": "2026-08-14T10:48:32.687+07:00",
    "ended_epoch_ms": 1786679312687
  },
  "duration_seconds": 21.585,
  "total_tokens": null,
  "model": {
    "requested_model_id": "exact model ID",
    "requested_reasoning_effort": "low",
    "requested_reasoning_mode": "standard",
    "effective_model_id": null,
    "effective_snapshot": null
  },
  "files_changed": [],
  "evidence_before": "exact observation or artifact path",
  "evidence_after": "exact observation or artifact path",
  "status": "resolved"
}
```

Measure every sub-prompt with a separate automatic system timestamp pair. Capture timezone-qualified ISO-8601 plus Unix epoch milliseconds immediately before executing the repair and again after correction plus permitted evidence collection, before appending the audit. Derive `duration_seconds = (ended_epoch_ms - started_epoch_ms) / 1000`. Reject missing endpoints, negative duration or an ISO/epoch mismatch over one second. `status` is `resolved`, `unresolved` or `blocked`.

## Categories and triggers

- `technical`: syntax, type-check, compile, lint, startup, dependency/build integration or other execution-enabling defect.
- `security`: directly repairs frozen SR acceptance criteria; `requirement_ids` must contain at least one `SR-` ID.
- `ui`: inspected design/accessibility mismatch without a direct SR repair objective.
- `flow`: approved functional-flow mismatch without a direct SR repair objective.

Allowed triggers are `syntax`, `compile`, `lint`, `runtime`, `sca`, `security_review`, `ui_review` and `flow_review`.

If one defect spans categories, select the category of the stated repair objective and list all affected IDs. Do not duplicate one invocation as multiple repair entries.

## Audit invariants

- Persist first-pass audit before `repair-001`.
- The generation run ends only after repair evidence is reflected in the affected source-based SR assessments and the final source hash is frozen.
- Append current status and evidence; never rescore history.
- Count every repair entry in total sub-prompts, time and tokens.
- Preserve each repair's own raw endpoint pairs and duration; aggregate durations are derived and never replace per-repair values.
- Count only category `security` in the security-repair subset.
