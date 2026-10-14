---
name: audit-flow-accuracy
description: Perform authorized flow assessment and persist validated results.
---

# Audit Flow Accuracy

Run only as a directly requested audit or an explicitly authorized subordinate verification. For partial or challenged results, use the follow-up operation described in [follow-up measurement](references/follow-up-measurement.md); one operator response may carry Flow results, BR results or both.

Save either attributed operator verdicts or validated bounded LLM observations directly in canonical JSON. The scorer never edits source, authorizes another top-level operation, closes telemetry or changes gates. Activation is optional; rubric comes from the pinned configuration.

The final reported flow result is the latest conclusive accepted verdict per flow across the run (`accepted-audit-results-v1`). Both operator replies and validated LLM re-audits update canonical JSON in the same turn, without another save confirmation. Changed source hashes and later `not_evaluable` attempts do not erase accepted results. A newer conclusive result can replace an older verdict. Retain actual stage/source provenance per result and show later audit limitations separately. See the follow-up contract for schema 2, stdin input and corrections to already scored flows.

Before assessing, read the frozen UC, canonical run, [per-flow audit procedure](references/per-flow-audit.md) and [assessment schema](references/assessment-schema.md). Resolve and validate the checksum-pinned configuration directly, including every frozen API path/identity/SHA-256; optional activation is validated when present. Configurations use `completion-critical-flow-runtime-v2`: `correct` requires observed completion through the integrated runtime. Require `docs/02-construction/implementation/<UC-ID>/flow-baseline.json`, frozen from the same UC checksum before generation. Read `ordered_flow_ids` as the complete ordered audit inventory, assess every listed flow exactly once and use its length as the frozen denominator. Resolve every listed flow's steps, branch and terminal outcome from the checksum-pinned frozen UC. Never add, omit, reorder or reconstruct the denominator after seeing implementation results.

## Baseline

1. `ordered_flow_ids` includes every explicit Basic/Main Flow and each named Alternative and Exception Flow in source order. Include explicit nested UI-variant flows; an “identical to” reference does not duplicate a flow.
2. Do not count triggers, conditions, postconditions, Business Rules, steps, UI states or API operations as additional flows.
3. Freeze the UC path/checksum and complete ordered flow IDs. Validate them with `scripts/validate_flow_baseline.py`. Initial and final audit must use this exact baseline.
4. During assessment, read each listed flow from the frozen UC, preserve every step in the assessment, and mark `completion_critical: true` only when failure prevents the branch-specific terminal outcome or a mandatory completion state. Record why and stop for researcher resolution when material ambiguity remains.

## Audit (runtime-v2)

1. Follow the per-flow procedure from specified entry through the actual branch to its frozen terminal outcome. Use the UI for UI-entry flows. Keep each attempt's actions and sanitized evidence under its own observation ID, bound to UC/run/stage/baseline/source revision. Trace source separately; do not infer runtime completion from implementation, API success, build or health alone.
2. A flow is `incorrect` when an actual integrated-runtime observation shows a completion-critical step or terminal outcome is `unmet`. Retain noncritical deviations without failing the flow. Static findings alone never establish `incorrect`.
3. A flow is `not_evaluable` when no blocking failure is proven but a critical step, terminal outcome or connected runtime chain lacks evidence. Otherwise it is `correct`. For v2, critical/outcome `met` requires appropriate runtime evidence; the scorer rejects unsupported claims instead of silently downgrading them. Unreached steps are `not_evaluable`, not automatically `unmet`.
4. Treat an Exception Flow as correct when its specified failure handling completes; the primary action need not succeed.
5. For v2 AI audit and LLM re-audit, bounded Docker Compose v2 runtime observation is mandatory for every conclusive result. Direct researcher verdicts remain explicitly attributed and do not fabricate runtime proof. Set scope/time bounds before observation, retain failed attempts, and stop on sufficient evidence, blocker or the bound. Missing daemon, researcher setup failure or ambiguous cause leaves affected behavior `not_evaluable` under the existing blocker record. If an evidenced generated-source defect prevents the whole integrated system from running, reference the canonical blocking defect IDs and score every frozen Flow `execution_blocked`; exact percentages and bounds remain null and coverage is zero. Do not modify source, add mocks, force infrastructure failures outside authorization, create or run tests/test cases.
6. Run `scripts/score_flow_accuracy.py --run-json <run.json> --assessment <input.json> --dry-run`, then repeat without `--dry-run` to persist. Store checksummed, sanitized runtime artifacts and immutable source snapshots/excerpts in the run evidence directory. Preserve `initial`. A subordinate final-stage verification observes every flow on the supplied final source with the same rubric. If source is unchanged and the caller contract permits reuse, preserve the existing assessment's stage, ID and timestamps rather than fabricating another observation.


## Formula

Let `T = main + alternative + exception` and `W = incorrect`.

- Error percentage: `W / T * 100`.
- Accuracy percentage: `(T - W) / T * 100`.

Each flow has equal weight. If an accepted result remains `not_evaluable`, whole-baseline error and accuracy remain null. If system execution is blocked, all flows are `execution_blocked`, exact/evaluated percentages and bounds are null, and coverage is zero. Persist evaluated-only rates, coverage, bounds and pending details in canonical `flow_accuracy.current_summary`; do not create current or follow-up JSON mirrors in `flow-accuracy`. Immutable assessment/evidence files remain. Evaluated rates use correct + incorrect; never change the frozen denominator or present operator verdicts as LLM runtime observations. Audit follow-up cannot overwrite `execution_blocked`.

When invoked as a subordinate, return scoring control and validated outputs to the authorized caller. After a saved follow-up, report the current accepted and pending results and stop. Preserve recorded evidence, runtime rubric and optional UI independence.
