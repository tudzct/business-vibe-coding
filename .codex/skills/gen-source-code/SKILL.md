---
name: gen-source-code
description: Implement source from an approved Full Prompt A-F or RQ3 Prompt A-D, preserve first-pass evidence, assess every frozen Business Rule and perform bounded repairs; never create or run tests.
---

# Generate Source Code

Accept one approved prompt path (`*-business-coding-prompt.md` or `*-rq3-coding-prompt.md`). Resolve its frozen UC, Business Rule resource/baseline, experiment configuration and run activation; reject mismatches or unresolved blockers.

1. Before source mutation, validate one Confirmed run and capture model/version/time metadata. Require the approved prompt's closed-turn `prompt-generation-telemetry.json`; create it from explicit session/turn evidence if it has not yet been persisted.
2. Read `docs/00-context/engineering/TECHNICAL-STACK-RULES.md`, inspect the target manifests/lockfiles and existing `finalsource/` baseline, then map prompt contents (Prompt A-F for Full, or Prompt A-D for RQ3) and change areas to the smallest required diff.
**GLOBAL OVERRIDE (FLEXIBLE CUMULATIVE MODE)**: Explicitly PERMIT cumulative source generation for ALL Use Cases, in any order (e.g., generating UC-02 on top of UC-01, or any UC on top of another). Bypass ALL clean baseline identity checks and "separate comparison group" restrictions. Never abort or prompt for restoration due to existing source code; simply generate the requested UC directly on top of the current source state. Read BR entries only after first-pass generation stops, for audit.
3. Invoke `build-nest-backend` and/or `build-react-frontend`; each stack skill loads only the references required by those change areas. Require researcher approval before an unapproved schema, public API, ownership or destructive change.
4. Stop the initial wall-clock timer immediately after first-pass generation and preserve the immutable first-pass source hash. Record the session identity and exact code-generation turn ID, but do not finalize its token count while that turn is active.
5. Run permitted non-test lint/typecheck/build checks. Rebuild and observe the Docker Compose runtime when authorized; do not accept stale images as evidence.
6. Invoke `audit-generation-metrics` and assign exactly one `met`, `unmet` or `not_evaluable` result to every frozen BR in the baseline using inspectable evidence (both Full and RQ3 evaluate against the identical frozen BR baseline).
7. **First-pass Telemetry Hold Gate**: STOP after the initial assessment for both Full and RQ3 runs and end the assistant turn. Report first-pass results and ask the researcher to continue. At the start of the next turn, extract the now-closed explicit code-generation turn into `first-pass-generation.json` and the canonical run JSON before doing anything else. For RQ3, the same response must also explicitly request repair authorization; never infer it.
8. For authorized repairs, invoke `bug-fixing-sub-prompt` for one smallest correction per evidenced defect and reassess affected BRs. Do not combine unrelated repairs.
9. After the final repair/build/runtime observation, stop at a **Repair Telemetry Finalization Gate** and end the assistant turn. Do not mark the canonical run complete yet. On the next researcher-triggered turn, extract every closed repair turn, calculate stage totals, validate the final source hash and only then finalize the run.
10. Freeze the final source hash only when required evidence and all three telemetry stages are terminal; otherwise retain an explicit awaiting-telemetry, blocked or repair-required state.

Do not create or run tests or test cases.
