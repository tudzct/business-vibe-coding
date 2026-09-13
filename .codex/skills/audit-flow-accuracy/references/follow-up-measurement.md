# Partial flow results and follow-up measurement

Use this procedure after an audit leaves a flow `not_evaluable`, or when the researcher supplies missing flow results or asks the LLM to continue measuring. Scope is flow accuracy only. Never update BR decisions, telemetry, UI scores, run status, repair authorization or gate history in this operation.

## Save and offer both paths

The normal scorer automatically saves `flow_accuracy.current_summary` and `flow-accuracy/current.{json,md}`. For an existing assessment without that projection, run `record_flow_followup.py --run-json <run.json>` (dry-run first). This saves partial progress without changing the immutable assessment or its report. It also repairs an interrupted derived-view write from canonical history.

Immediately report known correct/incorrect/pending counts, evaluated-only accuracy/error, coverage, whole-baseline accuracy/error (null until every flow is evaluated), and bounds. List each pending flow, missing critical step/outcome/connected observation, reason, limitations and attempted observations. Known failures stay visible even while measurement is partial. Do not discard available metrics or wait for every flow before logging results.

Always offer both choices together in plain language:

1. Researcher measures manually and supplies per-flow results; the LLM writes JSON and recalculates percentages.
2. LLM continues bounded measurement of the pending flows and automatically writes validated results.

Wait for the researcher's choice unless the current request already selects a path. A supplied result selects path 1; an explicit request to continue measuring selects path 2. This is not a repair decision or permission to advance an experiment gate. Leave the existing gate pending; no additional gate is introduced. Partial flow results alone do not prevent existing telemetry closure/finalization; preserve the honest run status and existing confirmation requirements. Completion of measurement is separate from correctness of the application.

## Absolute source boundary

This operation finds defects and evaluates behavior. Never edit any application source, entities, migrations, runtime configuration, dependencies, mocks or audit-only endpoints to make a flow observable or correct. This remains true if earlier repair authorization exists. Record a detected defect for a separate repair step; do not invoke a repair skill here. Read-only source inspection and bounded observation of an authorized Docker Compose runtime are permitted. Do not create/run tests or test cases, fall back to native services, or force infrastructure failures outside authorization.

Resolve the exact UC/run/current assessment and its pinned baseline/source revision. Before and after LLM runtime observation, verify the audited source and deployment remain unchanged, using the preserved source manifest/hash procedure. If the available source differs, stop that observation and report the mismatch; never mix revisions or revise an old initial score using repaired source. This script writes only experiment JSON and flow reports; it does not modify or deploy application source.

## Researcher result path

Accept results in normal conversation, e.g. `EF-1 đúng, AF-2 sai`. Map unambiguous whole-flow verdicts to `correct`, `incorrect`, or `not_evaluable`. The researcher only supplies results: do not ask for screenshots, logs, timestamps, checksums, runtime transcripts, a special command or JSON edits. The LLM resolves IDs from the active context, captures the actual request turn/time, prepares the internal payload and runs the helper. If a result's flow identity or meaning is genuinely ambiguous, ask only about that ambiguity. A bare overall percentage cannot identify which pending flows passed; do not invent individual outcomes from it.

Preserve the sanitized result text in `researcher_result`. Do not fabricate step outcomes, runtime evidence, observation times or independent verification. Manual verdicts are accepted for the current summary with `result_source: researcher_result`; the summary exposes `includes_researcher_results` and their count. The original rubric assessment remains unchanged and inspectable. Compare results with their provenance, not as if all were independently observed under runtime-v2.

## LLM measurement path

Observe only the selected pending behavior under the original rubric. Declare each attempt's time/scope bounds and retain failed attempts. Use the existing per-flow procedure and runtime evidence schema. Stop at sufficient evidence, a blocker or the bound; automatically save any valid results from that attempt and report remaining gaps with both choices again. No further permission is needed just to save already authorized evaluation results.

Prepare a fresh assessment input with a unique ID equal to `followup_id`, the same stage/source/baseline as its parent, and evidence in its own assessment directory. The existing scorer validates the complete frozen inventory. For flows outside this attempt, record `not_evaluable` with an explicit not-reassessed limitation; their rows do not replace already measured results. Include only targeted pending flow IDs in the follow-up `results`. Do not splice separate attempts into a successful completion. Runtime-v2 requirements remain mandatory for LLM verdicts; static evidence cannot establish `correct`.

## Internal payload and commands

The LLM creates this payload inside the run evidence folder, using actual identities and timestamps:

```json
{
  "schema_version": 1,
  "followup_id": "flow-followup-unique-id",
  "assessment_id": "parent-assessment-id",
  "assessment_sha256": "sha256:canonical-parent-object-hash",
  "uc_id": "UC-ID",
  "run_id": "RUN-ID",
  "stage": "initial",
  "source_revision": "sha256:parent-source-revision",
  "baseline": {"path": "parent-baseline-path", "sha256": "sha256:parent-baseline-hash"},
  "source_unchanged": true,
  "request_turn_id": "actual-researcher-turn-id",
  "recorded_at": "actual-ISO-8601-time-with-timezone",
  "mode": "researcher_result",
  "researcher_result": "EF-1 đúng",
  "results": [{"flow_id": "EF-1", "status": "correct"}]
}
```

`assessment_sha256` uses `flow_summary.fingerprint(parent)`: SHA-256 of UTF-8 JSON with sorted keys and separators `(',', ':')`, matching the existing gate object-hash convention. For `mode: llm_measurement`, replace `researcher_result` with `runtime_assessment` containing the full new assessment input. The helper calculates and persists `runtime_result` itself.

```text
python .codex/skills/audit-flow-accuracy/scripts/record_flow_followup.py --run-json <canonical.json> --input <followup-input.json> --dry-run
python .codex/skills/audit-flow-accuracy/scripts/record_flow_followup.py --run-json <canonical.json> --input <followup-input.json>
```

Same ID and content is an idempotent retry; changed content with the same ID is rejected. Each update can only address currently pending flows of the current assessment. Append `flow_accuracy.followups` and an immutable `flow-accuracy/followups/<id>.json`; refresh the canonical summary, top-level flow fields and current JSON/Markdown automatically. Refresh an existing derived experiment report when applicable; Excel remains a separately requested export. The first-pass/final assessments and previous gate receipts retain their original IDs, timestamps, hashes and content. New final-source assessment starts its own summary; prior-source supplements never carry forward.

## Formulas and compatibility

Let `C = correct`, `W = incorrect`, `U = not_evaluable`, `T = C + W + U`, `E = C + W`. Each frozen whole flow retains equal weight.

- `evaluated_accuracy_percent = C / E * 100`; `evaluated_error_percent = W / E * 100`. Both are null when E is zero.
- `evaluated_coverage_percent = E / T * 100`.
- Whole-baseline `flow_accuracy_percent = C / T * 100` and `flow_error_percent = W / T * 100` only when U is zero; otherwise null.
- Lower/upper bounds remain `C / T * 100` and `(C + U) / T * 100`.

`measurement_status` is `not_evaluable`, `partial` or `complete`; `has_incorrect_flows` is independent. Summary/top-level status is `partial` when E and U are positive, `not_evaluable` when E is zero, otherwise `repair_required` or `scored`. Original assessments retain their original status/formulas for checksum compatibility. No configuration, activation, frozen baseline or historical assessment migration is required. Existing runs gain a projection only on an explicitly requested audit/follow-up operation; do not rewrite unrelated runs.
