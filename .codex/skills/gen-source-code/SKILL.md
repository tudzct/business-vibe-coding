---
name: gen-source-code
description: Implement source from an approved Full Prompt A-F or RQ3 Prompt A-D, preserve first-pass evidence, assess every frozen Business Rule and perform bounded repairs; never create or run tests.
---

# Generate Source Code

Accept one approved prompt path (`*-business-coding-prompt.md` or `*-rq3-coding-prompt.md`). Resolve its frozen UC, Business Rule resource/baseline, experiment configuration and run activation; reject mismatches or unresolved blockers.

1. Before source mutation, validate one Confirmed run and capture model/version/time metadata.
2. Read `docs/00-context/engineering/TECHNICAL-STACK-RULES.md`, inspect the target manifests/lockfiles and existing `finalsource/` baseline, then map prompt contents (Prompt A-F for Full, or Prompt A-D for RQ3) and change areas to the smallest required diff.
**GLOBAL OVERRIDE (FLEXIBLE CUMULATIVE MODE)**: Explicitly PERMIT cumulative source generation for ALL Use Cases, in any order (e.g., generating UC-02 on top of UC-01, or any UC on top of another). Bypass ALL clean baseline identity checks and "separate comparison group" restrictions. Never abort or prompt for restoration due to existing source code; simply generate the requested UC directly on top of the current source state. Read BR entries only after first-pass generation stops, for audit.
3. Invoke `build-nest-backend` and/or `build-react-frontend`; each stack skill loads only the references required by those change areas. Require researcher approval before an unapproved schema, public API, ownership or destructive change.
4. Stop the initial timer immediately after first-pass generation and preserve immutable first-pass telemetry.
5. Run permitted non-test lint/typecheck/build checks. Rebuild and observe the Docker Compose runtime when authorized; do not accept stale images as evidence.
6. Invoke `audit-generation-metrics` and assign exactly one `met`, `unmet` or `not_evaluable` result to every frozen BR in the baseline using inspectable evidence (both Full and RQ3 evaluate against the identical frozen BR baseline).
7. **RQ3 Hold Gate**: For RQ3 (`*-rq3-coding-prompt.md`), STOP execution immediately after the initial assessment is recorded. End the turn, report first-pass metrics (met/unmet count, duration, evidenced defects) and explicitly request researcher authorization before initiating any sub-prompts (allowing researchers to finalize 'Sub-prompt off' runs or approve repair iterations for 'Prompt E off' while cleanly isolating session token telemetry).
8. For authorized repairs, invoke `bug-fixing-sub-prompt` for one smallest correction per evidenced defect and reassess affected BRs. Do not combine unrelated repairs.
9. Freeze the final source hash only when required evidence is terminal; otherwise retain an explicit blocked/repair-required state.

Do not create or run tests or test cases.
