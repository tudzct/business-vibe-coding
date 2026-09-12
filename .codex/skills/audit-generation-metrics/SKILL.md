---
name: audit-generation-metrics
description: Assess Business Rule implementation and Figma UI accuracy in one audit workflow, preserve first-pass/repair evidence and validate finalized measurements supplied by Measure; never extract live-turn tokens or generate tests.
---

# Audit Generation Metrics

Read the approved prompt, frozen Business Rule baseline/resource, active run configuration, current diff and metric rubric.

The repair caller must end its execution timer after correction and permitted evidence collection, before appending this audit. Standalone BR/UI audit is outside generation and workflow execution time; do not start or extend a core timer for audit.

1. Preserve requested and effective model metadata separately; never infer unavailable telemetry.
2. Read the [shared execution timing protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md). Audit-only turns use workflow-only token label `audit`; mixed turns retain their actual primary token label under selection-schema.md. Audit does not capture generation time or extract live-turn tokens. Measure alone reads completed rollout telemetry and writes canonical `metrics` in a later researcher-requested turn. Preserve that block byte-for-value when saving BR results; absent metrics are pending, not zero.
3. Preserve the immutable initial assessment before any repair.
4. Assess every ordered BR exactly once as `met`, `unmet` or `not_evaluable`. Prompt text alone is not evidence; cite inspectable source, configuration, build or bounded runtime evidence.
5. In this same Audit turn, always invoke `audit-figma-ui-accuracy` for the same UC/run and source revision. Resolve the configuration-pinned frozen dataset and run its deterministic scorer before the final Audit calculator. For a verified `no-design` mapping, persist `not_applicable`; for blocked/incomplete runtime or screenshot evidence, persist `not_evaluable`. Never omit UI merely because a numeric score cannot be produced. Reuse an identical current assessment idempotently; after source repair, append a `final` assessment without replacing the immutable `initial` assessment.
6. Append each repair with its model, affected BR IDs, evidence and references to its captured timing segment IDs/turn IDs. Measure records final token values in `metrics.turns` and links `repair_id` when a turn belongs to one repair. Do not split one turn among multiple repairs or invent per-repair tokens. Reassess affected rules without rewriting the initial snapshot.
7. Validate BR-ID equality, status totals, UI assessment identity/totals, timing, tokens and final-source checksum using `scripts/calculate_metrics.py`. The calculator must fail closed for a schema-v1 run whose UI assessment is absent.
8. Persist the canonical JSON under `docs/05-experiments/` without overwriting Measure fields. Print one combined researcher summary containing BR total/met/unmet/not-evaluable counts and UI checkpoint total/met/unmet/not-evaluable, weighted UI accuracy, structural coverage and perceptual similarity. Do not calculate or persist a Business Rule acceptance percentage. These values are for the researcher to copy manually; do not invoke Excel export from Audit. Work may reach terminal `run_status` before final post-run telemetry exists; distinguish completed source/evidence from `metrics.status=finalized`. The researcher then invokes Measure to finalize workflow totals and refresh derived reports; do not add a new Audit turn merely to save token/time.

Do not create/run tests or claim unsupported business correctness.

Figma UI assessment is an automatic child operation of every Audit invocation, not a second researcher command. It remains supplementary and does not alter the BR baseline. Excel filling is a separate final `export-experiment-excel` command; neither Audit nor Measure invokes it. Audit leaves BR/UI Excel cells for manual researcher entry. Do not automatically add flow scoring.
