## Observed workflow metrics

Status: finalized

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 813060 | 754176 | 6186 | 1477 | 819246 | 155.721 | 218.45 | 1 | 17 |
| source_generation | 1725169 | 1679872 | 15742 | 3614 | 1740911 | 171.936 | 386.117 | 1 | 17 |
| repair | 4617800 | 4440832 | 11061 | 3515 | 4628861 | 219.038 | 441.113 | 2 | 27 |
| workflow | 8364961 | 8060672 | 34924 | 9519 | 8399885 | 546.695 | 1155.953 | 5 | 68 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| configuration_and_approval | 1208932 | 1185792 | 1935 | 913 | 1210867 | 110.273 | 1 | 7 |
| prompt_generation | 813060 | 754176 | 6186 | 1477 | 819246 | 218.45 | 1 | 17 |
| repair | 4617800 | 4440832 | 11061 | 3515 | 4628861 | 441.113 | 2 | 27 |
| source_generation | 1725169 | 1679872 | 15742 | 3614 | 1740911 | 386.117 | 1 | 17 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a177e8-95ee-7ea2-a5a5-e03c0eb4e64c | prompt_generation | prompt_generation | 155.721 | 218.45 | Generated and validated the UC-04 coding-prompt Draft, including its captured prompt execution interval. |
| 01a177ee-83c3-7e40-9c55-d51f616bbb8d | source_generation | source_generation | 171.936 | 386.117 | Implemented the UC-04 approved prompt in finalsource, captured the source execution interval, and ran permitted production builds. |
| 01a1786d-0e6e-7511-bf75-81aa1a9ad5a0 | repair | repair | 74.359 | 160.688 | Generated and validated the complete repair sub-prompt set with the captured repair sub-prompt interval. |
| 01a17872-a6ec-7013-8ca0-f6c3f6b6c1f0 | configuration_and_approval | configuration_and_approval | 0 | 110.273 | Validated repair inputs and attempted repair authorization; no correction segment was captured or source mutation performed. |
| 01a1788b-63fd-74a1-8cbc-b606064d0bdf | repair | repair | 144.679 | 280.425 | Executed the repair correction, container rebuild, integrated verification, and captured repair source-correction interval. |

Timing protocol: `generation_execution_with_repair_audit_v2`.

Repair seconds include sub-prompt generation, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + the two Repair activities. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
