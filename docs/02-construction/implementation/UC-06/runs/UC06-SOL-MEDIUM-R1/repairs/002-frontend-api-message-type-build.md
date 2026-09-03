---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_id: UC06-SOL-MEDIUM-R1-REPAIR-002
repair_index: 2
status: Complete
category: technical
trigger: compile
fingerprint: frontend-shared-api-message-type-build
affected_br_ids: []
source_revision_before: sha256:687f401de428ecbc21ae1257e57001cb6e4719e56991d9bd4ec72eb8cccb7ed8
started_at: 2026-09-03T21:08:13.3814023+07:00
started_epoch_ms: 1788444493384
ended_at: 2026-09-03T21:08:52.5918104+07:00
ended_epoch_ms: 1788444532592
duration_seconds: 39.208
source_revision_after: sha256:ff020e5ec1b704162b2411ad2105dd4ca28ecdec31947557e13fd88ee9ab781b
---

# Repair 002 — Restore the success-envelope message type

## Evidence

`finalsource/fe/src/api/types.ts:5` widens `ApiResponse.message` to `string | string[]`. `AuthContext.tsx:38` and `:49` pass success-envelope messages to the `Error` constructor, producing TypeScript TS2769 during the frontend production build. Error-envelope message arrays are independently narrowed at Axios error boundaries.

## Required correction

Restore `ApiResponse.message` to `string`, preserving local `string | string[]` typing for HTTP error bodies and all create-account behavior.

## Scope

- Allowed files: `finalsource/fe/src/api/types.ts`
- Affected BRs: none
- Permitted non-test verification: frontend production build and targeted ESLint for `api/types.ts`
- Prohibited: API behavior changes, Business Rule changes, schema/ownership changes, speculative refactors, unrelated lint repairs, and all test creation/execution.

## Completion

- Changed file: `finalsource/fe/src/api/types.ts`
- Targeted ESLint: passed with zero warnings.
- Frontend TypeScript/Vite production build: passed.
- Source evidence: success-envelope `ApiResponse.message` is again a string; error arrays remain locally modeled at Axios error boundaries.
- Reassessment: no BR status changed; the immutable initial assessment remains unchanged.
- Repair duration: 39.208 seconds. Token telemetry is recorded in the canonical run JSON.
