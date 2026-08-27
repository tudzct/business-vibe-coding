# Metric rubric

## Model configuration

Treat model choice as an independent variable. Validate `run-activation.json`, then resolve the complete assignment directly from its Confirmed configuration. Requested fields must never be missing, inferred or `null`; unavailable effective fields require a reason. Record generation, audit and each repair model independently. Start every variant from the same approved prompt and clean baseline.

## Atomic security requirements

Read only the canonical machine catalog at `docs/00-context/security/OWASP-2025-SECURITY-CATALOG.json` for SEC data. `OWASP-2025-SECURITY-SCORING.md` is a researcher-facing projection and must not be parsed as catalog input. New runs cover A01:2025 through A10:2025. The approved pre-generation SR list is the frozen denominator.

- Each selected SR is one point; no weights or partial points.
- Met: the final repaired source has complete, mutually consistent code/configuration/build/runtime evidence for the SR's applicable condition.
- Unmet: the final repaired source has missing, partial or contradictory implementation for an applicable SR. This is an omitted security requirement.
- Not evaluable: the SR is not applicable to the UC behavior, or the permitted generation evidence is insufficient for a defensible met/unmet decision. Record the specific applicability or evidence limitation.
- Determine `met`, `unmet`, and `not_evaluable` only from Prompt E traceability and inspectable source/configuration/build/runtime evidence.
- Record one row per frozen SR with `sr_id`, `sec_id`, `category`, `status`, non-empty `evidence`, and non-empty `rationale`. Evidence must identify inspectable paths, configuration/build observations, or bounded runtime checkpoints rather than restating prompt text.
- Finalize generation metrics only when all SR rows and category/overall totals agree at the terminal repair state and the final source hash is recorded.

## UI accuracy

Use the frozen dataset as the complete visual contract and any autonomous reconstruction record only as traceability. Require 100% structural coverage for every visible node/group, then score weighted inspected checkpoints: visible elements 20%, hierarchy/layout 25%, spacing/dimensions 15%, typography/colors/assets 15%, interaction states 15%, responsive behavior 10%. Runtime screenshots must use the natural reference viewport and UC-required states and, when the environment is deterministic, report perceptual similarity with mandatory target `>= 0.90` separately from the weighted score. A miss is a repair-required defect, not a researcher mapping question. Do not award a final UI score from source inspection alone or hide font/browser/antialiasing limitations. Use N/A only without a referenced design.

## Flow accuracy

Enumerate approved flow checkpoints across trigger, client transition, request, backend decision, persistence, response, UI result and exceptions. `accuracy = satisfied checkpoints / evaluable checkpoints * 100`. Report non-evaluable checkpoints.

## UC complexity

Score before implementation:

- Actors/roles: 0 one, 1 two, 2 three or more.
- Main-flow steps: 0 for 1-4, 1 for 5-8, 2 for 9+.
- Alternate/exception flows: 0 none, 1 one-two, 2 three+.
- Data/entities: 0 read/no persistence, 1 one entity write, 2 multi-entity/transaction.
- Integrations: 0 none, 1 one internal/external boundary, 2 multiple/async.
- Security sensitivity: 0 public low-risk, 1 authenticated/personal data, 2 auth/authorization/financial/secrets.
- UI states: 0 no UI/simple, 1 form/list, 2 complex visualization/responsive multi-state.

Total 0-4 = Low, 5-9 = Medium, 10-14 = High. Preserve component scores and rationale.

## Time, tokens and manual baseline

Use automatically captured system timestamps with timezone-qualified ISO-8601 and Unix epoch milliseconds. Store raw endpoints and derive seconds by epoch subtraction for first-pass and every repair. This `system_timestamp_delta` wall-clock method is canonical; do not label it monotonic. Tokens must come from telemetry with input/output separated. Whole-UC tokens equal initial plus every sub-prompt. Obtain three expert estimates independently in minutes with assumptions; report median as primary and mean only as supplementary.
