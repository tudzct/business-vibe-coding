## Observed workflow metrics

Status: open

| Scope | Input | Cached input | Output | Reasoning output | Total | Seconds | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| prompt_generation | 1593026 | 1554816 | 10170 | 2844 | 1603196 | 88.49 | 1 | 23 |
| source_generation | 3398530 | 3352704 | 23010 | 8848 | 3421540 | 341.681 | 1 | 24 |
| repair | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| workflow | 6987376 | 6818688 | 42733 | 15308 | 7030109 | N/A | 5 | 69 |

Cached input is included in input; reasoning output is included in output.
Seconds sum captured work intervals. Waiting between turns and measurement/report turns are excluded.
Model call count: unavailable (token usage updates are not model call evidence).

Tokens and turn/tool counts follow each turn's semantic phase label. Seconds follow timing_phase and the captured ledger; these scopes can differ.

### Token attribution by label

| Label | Input | Cached input | Output | Reasoning output | Total | Turns | Tool calls |
|---|---:|---:|---:|---:|---:|---:|---:|
| configuration_and_approval | 1730662 | 1668992 | 7885 | 3060 | 1738547 | 2 | 17 |
| dataset_resolution | 265158 | 242176 | 1668 | 556 | 266826 | 1 | 5 |
| prompt_generation | 1593026 | 1554816 | 10170 | 2844 | 1603196 | 1 | 23 |
| source_generation | 3398530 | 3352704 | 23010 | 8848 | 3421540 | 1 | 24 |

| Turn | Token label | Timing bucket | Reason |
|---|---|---|---|
| 01a09b13-9281-74d0-bec2-87281bc94df5 | configuration_and_approval | configuration_and_approval | Requested prompt generation stopped at read-only frozen UC path preflight |
| 01a09b15-d3f1-7512-8c6c-3629b7839d4b | dataset_resolution | dataset_resolution | Validated core inputs and stopped at missing configured Figma dataset pin |
| 01a09b17-a138-74a2-aafd-6041aab7c734 | prompt_generation | prompt_generation | Resolved researcher-selected newest Figma snapshot and generated/revised the Full Draft prompt |
| 01a09b2d-f102-7720-80f3-278932edc540 | configuration_and_approval | configuration_and_approval | Validated source activation and prepared schema proposal; source generation held for approval |
| 01a09b31-164e-79f0-8b99-c969bc3afb14 | source_generation | source_generation | Recorded schema approval and generated UC-01 first-pass backend/frontend source |

Workflow seconds = Prompt execution + first-pass Source execution + all Repair executions. Configuration, approvals, dataset resolution, separate audit/runtime and reporting are excluded from time. Their eligible tokens remain in workflow. Pending/missing generation time is N/A, not zero.
