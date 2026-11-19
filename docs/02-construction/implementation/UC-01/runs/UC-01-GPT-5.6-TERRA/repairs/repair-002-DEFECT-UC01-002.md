---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: UC-01-GPT-5.6-TERRA
repair_index: 2
defect_id: DEFECT-UC01-002
defect_fingerprint: sha256:3b3f8a645dd53f0f897e1bebefcba4c95639b6628e1f84110dff3d49462558c6
source_revision: sha256:8c9aba1838d82516c34520aa572de09258d5309ea1ab56c1c2a2bd4c17719dad
---

# Repair 2 — Preserve the supplied participant key in local preview state

## Evidence

### Defect Summary

- Category: business_rule
- Description: The component generates a random UUID with `crypto.randomUUID()` for `participantKey` instead of accepting and preserving `command.participantKey` from props.
- Reproduction steps:
  1. Inspect the local `participantKey` used in preview state.
  2. Verify that the key is randomly generated rather than taken from command props.

### Evidence 1

- Source file: `finalsource/fe/src/components/PreJoinPreview.tsx`
- Lines: N/A
- Locator: `PreJoinPreview.tsx:1-260`
- Defect finding: The component calls `crypto.randomUUID()` rather than reading `command.participantKey`.
- Content: The sanitized source evidence identifies the generated `PreJoinPreview` component as missing the Prompt E business-rule behavior for the supplied preview key.

## Required correction

Accept an optional `participantKey` string in `PreJoinPreview` props and use it as the local participant-key draft identifier. Preserve that supplied value exactly throughout local preview preparation; do not generate a replacement UUID for a supplied key. Keep the draft client-local and do not create persisted session membership, an API call, or database mutation.

This repair must satisfy BR-RJPP-04 exactly: `result.participantKey = command.participantKey`.

## Scope

- Known affected files: `finalsource/fe/src/components/PreJoinPreview.tsx`
- Affected targets: BR-RJPP-04; UI target `preview-state`

## Completion

Report changed files, verification evidence, and reassessment of BR-RJPP-04 and `preview-state`. Preserve first-pass evidence without overwriting it.
