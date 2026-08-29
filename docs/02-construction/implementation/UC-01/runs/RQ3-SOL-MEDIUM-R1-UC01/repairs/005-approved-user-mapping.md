---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 5
affected_br_ids: [BR-REG-03, BR-REG-08, BR-REG-09, BR-REG-10, BR-REG-11]
---

# Repair 5 — Align registration persistence with the approved users schema

## Evidence

Current-image runtime registration failed before persistence because the inherited entity queried `Users.user_id` and `Users.password`, while read-only schema inspection confirmed the already-migrated approved table is `users` with `id` and `password_hash`. The table exists, has its approved unique/check constraints, and requires no schema mutation.

## Required correction

Align only the UC-01 User entity and registration service property mappings with the existing approved `users` schema, including protected `password_hash` selection and the approved balance precision, without altering the database.

## Scope

- Allowed files: `finalsource/be/src/modules/user/user.entity.ts`, `finalsource/be/src/modules/auth/auth.service.ts`
- Affected BRs: BR-REG-03, BR-REG-08, BR-REG-09, BR-REG-10, BR-REG-11
- Permitted non-test verification: Docker Compose backend build, service health, read-only schema inspection and bounded registration observation
- Prohibited: database/schema mutation, new features, speculative refactors, public-API/ownership changes, destructive table/volume operations, and all test creation/execution.

## Completion

Record changed files, Docker/runtime evidence, automatic time/tokens and reassessment without overwriting first-pass evidence.
