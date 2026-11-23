# Flow accuracy: initial-audit-01

Status: repair_required
Rubric: completion-critical-flow-runtime-v2
Source revision: sha256:6f0ef4ddf5b41e3b8225c510e56c50e49f9780d15c5c8baf16254c6fb245abe6
Flow accuracy: 33.333333%
Flow error: 66.666667%
Evaluated coverage: 100.0%
Execution blocked: no
Execution blocker defects: none
Accuracy bounds: 33.333333% to 33.333333%

Flows: 1 correct, 2 incorrect, 0 not evaluable, 3 total

| Flow | Type | Status | Cause / unavailable reason | Noncritical deviations |
|---|---|---|---|---:|
| BF-1 | main | incorrect | DEF-UC02-AUTH-01 | 0 |
| AF-1 | alternative | incorrect | DEF-UC02-AUTH-01 | 0 |
| EF-1 | exception | correct |  | 0 |


## Observation trace

- obs-bf1 / BF-1: 2026-11-23T13:25:00+07:00 to 2026-11-23T13:25:20+07:00; incomplete; entry http://localhost:8080/; end Remained on Pre-join preview with Authentication required alert
  1. Enter display name Alice and click Join Now -> POST /api/v1/sessions/11111111-1111-4111-8111-111111111111/participants returned 401 Unauthorized (entry, BF-1.1, BF-1.2)
- obs-af1 / AF-1: 2026-11-23T13:25:25+07:00 to 2026-11-23T13:25:45+07:00; incomplete; entry http://localhost:8080/; end Remained on Pre-join preview with Authentication required alert
  1. Open preview menu, click Request permissions, click Join Now -> Media toggles remained disabled; Join Now returned 401 Unauthorized (entry, AF-1.1a, AF-1.1b)
- obs-ef1 / EF-1: 2026-11-23T13:25:50+07:00 to 2026-11-23T13:26:10+07:00; completed; entry http://localhost:8080/?sessionId=00000000-0000-0000-0000-000000000000; end Displayed Authentication required alert while preserving preview context
  1. Enter display name Alice and click Join Now on invalid session URL -> System rejected join and displayed error alert while preserving preview context (entry, branch, EF-1.3a, EF-1.3b, terminal_outcome)

Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input.
