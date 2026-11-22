---
artifact_type: business-coding-prompt
status: Approved
uc_id: UC-01
uc_name: Review Join Preview and Permissions
generated_at: 2026-11-22T18:15:14.419+07:00
---

# UC-01 Business Coding Prompt - Review Join Preview and Permissions

## Prompt A: Backend API

### Objective: Preserve the client-local boundary for preview preparation.

UC-01 has no related API contracts (`api_contracts: []`). Do not add a NestJS controller, endpoint, DTO, persistence operation, or database mutation for preview preparation. `participantKey` identifies local draft state and is not persisted session membership. Do not create or modify `Participant`, `MediaPreference`, or `ViewPreference` records.

The backend and the configured MySQL schema are unchanged for this use case. Keep the existing NestJS architecture, TypeORM mappings, `synchronize: false`, and `migrationsRun: false` unchanged.

## Prompt B: Frontend UI

### Objective: Build the desktop pre-join user interface according to the frozen Figma design.

Create a React 18 + TypeScript pre-join preview component and render it from the current `App` using the existing Tailwind CSS setup. The component must display a local camera preview/fallback tile, microphone and camera controls, their device menus, a display-name input, a disabled/enabled `Go Live` button, and the permission-denied dialog/retry state.

**Target Frames & Design Provenance:** Desktop-only scope. Implement the required frozen frames: `A/V Muted` (`6007:51246`, native SHA-256 `662b718f7b8238603736c786b4dcb61991ce022cac683d23e7752de7f6e72724`), `Permission Denied Dialog` (`6007:51266`, `93fd60e39710b8109388334b15e0900becd70e018bbf8281871a6d5a465cdc17`), `Permission` (`6007:51296`, `ff282e4a6655ab351a462ea7a32d8f6319c880ee22b092b9b02632a343a49bea`), and `Menu` (`6007:51317`, `aa1b52aade48f81d7d08736e5843b48c6a6ba95e682524801c101a3aa4346137`). The approved `Preview Flow` section `6066:89728` identifies desktop frames `6066:89729` (A/V Muted), `6066:89749` (Permission Denied Dialog), and `6066:89779` (Permission). Do not implement the mobile flow: it is explicitly outside this dataset's authorized desktop scope.

**Layout & Dimensions:** Use the 1512 × 982 desktop artboard and center a 480px-wide pre-join control. The header-to-preview stack has a 32px logo, title/description block, 40px chip, and 24px gaps. The main video tile is 480 × 337.5px with 16px radius. Below it, use a 480px control row (48px tall; 16px gaps) and a 48px name/action row with a 341px input, 16px gap, and 123px action button. Device menus use the Menu state beneath the relevant control. The permission-denied state retains the preview beneath a full-screen scrim and centers a 380 × 228px dialog with 24px inset padding.

**Design Tokens (Colors, Typography, Radii, Borders):** Use Inter. Title: 34px/40px, 600, letter-spacing 0.25px, `#eff0fa`. Body/button input text: 16px/24px, letter-spacing 0.5px; body `#c5c6d0`; muted text `#8f9099`. Chip label: 14px/20px, 600, letter-spacing 0.25px. Page `#000000`; dim preview `#11131a`; surface `#191b23`; brighter control surface `#2e3038`; secondary control `#293042`; primary bright `#538dff`; disabled primary `#004299`; disabled on-primary `#84aaff`; default/bright borders `#1d1f27`/`#272a31`; avatar `#7e47eb`. Use 8px control radius, 16px tile radius, 40px chip radius, and the Figma scrim for modal state.

