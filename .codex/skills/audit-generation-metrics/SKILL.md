---
name: audit-generation-metrics
description: Record source-based security-requirement results plus generation and repair telemetry, model, time, token, manual, UI, flow and complexity metadata. Use after source generation and every repair; do not generate functional test cases or business-correctness metrics.
---

# Audit Generation Metrics

Read `PROJECT_CONTEXT.md`, `docs/00-context/workflow/ARTIFACT-RETENTION-AND-CONTEXT.md`, the approved use case, parent prompt, active security-resource entries, current code/diff and `references/metric-rubric.md`. For repair, also read the repair contract. Load connected/Figma evidence only when an active requirement needs it. Canonical run JSON is the only required output.

## Record generation and repair evidence

1. Before generation, require a Confirmed configuration plus matching `runs/<RUN-ID>/run-activation.json`. Resolve the complete tuple from the configuration, record it in canonical run JSON and reject mismatches or incomplete requested fields.
2. Before generation, capture the exact output of `codex --version` as `codex_client.pre_generation_version`. After generation, capture effective model ID, snapshot/version and effective reasoning effort only from runtime telemetry when exposed. Keep unknown values `null` with a reason; never infer them from the label or client version.
3. Record the audit model separately from the generation model, even when they are the same. Record each repair iteration's model configuration as well. Flag requested/effective mismatches.
4. Require `timing_method: system_timestamp_delta` and endpoints emitted by `scripts/capture_timestamp.py`: start immediately before the first source mutation and end immediately after first-pass source generation, before build/audit/repair. Derive `duration_seconds = (ended_epoch_ms - started_epoch_ms) / 1000`. Validate that ISO and epoch values describe the same instants within one second and reject negative duration. Never type, estimate or backfill endpoints.
5. Record token usage from model/tool runner telemetry. Use `null` with a reason if unavailable; never infer tokens from characters or words. Preserve requested, effective and observed-post-run data as distinct provenance classes; post-run observations do not backfill unavailable effective telemetry.
6. Score UI accuracy and flow accuracy as supporting metadata only. Mark N/A when the UC has no UI or executable flow evidence.
   For generated FE/BE, enumerate every immutable-UC trigger, transition, backend decision, success postcondition and exception checkpoint. Do not mark a route as satisfying a trigger when the UC requires a visible control on another page. When a UC checkpoint has no Figma component/frame, audit the AI's smallest token-consistent visual inference rather than requiring a UI-mapping approval; require researcher QA only for a material behavioral, authorization, API or schema conflict. Before terminal finalization, require post-generation Docker evidence built from current source for all evaluable checkpoints; an unapplied migration, missing runtime account/precondition or stale image must remain a blocker rather than receiving assumed flow credit. Every post-generation correction is a separately timed/counted repair sub-prompt.
7. Score UC complexity before observing outcome where possible. Capture three manual estimates independently; do not average estimates that have not been supplied by experts.
8. Read `docs/00-context/workflow/gates/SECURITY-POINT-SELECTION-GATE.md`, the persisted selection artifact and the canonical `docs/00-context/security/OWASP-2025-SECURITY-CATALOG.json`. Do not use the researcher-facing Markdown projection as machine input. Verify the active A01–A10 selection mode, IDs and totals match Prompt E; each SR is one point. Reject IDs outside A01–A10 for new runs. Do not add requirements after seeing the generated result.
9. Assign every frozen Prompt E SR exactly one source-based status from `references/metric-rubric.md`: `met`, `unmet`, or `not_evaluable`. Record the SR ID, catalog SEC ID, category, specific source/configuration/build/runtime evidence, and rationale. An applicable `unmet` result is an evidenced repair candidate unless the researcher explicitly accepts the residual risk.
10. A run may be `complete` only when every frozen SR has one assessment row, row/category/overall counts agree, no security result is `null`, the repair loop has terminated, runtime verification has passed, and the final source hash is frozen.

## Audit a repair sub-prompt

Append exactly one `repairs[]` entry per `$bug-fixing-sub-prompt` invocation. Record repair ID/path, category, trigger, error fingerprint, executing model configuration, its dedicated system timestamp endpoint pairs/duration, tokens, affected IDs, revisions, files, before/after evidence and status. Never report only an aggregate repair duration.

Write only `docs/05-experiments/<UC-ID>/<run-id>.json` when generation/repair terminates. Run `scripts/calculate_metrics.py <json>` to verify completeness and arithmetic. Render Markdown only on explicit researcher/reviewer request with `$render-experiment-report`; it is not finalization evidence. Do not create or run tests/test cases.

Do not create a Markdown mirror during generation, audit or repair.
