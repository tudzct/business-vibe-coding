---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 6
repair_id: RQ3-SOL-MEDIUM-R1-UC01-REPAIR-006
category: business_rule
trigger: business_rule_review
fingerprint: br-reg-09-bcrypt-cost-12-instead-of-10
affected_br_ids: [BR-REG-09]
status: Complete
started_at: 2026-08-31T10:18:09.971+07:00
started_epoch_ms: 1788146289971
source_revision_before: sha256:cef5c07d381561a0f06a749413eb60cce13e560306ccc4f3499b17bf2217117f
model_id: gpt-5.6-sol
reasoning_effort: medium
---

# Repair 006 — Use the frozen bcrypt cost

## Evidence

- `finalsource/be/src/modules/auth/auth.service.ts` sets `passwordRounds` to 12.
- `BR-REG-09` requires bcrypt cost exactly 10.

## Required correction

Change only the bcrypt cost constant from 12 to 10. Preserve hashing before persistence, transaction behavior, non-logging and response field allowlisting.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/auth.service.ts`
- Affected BRs: `BR-REG-09`
- Permitted non-test verification: source inspection; lint/build when dependencies are available
- Prohibited: unrelated auth changes and all test creation/execution

## Completion

- Changed file: `finalsource/be/src/modules/auth/auth.service.ts`
- Verification: backend production build passed; source inspection confirms bcrypt cost 10 and hashing remains before repository save.
- Ended at: `2026-08-31T10:18:33.472+07:00` (`1788146313472` epoch ms); duration `23.501` seconds.
- Source revision after: `sha256:ff89b5889de3562d0b181b273b55d580b595593b068c220afd13df9307839ea9`
- Token telemetry: unavailable per repair because repairs 002–006 share Codex session turn 5; the shared turn is retained in the canonical run.
- Reassessment: `BR-REG-09=met` from source/build evidence; bounded persistence observation remains blocked by the missing `Users` table.
