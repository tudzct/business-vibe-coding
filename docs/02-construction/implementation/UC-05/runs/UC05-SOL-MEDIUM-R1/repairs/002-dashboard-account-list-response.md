---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-05
run_id: UC05-SOL-MEDIUM-R1
repair_id: UC05-SOL-MEDIUM-R1-REPAIR-002
repair_index: 2
status: Complete
category: technical
trigger: compile
fingerprint: frontend-dashboard-account-list-response-shape-mismatch
affected_br_ids: []
source_revision_before: sha256:d16b8bc2ca6a23081b27fb3c6183166234ce9c818a7bb568bd1366a4ca1fd3b8
started_at: 2026-09-02T19:23:56.2220573+07:00
started_epoch_ms: 1788351836222
ended_at: 2026-09-02T19:24:48.3507329+07:00
ended_epoch_ms: 1788351888350
duration_seconds: 52.128
source_revision_after: sha256:c4339b1fbabef41db42e3039db018793ce0cfefa1444c2891c09cce2072ff8d8
---

# Repair 002 — Align Dashboard with the account-list response shape

## Evidence

The frontend production build reports `Dashboard.tsx(26,23): AccountListData is not assignable to Account[]`. `accountService.getAccounts()` now returns the API-backed `AccountListData` envelope, while Dashboard still stores the entire data object as its account array and uses the legacy `Account` identifier shape.

## Required correction

Use `AccountListItem[]` for Dashboard account state, store `accountsRes.data.accounts`, and use each list item’s `id` as the React key. Preserve all unrelated Dashboard behavior and the account service contract.

## Scope

- Allowed files: `finalsource/fe/src/pages/Dashboard/Dashboard.tsx`
- Affected BRs: none
- Permitted non-test verification: frontend TypeScript/Vite production build and source inspection
- Prohibited: account service/API changes, Business Rule changes, new features, speculative refactors, unrelated lint repairs, schema/public-API/ownership decisions, and all test creation/execution

## Completion

- Changed file: `finalsource/fe/src/pages/Dashboard/Dashboard.tsx`
- Frontend TypeScript/Vite production build: passed.
- Source evidence: Dashboard now stores `AccountListItem[]`, reads `accountsRes.data.accounts`, and uses list-item `id` keys.
- Business Rule reassessment: no frozen BR status changed; all six remain met after Repair 001.
- Repair duration: 52.128 seconds. Token telemetry is recorded in the canonical run JSON.
- Docker runtime observation: unavailable because Docker CLI/Compose remains inaccessible from the current execution environment.
