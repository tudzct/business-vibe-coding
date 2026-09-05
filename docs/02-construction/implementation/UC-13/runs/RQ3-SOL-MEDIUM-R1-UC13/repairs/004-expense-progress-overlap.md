---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-13
run_id: RQ3-SOL-MEDIUM-R1-UC13
repair_id: RQ3-SOL-MEDIUM-R1-UC13-REPAIR-004
repair_index: 4
affected_br_ids: [BR-GOAL-VIEW-05]
category: business_rule
trigger: business_rule_review
fingerprint: expense-progress-uses-full-calendar-month
status: complete
started_at: 2026-09-05T15:57:23.696+07:00
ended_at: 2026-09-05T15:58:06.436+07:00
duration_seconds: 42.739
source_revision_before: sha256:80b9de61a75dccdc18976dbe705dbe52302f7802de35af94b587c02232b97666
source_revision_after: sha256:792b4af1eb0a5da9b9ab0b59a2567bd9bbe1a3c58cec64fe024407d80c5d9537
---

# Repair 4 — Restrict expense progress to each goal/month overlap

## Evidence

`finalsource/be/src/modules/goal/goal.service.ts:115-124` filters by expense type and category but not by each goal's interval.

## Required correction

For each expense goal, sum only owned matching-category expense transactions inside that goal's inclusive overlap with the current month. Preserve zero sums and unrelated behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/goal/goal.service.ts`
- Affected BRs: `BR-GOAL-VIEW-05`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

Updated `finalsource/be/src/modules/goal/goal.service.ts` so each ExpenseLimit total includes only owned matching-category expense transactions in that goal/current-month inclusive intersection. The fresh backend Docker production build passed. Source reassessment: `BR-GOAL-VIEW-05` is `met`. Model: `gpt-5.6-sol`, medium/standard. Per-repair tokens are unavailable because all authorized repairs share one aggregate runner turn.
