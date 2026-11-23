---
artifact_type: business-coding-prompt
status: Approved
uc_id: UC-10
uc_name: "Send an Emoji Reaction"
generated_at: 2026-11-23T15:52:00+07:00
---

# UC-10 Business Coding Prompt - Send an Emoji Reaction

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create `POST /api/v1/sessions/{sessionId}/reactions` in `finalsource/be/src/modules/session/session.controller.ts`, with the domain implementation in a session reaction service following the existing `ChatMessageService` pattern. The endpoint is protected by `SessionAuthGuard` and uses the Bearer session access token.

### Request Format

Required headers: `Authorization: Bearer <session-access-token>`, `Content-Type: application/json`, and non-blank opaque `Idempotency-Key`. Required path parameter `sessionId` is a UUID. The JSON body is `{ "reaction": "LIKE|CLAP|HEART|CELEBRATE|HAND|SURPRISE" }`; no query parameters.

Implement the flow for `API-REACTION-CREATE`. Resolve the trusted principal, participant, and session from the authenticated request context; do not accept `participantId` from the client. Validate the UUID, enum value, membership, joined status, session identity, and that the session is not `ENDED`. Use a SERIALIZABLE transaction, lock the session, allocate `sequence = session.version + 1`, insert `reaction_events`, update `sessions.version`, and preserve participation and stage-request extents. Use the existing `idempotency_records` and `idempotency_responses` tables with operation `REACTION_CREATE`; trim the idempotency key, hash the canonical reaction payload, return the stored response for an identical retry, and return `409` for reuse with a different payload. Keep `synchronize: false` and `migrationsRun: false`; do not alter schema or migrations.

### Success Response

Return HTTP 201 with the existing envelope `{ "success": true, "message": "Reaction created", "data": { "reaction": { "id": string, "sessionId": string, "participantId": string, "reaction": ReactionCode, "createdAt": ISO-8601 datetime, "sequence": integer } } }`. Preserve the controller/filter conventions.

### Error Handling

Use the existing Nest exceptions and global filter conventions: `400` for invalid UUID or malformed/invalid wire data; `401` for rejected authentication; `403` for session-context mismatch or missing joined membership; `404` for a missing session; `409` for idempotency-key payload conflict; `422` for blank/missing idempotency key or an ended session; `503` for unexpected persistence/service failure. Error responses must retain the filter shape `{ success: false, message, path, timestamp }`. Do not expose credentials or sensitive request data.

## Prompt B: Frontend UI

### Objective: Build the desktop reaction controls and picker according to the frozen Figma evidence.

Create a React 18/TypeScript/Tailwind reaction control and picker integrated into the joined-session desktop interface. It must display the reaction action in the bottom control bar, an open picker titled `Emoji Reactions`, six selectable reaction choices, a close/cancel affordance, loading/disabled feedback, and a non-closing error notice.

**Target Frames & Design Provenance:** Figma dataset `100ms-2026-10-02-001`; `Reactions` node `6007:58047`, native-design SHA-256 `sha256:30bcdce97b7544258a11a1ae28894db17379cade1ff5adca45b1de260eddc4a2`; supplemental `Emoji Reactions` node `6045:42131`, native-design SHA-256 `sha256:e64ab86253362a3fff100a7f03a3e5cb655f98c0b257eb4438df3dec23902a80`. The frames are on page `6007:55138` / modal component evidence. Desktop only; do not add mobile behavior.

**Layout & Dimensions:** Desktop canvas 1512x982. Reactions frame has a 96px top bar and 96px bottom bar; bottom controls use 24px horizontal padding, 16px gaps, 48px-high buttons, 8px radius, and a 790px tile region beginning at y=96 with 24px side padding. The picker evidence is 558x596; its `Emoji Reactions Modal` is 340x144 with an inner 292px content row. Render the picker as a compact surface anchored to the reaction control, preserving the dark-session scrim/context and the 48x48 reaction cells with 8px spacing.

**Design Tokens:** Inter. High-contrast text `#eff0fa`; medium text `#c5c6d0`; muted text `#8f9099`; default surface `#191b23`; dim surface/background `#11131a`; brighter surface `#2e3038`; bright border `#272a31`; default border `#1d1f27`; primary bright `#538dff`; primary default `#2572ed`; error default `#c74e5b`; error-brighter text `#ffedec`. Use 16px/24px regular body text, 16px/24px semibold controls, 8px button radius, 16px modal radius, and the 48px control height shown in the reference.

**Component & State Specifications:** The picker title is exactly `Emoji Reactions`; supporting design copy is `Helps to send emoji reactions live within the session`. Choices map exactly: `LIKE` thumbs up, `CLAP` applause, `HEART` heart, `CELEBRATE` celebration, `HAND` raised hand, `SURPRISE` surprise. Opening presents all choices. Selecting submits immediately. Closing without selection restores session controls. On failure keep the session open and display the returned failure notice. Use accessible labels such as `Send Like reaction`, `Send Clap reaction`, `Send Heart reaction`, `Send Celebrate reaction`, `Send Hand reaction`, `Send Surprise reaction`, and `Close reactions`.

