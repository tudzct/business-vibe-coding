---
name: build-nest-backend
description: Build or review NestJS 11, TypeScript, TypeORM/MySQL backend code for Prompts A/D/E, including Business Rule enforcement and approval-gated schema changes; never generate tests.
---

# Build Nest Backend

Read the approved prompt, project context, baseline and `docs/00-context/engineering/TECHNICAL-STACK-RULES.md`. Inspect `finalsource/be/package.json` and its lockfile, then extend existing modules under `finalsource/be`.

Resolve the configured variant first. During RQ3 first-pass generation, use only approved A-D and functional/UML/API/technical inputs; do not load the evaluation BR resource/OCL or recreate omitted E/F. Full may use approved E rules. Both variants implement all applicable Basic/Main, Alternative and Exception Flows. BR/flow audit and authorized repair subsequently use the full frozen evaluation baseline. See [shared contract](../../../docs/00-context/workflow/FULL-RQ3-CONTRACT.md).

Load only the references required by the active change areas:

- Nest module, controller or service: [references/nest-rules.md](references/nest-rules.md)
- DTO, validation or backend typing: [references/typescript-validation.md](references/typescript-validation.md)
- Entity, repository, MySQL or transaction: [references/typeorm-mysql.md](references/typeorm-mysql.md)
- JWT, Passport, bcrypt, configuration or OpenAPI: [references/auth-config-openapi.md](references/auth-config-openapi.md)

- Keep controllers thin; enforce business/ownership rules in services and persistence constraints where explicitly required.
- Use validated DTOs, injected repositories, standard response/error handling and existing authentication/configuration mechanisms.
- Before an unapproved table, column, relationship, constraint, index, cascade or migration behavior, create the schema proposal and stop for researcher approval.
- Do not invent endpoints, rules, dependencies, schema or policies.
- Preserve application controls required by the UC/BR/API, including authentication, hashing, ownership, validation, secrets, safe errors and transactions.
- Run only permitted non-test lint/typecheck/build checks.

Do not create or run tests.
