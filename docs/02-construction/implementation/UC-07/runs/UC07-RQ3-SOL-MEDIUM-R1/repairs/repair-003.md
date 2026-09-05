---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-07
run_id: UC07-RQ3-SOL-MEDIUM-R1
repair_index: 3
repair_id: UC07-RQ3-SOL-MEDIUM-R1-REPAIR-003
category: business_rule
trigger: business_rule_review
fingerprint: account-detail-cross-account-risk-lock
affected_br_ids: [BR-ACC-20]
status: completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
effective_model_id: gpt-5.6-sol
started_at: 2026-09-05T07:36:46.8666777Z
started_epoch_ms: 1788593806866
source_revision_before: sha256:e125ec0930be8d990bf0b54e7eca727eb76004f22a8774f28bf572fd31a83f8e
ended_at: 2026-09-05T07:37:28.0219045Z
ended_epoch_ms: 1788593848021
duration_seconds: 41.155
source_revision_after: sha256:8e3c808c5d85298178ce3fb4f1430314cd339b0fd10ab704361b745814aa3e30
---

# Repair 3 — Cross-account risk exposure lock

## Evidence

`finalsource/be/src/modules/account/account.service.ts` checks account existence and ownership but contains no risk-exposure calculation for an owned Investment or Credit Card account, leaving BR-ACC-20 unmet.

## Required correction

For an owned Investment or Credit Card target, calculate the authenticated user's total Loan balances and total Checking/Savings balances. Throw HTTP 403 when total debt is strictly greater than total safe assets. Preserve all other account-detail behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.service.ts`
- Affected BRs: `BR-ACC-20`
- Permitted non-test verification: targeted backend ESLint and backend production build
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/account/account.service.ts`
- Correction: owned Investment/Credit Card retrieval now compares parameterized Loan and Checking/Savings aggregates and denies excess debt with HTTP 403.
- Targeted backend ESLint: PASS with zero diagnostics.
- Backend production build: PASS.
- BR-ACC-20 reassessment: `met`; the immutable first-pass `unmet` result remains unchanged.
- Token telemetry: unavailable per repair because all authorized repairs share one researcher turn; aggregate turn telemetry is retained in the canonical run.
- Tests created or run: none.
