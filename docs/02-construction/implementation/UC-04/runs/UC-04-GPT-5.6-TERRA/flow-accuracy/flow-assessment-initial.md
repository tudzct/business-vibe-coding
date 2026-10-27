# Flow accuracy: flow-assessment-initial

Status: scored
Rubric: completion-critical-flow-runtime-v2
Source revision: sha256:c81fd74c8a89df1158fd59f21a43a669c4ac92404194934a9fb9b9f38873cdea
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

- obs-bf-1 / BF-1: 2026-10-26T20:13:17+07:00 to 2026-10-26T20:13:19+07:00; completed; entry http://127.0.0.1:8086/?sessionId=11111111-1111-4111-8111-111111111111; end Live stream status is ENDED, confirmation closed, UI displays Stream ended.
  1. Host opens BroadcasterLivePreview and clicks End button -> End stream action is opened, triggering confirmation dialog display (entry, BF-1.1)
  2. Client displays confirmation dialog -> Confirmation dialog 6007:87451 displayed (BF-1.2)
  3. Host clicks confirm End button in dialog -> Action confirmed by host (BF-1.3)
  4. Client posts STOP command to backend -> POST request sent with action STOP (BF-1.4)
  5. Backend returns HTTP 200 OK with ended stream representation and database updates -> Stream representation returned with status ENDED and version incremented in database (BF-1.5)
  6. Client updates state from response and displays post-stream interface -> Dialog closed, status label shows Stream ended, End button disabled/hidden (BF-1.6, terminal_outcome)
- obs-af-1 / AF-1: 2026-10-26T20:13:19+07:00 to 2026-10-26T20:13:20+07:00; completed; entry http://127.0.0.1:8086/?sessionId=11111111-1111-4111-8111-111111111111; end Confirmation dialog closed, live stream remains LIVE with all controls active.
  1. Host clicks End button -> End stream action opened (entry, BF-1.1)
  2. Client displays confirmation dialog -> Confirmation dialog 6007:87451 displayed (BF-1.2)
  3. Host clicks Cancel button in confirmation dialog -> Host cancels confirmation (branch, AF-1.1)
  4. Client closes dialog and restores live session interface -> Confirmation dialog removed from DOM, live interface restored, no stop request sent (AF-1.2, terminal_outcome)
- obs-ef-1 / EF-1: 2026-10-26T20:13:20+07:00 to 2026-10-26T20:13:21+07:00; completed; entry http://127.0.0.1:8086/?sessionId=11111111-1111-4111-8111-111111111111; end Error banner displayed, current session view maintained.
  1. Host opens End stream action -> End stream action opened (entry, BF-1.1)
  2. Confirmation dialog presented -> Dialog rendered (BF-1.2)
  3. Host confirms end action -> Confirmed by host (BF-1.3)
  4. Client submits stop request with stale version 999 -> POST request sent (BF-1.4)
  5. Backend rejects stop request with HTTP 409 Conflict -> System cannot complete stop request, returns error 409 (branch, EF-1.1)
  6. Client displays returned failure message while keeping current session view -> Error message banner rendered, session preview preserved (EF-1.2, terminal_outcome)

Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input.
