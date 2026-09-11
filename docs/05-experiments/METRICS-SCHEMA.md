# Experiment metrics schema

## Supplementary UI and Excel output

`audit-generation-metrics` automatically invokes `audit-figma-ui-accuracy` in the same Audit turn. The child skill implements the Business UI rubric (weights 20/25/15/15/15/10), with screenshot-backed judgments, raw category-checkpoint total/met/unmet/not-evaluable counts, separate structural coverage and perceptual similarity. It owns `ui_accuracy` (schema_version 1, immutable assessment history/current ID), `ui_accuracy_percent` (0-100 or null), and `ui_accuracy_status`. Initial evidence is preserved; final assessments append history. See `.codex/skills/audit-figma-ui-accuracy/references/assessment-schema.md`. No-design and blocked evidence are persisted as N/A statuses, never fabricated 0%. UI does not change the Business Rule baseline or add a mandatory flow-scoring intervention. Audit prints the BR/UI summaries together for manual researcher entry; automatic Excel export remains telemetry-only under Measure.

`export-experiment-excel` reads canonical results and fills the researcher's existing workbook by inspected field/row identity. It writes a new Excel copy and cell-level provenance/error receipt, not new canonical metrics. Missing, ambiguous or unfinalized values become literal `N/A` in known writable result cells; formulas and unresolved destinations remain unchanged. Measure retains token/time ownership. Reporting-only export turns are excluded from workflow telemetry. When a Measure prompt contains `Excel target: <path-or-link>`, the target applies to that invocation only and Measure automatically hands off the just-committed scope using `measure_telemetry_only`; BR/Figma/flow/manual cells are not touched.

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

## Post-turn measurements (metrics schema version 1)

New run templates set `metrics_schema_version: 1` and `metrics: null` until the first researcher-requested Measure turn. Existing historical `tokens`/`timing_seconds` fields retain their original meaning and are not rewritten or silently migrated. Consumers prefer `metrics` when present; do not add legacy totals to it.

Measure is the only telemetry writer. It updates canonical `metrics` and mirrors it under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/workflow-metrics.json`. The adjacent `workflow-metrics.md` is refreshed on every measurement. `phase-ledger.json` stores live work segments and phase state; `phase-ledger.md` is the readable control record. Audit validates the metrics block and preserves it while updating BR evidence. Renderer reads canonical fields without recomputation.

`metrics` contains UC/run identity, `schema_version: 1`, `provenance_class: observed_post_run`, `timing_method: system_timestamp_delta`, `status: open|finalized`, session/hash provenance, selected `turns`, explicit `excluded_turns`, `phase_ledger`, `phases` and `workflow`.

The only core measurement phase keys are `prompt_generation`, `source_generation`, `repair`. Each has `status: not_started|open|closed|skipped` and `values`. Values are null until closed. An explicitly skipped repair has a reason and zero observed work. These measurement buckets do not alter the method's two research phases.

Each closed phase's `values`, and `metrics.workflow`, has:

| Field | Meaning |
|---|---|
| `tokens.input_tokens` | Original input counter, including cached input |
| `tokens.cached_input_tokens` | Cached subset of input |
| `tokens.output_tokens` | Original output counter, including reasoning |
| `tokens.reasoning_output_tokens` | Reasoning subset of output |
| `tokens.total_tokens` | Input + output; never add cached/reasoning again |
| `duration_seconds` | Sum of captured, non-overlapping work segments |
| `workflow_turn_count` | Number of selected researcher-initiated turns |
| `tool_call_count` | Observable tool invocation records, deduplicated by call ID |
| `model_call_count` | Null until an exact model-request event schema is supported |

Missing cached/reasoning counters have null and `token_unavailable_reasons`. Missing captured time makes the containing aggregate duration null, with `timing_unavailable_reason`; known durations are not passed off as a complete sum. No fresh-input/cache-write fields, money costs, usage-update counts or three-phase subtotal appear in the main report. Parser diagnostics may count usage updates internally, never relabel them as model calls.

Required UC-specific approvals, clarification, Figma/dataset resolution and blocked turns count toward that UC. Inside an open core phase they count toward that phase and workflow. Before a core phase starts they belong only to an auxiliary workflow phase. Setup shared across UCs before UC start is recorded separately. Exclude unrelated/other-UC work with a reason. Exclude every intermediate and final Measure/report-only turn.

Timestamp endpoints are captured live by the shared helper with ISO/epoch, UC/run/session/turn/phase/segment/event/source revision. Compute `(end_epoch_ms - start_epoch_ms)/1000`, validate timezone/ISO consistency, reject negative/overlapping or mismatched intervals. End before researcher waits and resume with a new segment. Captured work duration is not an exact UI Worked-for claim. Workflow time covers all selected work segments; it is not the gap between first and last chat timestamps.

One turn is indivisible. The researcher calls Measure after the prior response completes to close its core phase. The script rejects current/incomplete selections, missing telemetry, duplicate turns, unexplained gaps, identity conflicts and changes to previously committed rows. Whole-file session hashes are observation-specific; completed-turn prefix hashes remain stable as later turns append. AI semantic classification remains auditable through reasons and explicit boundaries, not a claim of perfect automatic understanding.

Work may reach terminal `run_status` before `metrics.status=finalized`. Final workflow measurement is a separate reporting turn after final audit/runtime/finalization. Explicit repair refusal/no-repair decisions use `repair_skip_reason`; they do not fabricate successful source results. Full and RQ3 both hold after first generation, require source measurement and first-pass BR assessment, and require actual researcher repair authorization before correction.
