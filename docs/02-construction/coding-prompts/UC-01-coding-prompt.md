---
artifact_type: business-coding-prompt
status: Approved
uc_id: UC-01
uc_name: Review Join Preview and Permissions
generated_at: 2026-11-16T00:21:49.497+07:00
---

# UC-01 Business Coding Prompt - Review Join Preview and Permissions

## Prompt A: Backend API

### Objective: Keep preview preparation strictly client-local.

Do not add, alter, or call a backend endpoint for UC-01. There is no related API contract and the frozen use case defines `participantKey` as local draft state, not persisted session membership. Do not create a participant, media-preference record, session record, migration, entity, controller, service, DTO, or database write. Existing MySQL tables are not part of this flow.

Keep the local command shape as `participantKey`, `role`, `displayName`, `requestCamera`, and `requestMicrophone`. The role comes from the optional preview URL or client entry state: accept only `HOST`, `BROADCASTER`, `VIEWER`, and `STAGE_PARTICIPANT`; default omitted or invalid input to `BROADCASTER`. No role-selector control is part of this UI.

## Prompt B: Frontend UI

### Objective: Build the desktop pre-join preview interface in the existing React 18, TypeScript, Vite, and Tailwind application.

Create the UC-01 pre-join screen in `finalsource/fe/src/App.tsx` with focused local components where they make the screen clearer. Retain the existing Tailwind setup and do not add dependencies. This is desktop-only: no mobile layout is required.

The design provenance is the frozen dataset `100ms-2026-10-02-001`. Implement these target frames and state treatments: `6007:51246` A/V Muted, native SHA-256 `662b718f7b8238603736c786b4dcb61991ce022cac683d23e7752de7f6e72724`; `6007:51266` Permission Denied Dialog, `93fd60e39710b8109388334b15e0900becd70e018bbf8281871a6d5a465cdc17`; `6007:51296` Permission, `ff282e4a6655ab351a462ea7a32d8f6319c880ee22b092b9b02632a343a49bea`; `6007:51317` Menu, `aa1b52aade48f81d7d08736e5843b48c6a6ba95e682524801c101a3aa4346137`; `6066:89729` A/V Muted, `b73268ee717798443fb29b3c1a9f3c139f5ae854e22df935d0f2b96b1efc1843`; `6066:89749` Permission Denied Dialog, `086798417ae1119944c0d5fe81b77f46c49ea63ff70144035cab1c45e28046f7`; and `6066:89779` Permission, `b147ff8c6b85f27562d91c301a5b585427999e2763b4990f40e27ae8ea67111d`. Each frame is 1512 by 982 pixels.

Use a full dark `#000000` or `#11131a` desktop canvas and center a 480px pre-join column. Use 40px vertical groups, 24px preview-section gaps, 16px control/input gaps, and a 337.5px-tall, 480px-wide preview tile with a 16px radius. Use Inter when available, with system sans-serif fallback. Heading: 34px, 600, 40px line-height, 0.25px tracking, `#eff0fa`; body: 16px, 400, 24px line-height, 0.5px tracking, `#c5c6d0`; controls: 16px, 600, 24px line-height, 0.5px tracking. Use surfaces `#191b23`, `#2e3038`, and `#293042`; borders `#1d1f27` and `#272a31`; muted text `#8f9099`; primary `#538dff`; disabled primary `#004299`; disabled-primary text `#84aaff`; and an 8px control radius except for the 40px pill chip.

Display the logo mark, “Get Started”, “Setup your audio and video before joining”, and the chip “You are the first to join”. The preview tile must show either the granted camera stream or the muted fallback avatar, with a top-right microphone-status pill. Under it, provide camera and microphone toggles, their adjacent device-menu affordances, settings, an editable name field with the placeholder “Enter name”, and the visual primary action “Go Live”. The action remains visual only because joining is outside UC-01. The `Permission` state exposes a permission-request action; the denied state overlays a centered modal with the visible recovery action to retry permission. The device menus are anchored to their corresponding camera or microphone affordance and expose only available browser devices.

