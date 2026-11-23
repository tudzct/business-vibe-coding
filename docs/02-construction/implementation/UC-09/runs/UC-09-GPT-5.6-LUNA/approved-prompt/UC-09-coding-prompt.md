---
artifact_type: business-coding-prompt
status: Approved
uc_id: UC-09
uc_name: "Send a Chat Message"
generated_at: 2026-11-23T15:12:15+07:00
---

# UC-09 Business Coding Prompt - Send a Chat Message

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create the `POST /api/v1/sessions/{sessionId}/chat/messages` endpoint in the existing NestJS session module/controller. The endpoint is protected by the existing bearer session access-token guard and requires authorization.

### Request Format

Required headers: `Authorization: Bearer <session-access-token>`, `Content-Type: application/json`, and opaque `Idempotency-Key`. Path parameter `sessionId` is a required UUID string. The JSON request body is a required string value named `body`; no query parameters.

Implement the main logic in a collaboration/chat service using the existing `DataSource` transaction and session-authentication conventions. Use the trusted request principal, participant and session context resolved from the authenticated token; do not accept sender identity from the client.

### Logic

Implement API-CHAT-MESSAGE-CREATE for UC-09. Trim the body, require a non-empty trimmed value of at most 1000 characters, require a non-empty idempotency key, verify authenticated joined membership for the requested session, and reject ended sessions. Persist `chat_messages` with a generated id, the authenticated participant as sender, the trimmed body, current timestamp and a session-scoped sequence equal to the pre-update session version plus one. Preserve atomicity and protect the sequence/version update against concurrent sends. Repeated compatible commands with the same principal, session, operation and idempotency key must return the stored response; conflicting payloads must be rejected. Use existing ORM/database mappings, `synchronize: false`, and no schema changes.

### Success Response

Return HTTP 201 with `{ "success": true, "message": "Chat message created", "data": { "message": { "id": string, "sessionId": string, "senderParticipantId": string, "body": string, "sentAt": ISO-8601 string, "sequence": integer } } }`. Preserve source-defined fields and normalized envelope conventions.

### Error Handling

Return the existing normalized error envelope for malformed JSON/body or invalid UUID (400), rejected authentication (401), non-member or otherwise unauthorized context (403), missing session (404), idempotency conflict or sequence conflict (409), invalid command/body/key or ended session where the project maps domain validation to 422, and temporary collaboration/database unavailability (503). Preserve the source status and message through `{ "success": false, "statusCode": status, "message": message, "timestamp": ISO-8601, "path": "/api/v1/sessions/{sessionId}/chat/messages" }`. Do not expose credentials or raw database errors.

## Prompt B: Frontend UI

### Objective: Build the desktop chat panel according to the frozen Figma design.

Create the React 18/TypeScript chat panel integrated into the existing session surface. It must display the Chat/Participants segmented tabs, close control, message history, pinned-message card when present, author/time/body rows, and a composer with text entry, emoji affordance and send affordance. UC-required controls are functional; Participants and design-only controls remain visual unless another frozen source defines their behavior.

**Target Frames & Design Provenance:** Figma dataset `100ms-2026-10-02-001`, file key `lCvn1rB7IdRchqAuEatJJp`, desktop-only. Frames: `Messages & Pinned` node `6007:58181`, native design SHA-256 `sha256: native-design hash recorded in the checksum-valid dataset`; `Empty` node `6007:58174`; `New Messages` node `6007:58188`. All three are complete native captures with no required download failures. The frames cover BF-1, AF-1 and EF-1. No dedicated failure/cancellation frame is asserted; use the captured controls and feedback style while preserving the UC-defined entered text.

**Layout & Dimensions:** Desktop viewport 1512x982. Top bar is 96px high with 24px padding. Main tiles begin at y=96px, use 24px horizontal padding and a 24px gap. Chat panel is 400px wide, 790px high, with 24px internal padding and 16px vertical gaps; panel radius 16px. Keep the layout desktop-only because the dataset explicitly excludes mobile design readiness.

**Design Tokens (Colors, Typography, Radii, Borders):** Background dim `#000000`; surface dim `#11131a`; surface default `#191b23`; surface bright/border bright `#272a31`; background default `#0b0e15`; on-surface high `#eff0fa`; on-surface medium `#c5c6d0`; on-surface low `#8f9099`; primary bright `#538dff`; avatar purple `#7e47eb`. Use Inter. Primary body text is 14px, 20px line-height, 0.25px tracking; author is 14px semibold, 20px line-height, 0.1px tracking; timestamp is 12px, 16px line-height, 0.4px tracking. Tabs use 14px semibold and 20px line-height. Controls use 8px radius; panel uses 16px; pinned/message rows use 8px; message tag uses 4px.

