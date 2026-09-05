---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-13
run_id: RQ3-SOL-MEDIUM-R1-UC13
repair_id: RQ3-SOL-MEDIUM-R1-UC13-REPAIR-005
repair_index: 5
affected_br_ids: [BR-GOAL-VIEW-06]
category: business_rule
trigger: business_rule_review
fingerprint: goal-response-category-and-money-normalization-incomplete
status: complete
started_at: 2026-09-05T15:58:13.700+07:00
ended_at: 2026-09-05T15:58:52.340+07:00
duration_seconds: 38.640
source_revision_before: sha256:792b4af1eb0a5da9b9ab0b59a2567bd9bbe1a3c58cec64fe024407d80c5d9537
source_revision_after: sha256:abf7d4c646bfd1e58d448979d3d9d5f367c5a3f5acafc4ad3892546606933051
---

# Repair 5 — Normalize category labels and monetary values

## Evidence

`finalsource/be/src/modules/goal/goal.service.ts:109-124` does not explicitly round returned amounts, trim resolved category names, or distinguish a null category from an unresolved non-null category.

## Required correction

Apply two-decimal rounding to returned goal monetary values, trim resolved category names, return `Uncategorized` for null category IDs, and return `Unknown` only for unresolved or blank non-null categories.

## Scope

- Allowed files: `finalsource/be/src/modules/goal/goal.service.ts`
- Affected BRs: `BR-GOAL-VIEW-06`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

Updated `finalsource/be/src/modules/goal/goal.service.ts` with symmetric two-decimal monetary rounding, trimmed resolved category names, `Uncategorized` for null category IDs, and `Unknown` for blank or unresolved non-null categories. The fresh backend Docker production build passed. Source reassessment: `BR-GOAL-VIEW-06` is `met`. Model: `gpt-5.6-sol`, medium/standard. Per-repair tokens are unavailable because all authorized repairs share one aggregate runner turn.
