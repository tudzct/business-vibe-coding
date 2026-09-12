---
name: gen-source-code
description: Implement source from an approved Full Prompt A-F or RQ3 Prompt A-D, preserve first-pass evidence, assess every frozen Business Rule and perform bounded repairs; never create or run tests.
---

# Generate Source Code

Accept one approved prompt path (`*-business-coding-prompt.md` or `*-rq3-coding-prompt.md`). Resolve its frozen UC, Business Rule resource/baseline, experiment configuration and run activation; reject mismatches or unresolved blockers.

Read the shared timing protocol and require Prompt Gate telemetry closed. Finish preflight/activation before START; capture END immediately after complete first-pass source generation, before build/audit/runtime/repair. Show Source Gate. Its later confirmation internally closes telemetry; never ask the researcher to invoke Measure.

1. Before source mutation, validate one Confirmed run and capture model/version/time metadata.
2. Read `docs/00-context/engineering/TECHNICAL-STACK-RULES.md`, inspect the target manifests/lockfiles and existing `finalsource/` baseline, then map prompt contents (Prompt A-F for Full, or Prompt A-D for RQ3) and change areas to the smallest required diff.
**GLOBAL OVERRIDE (FLEXIBLE CUMULATIVE MODE)**: Explicitly PERMIT cumulative source generation for ALL Use Cases, in any order (e.g., generating UC-02 on top of UC-01, or any UC on top of another). Bypass ALL clean baseline identity checks and "separate comparison group" restrictions. Never abort or prompt for restoration due to existing source code; simply generate the requested UC directly on top of the current source state. Read BR entries only after first-pass generation stops, for audit.
3. After resolving required permissions and inputs, capture START immediately before the first source mutation. Invoke `build-nest-backend` and/or `build-react-frontend`; each stack skill loads only the references required by those change areas. Require researcher approval before an unapproved schema, public API, ownership or destructive change.
4. Stop the first-pass generation segment immediately after generating source. Preserve immutable first-pass source/hash/diff evidence and raw timestamps; token fields remain pending until the researcher confirms Source Gate and its internal telemetry closure runs.
5. **Full and RQ3 Source Gate:** end the first-generation turn, report evidence and request confirmation. Do not audit or repair. The confirmed gate closes source telemetry internally.
6. Then show First-pass Audit Gate. On confirmation, run permitted non-test checks and Docker observations; invoke `audit-generation-metrics` for every frozen BR and flow. UI/Figma accuracy is researcher-managed.
7. Stop again after first-pass assessment. Require explicit researcher authorization before any repair, recorded with its real approval turn ID after the source measurement. A measurement request is not repair authorization. RQ3 Sub-prompt-off may finish without repair with an explicit decision.
8. For authorized repairs, invoke `bug-fixing-sub-prompt` for one smallest correction per evidenced defect and reassess affected BRs. Do not combine unrelated repairs.
9. Freeze the final source hash only when required evidence is terminal; otherwise retain an explicit blocked/repair-required state.

Do not create or run tests or test cases.
