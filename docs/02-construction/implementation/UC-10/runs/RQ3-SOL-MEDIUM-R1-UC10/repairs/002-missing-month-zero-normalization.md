---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-10
run_id: RQ3-SOL-MEDIUM-R1-UC10
repair_index: 2
repair_id: RQ3-SOL-MEDIUM-R1-UC10-REPAIR-002
category: business_rule
trigger: business_rule_review
fingerprint: br-exp-07-missing-month-values-null-instead-of-zero
affected_br_ids: [BR-EXP-07]
status: Complete
started_at: 2026-08-31T08:05:06.150Z
started_epoch_ms: 1788163506183
source_revision_before: sha256:61bed2e32ea57dc9e15c34359a20344d38168c4ddf1b47613a388bf41f44d389
model_id: gpt-5.6-sol
reasoning_effort: medium
---

# Repair 002 — Normalize missing chart months to zero

## Evidence

- `finalsource/fe/src/pages/Expenses/Expenses.tsx:169-175` constructed Jan-Dec and preserved returned values but assigned `null` to missing months.
- Initial audit result: `BR-EXP-07=unmet`.

## Required correction

For a non-empty summary response, retain the existing Jan-Dec chart shape and returned totals while assigning numeric `0` to months absent from the API response. Preserve the empty-summary no-data branch, public API, and chart layout.

## Scope

- Allowed file: `finalsource/fe/src/pages/Expenses/Expenses.tsx`
- Affected BR: `BR-EXP-07`
- Permitted non-test verification: source inspection and frontend production build
- Prohibited: new UI behavior, API/schema changes, unrelated refactors, and all test creation/execution

## Completion

- Changed file: `finalsource/fe/src/pages/Expenses/Expenses.tsx`
- Verification: frontend production image build passed; source inspection confirmed a twelve-month non-empty chart sequence, preservation of returned values, and numeric zero for every missing month while the empty response still rendered no-data.
- Ended at: `2026-08-31T08:06:05.079Z` (`1788163565142` epoch ms)
- Duration: `58.959` seconds
- Source revision after: `sha256:efadb6fa22fcd7ec0f7e395131dff4fb97da6e4e2f709f0b541bf97e7e62fa5c`
- Token telemetry: repairs 001 and 002 share Codex turn 4 (`3355022` total tokens); per-repair attribution is unavailable.
- Reassessment: `BR-EXP-07=met`.
