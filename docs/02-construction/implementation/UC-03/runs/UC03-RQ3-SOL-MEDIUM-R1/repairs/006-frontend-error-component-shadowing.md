---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-03
run_id: UC03-RQ3-SOL-MEDIUM-R1
repair_index: 6
repair_id: UC03-RQ3-SOL-MEDIUM-R1-REPAIR-006
category: technical
trigger: compile
fingerprint: frontend-build-error-component-shadowed-native-error
affected_br_ids: []
status: Complete
started_at: 2026-08-31T23:16:12.374+07:00
started_epoch_ms: 1788192972374
source_revision_before: sha256:79242d5de86f58307166a546ead329cffe4770a9391e3b71a28d97cbb670dd5e
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
requested_reasoning_mode: standard
effective_model_id: null
effective_model_unavailable_reason: The active tool context does not expose an authoritative effective model or snapshot identifier.
---

# Repair 006 — Disambiguate caught Error values from the Error component

## Evidence

- Final Compose rebuild fails frontend TypeScript compilation with TS2554 and TS7009 at the new `new Error()` fallbacks in Dashboard and Login.
- Both files import a React component named `Error`, which shadows the native `Error` constructor used by Repair 005.

## Required correction

Use `globalThis.Error` for the caught-value type guard and a plain `{ message: '' }` fallback. Preserve existing user-facing fallback messages and all page behavior.

## Scope

- Allowed files: `finalsource/fe/src/pages/Dashboard/Dashboard.tsx`, `finalsource/fe/src/pages/Login/Login.tsx`
- Affected BRs: none; this is a compile-only correction
- Permitted non-test verification: frontend lint, frontend production build, final Compose rebuild
- Prohibited: UI/API/flow changes, new features, unrelated refactors, and all test creation/execution

## Completion

- Changed files: `finalsource/fe/src/pages/Dashboard/Dashboard.tsx`, `finalsource/fe/src/pages/Login/Login.tsx`
- Verification: frontend lint exits 0; both frontend and backend production images build; all three Compose services are healthy; final UI/API observations pass with zero current backend error lines.
- Ended at: `2026-08-31T23:18:41.721+07:00` (`1788193121721` epoch ms)
- Duration: `149.347` seconds
- Source revision after: `sha256:122349abeca1f8831497cbbc504418aef22db2ce1a8c76f300c6dfb182a92176`
- Token telemetry: shared Codex session turn 2 for Repairs 002-006; per-repair allocation is unavailable.
- Reassessment: no BR status changed; final current-source lint/build/runtime checks pass.
