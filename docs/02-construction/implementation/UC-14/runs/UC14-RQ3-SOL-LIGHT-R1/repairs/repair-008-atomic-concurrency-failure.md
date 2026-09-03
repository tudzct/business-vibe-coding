---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-14
run_id: UC14-RQ3-SOL-LIGHT-R1
repair_index: 8
status: Authorized
category: business_rule
trigger: business_rule_review
fingerprint: br-goal-11-transaction-lock-and-repository-error-absent
affected_br_ids: [BR-GOAL-04, BR-GOAL-07, BR-GOAL-08, BR-GOAL-09, BR-GOAL-11]
---

# Repair 8 — Atomicity, concurrency, and failure handling

## Evidence

The first-pass service performs validation and persistence outside a transaction, has no same-user serialization lock, and emits the wrong unexpected-failure message.

## Required correction

Execute validation and the single Goal save in a serializable transaction, lock the authenticated User row before same-user checks, preserve HTTP exceptions, and map unexpected failures to the exact frozen message.

## Scope

- Allowed files: `finalsource/be/src/modules/goal/goal.module.ts`, `finalsource/be/src/modules/goal/goal.service.ts`
- Permitted non-test verification: targeted ESLint and backend production build
- Prohibited: schema/public-API changes, unrelated refactors, and all test creation/execution.

## Completion

- Result: Source correction complete; transaction, same-user locking, rollback boundary, and exact failure message are inspectable, but `BR-GOAL-07`, `BR-GOAL-09`, `BR-GOAL-10`, and `BR-GOAL-11` remain unmet because the active database has no `Goals` table
- Changed files: `finalsource/be/src/modules/goal/goal.module.ts`, `finalsource/be/src/modules/goal/goal.service.ts`
- Verification: targeted backend ESLint and backend production build passed; Docker images built but backend startup remained blocked
- Model: `gpt-5.6-sol`, reasoning effort `low`
- Timing: `2026-09-03T11:46:30.100Z` to `2026-09-03T11:47:41.894Z` (71.794 seconds)
- Source revision before/after: shared authorized repair batch from `sha256:43681c68624e8b11b00ddb953f634e220c433ac98b443c770a72326b0cea0175` to `sha256:f48a6bd37a60afce460d408eb8f6362e970964421069cd991af457ed7e5583a6`; intermediate global revisions were not frozen
- Tokens: shared repair-turn telemetry; aggregate recorded in the canonical run
