## Observed workflow metrics

Status: open

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1105556 | 1025664 | 10107 | 1397 | 1115663 | 178.745 | 269.642 | 1 | 19 |
| source_generation | 1663486 | 1627264 | 7220 | 1403 | 1670706 | 96.503 | 196.661 | 1 | 12 |
| sub_prompt_generation | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| repair | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| workflow | 3079090 | 2957568 | 17748 | 2883 | 3096838 | N/A | 480.536 | 3 | 33 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| configuration_and_approval | 310048 | 304640 | 421 | 83 | 310469 | 14.233 | 1 | 2 |
| prompt_generation | 1105556 | 1025664 | 10107 | 1397 | 1115663 | 269.642 | 1 | 19 |
| source_generation | 1663486 | 1627264 | 7220 | 1403 | 1670706 | 196.661 | 1 | 12 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a2037c-1003-7203-bbb3-fef71f4882ce | prompt_generation | prompt_generation | 178.745 | 269.642 | Generated and persisted the UC-02 coding prompt Draft |
| 01a20381-dba0-76a3-a1f0-086c79148797 | configuration_and_approval | configuration_and_approval | 0 | 14.233 | Source-generation request was blocked by a non-current gate before execution |
| 01a20383-09b5-7b30-b9fc-e53bc7c906d6 | source_generation | source_generation | 96.503 | 196.661 | Implemented the UC-02 approved coding prompt under finalsource |

Timing protocol: `generation_execution_with_separate_sub_prompt_and_repair_v3`.

Sub-prompt Generation seconds cover the complete fixed prompt set. Repair seconds cover source correction, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + Sub-prompt Generation + Repair. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
