---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-16
run_id: UC16-RQ3-SOL-LIGHT-R1
repair_index: 3
repair_id: UC16-RQ3-SOL-LIGHT-R1-REPAIR-003
category: business_rule
trigger: business_rule_review
fingerprint: savings-month-series-empty-and-future-normalization
affected_br_ids: [BR-SAV-03, BR-SAV-05, BR-SAV-06]
status: completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: low
started_at: 2026-09-04T10:35:59.1763189Z
started_epoch_ms: 1788518159181
ended_at: 2026-09-04T10:36:39.0896669Z
ended_epoch_ms: 1788518199089
duration_seconds: 39.908
source_revision_before: sha256:7f9b09c388b5a6fdc557b55f936897dba24e86716fbafc5073ce6a1e35367c17
source_revision_after: sha256:ae4639d3ffc6aaf2f5d5f2ab2c50a3a473eaba95c5d072d5ae79b8e186717631
---

# Repair 3 — Normalize empty, missing, and future monthly periods

## Evidence

The zero-row branch returns empty arrays, violating the required 12-month cardinality, and current-year future months are not capped to zero when post-dated records exist.

## Required correction

Always build both 12-month series and force months after the current month in the current-year series to zero.

## Scope

- Allowed files: `finalsource/be/src/modules/savings/savings.service.ts`
- Affected BRs: `BR-SAV-03`, `BR-SAV-05`, `BR-SAV-06`
- Permitted non-test verification: targeted ESLint and backend production build
- Prohibited: schema/API changes, unrelated refactors, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/savings/savings.service.ts`
- Removed the empty-array early return so both series always pass through the existing 12-month builder; future months of the current year are explicitly zeroed.
- Targeted ESLint: PASS.
- Backend production build: PASS.
- BR-SAV-03, BR-SAV-05, and BR-SAV-06 reassessment: met together with Repair 2's eligible completed transaction predicates.
- Token telemetry: `null` until the active repair turn is finalized.
- Tests created or run: none.