**Component & State Specifications:** Exact visible copy includes `Chat`, `Participants`, `LIVE`, `Close`, `Karen A`, `2:12 PM`, `What’s up`, `How’s it going?`, pinned-message text beginning `Can we discuss how the data is being provided to the clients on an "as is" and "where-is" basis...`, and the composer/send affordance. Empty state has no messages. New Messages state shows the latest message and scrolls to it without discarding existing history. Loading, API failure and invalid-body states must be accessible and must retain entered text. Close restores the session layout.

**Embedded Inline SVG Assets:** Use inline SVG or CSS equivalents for the captured cross/close, chevron, people, emoji, send, microphone, overflow and status icons. The primary frame asset hashes are `ae339c6b0d1f36538b7ee70299a1dfc4d6ba4f0be26afac17f7eaf9aef64d221`, `4b82ef417a10dad9457bb94d2ae16a235978559d6dd66eb4a154cce6a637cd24`, `dfd9f52a278db6a7b520b9187d933e3ef422c151a17463caece408d00a1fdc13`, `96dcb911fce7daf054e1c76dfeb367e6c082050ea008fb6b39fea982719f0cd7`, `d43e9e76c0d9a94b8b34fabd492916c3151e2041a3bf76bfd3d4fc7c48ec6df7`, `ef473905183c26ceee606d4eeff1640f2624e75c6d48d9786c83486910f14ec4`, and `098806f8496eb68968019e2a7f030e83eeb5dbe54e68c88fcc2666d45c196891`. Where an SVG path is not necessary for behavior, use semantic text/CSS geometry with the same size, stroke and color rather than external asset paths.

### Implementation Requirements

Implement the embedded UI specification, functional chat controls and states with the existing Tailwind/component conventions. Do not invent mobile behavior or undocumented copy.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the chat panel to the two chat APIs and implement the successful flow.

Continue working on the desktop chat panel. Add controlled composer state and request/loading/error state using the project’s existing React and Axios conventions. Implement `listChatMessages` for `GET /api/v1/sessions/{sessionId}/chat/messages` with bearer authorization, `Accept: application/json`, default `pageSize=50`, and optional URI-encoded opaque cursor. Implement `sendChatMessage` for `POST /api/v1/sessions/{sessionId}/chat/messages` with bearer authorization, JSON content type, a fresh opaque `Idempotency-Key`, and body equal to the entered string.

### Request Payload

Create: JSON string body; required idempotency header. List: no body; optional `cursor` and `pageSize`, default 50.

### Success Response

List returns normalized data `{ items: Message[], nextCursor: string }` from HTTP 200. Create returns normalized data `{ message: Message }` from HTTP 201. A Message contains `id`, `sessionId`, `senderParticipantId`, trimmed `body`, `sentAt`, and `sequence`.

When successful: (1) replace initial history with the returned page and retain `nextCursor`; (2) append the created message exactly once; (3) clear the composer only after creation succeeds; (4) keep the conversation scrolled to the newest visible message. Preserve idempotency and do not fabricate sender identity.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and error handling.

Refine the send function in the chat panel.

### Loading State

When either history loading or message sending is true, show the existing project loading treatment. Disable Send while sending, prevent duplicate submissions, and keep the entered text visible during the request.

### API Error

For any API failure, display the normalized message or the project fallback `Chat message could not be sent.` in the chat panel near the composer, and preserve the entered text. History failure displays a panel-level `Chat history could not be loaded.` notice without preventing a later retry. Close remains available.

### Client-Side Validation

Before sending, reject null-equivalent input, whitespace-only input, and trimmed input longer than 1000 characters. Display `Enter a message.` for empty input and `Message must be 1000 characters or fewer.` for overlong input beside the composer. Do not call the API when validation fails. Backend validation remains authoritative.

## Prompt E: Business Rules Compliance

### Business Rule: BR-SCM-01
- **Name:** Authenticated Membership
- **Representation:** OCL precondition
- **Expression / authoritative text:** `RequestContext::authenticated and RequestContext::sessionId = command.sessionId and command.senderParticipantId = RequestContext::participantId and Participant.allInstances()->exists(p | p.id = command.senderParticipantId and p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and p.status = ParticipantStatus::JOINED)`
- **Context:** `CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage`
- **Enforcement layer:** backend
- **Failure behavior:** HTTP 401 or 403 according to existing authentication/authorization mapping
- **Traceability:** UC-09 BF-1.4; API-CHAT-MESSAGE-CREATE authorization

