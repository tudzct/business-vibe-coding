---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-01"
run_id: "UC-01-GPT-5.6-TERRA"
repair_index: 2
defect_id: "DEF-UC01-02"
defect_fingerprint: "sha256:5a76cdc657d52c3bc62d0ab05040d71c08b58e0c7a1a2638c47537d8f96e694e"
category: "business_rule"
trigger: "Preview command initialization with role VIEWER in PreJoinPreview"
source_revision: "sha256:c62958e7190a714e05249ab1084942bb30170c146d441bcee17cd6650c960759"
affected_br_ids: ["BR-RJPP-02"]
affected_flow_ids: []
---

# Repair 2 — Initialize viewer media as muted

## Evidence

- `docs/02-construction/implementation/UC-01/runs/UC-01-GPT-5.6-TERRA/flow-accuracy/evidence/initial-audit/_source/prejoin_preview_excerpt.txt@sha256:6b9f5119698e12db68bbfe3b5f9baa3eb7210bc560e54d3a32ccb5f97cfadefa: the preview command role is VIEWER while cameraEnabled and microphoneEnabled are initialized true.`

## Required correction

In `PreJoinPreview`, initialize a VIEWER preview command with camera and microphone muted/disabled. Keep any later explicit user permission action and toggle behavior local to the component; do not introduce a server request or persistence.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/fe/src/components/PreJoinPreview.tsx`
- Affected BRs: `BR-RJPP-02`
- Affected Flows: None.
- Permitted non-test verification: frontend lint, TypeScript compilation, and production build.
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
