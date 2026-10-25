## Observed workflow metrics

Status: finalized

| Scope | Input | Cached input | Output | Reasoning output | Total | Duration seconds | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 686129 | 644096 | 5890 | 1854 | 692019 | 120.295 | 197.03 | 1 | 15 |
| source_generation | 1097190 | 1062656 | 8539 | 3015 | 1105729 | 91.449 | 231.594 | 1 | 12 |
| repair | 2872096 | 2821120 | 8812 | 1563 | 2880908 | 116.939 | 224.714 | 2 | 18 |
| workflow | 5468105 | 5302784 | 25454 | 7129 | 5493559 | 328.683 | 736.724 | 7 | 51 |

Cached input is included in input; reasoning output is included in output.
Duration seconds sum captured work intervals. Wall-clock seconds sum rollout durations of the same turns as tokens. Waiting between turns and measurement/report/export turns are excluded; Allow/Deny waits within selected turns are included.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts cover each whole turn by semantic phase label. Wall-clock seconds use that same label; duration seconds cover captured intervals under timing_phase.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Wall-clock seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| configuration_and_approval | 812690 | 774912 | 2213 | 697 | 814903 | 83.386 | 3 | 6 |
| prompt_generation | 686129 | 644096 | 5890 | 1854 | 692019 | 197.03 | 1 | 15 |
| repair | 2872096 | 2821120 | 8812 | 1563 | 2880908 | 224.714 | 2 | 18 |
| source_generation | 1097190 | 1062656 | 8539 | 3015 | 1105729 | 231.594 | 1 | 12 |

| Turn | Token label | Timing bucket | Duration seconds | Wall-clock seconds | Reason |
|---|---|---|---:|---:|---|
| 01a1724f-b2c1-70b1-8f91-03abb9695311 | configuration_and_approval | configuration_and_approval | 0 | 13.89 | UC-01 prompt-generation request stopped at preflight because the pinned configuration checksum did not validate; no Draft generation execution occurred. |
| 01a17259-8cd5-77d2-95ea-a4d88b144c9e | configuration_and_approval | configuration_and_approval | 0 | 11.481 | UC-01 prompt-generation request stopped at preflight because the database baseline fingerprint did not validate; no Draft generation execution occurred. |
| 01a17260-5817-76e0-9390-e625de9e034b | prompt_generation | prompt_generation | 120.295 | 197.03 | Generated, persisted, and contract-validated the UC-01 coding-prompt Draft; its prompt-generation start and end segments were captured. |
| 01a17269-f04c-7b80-9c21-b14b6fa3a86a | source_generation | source_generation | 91.449 | 231.594 | Implemented the approved UC-01 local pre-join preview frontend and captured the source-generation start and end segments; the operation then reported a source-provenance evidence blocker. |
| 01a17299-b000-7a52-8dd9-134f167493b8 | repair | repair | 52.457 | 100.182 | Generated the complete validated repair prompt set with captured repair sub-prompt timing. |
| 01a1729b-f1be-76f0-8c0a-12861a028997 | configuration_and_approval | configuration_and_approval | 0 | 58.015 | Repair authorization attempt was blocked before correction by changed initial evidence. |
| 01a172b2-1810-7953-9a9c-eeb7b9edf93e | repair | repair | 64.482 | 124.532 | Executed the authorized repair correction and integrated verification with captured repair source-correction timing. |

Timing protocol: `generation_execution_with_repair_audit_v2`.

Repair seconds include sub-prompt generation, integrated BR/flow/runtime verification and final evidence persistence. A turn with core execution must retain that core token label.

Workflow duration seconds = Prompt execution + first-pass Source execution + the two Repair activities. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from duration seconds. Eligible auxiliary turns contribute tokens and wall-clock time to workflow. Pending/missing duration seconds are N/A, not zero. Workflow wall-clock covers selected completed turns to date; it is final only when workflow status is finalized.
