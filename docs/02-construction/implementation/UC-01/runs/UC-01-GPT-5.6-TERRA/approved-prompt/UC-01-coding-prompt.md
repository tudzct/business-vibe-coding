---
artifact_type: business-coding-prompt
status: Approved
uc_id: UC-01
uc_name: "Review Join Preview and Permissions"
generated_at: 2026-11-19T10:05:03.120+07:00
---

# UC-01 Business Coding Prompt - Review Join Preview and Permissions

## Prompt A: Backend API

### Objective: Keep preview preparation entirely client-local; do not add a backend endpoint.

UC-01 declares no related API contracts. Do not create a controller, DTO, service endpoint, persistence operation, request, response envelope, or database mutation for preview preparation. `participantKey` identifies only local draft state and must not be treated as a persisted session membership identifier.

The existing NestJS/MySQL schema is not used by this flow. In particular, do not create or update `participants`, `media_preferences`, or `view_preferences`. Preserve the existing backend architecture and database configuration unchanged.

## Prompt B: Frontend UI

### Objective: Build the desktop pre-join preview interface according to the frozen Figma evidence.

Create a `PreJoinPreview` React TypeScript component and render it from the current application entry point. Use the existing React 18, Vite, TypeScript, Tailwind CSS, and project CSS conventions; do not add dependencies.

The component MUST display:

- the pre-join title, subtitle, first-participant chip, preview tile, camera and microphone controls, device-menu affordances, name field, and role-appropriate join action;
- muted-preview states for camera and microphone;
- permission-request and permission-denied dialog states, with visible `Dismiss` and `Retry` recovery controls;
- a microphone device menu with the captured choices.

**Target Frames & Design Provenance:** Desktop-only. Use all of these frozen frames at their natural 1512 × 982 viewport: `A/V Muted` 6007:51246, SHA-256 `sha256:662b718f7b8238603736c786b4dcb61991ce022cac683d23e7752de7f6e72724`; `Permission Denied Dialog` 6007:51266, SHA-256 `sha256:93fd60e39710b8109388334b15e0900becd70e018bbf8281871a6d5a465cdc17`; `Permission` 6007:51296, SHA-256 `sha256:ff282e4a6655ab351a462ea7a32d8f6319c880ee22b092b9b02632a343a49bea`; `Menu` 6007:51317, SHA-256 `sha256:aa1b52aade48f81d7d08736e5843b48c6a6ba95e682524801c101a3aa4346137`; `A/V Muted` 6066:89729, SHA-256 `sha256:b73268ee717798443fb29b3c1a9f3c139f5ae854e22df935d0f2b96b1efc1843`; `Permission Denied Dialog` 6066:89749, SHA-256 `sha256:086798417ae1119944c0d5fe81b77f46c49ea63ff70144035cab1c45e28046f7`; and `Permission` 6066:89779, SHA-256 `sha256:b147ff8c6b85f27562d91c301a5b585427999e2763b4990f40e27ae8ea67111d`. The frozen coverage authorizes desktop only; do not infer a mobile implementation from the UC’s mobile reference.

**Layout & Dimensions:** Use the dark full-viewport composition. Center the pre-join column; use a 480 px-wide preview/control area, a 337.5 px-high rounded 16 px video tile, 24 px section gaps, 16 px control/input gaps, 8 px internal gaps, 8 px control radii, 40 px chip radius, and 48 px-high name input and primary action. Keep the preview tile muted fallback visually centered and its microphone status affordance at the top-right.

**Design Tokens (Colors, Typography, Radii, Borders):** Use Inter. Title: 34 px/40 px, semibold 600, 0.25 px tracking, `#eff0fa`; body and input: 16 px/24 px, regular 400, 0.5 px tracking, `#c5c6d0` or muted `#8f9099`; button: 16 px/24 px, semibold 600; chip: 14 px/20 px, semibold 600. Use page `#000000`, dim tile `#11131a`, surface `#191b23`, brighter control surface `#2e3038`, secondary dim `#293042`, default border `#1d1f27`, bright border `#272a31`, primary bright `#538dff`, disabled primary `#004299`, and disabled foreground `#84aaff`. Use a circular purple `#7e47eb` avatar fallback, 80 px radius, with an 88 px avatar container.

