---
artifact_type: business-coding-prompt
status: Approved
uc_id: UC-02
uc_name: "Join a Session"
generated_at: 2026-11-22T20:41:01+07:00
---

# UC-02 Business Coding Prompt - Join a Session

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create the `POST /api/v1/sessions/{sessionId}/participants` endpoint in the existing NestJS REST controller for sessions/participants. The endpoint is protected by the required Bearer session access token, using the registered or guest form. Require `Authorization`, `Content-Type: application/json`, and `Idempotency-Key` headers.

### Request Format

Path parameter `sessionId` is a required UUID string. The JSON body contains required string `displayName`, required booleans `microphoneEnabled` and `cameraEnabled`, and nullable optional strings `microphoneDeviceId`, `cameraDeviceId`, `speakerDeviceId`, and `virtualBackgroundId`.

Implement the main logic in the existing service/application layer through the named join operation and `MutationGateway`; preserve the existing controller, DTO, error-filter, ORM, and response-envelope conventions.

### Logic

Implement API-SESSION-JOIN for UC-02. Decode the trusted principal and session from the authenticated context; do not trust caller-supplied principal, user, or session identity. Lock the target session and execute the mutation in one SERIALIZABLE atomic transaction. Normalize the display name with trim, validate the active virtual background when supplied, reject ended sessions, duplicate joined membership, invalid command keys, invalid names, and capacity violations. Create the participant, media preference, and view preference; initialize view layout to EQUAL_PROMINENCE, with no focus, side panel, or picture-in-picture. The designated host becomes HOST and opens the session to LIVE; live-stream non-hosts are VIEWER and video-conference non-hosts are BROADCASTER. Viewer media is disabled regardless of requested media. Persist the session version and idempotency receipt only on a newly dispatched successful command; retain the 24-hour receipt expiry. Replays return the stored response without domain effects when the payload hash matches; a hash conflict is rejected without domain effects. Use the existing TypeORM mappings and database at migration head `InitialSchema1792195200000`; do not change schema, migrations, or synchronization settings.

### Success Response

Return HTTP 201 with `{ "success": true, "message": "[source-defined success message]", "data": { "participant": Participant, "session": SessionSummary, "stream": Stream or null, "media": MediaPreference, "view": ViewPreference } }`. Preserve source-defined field names and message semantics.

### Error Handling

Return the contract status for malformed JSON or wire-schema validation (400), rejected authentication (401), rejected access context (403), unavailable session/resource (404), duplicate/capacity/idempotency conflict (409), rejected domain command (422), and temporary required-service failure (503). Preserve the source status and message through the existing error envelope `{ "success": false, "statusCode": status, "message": message, "timestamp": ISO-8601, "path": "/api/v1/sessions/{sessionId}/participants" }`. Do not invent error messages where the frozen API contract leaves them unspecified.

## Prompt B: Frontend UI

### Objective: Build the desktop pre-join interface and its joining states according to the frozen Figma evidence.

Create the existing React/TypeScript pre-join component using the repository’s existing styling and component conventions. The approved scope is desktop only; do not infer mobile behavior from the UC’s mobile references.

The component displays the video preview, display-name/details area, microphone and camera controls, device/settings overflow controls, virtual-background or related preview controls where present in the approved frame, and the Join action. It must support the filled preview, starting/loading, joined, and recovery/error states defined by the UC and API.

Target frames and design provenance: dataset `100ms-2026-10-02-001`, file key `lCvn1rB7IdRchqAuEatJJp`; `6066:89824` Details Filled, native design captured 2026-10-02T02:31:51.899392Z, 1512x982; `6007:51341` Details Filled, `6007:51391` Starting, and `6007:51418` Details Filled, each 1512x982 and captured 2026-10-02T02:58:0xZ. UC-02 coverage identifies `6066:89824`, `6007:51341`, `6007:51391`, and `6007:51418` as the required evidence nodes. Native-design SHA-256 values are the checksum-addressed frozen files in the dataset; preserve those hashes in implementation notes and do not load design files at runtime.

Layout and dimensions: desktop viewport 1512x982; dark full-screen background; centered vertical pre-join control with a 40px section gap, 24px preview/control gap, 480px preview/control unit where shown, 16px/24px internal spacing, 16px video-tile radius, 8px control radius, and 40px chip radius. The filled frame includes “Get Started”, “Setup your audio and video before joining”, and “You are the first to join”.

