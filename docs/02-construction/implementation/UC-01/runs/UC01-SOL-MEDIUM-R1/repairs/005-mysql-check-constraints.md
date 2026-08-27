---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: UC01-SOL-MEDIUM-R1
repair_index: 5
affected_br_ids: [BR-REG-01, BR-REG-02, BR-REG-03, BR-REG-10]
---

# Repair 5 — TypeORM MySQL check-constraint API and DDL retry safety

## Evidence

Runtime migration first failed with `TypeORMError: MySql does not support check constraints`; because MySQL DDL committed the empty table and unique indexes before that failure, retries then reported duplicate index names. Read-only inspection confirmed `users` has zero rows and exactly PRIMARY, `uq_users_email`, and `uq_users_username` indexes.

## Required correction

Use MySQL 8.4 SQL for approved check constraints and guard both indexes and checks by existing metadata so the migration safely resumes from its known partial state without dropping data or resetting the volume.

## Scope

- Allowed files: `finalsource/be/src/database/migrations/20260827113000-CreateUsersTable.ts`
- Affected BRs: BR-REG-01, BR-REG-02, BR-REG-03, BR-REG-10
- Permitted non-test verification: Docker Compose rebuild, service health, read-only schema inspection and bounded registration observation
- Prohibited: new features, speculative refactors, schema/public-API/ownership changes, destructive table/volume reset, and all test creation/execution.

## Completion

Record changed file, runtime evidence, automatic time/tokens and reassessment without overwriting first-pass evidence.
