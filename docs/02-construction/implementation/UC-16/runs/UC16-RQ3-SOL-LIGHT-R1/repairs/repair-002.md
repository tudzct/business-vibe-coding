---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-16
run_id: UC16-RQ3-SOL-LIGHT-R1
repair_index: 2
repair_id: UC16-RQ3-SOL-LIGHT-R1-REPAIR-002
category: business_rule
trigger: business_rule_review
fingerprint: savings-aggregation-ineligible-account-and-status-set
affected_br_ids: [BR-SAV-01, BR-SAV-03, BR-SAV-04, BR-SAV-05, BR-SAV-06]
status: completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: low
started_at: 2026-09-04T10:34:00.4710051Z
started_epoch_ms: 1788518040478
ended_at: 2026-09-04T10:35:39.9299648Z
ended_epoch_ms: 1788518139929
duration_seconds: 99.451
source_revision_before: sha256:9fe295ab0170c24e09cca5bc1465dc39cf3ab9e6469eb87e7818627b68a3b252
source_revision_after: sha256:7f9b09c388b5a6fdc557b55f936897dba24e86716fbafc5073ce6a1e35367c17
---

# Repair 2 — Restrict the savings aggregation to eligible completed transactions

## Evidence

`savings.service.ts` scopes by account owner but does not restrict account type or transaction status. Credit Card, Loan, Investment, Pending, and Failed records can therefore contribute to amounts and counts.

## Required correction

Apply the smallest query change that restricts aggregation to authenticated-user Checking/Savings accounts and Complete transactions.

## Scope

- Allowed files: `finalsource/be/src/modules/savings/savings.service.ts`
- Affected BRs: `BR-SAV-01`, `BR-SAV-03`, `BR-SAV-04`, `BR-SAV-05`, `BR-SAV-06`
- Permitted non-test verification: targeted ESLint and backend production build
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/savings/savings.service.ts`
- Added parameterized Checking/Savings account-type and Complete-status predicates to the existing owned-account aggregation.
- Targeted ESLint: PASS.
- Backend production build: PASS.
- Reassessment: BR-SAV-01 is met; BR-SAV-03/04/05/06 receive the corrected eligible transaction set but retain their separately evidenced defects pending later repairs.
- Token telemetry: `null` until the active repair turn is finalized.
- Tests created or run: none.
