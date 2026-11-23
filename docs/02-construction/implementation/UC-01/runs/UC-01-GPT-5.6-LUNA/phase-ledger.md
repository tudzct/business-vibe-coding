# UC phase ledger

UC: `UC-01`; run: `UC-01-GPT-5.6-LUNA`

Machine authority: phase-ledger.json. Each turn belongs to one phase.

| Phase | Status | First turn | Measurement boundary (excluded) |
|---|---|---|---|
| prompt_generation | closed | 01a2041d-ec3a-7d80-b7cc-1c06e59410ae | 01a20421-e0b2-7392-9324-ef0e27066271 |
| source_generation | closed | 01a20424-1dc0-7540-93a9-9af60d224da1 | 01a20427-2542-7363-ad7c-757f895b06ac |
| sub_prompt_generation | skipped |  |  |
| repair | skipped |  |  |

Workflow: finalized

## Measurements

All measurement turns are excluded from phase and workflow metrics.

- `01a20421-e0b2-7392-9324-ef0e27066271`: close-phase:prompt_generation; last selected turn `01a2041d-ec3a-7d80-b7cc-1c06e59410ae`; evidence `sha256:e7eb0cc15754bbcf52b9cc0ab4a488c44258bfd579205f600e8ce7666248a136`
- `01a20427-2542-7363-ad7c-757f895b06ac`: close-phase:source_generation; last selected turn `01a20424-1dc0-7540-93a9-9af60d224da1`; evidence `sha256:45b976ce2bfe555faa8ca73151bf2ae38b0311e8fea02adc1934b84052844bf0`
- `01a205ed-f13e-7982-9600-3b9c2774ae1e`: finalize-workflow; last selected turn `01a205ec-d5a8-7722-8588-aef04d43150b`; evidence `sha256:ebc94e15ef4d8e1f03b7f3de1b7607155ee28da82be2404650e795b7a50d2b03`
