---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-16
run_id: UC16-RQ3-SOL-LIGHT-R1
repair_index: 4
repair_id: UC16-RQ3-SOL-LIGHT-R1-REPAIR-004
category: business_rule
trigger: business_rule_review
fingerprint: savings-year-window-rejected-instead-of-fallback
affected_br_ids: [BR-SAV-02]
status: completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: low
started_at: 2026-09-04T10:36:57.7181827Z
started_epoch_ms: 1788518217723
ended_at: 2026-09-04T10:37:37.9461668Z
ended_epoch_ms: 1788518257946
duration_seconds: 40.223
source_revision_before: sha256:ae4639d3ffc6aaf2f5d5f2ab2c50a3a473eaba95c5d072d5ae79b8e186717631
source_revision_after: sha256:1b023531feecc403f46bb2365f73685be51e38c5cb37edf332fc477e5cf1cd0f
---

# Repair 4 — Resolve invalid and out-of-window years to the current year

## Evidence

The query DTO rejects non-integer or broad-range-invalid input with HTTP 400 and the controller only defaults a missing value; the required rolling window and silent fallback are absent.

## Required correction

Retain the optional query value long enough to resolve it in the controller, then use it only when it is a four-digit integer in `[currentYear - 5, currentYear]`; otherwise use `currentYear`.

## Scope

- Allowed files: `finalsource/be/src/modules/savings/dto/savings-summary-query.dto.ts`, `finalsource/be/src/modules/savings/savings.controller.ts`
- Affected BRs: `BR-SAV-02`
- Permitted non-test verification: targeted ESLint and backend production build
- Prohibited: public response/schema changes, unrelated refactors, and all test creation/execution.

## Completion

- Changed files: `savings-summary-query.dto.ts`, `savings.controller.ts`.
- The controller now resolves a strict four-digit query string against the rolling current-year window and falls back silently to the current year for missing, invalid, future, or too-old values.
- Targeted ESLint: PASS.
- Backend production build: PASS.
- BR-SAV-02 reassessment: met.
- Token telemetry: `null` until the active repair turn is finalized.
- Tests created or run: none.
