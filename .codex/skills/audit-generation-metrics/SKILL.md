---
name: audit-generation-metrics
description: Record per-Business-Rule implementation results and generation/repair model, time, token, UI, flow and complexity metadata from inspectable evidence; never generate tests.
---

# Audit Generation Metrics

Read the approved prompt, frozen Business Rule baseline/resource, active run configuration, current diff and metric rubric.

1. Preserve requested and effective model metadata separately; never infer unavailable telemetry.
2. Derive wall-clock duration only from captured ISO/epoch endpoints. Extract token telemetry only from explicit, closed user-turn boundaries using `scripts/extract_session_tokens.py --run-json <run.json> --prompt-turns <ids> --code-turns <ids> --repair-turns <ids> --update`. The extractor must reject the active/open turn and overlapping stage assignments. Use `null` with a reason only when a closed stage has no runner token event.
3. Preserve the immutable initial assessment before any repair.
4. Assess every ordered BR exactly once as `met`, `unmet` or `not_evaluable`. Prompt text alone is not evidence; cite inspectable source, configuration, build or bounded runtime evidence.
5. Store prompt-generation evidence in `prompt-generation-telemetry.json` using `templates/research/prompt-generation-telemetry.template.json`; store first-pass code evidence in `first-pass-generation.json`; store aggregate stage totals in the canonical run JSON. Append each repair with its own model/time/token data and affected BR IDs. Reassess affected rules without rewriting the initial snapshot.
6. Canonical tokens must include `prompt_generation_total`, `code_generation_total`, `repair_total`, `implementation_total`, and `overall_total`; compatibility fields `initial_total` and `total` mirror code generation and implementation respectively. Never calculate an overall total when any required stage is unavailable.
7. Validate BR-ID equality, status totals, timing, tokens and final-source checksum using `scripts/calculate_metrics.py`.
8. Persist the canonical JSON under `docs/05-experiments/`; Markdown is optional and derived.

Do not create/run tests or claim unsupported business correctness.
