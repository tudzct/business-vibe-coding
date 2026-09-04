---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-04
run_id: UC04-RQ3-SOL-MEDIUM-R1
repair_index: 5
status: Authorized
category: business_rule
trigger: business_rule_review
fingerprint: br-txn-12-expense-balance-and-savings-reserve-not-enforced
affected_br_ids: [BR-TXN-12]
---

# Repair 5 — Expense balance and Savings reserve

## Evidence

The first-pass creation path does not compare an Expense amount with account balance and does not preserve the Savings reserve of 50000.

## Required correction

Reject an Expense that exceeds available balance, or leaves a Savings account below 50000, before persistence.

## Scope

- Allowed files: `finalsource/be/src/modules/transaction/transaction.service.ts`
- Affected BRs: `BR-TXN-12`
- Permitted non-test verification: targeted ESLint and backend production build
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment. Do not overwrite first-pass evidence.

- Result: Complete; `BR-TXN-12` reassessed to met
- Source revision before: `sha256:66d3ef06d0955e5c7a5e5a65a7971fa586d15f47a45e68c4c07a179eb2d56289`
- Source revision after: `sha256:d33864732754a56868c92ee496a3561bbf0d3410690746475bd64be289232207`
- Changed files: `finalsource/be/src/modules/transaction/transaction.service.ts`
- Verification: targeted backend ESLint/build passed; bounded insufficient-balance request returned HTTP 400 without a successful mutation
- Model: `gpt-5.6-sol`, reasoning effort `medium`
- Timing: `2026-09-02T17:54:59.6482775Z` to `2026-09-02T17:55:19.8547889Z` (20.207 seconds)
- Tokens: shared repair-turn telemetry; aggregate recorded in the canonical run
