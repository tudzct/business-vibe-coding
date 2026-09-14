# Partial flow results and follow-up measurement

Use this procedure after audit, when the researcher supplies flow results, or asks the LLM to audit again (including already scored flows). This evaluation/write operation is flow-only: never update BR decisions, telemetry, UI scores, run status, repair authorization or gate history inside it. After saving, return to the coordinator for [automatic continuation](../../../../docs/00-context/workflow/gates/FLOW-FOLLOWUP-AUTO-REPAIR.md). The coordinator records the policy decision and starts evidenced repair in the same work turn without another researcher confirmation.

## Accepted experiment result

`flow_accuracy.selection_policy: accepted-audit-results-v1` selects the latest conclusive (`correct` or `incorrect`) verdict per frozen flow across the run's assessments and follow-ups in evidence/record time order. A later `not_evaluable` attempt records limitations but never erases an accepted result. A conclusive re-audit can replace an earlier verdict, including a researcher verdict. Repair and a changed source hash do not reset the experiment result. Preserve the denominator, rubric and individual evidence scores.

Both paths update `flow_accuracy.current_summary` and top-level flow percentages/status directly in the Canonical Run JSON under `docs/05-experiments/`, in the same response turn without a second save/approval question. Resolve the question's run and evidence context internally. A researcher reply to an earlier question may keep its older evidence parent after repair and still update the experiment result. Do not ask the researcher to repeat accepted verdicts merely because source changed.

Projection schema 2 uses `result_scope: experiment_accepted_audit`, `stage: experiment`, and null aggregate `source_revision`. `assessment_id` and `current_assessment_id` identify the latest assessment context; each selected flow keeps its actual evidence record, assessment, stage and source revision. `current_source_revision`, `latest_assessment_status`, `latest_assessment_counts` and `retained_from_prior_source_count` expose later audit limitations and retained earlier results. Never relabel earlier evidence as observations of repaired source. Report the selection policy alongside the rubric when comparing runs; legacy stage-only projections have a different reporting policy.

## Save and offer both paths

The scorer saves `flow_accuracy.current_summary` in canonical JSON. For an explicitly requested existing run, run `record_flow_followup.py --run-json <run.json>` (dry-run first) to adopt the accepted-result projection without inventing an observation or verdict. Existing `flow-accuracy/current.{json,md}` mirrors are historical and no longer maintained; never read them as current results.

Immediately report accepted correct/incorrect/pending counts, evaluated-only accuracy/error, coverage, whole-baseline accuracy/error (null until every flow has an accepted verdict), and bounds from canonical current_summary. List pending targets and attempts. Show later audit limitations separately when an earlier conclusive result is retained. State the updated canonical file and result source. Do not wait for every flow before saving results.

Always offer both choices together in plain language:

1. Researcher measures manually and supplies per-flow results; the LLM writes JSON and recalculates percentages.
2. LLM continues bounded measurement of the pending flows and automatically writes validated results.

Wait for the researcher's choice unless the current request already selects a path. A supplied result selects path 1; an explicit request to continue measuring selects path 2. Saving needs no additional confirmation. Then invoke the coordinator's automatic continuation policy: the standing repository policy supplies repair authorization, rather than treating a verdict as a new approval. Existing defects can enter repair while other flows remain pending. Missing evidence alone triggers no repair; all-passing results can record that repair is unnecessary. Other confirmation gates remain. Completion of measurement is separate from correctness of the application.

## Absolute source boundary

This operation finds defects and evaluates behavior. Never edit any application source, entities, migrations, runtime configuration, dependencies, mocks or audit-only endpoints during evaluation to make a flow observable or correct. This remains true if earlier repair authorization exists. Record detected defects and finish the validated flow write before returning to the coordinator; it may then invoke the separate repair step in the same turn under the automatic policy. Read-only source inspection and bounded observation of an authorized Docker Compose runtime are permitted. Do not create/run tests or test cases, fall back to native services, or force infrastructure failures outside authorization.

