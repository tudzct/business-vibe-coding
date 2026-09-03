---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-15
run_id: UC15-RQ3-SOL-MEDIUM-R1
repair_index: 1
status: Completed
category: technical
trigger: compile
fingerprint: frontend-build-typescript-goal-design-card-union-narrowing
affected_br_ids: []
---

# Repair 1 — Goals card union narrowing

## Evidence

Host and Docker frontend production builds report TS2339 at `Goals.tsx:128-129` because a conditional array produces a `Goal | design-card` union whose fallback `label` and `icon` properties are not narrowed.

## Required correction

Normalize fetched goals and fallback design cards to one explicit view-model shape before rendering.

## Scope

- Allowed file: `finalsource/fe/src/pages/Goals/Goals.tsx`
- Permitted non-test verification: targeted ESLint and frontend production build
- Prohibited: API, business validation, schema, unrelated UI refactors, and all test creation/execution.

## Completion

- Result: Complete; fingerprint resolved.
- Changed file: `finalsource/fe/src/pages/Goals/Goals.tsx`
- Verification: targeted frontend ESLint and production build passed.
- Model: `gpt-5.6-sol`, reasoning effort `medium`.
- Timing: `2026-09-03T13:25:00.7575492Z` to `2026-09-03T13:25:46.9454113Z` (46.188 seconds).
- Source revision: `sha256:6380e8bbdc80c221a213b2309fa9fdbf8d59b416ac912df5a3292d01918113c7` to `sha256:c1b4549c19f18bd7231ae2bb0719ffd46788d923370fdaf65286ff95b3c49c59`.
- Tokens: shared repair-turn telemetry; aggregate recorded in the canonical run.
