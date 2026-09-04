---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-04
run_id: UC04-SOL-MEDIUM-R1
repair_index: 5
affected_br_ids: [BR-TXN-08, BR-TXN-15]
---

# Repair 005 — Type required-text transforms without unsafe returns

## Evidence

Containerized backend ESLint reports three `@typescript-eslint/no-unsafe-return` errors in the UC-04 `Transform` callbacks for `itemDescription`, `shopName`, and `paymentMethod`. Runtime behavior is correct, but the callback boundary inherits `any` from class-transformer.

## Required correction

Narrow the transform input through one `unknown`-typed helper and reuse it in the three decorators, preserving trim-before-validation behavior exactly.

## Scope

- Allowed files: `finalsource/be/src/modules/transaction/dto/create-transaction.dto.ts`
- Affected BRs: `BR-TXN-08`, `BR-TXN-15`
- Permitted non-test verification: targeted containerized ESLint for this DTO and backend production build
- Prohibited: validation behavior changes, new fields, schema/API/ownership changes, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and retained BR assessment. Do not overwrite first-pass evidence.
