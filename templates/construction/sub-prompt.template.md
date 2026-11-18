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

## Instruction for Sub-prompt

Read the following materials:

- Defects Handoff: `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/defects-handoff.json`.
- Technical and control sources: the `Technical and Control-Plane Material` defined in `.codex/skills/gen-bug-fixing-prompt/SKILL.md`.

Use the information obtained from these sources to follow every instruction below and complete the sub-prompt:

1. Understand the selected defect as a whole and complete every placeholder below.
2. Generate a clear, self-contained repair prompt. Do not invent, omit, or change defect information. Synthesize the prompt from the complete defect rather than transcribing the Handoff field by field.
3. Represent every Handoff evidence entry as a sequential `### Evidence <index>` subsection inside `## Evidence`. Use the evidence to communicate the defect clearly; do not mechanically copy each Handoff field.
4. Do not include input-source references or provenance in the completed sub-prompt; references to final source and its technical conventions remain permitted.
5. After completing the sub-prompt, remove this entire `## Instruction for Sub-prompt` section so the generated artifact contains only the completed repair prompt.

## Evidence

### Defect Summary

- Category: `<defect category>`
- Description: `<complete defect description>`
- Reproduction steps: `<ordered steps required to reproduce the defect>`

### Evidence 1

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
