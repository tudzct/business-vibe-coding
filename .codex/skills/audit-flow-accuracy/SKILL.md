---
name: audit-flow-accuracy
description: Audit frozen use-case flows and update canonical experiment results directly from researcher verdicts or LLM re-audits, retaining accepted results across repair. Preserve evidence; never change application source, generate tests or authorize repairs.
---

# Audit Flow Accuracy

Score whole behavioral paths, not individual steps. This is supplementary evidence and never changes the Business Rule baseline or BR result.

For partial results or researcher/LLM follow-up measurement, read [follow-up measurement](references/follow-up-measurement.md). Always save measured flow results, report missing parts immediately and offer both paths for the researcher to choose. Researcher supplies results only; the LLM records them and recalculates JSON. Evaluation never edits application source. After either follow-up is saved, return to the coordinator for [automatic continuation](../../../docs/00-context/workflow/gates/FLOW-FOLLOWUP-AUTO-REPAIR.md): it records the standing policy decision and begins evidenced repair in the same work turn without another confirmation. The scorer itself never authorizes or performs repair.

The final reported flow result is the latest conclusive accepted verdict per flow across the experiment (`accepted-audit-results-v1`). Both researcher replies and validated LLM re-audits update canonical JSON in the same turn, without another save confirmation. Repair, changed source hashes and later `not_evaluable` attempts do not erase accepted results. A newer conclusive result can replace an older verdict. Retain actual stage/source provenance per result and show later audit limitations separately. See the follow-up contract for schema 2, stdin input and corrections to already scored flows.

Before assessing, read the frozen UC, canonical run, [per-flow audit procedure](references/per-flow-audit.md) and [assessment schema](references/assessment-schema.md). Resolve the rubric from the checksum-pinned configuration through run activation. New schema-2.3 configurations use `completion-critical-flow-runtime-v2`: `correct` requires observed completion through the integrated runtime. Legacy v1 evidence remains under its original rubric. Require `docs/02-construction/implementation/<UC-ID>/flow-baseline.json`, frozen from the same UC checksum before generation. Never reconstruct its denominator after seeing implementation results.

## Baseline

1. Include every explicit Basic/Main Flow and each named Alternative and Exception Flow in source order. Include explicit nested UI-variant flows; an “identical to” reference does not duplicate a flow.
2. Do not count triggers, conditions, postconditions, Business Rules, steps, UI states or API operations as additional flows.
3. Preserve every step. Mark `completion_critical: true` only when failure prevents the branch-specific terminal outcome or a mandatory completion state. Record why and stop for researcher resolution when material ambiguity remains.
4. Freeze UC path/checksum, ordered flow IDs, counts, branch points, steps and terminal outcomes. Validate it with `scripts/validate_flow_baseline.py`. Initial and final audit must use this exact baseline.

## Audit (runtime-v2)

1. Follow the per-flow procedure from specified entry through the actual branch to its frozen terminal outcome. Use the UI for UI-entry flows. Keep each attempt's actions and sanitized evidence under its own observation ID, bound to UC/run/stage/baseline/source revision. Trace source separately; do not infer runtime completion from implementation, API success, build or health alone.
2. A flow is `incorrect` when a completion-critical step is `unmet` or its terminal outcome is `unmet`. Retain noncritical deviations without failing the flow.
3. A flow is `not_evaluable` when no blocking failure is proven but a critical step, terminal outcome or connected runtime chain lacks evidence. Otherwise it is `correct`. For v2, critical/outcome `met` requires appropriate runtime evidence; the scorer rejects unsupported claims instead of silently downgrading them. Unreached steps are `not_evaluable`, not automatically `unmet`.
4. Treat an Exception Flow as correct when its specified failure handling completes; the primary business action need not succeed.
5. For v2, bounded Docker Compose v2 runtime observation is mandatory for `correct`. Set scope/time bounds before observation, retain failed attempts, and stop on sufficient evidence, blocker or the bound. Missing daemon is runtime `BLOCKED`; unverifiable deployment or inaccessible branches leave affected behavior `not_evaluable`. Do not modify source, add mocks, force infrastructure failures outside authorization, create or run tests/test cases.
6. Run `scripts/score_flow_accuracy.py --run-json <run.json> --assessment <input.json> --dry-run`, then repeat without `--dry-run` to persist. Store checksummed, sanitized runtime artifacts and immutable source snapshots/excerpts in the run evidence directory. Preserve `initial`; before the repair work response ends, observe every flow on repaired final source with the same rubric. If no repair occurred and source is unchanged, the existing initial assessment may serve as terminal evidence without a new assessment. Preserve its stage, ID and timestamps; never copy it into a fabricated final observation.

For a configured legacy v1 run, retain the original evidence standard: inspectable source/config/build/runtime evidence can support step/outcome decisions; critical/outcome failure makes the flow incorrect, critical/outcome unknown makes it not evaluable, and otherwise it is correct. Runtime was preferred rather than mandatory under v1. Read and display that rubric explicitly; never silently upgrade historical evidence or apply v1 to a schema-2.3 run.

## Formula

Let `T = main + alternative + exception` and `W = incorrect`.

- Error percentage: `W / T * 100`.
- Accuracy percentage: `(T - W) / T * 100`.

Each flow has equal weight. If an accepted result remains `not_evaluable`, whole-baseline error and accuracy remain null. Persist evaluated-only rates, coverage, bounds and pending details in canonical `flow_accuracy.current_summary`; do not create current or follow-up JSON mirrors in `flow-accuracy`. Immutable assessment/evidence files remain. Evaluated rates use correct + incorrect; never change the frozen denominator or present researcher verdicts as LLM runtime observations.

Run this skill automatically during confirmed First-pass Audit Gate and from `audit-generation-metrics` within authorized repair work. No separate final-audit gate or researcher invocation is required. Return ordinary assessment control to `audit-generation-metrics`; after a saved follow-up, return to the workflow coordinator for automatic continuation under the linked policy. Do not ask the researcher to invoke this skill, authorize the follow-up repair again, close telemetry or export Excel from this evaluation operation.
