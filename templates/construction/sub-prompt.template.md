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
affected_br_ids: ["<BR-ID>"]
affected_flow_ids: ["<FLOW-ID>"]
---

# Repair <N> — <bounded defect>

## Evidence

- `<evidence path>@sha256:<checksum>: <exact observed source/build/runtime fact>`

## Required correction

`<bounded correction instruction derived from the canonical defect and evidence>`

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `<paths>`
- Affected BRs: `<BR IDs>`
- Affected Flows: `<Flow IDs>`
- Permitted non-test verification: `<lint/typecheck/build/runtime observation>`
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