**Component & State Specifications:** Display exact captured copy: `Get Started`; `Setup your audio and video before joining`; `You are the first to join`; `Enter name`; `Go Live` for the broadcaster design and `Join Now` for the video-conference design; `Allow to use your microphone and camera`; `Access to Microphone and Camera is required. Enable permissions for Microphone and Camera by clicking “Allow” on the pop-up.`; `Dismiss`; `Retry`; `Default - MacBook Pro Microphone (Built-in)`; `MacBook Pro Microphone (Built-in)`; and `Bose Microphone`. The empty-name action is visually disabled. The populated preview shows `Karen A` with `KA` only as captured design fallback content, not a hard-coded participant identity. Muted control states must be visible. Device menu and permission dialogs are conditional overlays/states; denied permission keeps the recovery action visible.

**Embedded Inline SVG Assets:** Use CSS/HTML equivalents rather than external Figma asset paths: semantic button controls with CSS-drawn camera, microphone, chevron, and overflow indicators; a text/avatar fallback for a no-video tile; CSS borders and circles for all separators and surfaces. Do not reference, download, or copy a design-dataset asset at implementation time.

### Implementation Requirements

Implement only controls backed by this UC: camera/microphone enablement, permission request/retry/dismiss, microphone device selection, name entry, and readiness display. Keep design-only controls visual unless this prompt gives them behavior. Use accessible buttons, labels, focus handling, and a dialog with a suitable accessible name.

## Prompt C: Frontend Logic and Local Browser Integration

### Objective: Connect the pre-join UI to browser media permissions and local state.

Continue working on `PreJoinPreview`. Use React local state and browser media APIs; no API client request is permitted.

Maintain local draft state equivalent to `PreviewCommand` and `PreviewState`: `participantKey`, `role`, `displayName`, requested camera and microphone flags, each permission outcome (`UNKNOWN`, `GRANTED`, or `DENIED`), hardware availability, camera and microphone enabled flags, selected microphone device, and readiness to join.

Implement `preparePreview` to request only the media selected by the prospective participant via the browser media-permission flow, receive its outcome, and render the preview/control state. Map unavailable hardware and browser denial to the appropriate local unavailable or denied state. Stop and release preview tracks when they are replaced, dismissed, or the component unmounts. Do not persist or transmit local draft state.

### Local Command State

`participantKey`, `role`, `displayName`, `requestCamera`, and `requestMicrophone` remain local. The currently selected device controls the corresponding request. Browser permission/hardware results determine `cameraPermission`, `microphonePermission`, `cameraAvailable`, `microphoneAvailable`, `cameraEnabled`, `microphoneEnabled`, and `isReadyToJoin`.

### Successful Local Outcome

On a successful browser permission outcome:

1. Render the available camera preview when camera permission, availability, and request are all true.
2. Render the current camera and microphone control states, including muted states.
3. Retain the local participant key and selected device state without persistence.
4. Recompute join readiness from the trimmed display name.

## Prompt D: Validation and Error Handling

### Objective: Complete local validation, permission recovery, and loading feedback.

Refine `preparePreview` in `PreJoinPreview`.

### Loading State

While a browser media request is pending:

- disable the affected permission/control action and the retry action;
- display an in-context loading treatment without replacing the captured pre-join composition;
- prevent duplicate media requests.

### Local Error

If the browser denies requested camera or microphone access, show the captured permission-denied dialog and exact visible recovery copy. `Retry` requests the selected permissions again; `Dismiss` closes the dialog while preserving the local draft and rendering disabled/muted media state. If no device is available, render the corresponding disabled/muted preview state; do not claim that permission was granted.

### Client-Side Validation

Before enabling the join action, trim the display name and require one through 50 characters. Do not enable camera unless camera permission is `GRANTED`, camera hardware is available, and camera was requested. Do not enable microphone unless microphone permission is `GRANTED`, microphone hardware is available, and microphone was requested. For role `VIEWER`, keep both camera and microphone disabled. Preserve `participantKey` exactly. Do not execute a join API call in this UC.

