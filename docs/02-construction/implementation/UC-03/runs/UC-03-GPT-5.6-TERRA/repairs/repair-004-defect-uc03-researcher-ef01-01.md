---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-03"
run_id: "UC-03-GPT-5.6-TERRA"
repair_index: 4
defect_id: "defect-uc03-researcher-ef01-01"
defect_fingerprint: "sha256:84ae1be31e36812bd4e82ebe3592677aaa559e4a446be9cbd70941d72470c581"
category: "flow"
trigger: "Stream start failure branch in broadcaster preview"
source_revision: "sha256:5cc859a5bc0edd0b40c70edcc3d7a078a10576bd58562c3b9e96c9c862bfb41b"
affected_br_ids: []
affected_flow_ids: ["EF-1"]
---

# Repair 4 — Preserve the broadcaster interface on stream-start failure

## Evidence

- `docs/02-construction/implementation/UC-03/runs/UC-03-GPT-5.6-TERRA/flow-accuracy/evidence/follow-ups/researcher-statement-01.md@sha256:4627b200e40a568a7569ee4d92ba5bad16266d4f92178175accab7b842d84be1: the researcher marked EF-1 incorrect; the client must display a technical-failure state while keeping the broadcaster interface available.`

## Required correction

Ensure the existing broadcaster start-command failure path renders a safe technical-failure message inline in the broadcaster command area, restores a deliberate retry opportunity after loading ends, and retains the preview and session-menu controls. Preserve typed API error normalization, duplicate-submission prevention while loading, the existing 409 refresh behavior, and the rule that the UI must not falsely render the session as live after a failed command.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/fe/src/components/BroadcasterLivePreview.tsx`; `finalsource/fe/src/api/session.ts`; `finalsource/fe/src/api/client.ts` only if needed to preserve existing normalized error delivery.
- Affected BRs: None.
- Affected Flows: EF-1.
- Permitted non-test verification: frontend lint, TypeScript production build, and bounded browser/runtime observation of a rejected stream-start response.
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
