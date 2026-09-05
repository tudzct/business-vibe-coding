---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-12
run_id: RQ3-SOL-MEDIUM-R1-UC12
repair_id: RQ3-SOL-MEDIUM-R1-UC12-REPAIR-004
repair_index: 4
affected_br_ids: [BR-BILL-UP-05]
category: business_rule
trigger: business_rule_review
fingerprint: bill-dto-misses-trimming-and-two-decimal-rounding
status: complete
started_at: 2026-09-04T20:26:15.027+07:00
source_revision_before: sha256:37733fc5f622ce1f487cb59ebfa63bc6df5ba5647f00a0efb18b12e7f67b5c8e
ended_at: 2026-09-04T20:26:52.523+07:00
duration_seconds: 37.495
source_revision_after: sha256:fa54c8ab15ca5eb8b9501b8bb12092779b26d554e3e0e4094f209be3ff930375
---

# Repair 4 — Complete bill response normalization

## Evidence

The first-pass DTO mapping formats dates and handles nullable fields, but returns `itemDescription` and non-null `logoUrl` without trimming and converts `amount` to a number without explicit two-decimal rounding.

## Required correction

Trim `itemDescription`, trim a present `logoUrl` and normalize a blank result to null, and round the finite numeric amount to two decimal places. Preserve date formatting, nullable `lastChargeDate`, query eligibility/order, and the public response shape.

## Scope

- Allowed files: `finalsource/be/src/modules/bill/bill.service.ts`
- Affected BRs: `BR-BILL-UP-05`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

- Changed `finalsource/be/src/modules/bill/bill.service.ts` only.
- Added description/logo trimming, blank-logo null normalization, and explicit two-decimal amount rounding while preserving date/null mapping.
- Docker backend production build: PASS.
- `BR-BILL-UP-05` reassessment: `met`.
- Model: `gpt-5.6-sol`, medium/standard, same as the Confirmed generation assignment.
- Tokens: per-repair attribution is unavailable because all authorized repairs share one Codex turn; aggregate repair-turn telemetry is recorded in the canonical run JSON.
- First-pass evidence remains unchanged.
