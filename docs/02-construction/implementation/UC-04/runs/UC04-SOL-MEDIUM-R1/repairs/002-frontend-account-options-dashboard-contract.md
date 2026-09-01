---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-04
run_id: UC04-SOL-MEDIUM-R1
repair_index: 2
affected_br_ids: []
---

# Repair 002 — Restore cumulative account-service type compatibility

## Evidence

The current frontend Docker build fails at `Dashboard.tsx(26,23)` because the cumulative Dashboard passes `accountService.getAccounts().data` to `Account[]` state, while the UC-04 first-pass changed that shared method to return `AccountOptionsData`. The immutable deployment evidence records fingerprint `frontend-account-options-dashboard-contract`.

## Required correction

Restore the existing `getAccounts()` signature and behavior for cumulative callers. Add a narrowly named account-options method for UC-04's normalized `data.accounts` response and switch only `AddTransactionPage` to it.

## Scope

- Allowed files: `finalsource/fe/src/api/account.service.ts`, `finalsource/fe/src/pages/AddTransaction/AddTransactionPage.tsx`
- Affected BRs: none; technical build repair only
- Permitted non-test verification: frontend TypeScript/Vite production build through the existing Dockerfile
- Prohibited: new features, speculative refactors, backend/API/schema/ownership changes, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and retained BR assessment. Do not overwrite first-pass evidence.
