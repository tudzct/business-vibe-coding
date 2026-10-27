---
artifact_type: coding-prompt
status: Approved
uc_id: UC-04
uc_name: Stop a Live Stream
source_use_case: docs/01-inception/use-cases/uc-04-stop-a-live-stream.md
source_api_contracts: docs/01-inception/api-contracts/api-live-stream-control.md;docs/01-inception/api-contracts/api-session-state.md
generated_at: 2026-10-26T18:12:22.456+07:00
---

# UC-04 Coding Prompt - Stop a Live Stream

Both backend and frontend together must cover every specified Basic/Main, Alternative and Exception Flow and its terminal outcome; distribute these behaviors across Prompts A-D without changing the frozen functional scope.

## Prompt A: Backend API

### Objective: Build the API endpoint, logic, validation, and server-side error handling.

Extend the existing `POST /api/v1/sessions/:sessionId/live-stream/commands` endpoint in `finalsource/be/src/modules/sessions/sessions.controller.ts` and its existing service command path in `finalsource/be/src/modules/sessions/sessions.service.ts`.

This endpoint MUST be protected by the existing `SessionAccessGuard` and bearer session-access-token authentication. Retain `@CurrentPrincipal()` as the trusted request context; never accept a principal or participant identity from the request body.

### Request Format

Path parameter: `sessionId` (required UUID). Headers: `Authorization: Bearer <session-access-token>`, `Content-Type: application/json`, and a non-empty `Idempotency-Key`. JSON body: `{ "action": "STOP", "expectedVersion": <integer> }`.

Implement the STOP branch in the existing `SessionsService.commandLiveStream` transactional command flow. Retain the existing `LiveStreamCommandDto`, shared success envelope, TypeORM `DataSource` transaction, and global exception-envelope behavior.

### Logic

Implement the backend flow for UC-04 using `API-LIVE-STREAM-CONTROL` and the state-refresh behavior supplied by `API-SESSION-STATE`.

- Verify the idempotency key and that the authenticated principal's trusted `sessionId` equals the path parameter before opening the mutation.
- In one `SERIALIZABLE` transaction, lock the session, active participant, live-stream row, and idempotency record as the current command flow does. Require a `LIVE_STREAM` session and an active participant with role `HOST`; reject other callers.
- Require the supplied `expectedVersion` to equal `live_streams.version`. For `STOP`, permit only `LIVE` or `STARTING`; otherwise return the defined command-rejection response.
- Atomically set `live_streams.status` to `ENDED`, increment `live_streams.version`, and set `live_streams.ended_at` with `UTC_TIMESTAMP(3)`. Increment the `sessions.version`; preserve its status unless an existing source-defined STOP rule changes it. Do not change schema, DBML, migrations, or synchronization.
- Persist and replay the same normalized 200 response through `idempotency_responses` and `idempotency_records`, keyed by principal, session, operation, idempotency key, and request payload hash. Reusing a key with a different STOP payload must conflict.
- Return the updated stream representation and session summary. The client may then GET `/api/v1/sessions/{sessionId}/state` to refresh the complete post-stream representation.

Use the checksum-pinned DBML precisely: update only the existing `sessions`, `live_streams`, `idempotency_records`, and `idempotency_responses` rows through existing TypeORM raw-query conventions. Respect `live_streams.session_id` uniqueness, `idempotency_records` unique command key, UTC `datetime(3)` timestamps, and the configured foreign keys.

### Success Response

HTTP 200 with `{ "success": true, "message": "The stream command was completed.", "data": { "stream": { "id": "…", "sessionId": "…", "status": "ENDED", "version": 0, "startedAt": null, "endedAt": "…" }, "session": { "id": "…", "kind": "LIVE_STREAM", "status": "…", "version": 0 } } }`.

Wrap the domain payload in `{ "success": true, "message": "The stream command was completed.", "data": { "stream": "…", "session": "…" } }` without changing source-defined fields or message semantics.

### Error Handling

Preserve the existing global error envelope `{ "success": false, "statusCode": <status>, "message": <message>, "timestamp": "<ISO-8601>", "path": "/api/v1/sessions/{sessionId}/live-stream/commands" }`.

