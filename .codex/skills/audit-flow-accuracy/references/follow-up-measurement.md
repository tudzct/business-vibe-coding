# Audit results and follow-up measurement

Save researcher or LLM follow-ups without source, telemetry, UI or gate changes inside the scorer. One natural-language researcher response may resolve or challenge BR results, Flow results or both. Unmentioned results retain the audit verdict. Save the validated result, report its status and stop. This operation never edits application source or starts another top-level operation.

BR and Flow share this one follow-up operation. The original BR snapshot and Flow assessments remain immutable. A direct researcher verdict is stored with researcher attribution and no fabricated implementation/runtime proof. A request to check again causes a bounded evidence-backed LLM re-audit. If a later authorized operation consumes the audit artifact without a challenge, the saved audit verdicts remain accepted as-is.

## Accepted experiment result

`flow_accuracy.selection_policy: accepted-audit-results-v1` selects the latest conclusive (`correct` or `incorrect`) verdict per frozen flow across the run's assessments and follow-ups in evidence/record time order. A later `not_evaluable` attempt records limitations but never erases an earlier accepted conclusive result. A conclusive re-audit can replace an earlier verdict, including a researcher verdict. Repair and a changed source hash do not reset the experiment result. Preserve the denominator, rubric and individual evidence scores.

Both paths update `flow_accuracy.current_summary` and top-level flow percentages/status directly in the Canonical Run JSON under `docs/04-experiments/`, in the same response turn without a second save/approval question. Resolve the question's run and evidence context internally. A researcher reply to an earlier question may keep its older evidence parent after repair and still update the experiment result. Do not ask the researcher to repeat accepted verdicts merely because source changed.

Projection schema 2 uses `result_scope: experiment_accepted_audit`, `stage: experiment`, and null aggregate `source_revision`. `assessment_id` and `current_assessment_id` identify the latest assessment context; each selected flow keeps its actual evidence record, assessment, stage and source revision. `current_source_revision`, `latest_assessment_status`, `latest_assessment_counts` and `retained_from_prior_source_count` expose later audit limitations and retained earlier results. Never relabel earlier evidence as observations of repaired source. Report the selection policy alongside the rubric when comparing runs..

## Save and offer both paths

The scorer saves `flow_accuracy.current_summary` and, when supplied, the append-only BR follow-up in the same atomic Canonical Run update. Use `record_flow_followup.py --run-json <run.json>` (dry-run first) to refresh or save the accepted-result projection. The canonical JSON is authoritative.

Immediately report accepted correct/incorrect/pending counts, evaluated-only accuracy/error, coverage, whole-baseline accuracy/error (null until every flow has an accepted verdict), and bounds from canonical current_summary. List pending targets and attempts. Show later audit limitations separately when an earlier conclusive result is retained. State the updated canonical file and result source. Do not wait for every flow before saving results.

When a verdict is unknown or challenged, offer both choices together in plain language:

1. Researcher measures manually and supplies per-flow results; the LLM writes JSON and recalculates percentages.
2. LLM continues bounded measurement of the pending flows and automatically writes validated results.

Wait for the choice unless the request already selects a path. A supplied verdict selects path 1; a request to continue measuring selects path 2. A researcher verdict is final and is recorded without checking whether it is substantively correct. Save without another confirmation. Return the validated result to the caller; completion of measurement is separate from correctness.

## Absolute source boundary

This operation finds defects and evaluates behavior. Never edit any application source, entities, migrations, runtime configuration, dependencies, mocks or audit-only endpoints during evaluation to make a flow observable or correct. Record detected defects, finish the validated flow write and return it to the caller. Read-only source inspection and bounded observation of an authorized Docker Compose runtime are permitted. Do not create/run tests or test cases, fall back to native services, or force infrastructure failures outside authorization.

Resolve the exact UC/run and evidence parent. For LLM runtime observation use the current assessment's pinned source/baseline and verify source/deployment before and after observation. Source drift blocks that observation; never mix runtime revisions. Retaining an earlier accepted report result does not relax evidence validation. This script only writes experiment JSON and an existing derived experiment report.

## Researcher result path

Accept every researcher correction or reported issue through this one external format, with one item per target or technical issue:

```text
Audit follow-up:

- Target: <BR-ID | Basic Flow: exact affected numbered step | AF-ID | EF-ID | Technical issue>
  Result: <met | unmet | correct | incorrect | technical>
  Execution blocked: <yes | no>
  Description: <short description>
  Evidence: <short observed evidence | N/A>
```

For a BR target, accept only `met` or `unmet`; for a Flow target, accept only `correct` or `incorrect`; for `Technical issue`, accept only `technical`. `Evidence: N/A` is permitted only for `met` or `correct`. A Basic Flow target copies the exact numbered step that failed from the frozen UC, for example `Basic Flow: 3. The system returns the viewer-facing stream state.` Resolve that step to its containing Basic/Main Flow and use the corresponding internal flow ID; never require the researcher to invent or supply a `BF-*` ID. Infer `business_rule`, `flow` or `technical` and the affected ID from `Target`; do not ask the researcher to repeat them as internal fields. The researcher is authoritative: do not re-audit or ask them to prove the supplied result. If `Execution blocked` is `yes`, require `Target: Technical issue`, create one blocking technical defect, and internally expand the same follow-up to every frozen BR as `unmet` and every frozen Flow as `incorrect`; the researcher does not list those rows. A non-blocking technical issue may be recorded without a BR or Flow result.

