---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-01"
run_id: "UC-01-GPT-5.6-TERRA"
repair_index: 3
defect_id: "DEF-UC01-03"
defect_fingerprint: "sha256:845b0cbadc241a4f0c88eb95921ef216488d186f3521f282ca3deb28ce679775"
category: "business_rule"
trigger: "Display name input and readiness evaluation in PreJoinPreview"
source_revision: "sha256:c62958e7190a714e05249ab1084942bb30170c146d441bcee17cd6650c960759"
affected_br_ids: ["BR-RJPP-03"]
affected_flow_ids: []
---

# Repair 3 — Enforce bounded display-name readiness

## Evidence

- `docs/02-construction/implementation/UC-01/runs/UC-01-GPT-5.6-TERRA/flow-accuracy/evidence/initial-audit/_source/prejoin_preview_excerpt.txt@sha256:6b9f5119698e12db68bbfe3b5f9baa3eb7210bc560e54d3a32ccb5f97cfadefa: trimmedName and nameError reject only whitespace, while isReadyToJoin is independently stored.`

## Required correction

In `PreJoinPreview`, enforce the display-name maximum of 50 characters in client-side validation and derive join readiness so an invalid display name cannot produce a ready-to-join state or enable the primary action. Preserve the existing required non-whitespace validation and adjacent validation-message placement.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/fe/src/components/PreJoinPreview.tsx`
- Affected BRs: `BR-RJPP-03`
- Affected Flows: None.
- Permitted non-test verification: frontend lint, TypeScript compilation, and production build.
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