**Component & State Specifications:** Exact visible copy is `Get Started`, `Setup your audio and video before joining`, `You are the first to join`, `Enter name`, and `Go Live`. Render camera/microphone controls with visual enabled and muted states; render their selectable device menus using the captured labels `Default - MacBook Pro Microphone (Built-in)`, `MacBook Pro Microphone (Built-in)`, and `Bose Microphone` when the corresponding captured menu is shown. The initial empty-name state disables `Go Live`; a nonblank 50-character-or-less trimmed name enables it. For denied permission, show the modal title `Allow to use your microphone and camera`, exact body `Access to Microphone and Camera is required. Enable permissions for Microphone and Camera by clicking “Allow” on the pop-up.`, and `Dismiss` and `Retry` actions. Do not make design-only device selection persist remotely.

**Embedded Inline SVG Assets:** Embed the actual local checksum-addressed SVG markup from the approved Figma assets rather than fetching design files at runtime. The required icon source hashes are: avatar `sha256:400a1f7d4a9b0787f8b50bd78027a6024dc03b86a6ad980ff69a2d340df11802`; muted microphone `sha256:6aa424b5b720b133023e17e2e11eda695c1779f2b65bb6dd0b330864139c34dd`; microphone control `sha256:0f3904e9b213b15213baa24f98676ca3207e2a61575320358e795ca02ca161ad`; camera control `sha256:288f6ee80531db0176f08a709317b3dd8e3ed994536f4783411ed8575b0b466a`; overflow `sha256:e259dcc54fdbbbf8a01d9d95fb9ea16ba5f256d1471e85a4b6f27ef3a82e9976`; effects/background control `sha256:bcae0a640f97f95ed5161204459193aade89827b8403595677258e139f79be30`; settings/control `sha256:40e5dd91ff850a7e8bd1c4bcaa4e8e516b316964475bf9284b5577d825fd133c`; and action icon `sha256:af1aa7538688cdddfc6f090328ec8b145118cd05fe8949dbfda7bf95116ff5cf`. Copy their SVG elements inline into the component; do not leave Figma asset paths or remote asset URLs in application code.

### Implementation Requirements

Match the desktop layout, spacing, typography, colors, controls, menus, modal, and muted/permission states above using the existing Tailwind conventions. Use an accessible label for every interactive control, keep focusable controls keyboard-operable, and make the dialog accessible. No mobile layout is required by this prompt.

## Prompt C: Frontend Logic and Local Browser Integration

### Objective: Implement the local preview flow successfully without an API.

Continue working on the pre-join preview component. Use component-local React state for `participantKey`, role, display name, requested camera/microphone, permission outcomes, availability, enabled state, selected device/menu, stream, loading, and denial-dialog visibility. `participantKey` must be preserved unchanged in the resulting local preview state.

Implement `preparePreview` as an async local browser-media flow. Request the selected camera and microphone through browser media APIs only when requested, derive local availability and `UNKNOWN`, `GRANTED`, or `DENIED` outcomes from the result, and attach an available video stream to the preview. Stop newly acquired tracks when they are superseded or the component unmounts.

The local command state is:

```ts
{
  participantKey: string;
  role: 'HOST' | 'BROADCASTER' | 'VIEWER' | 'STAGE_PARTICIPANT';
  displayName: string;
  requestCamera: boolean;
  requestMicrophone: boolean;
}
```

The local outcome is a `PreviewState` with the same `participantKey`, camera and microphone permissions, availability, enabled states, and `isReadyToJoin`. Do not call Axios or any REST endpoint, and do not update session, participant, media-preference, or view-preference data.

On success:

1. Render the returned local media preview/fallback and current controls.
2. Reflect enabled states only for granted, available, requested devices.
3. Keep the preview local; do not create a session membership or navigate to a joined session.
4. Enable `Go Live` only when the trimmed display name is 1–50 characters; the button remains a pre-join visual/action boundary, not a join API call.

For `VIEWER`, render both camera and microphone disabled regardless of permission or hardware. Toggling off camera or microphone renders the corresponding muted state.

## Prompt D: Validation and Error Handling

### Objective: Complete local validation, permission loading, and error handling.

Refine `preparePreview` in the pre-join preview component.

### Loading State

While a permission/media request is in progress:

