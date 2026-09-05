---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-12
run_id: RQ3-SOL-MEDIUM-R1-UC12
repair_id: RQ3-SOL-MEDIUM-R1-UC12-REPAIR-001
repair_index: 1
affected_br_ids: [BR-BILL-UP-02, BR-BILL-UP-06]
category: business_rule
trigger: business_rule_review
fingerprint: owned-bill-query-omits-near-term-date-window
status: complete
started_at: 2026-09-04T20:23:32.738+07:00
source_revision_before: sha256:288ed148b4caa03f33c11b7eb90b30cbbfea7ccf138cf22340a5e49bd61371ae
ended_at: 2026-09-04T20:24:11.884+07:00
duration_seconds: 39.146
source_revision_after: sha256:3209bb7446c1785b1718b438da43e87bd787d0614e01ed4eaadf3e7084158470
---

# Repair 1 — Constrain retrieval to the near-term date window

## Evidence

`finalsource/be/src/modules/bill/bill.service.ts:14-17` queries every bill matching `userId` and contains no lower or upper `dueDate` boundary. Owned overdue and far-future bills can therefore contribute to the result.

## Required correction

Compute the backend system's current calendar date at local midnight and the date 30 calendar days later, then constrain the existing owned-bill query to that inclusive `dueDate` interval. Preserve every other query, mapping, response, and error behavior for later bounded repairs.

## Scope

- Allowed files: `finalsource/be/src/modules/bill/bill.service.ts`
- Affected BRs: `BR-BILL-UP-02`, `BR-BILL-UP-06`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

- Changed `finalsource/be/src/modules/bill/bill.service.ts` only.
- Added inclusive local-midnight bounds from today through 30 calendar days later to the owned-bill repository query.
- Docker backend production build: PASS.
- `BR-BILL-UP-02` reassessment: `met`; the date-window portion of `BR-BILL-UP-06` is corrected while its charged-cycle dependency remains for Repair 2.
- Model: `gpt-5.6-sol`, medium/standard, same as the Confirmed generation assignment.
- Tokens: per-repair attribution is unavailable because all authorized repairs share one Codex turn; aggregate repair-turn telemetry is recorded in the canonical run JSON.
- First-pass evidence remains unchanged.
