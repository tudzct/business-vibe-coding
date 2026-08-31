---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 3
repair_id: RQ3-SOL-MEDIUM-R1-UC01-REPAIR-003
category: ui
trigger: ui_review
fingerprint: registration-desktop-spacing-and-google-copy-diverge-from-figma
affected_br_ids: []
status: Complete
started_at: 2026-08-31T10:15:53.417+07:00
started_epoch_ms: 1788146153418
source_revision_before: sha256:fd6248fdfff221d7381c3e38ce859f7226623fc3da0fababac248a26578734d0
model_id: gpt-5.6-sol
reasoning_effort: medium
---

# Repair 003 — Align the registration composition to frozen Figma evidence

## Evidence

- Frozen frame `102. Signup` (`137:8071`) is 1440×1024 with the wordmark beginning near y=112 and a centered 400px form.
- `finalsource/fe/src/pages/Register/Register.tsx` starts the desktop composition near y=64 and changes the visible Google label to include `(unavailable)`.
- The required Confirm Password field is an approved design-consistent addition and must remain immediately after Password.

## Required correction

Move the desktop composition to the frozen frame's vertical position while retaining responsive mobile padding. Preserve the 400px centered form, background, typography, field dimensions, teal action, divider and sign-in link. Restore the visible Google label to `Continue with Google` while keeping the control disabled and explicitly unavailable through accessible state/title.

## Scope

- Allowed files: `finalsource/fe/src/pages/Register/Register.tsx`
- Affected BRs: none; this is UI accuracy evidence
- Permitted non-test verification: source inspection and rebuilt browser screenshot when runtime authorization is available
- Prohibited: Google authentication, new features, unrelated refactors and all test creation/execution

## Completion

- Changed file: `finalsource/fe/src/pages/Register/Register.tsx`
- Verification: production frontend build passed; source inspection confirms the 112px desktop top offset, centered 400px composition, exact Google label and disabled/unavailable behavior.
- Ended at: `2026-08-31T10:16:24.831+07:00` (`1788146184832` epoch ms); duration `31.414` seconds.
- Source revision after: `sha256:42d714927b93cf227230109c0093d6310ba668c278244e574306d12f7c5f09a3`
- Token telemetry: unavailable per repair because repairs 002–006 share Codex session turn 5; the shared turn is retained in the canonical run.
- UI reassessment: source structure aligns with the frozen frame; a rebuilt browser screenshot remains blocked by backend health preventing frontend startup.
