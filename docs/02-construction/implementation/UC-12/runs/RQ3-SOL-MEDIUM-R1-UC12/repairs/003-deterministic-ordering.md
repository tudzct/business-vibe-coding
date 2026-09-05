---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-12
run_id: RQ3-SOL-MEDIUM-R1-UC12
repair_id: RQ3-SOL-MEDIUM-R1-UC12-REPAIR-003
repair_index: 3
affected_br_ids: [BR-BILL-UP-04]
category: business_rule
trigger: business_rule_review
fingerprint: eligible-bill-query-has-no-deterministic-order
status: complete
started_at: 2026-09-04T20:25:25.778+07:00
source_revision_before: sha256:f31804cba843e71896401bdc91f2d17b8a56752e5f4533903e2a1da7c98cb655
ended_at: 2026-09-04T20:25:57.087+07:00
duration_seconds: 31.309
source_revision_after: sha256:37733fc5f622ce1f487cb59ebfa63bc6df5ba5647f00a0efb18b12e7f67b5c8e
---

# Repair 3 — Apply deterministic urgency ordering

## Evidence

The repaired eligibility query calls `getMany()` without any ordering, and the frontend preserves the server array. The resulting sequence therefore does not enforce any deterministic order.

## Required correction

Order the existing query by `dueDate` ascending, then `amount` descending, then `billId` ascending. Do not change eligibility, mapping, public response fields, or frontend behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/bill/bill.service.ts`
- Affected BRs: `BR-BILL-UP-04`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

- Changed `finalsource/be/src/modules/bill/bill.service.ts` only.
- Ordered the eligible query by due date ascending, amount descending, and bill ID ascending.
- Docker backend production build: PASS.
- `BR-BILL-UP-04` reassessment: `met`.
- Model: `gpt-5.6-sol`, medium/standard, same as the Confirmed generation assignment.
- Tokens: per-repair attribution is unavailable because all authorized repairs share one Codex turn; aggregate repair-turn telemetry is recorded in the canonical run JSON.
- First-pass evidence remains unchanged.
