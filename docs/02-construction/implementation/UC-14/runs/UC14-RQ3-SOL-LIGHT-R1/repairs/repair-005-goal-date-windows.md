---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-14
run_id: UC14-RQ3-SOL-LIGHT-R1
repair_index: 5
status: Authorized
category: business_rule
trigger: business_rule_review
fingerprint: br-goal-06-date-horizon-and-duration-absent
affected_br_ids: [BR-GOAL-06, BR-GOAL-11]
---

# Repair 5 — Goal date windows

## Evidence

The first-pass validators check date syntax only and omit the start-date horizon and 7–365 day duration.

## Required correction

Enforce start date from current date minus 7 days through plus 30 days and end date from start date plus 7 through plus 365 days, with matching form feedback.

## Scope

- Allowed files: `finalsource/be/src/modules/goal/goal.service.ts`, `finalsource/fe/src/components/Goals/CreateGoalModal.tsx`
- Permitted non-test verification: targeted backend/frontend ESLint and production builds
- Prohibited: schema/public-API changes, unrelated validation, and all test creation/execution.

## Completion

- Result: Complete; `BR-GOAL-06` reassessed to met while `BR-GOAL-11` remains blocked by the runtime schema defect
- Changed files: `finalsource/be/src/modules/goal/goal.service.ts`, `finalsource/fe/src/components/Goals/CreateGoalModal.tsx`
- Verification: targeted backend/frontend ESLint and both production builds passed
- Model: `gpt-5.6-sol`, reasoning effort `low`
- Timing: `2026-09-03T11:44:58.450Z` to `2026-09-03T11:46:00.207Z` (61.757 seconds)
- Source revision before/after: shared authorized repair batch from `sha256:43681c68624e8b11b00ddb953f634e220c433ac98b443c770a72326b0cea0175` to `sha256:f48a6bd37a60afce460d408eb8f6362e970964421069cd991af457ed7e5583a6`; intermediate global revisions were not frozen
- Tokens: shared repair-turn telemetry; aggregate recorded in the canonical run
