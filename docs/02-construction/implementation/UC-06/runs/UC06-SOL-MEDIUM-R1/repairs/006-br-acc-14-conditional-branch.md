---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_id: UC06-SOL-MEDIUM-R1-REPAIR-006
repair_index: 6
status: Complete
category: business_rule
trigger: business_rule_review
fingerprint: br-acc-14-conditional-branch-not-enforced
affected_br_ids: [BR-ACC-14]
source_revision_before: sha256:371dd24d2c73734d87f0e70955c9f09d0f287a4a69eba3cbc40bd71c319c3fe2
started_at: 2026-09-03T21:32:19.3335106+07:00
started_epoch_ms: 1788445939337
ended_at: 2026-09-03T21:33:24.1853868+07:00
ended_epoch_ms: 1788446004185
duration_seconds: 64.848
source_revision_after: sha256:d2d1c1121119e672208f01a8fb5ecd84e4a09f7d7b0ac001145b809889badee3
---

# Repair 006 — Require branch name for Loan and Investment accounts

## Evidence

The immutable assessment records BR-ACC-14 as unmet because both layers treat `branch_name` as unconditionally optional, allowing Loan and Investment creation without a non-empty branch.

## Required correction

Reject a missing, empty, or whitespace-only branch when account type is Loan or Investment in both the frontend validator and backend service. Keep branch optional and nullable for every other account type.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.service.ts`, `finalsource/fe/src/components/AddAccountForm/AddAccountForm.tsx`
- Affected BRs: `BR-ACC-14`
- Permitted non-test verification: targeted ESLint for both changed files, backend production build, frontend production build, and source inspection
- Prohibited: other Business Rule repairs, DTO/schema/public-API/ownership changes, speculative refactors, and all test creation/execution.

## Completion

- Changed files: `finalsource/be/src/modules/account/account.service.ts`, `finalsource/fe/src/components/AddAccountForm/AddAccountForm.tsx`
- Targeted ESLint: both changed files passed with zero warnings.
- Backend and frontend production builds: passed.
- Source evidence: both layers reject missing or blank branch names for Loan and Investment, while other account types retain optional branch handling.
- Reassessment: BR-ACC-14 changed from first-pass `unmet` to repaired `met`; the immutable initial assessment remains unchanged.
- Repair duration: 64.848 seconds. Token telemetry is recorded in the canonical run JSON.
