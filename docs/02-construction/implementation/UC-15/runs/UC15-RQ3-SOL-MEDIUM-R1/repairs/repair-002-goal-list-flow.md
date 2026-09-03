---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-15
run_id: UC15-RQ3-SOL-MEDIUM-R1
repair_index: 2
status: Completed
category: flow
trigger: flow_review
fingerprint: uc15-adjust-disabled-goal-list-contract-missing
affected_br_ids: []
---

# Repair 2 — Load selectable goals for adjustment

## Evidence

`Goals.tsx` disables adjustment controls without fetched goal IDs, `goal.service.ts` expects an array from `/goals`, and the backend GoalController has no GET handler. The frozen `API-GOAL-LIST` contract defines protected `GET /api/v1/goals` with `savingGoal` and `expenseGoals` payloads.

## Required correction

Implement the frozen list contract and adapt the existing Goals page to its typed response so displayed persisted goals supply real IDs to `AdjustGoalModal`.

## Scope

- Allowed backend files: Goal controller, service, module.
- Allowed frontend files: goal API service/types, Goals page, AdjustGoalModal typing.
- Permitted non-test verification: targeted lint, backend/frontend production builds, Docker rebuild, bounded authenticated runtime observation when credentials are safely available.
- Prohibited: schema changes, synthetic goal IDs, unrelated endpoints/features, and all test creation/execution.

## Completion

- Status: Completed
- Started: 2026-09-03T13:26:30.6205308Z
- Ended: 2026-09-03T13:30:10.1877981Z
- Duration: 219.567 seconds
- Model: `gpt-5.6-sol`, medium reasoning
- Source revision before: `sha256:c1b4549c19f18bd7231ae2bb0719ffd46788d923370fdaf65286ff95b3c49c59`
- Source revision after: `sha256:8ef2a10277348449ae27eccb2299b3b03f2cc3fbb36767e0b215974ef2045b48`
- Changed source: Goal controller/service/module; frontend goal API types/service, Goals page, and modal goal typing.
- Verification: targeted ESLint passed for all changed backend and frontend files; Nest production build passed; frontend TypeScript/Vite production build passed.
- Tests: none created or run.
