## Observed workflow metrics

Status: open

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 956202 | 897664 | 8176 | 1422 | 964378 | 139.859 | 228.284 | 1 | 19 |
| source_generation | 1197919 | 1175680 | 7813 | 964 | 1205732 | 96.163 | 194.82 | 1 | 12 |
| sub_prompt_generation | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| repair | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| workflow | 2154121 | 2073344 | 15989 | 2386 | 2170110 | N/A | 423.104 | 2 | 31 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 956202 | 897664 | 8176 | 1422 | 964378 | 228.284 | 1 | 19 |
| source_generation | 1197919 | 1175680 | 7813 | 964 | 1205732 | 194.82 | 1 | 12 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a2041d-ec3a-7d80-b7cc-1c06e59410ae | prompt_generation | prompt_generation | 139.859 | 228.284 | Generate and validate the UC-01 coding prompt Draft |
| 01a20424-1dc0-7540-93a9-9af60d224da1 | source_generation | source_generation | 96.163 | 194.82 | Implement the approved UC-01 frontend source |

Timing protocol: `generation_execution_with_separate_sub_prompt_and_repair_v3`.

Sub-prompt Generation seconds cover the complete fixed prompt set. Repair seconds cover source correction, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + Sub-prompt Generation + Repair. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
