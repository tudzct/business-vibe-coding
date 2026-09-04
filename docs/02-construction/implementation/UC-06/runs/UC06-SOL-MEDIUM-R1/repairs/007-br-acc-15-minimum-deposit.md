---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_id: UC06-SOL-MEDIUM-R1-REPAIR-007
repair_index: 7
status: Complete
category: business_rule
trigger: business_rule_review
fingerprint: br-acc-15-type-specific-minimum-deposit
affected_br_ids: [BR-ACC-15]
source_revision_before: sha256:d2d1c1121119e672208f01a8fb5ecd84e4a09f7d7b0ac001145b809889badee3
started_at: 2026-09-03T21:36:49.2513780+07:00
started_epoch_ms: 1788446209254
ended_at: 2026-09-03T21:37:40.7674211+07:00
ended_epoch_ms: 1788446260767
duration_seconds: 51.513
source_revision_after: sha256:4c4d7bdeb8417515e5dbd85c2ec4deb689e5c2058b218489c0143077ca74694c
---

# Repair 007 — Enforce type-specific minimum initial deposits

## Evidence

The immutable assessment records BR-ACC-15 as unmet because the generated flow has no 50,000 minimum for Savings and Investment. Repair 004 established the separate zero minimum for other account types.

## Required correction

Reject Savings or Investment balances below 50,000 in both the frontend validator and backend service. Preserve the general non-negative validation for all other account types.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.service.ts`, `finalsource/fe/src/components/AddAccountForm/AddAccountForm.tsx`
- Affected BRs: `BR-ACC-15`
- Permitted non-test verification: targeted ESLint for both changed files, backend production build, frontend production build, and source inspection
- Prohibited: other Business Rule repairs, DTO/schema/public-API/ownership changes, speculative refactors, and all test creation/execution.

## Completion

- Changed files: `finalsource/be/src/modules/account/account.service.ts`, `finalsource/fe/src/components/AddAccountForm/AddAccountForm.tsx`
- Targeted ESLint: both changed files passed with zero warnings.
- Backend and frontend production builds: passed.
- Source evidence: both layers reject Savings or Investment balances below 50,000; other types retain the existing zero minimum.
- Reassessment: BR-ACC-15 changed from first-pass `unmet` to repaired `met`; the immutable initial assessment remains unchanged.
- Repair duration: 51.513 seconds. Token telemetry is recorded in the canonical run JSON.
