---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-11
run_id: RQ3-SOL-MEDIUM-R1-UC11
repair_id: RQ3-SOL-MEDIUM-R1-UC11-REPAIR-002
repair_index: 2
affected_br_ids: [BR-EXP-CAT-05]
category: business_rule
trigger: business_rule_review
fingerprint: zero-current-zero-previous-change-percent-returned-as-100
status: complete
started_at: 2026-09-01T09:14:02.691515Z
ended_at: 2026-09-01T09:14:37.673262Z
duration_seconds: 34.982
source_revision_before: sha256:fc09e369fc9614d45921ad5ac2b617a5d56df713f3200c95a01332882e2663b0
source_revision_after: sha256:5d9291fa75188c835a7310d544445c52402136bf9ba32d303fd265a6f2cc0f41
---

# Repair 2 — Correct the zero-baseline change percentage branch

## Evidence

`finalsource/be/src/modules/expenses/expenses.service.ts:123-125` returns `100` whenever the previous total is zero, including the required zero-current/zero-previous case where `changePercent` must be null.

## Required correction

Change only the zero-previous-total branch so it returns `100` when the current category total is greater than zero and `null` otherwise. Preserve the existing previous-month period, formula, response type, and all unrelated behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/expenses/expenses.service.ts`
- Affected BRs: `BR-EXP-CAT-05`
- Permitted non-test verification: backend TypeScript/Nest production build and source inspection
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

- Changed file: `finalsource/be/src/modules/expenses/expenses.service.ts`
- Verification: Docker backend production build passed after the correction.
- Result: the zero-current/zero-previous branch now returns null, while a positive current total with zero previous total returns 100; `BR-EXP-CAT-05` is met together with Repair 1's classification correction.
- Model: `gpt-5.6-sol`, medium/standard, same as the Confirmed generation assignment.
- Tokens: per-repair attribution is unavailable because all authorized repairs share one Codex turn; aggregate repair-turn telemetry is recorded in the canonical run JSON.
- First-pass evidence remains unchanged.
