---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-11
run_id: RQ3-SOL-MEDIUM-R1-UC11
repair_id: RQ3-SOL-MEDIUM-R1-UC11-REPAIR-001
repair_index: 1
affected_br_ids: [BR-EXP-CAT-03, BR-EXP-CAT-05]
category: business_rule
trigger: business_rule_review
fingerprint: unresolved-non-null-category-collapsed-into-uncategorized
status: complete
started_at: 2026-09-01T09:13:06.937809Z
ended_at: 2026-09-01T09:13:47.144261Z
duration_seconds: 40.206
source_revision_before: sha256:aa5767ed73145d73f30c477096275d6a0645ca584b91eb09128a28cf8b30c120
source_revision_after: sha256:fc09e369fc9614d45921ad5ac2b617a5d56df713f3200c95a01332882e2663b0
---

# Repair 1 — Preserve null versus unresolved category classification

## Evidence

`finalsource/be/src/modules/expenses/expenses.service.ts:93,102,147` uses a left join and maps every absent joined Category to `Uncategorized`, so a transaction with a non-null unresolved `categoryId` cannot produce `Unknown`.

## Required correction

Add one local category-label mapping that returns the joined `Category.categoryName` when resolved, `Uncategorized` only when `categoryId` is null, and `Unknown` when `categoryId` is non-null but unresolved. Reuse it for current- and previous-month aggregation without changing query scope or response fields.

## Scope

- Allowed files: `finalsource/be/src/modules/expenses/expenses.service.ts`
- Affected BRs: `BR-EXP-CAT-03`, `BR-EXP-CAT-05`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/expenses/expenses.service.ts`
- Verification: Docker backend production build passed after the correction.
- Result: `BR-EXP-CAT-03` category classification is met; the category-classification portion of `BR-EXP-CAT-05` is corrected, while its independent zero-baseline defect remains for Repair 2.
- Model: `gpt-5.6-sol`, medium/standard, same as the Confirmed generation assignment.
- Tokens: per-repair attribution is unavailable because all authorized repairs share one Codex turn; aggregate repair-turn telemetry is recorded in the canonical run JSON.
- First-pass evidence remains unchanged.
