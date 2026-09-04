---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_id: UC06-SOL-MEDIUM-R1-REPAIR-009
repair_index: 9
status: Complete
category: business_rule
trigger: business_rule_review
fingerprint: br-acc-10-owner-account-number-uniqueness
affected_br_ids: [BR-ACC-10]
source_revision_before: sha256:825acac014118ff8f5d6559724261967927143a952d823d6b7b199e1c761bd79
requested_at: 2026-09-04T11:07:41.6181998+07:00
started_at: 2026-09-04T11:11:46.5454784+07:00
started_epoch_ms: 1788495106545
ended_at: 2026-09-04T11:15:48.2061611+07:00
ended_epoch_ms: 1788495348206
duration_seconds: 241.661
source_revision_after: sha256:86782777bd1b825cf388f734a2f458532338469420a3b23408155ccbc358760f
schema_proposal: docs/02-construction/implementation/UC-06/schema.json
---

# Repair 009 — Enforce owner-scoped account-number uniqueness

## Evidence

The immutable first-pass assessment records BR-ACC-10 as unmet. `AccountService.createForUser` creates and saves an account without checking the authenticated owner's existing account numbers. `Account` has no composite unique constraint on `userId` and `accountNumberFull`; therefore, the existing duplicate-driver-error mapping cannot enforce this rule and concurrent requests can persist duplicates.

## Required correction

After explicit researcher approval of the linked schema proposal:

1. Add the approved TypeORM composite unique index metadata for `Account.userId` and `Account.accountNumberFull`.
2. Add one migration that refuses to proceed when existing duplicate owner/account-number groups are present and otherwise creates the approved named composite unique constraint.
3. Add an owner-scoped service precheck that returns the established safe HTTP 409 conflict for an existing number, while retaining duplicate-key mapping for concurrency races.

## Scope

- Allowed files after approval: `finalsource/be/src/modules/account/account.entity.ts`, `finalsource/be/src/modules/account/account.service.ts`, one new file under `finalsource/be/src/database/migrations/`, and approval metadata in `docs/02-construction/implementation/UC-06/schema.json`
- Affected BR: `BR-ACC-10`
- Permitted non-test verification: targeted ESLint for the changed backend files, backend production build, source inspection, and bounded Docker migration/runtime observation when Docker execution is available and authorized
- Prohibited: automatic duplicate-data deletion or rewriting, global account-number uniqueness, public API or ownership changes, repairs to other Business Rules, speculative refactors, and all test creation/execution

## Approval gate

Database schema mutation is required for concurrency-safe enforcement. The Draft proposal is persisted at `docs/02-construction/implementation/UC-06/schema.json`. Do not edit entity metadata, create a migration, or change source until the researcher explicitly approves that proposal.

## Completion

- Researcher approval was recorded at `2026-09-04T11:11:46.5454784+07:00` in the approved schema proposal.
- Changed source files: `finalsource/be/src/modules/account/account.entity.ts`, `finalsource/be/src/modules/account/account.service.ts`, and `finalsource/be/src/database/migrations/1788495106545-add-accounts-owner-account-number-unique.ts`.
- Targeted ESLint: passed with zero warnings for all three changed backend files.
- Backend production build: passed.
- Source evidence: ordinary duplicates are rejected by an authenticated-owner-scoped lookup; the approved composite unique index and duplicate-key mapping enforce the same HTTP 409 outcome under concurrent requests.
- Migration safety: the migration counts duplicate owner/account-number groups and stops before index creation when any exist; it neither reads full account numbers into the repair record nor mutates duplicate data.
- Reassessment: BR-ACC-10 changed from first-pass `unmet` to repaired `met`; the immutable initial assessment remains unchanged.
- Repair duration: 241.661 seconds. Token telemetry is recorded in the canonical run JSON.
