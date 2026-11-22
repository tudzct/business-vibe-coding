---
artifact_type: business-coding-prompt
status: Approved
uc_id: UC-01
uc_name: "Review Join Preview and Permissions"
generated_at: 2026-11-22T23:40:00+07:00
---

# UC-01 Business Coding Prompt - Review Join Preview and Permissions

## Prompt A: Backend API

### Objective: Backend boundary

No backend API is required. The use case explicitly declares `Related API IDs: None`; preview preparation is client-local and must not create or update `participants`, `media_preferences`, `view_preferences`, or any other persisted entity. There is no protected/public endpoint, request URL, server DTO, server response wrapper, or server error contract for this UC.

## Prompt B: Frontend UI

### Objective: Build the desktop pre-join preview

Create a React 18 + TypeScript + Vite component in `finalsource/fe/src/`, using the existing Tailwind/PostCSS styling system and project conventions. Keep the implementation client-local. The component must present display name, camera, microphone, permission, and join controls; render a media-preview tile; and expose the normal, muted, permission-request, permission-denied, and menu states required by the use case.

**Target frames & design provenance:** Frozen dataset `100ms-2026-10-02-001`, desktop-only. Required frames: `A/V Muted` node `6007:51246` (1512x982), `Permission Denied Dialog` node `6007:51266` (1512x982), `Permission` node `6007:51296` (1512x982), `Menu` node `6007:51317` (1512x982), plus the desktop A/V Muted captures `6066:89729` (1512x982), `6066:89749` (1512x982), and `6066:89779` (1512x982). Native-design evidence is complete for all required frames. Native-design SHA-256 values are the checksum-addressed hashes recorded by each frame's `asset-map.json`; preserve those asset bytes when using an icon. Mobile is excluded by the frozen coverage (`platforms: desktop`, `excluded_platforms: mobile`).

**Layout & dimensions:** Use a black/dim full-screen background. Center a 480px-wide pre-join column on desktop, vertically centered around the supplied 1512x982 frame. Use 40px vertical spacing between the heading group, status chip, and preview; 24px spacing inside control groups and between preview and form; 480px x 337.5px video tile with 16px radius; 48px name field and join button; 16px horizontal gaps in the name row. Preserve the design's centered alignment and desktop fixed scope; no mobile breakpoint is required for this UC.

**Design tokens:** Inter. Heading: 34px/40px, weight 600, letter spacing 0.25px, `#eff0fa`. Body: 16px/24px, weight 400, letter spacing 0.5px, `#c5c6d0`. Secondary label: 14px/20px, weight 600, letter spacing 0.25px. Button: 16px/24px, weight 600, letter spacing 0.5px. Background `#000000`; surface default `#191b23`; surface dim `#11131a`; surface brighter `#2e3038`; border default `#1d1f27`; border bright `#272a31`; primary bright `#538dff`; disabled primary `#004299`; disabled text `#84aaff`; low text `#8f9099`; secondary dim `#293042`; avatar purple `#7e47eb`; radii 8px for controls, 16px for tile, 20px for circular controls, 40px for chip.

**Component & state specifications:** Exact visible copy includes `Get Started`, `Setup your audio and video before joining`, `You are the first to join`, `Enter name`, and `Go Live` in the supplied desktop frame; permission-denied state must use the frozen dialog copy and visible recovery action from node `6007:51266`/`6066:89749`. The preview tile shows the local avatar fallback when camera is unavailable or disabled, a microphone status badge, and muted styling when a device is off. Camera and microphone controls have enabled, disabled/muted, and permission-request states; the overflow control opens the frozen menu state. The name input is empty until edited, invalid while blank or over 50 trimmed characters, and the primary join action is disabled until `isReadyToJoin` is true. Permission-denied recovery must be visible and must permit the user to retry the browser permission request or continue with the corresponding device disabled. Do not persist preview state or infer session membership from `participantKey`.

**Embedded icon/graphic assets:** Use inline SVG or pure CSS equivalents in the component, not runtime reads from the dataset. Required graphics are the logo mark, local avatar/person fallback, microphone, camera, permission, overflow menu, close/back/recovery, and join/arrow icons appearing in the seven required frames. Preserve the frozen asset-map SHA-256 bytes when converting each vector to inline SVG. CSS-only equivalents are permitted for simple geometric marks (logo bars, dividers, circles, scrims); semantic controls must retain accessible labels and visible state.

### Implementation requirements

Match the embedded desktop specification exactly. Use functional controls for camera, microphone, permission request, name entry, overflow menu, retry, and join readiness. The UI must not call an HTTP endpoint, mutate database state, or add a dependency. Design-only controls remain visual unless the UC defines behavior. If browser media APIs are unavailable, represent the unavailable/denied state deterministically and keep the recovery action visible.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the preview to local/browser state