Resolve the exact UC/run and evidence parent. For LLM runtime observation use the current assessment's pinned source/baseline and verify source/deployment before and after observation. Source drift blocks that observation; never mix runtime revisions. Retaining an earlier accepted report result does not relax evidence validation. This script only writes experiment JSON and an existing derived experiment report.

## Researcher result path

Accept results in normal conversation, e.g. `EF-1 đúng, AF-2 sai`. Map unambiguous whole-flow verdicts to `correct`, `incorrect`, or `not_evaluable`. The researcher only supplies results: do not ask for screenshots, logs, timestamps, checksums, runtime transcripts, a special command or JSON edits. The LLM resolves IDs from the active context, captures the actual request turn/time, prepares the internal payload and runs the helper. If a result's flow identity or meaning is genuinely ambiguous, ask only about that ambiguity. A bare overall percentage cannot identify which pending flows passed; do not invent individual outcomes from it.

Preserve sanitized text in `researcher_result`. Do not fabricate step outcomes, runtime evidence, observation times or independent verification. Accepted rows use `result_source: researcher_result`; the summary exposes `result_basis: includes_researcher_results` and `researcher_result_count`. The original rubric assessment remains unchanged. Compare results with their actual provenance.

## LLM measurement path

Observe requested flows under the original rubric: pending flows by default, or already scored flows when re-audit is requested. Declare scope/time bounds and retain failed attempts. Stop at sufficient evidence, blocker or bound; automatically save validated results and report remaining gaps. No further permission is needed to save authorized evaluation results.

Prepare a fresh full assessment input with ID equal to `followup_id`, matching the current evidence parent's stage/source/baseline, and its own evidence directory. Non-targeted rows remain `not_evaluable` with a not-reassessed limitation; only requested flow IDs enter `results`. Do not splice attempts. Runtime-v2 evidence remains mandatory for LLM `correct`.

## Internal payload and commands

The LLM passes this payload through stdin (`--input -`) without creating an input JSON in flow-accuracy. Use actual identities/timestamps and schema 2 for new follow-ups, including corrections to already scored flows:

```json
{
  "schema_version": 2,
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
python -B .codex/skills/audit-flow-accuracy/scripts/record_flow_followup.py --run-json <canonical.json> --input - --dry-run
python -B .codex/skills/audit-flow-accuracy/scripts/record_flow_followup.py --run-json <canonical.json> --input -
```

Dry-run first, then repeat without --dry-run with identical payload. Same ID/content retries are idempotent; changed content with the same ID is rejected. Append `flow_accuracy.followups` and atomically refresh canonical summary/top-level fields under the run lock. Do not create `flow-accuracy/followups/<id>.json` or current JSON/Markdown mirrors. Existing legacy files remain unchanged and are checked when present. Keep immutable assessment artifacts and runtime evidence. Refresh an existing derived experiment report automatically; Excel remains separately requested. Initial/final assessments and previous gate receipts retain IDs, times, hashes and content. Source/stage changes retain earlier accepted verdicts until conclusive newer results replace them.

## Formulas and compatibility

For accepted result rows let `C = correct`, `W = incorrect`, `U = not_evaluable`, `T = C + W + U`, `E = C + W`. Each frozen whole flow retains equal weight. Legacy projection/follow-up schema 1 and historical gate hashes retain their original validation; no historical evidence is rewritten.

- `evaluated_accuracy_percent = C / E * 100`; `evaluated_error_percent = W / E * 100`. Both are null when E is zero.
- `evaluated_coverage_percent = E / T * 100`.
- Whole-baseline `flow_accuracy_percent = C / T * 100` and `flow_error_percent = W / T * 100` only when U is zero; otherwise null.
- Lower/upper bounds remain `C / T * 100` and `(C + U) / T * 100`.

`measurement_status` is `not_evaluable`, `partial` or `complete`; `has_incorrect_flows` is independent. Summary/top-level status is `partial` when E and U are positive, `not_evaluable` when E is zero, otherwise `repair_required` or `scored`. Original assessments retain their original status/formulas for checksum compatibility. No configuration, activation, frozen baseline or historical assessment migration is required. Existing runs gain a projection only on an explicitly requested audit/follow-up operation; do not rewrite unrelated runs.
