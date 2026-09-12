---
name: audit-flow-accuracy
description: Audit frozen Basic, Alternative and Exception Flow completion, compute evidence-backed flow error/accuracy percentages, and preserve immutable initial/final results. Use internally from confirmed Audit Gates; never generate tests or authorize repairs.
---

# Audit Flow Accuracy

Score whole behavioral paths, not individual steps. This is supplementary evidence and never changes the Business Rule baseline or BR result.

Read the frozen UC, canonical run and [assessment schema](references/assessment-schema.md). Require `docs/02-construction/implementation/<UC-ID>/flow-baseline.json`, frozen from the same UC checksum before source generation. Never reconstruct its denominator after seeing implementation results.

## Baseline

1. Include every explicit Basic/Main Flow and each named Alternative and Exception Flow in source order. Include explicit nested UI-variant flows; an “identical to” reference does not duplicate a flow.
2. Do not count triggers, conditions, postconditions, Business Rules, steps, UI states or API operations as additional flows.
3. Preserve every step. Mark `completion_critical: true` only when failure prevents the branch-specific terminal outcome or a mandatory completion state. Record why and stop for researcher resolution when material ambiguity remains.
4. Freeze UC path/checksum, ordered flow IDs, counts, branch points, steps and terminal outcomes. Validate it with `scripts/validate_flow_baseline.py`. Initial and final audit must use this exact baseline.

## Audit

1. For each step and terminal outcome assign `met`, `unmet` or `not_evaluable` with inspectable source/config/build/runtime evidence. Prompt text is not evidence.
2. A flow is `incorrect` when a completion-critical step is `unmet` or its terminal outcome is `unmet`. Retain noncritical deviations without failing the flow.
3. A flow is `not_evaluable` when no blocking failure is proven but a critical step or terminal outcome lacks evidence. Otherwise it is `correct`.
4. Treat an Exception Flow as correct when its specified failure handling completes; the primary business action need not succeed.
5. Prefer bounded Docker runtime observation for end-to-end completion. Do not create or run tests or test cases.
6. Run `scripts/score_flow_accuracy.py` with `--dry-run`, then persist. Preserve the immutable `initial` assessment and append `final` after authorized repairs.

## Formula

Let `T = main + alternative + exception` and `W = incorrect`.

- Error percentage: `W / T * 100`.
- Accuracy percentage: `(T - W) / T * 100`.

Each flow has equal weight regardless of step count. If any flow is `not_evaluable`, canonical error and accuracy remain null; report evaluated coverage and lower/upper accuracy bounds. Never remove unknown flows from the denominator or count missing evidence as success.

Run this skill automatically when the researcher confirms First-pass Audit Gate or Final Audit Gate. Return control to `audit-generation-metrics`. Do not ask the researcher to invoke this skill, mutate source, authorize repair, close telemetry or export Excel.
