---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 2
affected_br_ids: [BR-REG-01, BR-REG-08]
---

# Repair 2 — Complete normalized full-name validation

## Evidence

The frozen first pass only required a non-empty trimmed name. It did not enforce the normalized 4–25 character range or Unicode-letter words separated by exactly one ASCII space, so invalid names could reach persistence.

## Required correction

Normalize full names with NFC and outer trimming, then enforce length 4–25 and `^\p{L}+(?: \p{L}+)*$` in both validation layers before submission or persistence.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/dto/register.dto.ts`, `finalsource/fe/src/components/auth/SignUpForm.tsx`
- Affected BRs: BR-REG-01, BR-REG-08
- Permitted non-test verification: Docker Compose backend and frontend builds
- Prohibited: unrelated validation changes, new features, schema/public-API/ownership changes, and all test creation/execution.

## Completion

Record changed files, Docker build evidence, automatic time/tokens and reassessment without overwriting first-pass evidence.
