---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-13
run_id: RQ3-SOL-MEDIUM-R1-UC13
repair_id: RQ3-SOL-MEDIUM-R1-UC13-REPAIR-002
repair_index: 2
affected_br_ids: [BR-GOAL-VIEW-03]
category: business_rule
trigger: business_rule_review
fingerprint: expense-goal-query-omits-valid-range-predicate
status: complete
started_at: 2026-09-05T15:56:05.995+07:00
ended_at: 2026-09-05T15:56:34.003+07:00
duration_seconds: 28.008
source_revision_before: sha256:bfb102f19ba7718bff9094867ea92f2a23ddb5e9ff07d269e9b606f3931b73ca
source_revision_after: sha256:f9df9c43ed5e99f26e173ebff9297cc0e60d689b67c4242e9f9837a114d5c12e
---

# Repair 2 — Enforce exact expense-goal eligibility

## Evidence

`finalsource/be/src/modules/goal/goal.service.ts:75-83` applies ownership, type, and month-overlap filters but does not require `startDate <= endDate`.

## Required correction

Add the persisted valid-range predicate to the expense-goal query while preserving category loading and unrelated behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/goal/goal.service.ts`
- Affected BRs: `BR-GOAL-VIEW-03`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

Updated `finalsource/be/src/modules/goal/goal.service.ts` so owned ExpenseLimit goals require a valid persisted date range and overlap the current month, while preserving category loading. The fresh backend Docker production build passed. Source reassessment: `BR-GOAL-VIEW-03` is `met`. Model: `gpt-5.6-sol`, medium/standard. Per-repair tokens are unavailable because all authorized repairs share one aggregate runner turn.
