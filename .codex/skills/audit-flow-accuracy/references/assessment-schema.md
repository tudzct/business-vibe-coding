# Flow baseline and assessment schema

## Frozen baseline

`docs/02-construction/implementation/<UC-ID>/flow-baseline.json` contains:

```json
{
  "schema_version": 1,
  "artifact_type": "flow-baseline",
  "status": "Frozen",
  "uc_id": "<UC-ID>",
  "use_case_path": "docs/01-inception/use-cases/<uc-file>.md",
  "use_case_sha256": "sha256:<64-hex>",
  "ordered_flow_ids": ["<FLOW-ID>"],
  "frozen_at": "<ISO-8601>"
}
```

The ordered IDs are the complete audit inventory and denominator. `BF-n`, `AF-n` and `EF-n` identify Basic/Main, Alternative and Exception Flows in source order. Explicit nested variants may use `<UC-VARIANT-ID>/BF-1`; referenced “identical” flows are not copied. The checksum-pinned frozen UC supplies each listed flow's requirements.

## Assessment input

Configuration requires `flow_audit_rubric: completion-critical-flow-runtime-v2`. Assessment input requires integer `schema_version: 2` and the same `rubric_id`, nonempty `uc_id`, `run_id`, path-safe `assessment_id`, `stage: initial|final`, `source_revision` (full SHA-256), timezone-qualified `captured_at`, baseline `{path, sha256}`, `limitations`, `runtime`, `observations` and `flows`. Flow IDs match the baseline's exact ordered inventory. Each flow includes `flow_id`, a nonempty frozen-UC `source_anchor`, UC-derived `steps`, `terminal_outcome` and `completion_observation_id`. Each step includes `step_id`, source-grounded `text`, Boolean `completion_critical`, nonempty `criticality_reason` and its observation decision. `terminal_outcome` includes source-grounded `text` and its observation decision. All target and aggregate result values are `correct`, `incorrect` or `not_evaluable`. The flow baseline uses schema 1.

`execution_blocker_defect_ids` is normally an empty array. It may be nonempty only when `runtime.status` is `BLOCKED` and every ID resolves to an open canonical defect for the same source/stage with `blocks_execution: true`. In that case the scorer keeps the complete frozen inventory, marks every Flow `incorrect`, sets exact accuracy to `0%`, exact error to `100%`, and retains the IDs as an execution-blocked note. Environment/researcher setup failures and ambiguous causes do not populate this field.

