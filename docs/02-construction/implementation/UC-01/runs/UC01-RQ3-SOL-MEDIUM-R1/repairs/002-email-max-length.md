---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: UC01-RQ3-SOL-MEDIUM-R1
repair_index: 2
affected_br_ids: [BR-REG-02, BR-REG-08]
---

# Repair 2 — Enforce normalized registration email maximum

## Evidence

`finalsource/fe/src/components/auth/SignUpForm.tsx` and `finalsource/be/src/modules/auth/dto/register.dto.ts` normalize and format-check email but do not reject a normalized email longer than 255 characters before persistence.

## Required correction

Add the 255-character maximum to frontend and backend validation without changing normalization, API shape or persistence behavior.

## Scope

- Allowed files: `finalsource/fe/src/components/auth/SignUpForm.tsx`; `finalsource/be/src/modules/auth/dto/register.dto.ts`
- Affected BRs: `BR-REG-02`, `BR-REG-08`
- Permitted non-test verification: source inspection; Docker build/runtime when the daemon becomes available
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions and all test creation/execution.

## Completion

Record changed files, automatic timing, source hashes and reassessment without changing first-pass evidence.
