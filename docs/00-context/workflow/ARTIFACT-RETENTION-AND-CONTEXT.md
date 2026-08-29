# Artifact retention and context

Retain separately:

- immutable Sheet-derived UC/UML/BR projections;
- a source-checksum normalization receipt only when raw checkout bytes differ solely by line endings;
- frozen Business Rule resource and baseline receipt;
- approved prompt artifact: Prompts A-F for Full, or Prompts A-D for RQ3;
- run activation, model/time/token metadata and immutable first-pass assessment;
- each repair sub-prompt and reassessment;
- final per-BR assessment and final-source checksum.

Never overwrite first-pass results with repaired results. Derived artifacts may reference source paths and hashes but must not append decisions to immutable UC files. Keep prompts and reports free of secrets and unrelated payloads.
