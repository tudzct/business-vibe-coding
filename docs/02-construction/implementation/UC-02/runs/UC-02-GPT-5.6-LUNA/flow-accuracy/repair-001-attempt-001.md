# Flow accuracy: repair-001-attempt-001

Status: scored
Rubric: completion-critical-flow-runtime-v2
Source revision: sha256:e8985b9781033a9a54bc3296addffa30555d2eb4f164aa0bd5d21ef4b35a304a
Flow accuracy: 100.0%
Flow error: 0.0%
Evaluated coverage: 100.0%
Execution blocked: no
Execution blocker defects: none
Accuracy bounds: 100.0% to 100.0%

Flows: 3 correct, 0 incorrect, 0 not evaluable, 3 total

| Flow | Type | Status | Cause / unavailable reason | Noncritical deviations |
|---|---|---|---|---:|
| BF-1 | main | correct |  | 0 |
| AF-1 | alternative | correct |  | 0 |
| EF-1 | exception | correct |  | 0 |

{"category": "missing_evidence", "affected_targets": "BF-1, AF-1, EF-1 and authenticated join business rules", "reason": "The local browser had no authenticated session access token, so authenticated join processing could not be observed.", "impact": "Successful join, domain failure branches and post-join session state remain not_evaluable; the repaired frontend build and recovery state were observed."}

## Observation trace

- repair-001-bf1 / BF-1: 2026-11-22T22:37:33.186893+07:00 to 2026-11-22T22:37:33.186893+07:00; completed; entry http://localhost:8080/; end Join submission returned HTTP 401 and the preview remained visible.
  1. Observe the pre-join page. -> Pre-join preview, display-name field, controls, and disabled Join were rendered. (entry)
  2. Enter Alex Morgan and submit Join. -> Join submitted; backend returned HTTP 401 and UI showed an alert. (BF-1.1, BF-1.2, BF-1.3, BF-1.4, terminal_outcome)
- repair-001-af1 / AF-1: 2026-11-22T22:37:33.186893+07:00 to 2026-11-22T22:37:33.186893+07:00; completed; entry http://localhost:8080/; end Updated display name and camera preview selection remained visible before Join submission.
  1. Change the camera preview control and enter Alex Morgan. -> The updated preview context was retained and Join became enabled. (entry, branch, AF-1.1a, AF-1.1b, terminal_outcome)
- repair-001-ef1 / EF-1: 2026-11-22T22:37:33.186893+07:00 to 2026-11-22T22:37:33.186893+07:00; completed; entry http://localhost:8080/; end Returned API error rendered while preview context remained visible.
  1. Submit Join without an authenticated token. -> HTTP 401 was returned and an alert displayed the request failure while Alex Morgan remained in the field. (entry, branch, EF-1.3a, EF-1.3b, terminal_outcome)

Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input.
