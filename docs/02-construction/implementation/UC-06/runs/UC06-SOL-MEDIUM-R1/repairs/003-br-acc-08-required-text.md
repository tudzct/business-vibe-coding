---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_id: UC06-SOL-MEDIUM-R1-REPAIR-003
repair_index: 3
status: Complete
category: business_rule
trigger: business_rule_review
fingerprint: br-acc-08-server-whitespace-required-text
affected_br_ids: [BR-ACC-08]
source_revision_before: sha256:ff020e5ec1b704162b2411ad2105dd4ca28ecdec31947557e13fd88ee9ab781b
started_at: 2026-09-03T21:16:15.3693562+07:00
started_epoch_ms: 1788444975372
ended_at: 2026-09-03T21:16:58.8278449+07:00
ended_epoch_ms: 1788445018828
duration_seconds: 43.456
source_revision_after: sha256:865b3de686dda09f6d1cb3b3b5795bd0f2bfcfe0c931cfb7630f823c7c991752
---

# Repair 003 — Reject whitespace-only required account text

## Evidence

The immutable assessment records BR-ACC-08 as unmet because `finalsource/be/src/modules/account/dto/create-account.dto.ts` uses `IsNotEmpty` without a non-whitespace check, allowing direct API values such as `"   "` for `bank_name` or `account_number_full`.

## Required correction

Add focused DTO validation requiring at least one non-whitespace character for both required text fields. Preserve submitted values, existing required/type validation, and all unrelated behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/account/dto/create-account.dto.ts`
- Affected BRs: `BR-ACC-08`
- Permitted non-test verification: targeted DTO ESLint, backend production build, and source inspection
- Prohibited: other Business Rule repairs, transformations of persisted values, schema/public-API/ownership changes, speculative refactors, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/account/dto/create-account.dto.ts`
- Targeted ESLint: passed with zero warnings.
- Backend production build: passed.
- Source evidence: both required text fields now require a non-whitespace character in addition to their existing string and non-empty constraints.
- Reassessment: BR-ACC-08 changed from first-pass `unmet` to repaired `met`; the immutable initial assessment remains unchanged.
- Repair duration: 43.456 seconds. Token telemetry is recorded in the canonical run JSON.
