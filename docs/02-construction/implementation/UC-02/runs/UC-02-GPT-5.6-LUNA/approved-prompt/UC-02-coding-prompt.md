---
artifact_type: business-coding-prompt
status: Approved
uc_id: UC-02
uc_name: "Join a Session"
generated_at: 2026-11-23T13:09:00+07:00
---

# UC-02 Business Coding Prompt - Join a Session

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create `POST /api/v1/sessions/{sessionId}/participants` in the existing NestJS controller/service architecture. It is protected by the Bearer session access token and requires authorization. Read `sessionId` from the UUID path parameter; require `Authorization: Bearer ...`, `Content-Type: application/json`, and `Idempotency-Key` headers.

Accept JSON fields `displayName: string`, `microphoneEnabled: boolean`, `cameraEnabled: boolean`, and nullable optional strings `microphoneDeviceId`, `cameraDeviceId`, `speakerDeviceId`, and `virtualBackgroundId`. Reject malformed wire data with 400. Preserve source-defined status/message semantics for 401, 403, 404, 409, 422, and 503; where the source does not define the literal message, preserve the existing project error message rather than inventing one.

Implement API-SESSION-JOIN through the existing MutationGateway and SessionJoinService. Authenticate and bind principal/session context, lock the target session with SERIALIZABLE isolation, and commit atomically. Reject ended or unavailable sessions, invalid names, duplicate joined membership, capacity overflow, inactive backgrounds, untrusted principal/session bindings, and conflicting idempotency payloads. Trim the display name. For a new successful command create the participant, media preference, and view preference; initialize layout to EQUAL_PROMINENCE, with no focus, side panel, or picture-in-picture. Assign HOST to the designated host principal, VIEWER for live-stream non-hosts, and BROADCASTER otherwise. Disable media for VIEWER; otherwise use the command flags. A host opens the session to LIVE and records `hostParticipantId`.

Return HTTP 201 with `{ "success": true, "message": <existing success message>, "data": { "participant": ..., "session": ..., "stream": ..., "media": ..., "view": ... } }`. Use existing entity mappings and migration conventions; do not alter schema or add dependencies. For a valid unexpired replay, return the stored response without domain effects; for a payload mismatch reject without domain effects. Persist a successful receipt with a 24-hour expiry and increment session version exactly once.

## Prompt B: Frontend UI

### Objective: Build the desktop join flow according to the frozen Figma evidence.

Implement the existing React 18/TypeScript/Vite/Tailwind pre-join component as the desktop Join-a-Session surface. It must display the preview video/avatar tile, microphone status, camera/microphone/permission/more controls, display-name input, Join/Go Live action, loading state, and recovery/error feedback while preserving preview context.

**Target Frames & Design Provenance:** Frozen dataset `100ms-2026-10-02-001`; UC-02 coverage nodes: `6066:89824` (Details Filled, 1512x982), `6007:51341` (Details Filled, 1512x982), `6007:51391` (Starting, 1512x982), and `6007:51418` (required coverage node; use its validated metadata). UC-02 is desktop-only; mobile references in the UC are out of scope. Native-design evidence is checksum-valid per the prepared dataset.

**Layout & Dimensions:** Black full-screen background; centered desktop pre-join composition; 480px content width; 40px vertical stack gaps, 24px preview-section gap, 16px control/name gaps; 337.5px-high 480px-wide video tile with 16px radius; 48px controls and name input; 40px pill chip. Preserve the captured node hierarchy and alignment for the four required states: filled details, starting/loading, and joined/recovery transition.

**Design Tokens (Colors, Typography, Radii, Borders):** Inter. Heading 34/40, weight 600, letter spacing .25px; body 16/24, weight 400, letter spacing .5px; body/button semibold 14/20 or 16/24. Background black `#000`; high text `#eff0fa`; medium text `#c5c6d0`; low text `#8f9099`; default surface `#191b23`; dim surface `#11131a`; brighter surface `#2e3038`; default border `#1d1f27`; bright border `#272a31`; bright primary `#538dff`; disabled primary `#004299`; low-on-primary `#84aaff`; avatar `#7e47eb`; secondary dim `#293042`; radius 8px for controls, 16px tile, 40px chip.

