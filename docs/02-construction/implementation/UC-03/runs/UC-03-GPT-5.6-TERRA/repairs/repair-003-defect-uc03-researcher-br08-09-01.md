---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-03"
run_id: "UC-03-GPT-5.6-TERRA"
repair_index: 3
defect_id: "defect-uc03-researcher-br08-09-01"
defect_fingerprint: "sha256:e8b720be88015f40dcaf51ec6b4b4b0448f7ed41c6eaf82c7ce44b9ae4cb230d"
category: "business_rule"
trigger: "Provider completion callback or LiveStreamService::complete invocation"
source_revision: "sha256:5cc859a5bc0edd0b40c70edcc3d7a078a10576bd58562c3b9e96c9c862bfb41b"
affected_br_ids: ["BR-SLS-08", "BR-SLS-09"]
affected_flow_ids: []
---

# Repair 3 — Implement the provider-completion stream transition

## Evidence

- `docs/02-construction/implementation/UC-03/runs/UC-03-GPT-5.6-TERRA/flow-accuracy/evidence/follow-ups/researcher-statement-01.md@sha256:4627b200e40a568a7569ee4d92ba5bad16266d4f92178175accab7b842d84be1: the researcher reports that LiveStreamService::complete is not implemented or exposed, producing HTTP 404 and leaving provider completion/state transition unavailable.`

## Required correction

Implement and expose the `LiveStreamService::complete` provider-completion operation in accordance with BR-SLS-08 and BR-SLS-09:
- **Path and Method**: `POST /api/v1/sessions/:sessionId/live-stream/complete` on `SessionsController`.
- **Payload Schema**: A JSON body containing `{ resourceId: string, expectedVersion: number, succeeded: boolean }`.
- **Authentication Policy**: Use the existing `SessionAccessGuard` authentication context on `SessionsController` to satisfy `RequestContext::providerAuthenticated`.
- **Business Logic**: Under a locked session transaction (`SERIALIZABLE`), verify that:
  - Session status is `LIVE`.
  - Stream status is `STARTING`.
  - `stream.sessionId = session.id`.
  - `command.resourceId = stream.id`.
  - `command.expectedVersion = stream.version`.
  If preconditions fail, reject with appropriate HTTP status (e.g., 409 Conflict for version mismatch, 400/422 for state mismatch).
  Increment both stream and session versions by 1 (`version = version + 1`).
  If `command.succeeded === true`, update stream status to `LIVE` and set `startedAt = new Date()`.
  If `command.succeeded === false`, update stream status to `READY`.
- Preserve existing stream and session persistence mappings, idempotency mechanisms, and error envelopes.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/be/src/modules/sessions/sessions.service.ts`; `finalsource/be/src/modules/sessions/sessions.controller.ts`; `finalsource/be/src/modules/sessions/dto/`; `finalsource/be/src/modules/sessions/auth/`.
- Affected BRs: BR-SLS-08, BR-SLS-09.
- Affected Flows: None.
- Permitted non-test verification: backend lint, TypeScript/Nest production build, and bounded runtime observation of the provider-completion interface.
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
