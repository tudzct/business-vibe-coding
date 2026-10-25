# Flow accuracy: assessment-initial

Status: repair_required
Rubric: completion-critical-flow-runtime-v2
Source revision: sha256:2eeba8d1165e818a68cec08200c8e6f54053ec39c8890e204a5411007b58279c
Flow accuracy: 0.0%
Flow error: 100.0%
Evaluated coverage: 100.0%
Execution blocked: yes
Execution blocker defects: DEF-UC02-01
Accuracy bounds: 0.0% to 0.0%

Flows: 0 correct, 3 incorrect, 0 not evaluable, 3 total

| Flow | Type | Status | Noncritical deviations |
|---|---|---|---:|
| BF-1 | main | incorrect | 0 |
| AF-1 | alternative | incorrect | 0 |
| EF-1 | exception | incorrect | 0 |

{"category": "application", "affected_targets": "all", "reason": "Backend Docker image failed to build due to TypeScript compilation error TS2352 in sessions.service.ts", "impact": "Integrated runtime unavailable; all flows blocked"}

## Observation trace


Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input.