Design tokens: Inter; heading 34px semibold, 40px line height, 0.25px tracking; supporting text 16px regular, 24px line height, 0.5px tracking; high-contrast text `#eff0fa`, medium text `#c5c6d0`; background dim black; surface dim `#11131a`; surface default `#191b23`; borders `#1d1f27` and `#272a31`; primary bright `#538dff`; preview avatar purple `#7e47eb`; white avatar text; 8px and 16px radii. Preserve disabled, muted, active, loading, permission-denied, and recovery treatments from the captured controls.

Embedded inline SVG assets: use the captured vector semantics and inline the following frozen assets where applicable, with no runtime dataset dependency:

```svg
<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0L28 5.09091C40.6523 5.09091 50.9091 15.3477 50.9091 28C50.9091 40.6523 40.6523 50.9091 28 50.9091C15.3477 50.9091 5.09091 40.6523 5.09091 28L0 28C0 43.464 12.536 56 28 56Z" fill="#2572ED"/></svg>
<svg width="1" height="48" viewBox="0 0 1 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.5 0V48" stroke="#272A31"/></svg>
<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6.66667" cy="6.66667" r="6.66667" fill="#FFEDEC"/></svg>
```

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the pre-join component to API-SESSION-JOIN and API-SESSION-STATE and implement the successful flow.

Continue working on the pre-join component. Use the existing API client/request approach and local React state conventions. Track display name, microphone/camera enabled state, selected device IDs, virtual background ID, submitting state, returned participant/session/media/view/stream data, and a recoverable error while preserving preview values.

Implement a join handler that sends `POST /api/v1/sessions/{sessionId}/participants` with the JSON request body and a fresh opaque `Idempotency-Key`; include the Bearer token and `Content-Type: application/json`. On HTTP 201, read the normalized response data, render the active session, and render the participant tile from the returned participant/media state. Use API-SESSION-STATE to refresh/read the session representation when the existing route flow requires it. On failure, retain the preview context and show the returned recovery state.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and error handling.

Refine the join handler in the pre-join component. Before the request, require a trimmed display name of 1–50 characters, require boolean media selections, and allow device and virtual-background values to be null or strings. Do not submit when validation fails; show the validation message adjacent to the corresponding field/control. Backend validation remains authoritative.

While submitting, disable Join, show the existing starting/loading treatment, and prevent duplicate submissions. For 400, 401, 403, 404, 409, 422, and 503 responses, display the returned message in the existing recovery/error location and preserve all preview selections. On success, transition to the session route/view and reflect the returned identity and effective media state.

## Prompt E: Business Rules Compliance

### Objective: Implement every frozen UC-02 business rule without changing its meaning.

### Business Rule: BR-JS-01
- Name: Trusted Join Principal
- Representation: OCL precondition
- Expression / authoritative text: `RequestContext::authenticated and command.sessionId = RequestContext::sessionId and command.principalId = RequestContext::principalId and Principal.allInstances()->exists(p | p.id = command.principalId and p.userId = command.userId)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend
- Failure behavior: reject the authenticated-context mismatch; exact status/message follows the API contract and existing error mapping
- Traceability: API-SESSION-JOIN authorization and join command

### Business Rule: BR-JS-02
- Name: Target Session
- Representation: OCL precondition
- Expression / authoritative text: `command.sessionId = session.id and session.status <> SessionStatus::ENDED`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend
- Failure behavior: reject unavailable or ended session
- Traceability: API-SESSION-JOIN path.sessionId

### Business Rule: BR-JS-03
- Name: Command Key
- Representation: OCL precondition
- Expression / authoritative text: `command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and frontend
- Failure behavior: reject missing or blank Idempotency-Key
- Traceability: API-SESSION-JOIN headers.Idempotency-Key

### Business Rule: BR-JS-04
- Name: Name
- Representation: OCL precondition
- Expression / authoritative text: `command.displayName <> null and command.displayName.trim().size() > 0 and command.displayName.trim().size() <= 50`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and frontend
- Failure behavior: reject invalid display name and show field validation
- Traceability: API-SESSION-JOIN body.displayName and participants.display_name

