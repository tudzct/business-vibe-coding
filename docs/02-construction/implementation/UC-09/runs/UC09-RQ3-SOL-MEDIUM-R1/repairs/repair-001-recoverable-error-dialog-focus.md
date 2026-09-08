---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-09
run_id: UC09-RQ3-SOL-MEDIUM-R1
repair_id: UC09-RQ3-SOL-MEDIUM-R1-REPAIR-001
repair_index: 1
category: flow
trigger: flow_review
fingerprint: recoverable-error-focus-escapes-aria-modal-dialog
affected_br_ids: []
status: Completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
effective_model_id: gpt-5.6-sol
effective_snapshot: null
session_id: 01a080e9-8f30-74f1-9377-8427b1cf7a89
session_turn_id: 1
runtime_turn_id: 01a080e9-976a-7a61-ba8c-8fa94167fe1d
started_at: 2026-09-08T12:08:11.9494494Z
started_epoch_ms: 1788869291950
source_revision_before: sha256:b05f75d923237043958e5da60b6482355cc47ad6bf4bd6e16a224d264ce6960f
source_revision_after: sha256:677f00b97414dbcb41da73de3a055bdf68d552b9d83faf3b735d85af8b830ccb
ended_at: 2026-09-08T12:11:37.6433060Z
ended_epoch_ms: 1788869497643
duration_seconds: 205.693
session_duration_seconds: 694.26
total_tokens: 2650627
input_tokens: 92501
cache_read_tokens: 2544384
total_input_tokens: 2636885
output_tokens: 13742
reasoning_tokens: 3504
cost_usd: 2.147
---

# Repair 1 — Keep recoverable-error focus inside the deletion dialog

## Evidence

The immutable first-pass audit records `UC09-FLOW-FOCUS-001`: `finalsource/fe/src/hooks/useAccountDeletion.ts:103-120` kept the confirmation dialog open after a recoverable API failure but then focused `originRef`, which points to a Delete control behind the active `aria-modal` dialog.

## Required correction

Keep keyboard focus within the open account-deletion dialog after a recoverable error. Continue returning focus to the originating Delete control only when the dialog is actually dismissed.

## Scope

- Allowed files: `finalsource/fe/src/hooks/useAccountDeletion.ts`; `finalsource/fe/src/components/AccountDeletion/DeleteAccountModal.tsx`
- Affected BRs: none; this is the flow finding `UC09-FLOW-FOCUS-001`
- Permitted non-test verification: targeted ESLint for both allowed files and the frontend production build
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions, changes to first-pass evidence, and all test creation/execution

## Completion

Removed the recoverable-error path's background-trigger focus call from `useAccountDeletion.ts:118-120`. Added `DeleteAccountModal.tsx:32-34` so a newly rendered error focuses the dialog's Cancel/Back control. The actual dismissal path still restores the originating control at `useAccountDeletion.ts:63-73`.

Targeted ESLint passed for both allowed files, and the frontend production build passed (`tsc -b && vite build`, 694 modules transformed). No tests were created or run. The source revision changed from `sha256:b05f75d923237043958e5da60b6482355cc47ad6bf4bd6e16a224d264ce6960f` to `sha256:677f00b97414dbcb41da73de3a055bdf68d552b9d83faf3b735d85af8b830ccb`. The flow finding is reassessed as resolved; no Business Rule result changes. Closed session turn 1 consumed 2,650,627 tokens over 694.26 seconds; the bounded repair operation itself took 205.693 seconds.
