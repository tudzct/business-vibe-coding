---
artifact_type: coding-prompt
status: Approved
uc_id: UC-03
uc_name: Start a Live Stream
source_use_case: docs/01-inception/use-cases/uc-03-start-a-live-stream.md
source_api_contracts: docs/01-inception/api-contracts/api-live-stream-control.md;docs/01-inception/api-contracts/api-session-state.md
generated_at: 2026-10-26T00:00:00+07:00
---

# UC-03 Coding Prompt - Start a Live Stream

Both backend and frontend together must cover BF-1 (start and refresh the live session), AF-1 (open the broadcaster menu), and EF-1 (retain the broadcaster interface with a technical-failure state), including their terminal outcomes, without changing the frozen scope.

## Prompt A: Backend API

### Objective: Build the API endpoint, logic, validation, and server-side error handling.

Create the `POST /api/v1/sessions/{sessionId}/live-stream/commands` endpoint in the existing `finalsource/be/src/modules/sessions/` module, registered through `SessionsModule` in `finalsource/be/src/app.module.ts`.

This endpoint MUST be protected with the Bearer session access token, accepting either its registered or guest form, and enforcing authorization.

### Request Format

Path parameter: `sessionId` is a required UUID string. Headers: `Authorization: Bearer <session-access-token>`, `Content-Type: application/json`, and a required opaque `Idempotency-Key`. Body: `{ "action": "START", "expectedVersion": <integer> }` for this use case; the command DTO may retain the API enum values `START` and `STOP` but must reject any other value.

Implement the command handler, controller, DTO validation, and service/repository coordination in the existing sessions module architecture. Dispatch the named stream-control operation only; do not combine preconditions from unrelated operations.

### Logic

Implement `API-LIVE-STREAM-CONTROL` for UC-03. Obtain the trusted principal, participant, and session context only from the authenticated token/context adapter. Confirm that the requested session exists, is a `LIVE_STREAM`, and that the caller is its joined broadcaster/host with authority to start it. Validate the request body and the required idempotency key before mutation.

Within one atomic transaction, lock the session and live-stream records, enforce the submitted `expectedVersion`, and update the exact mapped rows: `sessions` (`status`, `version`, `updated_at`) and `live_streams` (`status`, `version`, `started_at`). Start only an eligible `READY` stream and move it to the domain's starting result (`STARTING` until the provider-completion operation changes it to `LIVE`); do not fabricate provider completion. Store/replay the exact completed response through `idempotency_records` and `idempotency_responses`, using the unique `(principal_id, session_id, operation, idempotency_key)` key and payload hash. Keep session and stream version changes concurrency-safe.

Use only authorized DML and the configured schema: `live_streams.session_id` is unique and references `sessions.id`; the session/stream version columns are integers; timestamps use `datetime(3)`. Do not alter DBML, migrations, synchronization settings, or schema.

### Success Response

On HTTP 200, return the contract stream representation in `data.stream` and the session summary in `data.session`, wrapped as `{ "success": true, "message": "The stream command was completed.", "data": { "stream": <Stream>, "session": <SessionSummary> } }`. Keep all contract-defined representation fields and source-defined message semantics intact.

### Error Handling

Return the source-defined statuses: 400 for an undecodable/invalid wire request, 401 for rejected authentication, 403 for unauthorized access, 404 for an unavailable session or stream, 409 for expected-version/state/idempotency conflict, 422 for a rejected command, and 503 for an unavailable required service. Preserve each status and its applicable message through `{ "success": false, "statusCode": <status>, "message": <message>, "timestamp": <ISO-8601>, "path": "/api/v1/sessions/{sessionId}/live-stream/commands" }`. Roll back all mutation work on failure.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the Figma design.

Create the broadcaster live-preview surface as a React 18 + TypeScript component, integrated from `finalsource/fe/src/App.tsx` (which currently renders `PreJoinPreview`). Use the project styling conventions.

The component MUST display:

- A dark desktop broadcaster layout with the top bar, brand mark, `Record` control, and blue `Go Live` control.
- A large rounded-corner broadcaster video preview, participant name badge, and bottom media/action control bar.
- The visible overflow/menu affordances and the broadcaster session menu that exposes available broadcaster actions before starting.
- A distinct starting/live presentation derived from returned stream state, while retaining the viewer-facing session area.
- An inline technical-failure state that keeps the broadcaster interface and start control available for retry.

### Figma Design Scope

Frozen Figma dataset and target: dataset `100ms-2026-10-02-001`, manifest `sha256:ead5b6aa248f3c132950dc533b5b3392052cfdcfec6efc029c3fb01e6845c298`; resolved target node `6007:87452`.

The resolved, unambiguous target frame is:

- `Go Live` — node `6007:87452` (1512 × 982).

### Implementation Requirements

STRICTLY follow the frozen `Go Live` target: black page background; 24px desktop top-bar padding; dark near-black preview container with a rounded 16px treatment; the large centered preview image; top-right dark `Record` and bright-blue `Go Live` buttons; and a bottom control strip with grouped dark controls and the red leave/end action. Preserve responsive behavior through the existing styling approach without inventing additional product controls or screens. Use the captured assets only where they are mapped by the resolved node.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the frontend component to the API and implement the successful flow.

Continue working on the broadcaster live-preview component.

Add React state for the resolved session ID, current stream/session representation, `isStarting`, menu visibility, technical error text, and a per-command idempotency key. Derive `expectedVersion` from the current stream/session representation according to the existing application model.

Implement `startLiveStream` to send a `POST` request to `/api/v1/sessions/{sessionId}/live-stream/commands` through the existing API client/request approach. Include the existing session Bearer token, `Content-Type: application/json`, and a new `Idempotency-Key` for a new user attempt; preserve that key for any retry of the same attempt.

### Request Payload

`{ "action": "START", "expectedVersion": <current stream or session version> }`

### Success Response

Read `{ "stream": <Stream>, "session": <SessionSummary> }` from the normalized `data` field of the HTTP 200 response.

When successful:

1. Replace local stream and session state with the command response and display its `STARTING` result.
2. Request `GET /api/v1/sessions/{sessionId}/state` with the same Bearer token and `Accept: application/json` to retrieve the updated session representation.
3. Replace local state from the normalized response `data`, including `session`, nullable `stream`, `selfParticipant`, media/view preferences, stage requests, reactions, and `nextReactionCursor` as supplied.
4. Render the returned live session/playback outcome, including the provider-completed `LIVE` state when it is returned; do not assume it before the server reports it.

Handle AF-1 locally by toggling the broadcaster menu before the command; opening it must not call either endpoint. Preserve idempotency and use contract-compatible values without client-side time or number coercion that changes their meaning.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and API error handling.

Refine `startLiveStream` in the broadcaster live-preview component.

### Loading State

When `isStarting` is true:

- Disable the `Go Live` control and any duplicate command control.
- Display an accessible starting/loading indicator in the command area.
- Prevent duplicate submissions while leaving the broadcaster preview visible.

### API Error

For a failed command or state refresh (including 400, 401, 403, 404, 409, 422, and 503), show the normalized server message when present, otherwise a concise technical-failure message. Display it inline at the broadcaster command area; keep the preview and menu available. For 409, refresh the session state before enabling a deliberate new attempt; never silently issue another command. Do not falsely render the session as live after a failure.

### Client-Side Validation

Before calling the command endpoint, require a non-empty UUID session ID, an authenticated access token, an integer current expected version, and the fixed `START` action. Do not call the API if those checks fail; display the validation message next to the Go Live command area. Backend validation and authorization remain authoritative.
