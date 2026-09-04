---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_id: UC06-SOL-MEDIUM-R1-REPAIR-005
repair_index: 5
status: Complete
category: business_rule
trigger: business_rule_review
fingerprint: br-acc-13-server-account-number-format
affected_br_ids: [BR-ACC-13]
source_revision_before: sha256:6e63f68df05d12c873b8b91630eb79ea12857d9d380c97ea2c0b205d3e1fa1bf
started_at: 2026-09-03T21:26:56.2068171+07:00
started_epoch_ms: 1788445616210
ended_at: 2026-09-03T21:27:38.3623162+07:00
ended_epoch_ms: 1788445658363
duration_seconds: 42.153
source_revision_after: sha256:371dd24d2c73734d87f0e70955c9f09d0f287a4a69eba3cbc40bd71c319c3fe2
---

# Repair 005 — Enforce account-number format at the server boundary

## Evidence

The immutable assessment records BR-ACC-13 as unmet because the frontend enforces 8–34 digits, while `CreateAccountDto.account_number_full` only requires a non-empty, non-whitespace string and therefore permits invalid direct API values.

## Required correction

Add focused backend DTO validation requiring exactly 8–34 ASCII digits. Preserve the existing required-text validation and frontend behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/account/dto/create-account.dto.ts`
- Affected BRs: `BR-ACC-13`
- Permitted non-test verification: targeted DTO ESLint, backend production build, and source inspection
- Prohibited: other Business Rule repairs, schema/public-API/ownership changes, speculative refactors, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/account/dto/create-account.dto.ts`
- Targeted ESLint: passed with zero warnings.
- Backend production build: passed.
- Source evidence: `account_number_full` now requires exactly 8–34 ASCII digits at the server boundary while retaining prior required-text checks.
- Reassessment: BR-ACC-13 changed from first-pass `unmet` to repaired `met`; the immutable initial assessment remains unchanged.
- Repair duration: 42.153 seconds. Token telemetry is recorded in the canonical run JSON.
