## Observed workflow metrics

Status: finalized

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 610134 | 557312 | 6112 | 1384 | 616246 | 187.9 | 256.251 | 1 | 14 |
| source_generation | 1987325 | 1935360 | 21050 | 4299 | 2008375 | 735.419 | 1236.776 | 1 | 19 |
| repair | 3953423 | 3911424 | 5866 | 741 | 3959289 | 118.362 | 219.105 | 2 | 19 |
| workflow | 8686153 | 8510720 | 35511 | 7228 | 8721664 | 1041.681 | 1813.096 | 6 | 61 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| configuration_and_approval | 2135271 | 2106624 | 2483 | 804 | 2137754 | 100.964 | 2 | 9 |
| prompt_generation | 610134 | 557312 | 6112 | 1384 | 616246 | 256.251 | 1 | 14 |
| repair | 3953423 | 3911424 | 5866 | 741 | 3959289 | 219.105 | 2 | 19 |
| source_generation | 1987325 | 1935360 | 21050 | 4299 | 2008375 | 1236.776 | 1 | 19 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a17347-e614-7f03-8a6f-8f784ff3b5d6 | prompt_generation | prompt_generation | 187.9 | 256.251 | Generated and validated the UC-02 coding-prompt Draft; the captured prompt-generation interval is contained in this turn. |
| 01a17352-9dd6-7763-95c1-39b2128913bd | source_generation | source_generation | 735.419 | 1236.776 | Implemented the approved UC-02 source and completed backend and frontend production builds; the captured source-generation interval is contained in this turn. |
| 01a17381-e3d1-76d3-9ffb-0e9d9f72712c | repair | repair | 40.983 | 81.819 | Generated and validated the complete initial repair-prompt set; repair timestamps are absent from the active canonical phase ledger after the run reset. |
| 01a173d7-57b5-7551-9c74-21d9e66e9ffe | configuration_and_approval | configuration_and_approval | 0 | 74.252 | Validated the repair prerequisites and attempted authorization; no core repair execution interval was captured. |
| 01a173dc-4eff-7a82-b99e-1c09ae44bec8 | configuration_and_approval | configuration_and_approval | 0 | 26.712 | Validated a conflicting existing repair artifact before any repair prompt generation or capture boundary; no core execution occurred. |
| 01a173e6-78ae-7a62-9458-565f6adc47c5 | repair | repair | 77.379 | 137.286 | Executed the authorized repair verification cycle; repair timestamps are absent from the active canonical phase ledger after the run reset. |

Timing protocol: `generation_execution_with_repair_audit_v2`.

Repair seconds include sub-prompt generation, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + the two Repair activities. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