### Business Rule: BR-JS-05
- Name: No Duplicate Membership
- Representation: OCL precondition
- Expression / authoritative text: `not session.participants->exists(p | p.principalId = command.principalId and p.status = ParticipantStatus::JOINED)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: reject conflicting joined membership without domain effects
- Traceability: active-principal uniqueness and join mutation

### Business Rule: BR-JS-06
- Name: Capacity
- Representation: OCL precondition
- Expression / authoritative text: `let count : Integer = session.participants->select(p | p.status = ParticipantStatus::JOINED)->size() in (session.kind = SessionKind::VIDEO_CONFERENCE implies count < 100) and (session.kind = SessionKind::LIVE_STREAM implies count < 1000)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: reject when the applicable capacity is reached
- Traceability: sessions.kind and joined participants

### Business Rule: BR-JS-07
- Name: Created Identity
- Representation: OCL postcondition
- Expression / authoritative text: `result.oclIsNew() and result.id <> null and result.sessionId = command.sessionId and result.principalId = command.principalId and result.userId = command.userId`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: successful creation must return the persisted identity
- Traceability: participant creation and API 201 data.participant

### Business Rule: BR-JS-08
- Name: Joined Participant
- Representation: OCL postcondition
- Expression / authoritative text: `result.status = ParticipantStatus::JOINED and result.displayName = command.displayName.trim() and result.joinedAt <> null and result.leftAt = null and result.version = 1 and session.participants = session.participants@pre->including(result)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: successful participant is JOINED with normalized identity and version 1
- Traceability: participants columns and API 201 data.participant

### Business Rule: BR-JS-09
- Name: Exclusive Role
- Representation: OCL postcondition
- Expression / authoritative text: `result.role = if command.principalId = session.designatedHostPrincipalId then ParticipantRole::HOST else if session.kind = SessionKind::LIVE_STREAM then ParticipantRole::VIEWER else ParticipantRole::BROADCASTER endif endif`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend
- Failure behavior: assign exactly the role determined by host identity and session kind
- Traceability: sessions.designated_host_principal_id and participants.role

### Business Rule: BR-JS-10
- Name: Effective Media
- Representation: OCL postcondition
- Expression / authoritative text: `result.microphoneEnabled = (result.role <> ParticipantRole::VIEWER and command.microphoneEnabled) and result.cameraEnabled = (result.role <> ParticipantRole::VIEWER and command.cameraEnabled)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and frontend
- Failure behavior: viewer media is disabled; other roles reflect requested media
- Traceability: preview media controls and participants media columns

### Business Rule: BR-JS-11
- Name: Host Opens Session
- Representation: OCL postcondition
- Expression / authoritative text: `if result.role = ParticipantRole::HOST then session.hostParticipantId = result.id and session.status = SessionStatus::LIVE else session.hostParticipantId = session.hostParticipantId@pre and session.status = session.status@pre endif`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: only the designated host opens the session
- Traceability: sessions.host_participant_id and sessions.status

### Business Rule: BR-JS-12
- Name: Draft Background
- Representation: OCL precondition
- Expression / authoritative text: `command.virtualBackgroundId = null or VirtualBackground.allInstances()->exists(b | b.id = command.virtualBackgroundId and b.active)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and frontend
- Failure behavior: reject an unknown or inactive virtual background
- Traceability: API-SESSION-JOIN body.virtualBackgroundId and virtual_backgrounds.active

### Business Rule: BR-JS-13
- Name: Initialize Preferences
- Representation: OCL postcondition
- Expression / authoritative text: `MediaPreference.allInstances()->one(m | m.participantId = result.id and m.oclIsNew() and m.microphoneDeviceId = command.microphoneDeviceId and m.cameraDeviceId = command.cameraDeviceId and m.speakerDeviceId = command.speakerDeviceId and m.virtualBackgroundId = command.virtualBackgroundId and m.updatedAt <> null) and ViewPreference.allInstances()->one(v | v.participantId = result.id and v.oclIsNew() and v.layout = LayoutMode::EQUAL_PROMINENCE and v.focusedParticipantId = null and v.sidePanel = null and not v.pictureInPicture and v.updatedAt <> null)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: successful join commits exactly one media and one default view preference
- Traceability: media_preferences, view_preferences, API 201 data.media/data.view

### Business Rule: BR-JS-14
- Name: Gateway Identity And Transaction
- Representation: OCL precondition
- Expression / authoritative text: `RequestContext::authenticated and command.principalId = RequestContext::principalId and command.sessionId = RequestContext::sessionId and command.sessionId = session.id and TransactionContext::lockedSessionId = session.id and TransactionContext::isolation = IsolationLevel::SERIALIZABLE and TransactionContext::atomicCommit and command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0`
- Context: `MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt`
- Enforcement layer: backend and database
- Failure behavior: reject identity or transaction precondition failure without partial writes
- Traceability: mutation gateway and session transaction

