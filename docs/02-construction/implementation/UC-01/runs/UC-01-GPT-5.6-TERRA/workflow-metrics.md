## Observed workflow metrics

Status: finalized

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1203897 | 1138176 | 9501 | 2810 | 1213398 | 80.847 | 499.931 | 1 | 21 |
| source_generation | 2399909 | 2347520 | 16294 | 3974 | 2416203 | 168.651 | 470.944 | 1 | 21 |
| repair | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| workflow | 3603806 | 3485696 | 25795 | 6784 | 3629601 | 249.498 | 970.875 | 2 | 42 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1203897 | 1138176 | 9501 | 2810 | 1213398 | 499.931 | 1 | 21 |
| source_generation | 2399909 | 2347520 | 16294 | 3974 | 2416203 | 470.944 | 1 | 21 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a15247-53d9-7e70-9ff1-1caaf1de3526 | prompt_generation | prompt_generation | 80.847 | 499.931 | Generated and validated the UC-01 Draft coding prompt within the captured prompt-generation interval. |
| 01a1525d-33f5-77f2-96ae-c7d1b490a106 | source_generation | source_generation | 168.651 | 470.944 | Implemented and production-built the UC-01 first-pass React source within the captured source-generation interval. |

Timing protocol: `generation_execution_with_repair_audit_v2`.

Repair seconds include sub-prompt generation, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + the two Repair activities. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.

Repair skipped: All frozen BRs and flows pass; repair unnecessary.
