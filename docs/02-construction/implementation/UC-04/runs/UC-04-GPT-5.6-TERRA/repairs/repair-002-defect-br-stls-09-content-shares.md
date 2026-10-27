---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-04"
run_id: "UC-04-GPT-5.6-TERRA"
repair_index: 2
defect_id: "defect-br-stls-09-content-shares"
defect_fingerprint: "sha256:9a1a5551cbf2c9c4eda74401c29a6c726552e9b046a561dc13418b98a9438de3"
category: "business_rule"
trigger: "LiveStreamService.commandLiveStream with action STOP"
source_revision: "sha256:c81fd74c8a89df1158fd59f21a43a669c4ac92404194934a9fb9b9f38873cdea"
affected_br_ids: ["BR-STLS-09"]
affected_flow_ids: []
---

# Repair 2 — Stop active content shares when a stream stops

## Evidence

- `docs/02-construction/implementation/UC-04/runs/UC-04-GPT-5.6-TERRA/flow-accuracy/evidence/flow-assessment-initial/obs-bf-1/br_09_stop_content_shares.txt@sha256:2b5595da1314567b44aba04ce265c005af6c65c3c78600c1ab76b05839329d52: content_shares table post-STOP query observed an ACTIVE share with NULL stopped_at.`

## Required correction

In the existing STOP transaction in `SessionsService.commandLiveStream`, transition active content shares for the command session to `STOPPED`, set `stopped_at` with `UTC_TIMESTAMP(3)`, and increment each affected row version. Do not modify inactive shares or content shares in another session.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/be/src/modules/sessions/sessions.service.ts`
- Affected BRs: `BR-STLS-09`
- Affected Flows: None.
- Permitted non-test verification: backend TypeScript production build.
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
