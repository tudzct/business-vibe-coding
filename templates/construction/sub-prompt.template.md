---
artifact_type: bug-fixing-sub-prompt
uc_id: "<UC-ID>"
run_id: "<RUN-ID>"
repair_index: <N>
defect_id: "<DEFECT-ID>"
defect_fingerprint: "sha256:<64 lowercase hex characters>"
source_revision: "sha256:<64 lowercase hex characters>"
---

# Repair <N> — <bounded defect>

## Source Scope

Read the following materials:

- Defects Handoff: `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/defects-handoff.json`.

Use the information obtained from this source to complete every placeholder below.

## Evidence

- Category: `<defect category>`
- Description: `<complete defect description>`
- Reproduction steps: `<ordered steps required to reproduce the defect>`
- Source file: `<repository-relative source or evidence path>`
- Lines: `<start>-<end>` or `N/A`
- Locator: `<exact locator>`
- Defect finding: `<exact evidence-backed finding>`
- Content: `<relevant source/build/runtime content>`

## Required correction

<expected correct behavior after the defect is repaired>

## Scope

- Known affected files: `<affected files from the handoff, or None>`
- Affected targets: `<BR IDs, Flow IDs/steps, UI targets, technical targets, or None>`

## Completion

Report changed files, verification evidence, and the reassessment of every affected target. Preserve first-pass evidence without overwriting it.
