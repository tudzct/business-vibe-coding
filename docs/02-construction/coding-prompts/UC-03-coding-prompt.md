---
artifact_type: business-coding-prompt
status: Approved
uc_id: UC-03
uc_name: "Start a Live Stream"
generated_at: 2026-11-23T16:08:00+07:00
---

# UC-03 Business Coding Prompt - Start a Live Stream

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create the `POST /api/v1/sessions/{sessionId}/live-stream/commands` endpoint in the existing NestJS session/live-stream module and controller. The endpoint is protected by the Bearer session access token (registered or guest form) and requires authorization.

### Request Format

Required headers: `Authorization: Bearer <session-access-token>`, `Content-Type: application/json`, and non-empty `Idempotency-Key`. Required path parameter `sessionId` is a UUID. Body: `{ "action": "START", "expectedVersion": <integer> }`; action is the enum `START | STOP`, and UC-03 invokes `START`.

Implement dispatch through the existing API command gateway and mutation gateway, using the existing session, participant, and live-stream mappings and transaction conventions. Return HTTP 200 with `data.stream` and `data.session`; preserve the project’s normalized success envelope `{ "success": true, "message": <source-defined message>, "data": <domain payload> }`.

Return the source-defined normalized error envelope while preserving status and message for HTTP 400 (wire/schema), 401 (rejected authentication), 403 (authorization), 404 (missing resource), 409 (current-resource/version conflict), 422 (command rejected), and 503 (required service unavailable). Do not invent error messages. Do not change the schema or add dependencies.

For START, require authenticated joined HOST membership, request session identity equality, a non-ended LIVE_STREAM session with LIVE status, stream/session identity equality, READY stream status, matching expected version, and a trimmed non-empty idempotency key. Lock the session and commit the START transition atomically according to existing transaction conventions. Set stream status to STARTING, clear `endedAt`, and increment the stream version exactly once. Provider completion is separate: require provider authentication, locked matching LIVE session and STARTING stream, matching resource/version, and atomic commit; increment stream and session versions, then set stream LIVE with non-null `startedAt` on success or READY on failure.

## Prompt B: Frontend UI

### Objective: Build the broadcaster session UI according to the frozen desktop Figma evidence.

Create or extend the broadcaster live-session component using the project’s existing React 18, TypeScript, Vite, React Router, and styling conventions. It must display the broadcaster preview, visible `Go Live` control, `Record` control, session controls, media controls, participant count, and the live/starting feedback states. The session menu must expose available broadcaster actions before starting.

**Target Frames & Design Provenance:** Frozen dataset `100ms-2026-10-02-001`, UC-003 primary node `6007:87452`; required nodes: `6007:87452` “Go Live”, `6007:51102` “Details Filled”, `6007:87457` “Live”, `6007:87462` “Starting”, `6007:87294` “Session Menu”. Native-design SHA-256 values are the exact SHA-256 checksums of each corresponding frozen `native-design.json` file in the dataset; preserve these files’ captured node identities and use the dataset’s checksum manifest for verification. Design scope is desktop only; mobile is explicitly excluded by the frozen coverage artifact.

**Layout & Dimensions:** 1512x982 desktop frames. Dark full-screen background. Top bar is 1512px wide with 24px padding and 24px control gap; content tiles begin at y=96, use 24px horizontal padding and 24px gaps, and have 16px corner radius. Bottom bar is 1512px wide at the bottom with 24px padding; controls use 16px gaps. Preserve the captured centered live controls, left/right control groups, preview tile, and menu overlay geometry from the five target frames.

**Design Tokens (Colors, Typography, Radii, Borders):** `#000000` background dim; `#11131a` surface dim; `#2e3038` brighter surface; `#2572ed` primary default; `#538dff` primary bright; `#c74e5b` error; `#eff0fa` high-emphasis text; `#272a31` bright border; 8px button radius; 16px tile radius; Inter typography. Button: 16px/24px, weight 600, letter-spacing .5px. Heading: 34px/40px, weight 600, letter-spacing .25px. Body: 14px/20px, weight 400, letter-spacing .25px. Use existing token variables where available.

**Component & State Specifications:** Exact visible copy includes `Go Live`, `Record`, `5`, and preview participant label `Rita B` where represented by the captured frame. Initial state shows preview and enabled Go Live. Starting state shows the same desktop composition with a starting/loading treatment and disabled duplicate start action. Live state renders the live session after the refreshed representation returns. Session Menu state shows the available broadcaster actions. On technical failure, keep the broadcaster interface available and show the project’s technical-failure treatment without inventing copy.

**Embedded Inline SVG Assets:** Use CSS-only equivalents for the captured generic logo bars, icon-button containers, separators, overflow dots, mic/camera/participant controls, and loading indicator; do not reference the frozen dataset at runtime. Preserve the 32px icon-button containers, 20–32px icon sizes, 8px internal padding, and the captured fills/borders. No new external asset or dependency is permitted.

### Implementation Requirements

Implement the embedded desktop specification exactly using existing project styling and component conventions. UC-backed controls must be functional; design-only controls remain visual. Add the smallest design-consistent control only if required by the UC and absent from the captured frames, and document the mapping in code comments.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the broadcaster component to the live-stream command and session-state APIs.

Continue working on the broadcaster session component. Use the existing API client/request approach and existing auth/session state. Implement an asynchronous `startLiveStream` action that sends `POST /api/v1/sessions/{sessionId}/live-stream/commands` with `Authorization`, `Content-Type: application/json`, and a unique stable `Idempotency-Key`; payload is `{ action: "START", expectedVersion: stream.version }`.

