---
name: audit-generation-metrics
description: Record per-Business-Rule implementation results and generation/repair model, time, token, UI, flow and complexity metadata from inspectable evidence; never generate tests.
---

# Audit Generation Metrics

Read the approved prompt, frozen Business Rule baseline/resource, active run configuration, current diff and metric rubric.

1. Preserve requested and effective model metadata separately; never infer unavailable telemetry.
2. Derive wall-clock duration only from captured ISO/epoch endpoints. Extract runner token telemetry using `scripts/extract_session_tokens.py --run-json <run.json> --update` from the session log; use `null` with a reason only when runner telemetry is strictly unavailable.
3. Preserve the immutable initial assessment before any repair.
4. Assess every ordered BR exactly once as `met`, `unmet` or `not_evaluable`. Prompt text alone is not evidence; cite inspectable source, configuration, build or bounded runtime evidence.
5. Append each repair with its own model/time/token data and affected BR IDs. Reassess affected rules without rewriting the initial snapshot.
6. Validate BR-ID equality, status totals, timing, tokens and final-source checksum using `scripts/calculate_metrics.py`.
7. Persist the canonical JSON under `docs/05-experiments/`; Markdown is optional and derived.

Do not create/run tests or claim unsupported business correctness.
