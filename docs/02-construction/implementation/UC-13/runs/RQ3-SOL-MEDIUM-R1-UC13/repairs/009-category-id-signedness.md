---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-13
run_id: RQ3-SOL-MEDIUM-R1-UC13
repair_id: RQ3-SOL-MEDIUM-R1-UC13-REPAIR-009
repair_index: 9
affected_br_ids: [BR-GOAL-VIEW-03, BR-GOAL-VIEW-05, BR-GOAL-VIEW-06]
category: technical
trigger: runtime
fingerprint: backend-startup-goals-category-foreign-key-signedness-mismatch
status: complete
started_at: 2026-09-05T16:35:13.022+07:00
source_revision_before: sha256:807d6f6260fd36aee0732f115032f7c049cb3d0af4f7e39dba90df3b02bd93c7
ended_at: 2026-09-05T16:37:48.686+07:00
duration_seconds: 155.664
source_revision_after: sha256:2b1c2d8218bf20fed76d1e9bb8a6e09a8d1989028f244982fca08caa0e58304d
---

# Repair 9 — Align category identifier signedness

## Evidence

The approved prerequisite recovery completed, but `CreateGoalsTableIfMissing20260903105626` fails with `ER_FK_INCOMPATIBLE_COLUMNS`: its `Goals.category_id` is `INT UNSIGNED`, while read-only metadata confirms `categories.category_id` and `transactions.category_id` are signed `INT`.

## Required correction

Implement approved amendment `UC-13-SCHEMA-RUNTIME-001`: safely align category identifiers to unsigned in the category and transaction mappings and through one foreign-key-preserving migration ordered before Goals creation.

## Scope

- Allowed files: `finalsource/be/src/modules/category/category.entity.ts`, `finalsource/be/src/modules/transaction/transaction.entity.ts`, and one new migration immediately before `20260903105626-create-goals-table-if-missing.ts`
- Affected BRs: runtime evaluability for `BR-GOAL-VIEW-03`, `BR-GOAL-VIEW-05`, and `BR-GOAL-VIEW-06`; no BR semantics change
- Permitted non-test verification: source inspection, backend production build, Compose health/reachability, and bounded UC-13 HTTP observations
- Prohibited: seed data, volume reset, destructive cleanup, unrelated schema/API/BR changes, dependency changes, and all tests

## Completion

Added `20260903105625-align-category-ids-unsigned.ts` and aligned `Category.categoryId` and `Transaction.categoryId` entity mappings to unsigned. The backend production build passed and the migration completed. The first runtime retry then exposed the older account-unique migration's duplicate-index defect, resolved by repair 010. Final database/backend/frontend health passed. Model: `gpt-5.6-sol`, medium/standard. Per-repair tokens are unavailable because the repair shares an aggregate runner turn.
