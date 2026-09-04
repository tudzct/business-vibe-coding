---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-16
run_id: UC16-RQ3-SOL-LIGHT-R1
repair_index: 8
repair_id: UC16-RQ3-SOL-LIGHT-R1-REPAIR-008
category: technical
trigger: lint
fingerprint: shared-password-regex-useless-escapes
affected_br_ids: []
status: completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: low
started_at: 2026-09-04T10:40:56.4069291Z
started_epoch_ms: 1788518456414
ended_at: 2026-09-04T10:41:39.0601825Z
ended_epoch_ms: 1788518499061
duration_seconds: 42.647
source_revision_before: sha256:99c5cffa0cdecf709c9518f369ad10e33159a40d9e0a201b9563707f078a48bc
source_revision_after: sha256:ab754e00717c759b3581657dba193d8adb1a847655d491d15875b1b3d8d2d0d4
---

# Repair 8 — Remove redundant escapes from the shared password regexes

## Evidence

Backend and frontend ESLint report the same `no-useless-escape` fingerprint for `[`, `/`, and `-` inside equivalent password character classes.

## Required correction

Rewrite only the character-class spelling while preserving the accepted character set.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/auth.service.ts`, `finalsource/fe/src/pages/Register/Register.tsx`
- Affected BRs: none
- Permitted non-test verification: targeted ESLint in both projects
- Prohibited: password-policy changes, unrelated refactors, and all test creation/execution.

## Completion

- Changed files: backend auth service and frontend Register page.
- The equivalent character classes retain the accepted set with nonredundant literal notation.
- Targeted backend/frontend ESLint: PASS.
- Token telemetry: `null` until the active repair turn is finalized.
- Tests created or run: none.