**Component & State Specifications:** Exact copy includes `Get Started`, `Setup your audio and video before joining`, `You are the first to join`, `Enter name`, and `Go Live` as captured. Show avatar when video is unavailable or muted, mic badge, permission-required/denied states, menu state, disabled action when the trimmed name is empty or exceeds 50 characters, and a starting state while the join request is pending. On server failure show the returned recovery state without clearing entered name or preview selections. Use the existing inline SVG icon equivalents already present in `PreJoinPreview.tsx`; do not load design files at runtime.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the pre-join component to API-SESSION-JOIN and API-SESSION-STATE.

Continue working on `PreJoinPreview`. Add state for the name, camera/microphone toggles and permissions, device IDs, virtual background selection, request status, idempotency key, returned participant/session/media/view/stream data, and recoverable error. Use the existing request approach in the project; do not add a client library.

On Join, trim `displayName`, validate it locally, create one opaque idempotency key for the command, and POST JSON to `/api/v1/sessions/{sessionId}/participants` with the required bearer and content-type headers. Send the four required fields and nullable optional device/background fields. On HTTP 201, read normalized `data`, preserve the returned identity/media state, then render the active session and participant tile. Use API-SESSION-STATE GET `/api/v1/sessions/{sessionId}/state` when the existing application flow requires session refresh. Do not retry a completed command with a new key; permit an explicit retry using the same command key when the operation outcome is unknown.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and error handling.

Refine the Join handler in `PreJoinPreview`. While `joining` is true, disable Join, show the captured starting/loading treatment, and prevent duplicate submissions. Before the call require a non-empty trimmed name of at most 50 characters; display the validation message beside the name input and do not call the API when invalid. Keep media controls usable only when permission/device state allows them and force effective camera/microphone false for a VIEWER.

If the API returns 400/401/403/404/409/422/503 or a network failure, display the source/API message when available in the existing recovery feedback area, retain the name and preview selections, stop loading, and allow a deliberate retry. Do not represent a rejection or replay as a new participant. Backend validation and authorization remain authoritative.

## Prompt E: Business Rules Compliance

### Objective: Implement the complete frozen Business Rule set without changing its meaning.

### Business Rule: BR-JS-01
- Name: Trusted Join Principal
- Representation: OCL precondition
- Expression / authoritative text: `RequestContext::authenticated and command.sessionId = RequestContext::sessionId and command.principalId = RequestContext::principalId and Principal.allInstances()->exists(p | p.id = command.principalId and p.userId = command.userId)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend
- Failure behavior: source API authorization/error behavior; literal message unresolved
- Traceability: API-SESSION-JOIN authentication and authorization

### Business Rule: BR-JS-02
- Name: Target Session
- Representation: OCL precondition
- Expression / authoritative text: `command.sessionId = session.id and session.status <> SessionStatus::ENDED`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend
- Failure behavior: source API resource/operation rejection; literal message unresolved
- Traceability: API-SESSION-JOIN path and join flow

### Business Rule: BR-JS-03
- Name: Command Key
- Representation: OCL precondition
- Expression / authoritative text: `command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and frontend
- Failure behavior: reject missing/blank Idempotency-Key; literal message unresolved
- Traceability: API-SESSION-JOIN headers.Idempotency-Key

### Business Rule: BR-JS-04
- Name: Name
- Representation: OCL precondition
- Expression / authoritative text: `command.displayName <> null and command.displayName.trim().size() > 0 and command.displayName.trim().size() <= 50`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and frontend
- Failure behavior: reject invalid display name; literal message unresolved
- Traceability: BF-1.1 and request body displayName

### Business Rule: BR-JS-05
- Name: No Duplicate Membership
- Representation: OCL precondition
- Expression / authoritative text: `not session.participants->exists(p | p.principalId = command.principalId and p.status = ParticipantStatus::JOINED)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: conflict/rejection per API contract; literal message unresolved
- Traceability: API-SESSION-JOIN and participant membership

### Business Rule: BR-JS-06
- Name: Capacity
- Representation: OCL precondition
- Expression / authoritative text: `let count : Integer = session.participants->select(p | p.status = ParticipantStatus::JOINED)->size() in (session.kind = SessionKind::VIDEO_CONFERENCE implies count < 100) and (session.kind = SessionKind::LIVE_STREAM implies count < 1000)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: reject capacity overflow; literal message unresolved
- Traceability: session kind and join command

