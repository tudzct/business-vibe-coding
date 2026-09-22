---
name: build-nest-backend
description: Build or review NestJS 11, TypeScript and TypeORM/MySQL backend code from the approved prompt against the researcher-pinned database.
---

# Build Nest Backend

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Extend existing modules under `finalsource/be` from the approved prompt.

Resolve the configured variant first. During RQ3 first-pass generation, use only approved A-D and functional/UML/API/technical inputs; do not load the evaluation BR resource/OCL or recreate omitted E/F. Both variants implement all applicable Basic/Main, Alternative and Exception Flows. BR/flow audit and authorized repair subsequently use the full frozen evaluation baseline. See [shared contract](../../../docs/00-context/workflow/FULL-RQ3-CONTRACT.md).

Load only the references required by the active change areas:

- Nest module, controller or service: [references/nest-rules.md](references/nest-rules.md)
- DTO, validation or backend typing: [references/typescript-validation.md](references/typescript-validation.md)
- Entity, repository, MySQL or transaction: [references/typeorm-mysql.md](references/typeorm-mysql.md)
- Existing database/entity mapping: [references/database-schema-template.md](references/database-schema-template.md)
- JWT, Passport, bcrypt, configuration or OpenAPI: [references/auth-config-openapi.md](references/auth-config-openapi.md)

- Keep controllers thin.
- Use validated DTOs, injected repositories, standard response/error handling and existing authentication/configuration mechanisms.
- Read the configured checksum-valid DBML and [database contract](../../../docs/00-context/engineering/DATABASE-SCHEMA.md). Map entities to existing names/types/keys exactly. Use `synchronize: false` and application `migrationsRun: false`. Missing necessary structure blocks work under the database policy's restart procedure; no schema proposal or approval gate exists.
- Run only permitted non-test lint/typecheck/build checks.
