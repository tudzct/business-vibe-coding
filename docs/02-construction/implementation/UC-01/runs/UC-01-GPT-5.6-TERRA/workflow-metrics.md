## Observed workflow metrics

Status: open

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1062579 | 980224 | 10267 | 2673 | 1072846 | 219.018 | 366.837 | 1 | 18 |
| source_generation | 1203546 | 1175808 | 8915 | 1787 | 1212461 | 166.507 | 303.305 | 1 | 10 |
| repair | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| workflow | 2266125 | 2156032 | 19182 | 4460 | 2285307 | N/A | 670.142 | 2 | 28 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1062579 | 980224 | 10267 | 2673 | 1072846 | 366.837 | 1 | 18 |
| source_generation | 1203546 | 1175808 | 8915 | 1787 | 1212461 | 303.305 | 1 | 10 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a1f1c2-3044-7b72-88c6-a4aa9a0d9a80 | prompt_generation | prompt_generation | 219.018 | 366.837 | Generated and validated the UC-01 coding-prompt Draft, including its captured prompt execution interval. |
| 01a1f1d8-2c6a-71a2-8947-8491c8faf032 | source_generation | source_generation | 166.507 | 303.305 | Implemented the UC-01 client-local pre-join preview and captured the first-pass source-generation interval. |

Timing protocol: `generation_execution_with_repair_audit_v2`.

Repair seconds include sub-prompt generation, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + the two Repair activities. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
