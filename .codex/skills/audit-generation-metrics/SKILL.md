---
name: audit-generation-metrics
description: Assess Business Rule implementation and frozen use-case flow accuracy inside confirmed Audit Gates, preserve first-pass/repair evidence, and validate internal gate telemetry; never score Figma UI or generate tests.
---

# Audit Generation Metrics

Read the approved prompt, frozen Business Rule baseline/resource, active run configuration, current diff and metric rubric.

The repair caller must end its execution timer after correction and permitted evidence collection, before appending this audit. Standalone BR/flow audit is outside generation and workflow execution time; do not start or extend a core timer for audit.

1. Preserve requested and effective model metadata separately; never infer unavailable telemetry.
2. Read the shared timing protocol. Audit-only turns use workflow-only token label `audit`. Audit does not capture generation time or extract live-turn tokens. Internal gate measurement owns canonical `metrics`; preserve that block byte-for-value when saving audit results.
3. Preserve the immutable initial assessment before any repair.
4. Assess every ordered BR exactly once as `met`, `unmet` or `not_evaluable`. Prompt text alone is not evidence; cite inspectable source, configuration, build or bounded runtime evidence.
5. In this same confirmed Audit Gate, invoke `audit-flow-accuracy` for the same UC/run/source revision. Reuse the frozen flow baseline, preserve initial evidence and append the final assessment after repair. Figma/UI accuracy is researcher-managed and must not be calculated or mutated here.
6. Append each repair with its model, affected BR IDs, evidence and references to its captured timing segment IDs/turn IDs. Measure records final token values in `metrics.turns` and links `repair_id` when a turn belongs to one repair. Do not split one turn among multiple repairs or invent per-repair tokens. Reassess affected rules without rewriting the initial snapshot.
7. Validate BR-ID equality, flow identity/totals, timing, tokens and final-source checksum using `scripts/calculate_metrics.py`.
8. Persist canonical JSON without overwriting internal gate telemetry or researcher-managed UI fields. Print one combined BR/flow summary. Do not calculate a Business Rule acceptance percentage or invoke Excel export. After terminal evidence, the Final Metrics Gate internally finalizes workflow totals and refreshes reports.

Do not create/run tests or claim unsupported business correctness.

Flow assessment is an automatic child operation of each confirmed Audit Gate and remains supplementary to the BR baseline. UI/Figma scoring and its Excel cells remain entirely researcher-managed.
