---
name: audit-generation-metrics
description: Assess Business Rule implementation and frozen use-case flow accuracy during first-pass audit and automatically within authorized repair, preserve first-pass/repair evidence, and validate internal gate telemetry; never score Figma UI or generate tests.
---

# Audit Generation Metrics

Read the approved prompt, frozen Business Rule baseline/resource, active run configuration, current diff and metric rubric.

The repair caller must end its execution timer after correction and permitted evidence collection, before appending this audit. Standalone BR/flow audit is outside generation and workflow execution time; do not start or extend a core timer for audit.

1. Preserve requested and effective model metadata separately; never infer unavailable telemetry.
2. Read the shared timing protocol. Audit-only turns use workflow-only token label `audit`. Audit does not capture generation time or extract live-turn tokens. Internal gate measurement owns canonical `metrics`; preserve that block byte-for-value when saving audit results.
3. Preserve the immutable initial assessment before any repair.
4. Assess every ordered BR exactly once as `met`, `unmet` or `not_evaluable`. Prompt text alone is not evidence; cite inspectable source, configuration, build or bounded runtime evidence.
5. In this same first-pass audit or authorized repair work turn, invoke `audit-flow-accuracy` for the same UC/run/source revision using the rubric resolved from checksum-pinned configuration. Read its per-flow procedure and schema. Runtime-v2 flow completion requires a connected observation of the integrated runtime; BR source evidence does not imply flow success. Reuse the frozen flow baseline and preserve initial evidence. Before Repair Gate, automatically observe every flow on final source with fresh evidence under the same rubric. When repair is skipped and source remains unchanged, retain the initial flow assessment as the terminal observation, with its original stage/ID/time; preserve equal initial/final BR snapshots and record `repair_skip_reason`. Never fabricate a second observation or request a separate final-audit turn. Missing runtime/branch proof leaves the affected flow unknown unless a blocking defect is proven. Figma/UI accuracy is researcher-managed and must not be calculated or mutated here.
6. Append each repair with its model, affected BR IDs, evidence and references to its captured timing segment IDs/turn IDs. Measure records final token values in `metrics.turns` and links `repair_id` when a turn belongs to one repair. Do not split one turn among multiple repairs or invent per-repair tokens. Reassess affected rules without rewriting the initial snapshot.
7. Validate BR-ID equality, flow identity/totals, timing, tokens and final-source checksum using `scripts/calculate_metrics.py`.
8. Persist canonical JSON without overwriting internal gate telemetry or researcher-managed UI fields. Print one combined BR/flow summary. Do not calculate a Business Rule acceptance percentage or invoke Excel export. Before returning from terminal work, freeze `business_rules.source_revision` and persist the evidence-backed terminal run status. After phase closure, Final Metrics or explicit `finalize-workflow` can finalize totals immediately.

Do not create/run tests or claim unsupported business correctness.

When flow results are partial, preserve all measured fields and immediately display pending details and both choices from `audit-flow-accuracy/references/follow-up-measurement.md`. Researcher-provided results are entered by the LLM without requiring additional evidence; continued LLM measurement retains the configured evidence requirements. Both paths are flow-only evaluation: never modify application source, BRs, telemetry or repair authorization while resolving missing measurements. Report `current_summary.result_basis` explicitly; original assessments remain immutable.

Flow assessment is an automatic child operation of first-pass audit and authorized repair verification and remains supplementary to the BR baseline. UI/Figma scoring and its Excel cells remain entirely researcher-managed.

Report canonical `flow_accuracy.current_summary` using `accepted-audit-results-v1`: a repair/source change or later inconclusive audit does not erase an accepted verdict. New conclusive audit results update it per flow. Keep final-source assessment validation and limitations separate from accepted experiment results, with actual source provenance. Both follow-up paths save directly to canonical JSON; never reset its percentages from the latest raw assessment after the flow scorer returns.

Report the flow schema/rubric alongside results. `calculate_metrics.py` accepts legacy v1 and runtime-v2, revalidates v2 evidence/links/scores, and rejects mixed initial/final methods. Do not relabel historical scores or combine unlike rubrics in a comparison. Audit never authorizes repairs; first-pass defects go to Repair Decision Gate. During authorized repair, return findings to the repair caller within its existing scope. Audit/runtime contributes no generation execution seconds.
