# Flow accuracy: initial-audit-01

Status: not_evaluable
Rubric: completion-critical-flow-runtime-v2
Source revision: sha256:176b543fbf7c3763e2be0e2bf43587d6764be92fcfae41d929a6334325b4bfd6
Flow accuracy: N/A
Flow error: N/A
Evaluated coverage: 66.666667%
Execution blocked: no
Execution blocker defects: none
Accuracy bounds: 66.666667% to 100.0%

Flows: 2 correct, 0 incorrect, 1 not evaluable, 3 total

| Flow | Type | Status | Cause / unavailable reason | Noncritical deviations |
|---|---|---|---|---:|
| BF-1 | main | correct |  | 0 |
| AF-1 | alternative | correct |  | 0 |
| EF-1 | exception | not_evaluable | Automated browser harness auto-grants media permissions | 0 |


## Observation trace

- obs-uc01-bf1 / BF-1: 2026-11-22T23:57:26.434304+07:00 to 2026-11-22T23:57:26.434304+07:00; completed; entry http://localhost:8080/; end Live preview and Go Live ready
  1. Open http://localhost:8080/, test name validation, request permissions -> Pre-join UI rendered, permissions granted, live preview active (entry, BF-1.1, BF-1.2, BF-1.3, BF-1.4, BF-1.5, terminal_outcome)
- obs-uc01-af1 / AF-1: 2026-11-22T23:57:26.434304+07:00 to 2026-11-22T23:57:26.434304+07:00; completed; entry http://localhost:8080/; end Camera off and mic muted
  1. Click Turn camera off and Mute microphone -> Preview returned to avatar fallback and Microphone muted badge (entry, branch, AF-1.3a, AF-1.3b, terminal_outcome)
- obs-uc01-ef1 / EF-1: 2026-11-22T23:57:26.434304+07:00 to 2026-11-22T23:57:26.434304+07:00; completed; entry http://localhost:8080/; end Not evaluable due to auto-grant
  1. Attempt to trigger permission denial -> Harness auto-granted permissions; denial unobservable (entry, branch, EF-1.4a, EF-1.4b, terminal_outcome)

Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input.
