---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 1
repair_id: RQ3-SOL-MEDIUM-R1-UC01-REPAIR-001
category: business_rule
trigger: business_rule_review
fingerprint: br-reg-01-missing-normalized-name-length-and-pattern
affected_br_ids: [BR-REG-01, BR-REG-08]
status: Complete
started_at: 2026-08-31T10:10:28.496+07:00
started_epoch_ms: 1788145828496
source_revision_before: sha256:7ace3a711e690461bd0798d0f2a48ff17ae0fa45d379faf35bb0de09a49e2bb5
model_id: gpt-5.6-sol
reasoning_effort: medium
---

# Repair 001 — Enforce the normalized full-name contract

## Evidence

- `finalsource/be/src/modules/auth/auth.service.ts:35-39` trims the name but does not NFC-normalize it or enforce the 4–25 Unicode-letter and single-space contract.
- `finalsource/fe/src/pages/Register/Register.tsx:87` checks only whether the name is empty.
- Initial audit results: `BR-REG-01=unmet`; `BR-REG-08=unmet`.

## Required correction

Normalize `fullName` with trim plus NFC. Before any API call or persistence, require 4–25 normalized characters and Unicode-letter words separated by exactly one ordinary space. Persist and return the normalized value. Do not change the public request shape or unrelated registration behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/auth.service.ts`, `finalsource/fe/src/pages/Register/Register.tsx`
- Affected BRs: `BR-REG-01`, `BR-REG-08`
- Permitted non-test verification: source inspection; backend/frontend lint or build only when dependencies are available
- Prohibited: new features, unrelated refactors, schema/public-API/ownership changes, and all test creation/execution

## Completion

- Changed files: `finalsource/be/src/modules/auth/auth.service.ts`, `finalsource/fe/src/pages/Register/Register.tsx`
- Verification: source inspection confirms trim plus NFC normalization, 4–25 character bounds and the Unicode-letter/single-space pattern in both layers; the backend persists the normalized value.
- Ended at: `2026-08-31T10:12:15.821+07:00` (`1788145935822` epoch ms)
- Duration: `107.326` seconds
- Source revision after: `sha256:57147d88c63e3af84992557c910c701d30c8acad86897b11df79e53119a984bf`
- Token telemetry: Codex session turn 4, `485030` total tokens
- Reassessment: `BR-REG-01=met`; `BR-REG-08=unmet` because other invalid-input validators remain absent.
