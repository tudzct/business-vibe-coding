---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-08
run_id: UC08-RQ3-SOL-MEDIUM-R1
repair_id: UC08-RQ3-SOL-MEDIUM-R1-REPAIR-001
repair_index: 1
category: business_rule
trigger: business_rule_review
fingerprint: account-update-bank-name-exact-storage-mapping
affected_br_ids: [BR-ACC-26]
status: Completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
effective_model_id: gpt-5.6-sol
session_turn_id: 6
runtime_turn_id: 01a07649-69dd-78f1-a882-f8138ccc5155
started_at: 2026-09-06T10:36:10.1108569Z
started_epoch_ms: 1788690970110
source_revision_before: sha256:50222846e9fb8ebaf734b43525a97dac40ffb7329157ad3be077b007bd9d874d
source_revision_after: sha256:a6ea996dac1a53cd77ee945b4d72febdf31979e0950709ebcea65940ccd6aa95
ended_at: 2026-09-06T10:38:23.8936719Z
ended_epoch_ms: 1788691103893
duration_seconds: 133.783
turn_duration_seconds: 261.313
total_tokens: 3013039
fresh_input_tokens: 206822
cached_input_tokens: 2799232
total_input_tokens: 3006054
output_tokens: 6985
reasoning_tokens: 1699
---

# Repair 1 — Preserve the exact validated bank name during update

## Evidence

`finalsource/be/src/modules/account/account.service.ts:287` assigns `dto.bank_name.trim()` to `account.bankName`. BR-ACC-26 requires the stored `bank_name` to equal the validated submitted `dto.bank_name`; surrounding whitespace is permitted by the validation rule but is silently changed by the current persistence mapping.

## Required correction

Assign the validated `dto.bank_name` value directly to `account.bankName`. Preserve all other update validation, ownership, uniqueness, derivation, persistence, response, and error behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.service.ts`
- Affected BRs: `BR-ACC-26`
- Permitted non-test verification: targeted ESLint for `account.service.ts` and Nest production build
- Prohibited: new features, speculative refactors, schema/public-API/ownership changes, changes to frozen first-pass evidence, and all test creation/execution.

## Completion

Record the one changed file, targeted lint/build evidence, automatic time endpoints, source revision after repair, and reassessment of BR-ACC-26. Do not overwrite the immutable first-pass result.

Implementation completed with only `finalsource/be/src/modules/account/account.service.ts` changed. Targeted ESLint and the Nest production build passed. Closed session turn 6 consumed 3,013,039 total tokens and had a 261.313-second runner duration; the bounded source-repair timer was 133.783 seconds.
