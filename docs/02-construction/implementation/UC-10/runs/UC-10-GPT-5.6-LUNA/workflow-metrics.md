## Observed workflow metrics

Status: open

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1191358 | 1104896 | 8336 | 1014 | 1199694 | 172.511 | 245.172 | 1 | 21 |
| source_generation | 3025234 | 2981632 | 11412 | 723 | 3036646 | 193.091 | 284.316 | 1 | 22 |
| sub_prompt_generation | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| repair | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| workflow | 4216592 | 4086528 | 19748 | 1737 | 4236340 | N/A | 529.488 | 2 | 43 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1191358 | 1104896 | 8336 | 1014 | 1199694 | 245.172 | 1 | 21 |
| source_generation | 3025234 | 2981632 | 11412 | 723 | 3036646 | 284.316 | 1 | 22 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a20797-a543-7111-8893-52a704595aa7 | prompt_generation | prompt_generation | 172.511 | 245.172 | Generated and validated the UC-10 coding prompt draft. |
| 01a2079c-9caa-78c3-8a84-553f2a0ccd9d | source_generation | source_generation | 193.091 | 284.316 | Implemented the approved UC-10 coding prompt under finalsource. |

Timing protocol: `generation_execution_with_separate_sub_prompt_and_repair_v3`.

Sub-prompt Generation seconds cover the complete fixed prompt set. Repair seconds cover source correction, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + Sub-prompt Generation + Repair. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
