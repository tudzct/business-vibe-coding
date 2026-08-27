---
name: build-nest-backend
description: Build or review NestJS 11, TypeScript, TypeORM/MySQL backend code for Prompts A/D/E, including Business Rule enforcement and approval-gated schema changes; never generate tests.
---

# Build Nest Backend

Read the approved prompt, project context, baseline and relevant references. Extend existing modules under `finalsource/be`.

- Keep controllers thin; enforce business/ownership rules in services and persistence constraints where explicitly required.
- Use validated DTOs, injected repositories, standard response/error handling and existing authentication/configuration mechanisms.
- Before an unapproved table, column, relationship, constraint, index, cascade or migration behavior, create the schema proposal and stop for researcher approval.
- Do not invent endpoints, rules, dependencies, schema or policies.
- Preserve application controls required by the UC/BR/API, including authentication, hashing, ownership, validation, secrets, safe errors and transactions.
- Run only permitted non-test lint/typecheck/build checks.

Do not create or run tests.
