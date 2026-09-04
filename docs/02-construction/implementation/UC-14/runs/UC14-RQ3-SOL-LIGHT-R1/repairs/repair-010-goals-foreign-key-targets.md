---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-14
run_id: UC14-RQ3-SOL-LIGHT-R1
repair_index: 10
status: Authorized
category: technical
trigger: runtime
fingerprint: goals-create-migration-references-nonexistent-users-user-id
affected_br_ids: [BR-GOAL-07, BR-GOAL-09, BR-GOAL-10, BR-GOAL-11]
---

# Repair 10 — Goals foreign-key targets

## Evidence

The approved create-table migration reached MySQL but failed with error 3734 because it referenced nonexistent `users.user_id`. Read-only schema inspection and the existing User entity show the actual primary key is unsigned `users.id`; `categories.category_id` is also unsigned.

## Required correction

Make the new `Goals.user_id` and `Goals.category_id` columns unsigned and point the user foreign key to the existing `users.id` primary key. Preserve the approved ownership and category relationships.

## Scope

- Allowed files: `finalsource/be/src/database/migrations/20260903105626-create-goals-table-if-missing.ts`, `finalsource/be/src/modules/goal/goal.entity.ts`
- Affected BRs: `BR-GOAL-07`, `BR-GOAL-09`, `BR-GOAL-10`, `BR-GOAL-11`
- Permitted non-test verification: targeted ESLint, backend build, Docker Compose rebuild/health, and bounded goal-create runtime observation
- Prohibited: unrelated schema/API behavior, data mutation outside migrations, volume reset, and all test creation/execution.

## Completion

- Result: Complete; the Goals table was created with foreign keys matching the existing unsigned primary keys
- Source revision before: `sha256:429be210a1b7ec4f6732b61db68ee83ea030624e8c3844c5a628de27c3487ec8`
- Source revision after: `sha256:3af753f43d5b501fc16860b12668869b300e8a1eca3d2bd9f1afe3999179da5e`
- Changed files: `finalsource/be/src/database/migrations/20260903105626-create-goals-table-if-missing.ts`, `finalsource/be/src/modules/goal/goal.entity.ts`
- Verification: targeted backend ESLint/build passed; Docker advanced through table creation and exposed the separate repair-011 fingerprint
- Model: `gpt-5.6-sol`, reasoning effort `low`
- Timing: `2026-09-03T12:10:37.202Z` to `2026-09-03T12:13:26.182Z` (168.980 seconds)
- Tokens: shared repair-turn telemetry; aggregate recorded in the canonical run