### Business Rule: BR-SCM-02
- **Name:** Target Session
- **Representation:** OCL precondition
- **Expression / authoritative text:** `command.sessionId = session.id and session.status <> SessionStatus::ENDED`
- **Context:** `CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage`
- **Enforcement layer:** backend
- **Failure behavior:** HTTP 404 for unavailable session or HTTP 422 for ended session according to existing mapping
- **Traceability:** API-CHAT-MESSAGE-CREATE path.sessionId; UC-09 PRE-1

### Business Rule: BR-SCM-03
- **Name:** Command Key
- **Representation:** OCL precondition
- **Expression / authoritative text:** `command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0`
- **Context:** `CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage`
- **Enforcement layer:** backend and frontend
- **Failure behavior:** HTTP 422; client prevents a request without a command key
- **Traceability:** API-CHAT-MESSAGE-CREATE headers.Idempotency-Key

### Business Rule: BR-SCM-04
- **Name:** Message Body
- **Representation:** OCL precondition
- **Expression / authoritative text:** `command.body <> null and command.body.trim().size() > 0 and command.body.trim().size() <= 1000`
- **Context:** `CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage`
- **Enforcement layer:** backend and frontend
- **Failure behavior:** HTTP 422; client displays the source-backed validation message and preserves text
- **Traceability:** API-CHAT-MESSAGE-CREATE body; UC-09 EF-1

### Business Rule: BR-SCM-05
- **Name:** Created Identity
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.oclIsNew() and result.id <> null and result.sessionId = command.sessionId and result.senderParticipantId = command.senderParticipantId`
- **Context:** `CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage`
- **Enforcement layer:** backend and database
- **Failure behavior:** no success response unless the persisted message satisfies the identity fields
- **Traceability:** API-CHAT-MESSAGE-CREATE success data.message

### Business Rule: BR-SCM-06
- **Name:** Message Value
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.body = command.body.trim() and result.sentAt <> null and result.sequence = session.version@pre + 1`
- **Context:** `CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage`
- **Enforcement layer:** backend and database
- **Failure behavior:** transaction rolls back on sequence/persistence failure
- **Traceability:** schema `chat_messages`; UC-09 BF-1.5

### Business Rule: BR-SCM-07
- **Name:** Authenticated Membership
- **Representation:** OCL precondition
- **Expression / authoritative text:** `RequestContext::authenticated and RequestContext::sessionId = query.sessionId and query.requesterParticipantId = RequestContext::participantId and Participant.allInstances()->exists(p | p.id = query.requesterParticipantId and p.principalId = RequestContext::principalId and p.sessionId = query.sessionId and p.status = ParticipantStatus::JOINED)`
- **Context:** `CollaborationService::listMessages(query: MessageQuery, session: Session): MessagePage`
- **Enforcement layer:** backend
- **Failure behavior:** HTTP 401 or 403 according to existing mapping
- **Traceability:** UC-09 BF-1.2; API-CHAT-MESSAGE-LIST authorization

### Business Rule: BR-SCM-08
- **Name:** Message Page Input
- **Representation:** OCL precondition
- **Expression / authoritative text:** `query.sessionId = session.id and session.status <> SessionStatus::ENDED and query.pageSize > 0 and query.pageSize <= 50 and Paging::validCursor(session.id, query.cursor, 'messages')`
- **Context:** `CollaborationService::listMessages(query: MessageQuery, session: Session): MessagePage`
- **Enforcement layer:** backend and frontend
- **Failure behavior:** HTTP 422 for invalid page input/cursor; default page size is 50
- **Traceability:** API-CHAT-MESSAGE-LIST query.cursor/query.pageSize

### Business Rule: BR-SCM-09
- **Name:** Message History
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result = Paging::messages(session.id, query.pageSize, query.cursor) and result.items->forAll(m | m.sessionId = session.id)`
- **Context:** `CollaborationService::listMessages(query: MessageQuery, session: Session): MessagePage`
- **Enforcement layer:** backend and database
- **Failure behavior:** return only session-bound messages ordered by sequence ascending with a continuation token, including for an empty page
- **Traceability:** API-CHAT-MESSAGE-LIST success data.items/data.nextCursor

## Prompt F: Implementation Context

Use this prompt with the project rules, React/Nest manifests and lockfiles, the approved `chat_messages`, `sessions`, `participants`, `idempotency_records` and `idempotency_responses` schema, the two approved chat API contracts, the embedded desktop Figma specification and existing Axios/Nest conventions. Prioritize the UC/API/rules above, then the approved database contract, then the embedded design evidence and source conventions. Do not add dependencies, alter schema or implement mobile UI.
