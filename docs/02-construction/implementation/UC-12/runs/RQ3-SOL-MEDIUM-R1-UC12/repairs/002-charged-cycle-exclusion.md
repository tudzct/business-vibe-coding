---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-12
run_id: RQ3-SOL-MEDIUM-R1-UC12
repair_id: RQ3-SOL-MEDIUM-R1-UC12-REPAIR-002
repair_index: 2
affected_br_ids: [BR-BILL-UP-03, BR-BILL-UP-06]
category: business_rule
trigger: business_rule_review
fingerprint: upcoming-query-does-not-exclude-already-charged-cycle
status: complete
started_at: 2026-09-04T20:24:33.511+07:00
source_revision_before: sha256:3209bb7446c1785b1718b438da43e87bd787d0614e01ed4eaadf3e7084158470
ended_at: 2026-09-04T20:25:08.132+07:00
duration_seconds: 34.621
source_revision_after: sha256:f31804cba843e71896401bdc91f2d17b8a56752e5f4533903e2a1da7c98cb655
---

# Repair 2 — Exclude bills already charged for their due cycle

## Evidence

The first-pass service mapped `lastChargeDate` but never compared it with `dueDate`. After Repair 1, the repository query has the required date window but still includes a row when `lastChargeDate` is equal to or later than `dueDate`.

## Required correction

Extend the existing owned/date-window query with one static, parameter-safe predicate that retains bills whose `lastChargeDate` is null or earlier than `dueDate`. Preserve the date bounds, response mapping, ordering state, and all unrelated behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/bill/bill.service.ts`
- Affected BRs: `BR-BILL-UP-03`, `BR-BILL-UP-06`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

- Changed `finalsource/be/src/modules/bill/bill.service.ts` only.
- Added the null-or-earlier-than-due-date predicate while preserving authenticated ownership and the near-term date window.
- Docker backend production build: PASS.
- `BR-BILL-UP-03` reassessment: `met`; together with Repair 1, the eligibility portion of `BR-BILL-UP-06` is now corrected.
- Model: `gpt-5.6-sol`, medium/standard, same as the Confirmed generation assignment.
- Tokens: per-repair attribution is unavailable because all authorized repairs share one Codex turn; aggregate repair-turn telemetry is recorded in the canonical run JSON.
- First-pass evidence remains unchanged.
