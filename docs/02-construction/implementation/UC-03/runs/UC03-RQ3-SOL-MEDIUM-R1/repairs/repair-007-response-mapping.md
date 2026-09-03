---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-03
run_id: UC03-RQ3-SOL-MEDIUM-R1
repair_index: 7
affected_br_ids: [BR-TXN-06]
---

# Repair 7 — Apply signed amount and conditional merchant masking

## Evidence

`transaction.service.ts` mapped persisted amount and shop name directly for every transaction status/type/payment combination.

## Required correction

Map completed Expense amounts as negative, other response amounts as unsigned absolute values, and mask `shop_name` as `***` only for Pending Credit Card transactions.

## Scope

- Allowed files: `finalsource/be/src/modules/transaction/transaction.service.ts`
- Affected BRs: `BR-TXN-06`
- Permitted non-test verification: targeted lint, backend production build and bounded API observation
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment in the canonical run JSON. Do not overwrite first-pass evidence.