## Prompt E: Business Rules Compliance

### Objective: Implement the complete frozen Business Rule set for this use case without changing its meaning.

### Business Rule: BR-RJPP-01

- **Name:** Permission And Hardware
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `context PreviewService::prepare(command: PreviewCommand): PreviewState\npost BR_RJPP_01_PermissionAndHardware:\n  (result.cameraEnabled implies result.cameraPermission = PermissionStatus::GRANTED and result.cameraAvailable and command.requestCamera) and\n  (result.microphoneEnabled implies result.microphonePermission = PermissionStatus::GRANTED and result.microphoneAvailable and command.requestMicrophone)`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Render disabled or muted local media state; the permission-denied dialog is shown when access is denied.
- **Traceability:** UC BF-1.3 through BF-1.5; Prompt C local media state.

### Business Rule: BR-RJPP-02

- **Name:** Viewer Preview Muted
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `context PreviewService::prepare(command: PreviewCommand): PreviewState\npost BR_RJPP_02_ViewerPreviewMuted:\n  command.role = ParticipantRole::VIEWER implies not result.cameraEnabled and not result.microphoneEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Viewer camera and microphone remain disabled and the UI renders muted states.
- **Traceability:** UC actor/role model; Prompt D client-side validation.

### Business Rule: BR-RJPP-03

- **Name:** Name Readiness
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `context PreviewService::prepare(command: PreviewCommand): PreviewState\npost BR_RJPP_03_NameReadiness:\n  result.isReadyToJoin = (command.displayName <> null and command.displayName.trim().size() > 0 and command.displayName.trim().size() <= 50)`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Keep the primary action disabled until the trimmed name has one through 50 characters.
- **Traceability:** UC BF-1.2 and BF-1.5; captured empty-name disabled action; Prompt D validation.

### Business Rule: BR-RJPP-04

- **Name:** Preview Key
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `context PreviewService::prepare(command: PreviewCommand): PreviewState\npost BR_RJPP_04_PreviewKey:\n  result.participantKey = command.participantKey`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Preserve the supplied local participant key exactly; no persisted membership is created.
- **Traceability:** UC Notes; Prompt A and Prompt C local-state boundary.

### Business Rule: BR-RJPP-05

- **Name:** Camera Denied State
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `context PreviewService::prepare(command: PreviewCommand): PreviewState\npost BR_RJPP_05_CameraDeniedState:\n  result.cameraPermission <> PermissionStatus::GRANTED implies not result.cameraEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Camera remains disabled; show the permission-denied recovery dialog when access is denied.
- **Traceability:** UC EF-1; target permission-denied frames; Prompt D local error.

### Business Rule: BR-RJPP-06

- **Name:** Microphone Denied State
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `context PreviewService::prepare(command: PreviewCommand): PreviewState\npost BR_RJPP_06_MicrophoneDeniedState:\n  result.microphonePermission <> PermissionStatus::GRANTED implies not result.microphoneEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Microphone remains disabled; show the permission-denied recovery dialog when access is denied.
- **Traceability:** UC EF-1; target permission-denied frames; Prompt D local error.

### Business Rule: BR-RJPP-07

- **Name:** Client Local Preview
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `context PreviewService::prepare(command: PreviewCommand): PreviewState\npost BR_RJPP_07_ClientLocalPreview:\n  Participant.allInstances() = Participant.allInstances()@pre and\n  MediaPreference.allInstances() = MediaPreference.allInstances()@pre and\n  ViewPreference.allInstances() = ViewPreference.allInstances()@pre`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Do not call an endpoint or mutate database-backed entities for preview preparation.
- **Traceability:** UC Notes; Prompt A client-local boundary.

## Prompt F: Implementation Context

Use every prompt in this artifact together with the existing project manifests and lockfiles, the approved database contract, the empty API inventory for UC-01, the embedded desktop-only Figma specification and CSS/HTML asset equivalents in Prompt B, and existing source-code conventions.

Priority:

1. Requirements explicitly present in this approved prompt
2. Approved API and database/project contracts
3. Embedded Figma UI specification and frozen design evidence
4. Existing source-code conventions
