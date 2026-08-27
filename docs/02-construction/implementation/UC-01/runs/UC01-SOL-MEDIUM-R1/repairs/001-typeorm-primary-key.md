---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: UC01-SOL-MEDIUM-R1
repair_index: 1
affected_br_ids: [BR-REG-03, BR-REG-08, BR-REG-09, BR-REG-10, BR-REG-11]
---

# Repair 1 — Unsupported TypeORM TablePrimaryKey import

## Evidence

Docker Compose backend build failed with `TS2305: Module 'typeorm' has no exported member 'TablePrimaryKey'` at `finalsource/be/src/database/migrations/20260827113000-CreateUsersTable.ts:1`.

## Required correction

Remove the unsupported helper and express the approved named primary-key operation with a bounded migration SQL statement.

## Scope

- Allowed files: `finalsource/be/src/database/migrations/20260827113000-CreateUsersTable.ts`
- Affected BRs: BR-REG-03, BR-REG-08, BR-REG-09, BR-REG-10, BR-REG-11
- Permitted non-test verification: Docker Compose backend build
- Prohibited: new features, speculative refactors, schema/public-API/ownership changes, and all test creation/execution.

## Completion

Record changed file, Docker build evidence, automatic time/tokens and reassessment without overwriting first-pass evidence.
