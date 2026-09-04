---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_index: 1
affected_br_ids: []
---

# Repair 1 — Migration query result narrowing

## Evidence

Backend ESLint reports `@typescript-eslint/no-unsafe-assignment` at `finalsource/be/src/database/migrations/1788495106545-add-accounts-owner-account-number-unique.ts:9` because TypeORM declares `QueryRunner.query` as returning `any`.

## Required correction

Assign the external query result to `unknown` and narrow it with `Array.isArray` before reading its length. Preserve the approved duplicate preflight and unique-index behavior.

## Scope

- Allowed files: `finalsource/be/src/database/migrations/1788495106545-add-accounts-owner-account-number-unique.ts`
- Affected BRs: none; this is a technical typing repair and does not change BR-ACC-10 behavior
- Permitted non-test verification: targeted ESLint and backend production build
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and the unchanged BR assessment. Do not overwrite first-pass evidence.
