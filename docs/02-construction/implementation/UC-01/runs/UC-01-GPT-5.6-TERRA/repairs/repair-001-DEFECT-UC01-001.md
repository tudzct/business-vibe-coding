---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: UC-01-GPT-5.6-TERRA
repair_index: 1
defect_id: DEFECT-UC01-001
defect_fingerprint: sha256:0baa4fc957d41e3440b4779ea6b06b96e80ceef7478673ab3cac85416eb1256a
source_revision: sha256:8c9aba1838d82516c34520aa572de09258d5309ea1ab56c1c2a2bd4c17719dad
---

# Repair 1 — Support and enforce viewer preview muting through a role prop

## Evidence

### Defect Summary

- Category: business_rule
- Description: `PreJoinPreview` does not expose role as a component prop and hardcodes internal state to `BROADCASTER`, preventing a caller from supplying `VIEWER` role to enforce muted media preview.
- Reproduction steps:
  1. Attempt to pass `role=VIEWER` to the `PreJoinPreview` component.
  2. Observe that the component does not accept the prop and remains `BROADCASTER`.

### Evidence 1

- Source file: `finalsource/fe/src/components/PreJoinPreview.tsx`
- Lines: N/A
- Locator: `PreJoinPreview.tsx:1-260`
- Defect finding: The component lacks a role prop in its function signature and uses `useState` with `BROADCASTER`.
- Content: The sanitized source evidence identifies the generated `PreJoinPreview` component as missing the Prompt E business-rule behavior for role-based preview state.

## Required correction

Add a props interface to `PreJoinPreview` that accepts an optional `role` of `ParticipantRole`, defaulting to `BROADCASTER`. Remove the hard-coded internal role state as the role source. When the supplied role is `VIEWER`, enforce `cameraEnabled` and `microphoneEnabled` as false and disable the media toggles. Preserve the existing local-only boundary and do not add an API call, persistence, or schema change.

This repair must satisfy BR-RJPP-02 exactly: for `command.role = ParticipantRole::VIEWER`, neither result camera nor microphone may be enabled.

## Scope

- Known affected files: `finalsource/fe/src/components/PreJoinPreview.tsx`
- Affected targets: BR-RJPP-02; UI target `media-controls`

## Completion

Report changed files, verification evidence, and reassessment of BR-RJPP-02 and `media-controls`. Preserve first-pass evidence without overwriting it.
