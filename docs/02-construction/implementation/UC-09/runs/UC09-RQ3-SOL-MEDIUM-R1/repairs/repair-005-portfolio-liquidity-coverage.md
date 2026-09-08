---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-09
run_id: UC09-RQ3-SOL-MEDIUM-R1
repair_id: UC09-RQ3-SOL-MEDIUM-R1-REPAIR-005
repair_index: 5
category: business_rule
trigger: business_rule_review
fingerprint: account-deletion-skips-remaining-portfolio-liquidity-check
affected_br_ids: [BR-ACC-31]
status: Completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
effective_model_id: gpt-5.6-sol
effective_snapshot: null
session_id: 01a080e9-8f30-74f1-9377-8427b1cf7a89
session_turn_id: 5
runtime_turn_id: 01a0810c-fe38-7663-bbca-ac6755bc1847
started_at: 2026-09-08T12:49:15.5353057Z
started_epoch_ms: 1788871755543
source_revision_before: sha256:6284f25018873ea42b0a89dc004ed92dc4b382a8e580f7e14bbee7a94c40cf99
source_revision_after: sha256:003a58ff0466593dd95d377e31dadeb7625eea459fe2f2016d1f905f4ac03a5a
ended_at: 2026-09-08T12:53:48.9523598Z
ended_epoch_ms: 1788872028953
duration_seconds: 273.418
session_duration_seconds: 779.469
total_tokens: 2504281
input_tokens: 64257
cache_read_tokens: 2427520
total_input_tokens: 2491777
output_tokens: 12504
reasoning_tokens: 2372
cost_usd: 1.9102
---

# Repair 5 — Enforce remaining-portfolio liquidity coverage

## Evidence

The immutable first-pass assessment records `BR-ACC-31` as unmet because account deletion does not evaluate whether the user's remaining liquid assets cover remaining loan debt at 120% plus remaining pending expenses.

## Required correction

Before any deletion write, evaluate the remaining owned portfolio in the existing locked `SERIALIZABLE` transaction. Use database decimal arithmetic to require the sum of remaining Checking and Savings balances to be at least the sum of 120% of remaining Loan balances and remaining Pending Expense transaction amounts. Reject an insufficient portfolio with HTTP 409 so rollback persists no changes.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.service.ts`
- Affected BRs: `BR-ACC-31`
- Permitted non-test verification: targeted backend ESLint for the allowed file and the backend production build
- Prohibited: schema/public-API/ownership changes, speculative refactors, first-pass evidence mutation, and all test creation/execution

## Completion

`finalsource/be/src/modules/account/account.service.ts:329-448` now holds the authenticated User row under a pessimistic write lock in the existing `SERIALIZABLE` QueryRunner transaction. Before either deletion write, lines 374-418 use a parameterized MySQL aggregate to compare remaining Checking and Savings balances against 120% of remaining Loan balances plus remaining Pending Expense amounts. The `CASE` comparison and all `SUM` operations remain database-side decimal arithmetic; the application reads only the resulting boolean indicator. An insufficient portfolio raises the safe HTTP 409 conflict and the transaction rolls back without persistence.

Targeted backend ESLint passed for the allowed file, and the Nest production build passed. No tests were created or run. The source revision changed from `sha256:6284f25018873ea42b0a89dc004ed92dc4b382a8e580f7e14bbee7a94c40cf99` to `sha256:003a58ff0466593dd95d377e31dadeb7625eea459fe2f2016d1f905f4ac03a5a`. `BR-ACC-31` is reassessed as `met`; Repairs 001-004 remain intact. Closed session turn 5 consumed 2,504,281 tokens over 779.469 seconds; the bounded repair operation itself took 273.418 seconds.
