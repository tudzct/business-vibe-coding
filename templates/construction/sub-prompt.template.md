---
artifact_type: bug-fixing-sub-prompt
uc_id: "<UC-ID>"
run_id: "<RUN-ID>"
repair_index: <N>
defect_id: "<DEFECT-ID>"
defect_fingerprint: "sha256:<64 lowercase hex characters>"
category: "<technical|business_rule|flow>"
trigger: "<TRIGGER>"
source_revision: "sha256:<64 lowercase hex characters>"
blocks_execution: <true|false>
affected_br_ids: ["<BR-ID>"]
affected_flow_ids: ["<FLOW-ID>"]
affected_flow_step_ids: ["<FLOW-STEP-ID>"]
affected_files: ["<REPOSITORY-RELATIVE-PATH>"]
---

# Repair <N> — <bounded defect>

## Defect

<exact defect description>

## Evidence

### Evidence 1

- Path: `<repository-relative evidence path>`
- SHA-256: `sha256:<64 lowercase hex characters>`
- Source revision: `sha256:<64 lowercase hex characters>`
- Kind: `<text|json|image|binary>`
- Media type: `<media type>`
- Source file: `<repository-relative source or evidence path>`
- Lines: `<start>-<end>` or `N/A`
- Locator: `<exact locator>`
- Observed fact: `<exact observed fact>`
- Defect finding: `<exact evidence-backed finding>`

#### Content

````<json|text>
<exact evidence content>
````

## Required correction

- Mode: `<verbatim_authoritative|evidence_derived>`
- Representation: `<representation>`

### Correction text

````<ocl|text>
<exact required correction text>
````

### Supporting definitions

None.

Read this completed sub-prompt in full and perform its required correction. Use only this completed sub-prompt and the current source code under `finalsource/` to perform the correction.

## Scope

- Known affected files: `<affected files from the handoff, or None>`
- Prohibited: changing tests, weakening assertions, fabricating evidence, broadening product scope, or changing unrelated behavior.

## Completion

After implementation, report changed files, verification evidence and the reassessed result for this defect.
