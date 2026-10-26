# Flow accuracy: flow-assessment-initial-01

Status: not_evaluable
Rubric: completion-critical-flow-runtime-v2
Source revision: sha256:5cc859a5bc0edd0b40c70edcc3d7a078a10576bd58562c3b9e96c9c862bfb41b
Flow accuracy: N/A
Flow error: N/A
Evaluated coverage: 66.666667%
Execution blocked: no
Execution blocker defects: none
Accuracy bounds: 33.333333% to 66.666667%

Flows: 1 correct, 1 incorrect, 1 not evaluable, 3 total

| Flow | Type | Status | Noncritical deviations |
|---|---|---|---:|
| BF-1 | main | incorrect | 0 |
| AF-1 | alternative | correct | 0 |
| EF-1 | exception | not_evaluable | 0 |

{"category": "application", "affected_targets": "BF-1, EF-1", "reason": "Hardcoded baseURL causes connection refusal.", "impact": "BF-1 is incorrect; EF-1 is not_evaluable."}

## Observation trace

- obs-bf-1-initial-01 / BF-1: 2026-10-26T01:03:05+07:00 to 2026-10-26T01:03:30+07:00; incomplete; entry http://localhost:8086/?sessionId=33333333-4444-5555-6666-777777777777; end Go Live button is disabled because state is null due to network connection refusal to localhost:3000; live session cannot be rendered
  1. Load broadcaster preview UI and observe Go Live button state -> Broadcaster preview loaded, but Go Live button is permanently disabled with disabled=true because getSessionState failed (entry, BF-1.1)
  2. Attempt to trigger stream-control request from UI -> Start button cannot be clicked (disabled=true); client attempted fetch to http://localhost:3000 and failed with connection refusal (BF-1.2)
  3. Check terminal outcome of live session rendering -> Live session is not rendered and starting state is not reached because stream-control request was never submitted (terminal_outcome)
- obs-af-1-initial-01 / AF-1: 2026-10-26T01:03:32+07:00 to 2026-10-26T01:03:40+07:00; completed; entry http://localhost:8086/?sessionId=33333333-4444-5555-6666-777777777777; end Session menu opened displaying Broadcaster settings and Invite participants
  1. Load broadcaster preview and observe session menu toggle control -> Broadcaster preview displayed with visible menu button (aria-label='Open broadcaster session menu') (entry)
  2. Host clicks menu button before starting stream -> Menu button clicked, aria-expanded toggles to true, opening broadcaster-menu (branch, AF-1.1a)
  3. Client displays available broadcaster actions in the opened session menu -> broadcaster-menu displays Broadcaster settings and Invite participants action items (AF-1.1b, terminal_outcome)
- obs-ef-1-initial-01 / EF-1: 2026-10-26T01:03:42+07:00 to 2026-10-26T01:03:50+07:00; incomplete; entry http://localhost:8086/?sessionId=33333333-4444-5555-6666-777777777777; end Start request cannot be submitted from UI to trigger start failure; branch condition unreachable
  1. Load broadcaster preview UI -> Broadcaster preview loaded with video preview section visible (entry)
  2. Attempt to trigger stream start failure branch -> Stream start request cannot be dispatched from the UI because the Go Live button is disabled (branch, EF-1.3a)
  3. Check technical failure state handling for stream start failure -> Stream start failure handling unreached from UI interaction path (EF-1.3b, terminal_outcome)

Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input.