All paths are repository-relative. A baseline reference uses `{path, sha256}`. All other runtime evidence must live under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/flow-accuracy/evidence/<assessment-id>/`. The source revision is the stage's preserved full source SHA-256, not a Git branch name. Compare it against Source Gate/final source evidence before assessing. The deployment record must substantiate its association with running containers, including mounted source.

### Runtime object

`runtime` is required even when no flow can run:

| Field | Contract |
|---|---|
| `status` | `ready`, `BLOCKED`, or `unverified`. Only `ready` with verified deployment supports normal conclusive runtime verdicts. |
| `compose_version` | Integer 2 or 5, recording the installed Compose CLI major. Both are accepted as v2-compatible; no native host fallback. |
| `reason` | Nonempty observed readiness/blocker explanation. |
| `compose_project` | Nonempty project name for ready runtime; null allowed otherwise. |
| `services` | For ready runtime, nonempty array of `{name, container_id, image_id, state}` with observed values. Include relevant FE/BE/MySQL services. Empty allowed when blocked. |
| `deployment` | `{source_revision, verified, evidence}`. `verified` is Boolean. Evidence is nonempty and assessment-scoped (`observation_id: null`), kind `deployment` or `limitation`. Ready requires actual deployment evidence. |

`limitations` is an array of `{category, affected_targets, reason, impact}`; all values are nonempty strings. Category is `application`, `environment`, `missing_evidence`, or `ambiguous_cause`. Empty is valid only when no limitations exist. Explain unavailable observations and their scoring impact here and in target rationales.

### Observations and actions

`observations` is an array (empty when no attempt is possible). Each element has:

- Unique path-safe `observation_id`, plus exact `uc_id`, `run_id`, `stage`, `source_revision`, `baseline` reference and a frozen `flow_id`.
- `planned_at`, `started_at`, `ended_at` with timezone; plan precedes start, end follows start and does not exceed assessment `captured_at`.
- Positive integer `time_limit_seconds` and nonempty `scope`, declared before observation; actual duration cannot exceed the limit.
- Nonempty `actual_preconditions`, `entry_point`, `end_state`; `entry_kind` is `ui`, `api`, or `other`, derived from the frozen specification.
- `state`: `completed`, `incomplete`, or `blocked`. Completed means the connected attempt reached the terminal observation, not that the scored behavior is necessarily correct.
- Nonempty `actions`, chronologically ordered. Each has consecutive integer `sequence` starting at 1, `at` timestamp within the attempt, nonempty `action` and `actual_result`, nonempty `target_ids`, and nonempty behavioral `evidence`.

Action/evidence target IDs are the assessment's UC-derived step IDs (including a necessary shared main-flow prefix) or audit markers `entry`, `branch`, `terminal_outcome`. Markers are evidence links, never new scored steps. Evidence attached to an action must cover its target IDs. The first action covers `entry` (with UI evidence for UI-entry flows). A completed attempt's last action covers `terminal_outcome`; Alternative/Exception completion also requires an actual `branch` observation. The reviewer checks the correct prefix and condition against the frozen UC, not merely marker presence.

### Evidence reference

Every non-baseline runtime evidence reference can be provided as a string repository-relative path or an object:

| Field | Contract |
|---|---|
| `path`, `sha256` | Existing assessment-local artifact and optional SHA-256 (calculated automatically if omitted). |
| `kind` | Optional. Behavioral: `ui`, `network`, `backend`, `data`, `runtime_trace`. Defaults to `ui`. |
| `source_revision` | Optional. Defaults to audited revision. |
| `sanitized` | Optional. Defaults to `true`. |
| `locator` | Optional. Defaults to `runtime`. |
| `observation_id` | Optional attempt ID. Defaults to parent attempt. |

Behavioral artifacts live below `<assessment-id>/<observation-id>/`. Steps automatically inherit evidence from the flow observation if not explicitly specified. Static artifacts may live below `_source` or `_runtime`.

### Step and terminal decisions

Each retains `status`, `rationale`, and optional `evidence` (inherited from observation if empty). `source_findings` is optional (defaults to `[]`). An `incorrect` target includes unique nonempty `caused_by_defect_ids`; a `not_evaluable` target includes nonempty `unavailable_reason`; `correct` carries neither field.

For every step or terminal outcome with conclusive `status: "correct"` or `"incorrect"`, runtime evidence linked to the flow observation is verified. `required_runtime_kinds` and `evidence_requirement_rationale` are optional (defaulted automatically to `["ui"]` and `"Runtime observation completed."`). Unreached steps are `not_evaluable`, not inferred failures.

Each flow includes `completion_observation_id` (auto-resolved from completed attempts if omitted). An `incorrect` Flow carries the union of its causing defect IDs; a `not_evaluable` Flow carries a nonempty unavailable reason. Noncritical discrepancies do not automatically fail the flow. Formula, equal weights, coverage, null exact percentages for unavailable flows and bounds remain unchanged.

### Persistence and validation

The canonical `flow_accuracy` block uses the same schema/rubric pair as the input. Results include that pair explicitly and retain the complete input. The canonical top-level `defects` array records one root cause once per source stage with `defect_id`, SHA-256 `fingerprint`, `stage`, `category` (`business_rule`, `flow`, `technical`, `ui`), trigger, description, affected BR/Flow IDs, `blocks_execution`, checksummed evidence, source revision and status. A functional `ui` defect must affect at least one frozen BR or Flow; cosmetic visual differences are excluded. Scorer dry-run performs identity, configuration/checksum, rubric, defect, history, evidence and scoring validation without writes. Persistence is append-only: same ID and identical input/result can retry; changed content or existing artifact conflicts fail. Existing initial JSON/Markdown is never replaced. Aggregation revalidates all runtime evidence and recomputes scores before accepting stored results.

Initial/final share baseline and rubric. Repair automatically creates final evidence before its work turn ends: fresh stage-specific observations captured after prior assessment completion, distinct observation IDs and its own evidence directory. Runtime-blocked final records fresh limitations rather than copying initial success. When repair is skipped and the audited source hash is unchanged, retain the initial assessment as terminal evidence with its original stage/ID/time, equal initial/final BR snapshots and a recorded `repair_skip_reason`. Do not fabricate another assessment or require a separate Final Audit Gate. Terminal aggregation checks the source revision against the final BR/source hash.

The canonical `flow_accuracy` block requires `selection_policy: accepted-audit-results-v1` and `current_summary`. The scorer writes immutable `flow-accuracy/<assessment-id>.{json,md}` and stores the accepted result and follow-ups directly in canonical JSON. See [follow-up measurement](follow-up-measurement.md). Configuration, activation and evidence remain checksum-linked. `audit_design.protocol` assigns auditors (`fixed`, `matched`, `cross`); it is not a scoring rubric.
