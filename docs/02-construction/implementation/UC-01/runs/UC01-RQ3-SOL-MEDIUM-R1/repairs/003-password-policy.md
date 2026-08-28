---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: UC01-RQ3-SOL-MEDIUM-R1
repair_index: 3
affected_br_ids: [BR-REG-04, BR-REG-05, BR-REG-08]
---

# Repair 3 — Enforce registration password policy and permitted characters

## Evidence

`finalsource/fe/src/components/auth/SignUpForm.tsx` and `finalsource/be/src/modules/auth/dto/register.dto.ts` require only a non-empty password. They omit length, whitespace, composition and permitted-character enforcement.

## Required correction

Add the complete password policy to both validation layers without trimming or otherwise normalizing password values.

## Scope

- Allowed files: `finalsource/fe/src/components/auth/SignUpForm.tsx`; `finalsource/be/src/modules/auth/dto/register.dto.ts`
- Affected BRs: `BR-REG-04`, `BR-REG-05`, `BR-REG-08`
- Permitted non-test verification: source inspection; Docker build/runtime when the daemon becomes available
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions and all test creation/execution.

## Completion

Record changed files, automatic timing, source hashes and reassessment without changing first-pass evidence.
