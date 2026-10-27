---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-04"
run_id: "UC-04-GPT-5.6-TERRA"
repair_index: 1
defect_id: "defect-br-stls-08-stage-participants"
defect_fingerprint: "sha256:cb3e5787148e57e68d79c1da718cd7ab4137d85f8139b0ac9b22298fe2fd441d"
category: "business_rule"
trigger: "LiveStreamService.commandLiveStream with action STOP"
source_revision: "sha256:c81fd74c8a89df1158fd59f21a43a669c4ac92404194934a9fb9b9f38873cdea"
affected_br_ids: ["BR-STLS-08"]
affected_flow_ids: []
---

# Repair 1 — Demote stage participants when a stream stops

## Evidence

- `docs/02-construction/implementation/UC-04/runs/UC-04-GPT-5.6-TERRA/flow-accuracy/evidence/flow-assessment-initial/obs-bf-1/br_08_demote_former_stage_participants.txt@sha256:c2ec6d6fd6ad7e341363e432ffb12237d095e3211a465e20cffc6e3eba38ecc0: participants table post-STOP query observed STAGE_PARTICIPANT rows retaining their role with microphone and camera enabled.`

## Required correction

In the existing STOP branch of `SessionsService.commandLiveStream`, within its current serializable transaction, update active session participants whose role is `STAGE_PARTICIPANT` to role `VIEWER` and disable microphone and camera. Keep this mutation scoped to the command session and do not alter other participant roles or statuses.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/be/src/modules/sessions/sessions.service.ts`
- Affected BRs: `BR-STLS-08`
- Affected Flows: None.
- Permitted non-test verification: backend TypeScript production build.
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
