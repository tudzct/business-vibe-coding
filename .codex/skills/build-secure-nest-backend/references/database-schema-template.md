# Standardized database schema proposal

Use this contract whenever a UC requires persisted structure not already approved in its downstream `schema.json`. The shared policy is generic. Save the Draft in `docs/02-construction/implementation/<UC-ID>/schema.json`, present it and stop before source or migration edits.

## Evidence and scope

- UC/API IDs and operations:
- Source fields and business rules:
- Existing entities/migrations inspected:
- New table/change required:
- Out of scope:

The proposal must be self-contained and must not depend on sample/reference code being present. Derive a recommended default from the UC, project context, database policy and target source; label unsupported values as assumptions for approval instead of asking the user to design the schema from scratch.

## Naming and entity mapping

Follow the project contract:

- MySQL identifiers: lowercase `snake_case`; plural table names.
- TypeScript properties: `camelCase` with explicit TypeORM database names.
- Primary key: `id`; foreign key: `<singular_entity>_id`.
- Constraints: `pk_<table>`, `uq_<table>_<columns>`, `fk_<child>_<parent>`, `chk_<table>_<rule>`.
- Indexes: `idx_<table>_<columns>`.
- Timestamps: `created_at`, `updated_at` as `DATETIME(3)`.
- Money: `DECIMAL(19,4)`, never floating point.

| TypeScript entity/property | Table/column | MySQL type | Null/default | Constraint/index | Source rationale |
|---|---|---|---|---|---|
| | | | | | |

## Relationships and ownership

| Child table/column | Parent table/column | Cardinality | Owner/tenant scope | `ON DELETE` / cascade proposal | Rationale |
|---|---|---|---|---|---|
| | | | | | |

State how every user-owned lookup/mutation is scoped. Never infer a cascade or accept a client-provided owner ID as authorization.

## Sensitive data and exposure

- Sensitive/credential fields and storage protection:
- Fields excluded from default ORM selection:
- Allowlisted API response fields:
- Retention or deletion behavior:
- Logging/export restrictions:

## Migration plan

- Migration name: `<timestamp>-<verb>-<table-or-change>.ts`
- Forward operations:
- Rollback operations and data-loss risk:
- Lock/backfill/deployment considerations:
- Confirm `synchronize: false` remains unchanged.

## Assumptions and decisions requiring approval

List each assumption separately, including types, length/precision, nullability, uniqueness, relationship optionality, ownership, cascade/delete policy, indexes and migration risk. Offer alternatives only when they materially change behavior, integrity, security or deployment.

End with one explicit approval question. After approval, update the same `schema.json` to `status: Approved` with approval provenance/timestamp; do not copy or rewrite the contract. Reference it from prompt/audit.
