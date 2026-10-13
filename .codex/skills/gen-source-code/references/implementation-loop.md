# Implementation loop

Database preflight uses the per-run operator-provided input under `docs/00-context/engineering/DATABASE-SCHEMA.md`: read pinned DBML, verify migration history/head and the live schema fingerprint and map existing tables. Apply the [shared operational constitution](../../../../AGENTS.md#shared-operational-constitution). Preserve actual END/partial evidence and follow the database policy before restarting with new pins. Keep data across cumulative UCs. Rebuild within a run with `--no-deps backend frontend`.

Validate the active run and approved prompt, complete permitted input/Figma/schema preflight, capture START immediately before the first source mutation, implement the [approved prompt](../../../../docs/02-construction/coding-prompts/%3CUC-ID%3E-business-coding-prompt.md), capture END immediately after generation, and preserve source/hash/evidence. End the response without inspecting or preparing another operation.
