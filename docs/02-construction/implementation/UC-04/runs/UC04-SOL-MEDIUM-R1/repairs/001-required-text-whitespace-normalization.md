---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-04
run_id: UC04-SOL-MEDIUM-R1
repair_index: 1
affected_br_ids: [BR-TXN-08, BR-TXN-15]
---

# Repair 001 — Reject whitespace-only required transaction text

## Evidence

`CreateTransactionDto` uses `IsNotEmpty` for `itemDescription`, `shopName`, and `paymentMethod`, while `TransactionService` trims these values only after validation. A direct request containing only whitespace therefore passes DTO validation and can be persisted as an empty mapped field. The immutable initial audit records BR-TXN-08 and BR-TXN-15 as unmet under fingerprint `required-text-whitespace-normalization`.

## Required correction

Normalize each of the three required text inputs with `trim()` before the existing string/non-empty validation. Preserve all other validation, mapping, API, schema, ownership, and transaction behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/transaction/dto/create-transaction.dto.ts`
- Affected BRs: `BR-TXN-08`, `BR-TXN-15`
- Permitted non-test verification: backend TypeScript production build through the existing Dockerfile
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
