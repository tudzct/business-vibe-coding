# UC phase ledger

UC: `UC-03`; run: `UC-03-GPT-5.6-TERRA`

Machine authority: phase-ledger.json. Each turn belongs to one phase.

| Phase | Status | First turn | Measurement boundary (excluded) |
|---|---|---|---|
| prompt_generation | closed | 01a17400-5841-7871-a18b-100e76b6dd71 | 01a1740e-557e-7e72-ae11-9c0e8b89b6a2 |
| source_generation | closed | 01a17410-53dd-74a3-90c8-e4b917d89333 | 01a1742b-c892-7fd3-91f9-38f4b275e968 |
| repair | closed | 01a17462-8571-7f12-a65a-8e9577914c92 | 01a1775a-0000-7000-8000-000000000014 |

Workflow: finalized

## Measurements

All measurement turns are excluded from phase and workflow metrics.

- `01a1740e-557e-7e72-ae11-9c0e8b89b6a2`: close-phase:prompt_generation; last selected turn `01a17400-5841-7871-a18b-100e76b6dd71`; evidence `sha256:9dee50827f2e9c2a7b41ae3ef364ac91457d9a597dfb738698d2c90ec0d957d7`
- `01a1742b-c892-7fd3-91f9-38f4b275e968`: close-phase:source_generation; last selected turn `01a17410-53dd-74a3-90c8-e4b917d89333`; evidence `sha256:d4c73eccf2e70ba6a21dc48dc0dd3ad2f13e0241a6ce4a4bbb2609350e7d1709`
- `01a1775a-0000-7000-8000-000000000014`: finalize-workflow; last selected turn `01a17750-45ce-7142-989c-b507a5417724`; evidence `sha256:289e9883a378334c443a3872058f3d222e37760a7db813d3bf9bf24b3d03a08a`
