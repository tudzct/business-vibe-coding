---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-03
run_id: UC03-RQ3-SOL-MEDIUM-R1
repair_index: 5
repair_id: UC03-RQ3-SOL-MEDIUM-R1-REPAIR-005
category: technical
trigger: lint
fingerprint: frontend-lint-baseline-diagnostics
affected_br_ids: []
status: Complete
started_at: 2026-08-31T23:12:33.996+07:00
started_epoch_ms: 1788192753996
source_revision_before: sha256:fd7739e023e413132fc6ea34badf9321c84cf94cc226a0d12c0f30c41022bfb0
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
requested_reasoning_mode: standard
effective_model_id: null
effective_model_unavailable_reason: The active tool context does not expose an authoritative effective model or snapshot identifier.
---

# Repair 005 — Clear deterministic frontend lint diagnostics

## Evidence

The current-source frontend lint exits 1 with eight errors and two warnings: six unnecessary regex escapes, two explicit-any catch bindings, and two Fast Refresh warnings for intentionally co-located context hooks. These diagnostics are outside the UC-03 Transactions implementation and were preserved by the first-pass audit.

## Required correction

Remove only unnecessary regex escapes without changing the accepted password character set, narrow unknown catch values to `Error`, and document the two intentional provider/hook co-location boundaries with targeted one-line lint directives. Preserve rendered UI, API calls and behavior.

## Scope

- Allowed files: `finalsource/fe/src/pages/Register/Register.tsx`, `finalsource/fe/src/pages/Dashboard/Dashboard.tsx`, `finalsource/fe/src/pages/Login/Login.tsx`, `finalsource/fe/src/context/AuthContext.tsx`, `finalsource/fe/src/context/ThemeContext.tsx`
- Affected BRs: none; this repair only clears deterministic frontend lint diagnostics
- Permitted non-test verification: frontend lint and production build
- Prohibited: UI/API/flow behavior changes, new features, unrelated refactors, and all test creation/execution

## Completion

- Changed files: all five files listed in Scope.
- Verification: current-source frontend ESLint completed with exit code 0 and zero errors/warnings in a disposable Node container; the workspace was mounted read-only and no tests were created or run.
- Ended at: `2026-08-31T23:14:37.017+07:00` (`1788192877017` epoch ms)
- Duration: `123.021` seconds
- Source revision after: `sha256:79242d5de86f58307166a546ead329cffe4770a9391e3b71a28d97cbb670dd5e`
- Token telemetry: shared Codex session turn 2 for Repairs 002-006; per-repair allocation is unavailable.
- Reassessment: no BR status changed; the repair is behavior-neutral and the frontend lint gate now passes.
