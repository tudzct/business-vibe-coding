---
artifact_type: coding-prompt
status: Approved
uc_id: UC-01
uc_name: Review Join Preview and Permissions
source_use_case: docs/01-inception/use-cases/uc-01-review-join-preview-and-permissions.md
source_api_contracts: None.
generated_at: 2026-10-25T16:25:40.239+07:00
---

# UC-01 Coding Prompt - Review Join Preview and Permissions

Both frontend and client-local logic together must cover BF-1, AF-1, and EF-1 and reach their stated terminal outcomes. Preview preparation is client-local: `participantKey` identifies draft state only and must not create session membership or persist data.

## Prompt A: Backend API

### Objective: Preserve the client-local boundary

Do not create a backend endpoint, DTO, controller, service, entity, migration, database query, or API client call for UC-01. `Related API IDs` is `None.` and the UC explicitly defines preview preparation as client-local.

Do not read from or write to `principals`, `participants`, `media_preferences`, `view_preferences`, or any other configured database table. In particular, do not treat the local `participantKey` as a persisted participant or session-membership identifier.

Do not change the existing NestJS application module at `finalsource/be/src/app.module.ts`. Keep the existing success/error API envelopes and project architecture unchanged for unrelated APIs.

## Prompt B: Frontend UI

### Objective: Build the pre-join preview interface according to the resolved Figma design

Create a `PreJoinPreview` React TypeScript component, mounted from `finalsource/fe/src/App.tsx`, using the project’s existing styling system and component conventions. Do not add Tailwind or new styling dependencies.

The component MUST display:

- a centered desktop pre-join control surface with the product mark, “Get Started” heading, and “Setup your audio and video before joining” helper text;
- the “You are the first to join” chip;
- a rounded camera-preview tile, including a safe muted/avatar fallback and a microphone-state indicator;
- separate camera and microphone controls, each with a visible enabled/muted state and accessible label;
- a name input with the visible “Enter name” placeholder;
- the visible recovery action for denied permission; and
- the primary action shown by the design (“Go Live”), disabled until the preview is ready and the display name is valid.

### Figma Design Scope

Frozen Figma dataset and resolved target: `100ms-2026-10-02-001`, frame `A/V Muted` (`6007:51246`), integrity validated by the resolver. The resolved node is a 1512×982 black/dim-background desktop frame containing a 480px-wide centered pre-join column.

Use this resolved frame as the implementation evidence. Match its dark palette, centered vertical composition, 40px section gaps, 24px preview-to-controls gap, 16px control spacing, 16px preview radius, 8px field/button radius, and Inter typography: 34px/40 semi-bold heading, 16px/24 regular body/input text, 14px/20 semi-bold chip, and 16px/24 semi-bold button text. Use responsive sizing so the same controls remain usable on the pre-join mobile view named by the UC; do not invent unobserved mobile visual details.

The frozen UC also identifies the related UI labels `Broadcaster Preview` (`6007:51245`), `Video Conferencing Desktop Preview` (`6066:89727`), and `Video Conferencing Mobile Preview` (`6066:89005`). Do not claim those nodes were resolved or use them as additional design evidence in this task.

### Implementation Requirements

Implement the camera tile with a live `<video muted playsInline>` element when a camera stream is available. When camera is disabled, unavailable, or permission is denied, render the muted fallback/avatar state demonstrated by `A/V Muted`; when microphone is disabled, render the muted microphone state. Keep controls keyboard-operable and expose state through `aria-pressed`, labels, and non-color-only cues.

## Prompt C: Frontend Logic and API Integration

### Objective: Implement the local preview flow without an API request

Continue working on `PreJoinPreview`. Use React state and refs for `displayName`, `cameraEnabled`, `microphoneEnabled`, camera and microphone permission statuses (`UNKNOWN`, `GRANTED`, `DENIED`), availability, readiness, dialog visibility, the active `MediaStream`, and the video element.

Implement `preparePreview()` as an asynchronous browser-media function, not an HTTP request. It must:

1. Start from the local draft fields `participantKey`, `role`, `displayName`, `requestCamera`, and `requestMicrophone` reflected by the UC UML model.
2. Request only the currently enabled requested tracks with `navigator.mediaDevices.getUserMedia`, attach a granted stream to the video element, and update camera/microphone permission and availability state from the outcome.
3. Render the preview and current control states after the outcome, satisfying BF-1.4 and BF-1.5.
4. Toggle microphone or camera locally for AF-1, update the corresponding track’s `enabled` value when a track exists, and immediately render the matching muted state.
5. Never send `participantKey`, name, media state, permission state, or device details to the server; do not use an API client.

On unmount and whenever a replacement stream is obtained, stop superseded media tracks and clear the video element’s `srcObject`. Guard browser-only media APIs so unsupported environments show the same recoverable unavailable state rather than throwing during rendering.

## Prompt D: Validation and Error Handling

### Objective: Complete permission, loading, and local validation handling

Refine `preparePreview()` in `PreJoinPreview`.

### Loading State

While a media permission request is pending:

- disable the permission/retry control and primary action;
- show an accessible loading indication in the preview/control area;
- prevent duplicate requests; and
- preserve the last safe muted fallback rather than presenting an empty or stale live preview.

### Permission and Device Errors

For `NotAllowedError`, `SecurityError`, a denied permission state, or an otherwise rejected permission request, set the relevant permission status to `DENIED`, stop any acquired tracks, show the permission-denied dialog required by EF-1, and provide a visible recovery action that retries permission only after an explicit user interaction. The dialog must explain that access was not granted without exposing device identifiers or browser error internals.

For `NotFoundError`, missing media APIs, or no requested device, mark the relevant capability unavailable and show an inline recoverable unavailable message; retain the ability to use the other available medium. Do not treat a local media failure as an API error.

### Client-Side Validation

Require a non-whitespace display name before enabling the primary “Go Live” action. Display its validation message adjacent to the name input. Do not run `preparePreview()` for an invalid name when the action requires a ready preview, and do not enable the primary action unless the selected camera/microphone state has completed its current permission attempt and the component has a valid local preview state. Backend validation is not applicable because this UC has no API.