### Business Rule: BR-JS-07
- Name: Created Identity
- Representation: OCL postcondition
- Expression / authoritative text: `result.oclIsNew() and result.id <> null and result.sessionId = command.sessionId and result.principalId = command.principalId and result.userId = command.userId`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: successful creation must satisfy identity bindings
- Traceability: API-SESSION-JOIN data.participant

### Business Rule: BR-JS-08
- Name: Joined Participant
- Representation: OCL postcondition
- Expression / authoritative text: `result.status = ParticipantStatus::JOINED and result.displayName = command.displayName.trim() and result.joinedAt <> null and result.leftAt = null and result.version = 1 and session.participants = session.participants@pre->including(result)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: successful creation must satisfy joined state
- Traceability: BF-1.3 and participant response

### Business Rule: BR-JS-09
- Name: Exclusive Role
- Representation: OCL postcondition
- Expression / authoritative text: `result.role = if command.principalId = session.designatedHostPrincipalId then ParticipantRole::HOST else if session.kind = SessionKind::LIVE_STREAM then ParticipantRole::VIEWER else ParticipantRole::BROADCASTER endif endif`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend
- Failure behavior: successful participant receives exactly the derived role
- Traceability: participant role in joined session

### Business Rule: BR-JS-10
- Name: Effective Media
- Representation: OCL postcondition
- Expression / authoritative text: `result.microphoneEnabled = (result.role <> ParticipantRole::VIEWER and command.microphoneEnabled) and result.cameraEnabled = (result.role <> ParticipantRole::VIEWER and command.cameraEnabled)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and frontend
- Failure behavior: viewer media is disabled; otherwise preserve requested flags
- Traceability: media controls and participant tile

### Business Rule: BR-JS-11
- Name: Host Opens Session
- Representation: OCL postcondition
- Expression / authoritative text: `if result.role = ParticipantRole::HOST then session.hostParticipantId = result.id and session.status = SessionStatus::LIVE else session.hostParticipantId = session.hostParticipantId@pre and session.status = session.status@pre endif`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: only a host changes lobby to live
- Traceability: session status after join

