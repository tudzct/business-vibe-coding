---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-02
run_id: UC02-SOL-MEDIUM-R1
repair_index: 2
affected_br_ids: [BR-LOG-01, BR-LOG-03, BR-LOG-04, BR-LOG-05, BR-LOG-06]
---

# Repair 2 — Normalize login email before validation and lookup

## Evidence

`Business-rule source review found that LoginForm validates/sends values.email unchanged and LoginDto performs no transform, while BR-LOG-01/03/04/05/06 compare and validate lower(trim(email)).`

## Required correction

Apply `trim().toLowerCase()` to email in the client request before validation/submission and in the backend DTO transform before validation/service lookup. Do not transform the password or change unrelated behavior.

## Scope

- Allowed files: `finalsource/fe/src/components/auth/LoginForm.tsx`, `finalsource/be/src/modules/auth/dto/login.dto.ts`
- Affected BRs: `BR-LOG-01`, `BR-LOG-03`, `BR-LOG-04`, `BR-LOG-05`, `BR-LOG-06`
- Permitted non-test verification: Docker Compose production build and bounded login runtime observation
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