A blocker-derived `incorrect` result is not researcher-overridable while its generated-source blocker remains open; preserve the blocker for an authorized correction consumer. Do not ask for timestamps, checksums, a special command or JSON edits. Preserve the sanitized item as a repository evidence artifact attributed to the researcher; the LLM resolves identities, paths, source revision, hashes and the internal payload. If a target or result is genuinely ambiguous, ask only about that ambiguity. A bare overall percentage cannot identify which targets failed; do not invent individual outcomes from it.

Preserve sanitized text in `researcher_result`. Do not fabricate step outcomes, runtime evidence, observation times or independent verification. A negative researcher correction includes normalized canonical defects in the combined helper payload. Each added defect is `stage: initial`, `status: open`, `reported_by: researcher`, names the shared `researcher_followup_id`, uses the immutable parent source revision and references the attributed researcher-statement artifact. Create no defect for a correction to `met` or `correct`. Defect addition is allowed only before sub-prompt generation and Repair. Accepted rows use `result_source: researcher_result`; the summary exposes `result_basis: includes_researcher_results` and `researcher_result_count`. The original rubric assessment remains unchanged. Compare results with their actual provenance.

## LLM measurement path

Observe requested flows under the original rubric: pending flows by default, or already scored flows when re-audit is requested. Declare scope/time bounds and retain failed attempts. Stop at sufficient evidence, blocker or bound; automatically save validated results and report remaining gaps. No further permission is needed to save authorized evaluation results.

Prepare a fresh full assessment input with ID equal to `followup_id`, matching the current evidence parent's stage/source/baseline, and its own evidence directory. Non-targeted rows remain `not_evaluable` with a not-reassessed limitation; only requested flow IDs enter `results`. Do not splice attempts. Runtime-v2 evidence remains mandatory for LLM `correct`.

## Internal payload and commands

The LLM passes the internal payload through stdin (`--input -`) without creating an input JSON in flow-accuracy. The researcher never has to write JSON. A Flow-only follow-up keeps the existing schema below. A combined response wraps the existing Flow record and/or one BR record under `flow` and `business_rules`; both parts use the same `followup_id`. When a researcher changes a target to a negative verdict or reports a technical issue, include `defects`, containing the fully normalized attributed canonical defects. A non-blocking technical issue may use a defects-only internal payload. A blocking technical issue must include the internally expanded complete BR and Flow records. The helper validates and writes verdicts and defects atomically. If any negative result lacks defect coverage, the entire update fails.

Each item in `defects` has the canonical defect fields below. Create the evidence file below the active run's audit evidence directory before dry-run; it contains the sanitized researcher statement and its attribution, not fabricated runtime proof. Use its repository-relative path, byte checksum and the immutable parent source revision. The researcher does not author these fields.

```json
{
  "defect_id": "researcher-defect-unique-id",
  "fingerprint": "sha256:<stable root-cause fingerprint>",
  "stage": "initial",
  "source_revision": "sha256:<parent source revision>",
  "category": "business_rule | flow | technical",
  "trigger": "<reported trigger>",
  "description": "<reported cause>",
  "status": "open",
  "blocks_execution": false,
  "affected_br_ids": ["<BR-ID>"],
  "affected_flow_ids": ["<FLOW-ID>"],
  "evidence": [{
    "path": "<repository-relative researcher-statement artifact>",
    "sha256": "sha256:<artifact checksum>",
    "source_revision": "sha256:<parent source revision>"
  }],
  "reported_by": "researcher",
  "researcher_followup_id": "<shared followup_id>"
}
```

An added `business_rule` defect requires a nonempty `affected_br_ids`; an added `flow` defect requires a nonempty `affected_flow_ids`. A `technical` defect may leave both arrays empty unless the researcher identifies affected targets. One root cause remains one defect even when it affects multiple targets. If any added defect has `blocks_execution: true`, the same combined response must supply every frozen BR as `unmet` and every frozen Flow as `incorrect`; the helper records those defect IDs as the execution-blocked note.

Use actual identities/timestamps and schema 2 for Flow follow-ups, including corrections to already scored flows:

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

The BR part is tied to the immutable initial BR snapshot and source revision. It uses schema 1, `parent_stage: "initial"`, `snapshot_sha256`, the same UC/run/request identity, `source_unchanged: true`, and nonempty `results`. For a direct verdict, use `mode: "researcher_result"`, preserve the researcher's text, and include only `br_id` and `status` in each result. For a requested LLM check, use `mode: "llm_reaudit"` and include inspectable evidence and rationale for each result. The latest conclusive `met` or `unmet` result is accepted; a later `not_evaluable` attempt does not erase it.

```text
python -B .codex/skills/audit-flow-accuracy/scripts/record_flow_followup.py --run-json <canonical.json> --input - --dry-run
python -B .codex/skills/audit-flow-accuracy/scripts/record_flow_followup.py --run-json <canonical.json> --input -
```


## Formulas and evidence integrity


- `evaluated_accuracy_percent = C / E * 100`; `evaluated_error_percent = W / E * 100`. Both are null when E is zero.
- `evaluated_coverage_percent = E / T * 100`.
- Whole-baseline `flow_accuracy_percent = C / T * 100` and `flow_error_percent = W / T * 100` only when U is zero; otherwise null.
- Lower/upper bounds remain `C / T * 100` and `(C + U) / T * 100`.

`measurement_status` is `not_evaluable`, `partial` or `complete`; `has_incorrect_flows` is independent. Summary/top-level status is `partial` when evaluated and unknown rows coexist, `not_evaluable` when no row is evaluated, otherwise `repair_required` or `scored`. Execution blocking is reported through its Boolean note and blocking defect IDs. Original assessments are immutable, including their statuses and checksums. Refresh the projection only on an explicitly requested audit/follow-up operation; do not rewrite unrelated runs.
