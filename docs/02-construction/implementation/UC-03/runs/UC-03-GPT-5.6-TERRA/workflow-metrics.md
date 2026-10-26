## Observed workflow metrics

Status: finalized

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 543929 | 493312 | 5932 | 1428 | 549861 | 110.577 | 168.271 | 1 | 13 |
| source_generation | 4510905 | 4425088 | 16297 | 3554 | 4527202 | 125.482 | 445.765 | 1 | 36 |
| repair | 4711246 | 4651008 | 10452 | 1343 | 4721698 | 210.035 | 323.808 | 2 | 21 |
| workflow | 13587559 | 13144704 | 40884 | 8963 | 13628443 | 446.094 | 1212.645 | 8 | 85 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| configuration_and_approval | 2623935 | 2393216 | 6883 | 2136 | 2630818 | 195.45 | 3 | 11 |
| prompt_generation | 543929 | 493312 | 5932 | 1428 | 549861 | 168.271 | 1 | 13 |
| repair | 4711246 | 4651008 | 10452 | 1343 | 4721698 | 323.808 | 2 | 21 |
| runtime_verification | 1197544 | 1182080 | 1320 | 502 | 1198864 | 79.351 | 1 | 4 |
| source_generation | 4510905 | 4425088 | 16297 | 3554 | 4527202 | 445.765 | 1 | 36 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a17400-5841-7871-a18b-100e76b6dd71 | prompt_generation | prompt_generation | 110.577 | 168.271 | Generated and validated the UC-03 coding-prompt Draft within the captured prompt-generation interval. |
| 01a17410-53dd-74a3-90c8-e4b917d89333 | source_generation | source_generation | 125.482 | 445.765 | Implemented and verified the UC-03 approved live-stream source changes within captured source-generation intervals. |
| 01a17462-8571-7f12-a65a-8e9577914c92 | repair | repair | 73.745 | 122.709 | Generated the complete bug-fixing sub-prompt set within the captured sub_prompt_generation interval. |
| 01a17464-f749-7f52-9498-bb06bafce71a | configuration_and_approval | configuration_and_approval | 0 | 132.022 | Recorded repair authorization and preflight validation; blocked before source mutation. |
| 01a1748a-e901-7f92-b098-8b207768904e | configuration_and_approval | configuration_and_approval | 0 | 6.867 | Reported terminal blocked state prior to sub-prompt revision and reset. |
| 01a17743-a7d5-79b2-ae51-b8e6b24d7961 | configuration_and_approval | configuration_and_approval | 0 | 56.561 | Executed repair preflight checks; database baseline failed before repair start. |
| 01a17746-7d33-7cd0-81c7-92f0a5c9e634 | repair | repair | 136.29 | 201.099 | Implemented source corrections and verified production builds within the captured source_correction interval. |
| 01a17750-45ce-7142-989c-b507a5417724 | runtime_verification | runtime_verification | 0 | 79.351 | Captured runtime observations and assembled final assessment artifacts. |

Timing protocol: `generation_execution_with_repair_audit_v2`.

Repair seconds include sub-prompt generation, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + the two Repair activities. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
