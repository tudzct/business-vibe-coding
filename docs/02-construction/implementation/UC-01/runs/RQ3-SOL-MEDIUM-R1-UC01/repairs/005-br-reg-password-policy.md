---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 5
repair_id: RQ3-SOL-MEDIUM-R1-UC01-REPAIR-005
category: business_rule
trigger: business_rule_review
fingerprint: br-reg-04-05-password-policy-missing
affected_br_ids: [BR-REG-04, BR-REG-05, BR-REG-08]
status: Complete
started_at: 2026-08-31T10:17:23.313+07:00
started_epoch_ms: 1788146243313
source_revision_before: sha256:42b7d0f9c139df41319febd6dfe28e6cc74085ca5b9043c2e4b729f7094fe38f
model_id: gpt-5.6-sol
reasoning_effort: medium
---

# Repair 005 — Enforce the frozen password policy

## Evidence

- Backend and frontend currently check only that password is present.
- Missing checks are length 8–64, no whitespace, lowercase, uppercase, digit, special character and the frozen permitted-character allowlist.
- Initial audit results: `BR-REG-04=unmet`, `BR-REG-05=unmet`, `BR-REG-08=unmet`.

## Required correction

Add the exact password checks to the authoritative service before any repository access or persistence, and mirror them in preliminary frontend field validation. Do not add requirements beyond the frozen rules.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/auth.service.ts`, `finalsource/fe/src/pages/Register/Register.tsx`
- Affected BRs: `BR-REG-04`, `BR-REG-05`, `BR-REG-08`
- Permitted non-test verification: source inspection; lint/build when dependencies are available
- Prohibited: unrelated policy, schema/API changes and all test creation/execution

## Completion

- Changed files: `finalsource/be/src/modules/auth/auth.service.ts`, `finalsource/fe/src/pages/Register/Register.tsx`
- Verification: backend and frontend production builds passed; source inspection confirms exact length, whitespace, lowercase, uppercase, digit, special-character and permitted-character checks before repository access.
- Ended at: `2026-08-31T10:18:01.782+07:00` (`1788146281783` epoch ms); duration `38.470` seconds.
- Source revision after: `sha256:cef5c07d381561a0f06a749413eb60cce13e560306ccc4f3499b17bf2217117f`
- Token telemetry: unavailable per repair because repairs 002–006 share Codex session turn 5; the shared turn is retained in the canonical run.
- Reassessment: `BR-REG-04=met`, `BR-REG-05=met`, `BR-REG-08=met` from source/build evidence.
