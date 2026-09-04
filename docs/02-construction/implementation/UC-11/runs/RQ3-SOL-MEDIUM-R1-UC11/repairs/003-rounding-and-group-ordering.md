---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-11
run_id: RQ3-SOL-MEDIUM-R1-UC11
repair_id: RQ3-SOL-MEDIUM-R1-UC11-REPAIR-003
repair_index: 3
affected_br_ids: [BR-EXP-CAT-06]
category: business_rule
trigger: business_rule_review
fingerprint: breakdown-values-unrounded-and-groups-not-total-descending
status: complete
started_at: 2026-09-01T09:14:54.105002Z
ended_at: 2026-09-01T09:16:38.268237Z
duration_seconds: 104.163
source_revision_before: sha256:5d9291fa75188c835a7310d544445c52402136bf9ba32d303fd265a6f2cc0f41
source_revision_after: sha256:dcdfeff6a8a3fa93dfd24a303dff1e26dc56c05c54631c851f015b042f1ef095
---

# Repair 3 — Round returned values and order groups by total descending

## Evidence

`finalsource/be/src/modules/expenses/expenses.service.ts:108,117-128` returns accumulated totals and calculated percentages without explicit two-decimal rounding and preserves Map insertion order instead of sorting category groups by total descending. Detail rows are already ordered by date ascending at lines 152-153.

## Required correction

Round each returned total and non-null `changePercent` to two decimal places, then sort the returned category groups by total descending. Add only a deterministic category-name tie-breaker for equal totals. Preserve existing detail ordering and all unrelated query behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/expenses/expenses.service.ts`
- Affected BRs: `BR-EXP-CAT-06`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

- Changed `finalsource/be/src/modules/expenses/expenses.service.ts` only.
- Rounded group totals and non-null percentage changes to two decimal places.
- Sorted groups by total descending with a deterministic category-name tie-breaker; retained the existing date-ascending detail query order.
- Docker backend production build: PASS.
- `BR-EXP-CAT-06` reassessment: `met` from inspectable source and the passing non-test build.
- Generation/audit model: `gpt-5.6-sol`, medium/standard, same as the Confirmed assignment.
- Per-repair token isolation is unavailable because all three authorized repairs share one Codex turn; aggregate repair-turn telemetry is recorded in the canonical run artifact.
