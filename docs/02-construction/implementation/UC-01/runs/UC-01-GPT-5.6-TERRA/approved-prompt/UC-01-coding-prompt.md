---
artifact_type: coding-prompt
status: Approved
uc_id: UC-01
uc_name: Review Join Preview and Permissions
source_use_case: docs/01-inception/use-cases/uc-01-review-join-preview-and-permissions.md
source_api_contracts: None.
business_rule_baseline: docs/02-construction/implementation/UC-01/business-rule-baseline.json
generated_at: 2026-10-19T10:53:46.766+07:00
---

# UC-01 Coding Prompt - Review Join Preview and Permissions

Implement the client-local pre-join preview described by UC-01. Together, the frontend work below must cover BF-1.1 through BF-1.5, AF-1, and EF-1 and their terminal UI outcomes. Do not add persisted membership or a server API: the frozen UC explicitly states that preview preparation is client-local and that `participantKey` identifies local draft state only.

## Prompt A: Backend API

### Objective: Preserve the client-local boundary.

UC-01 has no related API contracts (`Related API IDs: None.`) and defines preview preparation as client-local. Do not create an HTTP endpoint, NestJS controller/service/DTO, database entity, query, transaction, persistence, or API integration for this use case.

Do not alter the configured database contract. In particular, do not create or write `participants`, `media_preferences`, or `view_preferences`; BR-RJPP-07 requires each extent to remain unchanged during preview preparation. Do not change DBML, migrations, migration configuration, synchronization, or automatic migrations.

Keep the existing NestJS architecture unchanged. There is no success or error HTTP response for this use case.

## Prompt B: Frontend UI

### Objective: Build the client-local pre-join interface according to the frozen Figma design.

Create the pre-join preview screen in the existing React 18 + TypeScript + Vite frontend. Use the repository’s existing Tailwind styling system and the existing `App.tsx` entry point or a directly imported component; do not introduce a new dependency or architectural layer.

The component MUST display:

- a dark pre-join surface with the brand mark, **Get Started** heading, and **Setup your audio and video before joining** helper text;
- the **You are the first to join** chip;
- a 16px-rounded video preview tile with a fallback avatar and a visible microphone-state indicator when camera video is unavailable or disabled;
- separate camera and microphone controls that expose their current enabled/muted states and provide an explicit permission action;
- a display-name input with the **Enter name** placeholder;
- a join action styled from the Figma **Go Live** control, disabled until the trimmed display name is non-empty and at most 50 characters;
- a permission-denied dialog with the visible recovery action when requested camera or microphone access is denied.

### Figma Design Scope

Frozen Figma dataset and target: dataset `100ms-2026-10-02-001`, manifest `resource/figma-design-dataset/100ms-2026-10-02-001/manifest.json`, manifest checksum `sha256:ead5b6aa248f3c132950dc533b5b3392052cfdcfec6efc029c3fb01e6845c298`, snapshot node `6007:51246`.

The checksum-valid resolved target frame is:

- `A/V Muted` — node `6007:51246`

STRICTLY follow this frame’s desktop pre-join visual language: black page background; centered 480px desktop control column; Inter typography; 34px/40px semi-bold heading; 16px/24px body and input text; 16px rounded video tile; 8px control and field radii; dark surfaces (`#11131a`, `#191b23`, `#2e3038`); and the blue disabled-primary treatment seen on the initial Go Live control. Preserve a responsive layout for narrower viewports without changing the desktop control hierarchy.

Use accessible labels for the camera, microphone, permission action, name input, join action, and recovery action. Use text or accessible state labels in addition to icon-only controls so the current camera/microphone state is clear.

## Prompt C: Frontend Logic and Local Preview Integration

### Objective: Prepare and render the local preview without an API request.

Continue working on the pre-join preview component. Manage local React state for `participantKey`, `role`, `displayName`, requested-camera and requested-microphone flags, permission outcomes, hardware availability, enabled states, the captured local `MediaStream`, permission-dialog visibility, and request-in-progress state.

Implement a local `preparePreview` function. It must request the selected media permissions using browser media APIs only (for example, `navigator.mediaDevices.getUserMedia` when available), receive the outcome, and update the preview. Do not send an HTTP request and do not persist data. Feature-detect unavailable browser media APIs and represent unavailable hardware as unavailable rather than granted.

### Local Preview Input

```ts
{
  participantKey: string,
  role: 'HOST' | 'BROADCASTER' | 'VIEWER' | 'STAGE_PARTICIPANT',
  displayName: string,
  requestCamera: boolean,
  requestMicrophone: boolean
}
```

### Local Preview State

```ts
{
  participantKey: string,
  cameraPermission: 'UNKNOWN' | 'GRANTED' | 'DENIED',
  microphonePermission: 'UNKNOWN' | 'GRANTED' | 'DENIED',
  cameraAvailable: boolean,
  microphoneAvailable: boolean,
  cameraEnabled: boolean,
  microphoneEnabled: boolean,
  isReadyToJoin: boolean
}
```

