---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 4
repair_id: RQ3-SOL-MEDIUM-R1-UC01-REPAIR-004
category: business_rule
trigger: business_rule_review
fingerprint: br-reg-02-email-max-length-and-normalized-validation-missing
affected_br_ids: [BR-REG-02, BR-REG-08]
status: Complete
started_at: 2026-08-31T10:16:38.378+07:00
started_epoch_ms: 1788146198378
source_revision_before: sha256:42d714927b93cf227230109c0093d6310ba668c278244e574306d12f7c5f09a3
model_id: gpt-5.6-sol
reasoning_effort: medium
---

# Repair 004 — Validate normalized email and its maximum length

## Evidence

- The DTO validates email format before trim/lower normalization and has no normalized 255-character bound.
- Frontend validation trims for format but has no 255-character bound.
- Initial audit results: `BR-REG-02=unmet`; `BR-REG-08=unmet`.

## Required correction

Validate email format and the 255-character maximum against `lower(trim(email))` in the authoritative service. Apply the same maximum to preliminary frontend validation and continue persisting/returning the normalized email.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/dto/register.dto.ts`, `finalsource/be/src/modules/auth/auth.service.ts`, `finalsource/fe/src/pages/Register/Register.tsx`
- Affected BRs: `BR-REG-02`, `BR-REG-08`
- Permitted non-test verification: source inspection; lint/build when dependencies are available
- Prohibited: unrelated validation, schema/API changes and all test creation/execution

## Completion

- Changed files: `finalsource/be/src/modules/auth/dto/register.dto.ts`, `finalsource/be/src/modules/auth/auth.service.ts`, `finalsource/fe/src/pages/Register/Register.tsx`
- Verification: backend and frontend production builds passed; source inspection confirms format and 255-character checks use the trimmed normalized email before repository access.
- Ended at: `2026-08-31T10:17:07.044+07:00` (`1788146227044` epoch ms); duration `28.666` seconds.
- Source revision after: `sha256:42b7d0f9c139df41319febd6dfe28e6cc74085ca5b9043c2e4b729f7094fe38f`
- Token telemetry: unavailable per repair because repairs 002–006 share Codex session turn 5; the shared turn is retained in the canonical run.
- Reassessment: `BR-REG-02=met`; `BR-REG-08` remained unmet until repair 005.
