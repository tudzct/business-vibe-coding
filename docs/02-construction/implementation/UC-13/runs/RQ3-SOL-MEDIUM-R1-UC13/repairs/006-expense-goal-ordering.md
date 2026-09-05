---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-13
run_id: RQ3-SOL-MEDIUM-R1-UC13
repair_id: RQ3-SOL-MEDIUM-R1-UC13-REPAIR-006
repair_index: 6
affected_br_ids: [BR-GOAL-VIEW-07]
category: business_rule
trigger: business_rule_review
fingerprint: expense-goal-result-has-no-priority-order
status: complete
started_at: 2026-09-05T15:58:59.983+07:00
ended_at: 2026-09-05T15:59:48.538+07:00
duration_seconds: 48.555
source_revision_before: sha256:abf7d4c646bfd1e58d448979d3d9d5f367c5a3f5acafc4ad3892546606933051
source_revision_after: sha256:7ecb037e81527edb265d18e3469ddf7a180d0436507229ae26476a9ac7c1aa1b
---

# Repair 6 — Apply deterministic expense-goal priority ordering

## Evidence

The expense-goal query has no ordering and the service returns repository order without comparing exceeded status, end date, target amount, or goal ID.

## Required correction

Sort the mapped expense-goal DTOs by exceeded status first, then end date ascending, target amount ascending, and goal ID ascending. Preserve calculations and fields.

## Scope

- Allowed files: `finalsource/be/src/modules/goal/goal.service.ts`
- Affected BRs: `BR-GOAL-VIEW-07`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

Updated `finalsource/be/src/modules/goal/goal.service.ts` to sort mapped expense goals by exceeded status, end date, target amount, then goal ID. The fresh backend Docker production build passed. Source reassessment: `BR-GOAL-VIEW-07` is `met`. Model: `gpt-5.6-sol`, medium/standard. Per-repair tokens are unavailable because all authorized repairs share one aggregate runner turn.