### Business Rule: BR-JS-15
- Name: Replay Or Dispatch
- Representation: OCL postcondition
- Expression / authoritative text: `let previous : Set(IdempotencyRecord) = IdempotencyRecord.allInstances()@pre->select(r | r.principalId = command.principalId and r.sessionId = command.sessionId and r.operation = command.operation and r.idempotencyKey = command.idempotencyKey and DateTime::isAfter(r.expiresAt, DateTime::now())) in if previous->notEmpty() then result.dispatchCount = 0 and session.version = session.version@pre and if previous->any(true).payloadHash = command.payloadHash then result.outcome = MutationOutcome::COMPLETED and result.responseReference = previous->any(true).responseReference else result.outcome = MutationOutcome::REJECTED endif else result.dispatchCount = 1 and if result.outcome = MutationOutcome::COMPLETED then session.version = session.version@pre + 1 else session.version = session.version@pre endif endif`
- Context: `MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt`
- Enforcement layer: backend and database
- Failure behavior: replay matching hash; reject conflicting hash; dispatch only when no live record exists
- Traceability: idempotency_records and session.version

### Business Rule: BR-JS-16
- Name: Persist Receipt
- Representation: OCL postcondition
- Expression / authoritative text: `(result.dispatchCount = 1 and result.outcome = MutationOutcome::COMPLETED) implies IdempotencyRecord.allInstances()->one(r | r.principalId = command.principalId and r.sessionId = command.sessionId and r.operation = command.operation and r.idempotencyKey = command.idempotencyKey and r.payloadHash = command.payloadHash and r.responseReference = result.responseReference and r.completedAt = result.completedAt and r.expiresAt = DateTime::addHours(r.completedAt, 24))`
- Context: `MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt`
- Enforcement layer: backend and database
- Failure behavior: persist the receipt atomically with a newly completed dispatch
- Traceability: idempotency_records

### Business Rule: BR-JS-17
- Name: No Effects On Replay Or Rejection
- Representation: OCL postcondition
- Expression / authoritative text: `(result.dispatchCount = 0 or result.outcome = MutationOutcome::REJECTED) implies DomainState::snapshot(session.id) = DomainState::snapshot@pre(session.id)`
- Context: `MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt`
- Enforcement layer: backend and database
- Failure behavior: replay or rejection leaves domain state unchanged
- Traceability: mutation gateway replay/conflict path

### Business Rule: BR-JS-18
- Name: Session Participant Bindings
- Representation: OCL invariant
- Expression / authoritative text: `self.participants = Participant.allInstances()->select(p | p.sessionId = self.id) and self.participants->select(p | p.status = ParticipantStatus::JOINED)->isUnique(principalId) and self.participants->select(p | p.status = ParticipantStatus::JOINED and p.role = ParticipantRole::HOST)->size() <= 1`
- Context: `Session`
- Enforcement layer: backend and database
- Failure behavior: maintain session membership binding, unique joined principal, and at most one joined host
- Traceability: sessions/participants relations and unique indexes

### Business Rule: BR-JS-19
- Name: Session Capacity Invariant
- Representation: OCL invariant
- Expression / authoritative text: `let joined : Set(Participant) = self.participants->select(p | p.status = ParticipantStatus::JOINED) in (self.kind = SessionKind::VIDEO_CONFERENCE implies joined->size() <= 100) and (self.kind = SessionKind::LIVE_STREAM implies joined->size() <= 1000 and joined->select(p | p.role <> ParticipantRole::VIEWER)->size() <= 10)`
- Context: `Session`
- Enforcement layer: backend and database
- Failure behavior: preserve the session capacity invariant after every committed mutation
- Traceability: sessions.kind and joined participant roles

## Prompt F: Implementation Context

Use Prompts A–E together with the approved React 18/Vite/TypeScript and NestJS 11/TypeORM/MySQL conventions, the pinned database contract, the frozen API contracts, the embedded desktop Figma specification and inline SVG assets in Prompt B, and existing source-code conventions. Prioritize explicit UC-02 requirements, then API/database contracts, then embedded design evidence, then existing conventions. Keep `synchronize: false` and `migrationsRun: false`; do not create or execute migrations; preserve sensitive-data handling and never log tokens or raw credentials.