When the local request completes:

1. Preserve the supplied `participantKey` exactly in local preview state.
2. Render the live local stream in the video element only when camera permission is granted, camera hardware is available, and camera is requested and enabled; otherwise render the muted/fallback preview state.
3. Update each camera and microphone control to match the resulting enabled and permission states.
4. If either requested permission is denied, show the permission-denied dialog and its recovery action. The recovery action must let the participant request access again; do not claim that browser permission can be changed programmatically.

If the role is `VIEWER`, force both preview media controls to disabled/muted regardless of a prior request or grant. Stop local media tracks during component cleanup and when replacing a captured stream. Do not navigate or claim that a session was joined: no destination or join API is specified by this UC.

## Prompt D: Validation and Error Handling

### Objective: Complete local validation, loading state, and browser-permission handling.

Refine `preparePreview` in the pre-join component.

### Loading State

While a browser permission request is in progress:

- disable the permission action and prevent duplicate requests;
- show a clear local requesting/loading status;
- keep the join action disabled until the resulting `isReadyToJoin` condition is met.

### Permission Denied or Unavailable

When browser access is denied or a requested camera/microphone is unavailable:

- set the affected permission outcome to `DENIED` when access is denied and do not enable that medium;
- render the permission-denied dialog for denied access and show its recovery action;
- render the matching muted/unavailable control state;
- display the outcome adjacent to the preview controls; no HTTP status, API error body, or server message exists for this client-local flow.

### Client-Side Validation

Before enabling the join action, compute readiness exactly as `displayName !== null && displayName.trim().length > 0 && displayName.trim().length <= 50`. Display the validation message by the name input. Do not call an API, and do not invent a navigation, server validation response, or membership side effect.

## Prompt E: Business Rules Compliance

### Objective: Implement the complete frozen Business Rule set without changing its meaning.

### Business Rule: BR-RJPP-01

- **Name:** Permission And Hardware
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `(result.cameraEnabled implies result.cameraPermission = PermissionStatus::GRANTED and result.cameraAvailable and command.requestCamera) and (result.microphoneEnabled implies result.microphonePermission = PermissionStatus::GRANTED and result.microphoneAvailable and command.requestMicrophone)`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Do not enable the affected medium; render its current local permission/hardware state.
- **Traceability:** BF-1.3 to BF-1.5; AF-1; pre-join media controls.

### Business Rule: BR-RJPP-02

- **Name:** Viewer Preview Muted
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `command.role = ParticipantRole::VIEWER implies not result.cameraEnabled and not result.microphoneEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Render both controls muted/disabled for a viewer.
- **Traceability:** BF-1.5; pre-join media controls.

### Business Rule: BR-RJPP-03

- **Name:** Name Readiness
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.isReadyToJoin = (command.displayName <> null and command.displayName.trim().size() > 0 and command.displayName.trim().size() <= 50)`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Keep the join action disabled and display validation by the name input.
- **Traceability:** BF-1.2 and BF-1.5; name input and Go Live control.

### Business Rule: BR-RJPP-04

- **Name:** Preview Key
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.participantKey = command.participantKey`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Preserve the key in local state; no persistence is permitted.
- **Traceability:** BF-1.4 to BF-1.5; local preview state.

### Business Rule: BR-RJPP-05

- **Name:** Camera Denied State
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.cameraPermission <> PermissionStatus::GRANTED implies not result.cameraEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Camera remains off and the denial/recovery UI is visible when access is denied.
- **Traceability:** EF-1; camera control and permission-denied dialog.

### Business Rule: BR-RJPP-06

- **Name:** Microphone Denied State
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `result.microphonePermission <> PermissionStatus::GRANTED implies not result.microphoneEnabled`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Microphone remains muted and the denial/recovery UI is visible when access is denied.
- **Traceability:** EF-1; microphone control and permission-denied dialog.

### Business Rule: BR-RJPP-07

- **Name:** Client Local Preview
- **Representation:** OCL postcondition
- **Expression / authoritative text:** `Participant.allInstances() = Participant.allInstances()@pre and MediaPreference.allInstances() = MediaPreference.allInstances()@pre and ViewPreference.allInstances() = ViewPreference.allInstances()@pre`
- **Context:** `PreviewService::prepare(command: PreviewCommand): PreviewState`
- **Enforcement layer:** frontend
- **Failure behavior:** Perform no API call or database write; retain preview data solely in client memory.
- **Traceability:** UC Notes; Prompt A; BF-1.4 to BF-1.5.

## Prompt F: Implementation Context

Use every prompt in this artifact together with the frozen UC, checksum-pinned database contract, resolved Figma evidence, and existing source-code conventions.

Priority:

1. Requirements explicitly present in this approved prompt
2. API and database/project contracts
3. Figma evidence
4. Existing source-code conventions