On HTTP 200, read `data.stream` and `data.session`, render the returned STARTING state, then repeat `GET /api/v1/sessions/{sessionId}/state` with the required Bearer token and optional `reactionCursor` only when present. When the updated representation is returned, render the LIVE session and viewer-facing playback outcome. Preserve request idempotency, current session identity, stream version, and existing date/time conventions. Do not optimistic-transition to LIVE.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and error handling.

Refine `startLiveStream` in the broadcaster component. Before the command, require an available authenticated host session, a valid session ID, a READY stream, and a numeric current stream version. Do not call the command when these checks fail; show the project’s existing validation treatment at the control area.

While the start request or required state refresh is pending, disable Go Live, show the existing loading treatment, and prevent duplicate submissions. On 400/401/403/404/409/422/503 or network failure, display the server-preserved message when available, otherwise the existing technical-failure state, and keep the broadcaster interface available. Keep the control retryable without creating a new stream or losing the current representation.

## Prompt E: Business Rules Compliance

### Objective: Implement every frozen UC-03 business rule without changing its meaning.

### Business Rule: BR-SLS-01
- **Name:** Authenticated Membership
- **Representation:** OCL precondition
- **Expression / authoritative text:** `RequestContext::authenticated and RequestContext::sessionId = command.sessionId and command.actorParticipantId = RequestContext::participantId and Participant.allInstances()->exists(p | p.id = command.actorParticipantId and p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and p.status = ParticipantStatus::JOINED and p.role = ParticipantRole::HOST)`
- **Context:** `LiveStreamService::start`
- **Enforcement layer:** backend and database-backed membership query
- **Failure behavior:** preserve the applicable authorization status/message from the API contract
- **Traceability:** API-LIVE-STREAM-CONTROL, UC-03 BF-1.2

### Business Rule: BR-SLS-02
- **Name:** Target Session
- **Representation:** OCL precondition
- **Expression / authoritative text:** `command.sessionId = session.id and session.status <> SessionStatus::ENDED`
- **Context:** `LiveStreamService::start`
- **Enforcement layer:** backend
- **Failure behavior:** preserve the applicable resource/command rejection status/message
- **Traceability:** UC-03 BF-1.2

### Business Rule: BR-SLS-03
- **Name:** Command Key
- **Representation:** OCL precondition
- **Expression / authoritative text:** `command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0`
- **Context:** `LiveStreamService::start`
- **Enforcement layer:** frontend and backend
- **Failure behavior:** reject the request using the existing validation response
- **Traceability:** API-LIVE-STREAM-CONTROL headers.Idempotency-Key

### Business Rule: BR-SLS-04
- **Name:** Stream Target And Version
- **Representation:** OCL precondition
- **Expression / authoritative text:** `command.action = StreamAction::START and session.kind = SessionKind::LIVE_STREAM and session.status = SessionStatus::LIVE and stream.sessionId = session.id and command.expectedVersion = stream.version`
- **Context:** `LiveStreamService::start`
- **Enforcement layer:** backend/database transaction
- **Failure behavior:** preserve conflict/rejection status and message
- **Traceability:** API-LIVE-STREAM-CONTROL body and UC-03 BF-1.2

### Business Rule: BR-SLS-05
- **Name:** Same Stream Version
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result = stream and stream.version = stream.version@pre + 1`
- **Context:** `LiveStreamService::start`
- **Enforcement layer:** backend/database transaction
- **Failure behavior:** no partial transition on failure
- **Traceability:** UC-03 BF-1.3

### Business Rule: BR-SLS-06
- **Name:** Ready Only
- **Representation:** OCL precondition
- **Expression / authoritative text:** `stream.status = StreamStatus::READY`
- **Context:** `LiveStreamService::start`
- **Enforcement layer:** backend
- **Failure behavior:** reject an already-started or ended stream using the existing command rejection
- **Traceability:** UC-03 BF-1.2

### Business Rule: BR-SLS-07
- **Name:** Starting
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `stream.status = StreamStatus::STARTING and stream.endedAt = null`
- **Context:** `LiveStreamService::start`
- **Enforcement layer:** backend/database
- **Failure behavior:** return the STARTING representation
- **Traceability:** UC-03 BF-1.4

### Business Rule: BR-SLS-08
- **Name:** Provider Completion Target
- **Representation:** OCL precondition
- **Expression / authoritative text:** `RequestContext::providerAuthenticated and command.sessionId = session.id and stream.sessionId = session.id and command.resourceId = stream.id and command.expectedVersion = stream.version and stream.status = StreamStatus::STARTING and session.status = SessionStatus::LIVE and TransactionContext::lockedSessionId = session.id and TransactionContext::atomicCommit`
- **Context:** `LiveStreamService::complete`
- **Enforcement layer:** backend/database transaction
- **Failure behavior:** reject completion without partial commit
- **Traceability:** UC-03 BF-1.5

### Business Rule: BR-SLS-09
- **Name:** Provider Completion State
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result = stream and stream.version = stream.version@pre + 1 and session.version = session.version@pre + 1 and if command.succeeded then stream.status = StreamStatus::LIVE and stream.startedAt <> null else stream.status = StreamStatus::READY endif`
- **Context:** `LiveStreamService::complete`
- **Enforcement layer:** backend/database transaction
- **Failure behavior:** LIVE with startedAt on success; READY on provider failure
- **Traceability:** UC-03 BF-1.5 and POST-1/POST-2

## Prompt F: Implementation Context

Use this prompt with the current project manifests/lockfiles, existing source conventions, approved DBML/live database, frozen API contracts, and the embedded desktop Figma specification above. Preserve `synchronize: false`, `migrationsRun: false`, existing versions, response envelopes, authentication adapters, transaction boundaries, and migration conventions. Priority is UC-03 requirements, then frozen API/database contracts, then the embedded design specification, then existing source conventions. Do not alter schema, migrations, or external media delivery.