### Business Rule: BR-JS-12
- Name: Draft Background
- Representation: OCL precondition
- Expression / authoritative text: `command.virtualBackgroundId = null or VirtualBackground.allInstances()->exists(b | b.id = command.virtualBackgroundId and b.active)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend
- Failure behavior: reject inactive/nonexistent background selection
- Traceability: request body virtualBackgroundId

### Business Rule: BR-JS-13
- Name: Initialize Preferences
- Representation: OCL postcondition
- Expression / authoritative text: `MediaPreference.allInstances()->one(m | m.participantId = result.id and m.oclIsNew() and m.microphoneDeviceId = command.microphoneDeviceId and m.cameraDeviceId = command.cameraDeviceId and m.speakerDeviceId = command.speakerDeviceId and m.virtualBackgroundId = command.virtualBackgroundId and m.updatedAt <> null) and ViewPreference.allInstances()->one(v | v.participantId = result.id and v.oclIsNew() and v.layout = LayoutMode::EQUAL_PROMINENCE and v.focusedParticipantId = null and v.sidePanel = null and not v.pictureInPicture and v.updatedAt <> null)`
- Context: `SessionJoinService::join(command: JoinCommand, session: Session): Participant`
- Enforcement layer: backend and database
- Failure behavior: atomic join fails if preferences cannot be initialized
- Traceability: API-SESSION-JOIN data.media and data.view

### Business Rule: BR-JS-14
- Name: Gateway Identity And Transaction
- Representation: OCL precondition
- Expression / authoritative text: `RequestContext::authenticated and command.principalId = RequestContext::principalId and command.sessionId = RequestContext::sessionId and command.sessionId = session.id and TransactionContext::lockedSessionId = session.id and TransactionContext::isolation = IsolationLevel::SERIALIZABLE and TransactionContext::atomicCommit and command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0`
- Context: `MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt`
- Enforcement layer: backend and database
- Failure behavior: reject before dispatch when gateway context is invalid
- Traceability: mutation gateway join dispatch

### Business Rule: BR-JS-15
- Name: Replay Or Dispatch
- Representation: OCL postcondition
- Expression / authoritative text: `let previous : Set(IdempotencyRecord) = IdempotencyRecord.allInstances()@pre->select(r | r.principalId = command.principalId and r.sessionId = command.sessionId and r.operation = command.operation and r.idempotencyKey = command.idempotencyKey and DateTime::isAfter(r.expiresAt, DateTime::now())) in if previous->notEmpty() then result.dispatchCount = 0 and session.version = session.version@pre and if previous->any(true).payloadHash = command.payloadHash then result.outcome = MutationOutcome::COMPLETED and result.responseReference = previous->any(true).responseReference else result.outcome = MutationOutcome::REJECTED endif else result.dispatchCount = 1 and if result.outcome = MutationOutcome::COMPLETED then session.version = session.version@pre + 1 else session.version = session.version@pre endif endif`
- Context: `MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt`
- Enforcement layer: backend and database
- Failure behavior: replay stored success or reject conflicting payload without dispatch
- Traceability: Idempotency-Key behavior

### Business Rule: BR-JS-16
- Name: Persist Receipt
- Representation: OCL postcondition
- Expression / authoritative text: `(result.dispatchCount = 1 and result.outcome = MutationOutcome::COMPLETED) implies IdempotencyRecord.allInstances()->one(r | r.principalId = command.principalId and r.sessionId = command.sessionId and r.operation = command.operation and r.idempotencyKey = command.idempotencyKey and r.payloadHash = command.payloadHash and r.responseReference = result.responseReference and r.completedAt = result.completedAt and r.expiresAt = DateTime::addHours(r.completedAt, 24))`
- Context: `MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt`
- Enforcement layer: backend and database
- Failure behavior: successful dispatch persists a 24-hour receipt
- Traceability: mutation receipt persistence

### Business Rule: BR-JS-17
- Name: No Effects On Replay Or Rejection
- Representation: OCL postcondition
- Expression / authoritative text: `(result.dispatchCount = 0 or result.outcome = MutationOutcome::REJECTED) implies DomainState::snapshot(session.id) = DomainState::snapshot@pre(session.id)`
- Context: `MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt`
- Enforcement layer: backend and database
- Failure behavior: replay/rejection leaves domain state unchanged
- Traceability: EF-1 and idempotency conflict handling

### Business Rule: BR-JS-18
- Name: Session Participant Bindings
- Representation: OCL invariant
- Expression / authoritative text: `self.participants = Participant.allInstances()->select(p | p.sessionId = self.id) and self.participants->select(p | p.status = ParticipantStatus::JOINED)->isUnique(principalId) and self.participants->select(p | p.status = ParticipantStatus::JOINED and p.role = ParticipantRole::HOST)->size() <= 1`
- Context: `Session`
- Enforcement layer: backend and database
- Failure behavior: invariant must hold after every committed state
- Traceability: participant/session persistence

### Business Rule: BR-JS-19
- Name: Session Capacity Invariant
- Representation: OCL invariant
- Expression / authoritative text: `let joined : Set(Participant) = self.participants->select(p | p.status = ParticipantStatus::JOINED) in (self.kind = SessionKind::VIDEO_CONFERENCE implies joined->size() <= 100) and (self.kind = SessionKind::LIVE_STREAM implies joined->size() <= 1000 and joined->select(p | p.role <> ParticipantRole::VIEWER)->size() <= 10)`
- Context: `Session`
- Enforcement layer: backend and database
- Failure behavior: invariant must hold after every committed state
- Traceability: session capacity and live-stream role limits

## Prompt F: Implementation Context

Use this prompt with the frozen UC-02 specification, API-SESSION-JOIN, API-SESSION-STATE, the validated database baseline, the desktop-only Figma evidence embedded above, and the existing `finalsource` conventions. Preserve the current React/Vite/Tailwind and NestJS/TypeORM/MySQL versions, disabled synchronization/automatic migrations, existing error filter and response conventions, and current inline SVG approach. Requirements in this prompt take priority over conventions; approved UC/API/database contracts take priority over design evidence; do not invent missing status messages or schema changes.
