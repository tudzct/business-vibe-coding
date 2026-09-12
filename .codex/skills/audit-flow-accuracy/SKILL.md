---
name: audit-flow-accuracy
description: Audit frozen Basic, Alternative and Exception Flow completion, compute evidence-backed flow error/accuracy percentages, and preserve immutable initial/final results. Use internally from confirmed Audit Gates; never generate tests or authorize repairs.
---

# Audit Flow Accuracy

Score whole behavioral paths, not individual steps. This is supplementary evidence and never changes the Business Rule baseline or BR result.

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
6. Run `scripts/score_flow_accuracy.py --run-json <run.json> --assessment <input.json> --dry-run`, then repeat without `--dry-run` to persist. Store checksummed, sanitized runtime artifacts and immutable source snapshots/excerpts in the run evidence directory. Preserve `initial`; at Final Audit Gate observe every flow again on final source with the same rubric, even after skipped repair. Never copy initial observations into final.

For a configured legacy v1 run, retain the original evidence standard: inspectable source/config/build/runtime evidence can support step/outcome decisions; critical/outcome failure makes the flow incorrect, critical/outcome unknown makes it not evaluable, and otherwise it is correct. Runtime was preferred rather than mandatory under v1. Read and display that rubric explicitly; never silently upgrade historical evidence or apply v1 to a schema-2.3 run.

## Formula

Let `T = main + alternative + exception` and `W = incorrect`.

- Error percentage: `W / T * 100`.
- Accuracy percentage: `(T - W) / T * 100`.

Each flow has equal weight regardless of step count. If any flow is `not_evaluable`, canonical error and accuracy remain null; report evaluated coverage and lower/upper accuracy bounds. Never remove unknown flows from the denominator or count missing evidence as success.

Run this skill automatically when the researcher confirms First-pass Audit Gate or Final Audit Gate. Return control to `audit-generation-metrics`. Do not ask the researcher to invoke this skill, mutate source, authorize repair, close telemetry or export Excel.
