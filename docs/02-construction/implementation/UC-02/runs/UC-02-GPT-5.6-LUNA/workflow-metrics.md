## Observed workflow metrics

Status: open

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1112685 | 1030016 | 10396 | 1914 | 1123081 | 175.196 | 273.372 | 1 | 18 |
| source_generation | 1739827 | 1699328 | 6459 | 2127 | 1746286 | 55.769 | 176.166 | 1 | 13 |
| sub_prompt_generation | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| repair | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| workflow | 2852512 | 2729344 | 16855 | 4041 | 2869367 | N/A | 449.538 | 2 | 31 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1112685 | 1030016 | 10396 | 1914 | 1123081 | 273.372 | 1 | 18 |
| source_generation | 1739827 | 1699328 | 6459 | 2127 | 1746286 | 176.166 | 1 | 13 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a20704-60fc-7d23-8d07-1f93b12b52ef | prompt_generation | prompt_generation | 175.196 | 273.372 | Generated and validated the UC-02 coding prompt Draft. |
| 01a2070c-4734-7b31-91a4-a4652315a6e8 | source_generation | source_generation | 55.769 | 176.166 | Implemented the approved UC-02 source changes and captured source-generation timing. |

Timing protocol: `generation_execution_with_separate_sub_prompt_and_repair_v3`.

Sub-prompt Generation seconds cover the complete fixed prompt set. Repair seconds cover source correction, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + Sub-prompt Generation + Repair. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
