---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 3
affected_br_ids: [BR-REG-02, BR-REG-08]
---

# Repair 3 — Enforce normalized registration email maximum

## Evidence

The frozen first pass required a syntactically valid email and normalized it in the service, but neither validation layer rejected a normalized email longer than 255 characters before persistence.

## Required correction

Trim and lowercase registration email before validation, enforce the 255-character maximum in both validation layers, and submit the normalized value.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/dto/register.dto.ts`, `finalsource/fe/src/components/auth/SignUpForm.tsx`
- Affected BRs: BR-REG-02, BR-REG-08
- Permitted non-test verification: Docker Compose backend and frontend builds
- Prohibited: unrelated validation changes, new features, schema/public-API/ownership changes, and all test creation/execution.

## Completion

Record changed files, Docker build evidence, automatic time/tokens and reassessment without overwriting first-pass evidence.