- Disable the permission-triggering and duplicate preview actions.
- Display a loading indicator using the captured feedback style.
- Prevent duplicate browser-media requests.

### Local Error

If camera or microphone permission is denied, unavailable, or a browser-media request fails, never enable the affected device. Render the captured permission-denied dialog above the retained pre-join screen, display its exact message, let `Dismiss` close only the dialog, and let `Retry` issue a fresh local permission request. Keep the error presentation in the dialog; do not fabricate an API error.

### Client-Side Validation

Before enabling `Go Live`, trim the display name. It must be nonempty after trimming and no longer than 50 characters. Display validation feedback adjacent to the name input. Do not initiate or represent a join request when validation fails. Keep browser permission outcomes authoritative for local device enablement.

## Prompt E: Business Rules Compliance

### Objective: Implement the complete frozen Business Rule set for this use case without changing its meaning.

### Business Rule: BR-RJPP-01

- **Name:** Permission And Hardware
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `(result.cameraEnabled implies result.cameraPermission = PermissionStatus::GRANTED and result.cameraAvailable and command.requestCamera) and (result.microphoneEnabled implies result.microphonePermission = PermissionStatus::GRANTED and result.microphoneAvailable and command.requestMicrophone)`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend/browser local state
- **Failure behavior:** disable the affected preview control and render the permission-denied dialog when access is denied.
- **Traceability:** BF-1.3–BF-1.5; Prompt C local outcome.

### Business Rule: BR-RJPP-02

- **Name:** Viewer Preview Muted
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `command.role = ParticipantRole::VIEWER implies not result.cameraEnabled and not result.microphoneEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend/browser local state
- **Failure behavior:** camera and microphone remain disabled for a viewer.
- **Traceability:** UC UML `ParticipantRole`; Prompt C viewer state.

### Business Rule: BR-RJPP-03

- **Name:** Name Readiness
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.isReadyToJoin = (command.displayName <> null and command.displayName.trim().size() > 0 and command.displayName.trim().size() <= 50)`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend/browser local state
- **Failure behavior:** keep `Go Live` disabled and show adjacent name validation feedback.
- **Traceability:** Prompt B name input; Prompt D validation.

### Business Rule: BR-RJPP-04

- **Name:** Preview Key
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.participantKey = command.participantKey`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend/browser local state
- **Failure behavior:** preserve the supplied key unchanged; no persistence is allowed.
- **Traceability:** UC Notes; Prompt C local command/outcome.

### Business Rule: BR-RJPP-05

- **Name:** Camera Denied State
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.cameraPermission <> PermissionStatus::GRANTED implies not result.cameraEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend/browser local state
- **Failure behavior:** camera remains off and the denial state is shown.
- **Traceability:** EF-1; Prompt D local error.

### Business Rule: BR-RJPP-06

- **Name:** Microphone Denied State
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.microphonePermission <> PermissionStatus::GRANTED implies not result.microphoneEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend/browser local state
- **Failure behavior:** microphone remains off and the denial state is shown.
- **Traceability:** EF-1; Prompt D local error.

### Business Rule: BR-RJPP-07

- **Name:** Client Local Preview
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `Participant.allInstances() = Participant.allInstances()@pre and MediaPreference.allInstances() = MediaPreference.allInstances()@pre and ViewPreference.allInstances() = ViewPreference.allInstances()@pre`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend/browser local state
- **Failure behavior:** no backend, API, or database persistence is performed.
- **Traceability:** UC Notes; Prompt A; Prompt C.

## Prompt F: Implementation Context

Use every prompt in this artifact with the existing React 18/Vite/Tailwind frontend, NestJS 11 backend, approved MySQL schema, and existing source-code conventions. The frozen Figma specification and asset hashes in Prompt B are the UI source of truth. Do not add dependencies, APIs, schema changes, migrations, or persistence. Requirements in this prompt take priority, followed by the approved project/database contracts, the embedded Figma evidence, and then current source conventions.
