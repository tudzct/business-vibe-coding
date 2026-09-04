---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_id: UC06-SOL-MEDIUM-R1-REPAIR-001
repair_index: 1
status: Complete
category: technical
trigger: lint
fingerprint: backend-queryfailederror-generic-lint
affected_br_ids: []
source_revision_before: sha256:8028afedea2bc59c2acf1b99b9f6c9989975a5adbcf7159e639ac2373862f10d
started_at: 2026-09-03T20:52:30.9692395+07:00
started_epoch_ms: 1788443550980
ended_at: 2026-09-03T20:53:37.8920795+07:00
ended_epoch_ms: 1788443617892
duration_seconds: 66.912
source_revision_after: sha256:687f401de428ecbc21ae1257e57001cb6e4719e56991d9bd4ec72eb8cccb7ed8
---

# Repair 001 — Narrow duplicate-entry errors without an unsafe generic boundary

## Evidence

`finalsource/be/src/modules/account/account.service.ts:88` passes `QueryFailedError<any>` to a `QueryFailedError<Error>` parameter, producing the first-pass ESLint `no-unsafe-argument` diagnostic.

## Required correction

Accept the caught value as `unknown` inside the duplicate-entry helper and narrow it to `QueryFailedError` before reading the driver error. Preserve conflict mapping and all account behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.service.ts`
- Affected BRs: none
- Permitted non-test verification: targeted ESLint for `account.service.ts` and backend production build
- Prohibited: business-rule changes, schema changes, public-API changes, speculative refactors, unrelated lint repairs, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/account/account.service.ts`
- Targeted ESLint: passed with zero warnings.
- Backend production build: passed.
- Source evidence: the helper accepts `unknown`, narrows with `instanceof QueryFailedError`, then safely inspects the driver error.
- Reassessment: no BR status changed; the immutable initial assessment remains unchanged.
- Repair duration: 66.912 seconds. Token telemetry is recorded in the canonical run JSON.
