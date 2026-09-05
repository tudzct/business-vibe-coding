---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-13
run_id: RQ3-SOL-MEDIUM-R1-UC13
repair_id: RQ3-SOL-MEDIUM-R1-UC13-REPAIR-010
repair_index: 10
affected_br_ids: [BR-GOAL-VIEW-01, BR-GOAL-VIEW-04, BR-GOAL-VIEW-05]
category: technical
trigger: runtime
fingerprint: backend-startup-account-unique-index-already-exists
status: complete
started_at: 2026-09-05T16:37:48.686+07:00
source_revision_before: sha256:2b1c2d8218bf20fed76d1e9bb8a6e09a8d1989028f244982fca08caa0e58304d
ended_at: 2026-09-05T16:39:39.822+07:00
duration_seconds: 111.136
source_revision_after: sha256:7f8cedb214cc4555a61ea2d70c3750e0772d44020a172e32f54f512c06df3e54
---

# Repair 10 — Make the approved account uniqueness migration idempotent

## Evidence

After the category signedness amendment, backend startup reaches `AddAccountsOwnerAccountNumberUnique1788495106545` but fails with duplicate index name `uq_accounts_user_id_account_number_full`. The approved UC-13 recovery created that exact unique index on `(user_id, account_number_full)`.

## Required correction

Before creating the index, accept and return only when the exact named index is already unique over the exact approved ordered columns. Reject an existing index with the same name but incompatible definition. Preserve the existing duplicate-row guard and migration rollback.

## Scope

- Allowed file: `finalsource/be/src/database/migrations/1788495106545-add-accounts-owner-account-number-unique.ts`
- Affected BRs: runtime evaluability only; no Business Rule semantics change
- Permitted non-test verification: backend production build and Compose health/reachability
- Prohibited: index removal, data edits, schema expansion, API/BR changes, volume reset, and all tests

## Completion

Updated only the historical account-uniqueness migration to accept the exact already-present unique index and reject incompatible definitions before retaining its existing duplicate-row/create path. The backend production build passed. Docker Compose reports database, backend, and frontend healthy; backend health and frontend reachability return HTTP 200, and unauthenticated `GET /api/v1/goals` returns the normalized HTTP 401 envelope. Model: `gpt-5.6-sol`, medium/standard. Per-repair tokens are unavailable because the repair shares an aggregate runner turn.
