---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-04
run_id: UC04-RQ3-SOL-MEDIUM-R1
repair_index: 2
status: Authorized
category: business_rule
trigger: business_rule_review
fingerprint: br-txn-08-date-window-not-enforced
affected_br_ids: [BR-TXN-08]
---

# Repair 2 — Transaction date horizon

## Evidence

The first-pass frontend and backend accept any parseable ISO date and do not enforce `currentDate()-365 <= transactionDate <= currentDate()+1`.

## Required correction

Add matching frontend guidance/validation and authoritative backend validation for the frozen date horizon.

## Scope

- Allowed files: `finalsource/fe/src/pages/Transactions/AddTransaction.tsx`, `finalsource/be/src/modules/transaction/dto/create-transaction.dto.ts`, `finalsource/be/src/modules/transaction/transaction.service.ts`
- Affected BRs: `BR-TXN-08`
- Permitted non-test verification: targeted ESLint and frontend/backend production builds
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment. Do not overwrite first-pass evidence.

- Result: Complete; `BR-TXN-08` partially repaired pending its Cash-limit fingerprint
- Source revision before: `sha256:b533b01099ea31b57f03484c593f11ba3ae4cfbe61415f52672324faa701b987`
- Source revision after: `sha256:a28f59ad2f57612b0e0cb1f90e33a60a9767ff60eb333a16543161f500e84383`
- Changed files: `finalsource/fe/src/pages/Transactions/AddTransaction.tsx`, `finalsource/be/src/modules/transaction/dto/create-transaction.dto.ts`, `finalsource/be/src/modules/transaction/transaction.service.ts`
- Verification: targeted frontend/backend ESLint and both production builds passed
- Model: `gpt-5.6-sol`, reasoning effort `medium`
- Timing: `2026-09-02T17:52:22.0329931Z` to `2026-09-02T17:53:10.5362505Z` (48.504 seconds)
- Tokens: shared repair-turn telemetry; aggregate recorded in the canonical run
