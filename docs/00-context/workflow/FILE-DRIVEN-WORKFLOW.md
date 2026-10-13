# File-driven artifact rules

This file defines shared file and integrity conventions only. It intentionally does not list operation order, future commands or the internal behavior of any skill.

## Prepared active-run inputs

Before an operation that requires them, the operator prepares:

1. `docs/04-experiments/configurations/CFG-<UC-ID>-<MODEL>-<VARIANT>.json`
2. `docs/02-construction/implementation/<UC-ID>/business-rule-baseline.json`
3. `docs/02-construction/implementation/<UC-ID>/flow-baseline.json`
4. `docs/04-experiments/<UC-ID>/canonical-run-<UC-ID>-<MODEL>-<VARIANT>.json`
5. `docs/00-context/engineering/schema.dbml` and the configured live database

The operator chooses how to prepare these files. Consumers validate required fields, identity, path and checksum read-only. They never create, fill, normalize or repair a missing prepared input unless the currently invoked operation explicitly owns that output.

Resolve one exact UC/run. Never choose the newest file or infer a match from filename similarity. A run ID uses `<UC-ID>-<MODEL>-<VARIANT>`; its configuration ID is `CFG-<run_id>`. Variant values are opaque identities, not instructions.

## Optional deterministic preparation

`experiment-input-helpers/calculate_input_values.py` prints project paths, identities and checksums without writing configuration files. Supply one explicit use-case path, one explicit Figma dataset version and each declared API contract path in source order. Omit API arguments only when the frozen use case explicitly declares no related API. Use `--require-empty` only for initial empty-database setup.

After manually completing and reviewing a configuration, `experiment-input-helpers/calculate_configuration_checksum.py --configuration <configuration-path>` prints its checksum for the matching active-run artifact.

These helpers do not authorize another operation and do not replace that operation's validators.

## Artifact integrity

Preserve immutable inputs, recorded source hashes, timestamps, receipts and evidence. Never rewrite a recorded artifact to make a later validation pass. A changed pinned input requires refreshed dependent artifacts and a compatible new run.

Operation-owned prompts, rubrics, assessments and correction templates are not shared workflow context. They may be read only by the active skill that owns them or by an explicitly authorized consumer through a validated handoff artifact.

## Technical environment

Database structure is immutable within a run. Operator-managed setup may update it between runs. Active operations use authorized business DML only and never edit DBML, migrations or schema.

Within a run, Docker rebuilds target application services without executing the setup migration service. Docker Compose v2 is the supported runtime. Do not create or run tests/test cases or store secrets in evidence.
