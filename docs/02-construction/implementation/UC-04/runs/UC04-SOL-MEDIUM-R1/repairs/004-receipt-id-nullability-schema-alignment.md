---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-04
run_id: UC04-SOL-MEDIUM-R1
repair_index: 4
affected_br_ids: [BR-TXN-14, BR-TXN-15]
---

# Repair 004 — Align receipt_id nullability with approved UC-04 creation

## Evidence

Read-only MySQL metadata shows `transactions.receipt_id` is `INT UNSIGNED NOT NULL` with no default. The approved UC-04 prompt supplies no receipt input and requires `receiptId` to be `integer | null`; the current service therefore cannot persist its intended null value. The researcher approved `docs/02-construction/implementation/UC-04/schema.json` in the active session.

## Required correction

Add the approved guarded TypeORM migration making only `transactions.receipt_id` nullable, and align the entity column metadata/type to `INT UNSIGNED | null`. Preserve every other schema, API, mapping, ownership, and transaction behavior.

## Scope

- Allowed files: `finalsource/be/src/database/migrations/20260901101931-make-transactions-receipt-id-nullable.ts`, `finalsource/be/src/modules/transaction/transaction.entity.ts`
- Affected BRs: `BR-TXN-14`, `BR-TXN-15`
- Permitted non-test verification: backend Docker production build, Compose migration/startup, bounded authenticated transaction runtime observation
- Prohibited: unrelated schema/API/ownership changes, fabricated receipt identifiers, destructive data operations, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
