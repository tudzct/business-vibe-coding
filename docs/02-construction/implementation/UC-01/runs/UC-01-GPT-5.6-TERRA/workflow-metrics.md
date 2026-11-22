## Observed workflow metrics

Status: open

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1848809 | 1733376 | 11994 | 3357 | 1860803 | 228.944 | 397.737 | 1 | 28 |
| source_generation | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| sub_prompt_generation | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| repair | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| workflow | 1848809 | 1733376 | 11994 | 3357 | 1860803 | N/A | 397.737 | 1 | 28 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1848809 | 1733376 | 11994 | 3357 | 1860803 | 397.737 | 1 | 28 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a202f5-72ee-7722-89c2-8281b248426e | prompt_generation | prompt_generation | 228.944 | 397.737 | Generated and persisted the UC-01 coding prompt draft. |

Timing protocol: `generation_execution_with_separate_sub_prompt_and_repair_v3`.

Sub-prompt Generation seconds cover the complete fixed prompt set. Repair seconds cover source correction, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + Sub-prompt Generation + Repair. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
