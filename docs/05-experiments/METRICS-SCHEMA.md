# Experiment metrics schema

## Supplementary flow, researcher-managed UI and Excel output

`audit-generation-metrics` automatically invokes `audit-flow-accuracy` from confirmed First-pass and Final Audit Gates. The denominator is frozen before source generation from every explicit Basic/Main, Alternative and Exception Flow. Each flow has equal weight. A completion-critical failed step or unmet terminal outcome makes the whole flow incorrect. `flow_error_percent = incorrect / total * 100`; `flow_accuracy_percent = (total - incorrect) / total * 100`. Unknown evidence keeps both exact percentages null and reports coverage plus accuracy bounds.

Figma/UI accuracy is researcher-managed. The workflow does not calculate weighted UI accuracy, structural coverage or perceptual similarity, and audit preserves manual UI fields unchanged. The frozen Figma dataset remains implementation input only.

`export-experiment-excel` is invoked separately once after final workflow measurement. It reads finalized canonical phase/workflow telemetry and fills the researcher's existing workbook by inspected field/row identity. It writes a new Excel copy and cell-level provenance/error receipt, never canonical metrics. Missing or ambiguous telemetry becomes literal `N/A` in known writable telemetry cells; formulas, unresolved destinations and BR/Figma/flow/manual cells remain unchanged. Measure retains token/time ownership and never invokes this skill. The reporting-only export turn is excluded from workflow telemetry.

## Canonical record

The canonical run JSON records:

- configuration, UC, prompt_variant (`full` or `rq3`), model, replicate, order, wall-clock time and token use;
- frozen final-source checksum;
- initial and final assessment for every frozen BR;
- each BR status: `met`, `unmet` or `not_evaluable`, with evidence and rationale;
- repair count/time/tokens and affected BR IDs;
- optional researcher estimates, UI/flow accuracy and structural complexity.

Required consistency:

- assessed BR IDs exactly equal the baseline's ordered BR IDs;
- each BR occurs once per assessment snapshot;
- overall totals equal status counts;
- repairs never mutate the immutable initial snapshot;
- claims require inspectable source, configuration, build or bounded runtime evidence;
- prompt text alone is not evidence.

No test metrics or generated test cases are part of this schema.

## Gate-closed telemetry (metrics schema version 3)

New run templates set `metrics_schema_version: 3` and `metrics: null` until the researcher confirms the corresponding telemetry gate and the internal engine closes it. Schema 3 retains semantic token labels and changes time to `generation_execution_only_v1`. Schema 1/2 measured runs remain readable under their original attribution rules, but the gate engine does not rewrite them; use a new run for the new timing protocol and never relabel historical broad timestamps. Existing historical `tokens`/`timing_seconds` fields retain their original meaning and are not silently migrated. Consumers prefer `metrics` when present; do not add legacy totals to it.

