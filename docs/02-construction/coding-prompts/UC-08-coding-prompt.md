---
artifact_type: business-coding-prompt
status: Approved
uc_id: UC-08
uc_name: View Session Participants
generated_at: 2026-11-23T14:54:00+07:00
---

# UC-08 Business Coding Prompt - View Session Participants

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create the `GET /api/v1/sessions/{sessionId}/participants` endpoint in the existing NestJS backend controller/module for sessions and participants. The endpoint is protected and requires the existing Bearer session access token authentication for registered or guest users.

### Request Format

Path parameter `sessionId: string` (UUID, required). Optional query parameters: `cursor: string` (URI-encoded opaque JSON-string continuation token) and `pageSize: integer` (default 50). No request body. Require `Authorization: Bearer <session-access-token>` and `Accept: application/json`.

Implement the flow in the existing collaboration/session service and repository conventions. Resolve the trusted request context from the authenticated token; do not use process-global request state.

### Logic

Implement `API-PARTICIPANT-LIST` / `CollaborationService::listParticipants(query, session)`: verify authenticated membership, matching request session, requester participant identity/principal, `JOINED` membership, session existence and non-ENDED status; validate `pageSize > 0 && pageSize <= 50`; validate cursor decoding, signature, collection (`participants`) and session binding. Read a live keyset page ordered by immutable `(joinedAt, id)` ascending, return only participants for the session with `status = JOINED`, and guarantee unique IDs. Perform no domain writes.

### Success Response

HTTP 200 with `{ "success": true, "message": "[existing project success message semantics]", "data": { "items": [Participant public representations], "nextCursor": "opaque-token-or-null" } }`. Preserve source-defined participant representation fields and do not expose principal secrets or internal data.

### Error Handling

Return the existing project error envelope and status mapping for malformed input (400), rejected authentication (401), rejected access/membership (403), missing session (404), and unavailable required service (503): `{ "success": false, "statusCode": <status>, "message": "<source error message>", "timestamp": "<ISO-8601>", "path": "/api/v1/sessions/{sessionId}/participants" }`. Preserve the source status and message; do not invent new messages. Keep `synchronize: false` and `migrationsRun: false`, use existing ORM mappings, and do not alter schema or migrations.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the frozen Figma design.

Create the participants panel within the joined-session interface using the existing React 18, TypeScript, Vite and project styling/component conventions. The trigger is opening the participants panel. The panel must display the participant list, visible participant roles/states, loading and unavailable states, and a close control that restores the session layout.

**Target Frames & Design Provenance:** Use the checksum-valid dataset `100ms-2026-10-02-001`, desktop frame `Default`, node `6007:58204`, page `6007:55138`, natural size `1512x982`; the relevant component is `Participant Panel/Desktop`, node `6007:58209`, 400x790. Native subtree SHA-256: `sha256:a763b87b00efd6d32198301e248220a10b7337ce64d950fb1184e72ae2d01f3d`. The related `Participants` frame node is `6007:58202`; use it only for the participant-panel composition/state evidence. The UC names desktop and mobile related UI, but this frozen participant-panel evidence is desktop-only; do not invent mobile measurements.

**Layout & Dimensions:** Dark session canvas. Right-side participant panel is 400px wide, 790px high, with 24px left/right/top padding and 16px bottom padding, 16px vertical gap, 16px radius, background `#11131a`. Header is full width with title `Participants`, a 24px close icon, and aligned controls. Participant rows are vertically stacked, 16px gaps, with 24px avatar/role icon area, text column, and trailing state/menu affordances. Preserve the surrounding session layout and restore it when the panel closes.

**Design Tokens:** Inter. Body 2: 14px/20px, weight 400, letter spacing 0.25px. Caption: 12px/16px, weight 400, letter spacing 0.4px. Button/labels: 16px/24px, weight 600, letter spacing 0.5px. High text `#eff0fa`; medium text `#c5c6d0`; low text `#8f9099`; panel `#11131a`; default surface `#191b23`; bright surface/border `#272a31`; radius 8px for controls and 16px for panel; scrim/background dim is black where the session design uses it.

