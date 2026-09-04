---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-16
run_id: UC16-RQ3-SOL-LIGHT-R1
repair_index: 6
repair_id: UC16-RQ3-SOL-LIGHT-R1-REPAIR-006
category: business_rule
trigger: business_rule_review
fingerprint: savings-query-missing-read-committed-boundary
affected_br_ids: [BR-SAV-08]
status: completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: low
started_at: 2026-09-04T10:38:56.2695129Z
started_epoch_ms: 1788518336274
ended_at: 2026-09-04T10:39:32.6966321Z
ended_epoch_ms: 1788518372699
duration_seconds: 36.425
source_revision_before: sha256:9a877b0cb413f18bdecbec5499d9d14793a8189b7951b38d41eeaee85421556c
source_revision_after: sha256:c80721425ca58cd55e278b286eaa9cb64a48609e6db9a7c2ea1d0d66a5ef7fe5
---

# Repair 6 — Execute the read-only aggregation under READ COMMITTED

## Evidence

The savings service performs a SELECT-only query and safely maps failures, but it uses the global repository without the required explicit READ COMMITTED transaction boundary.

## Required correction

Run the existing read query through the transaction-scoped entity manager with `READ COMMITTED`, without adding writes or changing its public contract.

## Scope

- Allowed files: `finalsource/be/src/modules/savings/savings.service.ts`
- Affected BRs: `BR-SAV-08`
- Permitted non-test verification: targeted ESLint and backend production build
- Prohibited: schema changes, write operations, unrelated refactors, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/savings/savings.service.ts`.
- The read-only query now uses the transaction-scoped repository inside an explicit `READ COMMITTED` boundary; safe exception mapping remains unchanged.
- Targeted ESLint: PASS.
- Backend production build: PASS.
- BR-SAV-08 reassessment: met.
- Token telemetry: `null` until the active repair turn is finalized.
- Tests created or run: none.
