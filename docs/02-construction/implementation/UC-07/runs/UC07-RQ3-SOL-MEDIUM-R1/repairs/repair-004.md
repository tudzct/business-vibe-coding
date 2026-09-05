---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-07
run_id: UC07-RQ3-SOL-MEDIUM-R1
repair_index: 4
repair_id: UC07-RQ3-SOL-MEDIUM-R1-REPAIR-004
category: flow
trigger: flow_review
fingerprint: account-list-details-control-disabled
affected_br_ids: []
status: completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
effective_model_id: gpt-5.6-sol
started_at: 2026-09-05T07:38:18.7491556Z
started_epoch_ms: 1788593898749
source_revision_before: sha256:8e3c808c5d85298178ce3fb4f1430314cd339b0fd10ab704361b745814aa3e30
ended_at: 2026-09-05T07:38:53.2103782Z
ended_epoch_ms: 1788593933210
duration_seconds: 34.461
source_revision_after: sha256:00c6561a49a798dbc57f2e973dc5e0cb095d0b2c07c455b03cbcbf87f1ad5b4f
---

# Repair 4 — Enable the account-detail route trigger

## Evidence

`finalsource/fe/src/pages/Account/Account.tsx` renders the account-card `Details` control as a disabled button, so the application user cannot perform UC-07 Basic Flow step 1 from the account list.

## Required correction

Replace the disabled visual control with navigation to the selected account's existing protected `/accounts/:id` route. Preserve card presentation and unrelated account-list behavior.

## Scope

- Allowed files: `finalsource/fe/src/pages/Account/Account.tsx`
- Affected BRs: none; functional flow only
- Permitted non-test verification: targeted frontend ESLint and frontend production build
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

- Changed file: `finalsource/fe/src/pages/Account/Account.tsx`
- Correction: each account card's Details control now links to that account's protected `/accounts/:id` route.
- Targeted frontend ESLint: PASS with zero diagnostics.
- Frontend production build: PASS; TypeScript and Vite completed with 688 modules transformed.
- Functional-flow reassessment: all eight source-evaluable UC checkpoints are satisfied.
- Token telemetry: unavailable per repair because all authorized repairs share one researcher turn; aggregate turn telemetry is retained in the canonical run.
- Tests created or run: none.