**Component & State Specifications:** Exact visible copy includes `Participants`; participant entries show public display representation and visible role/status only. Use `JOINED` participants in the returned order; represent roles `HOST`, `BROADCASTER`, `VIEWER`, and `STAGE_PARTICIPANT` without changing their meaning. Include active/selected Participants tab, close state, loading state, empty list state, and unavailable state that does not close the session. The close action restores the session layout. Any design-only participant menu remains visual unless an approved source defines behavior.

**Embedded Inline SVG Assets:** Use inline SVG rather than dataset file paths. Frozen close icon asset (`e25ce839dcd1699d4d076aa40da1b4c0194b4ef39477a11c21dec177c858607e.svg`, SHA-256 `sha256:e25ce839dcd1699d4d076aa40da1b4c0194b4ef39477a11c21dec177c858607e`):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 4.90237 4.90237 5.68342 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C4.90237 19.0976 5.29289 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071 19.0976 18.3166 19.0976 18.7071 18.7071L13.4142 12L18.7071 6.70711Z" fill="#C5C6D0"/></svg>
```

For the participant/overflow affordances, embed the exact native SVG exports identified by the asset map for `6007:58209` (`I6007:58209;6012:274385;6070:42861;6012:272921;6013:633703`, SHA-256 `sha256:5b418de6677b8b349871b2d190242c409f7a0434cc6d7703e7c4673995af02a5`; and the three-dot asset `sha256:56e7e7da38af1c6c6de2838b0a1aefe5dd774f9b7a0b01e8c2e353b747a02f8e`). Preserve their 24px sizing and fill colors. If the project has an equivalent existing icon component, use it only when its rendered geometry and colors match these exports.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the participants panel to the participant-list API and implement the successful flow.

Continue working on the joined-session participants panel. Use the existing API client/authenticated request approach and React state conventions. Implement a function such as `loadParticipants(sessionId, cursor?)` that sends `GET /api/v1/sessions/{sessionId}/participants`, with `pageSize=50` for the initial page and the returned `nextCursor` for subsequent pages. Read `items` and `nextCursor` from normalized response `data`.

When successful: open the panel, render the returned public participant representations and visible roles/states; retain the opaque cursor for pagination; append later pages without duplicate IDs; and preserve the joined-session layout until the user closes the panel. Do not mutate server state.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side loading and error handling.

Refine `loadParticipants` in the participants panel.

### Loading State

When the participants request is pending, show the frozen panel loading treatment, disable repeat/open actions that would create duplicate requests, and prevent duplicate page fetches for the same cursor.

### API Error

For 400, 401, 403, 404, 503, network failure, or malformed response, show the project-standard unavailable/error state inside the panel and keep the session open. Do not close the panel or fabricate participant data. The close control remains available.

### Client-Side Validation

Before calling the API, require a non-empty session ID and encode path/query values using the existing client conventions. Do not send a request for an invalid session ID. Backend authorization, page-size, cursor, membership, session-state and public-representation rules remain authoritative.

## Prompt E: Business Rules Compliance

### Business Rule: BR-VSP-01

- **Name:** Authenticated Membership
- **Representation:** OCL precondition
- **Expression / authoritative text:** `RequestContext::authenticated and RequestContext::sessionId = query.sessionId and query.requesterParticipantId = RequestContext::participantId and Participant.allInstances()->exists(p | p.id = query.requesterParticipantId and p.principalId = RequestContext::principalId and p.sessionId = query.sessionId and p.status = ParticipantStatus::JOINED)`
- **Context:** `CollaborationService::listParticipants(query: ParticipantListQuery, session: Session): ParticipantPage`
- **Enforcement layer:** backend
- **Failure behavior:** existing project authentication/authorization error mapping; source status/message remains authoritative.
- **Traceability:** API-PARTICIPANT-LIST; BF-1.2–BF-1.4

### Business Rule: BR-VSP-02

- **Name:** Page Input
- **Representation:** OCL precondition
- **Expression / authoritative text:** `query.sessionId = session.id and session.status <> SessionStatus::ENDED and query.pageSize > 0 and query.pageSize <= 50 and Paging::validCursor(session.id, query.cursor, 'participants')`
- **Context:** `CollaborationService::listParticipants(query: ParticipantListQuery, session: Session): ParticipantPage`
- **Enforcement layer:** backend and frontend request validation
- **Failure behavior:** HTTP 400 for invalid input; preserve existing error message.
- **Traceability:** API-PARTICIPANT-LIST query.cursor/query.pageSize; BF-1.2

### Business Rule: BR-VSP-03

- **Name:** Participant Page
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result = Paging::participants(session.id, query.pageSize, query.cursor) and result.items->size() <= query.pageSize and result.items->forAll(p | p.sessionId = session.id and p.status = ParticipantStatus::JOINED)`
- **Context:** `CollaborationService::listParticipants(query: ParticipantListQuery, session: Session): ParticipantPage`
- **Enforcement layer:** backend
- **Failure behavior:** return only the valid page or the existing service-unavailable/error state.
- **Traceability:** API-PARTICIPANT-LIST 200 data.items/data.nextCursor; POST-1

