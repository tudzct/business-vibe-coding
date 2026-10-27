---
artifact_type: coding-prompt
status: Approved
uc_id: UC-05
uc_name: Watch a Live Stream
source_use_case: docs/01-inception/use-cases/uc-05-watch-a-live-stream.md
source_api_contracts: docs/01-inception/api-contracts/api-live-stream-view.md;docs/01-inception/api-contracts/api-session-state.md
generated_at: 2026-10-27T10:51:00+07:00
---

# UC-05 Coding Prompt - Watch a Live Stream

Implement the viewer-facing live-stream experience without altering frozen specifications, the database schema, DBML, or migrations. The viewer opens a supplied live-session destination, the client reads the current session representation, and renders the returned session and stream snapshot. Read operations must not write domain data.

## Prompt A: Backend API

### Objective: Build the API endpoint, logic, validation, and server-side error handling.

Create `GET /api/v1/sessions/:sessionId/live-stream/view` in `finalsource/be/src/modules/sessions/sessions.controller.ts`, using the existing `SessionAccessGuard`, `CurrentPrincipal` decorator, `ParseUUIDPipe`, `SessionsService`, global `ValidationPipe`, and HTTP exception filter.

This endpoint is protected by the registered or guest Bearer session-access token. Require `Accept: application/json`; derive the trusted principal, session, and participant from the guard rather than client-provided identity values. No request body or query parameters are allowed; `sessionId` is the required UUID path parameter.

Implement `viewLiveStream(sessionId, principal)` in `finalsource/be/src/modules/sessions/sessions.service.ts`. Verify that `principal.sessionId` equals the path value, find the session and the caller's joined participant, and query the matching `live_streams` row by `session_id`. Authorize only participants with `VIEWER` or `STAGE_PARTICIPANT` roles. Do not create, update, or delete records.

Map the response exactly from `sessions.id`, `participants.id` and `role`, `live_streams.status`, `live_streams.version`, and `sessions.version` to `sessionId`, `participantId`, `viewerRole`, `streamStatus`, `streamVersion`, and `sessionVersion`. The session must be `LIVE_STREAM`; use the existing raw-query and error-mapping conventions. Use the exact schema tables and columns: `sessions`, `participants`, and `live_streams`; never change schema/DBML/migrations or enable synchronization.

### Success Response

Return HTTP 200 with:

```json
{
  "success": true,
  "message": "Live stream view loaded",
  "data": {
    "sessionId": "uuid",
    "participantId": "uuid",
    "viewerRole": "VIEWER | STAGE_PARTICIPANT",
    "streamStatus": "READY | STARTING | LIVE | ENDED",
    "streamVersion": 1,
    "sessionVersion": 1
  }
}
```

Keep the API contract's declared domain fields unchanged. Continue exposing the existing `GET /api/v1/sessions/:sessionId/state` operation for the complete initial UI snapshot: `session`, `selfParticipant`, nullable `stream`, nullable `recording`, nullable `share`, `media`, `view`, `stageRequests`, `reactions`, and `nextReactionCursor`; accept only its optional JSON-string `reactionCursor`.

### Error Handling

Use the existing normalized error envelope:

```json
{ "success": false, "statusCode": 403, "message": "The requested session is not authorized", "timestamp": "ISO-8601", "path": "/api/v1/sessions/:sessionId/live-stream/view" }
```

Return the contract outcomes: 400 for an invalid UUID, unsupported/malformed request, or invalid accept handling; 401 for rejected authentication; 403 for an access context outside the session or unauthorized role; 404 when the session, joined participant, or live-stream representation is unavailable; and 503 for a temporary required-service/database failure. Preserve the source status and message through the existing exception filter. Do not add idempotency, transactions, writes, or version mutation to either GET operation.

## Prompt B: Frontend UI

### Objective: Build the viewer interface according to the frozen Figma design.

Create `LiveStreamViewer` in `finalsource/fe/src/components/LiveStreamViewer.tsx` using React 18, TypeScript, Tailwind CSS, the existing axios API client, and the application's current component conventions. Route the viewer from `finalsource/fe/src/App.tsx` when `?view=viewer` or `/viewer` is selected, preserving the existing pre-join and broadcaster routes.

The component must display:

- A black full-viewport live-session experience with a 24px desktop top bar, blue generic logo, and a right-aligned bordered `LIVE` / elapsed-time control.
- A responsive central media-player surface, stream backdrop/media adapter slot, on-media participant label, and an accessible visible unavailable/loading treatment when no representation is available.
- A bottom desktop control bar: centered action controls, right-side participant count/chat/more controls, and a session-menu trigger that reveals the viewer actions represented by the design.
- A gradient video-control bar with pause/play control, volume icon and slider, LIVE indicator, quality control labelled `Auto • 720p`, and fullscreen control.

### Figma Design Scope

Frozen Figma dataset and target: `100ms-2026-10-02-001`, checksum-valid resolved frame `Playing` (`6007:87420`) in `resource/figma-design-dataset/100ms-2026-10-02-001/nodes/6007-87420`.

Use this exact resolved target frame as the approved implementation target:

- `Playing` — `6007:87420`

Match its black/dim background; 24px desktop padding; 8px control radii; Inter-style 16px/24px and 12px/16px typography; `#538dff` primary blue; high-emphasis `#eff0fa`; medium-emphasis `#c5c6d0`; bright border `#272a31`; secondary `#444954`; and error/end control `#c74e5b`. On desktop, preserve the top bar, centered video player, lower action bar, and overlay video controls. At narrow widths, retain every actionable control with wrapping/stacking and no clipped essential content.

Use semantic buttons, readable labels, keyboard focus rings, `aria-expanded` for the session menu, `role="menu"`/`role="menuitem"` for its visible actions, and `role="status"` for stream/load status. Controls that are not specified as server mutations must remain local presentation controls; do not invent API endpoints or persistence.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the viewer component to the read APIs and implement the successful flow.

Continue working on `LiveStreamViewer`. Read `sessionId` from the supplied props or the `sessionId` query parameter/session storage using the same precedence already used by `BroadcasterLivePreview`; read the session access token from props or `sessionStorage`. Add a `getLiveStreamView(sessionId, accessToken)` function to `finalsource/fe/src/api/session.ts`, typed for the exact live-stream-view response, using `apiClient.get` and the Bearer header.

On mount, validate the UUID and access token, then load both the viewer representation with `GET /api/v1/sessions/:sessionId/live-stream/view` and the existing session snapshot with `GET /api/v1/sessions/:sessionId/state`. Abort or ignore stale requests on unmount. Read the domain payload from the normalized `data` field; never treat the envelope as the domain model.

Use React `useState` and `useEffect` for `viewerView`, `sessionState`, `isLoading`, `errorMessage`, and `isMenuOpen`. On success:

1. Store the viewer view fields (`sessionId`, `participantId`, `viewerRole`, `streamStatus`, `streamVersion`, and `sessionVersion`).
2. Store the current session snapshot and use it for participant count, media/view preference context, and the displayed stream state.
3. Render the live experience for `READY`, `STARTING`, `LIVE`, or `ENDED` without mutating stream/session versions.
4. Open and close the local viewer session menu from its trigger; render only the viewer actions supplied by the design and do not navigate or mutate session state unless a separate frozen use case/API authorizes it.

Send no body, idempotency key, or mutation from this read-only viewer flow. URL-encode `sessionId` in the request path. Preserve nullable `stream`, `recording`, and `share` values from the session-state API; do not assume a media adapter URL or fields not declared by the contracts.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and API error handling.

Before either API call, require a UUID-form `sessionId` and a non-empty access token. If either is absent or malformed, do not call the API; show a viewer-facing unavailable state and a precise, non-sensitive message in the media/player region.

While `isLoading` is true:

- Disable the session-menu trigger and media controls that require a loaded representation.
- Display an accessible `Loading live session…` status in the player region.
- Prevent duplicate fetches caused by repeated controls or stale effects.

When either read API returns 400, 401, 403, 404, or 503, preserve the server's normalized message when safe and display it in the player-region unavailable state with `role="alert"`. Otherwise show `The live session could not be loaded. Please try again.` Do not expose tokens, raw HTTP diagnostics, or database details.

If the live-stream view is unavailable, render the specified visible loading/unavailable state instead of a fabricated stream. If the state API returns a null stream, retain the successful viewer representation and show an appropriate non-interactive unavailable/stream-status treatment. Menu and media controls must remain keyboard accessible, must not submit or mutate anything, and must not issue requests when client-side validation fails.