Use inline SVG or equivalent CSS/HTML geometry rather than any external image request. These embedded marks establish the relevant Figma visual language: a 40px white outlined-person avatar; a 32px `#eff0fa` camera or microphone control with a diagonal muted slash; a 24px `#eff0fa` vertical three-dot menu; a 32px `#eff0fa` gear; and a 24px `#84aaff` broadcast-wave action icon. Build these as inline `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 7a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 7a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/></svg>`, `<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M6 10h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Zm17 4 6-4v12l-6-4v-4Z"/><path stroke="currentColor" stroke-width="3" d="M4 4l24 24"/></svg>`, `<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 4a5 5 0 0 1 5 5v7a5 5 0 0 1-10 0V9a5 5 0 0 1 5-5Z"/><path fill="currentColor" d="M7 15h3a6 6 0 0 0 12 0h3a9 9 0 0 1-7 8.8V28h-4v-4.2A9 9 0 0 1 7 15Z"/><path stroke="currentColor" stroke-width="3" d="M4 4l24 24"/></svg>`, and `<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 11a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm12 5-3 2-.4 3.2-3.1.8-2.2 2.4-3-1.2-3 1.2-2.2-2.4-3.1-.8L7 18l-3-2 3-2 .4-3.2 3.1-.8 2.2-2.4 3 1.2 3-1.2 2.2 2.4 3.1.8L25 14l3 2Z"/></svg>`. Use CSS-drawn circular avatar and modal icon fallbacks for the remaining Figma asset instances; preserve the colors, sizes, and muted/active treatments above.

## Prompt C: Frontend Logic and Local Browser Integration

### Objective: Connect the pre-join screen to local browser media and URL state.

Use React local state and effects in the pre-join screen. Generate a local `participantKey` once per screen instance, preserve the editable `displayName`, parse the role as specified in Prompt A, and track camera permission, microphone permission, device availability, enabled states, selected device IDs, active `MediaStream`, request-in-progress state, and whether the denied dialog is open.

On the permission action, call `navigator.mediaDevices.getUserMedia` only with the currently requested camera and microphone flags. If granted, attach the stream to a muted `video` preview with `playsInline`, calculate readiness from the requested available tracks, and reflect camera/microphone enabled controls in the local preview. If a device is toggled off, stop or disable its corresponding track for the preview without persisting anything. Use `enumerateDevices` after successful permission and whenever appropriate to populate the two local device menus. Release every stream track when replacing a stream or unmounting the screen.

The local successful result is a `PreviewState` containing the participant key, permission outcomes, camera and microphone availability, camera and microphone enabled flags, and readiness-to-join. Do not navigate, submit, call Axios, update a server session, or claim session membership. The visible “Go Live” action must not perform a join because that behavior belongs to a later use case.

## Prompt D: Validation and Error Handling

### Objective: Make local permission and preview failures understandable and prevent duplicate browser requests.

While a media request is in progress, disable the permission action and both media toggles, show loading text in the action area, and prevent a second request. A blank name must remain visually valid for preview because UC-01 supplies no required-name rule; preserve the placeholder and do not invent one.

Treat `NotAllowedError`, `SecurityError`, or a browser permission denial as denied camera and microphone outcomes. Show the Permission Denied Dialog over the pre-join screen, use its visible recovery action to retry the local request, and keep the fallback avatar and muted-control treatment behind it. For `NotFoundError`, missing devices, or unsupported media APIs, keep the relevant control unavailable, retain the fallback preview, and present a concise inline device-unavailable message near the preview controls. For other local `getUserMedia` failures, keep the user on the screen, clear the loading state, show a concise inline preview error near the controls, and do not display a fabricated server/API error. Browser permission and media state are authoritative for this client-local flow.
