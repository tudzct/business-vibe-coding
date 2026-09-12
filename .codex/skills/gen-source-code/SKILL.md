---
name: gen-source-code
description: Implement source from an approved Full Prompt A-F or RQ3 Prompt A-D, preserve first-pass evidence, assess every frozen Business Rule and perform bounded repairs; never create or run tests.
---

# Generate Source Code

Accept one approved prompt path (`*-business-coding-prompt.md` or `*-rq3-coding-prompt.md`). Resolve its frozen UC, Business Rule resource/baseline, experiment configuration and run activation; reject mismatches or unresolved blockers.

Read the [shared execution timing protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md). Require closed `prompt_generation` telemetry. Finish source preflight, approvals and activation before the timer. Capture `source_generation` START immediately before the first source mutation; capture END immediately after complete first-pass source generation, before build/audit/runtime/repair. End before any new blocker resolution or researcher wait; resume with a fresh segment only for actual implementation. Tokens follow actual primary work under selection-schema.md: config/approval-only, dataset-only and audit/runtime-only turns remain workflow-only; actual failed source attempts remain chargeable. Final tokens require a later researcher Measure turn.

1. Before source mutation, validate one Confirmed run and capture model/version/time metadata.
2. Read `docs/00-context/engineering/TECHNICAL-STACK-RULES.md`, inspect the target manifests/lockfiles and existing `finalsource/` baseline, then map prompt contents (Prompt A-F for Full, or Prompt A-D for RQ3) and change areas to the smallest required diff.
**GLOBAL OVERRIDE (FLEXIBLE CUMULATIVE MODE)**: Explicitly PERMIT cumulative source generation for ALL Use Cases, in any order (e.g., generating UC-02 on top of UC-01, or any UC on top of another). Bypass ALL clean baseline identity checks and "separate comparison group" restrictions. Never abort or prompt for restoration due to existing source code; simply generate the requested UC directly on top of the current source state. Read BR entries only after first-pass generation stops, for audit.
3. After resolving required permissions and inputs, capture START immediately before the first source mutation. Invoke `build-nest-backend` and/or `build-react-frontend`; each stack skill loads only the references required by those change areas. Require researcher approval before an unapproved schema, public API, ownership or destructive change.
4. Stop the first-pass generation segment immediately after generating source. Preserve immutable first-pass source/hash/diff evidence and raw timestamps; token fields remain pending until post-turn Measure.
5. **Full and RQ3 Hold Gate**: End the first-generation turn for both Prompt A-F and RQ3 Prompt A-D. Report first-pass artifact/evidence and any known blockers. Do not initiate repair sub-prompts, automatic corrections, a separate audit, or Measure in this turn. The researcher next invokes Measure to close `source_generation`.
6. In a later audit turn after source measurement, run permitted non-test lint/typecheck/build checks and authorized Docker observations against the preserved first-pass source. Invoke `audit-generation-metrics` to record exactly one evidenced result per frozen BR. Both Full and RQ3 retain the identical BR baseline. These separate audit/runtime turns contribute tokens only to workflow, not generation/workflow execution time, regardless of an open core phase.
7. Stop again after first-pass assessment. Require explicit researcher authorization before any repair, recorded with its real approval turn ID after the source measurement. A measurement request is not repair authorization. RQ3 Sub-prompt-off may finish without repair with an explicit decision.
8. For authorized repairs, invoke `bug-fixing-sub-prompt` for one smallest correction per evidenced defect and reassess affected BRs. Do not combine unrelated repairs.
9. Freeze the final source hash only when required evidence is terminal; otherwise retain an explicit blocked/repair-required state.

Do not create or run tests or test cases.
