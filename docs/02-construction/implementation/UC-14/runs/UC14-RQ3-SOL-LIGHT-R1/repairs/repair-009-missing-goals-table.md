---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-14
run_id: UC14-RQ3-SOL-LIGHT-R1
repair_index: 9
status: Complete
category: technical
trigger: runtime
fingerprint: backend-startup-goals-table-missing-during-nullability-migration
affected_br_ids: [BR-GOAL-07, BR-GOAL-09, BR-GOAL-10, BR-GOAL-11]
---

# Repair 9 — Missing Goals table

## Evidence

After the authorized source repairs, Docker Compose rebuilt both current images, but TypeORM again failed on `ALTER TABLE Goals MODIFY category_id INT NULL` with MySQL `ER_NO_SUCH_TABLE`. The active database therefore cannot start the backend or execute goal creation.

## Required correction

Create the missing `Goals` table before applying the approved nullable-category migration. This is a new database schema change and requires separate researcher approval.

## Scope

- Proposed file after approval: a new TypeORM migration under `finalsource/be/src/database/migrations/`
- Affected BRs: `BR-GOAL-07`, `BR-GOAL-09`, `BR-GOAL-10`, `BR-GOAL-11`
- Permitted non-test verification after approval: targeted ESLint, backend build, Docker Compose rebuild/health, and bounded goal-create runtime observation
- Prohibited: volume reset, destructive data changes, unrelated schema/API changes, and all test creation/execution.

## Completion

- Researcher approval: recorded in `docs/02-construction/implementation/UC-14/schema.json`
- Result: Complete after bounded follow-up repairs 010 and 011 resolved runtime schema mismatches exposed by the first migration attempt
- Changed file: `finalsource/be/src/database/migrations/20260903105626-create-goals-table-if-missing.ts`
- Source revision before: `sha256:f48a6bd37a60afce460d408eb8f6362e970964421069cd991af457ed7e5583a6`
- Source revision after initial correction: `sha256:429be210a1b7ec4f6732b61db68ee83ea030624e8c3844c5a628de27c3487ec8`
- Initial blocked timing: 299.663 seconds, preserved in the canonical run
- Authorized continuation timing: `2026-09-03T12:07:14.118Z` to `2026-09-03T12:10:37.202Z` (203.084 seconds)
- Verification: targeted backend ESLint/build passed; final Docker and runtime success recorded after repairs 010–011
- Model: `gpt-5.6-sol`, reasoning effort `low`
- Tokens: shared repair-turn telemetry; aggregate recorded in the canonical run
