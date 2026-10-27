---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-04"
run_id: "UC-04-GPT-5.6-TERRA"
repair_index: 3
defect_id: "defect-br-stls-10-stage-requests"
defect_fingerprint: "sha256:235b7d15b27944cb91788a6c079bc416af0dec4b5a133da5d929937c7244457c"
category: "business_rule"
trigger: "LiveStreamService.commandLiveStream with action STOP"
source_revision: "sha256:c81fd74c8a89df1158fd59f21a43a669c4ac92404194934a9fb9b9f38873cdea"
affected_br_ids: ["BR-STLS-10"]
affected_flow_ids: []
---

# Repair 3 — Cancel pending stage requests when a stream stops

## Evidence

- `docs/02-construction/implementation/UC-04/runs/UC-04-GPT-5.6-TERRA/flow-accuracy/evidence/flow-assessment-initial/obs-bf-1/br_10_cancel_pending_requests.txt@sha256:2a6c3dd03920de3b26cb421d1e00481f8268e75861e04257819b99c91e96cfb7: stage_requests table post-STOP query observed a PENDING request with NULL decided_at.`

## Required correction

In the existing STOP transaction in `SessionsService.commandLiveStream`, transition pending stage requests for the command session to `CANCELLED`, set `decided_at` with `UTC_TIMESTAMP(3)`, and increment each affected row version. Preserve non-pending request states and do not change records for other sessions.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/be/src/modules/sessions/sessions.service.ts`
- Affected BRs: `BR-STLS-10`
- Affected Flows: None.
- Permitted non-test verification: backend TypeScript production build.
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
