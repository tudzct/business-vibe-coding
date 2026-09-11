---
name: audit-generation-metrics
description: Assess Business Rule implementation and repair evidence, preserve first-pass results and validate finalized measurements supplied by Measure; never extract live-turn tokens or generate tests.
---

# Audit Generation Metrics

Read the approved prompt, frozen Business Rule baseline/resource, active run configuration, current diff and metric rubric.

When called inside a repair work segment, reuse the caller's timer; never nest/overlap captures. A separate audit after phase closure captures its own auxiliary segment.

1. Preserve requested and effective model metadata separately; never infer unavailable telemetry.
2. Read the shared [phase/timestamp protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md). Capture start/end work segments under the currently open core phase, or `audit` if no core phase is open. Never extract live-turn tokens. Measure alone reads rollout telemetry and updates canonical `metrics` in a later researcher-requested turn. Preserve that block byte-for-value when saving BR results; absence of metrics before measurement is pending, not zero.
3. Preserve the immutable initial assessment before any repair.
4. Assess every ordered BR exactly once as `met`, `unmet` or `not_evaluable`. Prompt text alone is not evidence; cite inspectable source, configuration, build or bounded runtime evidence.
5. Append each repair with its model, affected BR IDs, evidence and references to its captured timing segment IDs/turn IDs. Measure records final token values in `metrics.turns` and links `repair_id` when a turn belongs to one repair. Do not split one turn among multiple repairs or invent per-repair tokens. Reassess affected rules without rewriting the initial snapshot.
6. Validate BR-ID equality, status totals, timing, tokens and final-source checksum using `scripts/calculate_metrics.py`.
7. Persist the canonical JSON under `docs/05-experiments/` without overwriting Measure fields. Work may reach terminal `run_status` before final post-run telemetry exists; distinguish completed source/evidence from `metrics.status=finalized`. The researcher then invokes Measure to finalize workflow totals and refresh derived reports; do not add a new Audit turn merely to save token/time.

Do not create/run tests or claim unsupported business correctness.

For researcher-requested Figma UI percentages, use `audit-figma-ui-accuracy` and preserve its `ui_accuracy`, `ui_accuracy_status` and `ui_accuracy_percent` fields when saving BR results. UI is supplementary and does not alter the BR baseline. Excel filling belongs to `export-experiment-excel`, which reads existing results without measuring or auditing again. Do not automatically add flow scoring.
