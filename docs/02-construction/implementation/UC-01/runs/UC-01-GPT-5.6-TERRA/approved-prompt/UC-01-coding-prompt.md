---
artifact_type: coding-prompt
status: Approved
uc_id: UC-01
uc_name: Review Join Preview and Permissions
generated_at: 2026-11-03T17:56:00+07:00
---

# UC-01 Coding Prompt - Review Join Preview and Permissions

Both backend and frontend together must cover every specified Basic/Main, Alternative and Exception Flow and its terminal outcome; distribute these behaviors across Prompts A-D without changing the frozen functional scope.

## Prompt A: Backend API

### Objective: Build the API endpoint, logic, validation, and server-side error handling.

There is no backend API endpoint for UC-01. Preview preparation is client-local, and `participantKey` identifies local draft state rather than persisted session membership. Do not create an endpoint, controller, service, DTO, entity, database query, or persistence operation for this use case.

### Request Format

N/A. No request body, query parameter, or path parameter exists because the configured Related API IDs inventory is empty.

Implement no server-side main logic for UC-01.

### Logic

N/A. The PreviewService behavior is implemented as client-local preview state: retain `participantKey`; model camera and microphone permission as `UNKNOWN`, `GRANTED`, or `DENIED`; only enable a requested and available device after its permission is granted; keep both devices disabled for the VIEWER role; and derive readiness solely from a trimmed display name of 1 through 50 characters. Do not persist or mutate `principals`, `participants`, `media_preferences`, or `view_preferences`.

### Success Response

N/A. No HTTP response exists for UC-01.

### Error Handling

N/A. Browser permission denial is rendered by the client as specified in Prompt D; do not emit a server error response or make schema/DBML/migration changes.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the Figma design.

Create a `JoinPreview` React TypeScript component and render it from the existing `App` entry point, using React 18, Vite, TypeScript, and the existing Tailwind CSS setup.

The component MUST display:

- A dark pre-join screen with the product mark, `Get Started`, `Setup your audio and video before joining`, and the `You are the first to join` chip.
- A large rounded video-preview tile that shows local camera media when available and otherwise the centered purple participant avatar, plus a muted-microphone status indicator in the tile’s upper-right corner.
- Separate microphone and camera control buttons, each with its overflow/menu affordance; a background/effects button; and a settings button.
- A display-name field with the `Enter name` placeholder and the final Join Now / Go Live action styled in the design’s blue primary treatment; use the design’s corresponding text for the selected preview variant.
- The permission-denied dialog over the dimmed preview: `Allow to use your microphone and camera`, explanatory permission copy, and visibly actionable `Dismiss` and `Retry` buttons.

### Figma Design Scope

Frozen Figma dataset and target: dataset `100ms-2026-10-02-001`, manifest `sha256:ead5b6aa248f3c132950dc533b5b3392052cfdcfec6efc029c3fb01e6845c298`; approved resolved nodes below.

Record the exact names and node IDs of all identified target frames:

- `A/V Muted` — `6007:51246` (desktop; 1512 × 982)
- `Permission Denied Dialog` — `6007:51266` (desktop; 1512 × 982)
- `Permission` — `6007:51296` (desktop)
- `Menu` — `6007:51317` (desktop)
- `A/V Muted` — `6066:89729` (video-conferencing desktop)
- `Permission Denied Dialog` — `6066:89749` (video-conferencing desktop)
- `Permission` — `6066:89779` (video-conferencing desktop)

### Implementation Requirements

Match the design’s black page background; centered desktop composition; dark `#11131a`/`#191b23` surfaces; blue primary actions; purple fallback avatar; rounded 8px, 16px, 20px, 40px, and 80px treatments where shown; and Inter typography. Preserve the shown 34px semibold heading, 16px/24px body and button text, and 14px/20px semibold chip text. Make the preview and controls responsive for the approved desktop/video-conferencing variants without replacing the existing styling system or adding dependencies. Use accessible button labels for camera, microphone, effects/background, settings, overflow menus, Dismiss, Retry, and the final action.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the frontend component to the API and implement the successful flow.

Continue working on `JoinPreview`.

Add local React state for `participantKey`, `role`, `displayName`, requested camera and microphone, camera and microphone permission status, device availability, enabled states, the local `MediaStream`, and whether the permission-denied dialog is visible. No API client, HTTP request, or persisted state is used in this UC.

Implement the asynchronous function `preparePreview` to request browser media permissions using `navigator.mediaDevices.getUserMedia` for the currently requested camera and microphone state; there is no HTTP method or API path.

### Request Payload

N/A. The local preview command comprises `participantKey`, `role`, `displayName`, `requestCamera`, and `requestMicrophone`; do not serialize or send it to an API.

### Success Response

N/A. On a granted browser-media outcome, update local PreviewState rather than read normalized API response data.

When successful:

1. Attach the returned local stream to the preview video when camera media is enabled; otherwise render the muted/avatar fallback.
2. Set each device’s permission and availability from the requested media outcome and render the current camera/microphone controls.
3. Preserve `participantKey` only in local draft state; enable a device only if it was requested, is available, and has `GRANTED` permission; force both device-enabled values to false for role `VIEWER`.
4. Keep the participant on the pre-join preview screen. There is no navigation, refresh, membership creation, or database mutation in UC-01.

Stop media tracks during component cleanup and whenever a new request replaces a prior stream. The final action is ready only when `displayName.trim()` has length 1 through 50; internal whitespace is unchanged.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and API error handling.

Refine `preparePreview` in `JoinPreview`.

### Loading State

When local media permission is being requested:

- Disable the camera and microphone permission controls and the Retry button that initiated the request.
- Display a non-API local loading indicator while access is pending.
- Prevent concurrent or duplicate browser-media requests.

### API Error

There is no API response in UC-01. If browser media access is denied or unavailable, set the affected permission to `DENIED`, set its enabled state to false, and display the Figma permission-denied dialog: `Allow to use your microphone and camera` with the shown explanation. Display it centered over the dimmed video-preview tile; `Dismiss` closes it without changing persisted data, and `Retry` calls `preparePreview` again to request access.

### Client-Side Validation

Display display-name validation at the name field when its trimmed value is empty or exceeds 50 characters; keep the final Join Now / Go Live action unavailable until it is valid. Toggling the microphone or camera off must immediately render the corresponding muted state and must not enable a device without granted permission, hardware availability, and a true request. No backend validation or API call applies to this client-local UC.
