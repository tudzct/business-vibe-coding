---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-02
run_id: UC02-SOL-MEDIUM-R1
repair_id: UC02-SOL-MEDIUM-R1-REPAIR-001
repair_index: 1
status: Complete
category: business_rule
trigger: business_rule_review
fingerprint: br-log-01-raw-email-validated-before-normalization
affected_br_ids: [BR-LOG-01]
source_revision_before: sha256:a0ae8b9b34fc5635b53dff48ea9f399cc8860ab67d44822df3f640cbdcc52f33
started_at: 2026-08-31T21:42:00.5771979+07:00
started_epoch_ms: 1788187320577
ended_at: 2026-08-31T21:43:19.4747441+07:00
ended_epoch_ms: 1788187399474
duration_seconds: 78.897
source_revision_after: sha256:a8b0acde22669644304c07aea447890ae3a8b483d8d2dac72da2bae353b597a7
---

# Repair 001 — Normalize login email before backend format validation

## Evidence

`finalsource/be/src/modules/auth/dto/login.dto.ts:4-9` applies `IsEmail` to the raw DTO value, while `finalsource/be/src/modules/auth/auth.service.ts:40-42` trims and lowercases only after the global ValidationPipe has accepted the DTO. A directly submitted email with surrounding whitespace is therefore rejected even though BR-LOG-01 validates `lower(trim(dto.email))`.

## Required correction

Normalize string email input with `trim().toLowerCase()` before the DTO's email-format validation. Preserve non-string values unchanged so `IsString` continues to reject them through the normalized HTTP 400 path.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/dto/login.dto.ts`
- Affected BRs: `BR-LOG-01`
- Permitted non-test verification: targeted ESLint for the DTO, backend TypeScript/Nest production build, source inspection, and Docker runtime observation when available
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, unrelated lint repairs, and all test creation/execution

## Completion

- Changed file: `finalsource/be/src/modules/auth/dto/login.dto.ts`
- Targeted ESLint: passed with zero warnings.
- Backend production build: passed.
- Source evidence: the DTO transform now preserves non-string values for `IsString` and normalizes string values with `trim().toLowerCase()` before `IsEmail`.
- Reassessment: `BR-LOG-01` changed from first-pass `unmet` to repaired `met`; the initial assessment remains unchanged.
- Repair telemetry: turn 2, 1,306,752 total tokens (24,133 fresh input, 1,277,184 cache-read, 5,435 output; estimated cost USD 0.9223).
- Docker runtime observation: unavailable because Docker CLI/Compose remains inaccessible from the current execution environment.
