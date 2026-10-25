---
artifact_type: coding-prompt
status: Approved
uc_id: UC-02
uc_name: Join a Session
source_use_case: docs/01-inception/use-cases/uc-02-join-a-session.md
source_api_contracts: docs/01-inception/api-contracts/api-session-join.md;docs/01-inception/api-contracts/api-session-state.md
generated_at: 2026-10-25T20:38:19.319+07:00
---

# UC-02 Coding Prompt - Join a Session

Implement UC-02 without expanding the frozen scope. Together, Prompts A-D must cover the normal join flow, changed preview selections, and the recovery result when a session cannot be joined. Do not modify frozen specifications, DBML, migrations, or schema synchronization.

## Prompt A: Backend API

### Objective: Build the protected join command and session-state read APIs, their DTOs, transaction logic, and server-side error handling.

Create a protected `POST /api/v1/sessions/{sessionId}/participants` endpoint and a protected `GET /api/v1/sessions/{sessionId}/state` endpoint. Register their controller and provider module from `finalsource/be/src/app.module.ts`; use the established NestJS project architecture. Authenticate both endpoints with the Bearer session access token (registered or guest form) and derive trusted principal and session context from it rather than accepting those identities from the body.

### Request Format

For `POST /api/v1/sessions/{sessionId}/participants`, require the UUID `sessionId` path parameter, headers `Authorization: Bearer <session-access-token>`, `Content-Type: application/json`, and `Idempotency-Key`. The JSON body is:

```json
{
  "displayName": "string",
  "microphoneEnabled": true,
  "cameraEnabled": true,
  "microphoneDeviceId": "string | null",
  "cameraDeviceId": "string | null",
  "speakerDeviceId": "string | null",
  "virtualBackgroundId": "string | null"
}
```

`displayName`, `microphoneEnabled`, and `cameraEnabled` are required. Optional device IDs and `virtualBackgroundId` are null or strings. For `GET /api/v1/sessions/{sessionId}/state`, require Bearer authorization and `Accept: application/json`; optionally accept the URI-encoded opaque `reactionCursor` query parameter.

### Logic

Implement the join command through the existing mutation-gateway pattern and `SessionJoinService`. Dispatch only this named operation; do not combine preconditions from another operation. In one SERIALIZABLE, atomic transaction, lock the requested session, validate authentication and authorization, validate the request wire shape, and enforce session joinability. Persist the joined participant and its selected media preferences using the exact existing schema: `participants`, `media_preferences`, and, when needed by the returned state, `view_preferences`. Store `display_name` within its `varchar(50)` constraint; set `session_id`, trusted `principal_id` and `user_id`, `status` `JOINED`, selected microphone/camera booleans, and the database timestamp/version fields according to existing conventions.

Respect the unique active-participant constraint on `(session_id, active_principal_id)`. Treat the idempotency key as an opaque command token: use `idempotency_records` keyed by `(principal_id, session_id, operation, idempotency_key)`, compare its `payload_hash`, return the recorded `idempotency_responses` result for a completed matching command, and never execute the mutation twice. Persist the completed response reference and timestamps transactionally. Do not change the database structure.

Return HTTP 201 for a successful join with a domain payload containing exactly the contract-required `participant`, `session`, nullable `stream`, `media`, and `view` representations, normalized as `{ "success": true, "message": "<existing project success message>", "data": { ... } }`. Preserve all contract fields; do not invent undocumented domain fields or message semantics.

For the state read, return HTTP 200 with `session`, `selfParticipant`, nullable `stream`, nullable `recording`, nullable `share`, `media`, `view`, `stageRequests`, `reactions`, and `nextReactionCursor`, normalized in the same successful envelope. This read operation performs no domain writes.

### Error Handling

Preserve source status and server message in `{ "success": false, "statusCode": <status>, "message": "<message>", "timestamp": "<ISO-8601>", "path": "<request path>" }`. Return the contract outcomes: 400 for undecodable or invalid wire input, 401 for rejected authentication, 403 for unauthorized access, 404 for unavailable session/resource, 409 for a current-state or idempotency conflict, 422 for a rejected join command, and 503 for a required temporary service failure. The state read supports 400, 401, 403, 404, and 503. Ensure rollback on a rejected mutation and never expose sensitive token or device data in errors or logs.