### Business Rule: BR-VSP-04

- **Name:** State Reader
- **Representation:** OCL precondition
- **Expression / authoritative text:** `RequestContext::authenticated and RequestContext::sessionId = session.id and participant.id = RequestContext::participantId and participant.principalId = RequestContext::principalId and participant.sessionId = session.id and (participant.status = ParticipantStatus::JOINED or session.status = SessionStatus::ENDED) and Paging::validCursor(session.id, reactionCursor, 'reactions')`
- **Context:** `SessionService::readState(session: Session, participant: Participant, reactionCursor: String): SessionState`
- **Enforcement layer:** backend
- **Failure behavior:** existing API-SESSION-STATE authentication/authorization/input error mapping.
- **Traceability:** API-SESSION-STATE; UC-08 joined-session precondition

### Business Rule: BR-VSP-05

- **Name:** State Snapshot
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.session = session and result.selfParticipant = participant and result.stream = if LiveStream.allInstances()->exists(s | s.sessionId = session.id) then LiveStream.allInstances()->any(s | s.sessionId = session.id) else null endif and result.recording = Paging::latestRecording(session.id) and result.share = if ContentShare.allInstances()->exists(s | s.sessionId = session.id and s.status = ShareStatus::ACTIVE) then ContentShare.allInstances()->any(s | s.sessionId = session.id and s.status = ShareStatus::ACTIVE) else null endif and result.media = MediaPreference.allInstances()->any(m | m.participantId = participant.id) and result.view = ViewPreference.allInstances()->any(v | v.participantId = participant.id)`
- **Context:** `SessionService::readState(session: Session, participant: Participant, reactionCursor: String): SessionState`
- **Enforcement layer:** backend
- **Failure behavior:** return the existing normalized session-state response/error.
- **Traceability:** API-SESSION-STATE 200 data.session/data.selfParticipant; UC-08 PRE-1

### Business Rule: BR-VSP-06

- **Name:** State Audience
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.stageRequests = StageRequest.allInstances()->select(r | r.sessionId = session.id and (participant.role = ParticipantRole::HOST or r.participantId = participant.id)) and result.reactions = Paging::reactions(session.id, reactionCursor) and result.reactions->size() <= 50 and result.nextReactionCursor = Paging::nextReactionCursor(session.id, reactionCursor)`
- **Context:** `SessionService::readState(session: Session, participant: Participant, reactionCursor: String): SessionState`
- **Enforcement layer:** backend
- **Failure behavior:** return the existing normalized session-state response/error.
- **Traceability:** API-SESSION-STATE 200 data.stageRequests/data.reactions/data.nextReactionCursor

### Business Rule: BR-VSP-07

- **Name:** Unique Roster Entries
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.items->isUnique(id)`
- **Context:** `CollaborationService::listParticipants(query: ParticipantListQuery, session: Session): ParticipantPage`
- **Enforcement layer:** backend and frontend append/deduplication
- **Failure behavior:** do not render duplicate participant IDs; preserve the existing service/error state if the response violates the contract.
- **Traceability:** API-PARTICIPANT-LIST; Prompt C pagination

## Prompt F: Implementation Context

Use this prompt with the existing project manifests/lockfiles, approved database contract at the configured migration head `InitialSchema1792195200000`, the frozen API contracts `API-PARTICIPANT-LIST` and `API-SESSION-STATE`, and existing source conventions. Implement the backend endpoint and frontend panel without schema changes, migrations, new dependencies, or invented mobile measurements. Prompt B is the authoritative embedded UI specification and inline SVG source. Preserve existing authentication, response normalization, error handling, ORM mappings, and styling architecture. Prioritize this prompt, then approved API/database/project contracts, then the embedded Figma evidence, then current conventions.
