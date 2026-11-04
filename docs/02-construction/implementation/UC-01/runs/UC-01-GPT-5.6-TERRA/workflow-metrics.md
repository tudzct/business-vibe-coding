## Observed workflow metrics

Status: open

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1005369 | 933120 | 10826 | 2895 | 1016195 | 169.6 | 310.282 | 1 | 21 |
| source_generation | 1578868 | 1537024 | 8773 | 1996 | 1587641 | 138.522 | 365.375 | 1 | 13 |
| repair | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| workflow | 2943361 | 2747904 | 20987 | 5198 | 2964348 | N/A | 744.791 | 3 | 37 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1005369 | 933120 | 10826 | 2895 | 1016195 | 310.282 | 1 | 21 |
| runtime_verification | 359124 | 277760 | 1388 | 307 | 360512 | 69.134 | 1 | 3 |
| source_generation | 1578868 | 1537024 | 8773 | 1996 | 1587641 | 365.375 | 1 | 13 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a1a10b-3124-7813-b137-83dd49e9cee4 | prompt_generation | prompt_generation | 169.6 | 310.282 | Generated the UC-01 Draft coding prompt, including validated input collection, Figma resolution, drafting, persistence, and contract validation. |
| 01a1a462-73d2-7f10-8c3e-2b92320f691b | runtime_verification | runtime_verification | 0 | 69.134 | The first source-generation request was blocked during required read-only source-stage preflight before any source-generation timestamp or source mutation. |
| 01a1a464-8a5e-7831-80a3-179c42096db4 | source_generation | source_generation | 138.522 | 365.375 | Implemented the approved UC-01 client-local join preview and captured the complete source-generation interval. |

Timing protocol: `generation_execution_with_repair_audit_v2`.

Repair seconds include sub-prompt generation, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + the two Repair activities. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
