---
name: gen-source-code
description: Implement source code directly from a generated security-coding-prompt Markdown file, automatically resolving its use case, security resource and project context. Use when the user provides or names a prompt artifact such as UC-001-security-coding-prompt.md and wants implementation without pasting prompt content into chat; perform mandatory audit and do not generate test cases.
---

# Implement From Security Coding Prompt File

Accept a security-coding-prompt path as the only required input, for example:

`$gen-source-code docs/02-construction/coding-prompts/UC-001-security-coding-prompt.md`

Do not ask the user to paste prompt content into chat when the artifact is readable.

## Resolve artifact bundle

1. Resolve the path relative to the repository root. If only a filename or UC ID is supplied, search `docs/02-construction/coding-prompts/` for one unambiguous canonical artifact.
2. Read the complete prompt and metadata. Resolve the source UC, configuration, compact security activation receipt and only referenced security-resource entries. Read the project/technical/gate rules and implementation references, but load connected-source details only when the prompt uses them. Reject mismatches.
3. Reject a prompt that is Draft, lacks Prompt E/F, contains unresolved blocking decisions, points outside this repository unexpectedly, or cannot trace AC/BR/SR IDs to source artifacts.
4. Treat files as the source of truth; do not depend on earlier chat context.

## Implement

1. Enforce logical gate 2 before `codex --version`, timing or source edits. Require `runs/<RUN-ID>/run-activation.json`, validate its configuration checksum, and resolve the full assignment directly from the Confirmed configuration. Stop for confirmation if missing or invalid.
2. Inspect the existing `finalsource/fe` and `finalsource/be` baseline. Record its revision/hash, freeze the Prompt E SR list, and map AC/BR/SR IDs to the smallest feature-level diff. A new model variant must start from the same clean source and approved artifact baseline, never from another model's generated output. Do not scaffold or replace the application root.
   For Figma-backed frontend work, require an exact checksum-valid dataset reference. Create detailed UI mapping only for an inference, mismatch, omission dispute or reviewer request; it is never a gate. Record ordinary coverage and similarity in canonical run JSON.
3. Immediately before the first source mutation, run `.codex/skills/audit-generation-metrics/scripts/capture_timestamp.py` and retain its timezone-qualified ISO-8601 and Unix epoch-millisecond output. Immediately after the complete first-pass source generation and before build, audit or repair, run it again for the end fields. Set `timing_method: system_timestamp_delta` and derive `duration_seconds = (ended_epoch_ms - started_epoch_ms) / 1000`; never type, estimate or backfill either endpoint. Reject a negative duration. This wall-clock method is the canonical research timer because tool calls may use different processes.
4. For Figma-backed frontend work, load `resolve-figma-design-dataset` and require a checksum-valid `ready` snapshot before editing. Load `figma:figma-design-to-code` and retrieve the live node only to create or refresh a missing dataset version. Use Google Drive/Sheets to re-read linked specifications when required by provenance.
5. Invoke `$build-secure-nest-backend` and/or `$build-secure-react-frontend`; extend the existing source only under `finalsource/`. Reuse bootstrap, router/shell, HTTP client, config, database, validation, filters, interceptors and Docker runtime. Add a dependency or change a platform/Docker file only when the approved prompt requires it and record the reason.
6. After the first-pass timer stops, read effective model ID/snapshot, effective reasoning effort and input/output token telemetry from the generation runner when exposed. Only these effective/telemetry fields may be `null` with a reason. Keep `requested`, `effective` and `observed_post_run` fields separate; a post-run observation must never backfill an unknown effective value.
7. Do not create or run tests/test cases. Run permitted non-test build/lint checks, then require a post-generation Docker runtime smoke verification for every affected FE/BE after initial metrics are persisted. Obtain/confirm researcher authorization through `$docker-deployment run`, rebuild images from the current source, start the stack, and separately verify containers running, healthchecks passing, UI/API reachability, and the UC's approved trigger/main/success/exception checkpoints. Do not accept a container/image created before source generation as runtime evidence.
8. Invoke `$audit-generation-metrics` immediately to persist generation telemetry, assess every frozen Prompt E SR from inspectable source/configuration/build/runtime evidence, and identify evidenced repairs. Audit only the UC-specific diff as generated output; baseline code is context/evidence, not generated output for the UC.
9. Only after the first-pass audit is persisted, invoke `$bug-fixing-sub-prompt` once for each evidenced error iteration. That skill creates the artifact, applies one bounded repair, reruns permitted evidence and invokes audit again. Do not repair before first-pass capture or combine unrelated errors to reduce the measured sub-prompt count.
10. End the generation pipeline only when every frozen SR has one source-based assessment, the repair loop is clear, and the required post-generation Docker runtime verification passes. A missing assessment or deployment authorization, unavailable Docker environment, unapplied required migration, absent safe runtime prerequisite, stale image, unreachable UI/API, or unevidenced UC checkpoint leaves the run non-terminal (`blocked` or `repair_required`), not complete-with-limitations. Freeze and record the final source hash only after runtime verification.
    If runtime/source review discovers an omitted UC checkpoint or visible Figma node, treat it as an evidenced defect and execute a new `$bug-fixing-sub-prompt` without a separate UI-mapping approval. It counts as one additional repair invocation; do not silently patch it inside deployment troubleshooting. Stop for researcher QA only if the correction changes behavior, authorization, API, schema or accepted risk.
11. Return changed-file paths, audit path, final source hash, source-based SR result summary, generation/repair evidence summary and blockers. Do not paste the full input prompt into chat.
