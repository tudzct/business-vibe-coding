---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-10
run_id: RQ3-SOL-MEDIUM-R1-UC10
repair_index: 4
repair_id: RQ3-SOL-MEDIUM-R1-UC10-REPAIR-004
category: business_rule
trigger: business_rule_review
fingerprint: br-exp-07-zero-normalization-reverted-reapplication
affected_br_ids: [BR-EXP-07]
status: Complete
started_at: 2026-08-31T11:59:52.491Z
started_epoch_ms: 1788177592522
source_revision_before: sha256:61bed2e32ea57dc9e15c34359a20344d38168c4ddf1b47613a388bf41f44d389
model_id: gpt-5.6-sol
reasoning_effort: medium
---

# Repair 004 — Reapply missing-month zero normalization after source rollback

## Evidence

- The researcher requested reapplication.
- Read-only inspection showed repair 002's numeric-zero normalization absent after the tree returned to the first-pass revision.
- `BR-EXP-07` would therefore remain unmet in the active source.

## Required correction

Reapply repair 002 exactly: for a non-empty summary, preserve Jan-Dec and returned totals while setting missing months to numeric zero; preserve the empty no-data flow.

## Scope

- Allowed file: `finalsource/fe/src/pages/Expenses/Expenses.tsx`
- Affected BR: `BR-EXP-07`
- Permitted non-test verification: source inspection and frontend production build
- Prohibited: API/schema changes, unrelated UI behavior, and all test creation/execution

## Completion

- Changed file: `finalsource/fe/src/pages/Expenses/Expenses.tsx`
- Verification: frontend production image build passed and the repaired tree returned to repair 002's source revision.
- Ended at: `2026-08-31T12:00:50.817Z` (`1788177650880` epoch ms)
- Duration: `58.358` seconds
- Source revision after: `sha256:efadb6fa22fcd7ec0f7e395131dff4fb97da6e4e2f709f0b541bf97e7e62fa5c`
- Token telemetry: repairs 003 and 004 share Codex turn 5 (`4224912` total tokens); per-repair attribution is unavailable.
- Reassessment: `BR-EXP-07=met`.