Continue working on the pre-join component. Use React state and browser media APIs (`navigator.mediaDevices.getUserMedia`) where available; keep a local `PreviewCommand` and derived `PreviewState` in component or hook state only.

### Local command state

`PreviewCommand = { participantKey: string, role: ParticipantRole, displayName: string, requestCamera: boolean, requestMicrophone: boolean }`. `PreviewState = { participantKey, cameraPermission, microphonePermission, cameraAvailable, microphoneAvailable, cameraEnabled, microphoneEnabled, isReadyToJoin }`. Permissions are `UNKNOWN | GRANTED | DENIED`; roles are `HOST | BROADCASTER | VIEWER | STAGE_PARTICIPANT`.

Implement `preparePreview(command)` as a pure/local operation. Trim the display name for readiness evaluation, preserve the participant key exactly, request only the selected devices, map browser permission/device failures to `DENIED` or unavailable state, and never write to persistence. A successful local outcome updates the preview tile and control state. For `VIEWER`, both camera and microphone must remain disabled. Join readiness is local only and means the trimmed name is non-null, non-empty, and at most 50 characters.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading, and failure states

Refine the local permission/preview action in the pre-join component.

### Loading state

While a permission request is pending, disable the permission action and the corresponding device toggle, show the frozen loading treatment used by the existing UI, and prevent duplicate `getUserMedia` calls.

### Browser/local error

On denied permission, unavailable device, or browser API failure, set the relevant permission to `DENIED` or the device availability to false, force the corresponding enabled flag to false, and display the frozen permission-denied dialog with its visible recovery action. Keep the other device independent. Do not send an API request.

### Client-side validation

Before the local join/readiness operation, trim `displayName` and reject null, blank, or more-than-50-character values. Display the validation message adjacent to the name field, keep `isReadyToJoin` false, and do not proceed with the local join action. Backend validation is not applicable because this UC has no backend endpoint.

## Prompt E: Business Rules Compliance

### Objective: Implement every frozen UC-01 business rule

### Business Rule: BR-RJPP-01

- **Name:** Permission And Hardware
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `(result.cameraEnabled implies result.cameraPermission = PermissionStatus::GRANTED and result.cameraAvailable and command.requestCamera) and (result.microphoneEnabled implies result.microphonePermission = PermissionStatus::GRANTED and result.microphoneAvailable and command.requestMicrophone)`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Force the affected enabled flag false when permission is not granted, hardware is unavailable, or the command did not request that device.
- **Traceability:** BF-1.3–BF-1.5, AF-1, EF-1; local preview state.

### Business Rule: BR-RJPP-02

- **Name:** Viewer Preview Muted
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `command.role = ParticipantRole::VIEWER implies not result.cameraEnabled and not result.microphoneEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Keep both device enabled flags false for a viewer.
- **Traceability:** Preview preparation and rendered control state.

### Business Rule: BR-RJPP-03

- **Name:** Name Readiness
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.isReadyToJoin = (command.displayName <> null and command.displayName.trim().size() > 0 and command.displayName.trim().size() <= 50)`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Keep readiness false and show name validation for null, blank, or over-50-character input.
- **Traceability:** Name field and join action; BF-1.2–BF-1.5.

### Business Rule: BR-RJPP-04

- **Name:** Preview Key
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.participantKey = command.participantKey`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Return the exact local participant key unchanged.
- **Traceability:** Local draft state; Notes.

### Business Rule: BR-RJPP-05

- **Name:** Camera Denied State
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.cameraPermission <> PermissionStatus::GRANTED implies not result.cameraEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Disable camera preview and show the camera-related denied/unavailable treatment.
- **Traceability:** EF-1 and camera toggle.

### Business Rule: BR-RJPP-06

- **Name:** Microphone Denied State
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.microphonePermission <> PermissionStatus::GRANTED implies not result.microphoneEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Disable microphone preview and show the microphone-related denied/unavailable treatment.
- **Traceability:** EF-1 and microphone toggle.

### Business Rule: BR-RJPP-07

- **Name:** Client Local Preview
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `Participant.allInstances() = Participant.allInstances()@pre and MediaPreference.allInstances() = MediaPreference.allInstances()@pre and ViewPreference.allInstances() = ViewPreference.allInstances()@pre`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Do not create, update, or delete persisted participant, media preference, or view preference records.
- **Traceability:** Notes; client-local preview boundary.

## Prompt F: Implementation Context

Implement only the frozen UC-01 behavior in the existing `finalsource/fe` React/Vite/Tailwind application. There are no related API contracts and no server changes. Use the existing manifests and lockfiles, preserve `synchronize: false` and `migrationsRun: false`, and do not alter schema or migrations. Treat the embedded Prompt B desktop design specification as authoritative for visual work, and use only the seven frozen Figma frames identified there. Respect the business rules above, keep preview state browser-local, and preserve accessible labels, keyboard operation, and deterministic denied/unavailable fallbacks.
