## Observed workflow metrics

Status: finalized

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 917775 | 854528 | 6748 | 1514 | 924523 | 169.024 | 264.44 | 1 | 21 |
| source_generation | 1781015 | 1729024 | 11064 | 3851 | 1792079 | 103.42 | 404.59 | 1 | 17 |
| repair | 6153612 | 6076416 | 12515 | 4642 | 6166127 | 325.117 | 507.424 | 2 | 34 |
| workflow | 8852402 | 8659968 | 30327 | 10007 | 8882729 | 597.561 | 1176.454 | 4 | 72 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 917775 | 854528 | 6748 | 1514 | 924523 | 264.44 | 1 | 21 |
| repair | 6153612 | 6076416 | 12515 | 4642 | 6166127 | 507.424 | 2 | 34 |
| source_generation | 1781015 | 1729024 | 11064 | 3851 | 1792079 | 404.59 | 1 | 17 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a17b79-3ffd-7f42-8cbb-c7f246b0d531 | prompt_generation | prompt_generation | 169.024 | 264.44 | Generated and contract-validated the UC-05 Draft, including the captured prompt execution interval. |
| 01a17b82-e4ee-7591-92f5-2fed9087e5a9 | source_generation | source_generation | 103.42 | 404.59 | Implemented the approved UC-05 source changes and completed the captured source-generation interval. |
| 01a17be2-19e0-72c3-8c4f-779ec77e06e1 | repair | repair | 79.035 | 123.218 | Generated repair sub-prompts for initial defects |
| 01a17c12-6390-7f62-b742-2baddd24dc9f | repair | repair | 246.082 | 384.206 | Executed repair source correction and verification |

Timing protocol: `generation_execution_with_repair_audit_v2`.

Repair seconds include sub-prompt generation, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + the two Repair activities. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
