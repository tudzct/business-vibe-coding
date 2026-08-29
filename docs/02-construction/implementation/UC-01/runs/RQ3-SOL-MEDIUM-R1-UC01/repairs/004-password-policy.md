---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 4
affected_br_ids: [BR-REG-04, BR-REG-05, BR-REG-08]
---

# Repair 4 — Enforce registration password policy and permitted characters

## Evidence

The frozen first pass required only a non-empty password. It omitted the 8–64 character range, whitespace exclusion, lowercase/uppercase/digit/special composition, and permitted-character constraint, so invalid passwords could reach persistence.

## Required correction

Enforce the complete password constraint in both validation layers: length 8–64, at least one lowercase letter, uppercase letter, digit and permitted special character, with every character limited to the supplied ASCII letter, digit and special-character set.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/dto/register.dto.ts`, `finalsource/fe/src/components/auth/SignUpForm.tsx`
- Affected BRs: BR-REG-04, BR-REG-05, BR-REG-08
- Permitted non-test verification: Docker Compose backend and frontend builds
- Prohibited: unrelated validation changes, new features, schema/public-API/ownership changes, and all test creation/execution.

## Completion

Record changed files, Docker build evidence, automatic time/tokens and reassessment without overwriting first-pass evidence.
