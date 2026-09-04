---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_index: 3
affected_br_ids: [BR-ACC-13]
---

# Repair 3 — BR-ACC-13 client digit validation

## Evidence

`finalsource/fe/src/pages/AddAccount/AddAccountForm.tsx:63` tests the account number after trimming it, so a value with surrounding whitespace can pass client validation even though the payload preserves and submits those non-digit characters. BR-ACC-13 requires the submitted account number to contain only digits and the frontend enforcement layer must block invalid input before submission.

## Required correction

Apply the 8–34 digit pattern to the exact controlled account-number value. Preserve request construction, backend validation and all other form behavior.

## Scope

- Allowed files: `finalsource/fe/src/pages/AddAccount/AddAccountForm.tsx`
- Affected BRs: `BR-ACC-13`
- Permitted non-test verification: targeted ESLint, TypeScript compilation and frontend production build
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassess BR-ACC-13 without overwriting the source evidence from the first pass.
