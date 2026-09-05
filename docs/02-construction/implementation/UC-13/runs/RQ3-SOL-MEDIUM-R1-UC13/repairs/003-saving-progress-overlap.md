---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-13
run_id: RQ3-SOL-MEDIUM-R1-UC13
repair_id: RQ3-SOL-MEDIUM-R1-UC13-REPAIR-003
repair_index: 3
affected_br_ids: [BR-GOAL-VIEW-04]
category: business_rule
trigger: business_rule_review
fingerprint: saving-progress-uses-full-calendar-month
status: complete
started_at: 2026-09-05T15:56:39.110+07:00
ended_at: 2026-09-05T15:57:17.322+07:00
duration_seconds: 38.213
source_revision_before: sha256:f9df9c43ed5e99f26e173ebff9297cc0e60d689b67c4242e9f9837a114d5c12e
source_revision_after: sha256:80b9de61a75dccdc18976dbe705dbe52302f7802de35af94b587c02232b97666
---

# Repair 3 — Restrict saving progress to the goal/month overlap

## Evidence

`finalsource/be/src/modules/goal/goal.service.ts:90-110` sums the full current-month transaction set without intersecting the saving goal's interval.

## Required correction

Load and sum owned transactions only inside the inclusive intersection of the selected saving goal interval and current month. Preserve zero sums and negative results.

## Scope

- Allowed files: `finalsource/be/src/modules/goal/goal.service.ts`
- Affected BRs: `BR-GOAL-VIEW-04`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

Updated `finalsource/be/src/modules/goal/goal.service.ts` to load owned-account transactions from the inclusive intersection of the selected Saving goal and current month, then compute revenue minus expense without clamping. The fresh backend Docker production build passed. Source reassessment: `BR-GOAL-VIEW-04` is `met`. Model: `gpt-5.6-sol`, medium/standard. Per-repair tokens are unavailable because all authorized repairs share one aggregate runner turn.
