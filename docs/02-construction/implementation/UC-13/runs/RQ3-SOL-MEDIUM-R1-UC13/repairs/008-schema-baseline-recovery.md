---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-13
run_id: RQ3-SOL-MEDIUM-R1-UC13
repair_id: RQ3-SOL-MEDIUM-R1-UC13-REPAIR-008
repair_index: 8
affected_br_ids: [BR-GOAL-VIEW-01, BR-GOAL-VIEW-03, BR-GOAL-VIEW-04, BR-GOAL-VIEW-05, BR-GOAL-VIEW-06]
category: technical
trigger: runtime
fingerprint: backend-startup-transactions-table-missing-during-nullability-migration
status: complete
started_at: 2026-09-05T16:23:05.287+07:00
source_revision_before: sha256:67cb2da43f7fc890d57309db479a446854cd3f292363cd07925e1870818ff06b
---

# Repair 8 — Recover the missing UC-13 read-domain schema baseline

## Evidence

Docker Compose builds both images and makes MySQL healthy, but backend initialization repeatedly fails in `MakeTransactionsReceiptIdNullable20260901101931` because `transactions` does not exist. The repository has no migration creating the prerequisite `categories`, `accounts`, and `transactions` tables before the existing Goals migration.

## Required correction

Implement exactly the researcher-approved idempotent recovery contract in `docs/02-construction/implementation/UC-13/schema.json`: preflight compatible existing tables, create only missing prerequisite tables in dependency order, retain the approved receipt-nullability behavior, and guard rollback against data loss.

## Scope

- Allowed file: `finalsource/be/src/database/migrations/20260901101931-make-transactions-receipt-id-nullable.ts`
- Schema authority: `docs/02-construction/implementation/UC-13/schema.json`, approved at `2026-09-05T16:23:05.287+07:00`
- Affected BRs: runtime evaluability for `BR-GOAL-VIEW-01`, `BR-GOAL-VIEW-03`, `BR-GOAL-VIEW-04`, `BR-GOAL-VIEW-05`, and `BR-GOAL-VIEW-06`; no BR semantics change
- Permitted non-test verification: source inspection, backend production build, Compose health/reachability, and bounded UC-13 HTTP observation
- Prohibited: seed data, volume reset, destructive rollback, unrelated schema/API/BR changes, dependency changes, and all test creation/execution

## Completion

- Approved recovery implementation compiled and created the missing `categories`, `accounts`, and `transactions` tables without seed data or volume reset.
- Source revision after this attempt: `sha256:807d6f6260fd36aee0732f115032f7c049cb3d0af4f7e39dba90df3b02bd93c7`
- Attempt ended: `2026-09-05T16:28:59.811+07:00` (353.525 seconds)
- Backend production build: PASS.
- Runtime follow-up: BLOCKED by `DEP-20260905-003`; the existing unsigned `Goals.category_id` foreign key is incompatible with the approved signed `categories.category_id` baseline.
- Required next decision: approve `UC-13-SCHEMA-RUNTIME-001` before any signedness or foreign-key change.
- Model: `gpt-5.6-sol`, medium/standard. Tokens share the aggregate repair turn and are not individually attributable.

The researcher approved the amendment. Follow-up repairs 009 and 010 resolved the signedness and migration-idempotency blockers; final Compose health passed without changing the source revision attributed to this repair attempt.
