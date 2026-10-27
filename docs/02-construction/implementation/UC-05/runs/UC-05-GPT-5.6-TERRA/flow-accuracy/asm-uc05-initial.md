# Flow accuracy: asm-uc05-initial

Status: scored
Rubric: completion-critical-flow-runtime-v2
Source revision: sha256:8e695d4395701e2996a1b7e95f1f47515d693a6bb767d669117bb03a88155b33
Flow accuracy: 100.0%
Flow error: 0.0%
Evaluated coverage: 100.0%
Execution blocked: no
Execution blocker defects: none
Accuracy bounds: 100.0% to 100.0%

Flows: 3 correct, 0 incorrect, 0 not evaluable, 3 total

| Flow | Type | Status | Noncritical deviations |
|---|---|---|---:|
| BF-1 | main | correct | 0 |
| AF-1 | alternative | correct | 0 |
| EF-1 | exception | correct | 0 |


## Observation trace

- obs-bf1 / BF-1: 2026-10-27T12:18:11+07:00 to 2026-10-27T12:18:14+07:00; completed; entry http://127.0.0.1:8086/?view=viewer&sessionId=11111111-1111-4111-8111-111111111111; end Client renders full live stream experience with participant badge, stream status 'Stream ended', video player and controls.
  1. Viewer navigates to the live-session interface with authenticated token in session storage. -> Viewer interface route is loaded with valid session context. (entry, BF-1.1)
  2. Client requests GET /api/v1/sessions/:sessionId/live-stream/view and GET /api/v1/sessions/:sessionId/state. -> Both endpoints return HTTP 200 OK with session representation. (BF-1.2)
  3. System returns viewer-facing stream state and session snapshot. -> Received HTTP 200 payload with streamStatus 'ENDED', streamVersion 2, sessionVersion 2, and selfParticipant. (BF-1.3)
  4. Client renders live-session experience with player, participant label, status and controls. -> Rendered DOM contains player surface, 'Viewer Bob', stream status 'Stream ended', controls. (BF-1.4, terminal_outcome)
- obs-af1 / AF-1: 2026-10-27T12:18:14+07:00 to 2026-10-27T12:18:15+07:00; completed; entry http://127.0.0.1:8086/?view=viewer&sessionId=11111111-1111-4111-8111-111111111111; end Viewer session menu is displayed with design actions Playback quality and Fullscreen.
  1. Viewer opens session menu by clicking More button. -> More button clicked, triggering session menu visibility. (entry, branch, AF-1.1)
  2. Client displays viewer actions shown by design in the open menu. -> Menu container rendered with role=menu and menuitems Playback quality and Fullscreen. (AF-1.2, terminal_outcome)
- obs-ef1 / EF-1: 2026-10-27T12:18:16+07:00 to 2026-10-27T12:18:18+07:00; completed; entry http://127.0.0.1:8086/?view=viewer&sessionId=00000000-0000-4000-8000-000000000000; end Client displays visible error alert and unavailable stream state.
  1. Viewer attempts to access live-session interface with unauthorized session ID. -> API requests for view and state return HTTP 403 Forbidden. (entry, branch, EF-1.1)
  2. Client displays visible loading or unavailable state. -> Rendered alert with role=alert displaying error message and status 'Live session unavailable'. (EF-1.2, terminal_outcome)

Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input.
