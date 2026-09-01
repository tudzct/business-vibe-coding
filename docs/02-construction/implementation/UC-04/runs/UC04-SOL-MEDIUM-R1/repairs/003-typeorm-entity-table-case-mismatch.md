---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-04
run_id: UC04-SOL-MEDIUM-R1
repair_index: 3
affected_br_ids: []
---

# Repair 003 — Align UC-04 TypeORM table names with the existing schema

## Evidence

Current-image `GET /api/categories` returned normalized HTTP 500. Read-only MySQL metadata shows the existing tables are named `accounts`, `categories`, and `transactions`, while the corresponding TypeORM entities declare `Accounts`, `Categories`, and `Transactions`. The Linux MySQL runtime treats these as different identifiers, producing the shared fingerprint `typeorm-entity-table-case-mismatch` across the UC-04 option and persistence path.

## Required correction

Change only the three TypeORM entity table-name mappings to the exact lowercase names already present in the database. Do not alter columns, relationships, DTOs, public APIs, migrations, or database schema.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.entity.ts`, `finalsource/be/src/modules/category/category.entity.ts`, `finalsource/be/src/modules/transaction/transaction.entity.ts`
- Affected BRs: none; runtime integration repair only
- Permitted non-test verification: backend Docker production build, current-image backend restart, category-list HTTP observation
- Prohibited: schema changes, new features, speculative refactors, public-API/ownership changes, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and retained BR assessment. Do not overwrite first-pass evidence.