Measure is the only telemetry writer. It updates canonical `metrics` and mirrors it under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/workflow-metrics.json`. The adjacent `workflow-metrics.md` is refreshed on every measurement. `phase-ledger.json` stores live work segments and phase state; `phase-ledger.md` is the readable control record. Audit validates the metrics block and preserves it while updating BR evidence. Renderer reads canonical fields without recomputation.

`metrics` contains UC/run identity, `schema_version: 3`, `token_attribution_method: semantic_primary_phase_per_turn`, `provenance_class: observed_post_run`, `timing_method: system_timestamp_delta`, `timing_protocol: generation_execution_only_v1`, `repair_timing`, `status: open|finalized`, session/hash provenance, selected `turns`, explicit `excluded_turns`, `phase_ledger`, `phases`, `token_phase_breakdown` and `workflow`.

The only core measurement phase keys are `prompt_generation`, `source_generation`, `repair`. Each has `status: not_started|open|closed|skipped` and `values`. Values are null until closed. An explicitly skipped repair has a reason and zero observed work. These measurement buckets do not alter the method's two research phases.

Each closed phase's `values`, and `metrics.workflow`, has:

| Field | Meaning |
|---|---|
| `tokens.input_tokens` | Original input counter, including cached input |
| `tokens.cached_input_tokens` | Cached subset of input |
| `tokens.output_tokens` | Original output counter, including reasoning |
| `tokens.reasoning_output_tokens` | Reasoning subset of output |
| `tokens.total_tokens` | Input + output; never add cached/reasoning again |
| `duration_seconds` | Sum of core execution intervals by `timing_phase`; workflow = Prompt + Source + all Repairs, independent of token label |
| `workflow_turn_count` | Number of selected researcher-initiated turns with the matching token label (all selected turns for workflow) |
| `tool_call_count` | Observable tool invocation records for those token-labelled turns, deduplicated by call ID |
| `model_call_count` | Null until an exact model-request event schema is supported |

Missing cached/reasoning counters have null and `token_unavailable_reasons`. Missing captured time makes the containing aggregate duration null, with `timing_unavailable_reason`; known durations are not passed off as a complete sum. No fresh-input/cache-write fields, money costs, usage-update counts or three-phase subtotal appear in the main report. Parser diagnostics may count usage updates internally, never relabel them as model calls.

Required UC-specific approvals, clarification, Figma/dataset resolution and blocked turns count toward that UC workflow. For tokens, AI labels each completed turn by actual primary work and supplies a reason. Only `prompt_generation`, `source_generation` and `repair` labels contribute tokens to the corresponding core phase. Config/approval-only, dataset-only, audit-only, runtime-only, finalization-only and setup-only turns remain auxiliary even inside an open generation bucket. Failed generation/repair attempts remain chargeable under their actual work. Mixed turns retain one primary label and whole telemetry, never an estimated split. See the shared selection-schema.md. Review every earlier session turn; explicitly exclude common setup, unrelated/other-UC work and every Measure/report-only turn with reasons so earlier UC-specific configuration is not silently omitted.

`turns[].phase` is the semantic token label; `turns[].timing_phase` is the captured timing bucket. The latter follows live execution segments and can differ from the token label. Auxiliary-only turns have zero counted generation seconds plus `timing_exclusion_reason`, not an observed zero elapsed time. `metrics.phases.<phase>.values.tokens` and counts sum matching token labels; `duration_seconds` sums matching timing buckets. `metrics.token_phase_breakdown.<label>` records all labels, including auxiliary, with five token fields, unavailable reasons and turn/tool counts. Workflow token/count totals include each selected turn once; workflow seconds include only the three core execution scopes. The rendered view shows per-label totals and each turn's token label, timing bucket and rationale. A later standalone Excel export reads these finalized fields without reclassifying or recomputing them.

Timestamp endpoints are captured live by the shared helper with ISO/epoch, UC/run/session/turn/phase/segment/event/source revision. Compute `(end_epoch_ms - start_epoch_ms)/1000`, validate timezone/ISO consistency, reject negative/overlapping or mismatched intervals. End before researcher waits and resume with a new segment. Captured work duration is not an exact UI Worked-for claim. START only after prerequisites, immediately before generating the Draft, first source mutation or each repair execution. END after Draft persistence before review, after first-pass source before build/audit/runtime, or after correction plus permitted evidence before repair audit appending, respectively. Workflow time = Prompt + first-pass Source + all Repairs; standalone configuration/approval/dataset/setup/audit/runtime/finalization time is excluded. Workflow seconds are null while any phase is pending or missing endpoints, and do not represent the gap between first and last chat messages. Each repair has its own endpoint pair with matching `repair_id`; `metrics.repair_timing.<repair_id>` stores `duration_seconds`, `segment_ids` and `timing_unavailable_reason`. Optional auxiliary diagnostic segments remain raw evidence but never enter execution totals.

One turn is indivisible. After the prior response completes, the researcher confirms the pending gate and the gate invokes telemetry internally. The script rejects current/incomplete selections, missing telemetry, duplicate turns, unexplained gaps, identity conflicts and changes to committed rows. Whole-file session hashes are observation-specific; completed-turn prefix hashes remain stable.

Work may reach terminal `run_status` before `metrics.status=finalized`. Final workflow measurement is a separate reporting turn after final audit/runtime/finalization. Explicit repair refusal/no-repair decisions use `repair_skip_reason`; they do not fabricate successful source results. Full and RQ3 both hold after first generation, require source measurement and first-pass BR assessment, and require actual researcher repair authorization before correction.
