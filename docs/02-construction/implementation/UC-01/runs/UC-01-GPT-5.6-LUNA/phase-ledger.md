# UC phase ledger

UC: `UC-01`; run: `UC-01-GPT-5.6-LUNA`

Machine authority: phase-ledger.json. Each turn belongs to one phase.

| Phase | Status | First turn | Measurement boundary (excluded) |
|---|---|---|---|
| prompt_generation | closed | 01a202f5-72ee-7722-89c2-8281b248426e | 01a202fc-bbaf-7af1-afd8-d727d465cf36 |
| source_generation | closed | 01a202ff-b15a-7ba2-a6c9-6697b54158ae | 01a20303-6fb0-7f90-92e7-6d57188edde0 |
| sub_prompt_generation | skipped |  |  |
| repair | skipped |  |  |

Workflow: finalized

## Measurements

All measurement turns are excluded from phase and workflow metrics.

- `01a202fc-bbaf-7af1-afd8-d727d465cf36`: close-phase:prompt_generation; last selected turn `01a202f5-72ee-7722-89c2-8281b248426e`; evidence `sha256:82bb62f66d5f46040d7fc3432908446c90ce4e591a1974b6155d3898d73a5e10`
- `01a20303-6fb0-7f90-92e7-6d57188edde0`: close-phase:source_generation; last selected turn `01a202ff-b15a-7ba2-a6c9-6697b54158ae`; evidence `sha256:e0682e6ff995b7b7727f244dd8531322e80fa8d1453a327586cd333b0d98357b`
- `01a2034c-3a4b-7692-9967-ded7210c92a5`: finalize-workflow; last selected turn `01a202ff-b15a-7ba2-a6c9-6697b54158ae`; evidence `sha256:e0682e6ff995b7b7727f244dd8531322e80fa8d1453a327586cd333b0d98357b`
