# Standardized database schema policy

This file defines reusable naming, type and approval rules only. It MUST NOT contain a concrete table/entity schema. For new runs, store Draft and approval in one `docs/02-construction/implementation/<UC-ID>/schema.json`; reference that approved record from prompt and audit. Historical Markdown pairs remain read-only.

## Naming conventions

- Database, table, column, index and constraint identifiers use lowercase `snake_case`.
- Tables use clear plural nouns; TypeScript entity properties use `camelCase`.
- Every TypeORM entity/column declares its database table/column name explicitly.
- Primary keys use `id`; foreign keys use `<singular_entity>_id`.
- Constraints use `pk_<table>`, `uq_<table>_<columns>`, `fk_<child>_<parent>` and `chk_<table>_<rule>`.
- Indexes use `idx_<table>_<columns>`.
- System timestamps use `created_at` and `updated_at` as `DATETIME(3)` unless the UC proves another precision/semantic requirement.
- Monetary values use an approved fixed-precision `DECIMAL(p,s)`, never floating-point types.
- TypeORM `synchronize` remains `false`; every approved schema change requires a reviewable migration.

## Type selection rules

- Choose integer width and signedness from evidenced range and API serialization needs; do not default silently.
- Derive string length from source constraints, standards or an explicit approved assumption.
- Define nullability, default values and generated behavior explicitly.
- Normalize dates/timezones and monetary precision according to the UC contract.
- Treat enum-like values as an explicit decision: database enum, lookup/reference table or constrained string.
- Define sensitive-data storage, default ORM selection and API exposure separately.

## Schema proposal contract

For every new or changed persisted structure, propose at least:

| Section | Required content |
|---|---|
| Evidence and scope | UC/API IDs, source fields/rules, existing entities/migrations inspected, in/out of scope |
| Entity mapping | TypeScript entity/property, table/column, MySQL type, null/default, constraint/index, source rationale |
| Relationships | child/parent keys, cardinality, ownership scope, optionality, `ON DELETE` and cascade proposal |
| Sensitive data | storage protection, fields excluded from default selection, allowlisted API fields, logging/retention rules |
| Migration | forward/rollback operations, data-loss risk, locks/backfill/deployment concerns |
| Decisions | every assumption or material alternative requiring explicit approval |

Use `.codex/skills/build-nest-backend/references/database-schema-template.md` for the full proposal shape.

## Approval and persistence workflow

1. Inspect the UC, project context, current target entities/migrations and previously approved downstream schema decisions. The workflow must work without sample/reference source.
2. Reuse a concrete schema only when the current UC explicitly references that approved downstream artifact and its semantics remain compatible.
3. For any unapproved schema behavior, derive a complete proposal and write/update the Draft `schema.json`, present it and stop.
4. Wait for explicit human approval of that exact proposal before entity/migration edits. A general “approved” without an inspectable proposal is not schema approval.
5. After approval, update the same record to `status: Approved` and add approval time/source. Do not change the approved contract.
6. Reference approved `schema.json` from the coding prompt and audit before source generation.
7. Never add a concrete UC schema to this shared policy file and never edit the immutable source UC.

Authorization, ownership, public API, destructive migration and accepted residual-risk decisions always require explicit approval even when identifier naming follows this template.
