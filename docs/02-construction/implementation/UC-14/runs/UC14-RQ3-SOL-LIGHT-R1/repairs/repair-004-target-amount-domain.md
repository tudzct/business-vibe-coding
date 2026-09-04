---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-14
run_id: UC14-RQ3-SOL-LIGHT-R1
repair_index: 4
status: Authorized
category: business_rule
trigger: business_rule_review
fingerprint: br-goal-05-target-range-and-rounding-absent
affected_br_ids: [BR-GOAL-05, BR-GOAL-11]
---

# Repair 4 — Target amount domain

## Evidence

The first-pass validators accept any positive amount and omit the 100,000–1,000,000,000 VND range and 10,000 VND step.

## Required correction

Enforce the exact range and rounding step at the backend trust boundary and mirror it in the form UX.

## Scope

- Allowed files: `finalsource/be/src/modules/goal/dto/create-goal.dto.ts`, `finalsource/fe/src/components/Goals/CreateGoalModal.tsx`
- Permitted non-test verification: targeted backend/frontend ESLint and production builds
- Prohibited: schema/public-API changes, unrelated validation, and all test creation/execution.

## Completion

- Result: Complete; `BR-GOAL-05` reassessed to met while `BR-GOAL-11` remains blocked by the runtime schema defect
- Changed files: `finalsource/be/src/modules/goal/dto/create-goal.dto.ts`, `finalsource/fe/src/components/Goals/CreateGoalModal.tsx`
- Verification: targeted backend/frontend ESLint and both production builds passed
- Model: `gpt-5.6-sol`, reasoning effort `low`
- Timing: `2026-09-03T11:44:45.239Z` to `2026-09-03T11:44:58.449Z` (13.210 seconds)
- Source revision before/after: shared authorized repair batch from `sha256:43681c68624e8b11b00ddb953f634e220c433ac98b443c770a72326b0cea0175` to `sha256:f48a6bd37a60afce460d408eb8f6362e970964421069cd991af457ed7e5583a6`; intermediate global revisions were not frozen
- Tokens: shared repair-turn telemetry; aggregate recorded in the canonical run