- Return 400 for malformed UUID/body or missing idempotency key; 401 for rejected bearer authentication; 403 for an unauthorized session context or non-host caller; 404 for unavailable session/stream; 409 for version or idempotency conflicts; 422 when the stream/session cannot be stopped in its current state; and 503 for transaction/deadlock/temporary service failure.
- Do not leak tokens, principal identifiers, SQL, or stored response bodies in errors. Do not turn a failed mutation into a partial write; preserve the current session view when failure is returned.

Follow the existing NestJS architecture. Handle transaction, concurrency, idempotency, UTC time, and data-precision rules exactly as the existing command flow does.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the Figma design.

Extend `BroadcasterLivePreview` in `finalsource/fe/src/components/BroadcasterLivePreview.tsx` using React 18, TypeScript, and the existing Tailwind styling system.

The component MUST display:

- a visible End control when the host is actively live;
- the end-stream confirmation panel with the exact copy `Are you sure you want to end the stream? You can’t undo this action.`;
- equal-width `Cancel` and destructive `End` buttons;
- the retained live-session preview and controls behind the confirmation;
- the returned ended/post-stream state after success, without treating cancellation as a failure.

### Figma Design Scope

Frozen Figma dataset and target: `100ms-2026-10-02-001`, checksum-valid resolved node `6007:87446` (`End Dialog`) on page `6007:86770`.

Identified target frame:

- `End Dialog` — node `6007:87446`.

STRICTLY follow this frozen Figma target: a dark desktop stream workspace; the confirmation panel positioned at the upper right of the content area; `#11131a` panel surface; 16px rounded corners and padding; 16px gap; body text in 14px Inter regular / 20px line-height; and two 48px-tall, 8px-radius, equal-width actions. The secondary Cancel action uses the `#444954` border and high-contrast text; the End action uses destructive `#c74e5b` with `#ffedec` text. Preserve accessible focus treatment and responsive reflow while retaining the visual hierarchy.

Use existing component conventions; do not add a new styling framework or dependencies.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the frontend component to the API and implement the successful flow.

Continue working on `BroadcasterLivePreview` and extend `finalsource/fe/src/api/session.ts` using the existing Axios `apiClient`, `SessionApiError`, and normalized envelope types.

Add state for confirmation visibility, stop-in-progress state, and a STOP command idempotency key. Reuse the loaded `SessionStateData` and its `stream.version` as the expected version.

Implement `stopLiveStream` to send a `POST` request to `/api/v1/sessions/{sessionId}/live-stream/commands`.

### Request Payload

`{ "action": "STOP", "expectedVersion": <current integer stream version> }`, with the existing bearer token and `Idempotency-Key` headers.

Use the project’s existing API client and request approach. Opening the visible End control opens the confirmation; Cancel closes it and restores the live session unchanged. Confirm End invokes `stopLiveStream` only once per active submission.

### Success Response

`{ "success": true, "message": "The stream command was completed.", "data": { "stream": { "status": "ENDED", "version": 0 }, "session": { "id": "…", "status": "…", "version": 0 } } }`.

Read the domain payload from `response.data`. On success:

1. Update local stream and session state from the command response.
2. Refresh with `getSessionState(sessionId, accessToken)` and replace the displayed state with the returned session representation.
3. Close the confirmation and clear the idempotency key only after a successful command/refresh path.
4. Display the ended/post-stream state and remove or disable the End action when stream status is `ENDED`.

Keep the idempotency key stable for a retry of the same in-flight command. Encode the session ID through the existing API helper and preserve existing request normalization.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and API error handling.

Refine `stopLiveStream` and its confirm handler in `BroadcasterLivePreview`.

### Loading State

When `isStopping` is true:

- Disable the confirm End button and the End trigger.
- Display `Ending…` in the confirm button or an equivalent accessible loading indicator.
- Prevent duplicate submissions and keep the confirmation visible until a terminal result is known.

### API Error

If the API returns 400, 401, 403, 404, 409, 422, or 503, display the server-provided safe message in the existing `role="alert"` error area beneath the session controls. Preserve the confirmation and current live-session view on failure; on a version conflict, refresh session state if feasible but retain the original safe error if the refresh fails.

### Client-Side Validation

Before calling the API, require a valid UUID session ID, a non-empty access token, and an integer current stream version. Allow confirmation only for a stream in `LIVE` or `STARTING` status. Display validation messages in the existing live alert area. Backend validation remains authoritative. Do not call the API when client-side validation fails.
