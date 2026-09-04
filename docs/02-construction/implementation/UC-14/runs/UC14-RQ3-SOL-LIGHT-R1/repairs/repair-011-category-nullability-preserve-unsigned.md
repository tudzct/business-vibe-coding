---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-14
run_id: UC14-RQ3-SOL-LIGHT-R1
repair_index: 11
status: Authorized
category: technical
trigger: runtime
fingerprint: goals-category-nullability-migration-drops-unsigned
affected_br_ids: [BR-GOAL-07, BR-GOAL-09, BR-GOAL-10, BR-GOAL-11]
---

# Repair 11 — Preserve category unsigned type

## Evidence

The create-table migration completed, then `MakeGoalsCategoryNullable` failed because `ALTER ... INT NULL` changed `Goals.category_id` to signed while referenced `categories.category_id` is unsigned.

## Required correction

Preserve `INT UNSIGNED` in both the up and down nullability SQL; change no other schema behavior.

## Scope

- Allowed file: `finalsource/be/src/database/migrations/20260903105627-make-goals-category-nullable.ts`
- Affected BRs: `BR-GOAL-07`, `BR-GOAL-09`, `BR-GOAL-10`, `BR-GOAL-11`
- Permitted non-test verification: targeted ESLint, backend build, Docker Compose rebuild/health, and bounded goal-create runtime observation
- Prohibited: unrelated schema/API changes, data deletion, volume reset, and all test creation/execution.

## Completion

- Result: Complete; both UC-14 migrations are recorded and the current `Goals.category_id` is nullable unsigned
- Source revision before: `sha256:3af753f43d5b501fc16860b12668869b300e8a1eca3d2bd9f1afe3999179da5e`
- Source revision after: `sha256:adc85a65a86612b989d4e3e6ce07cf3b1f918130a7774935fb49a91e4e766880`
- Changed file: `finalsource/be/src/database/migrations/20260903105627-make-goals-category-nullable.ts`
- Verification: targeted backend ESLint/build passed; all Compose services healthy; UI/API reachable; Saving and Expense Limit creation plus bounded failure branches behaved as required
- Model: `gpt-5.6-sol`, reasoning effort `low`
- Timing: `2026-09-03T12:13:26.183Z` to `2026-09-03T12:16:55.396Z` (209.213 seconds)
- Tokens: shared repair-turn telemetry; aggregate recorded in the canonical run