## Prompt B: Frontend UI

### Objective: Build the React/TypeScript pre-join UI that matches the approved Figma target.

Continue from `finalsource/fe/src/App.tsx`, which renders `PreJoinPreview`; place the UI in that component (or its focused children) using the existing project styling and component conventions. Do not add Tailwind solely because the reference capture contains Tailwind classes.

The component must display:

- the pre-join brand mark, “Get Started” heading, and “Setup your audio and video before joining” subtitle;
- the “You are the first to join” status chip;
- a rounded dark preview/video tile with avatar or available preview image;
- microphone, camera, settings/background, and more controls;
- a display-name input and a primary “Join Now” button;
- space for inline validation, server recovery, and loading feedback without disrupting the preview context.

### Figma Design Scope

Frozen Figma dataset: `100ms-2026-10-02-001`, manifest `sha256:ead5b6aa248f3c132950dc533b5b3392052cfdcfec6efc029c3fb01e6845c298`.

Resolved target frame:

- `Details Filled` — node `6066:89824`.

Match this 1512×982 dark desktop frame: black/dim page background; centered pre-join column; 34px semibold Inter heading, 16px regular supporting text, 40px dark status chip, 16px rounded video tile, 48px name input and blue primary join button. Maintain the reference’s 24px/40px grouping, 16px control spacing, 8px corners for controls, high-contrast text, and responsive behavior appropriate for the existing application. The visible filled-name reference is “Karen A”; bind the displayed value to actual state rather than hard-coding it. Use the Figma-captured visual assets only through the project’s existing asset conventions.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect `PreJoinPreview` to the join command and use the returned joined state.

Manage display name, microphone/camera toggles, selected device IDs, virtual background ID, request state, and recovery state with the project’s existing React state/request approach. Preview controls must update this local selection state before joining so the submitted body reflects the latest choices.

Implement `joinSession` to send `POST /api/v1/sessions/{sessionId}/participants` through the existing API client/request approach, with the Bearer token, JSON content type, and a stable unique `Idempotency-Key` for one user command. Send:

```json
{
  "displayName": "<current input>",
  "microphoneEnabled": "<current boolean>",
  "cameraEnabled": "<current boolean>",
  "microphoneDeviceId": "<current string or null>",
  "cameraDeviceId": "<current string or null>",
  "speakerDeviceId": "<current string or null>",
  "virtualBackgroundId": "<current string or null>"
}
```

Read the normalized `data` payload from the HTTP 201 response. On success, retain the returned participant identity and media state, render the active joined-session view and participant tile, and use the returned session/media/view/stream data as the client state. If current-session hydration is required by the existing flow, call `GET /api/v1/sessions/{sessionId}/state` with Bearer authorization and map its normalized response fields without changing their names or semantics. Do not issue a retry that duplicates a command; reuse the idempotency key only for the same pending/retry command.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading behavior, and recovery presentation for `joinSession`.

Before the request, require a non-empty display name that can be stored in the API’s `participants.display_name varchar(50)` field, require boolean microphone and camera values, and permit optional device/background IDs only as strings or null. Validate that a session ID and authenticated access context are available. Place validation text immediately at the name/control area; do not call the API until client validation succeeds. Backend validation remains authoritative.

While `joinSession` is pending, disable the “Join Now” button and relevant submission controls, show an accessible loading label/spinner on the button, and prevent duplicate submissions. Keep the selected preview, entered name, and media choices visible.

For any normalized API error, display the returned server message in a visible recovery area within the pre-join interface and preserve preview context, satisfying EF-1. Handle 400, 401, 403, 404, 409, 422, and 503 distinctly only where the existing client has a defined recovery action; otherwise preserve and display the server message without inventing user-facing semantics. On a join rejection or service failure, do not transition to the active session, re-enable the join action when appropriate, and retain the user’s current identity and media selections. Never render authorization tokens or sensitive payloads.
