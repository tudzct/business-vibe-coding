## Observed workflow metrics

Status: open

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 761419 | 688512 | 7348 | 997 | 768767 | 103.486 | 211.069 | 1 | 14 |
| source_generation | 2500887 | 2459520 | 8608 | 1467 | 2509495 | 95.842 | 231.148 | 1 | 20 |
| sub_prompt_generation | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| repair | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| workflow | 3262306 | 3148032 | 15956 | 2464 | 3278262 | N/A | 442.217 | 2 | 34 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 761419 | 688512 | 7348 | 997 | 768767 | 211.069 | 1 | 14 |
| source_generation | 2500887 | 2459520 | 8608 | 1467 | 2509495 | 231.148 | 1 | 20 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a207a7-bbab-7be0-8eac-c30e0755a30c | prompt_generation | prompt_generation | 103.486 | 211.069 | Generate and validate the UC-03 coding prompt Draft |
| 01a207ac-b8c6-7cc1-9cd2-6429b945d131 | source_generation | source_generation | 95.842 | 231.148 | Implement first-pass UC-03 source from the approved coding prompt |

Timing protocol: `generation_execution_with_separate_sub_prompt_and_repair_v3`.

Sub-prompt Generation seconds cover the complete fixed prompt set. Repair seconds cover source correction, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + Sub-prompt Generation + Repair. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
