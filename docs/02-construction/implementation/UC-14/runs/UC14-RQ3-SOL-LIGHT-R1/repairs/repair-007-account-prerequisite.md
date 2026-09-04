---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-14
run_id: UC14-RQ3-SOL-LIGHT-R1
repair_index: 7
status: Authorized
category: business_rule
trigger: business_rule_review
fingerprint: br-goal-08-account-prerequisite-absent
affected_br_ids: [BR-GOAL-08, BR-GOAL-11]
---

# Repair 7 — Account prerequisite

## Evidence

The authenticated user ID is persisted, but the first-pass service never verifies that the user has an existing bank account.

## Required correction

Reject goal creation with HTTP 400 when no Account row belongs to the authenticated user.

## Scope

- Allowed files: `finalsource/be/src/modules/goal/goal.module.ts`, `finalsource/be/src/modules/goal/goal.service.ts`
- Permitted non-test verification: targeted ESLint and backend production build
- Prohibited: schema/public-API/ownership changes, unrelated validation, and all test creation/execution.

## Completion

- Result: Complete; `BR-GOAL-08` reassessed to met while `BR-GOAL-11` remains blocked by the runtime schema defect
- Changed files: `finalsource/be/src/modules/goal/goal.module.ts`, `finalsource/be/src/modules/goal/goal.service.ts`
- Verification: targeted backend ESLint and backend production build passed
- Model: `gpt-5.6-sol`, reasoning effort `low`
- Timing: `2026-09-03T11:46:19.862Z` to `2026-09-03T11:46:30.099Z` (10.237 seconds)
- Source revision before/after: shared authorized repair batch from `sha256:43681c68624e8b11b00ddb953f634e220c433ac98b443c770a72326b0cea0175` to `sha256:f48a6bd37a60afce460d408eb8f6362e970964421069cd991af457ed7e5583a6`; intermediate global revisions were not frozen
- Tokens: shared repair-turn telemetry; aggregate recorded in the canonical run
