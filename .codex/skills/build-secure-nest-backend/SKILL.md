---
name: build-secure-nest-backend
description: Build or review secure NestJS 11, TypeScript, TypeORM/MySQL, class-validator, Passport JWT, bcrypt and Swagger backend source for Prompts A/D/E, including standardized database-schema proposals and approval gates. Use for modules, controllers, services, entities, DTOs, migrations, authorization, schema planning and code review; do not generate tests or test cases.
---

# Build Secure Nest Backend

Read `PROJECT_CONTEXT.md`, `finalsource/BASELINE.md`, the approved prompt and `references/nest-rules.md`. Then read only the references needed for the change: `references/typescript-validation.md`, `references/typeorm-mysql.md`, or `references/auth-config-openapi.md`. Extend existing modules/config under `finalsource/be`; do not recreate the NestJS app.

When the UC reads, creates, updates or relates persisted data, read `docs/00-context/engineering/DATABASE-SCHEMA.md` and `references/database-schema-template.md` before planning an entity or repository change.

## Database schema approval gate

1. Inspect existing entities/migrations in the target backend, the generic schema policy and UC-specific downstream schema decisions. Do not require sample/reference code and do not treat a concrete schema from another UC as a shared default.
2. If the UC needs any unapproved table, column, type, nullability, default, unique/check/foreign-key constraint, relationship, cascade, index, retention or destructive migration behavior, do not invent it and do not edit source yet.
3. Proactively produce a complete, concise Draft at `docs/02-construction/implementation/<UC-ID>/schema.json` from `templates/construction/schema.template.json` and the database reference. Derive it from the UC, policy, target source and explicit assumptions. Ask only for approval or a material missing decision.
4. Present the exact proposal and stop for explicit human approval. A vague approval without an inspectable proposal is not sufficient.
5. After approval, update the same `schema.json` to `status: Approved` and add approval provenance/timestamp without copying the contract. Reference it from prompt/audit. Historical Markdown pairs remain read-only.
6. Only after approval, implement the entity and a reviewable TypeORM migration. Keep `synchronize: false`; destructive migration, cascade/delete policy, ownership or public API changes require separate explicit approval.

Add feature modules and import them into the existing `AppModule`. Reuse global configuration, `DatabaseModule`, validation, response interceptor and exception filter. Keep controllers thin, business/ownership checks in services, persistence via injected repositories and validated DTOs at boundaries. Use guards for authentication and enforce action/object authorization during or immediately after lookup. Select safe response fields and centralize sanitized errors.

Preserve approved business behavior. Do not add endpoints, schema, dependencies or policies not explicitly required. Do not create or run tests/test cases. Run only allowed non-test build/lint checks and then invoke `$audit-generation-metrics` through the parent workflow. Never use production `synchronize: true`, string-built SQL, mass assignment, weak hashing, hard-coded secrets or sensitive logging.

Before completion, enforce the existing ESLint/Prettier/TypeScript configuration rather than bypassing it. Do not replace package/config/bootstrap files, add `eslint-disable`, `@ts-ignore`, `any`, a new dependency or a framework-major migration merely to make generated code compile.
