---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: UC01-RQ3-SOL-MEDIUM-R1
repair_index: 1
affected_br_ids: [BR-REG-01, BR-REG-08]
---

# Repair 1 — Complete normalized full-name validation

## Evidence

`finalsource/fe/src/components/auth/SignUpForm.tsx` and `finalsource/be/src/modules/auth/dto/register.dto.ts` only require a non-empty normalized name. They do not enforce 4-25 characters or Unicode-letter words separated by single spaces.

## Required correction

Add the complete normalized full-name length and pattern validation to both layers while preserving all unrelated behavior.

## Scope

- Allowed files: `finalsource/fe/src/components/auth/SignUpForm.tsx`; `finalsource/be/src/modules/auth/dto/register.dto.ts`
- Affected BRs: `BR-REG-01`, `BR-REG-08`
- Permitted non-test verification: source inspection; Docker build/runtime when the daemon becomes available
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions and all test creation/execution.

## Completion

Record changed files, automatic timing, source hashes and reassessment without changing first-pass evidence.
