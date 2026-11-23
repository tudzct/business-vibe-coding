## Observed workflow metrics

Status: open

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1241195 | 1154944 | 9171 | 1439 | 1250366 | 144.764 | 245.746 | 1 | 21 |
| source_generation | 2076949 | 2034560 | 9139 | 1253 | 2086088 | 147.491 | 230.323 | 1 | 15 |
| sub_prompt_generation | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| repair | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| workflow | 3318144 | 3189504 | 18310 | 2692 | 3336454 | N/A | 476.069 | 2 | 36 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1241195 | 1154944 | 9171 | 1439 | 1250366 | 245.746 | 1 | 21 |
| source_generation | 2076949 | 2034560 | 9139 | 1253 | 2086088 | 230.323 | 1 | 15 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a20775-5e62-7e20-ae6a-b750b23620c5 | prompt_generation | prompt_generation | 144.764 | 245.746 | Generate and validate the UC-09 coding prompt Draft |
| 01a2077a-e55a-7b43-99d0-5809767abcbe | source_generation | source_generation | 147.491 | 230.323 | Implement the approved UC-09 coding prompt in finalsource |

Timing protocol: `generation_execution_with_separate_sub_prompt_and_repair_v3`.

Sub-prompt Generation seconds cover the complete fixed prompt set. Repair seconds cover source correction, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + Sub-prompt Generation + Repair. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
