---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-05"
run_id: "UC-05-GPT-5.6-TERRA"
repair_index: 2
defect_id: "DEF-UC05-02"
defect_fingerprint: "sha256:240cbbb04afdb86c924b629dde822f36d56dd35518c28cec90ed849d7a9317e7"
category: "business_rule"
trigger: "Viewer opens live-stream viewer interface for a non-live or ended stream without STAGE_PARTICIPANT role"
source_revision: "sha256:8e695d4395701e2996a1b7e95f1f47515d693a6bb767d669117bb03a88155b33"
affected_br_ids: ["BR-WLS-05", "BR-WLS-06", "BR-WLS-07"]
affected_flow_ids: []
---

# Repair 2 — Gate viewer media controls and start muted

## Evidence

- `docs/02-construction/implementation/UC-05/runs/UC-05-GPT-5.6-TERRA/flow-accuracy/evidence/asm-uc05-initial/obs-bf1/bf1_dom.json@sha256:41cc4419c267cb7e9c0850a4fcd1b97b25f55567e66ea7d9a2e95edfcd3efe04: The viewer presentation had no playback/publishing availability state; play and microphone/camera controls were enabled for an ENDED stream and initial volume was 75.`

## Required correction

Implement the accepted availability behavior in the live-stream viewer from the existing returned `streamStatus` and `viewerRole`: playback is available only while the stream is LIVE; microphone/camera publishing is available only while the stream is LIVE and the viewer role is STAGE_PARTICIPANT; and initial audio starts muted. Keep unavailable controls visibly disabled and keyboard-safe. Preserve the frozen API contract and current read-only flow; do not add undeclared API fields, endpoints, persistence, or mutations. Make any backend change only if required to preserve this bounded behavior without changing the declared wire contract.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/fe/src/components/LiveStreamViewer.tsx`; `finalsource/fe/src/api/session.ts`; `finalsource/be/src/modules/sessions/sessions.service.ts`
- Affected BRs: `BR-WLS-05`, `BR-WLS-06`, `BR-WLS-07`
- Affected Flows: `None.`
- Permitted non-test verification: `npm run lint` and `npm run build` in `finalsource/fe`; `npm run lint` and `npm run build` in `finalsource/be` only if its allowed service file changes
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
