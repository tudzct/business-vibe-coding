---
name: gen-source-code
description: Implement source from an approved Business Coding Prompt A-F, preserve first-pass evidence, assess every frozen Business Rule and perform bounded repairs; never create or run tests.
---

# Generate Source Code

Accept one approved prompt path. Resolve its frozen UC, Business Rule resource/baseline, experiment configuration and run activation; reject mismatches or unresolved blockers.

1. Before source mutation, validate one Confirmed run and capture model/version/time metadata.
2. Inspect the existing `finalsource/` baseline and map Prompt A-F plus every BR to the smallest required diff.
3. Invoke `build-nest-backend` and/or `build-react-frontend`. Require researcher approval before an unapproved schema, public API, ownership or destructive change.
4. Stop the initial timer immediately after first-pass generation and preserve immutable first-pass telemetry.
5. Run permitted non-test lint/typecheck/build checks. Rebuild and observe the Docker Compose runtime when authorized; do not accept stale images as evidence.
6. Invoke `audit-generation-metrics` and assign exactly one `met`, `unmet` or `not_evaluable` result to every frozen BR using inspectable evidence.
7. For each evidenced defect, invoke `bug-fixing-sub-prompt` for one smallest correction and reassess affected BRs. Do not combine unrelated repairs.
8. Freeze the final source hash only when required evidence is terminal; otherwise retain an explicit blocked/repair-required state.

Do not create or run tests or test cases.
