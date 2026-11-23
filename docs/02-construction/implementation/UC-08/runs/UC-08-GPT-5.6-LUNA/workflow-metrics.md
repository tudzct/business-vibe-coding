## Observed workflow metrics

Status: open

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1029770 | 943488 | 8449 | 1161 | 1038219 | 139.403 | 231.063 | 1 | 17 |
| source_generation | 2736236 | 2693120 | 9015 | 866 | 2745251 | 131.855 | 243.415 | 1 | 20 |
| sub_prompt_generation | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| repair | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| workflow | 3766006 | 3636608 | 17464 | 2027 | 3783470 | N/A | 474.478 | 2 | 37 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1029770 | 943488 | 8449 | 1161 | 1038219 | 231.063 | 1 | 17 |
| source_generation | 2736236 | 2693120 | 9015 | 866 | 2745251 | 243.415 | 1 | 20 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a20762-fb3a-7011-b532-07ceca0e6bbd | prompt_generation | prompt_generation | 139.403 | 231.063 | Generated and validated the UC-08 coding prompt Draft. |
| 01a20767-a748-7940-a2c8-315f5933beb7 | source_generation | source_generation | 131.855 | 243.415 | Implemented the approved UC-08 backend and frontend source changes. |

Timing protocol: `generation_execution_with_separate_sub_prompt_and_repair_v3`.

Sub-prompt Generation seconds cover the complete fixed prompt set. Repair seconds cover source correction, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + Sub-prompt Generation + Repair. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
