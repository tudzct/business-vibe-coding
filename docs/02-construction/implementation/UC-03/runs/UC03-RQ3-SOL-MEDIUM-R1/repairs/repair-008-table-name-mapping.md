---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-03
run_id: UC03-RQ3-SOL-MEDIUM-R1
repair_index: 8
affected_br_ids: [BR-TXN-01, BR-TXN-02, BR-TXN-03, BR-TXN-04, BR-TXN-05, BR-TXN-06, BR-TXN-07]
---

# Repair 8 — Match TypeORM table mappings to the active MySQL schema

## Evidence

The rebuilt backend returned HTTP 500 and logged `Table 'vibe_business.Transactions' doesn't exist`; `SHOW TABLES` reported lowercase `accounts`, `categories`, and `transactions` on the Linux MySQL runtime.

## Required correction

Change only the three TypeORM entity table-name mappings to the exact existing lowercase table names. Do not create or alter database objects.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.entity.ts`, `finalsource/be/src/modules/category/category.entity.ts`, `finalsource/be/src/modules/transaction/transaction.entity.ts`
- Affected BRs: `BR-TXN-01`, `BR-TXN-02`, `BR-TXN-03`, `BR-TXN-04`, `BR-TXN-05`, `BR-TXN-06`, `BR-TXN-07`
- Permitted non-test verification: backend production build, Docker rebuild/health and bounded API/database observation
- Prohibited: migrations, schema changes, new features, speculative refactors, public-API/ownership decisions, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment in the canonical run JSON. Do not overwrite first-pass evidence.
