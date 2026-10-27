---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-04"
run_id: "UC-04-GPT-5.6-TERRA"
repair_index: 4
defect_id: "defect-br-stls-11-recordings"
defect_fingerprint: "sha256:ac9abf2ea6bd5a0895ab36502b33e8aee624bbd46b34a0b6a918f53d334522c0"
category: "business_rule"
trigger: "LiveStreamService.commandLiveStream with action STOP"
source_revision: "sha256:c81fd74c8a89df1158fd59f21a43a669c4ac92404194934a9fb9b9f38873cdea"
affected_br_ids: ["BR-STLS-11"]
affected_flow_ids: []
---

# Repair 4 — Stop active recordings when a stream stops

## Evidence

- `docs/02-construction/implementation/UC-04/runs/UC-04-GPT-5.6-TERRA/flow-accuracy/evidence/flow-assessment-initial/obs-bf-1/br_11_stop_recordings.txt@sha256:3abde8f5854653e8895285e26e5754774d97521a71fb6c004d002f146d9b52a3: recordings table post-STOP query observed a RECORDING row with NULL stopped_at.`

## Required correction

In the existing STOP transaction in `SessionsService.commandLiveStream`, transition `STARTING` and `RECORDING` rows for the command session to `STOPPED`, set `stopped_at` with `UTC_TIMESTAMP(3)`, and increment each affected row version. Preserve recordings already stopped or failed and do not alter other sessions.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/be/src/modules/sessions/sessions.service.ts`
- Affected BRs: `BR-STLS-11`
- Affected Flows: None.
- Permitted non-test verification: backend TypeScript production build.
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
