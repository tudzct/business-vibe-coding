---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: UC01-SOL-MEDIUM-R1
repair_index: 4
affected_br_ids: [BR-REG-03, BR-REG-10, BR-REG-11]
---

# Repair 4 — TypeORM MySQL unique-constraint API incompatibility

## Evidence

Compose runtime migration failed with `TypeORMError: MySql does not support unique constraints. Use unique index instead.` at both approved unique-constraint creation calls.

## Required correction

Create equivalently named unique indexes through the MySQL-supported TypeORM `TableIndex` API, preserving uniqueness and column scope.

## Scope

- Allowed files: `finalsource/be/src/database/migrations/20260827113000-CreateUsersTable.ts`
- Affected BRs: BR-REG-03, BR-REG-10, BR-REG-11
- Permitted non-test verification: Docker Compose rebuild, service health and bounded registration observation
- Prohibited: new features, speculative refactors, schema/public-API/ownership changes, destructive volume reset, and all test creation/execution.

## Completion

Record changed file, runtime evidence, automatic time/tokens and reassessment without overwriting first-pass evidence.
