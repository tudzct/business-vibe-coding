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

Use the information obtained from this source to complete every placeholder below while preserving exact Handoff values:

- Keep only the template's top-level `## ` headings (`Source Scope`, `Evidence`, `Required correction`, `Scope`, `Completion`). Never introduce another `## ` heading (such as `## Evidence content`), because section validation stops at the next `## ` heading.
- Inside `## Evidence`, represent every item in `defect.evidence` using `### Evidence 1`, `### Evidence 2`, ... subheadings and copy each `reproduction_steps` item plus `source_file`, line range (`<start>-<end>` or `N/A`), `locator`, `defect_finding`, and raw `content` verbatim in UTF-8 (use fenced code blocks inside `### Evidence <k>` for multi-line content).
- Inside `## Required correction`, copy every fenced code block from `defect.required_correction` and the exact text after `Required observable behavior after repair:` verbatim (or the full `required_correction` when that marker is absent).
- Inside `## Scope`, copy every value from `scope.affected_*` verbatim (or `None` when all scope arrays are empty), without introducing extra BR/Flow/Flow-step/API IDs.
- Keep the `## Completion` paragraph verbatim; do not customize it.

## Evidence

- Category: `<defect category>`
- Description: `<complete defect description>`
- Reproduction steps: `<ordered steps required to reproduce the defect>`

### Evidence 1

- Source file: `<repository-relative source or evidence path>`
- Lines: `<start>-<end>` or `N/A`
- Locator: `<exact locator>`
- Defect finding: `<exact evidence-backed finding>`
- Content: `<relevant source/build/runtime content>`

(Repeat `### Evidence <index>` inside `## Evidence` for each remaining entry in `defect.evidence`; do not create a separate `## ` section.)

## Required correction

<expected correct behavior after the defect is repaired>

## Scope

- Known affected files: `<affected files from the handoff, or None>`
- Affected targets: `<BR IDs, Flow IDs/steps, UI targets, technical targets, or None>`

## Completion

Report changed files, verification evidence, and the reassessment of every affected target. Preserve first-pass evidence without overwriting it.
