---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-14
run_id: UC14-RQ3-SOL-LIGHT-R1
repair_index: 3
status: Authorized
category: business_rule
trigger: business_rule_review
fingerprint: br-goal-04-active-quota-and-saving-conflict-absent
affected_br_ids: [BR-GOAL-04, BR-GOAL-11]
---

# Repair 3 — Active-goal constraints

## Evidence

The first-pass service creates directly without limiting a user to five active goals or rejecting a second active Saving goal.

## Required correction

Before persistence, reject an active-goal count of five or more and reject an existing active Saving goal for a new Saving request.

## Scope

- Allowed file: `finalsource/be/src/modules/goal/goal.service.ts`
- Permitted non-test verification: targeted ESLint and backend production build
- Prohibited: schema/public-API changes, unrelated validation, and all test creation/execution.

## Completion

- Result: Complete; `BR-GOAL-04` reassessed to met while `BR-GOAL-11` remains blocked by the runtime schema defect
- Changed file: `finalsource/be/src/modules/goal/goal.service.ts`
- Verification: targeted backend ESLint and backend production build passed
- Model: `gpt-5.6-sol`, reasoning effort `low`
- Timing: `2026-09-03T11:44:28.908Z` to `2026-09-03T11:44:45.238Z` (16.330 seconds)
- Source revision before/after: shared authorized repair batch from `sha256:43681c68624e8b11b00ddb953f634e220c433ac98b443c770a72326b0cea0175` to `sha256:f48a6bd37a60afce460d408eb8f6362e970964421069cd991af457ed7e5583a6`; intermediate global revisions were not frozen
- Tokens: shared repair-turn telemetry; aggregate recorded in the canonical run
