# Flow accuracy: UC01-GPT56SOL-MEDIUM-FULL-R1-final-20260913

Status: not_evaluable
Rubric: completion-critical-flow-v1
Source revision: sha256:a951d8f9760544c3372a98d10a706e70998e9d93959330c91ddca05cf7bd4fd0
Flow accuracy: N/A
Flow error: N/A
Evaluated coverage: 0.0%
Accuracy bounds: 0.0%–100.0%

Flows: 0 correct, 0 incorrect, 4 not evaluable, 4 total

| Flow | Type | Status | Noncritical deviations |
|---|---|---|---:|
| BF-1 | main | not_evaluable | 0 |
| AF-1 | alternative | not_evaluable | 0 |
| AF-2 | alternative | not_evaluable | 0 |
| EF-1 | exception | not_evaluable | 0 |

Final source was rebuilt into Compose images; frontend /register returned HTTP 200, while API proxy health returned 502 because backend MySQL authentication received error 1045.
Computer-use exposed no browser or app surface; no connected user action, request, persistence, session, navigation or exception-branch outcome could be observed.
The initial-stage researcher-provided 100% flow verdict is retained with its original source provenance and is not relabeled as a final-source observation.
