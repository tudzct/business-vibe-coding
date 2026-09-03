---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_id: UC06-SOL-MEDIUM-R1-REPAIR-004
repair_index: 4
status: Complete
category: business_rule
trigger: business_rule_review
fingerprint: br-acc-09-negative-balance-accepted
affected_br_ids: [BR-ACC-09]
source_revision_before: sha256:865b3de686dda09f6d1cb3b3b5795bd0f2bfcfe0c931cfb7630f823c7c991752
started_at: 2026-09-03T21:20:59.9455943+07:00
started_epoch_ms: 1788445259950
ended_at: 2026-09-03T21:21:49.2850736+07:00
ended_epoch_ms: 1788445309285
duration_seconds: 49.335
source_revision_after: sha256:6e63f68df05d12c873b8b91630eb79ea12857d9d380c97ea2c0b205d3e1fa1bf
---

# Repair 004 — Reject negative account balances

## Evidence

The immutable assessment records BR-ACC-09 as unmet because the backend validates only numeric type/finiteness and the frontend accepts every finite value, including negative balances.

## Required correction

Add a zero minimum to the backend DTO and reject converted frontend balance values below zero. Preserve numeric JSON conversion and defer account-type-specific minimum deposits to their separate Business Rule repair.

## Scope

- Allowed files: `finalsource/be/src/modules/account/dto/create-account.dto.ts`, `finalsource/fe/src/components/AddAccountForm/AddAccountForm.tsx`
- Affected BRs: `BR-ACC-09`
- Permitted non-test verification: targeted ESLint for both changed files, backend production build, frontend production build, and source inspection
- Prohibited: other Business Rule repairs, schema/public-API/ownership changes, speculative refactors, and all test creation/execution.

## Completion

- Changed files: `finalsource/be/src/modules/account/dto/create-account.dto.ts`, `finalsource/fe/src/components/AddAccountForm/AddAccountForm.tsx`
- Targeted ESLint: both changed files passed with zero warnings.
- Backend and frontend production builds: passed.
- Source evidence: the backend applies `@Min(0)` after finite numeric validation; the frontend rejects converted values below zero before submission.
- Reassessment: BR-ACC-09 changed from first-pass `unmet` to repaired `met`; the immutable initial assessment remains unchanged.
- Repair duration: 49.335 seconds. Token telemetry is recorded in the canonical run JSON.
