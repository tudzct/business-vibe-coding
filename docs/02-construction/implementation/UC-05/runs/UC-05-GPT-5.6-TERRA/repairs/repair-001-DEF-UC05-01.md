---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-05"
run_id: "UC-05-GPT-5.6-TERRA"
repair_index: 1
defect_id: "DEF-UC05-01"
defect_fingerprint: "sha256:5dd105670f2b68df26dad0500af257e396c900078c8ae6d884d9584a948afb88"
category: "business_rule"
trigger: "Viewer calls viewLiveStream on a live session whose status is ENDED"
source_revision: "sha256:8e695d4395701e2996a1b7e95f1f47515d693a6bb767d669117bb03a88155b33"
affected_br_ids: ["BR-WLS-02"]
affected_flow_ids: []
---

# Repair 1 — Reject ended live-session views

## Evidence

- `docs/02-construction/implementation/UC-05/runs/UC-05-GPT-5.6-TERRA/flow-accuracy/evidence/asm-uc05-initial/obs-bf1/bf1_network.json@sha256:8c24ffec756f9bc28980d4029a95deddb52c56dbda1299a96029373f8f09ed38: The view operation returned HTTP 200 with an ended stream status when the session status was ENDED.`

## Required correction

In `SessionsService.viewLiveStream`, enforce the accepted defect requirement that an ENDED session is rejected before a successful viewer representation is returned. Preserve the existing authenticated session-membership and participant checks, read-only behavior, declared response fields, and the application's normalized safe error handling. Do not return a success envelope for an ENDED session.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/be/src/modules/sessions/sessions.service.ts`
- Affected BRs: `BR-WLS-02`
- Affected Flows: `None.`
- Permitted non-test verification: `npm run lint` and `npm run build` in `finalsource/be`
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
