---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-16
run_id: UC16-RQ3-SOL-LIGHT-R1
repair_index: 5
repair_id: UC16-RQ3-SOL-LIGHT-R1-REPAIR-005
category: business_rule
trigger: business_rule_review
fingerprint: savings-net-amount-rounding-and-negative-zero
affected_br_ids: [BR-SAV-04, BR-SAV-07]
status: completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: low
started_at: 2026-09-04T10:37:57.8798299Z
started_epoch_ms: 1788518277883
ended_at: 2026-09-04T10:38:35.6361750Z
ended_epoch_ms: 1788518315642
duration_seconds: 37.759
source_revision_before: sha256:1b023531feecc403f46bb2365f73685be51e38c5cb37edf332fc477e5cf1cd0f
source_revision_after: sha256:9a877b0cb413f18bdecbec5499d9d14793a8189b7951b38d41eeaee85421556c
---

# Repair 5 — Enforce decimal half-up rounding and positive zero

## Evidence

The DECIMAL aggregation is converted directly with `Number()` without an explicit final half-up rounding operation or negative-zero normalization.

## Required correction

Round the exact MySQL DECIMAL aggregate to two places in the query and normalize a converted `-0` to positive zero at the response boundary.

## Scope

- Allowed files: `finalsource/be/src/modules/savings/savings.service.ts`
- Affected BRs: `BR-SAV-04`, `BR-SAV-07`
- Permitted non-test verification: targeted ESLint and backend production build
- Prohibited: dependency/schema changes, unrelated refactors, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/savings/savings.service.ts`.
- The exact DECIMAL sum/difference is rounded by MySQL `ROUND(..., 2)` and converted negative zero is normalized to positive zero.
- Targeted ESLint: PASS.
- Backend production build: PASS.
- BR-SAV-04 and BR-SAV-07 reassessment: met with Repair 2's eligible completed transaction set.
- Token telemetry: `null` until the active repair turn is finalized.
- Tests created or run: none.
