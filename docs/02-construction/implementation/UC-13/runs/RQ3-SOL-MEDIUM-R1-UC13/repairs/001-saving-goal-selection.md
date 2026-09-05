---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-13
run_id: RQ3-SOL-MEDIUM-R1-UC13
repair_id: RQ3-SOL-MEDIUM-R1-UC13-REPAIR-001
repair_index: 1
affected_br_ids: [BR-GOAL-VIEW-02]
category: business_rule
trigger: business_rule_review
fingerprint: saving-goal-query-omits-eligibility-and-deterministic-selection
status: complete
started_at: 2026-09-05T15:55:30.905+07:00
ended_at: 2026-09-05T15:55:59.397+07:00
duration_seconds: 28.492
source_revision_before: sha256:82349a96eb71b73cdbfdb40f932c5ba0ab31f744601fdf9d0afb8fedd0b7b45c
source_revision_after: sha256:bfb102f19ba7718bff9094867ea92f2a23ddb5e9ff07d269e9b606f3931b73ca
---

# Repair 1 — Select the eligible saving goal deterministically

## Evidence

`finalsource/be/src/modules/goal/goal.service.ts:72-74` queries by owner and Saving type only, without valid-range/month-overlap predicates or deterministic tie-breakers.

## Required correction

Constrain the existing saving-goal query to valid ranges overlapping the current month and select by latest start date, then highest goal ID. Preserve all unrelated behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/goal/goal.service.ts`
- Affected BRs: `BR-GOAL-VIEW-02`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

Updated `finalsource/be/src/modules/goal/goal.service.ts` with owned Saving-goal validity and current-month-overlap predicates plus latest-start/highest-ID ordering. The fresh backend Docker production build passed. Source reassessment: `BR-GOAL-VIEW-02` is `met`. Model: `gpt-5.6-sol`, medium/standard. Per-repair tokens are unavailable because all authorized repairs share one aggregate runner turn.
