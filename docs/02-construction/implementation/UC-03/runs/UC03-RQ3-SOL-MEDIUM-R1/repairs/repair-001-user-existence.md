---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-03
run_id: UC03-RQ3-SOL-MEDIUM-R1
repair_index: 1
affected_br_ids: [BR-TXN-01]
---

# Repair 1 — Validate the JWT subject against the User repository

## Evidence

`jwt.strategy.ts` returned the decoded JWT subject without confirming that the corresponding User row still exists.

## Required correction

Make JWT validation reject a subject that has no matching User while preserving token validation and unrelated authentication behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/jwt.strategy.ts`
- Affected BRs: `BR-TXN-01`
- Permitted non-test verification: targeted lint, backend production build, Docker health and bounded authentication observation
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment in the canonical run JSON. Do not overwrite first-pass evidence.
