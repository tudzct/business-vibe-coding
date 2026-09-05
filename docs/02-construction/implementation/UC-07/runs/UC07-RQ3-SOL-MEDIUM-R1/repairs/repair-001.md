---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-07
run_id: UC07-RQ3-SOL-MEDIUM-R1
repair_index: 1
repair_id: UC07-RQ3-SOL-MEDIUM-R1-REPAIR-001
category: business_rule
trigger: business_rule_review
fingerprint: account-detail-transaction-amount-sign-mapping
affected_br_ids: [BR-ACC-17]
status: completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
effective_model_id: gpt-5.6-sol
started_at: 2026-09-05T07:33:11.8704182Z
started_epoch_ms: 1788593591870
source_revision_before: sha256:63c32ecd92038b05c98fd8f152c6bce746fce17efd8afa718af26635d68709a5
ended_at: 2026-09-05T07:33:45.4751736Z
ended_epoch_ms: 1788593625475
duration_seconds: 33.605
source_revision_after: sha256:ba4ac96b1716bfee85453d556d6438e3d63d2199e82d7acb4e217ad4999be04b
---

# Repair 1 — Account-detail transaction amount sign mapping

## Evidence

`finalsource/be/src/modules/account/account.service.ts:86` maps every persisted transaction amount with `Number(transaction.amount)`. It does not negate Expense amounts as required by BR-ACC-17.

## Required correction

Apply the smallest mapping change so Expense amounts are returned as negative absolute values and Revenue amounts as positive absolute values. Preserve all response fields and unrelated behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.service.ts`
- Affected BRs: `BR-ACC-17`
- Permitted non-test verification: targeted backend ESLint and backend production build
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/account/account.service.ts`
- Correction: Expense amounts map to negative absolute values and Revenue amounts map to positive absolute values.
- Targeted backend ESLint: PASS with zero diagnostics.
- Backend production build: PASS.
- BR-ACC-17 reassessment: `met`; the immutable first-pass `unmet` result remains unchanged.
- Token telemetry: unavailable per repair because all authorized repairs share one researcher turn; aggregate turn telemetry is retained in the canonical run.
- Tests created or run: none.
