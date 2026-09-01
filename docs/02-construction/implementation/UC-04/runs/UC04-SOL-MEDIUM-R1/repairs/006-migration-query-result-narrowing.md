---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-04
run_id: UC04-SOL-MEDIUM-R1
repair_index: 6
affected_br_ids: [BR-TXN-15]
---

# Repair 006 — Narrow migration query results safely

## Evidence

Containerized backend ESLint reports `@typescript-eslint/no-unsafe-assignment` for the UC-04 migration's rollback query because TypeORM `QueryRunner.query()` returns `any`. The guarded rollback behavior is correct but its external result boundary is not narrowed.

## Required correction

Receive the query result as `unknown`, narrow the first row and `count` property before numeric conversion, and preserve the existing rollback refusal semantics.

## Scope

- Allowed files: `finalsource/be/src/database/migrations/20260901101931-make-transactions-receipt-id-nullable.ts`
- Affected BRs: `BR-TXN-15`
- Permitted non-test verification: targeted containerized ESLint for this migration and backend production build
- Prohibited: migration behavior/schema expansion, new features, API/ownership changes, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and retained BR assessment. Do not overwrite first-pass evidence.
