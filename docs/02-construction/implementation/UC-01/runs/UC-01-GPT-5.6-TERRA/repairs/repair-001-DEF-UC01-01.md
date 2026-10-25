---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-01"
run_id: "UC-01-GPT-5.6-TERRA"
repair_index: 1
defect_id: "DEF-UC01-01"
defect_fingerprint: "sha256:80ca8d9ca563649623f806f759d97278e6337ffbdbb3f659ac2e7f9842a067bd"
category: "business_rule"
trigger: "Component mount and permission check handling in PreJoinPreview"
source_revision: "sha256:c62958e7190a714e05249ab1084942bb30170c146d441bcee17cd6650c960759"
affected_br_ids: ["BR-RJPP-01", "BR-RJPP-05", "BR-RJPP-06"]
affected_flow_ids: []
---

# Repair 1 — Align enabled media state with permission state

## Evidence

- `docs/02-construction/implementation/UC-01/runs/UC-01-GPT-5.6-TERRA/flow-accuracy/evidence/initial-audit/_source/prejoin_preview_excerpt.txt@sha256:6b9f5119698e12db68bbfe3b5f9baa3eb7210bc560e54d3a32ccb5f97cfadefa: cameraEnabled and microphoneEnabled are initialized true while both permission statuses are UNKNOWN; the excerpt records the resulting PreviewCommand fields.`

## Required correction

In `PreJoinPreview`, ensure camera and microphone enabled state cannot remain enabled while their respective permission status is UNKNOWN or DENIED. Update permission-outcome and control-state handling so denied permission produces muted/disabled media state for the affected medium while preserving the existing local-only preview boundary.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/fe/src/components/PreJoinPreview.tsx`
- Affected BRs: `BR-RJPP-01`, `BR-RJPP-05`, `BR-RJPP-06`
- Affected Flows: None.
- Permitted non-test verification: frontend lint, TypeScript compilation, and production build.
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