**Embedded Inline SVG Assets:** No external image asset is required for the picker. Use the emoji glyphs as the design-equivalent inline content in each 48x48 cell and use a CSS/inline SVG close icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`. The existing Reactions frame uses asset-map vectors for session controls; retain the project's inline SVG convention and do not load dataset files at runtime.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the reaction picker to `POST /api/v1/sessions/{sessionId}/reactions` and render the created event.

Continue working on the joined-session reaction control. Add `isOpen`, `selectedReaction`, `sending`, `error`, and the current reaction-event/session state using the existing React hooks and API-module conventions. Implement `sendReaction(sessionId, accessToken, reaction, idempotencyKey = crypto.randomUUID(), signal?)` in a new `finalsource/fe/src/api/reactions.ts` using the existing axios client approach.

### Request Payload

Send `{ "reaction": "LIKE" | "CLAP" | "HEART" | "CELEBRATE" | "HAND" | "SURPRISE" }` as JSON with `Authorization`, `Content-Type: application/json`, and a stable per-command `Idempotency-Key`. Encode `sessionId` in the path.

### Success Response

Read `data.reaction` from the normalized envelope. On success, render the returned reaction event in the session, close the picker, clear the error, and keep the session controls available. Do not create a duplicate visual event when an idempotent retry returns the same event. Keep event `createdAt` as an ISO value and display it with existing locale formatting only where the session UI displays time.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and error handling.

Refine `sendReaction` in the reaction picker component.

### Loading State

When `sending` is true, disable all six reaction buttons and the close control only for the in-flight command, expose a status such as `Sending reaction…`, prevent duplicate submissions, and retain the session shell.

### API Error

For any API failure, display the returned `message` when present, otherwise `Reaction could not be sent.` at the picker surface with `role="alert"`; do not close the picker or session. Map network/unknown failures to the fallback. Re-enable choices after failure.

### Client-Side Validation

Before calling `POST /api/v1/sessions/{sessionId}/reactions`, require a non-blank session ID, non-blank access token, and a reaction in the six declared enum values. Do not submit when validation fails; show `Choose a reaction.` at the picker surface. Backend validation remains authoritative.

## Prompt E: Business Rules Compliance

### Business Rule: BR-SER-01

- **Name:** Authenticated Membership
- **Representation:** OCL precondition
- **Expression / authoritative text:** `RequestContext::authenticated and RequestContext::sessionId = command.sessionId and command.participantId = RequestContext::participantId and Participant.allInstances()->exists(p | p.id = command.participantId and p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and p.status = ParticipantStatus::JOINED)`
- **Context:** `CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent`
- **Enforcement layer:** backend
- **Failure behavior:** Reject with the existing authenticated/session-access error mapping; exact source message is not specified.
- **Traceability:** UC-10 PRE-1, BF-1.4-BF-1.5, API-REACTION-CREATE authorization.

### Business Rule: BR-SER-02

- **Name:** Target Session
- **Representation:** OCL precondition
- **Expression / authoritative text:** `command.sessionId = session.id and session.status <> SessionStatus.ENDED`
- **Context:** `CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent`
- **Enforcement layer:** backend
- **Failure behavior:** Reject ended or mismatched sessions; API contract authorizes the 404/422 mappings but does not specify exact messages.
- **Traceability:** UC-10 PRE-1, API-REACTION-CREATE path and error responses.

### Business Rule: BR-SER-03

- **Name:** Command Key
- **Representation:** OCL precondition
- **Expression / authoritative text:** `command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0`
- **Context:** `CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent`
- **Enforcement layer:** backend and frontend request construction
- **Failure behavior:** Reject a missing or blank key; API contract specifies the header is required but not an exact failure message.
- **Traceability:** API-REACTION-CREATE `headers.Idempotency-Key`; BF-1.4.

### Business Rule: BR-SER-04

- **Name:** Created Identity
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.oclIsNew() and result.id <> null and result.sessionId = command.sessionId and result.participantId = command.participantId`
- **Context:** `CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent`
- **Enforcement layer:** backend and database
- **Failure behavior:** Do not return success unless the persisted event has a new non-null identity and command/session/participant identity matches.
- **Traceability:** UC-10 POST-1, API-REACTION-CREATE success payload, `reaction_events` schema.

### Business Rule: BR-SER-05

- **Name:** Reaction Value
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.reaction = command.reaction and result.createdAt <> null and result.sequence = session.version@pre + 1`
- **Context:** `CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent`
- **Enforcement layer:** backend and database
- **Failure behavior:** Persist and return the submitted enum, a non-null creation timestamp, and the next session sequence atomically.
- **Traceability:** API-REACTION-CREATE body/success; `sessions.version`; `reaction_events.sequence`.

### Business Rule: BR-SER-06

- **Name:** Participation Unaffected
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `Participant.allInstances() = Participant.allInstances()@pre`
- **Context:** `CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent`
- **Enforcement layer:** backend and database
- **Failure behavior:** The reaction transaction must not insert, update, or delete participants.
- **Traceability:** API-REACTION-CREATE mutation; UC-10 Notes.

### Business Rule: BR-SER-07

- **Name:** No Implicit Stage Request
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `StageRequest.allInstances() = StageRequest.allInstances()@pre`
- **Context:** `CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent`
- **Enforcement layer:** backend and database
- **Failure behavior:** The reaction transaction must not insert, update, or delete stage requests.
- **Traceability:** API-REACTION-CREATE mutation; UC-10 Notes.

## Prompt F: Implementation Context

Use Prompts A-E with the current NestJS 11/TypeScript/TypeORM/MySQL and React 18/TypeScript/Vite/Tailwind manifests and lockfiles, the pinned database contract at `InitialSchema1792195200000`, the `reaction_events`, `sessions`, `participants`, `stage_requests`, `idempotency_records`, and `idempotency_responses` schema, the frozen API contracts `API-REACTION-CREATE` and `API-SESSION-STATE`, the embedded desktop-only Figma specification in Prompt B, and existing source conventions such as `SessionController`, `SessionAuthGuard`, `ChatMessageService`, the global exception filter, axios API modules, and inline SVG React icons. Preserve the current architecture and dependency versions. Do not add tests, migrations, schema synchronization, mobile UI, or unrelated behavior. Verify with permitted typecheck, lint, and production build checks only.
