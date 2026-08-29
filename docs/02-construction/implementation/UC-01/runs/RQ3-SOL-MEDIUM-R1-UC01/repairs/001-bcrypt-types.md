---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 1
affected_br_ids: [BR-REG-09, BR-REG-11]
---

# Repair 1 — Missing bcrypt TypeScript declaration

## Evidence

The frozen first-pass Docker Compose backend build failed with `TS7016: Could not find a declaration file for module 'bcrypt'` at `finalsource/be/src/modules/auth/auth.service.ts`.

## Required correction

Add the smallest local declaration for the bcrypt `hash` function used by UC-01, without changing runtime dependencies or hashing behavior.

## Scope

- Allowed files: `finalsource/be/src/types/bcrypt.d.ts`
- Affected BRs: BR-REG-09, BR-REG-11
- Permitted non-test verification: Docker Compose backend build
- Prohibited: new features, speculative refactors, dependency/schema/public-API/ownership changes, and all test creation/execution.

## Completion

Record the changed file, Docker build evidence, automatic time/tokens and reassessment without overwriting first-pass evidence.
