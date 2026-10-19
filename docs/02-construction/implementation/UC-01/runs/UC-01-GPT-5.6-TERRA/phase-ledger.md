# UC phase ledger

UC: `UC-01`; run: `UC-01-GPT-5.6-TERRA`

Machine authority: phase-ledger.json. Each turn belongs to one phase.

| Phase | Status | First turn | Measurement boundary (excluded) |
|---|---|---|---|
| prompt_generation | closed | 01a15247-53d9-7e70-9ff1-1caaf1de3526 | 01a15253-b138-72b2-b68c-dd9645c2c110 |
| source_generation | closed | 01a1525d-33f5-77f2-96ae-c7d1b490a106 | 01a15266-0563-79e1-9cbc-dbb6729e9b06 |
| repair | skipped |  |  |

Workflow: finalized

## Measurements

All measurement turns are excluded from phase and workflow metrics.

- `01a15253-b138-72b2-b68c-dd9645c2c110`: close-phase:prompt_generation; last selected turn `01a15247-53d9-7e70-9ff1-1caaf1de3526`; evidence `sha256:e1f92f737774fd01a2a6a79b2ef754a5172cb52743b162747f342f8960ee4f01`
- `01a15266-0563-79e1-9cbc-dbb6729e9b06`: close-phase:source_generation; last selected turn `01a1525d-33f5-77f2-96ae-c7d1b490a106`; evidence `sha256:bf8a27cae5984ec0cc7babf4a8ffc08057c40a53665b0b07c6aacff4642fb3d0`
- `01a1532c-a90c-7a90-ba04-f72de9e5a8dc`: finalize-workflow; last selected turn `01a1525d-33f5-77f2-96ae-c7d1b490a106`; evidence `sha256:bf8a27cae5984ec0cc7babf4a8ffc08057c40a53665b0b07c6aacff4642fb3d0`
