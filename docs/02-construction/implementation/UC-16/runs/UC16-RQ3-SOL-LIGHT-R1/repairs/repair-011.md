---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-16
run_id: UC16-RQ3-SOL-LIGHT-R1
repair_index: 11
repair_id: UC16-RQ3-SOL-LIGHT-R1-REPAIR-011
category: technical
trigger: lint
fingerprint: react-refresh-provider-hook-mixed-exports
affected_br_ids: []
status: completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: low
started_at: 2026-09-04T10:43:36.7294874Z
started_epoch_ms: 1788518616733
ended_at: 2026-09-04T10:44:44.5829856Z
ended_epoch_ms: 1788518684582
duration_seconds: 67.849
source_revision_before: sha256:1738c8febf1072b1071ed557b9b1f8a8eb08a0dfd5e313b91007da8d5a1d0626
source_revision_after: sha256:7f1de770f933825ae26ce954170be2602f54826e75aaaa90edd48510348195b4
---

# Repair 11 — Separate React providers, contexts, and hooks

## Evidence

Frontend repository lint reports two `react-refresh/only-export-components` warnings because AuthContext and ThemeContext files export both provider components and hooks.

## Required correction

Move context objects/types and consumer hooks into dedicated modules, keep provider files component-only, and update imports without changing state behavior.

## Scope

- Allowed files: frontend context/hook modules and imports that reference `useAuth` or `useTheme`
- Affected BRs: none
- Permitted non-test verification: frontend repository ESLint and production build
- Prohibited: auth/theme behavior changes, API changes, unrelated refactors, and all test creation/execution.

## Completion

- Changed files: dedicated auth/theme context and hook modules plus consumer imports.
- Frontend repository ESLint: PASS with zero errors and zero warnings.
- Frontend production build: PASS.
- Backend repository ESLint and production build also pass after Repairs 7-10.
- Token telemetry: `null` until the active repair turn is finalized.
- Tests created or run: none.
