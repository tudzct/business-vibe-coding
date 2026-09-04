---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_id: UC06-SOL-MEDIUM-R1-REPAIR-008
repair_index: 8
status: Complete
category: business_rule
trigger: business_rule_review
fingerprint: br-acc-16-investment-capacity-query-missing
affected_br_ids: [BR-ACC-16]
source_revision_before: sha256:4c4d7bdeb8417515e5dbd85c2ec4deb689e5c2058b218489c0143077ca74694c
started_at: 2026-09-03T21:48:34.1269131+07:00
started_epoch_ms: 1788446914130
ended_at: 2026-09-03T21:49:29.8193518+07:00
ended_epoch_ms: 1788446969819
duration_seconds: 55.689
source_revision_after: sha256:825acac014118ff8f5d6559724261967927143a952d823d6b7b199e1c761bd79
---

# Repair 008 — Enforce Investment financial capacity

## Evidence

The immutable assessment records BR-ACC-16 as unmet because Investment creation performs no owner-scoped query or sum of existing Checking and Savings balances.

## Required correction

Before creating an Investment account, query only the authenticated user's existing Checking and Savings accounts, sum their balances, and reject creation unless the total is at least 100,000. Convert query failures to the established safe create-account HTTP 500 message.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.service.ts`
- Affected BRs: `BR-ACC-16`
- Permitted non-test verification: targeted account-service ESLint, backend production build, and source inspection
- Prohibited: BR-ACC-10 or other Business Rule repairs, schema/public-API/ownership changes, speculative refactors, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/account/account.service.ts`
- Targeted ESLint: passed with zero warnings.
- Backend production build: passed.
- Source evidence: Investment creation sums only the authenticated user's Checking and Savings balances, rejects totals below 100,000, and maps aggregate failures to a safe HTTP 500.
- Reassessment: BR-ACC-16 changed from first-pass `unmet` to repaired `met`; the immutable initial assessment remains unchanged.
- Repair duration: 55.689 seconds. Token telemetry is recorded in the canonical run JSON.
