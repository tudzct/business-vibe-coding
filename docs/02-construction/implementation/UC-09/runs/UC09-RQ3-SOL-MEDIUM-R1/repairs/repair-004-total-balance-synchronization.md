---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-09
run_id: UC09-RQ3-SOL-MEDIUM-R1
repair_id: UC09-RQ3-SOL-MEDIUM-R1-REPAIR-004
repair_index: 4
category: business_rule
trigger: business_rule_review
fingerprint: deleted-account-leaves-user-total-balance-stale
affected_br_ids: [BR-ACC-30]
status: Completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
effective_model_id: gpt-5.6-sol
effective_snapshot: null
session_id: 01a080e9-8f30-74f1-9377-8427b1cf7a89
session_turn_id: 4
runtime_turn_id: 01a08106-53be-7d72-a033-f90c8665c7bc
started_at: 2026-09-08T12:40:36.7846765Z
started_epoch_ms: 1788871236785
source_revision_before: sha256:ac8e0f4369f318d728daed94fb3a732d1ee3281bb45acdaa9671bc2fe8db8017
source_revision_after: sha256:6284f25018873ea42b0a89dc004ed92dc4b382a8e580f7e14bbee7a94c40cf99
ended_at: 2026-09-08T12:42:39.3399127Z
ended_epoch_ms: 1788871359340
duration_seconds: 122.555
session_duration_seconds: 417.408
total_tokens: 2518076
input_tokens: 33569
cache_read_tokens: 2475136
total_input_tokens: 2508705
output_tokens: 9371
reasoning_tokens: 1776
cost_usd: 1.6865
---

# Repair 4 — Synchronize User.total_balance after account deletion

## Evidence

The immutable first-pass assessment records `BR-ACC-30` as unmet because account deletion neither calculates the database-decimal sum of the user's remaining accounts nor updates `User.total_balance` inside the atomic deletion transaction.

## Required correction

Lock the authenticated user in the existing QueryRunner transaction and, after deleting the target account, update `User.total_balance` from a database-side `COALESCE(SUM(accounts.balance), 0)` over all remaining owned accounts before commit. Do not derive the value from client input or floating-point application arithmetic.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.service.ts`
- Affected BRs: `BR-ACC-30`
- Permitted non-test verification: targeted backend ESLint for the allowed file and the backend production build
- Prohibited: implementation of `BR-ACC-31`, schema/public-API/ownership changes, speculative refactors, first-pass evidence mutation, and all test creation/execution

## Completion

`finalsource/be/src/modules/account/account.service.ts:329-397` now obtains the transactional User repository, locks the authenticated user before the account, and updates `User.total_balance` before commit with a database-side `COALESCE(SUM(remaining.balance), 0)` over all remaining accounts owned by that user. The aggregate is evaluated by MySQL inside the same `SERIALIZABLE` QueryRunner transaction and is not derived from client input or application floating-point arithmetic. A missing synchronization update raises the safe processing failure and rolls back the deletion.

Targeted backend ESLint passed for the allowed file, and the Nest production build passed. No tests were created or run. The source revision changed from `sha256:ac8e0f4369f318d728daed94fb3a732d1ee3281bb45acdaa9671bc2fe8db8017` to `sha256:6284f25018873ea42b0a89dc004ed92dc4b382a8e580f7e14bbee7a94c40cf99`. `BR-ACC-30` is reassessed as `met`; Repairs 002–003 remain intact. Closed session turn 4 consumed 2,518,076 tokens over 417.408 seconds; the bounded repair operation itself took 122.555 seconds.
