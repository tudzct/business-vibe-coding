---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-10
run_id: RQ3-SOL-MEDIUM-R1-UC10
repair_index: 1
repair_id: RQ3-SOL-MEDIUM-R1-UC10-REPAIR-001
category: business_rule
trigger: business_rule_review
fingerprint: br-exp-current-year-filter-missing-from-monthly-aggregation
affected_br_ids: [BR-EXP-03, BR-EXP-05]
status: Complete
started_at: 2026-08-31T08:03:12.559Z
started_epoch_ms: 1788163392592
source_revision_before: sha256:a38e8affad58adbb60572b8d586aff4e74ae38e841d9c2590143006de7b4134c
model_id: gpt-5.6-sol
reasoning_effort: medium
---

# Repair 001 — Restrict monthly expense aggregation to the current calendar year

## Evidence

- `finalsource/be/src/modules/expenses/expenses.service.ts:26-35` scoped by owner and expense type but had no `transactionDate` boundary.
- The bounded generated SQL grouped every matching year by month.
- Initial audit results: `BR-EXP-03=unmet`; `BR-EXP-05=unmet`.

## Required correction

Calculate the backend server's current calendar year for each service call and add an inclusive 1 January / exclusive next 1 January `transactionDate` boundary to the existing aggregate query. Preserve the owner/type/month grouping, public response, schema, and error behavior.

## Scope

- Allowed file: `finalsource/be/src/modules/expenses/expenses.service.ts`
- Affected BRs: `BR-EXP-03`, `BR-EXP-05`
- Permitted non-test verification: source inspection and backend production build
- Prohibited: new endpoints, schema changes, unrelated refactors, data mutation, and all test creation/execution

## Completion

- Changed file: `finalsource/be/src/modules/expenses/expenses.service.ts`
- Verification: backend production image build passed; source inspection confirmed an inclusive current-year start and exclusive next-year start before grouping and summation.
- Ended at: `2026-08-31T08:04:40.482Z` (`1788163480543` epoch ms)
- Duration: `87.951` seconds
- Source revision after: `sha256:61bed2e32ea57dc9e15c34359a20344d38168c4ddf1b47613a388bf41f44d389`
- Token telemetry: repairs 001 and 002 share Codex turn 4 (`3355022` total tokens); per-repair attribution is unavailable.
- Reassessment: `BR-EXP-03=met`; `BR-EXP-05=met`.
