---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-03
run_id: UC03-RQ3-SOL-MEDIUM-R1
repair_index: 2
affected_br_ids: [BR-TXN-02]
---

# Repair 2 — Exclude Failed transactions older than 30 days

## Evidence

`transaction.service.ts` had no status/date predicate for the failed-transaction retention window.

## Required correction

Add the smallest query predicate that retains all non-Failed rows and only Failed rows dated within the current-date 30-day window.

## Scope

- Allowed files: `finalsource/be/src/modules/transaction/transaction.service.ts`
- Affected BRs: `BR-TXN-02`
- Permitted non-test verification: targeted lint, backend production build, Docker health and bounded SQL/API observation
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment in the canonical run JSON. Do not overwrite first-pass evidence.
