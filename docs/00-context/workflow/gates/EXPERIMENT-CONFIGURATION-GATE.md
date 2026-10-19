# Experiment configuration input contract

Before an operation that consumes run configuration, the operator supplies exactly one Confirmed configuration for one UC/model. It contains one run assignment, uses `configuration_id: CFG-<run_id>` and is stored as `<configuration_id>.json`.

The Confirmed configuration, its referenced prepared artifacts and the Draft Canonical Run JSON must already exist. Their referenced UC, API, Figma and database evidence must be valid. The API inventory is ordered and checksum-pinned, or `[]` only when the frozen UC's required `Related API IDs` section contains exactly `None.`. The operator may prepare these files manually or with an external helper; consumers validate the resulting files, not how they were created.

Resolve one configuration and run from explicit arguments or the checksum-pinned Canonical Run. Never select the newest file or guess between matches. Run `.codex/scripts/preflight_configuration.py` before producing output. Validation is read-only: missing, malformed, ambiguous, conflicting or drifted inputs stop the operation with the exact blocker. Never create, fill, normalize, confirm or replace prepared inputs automatically.

The Canonical Run pins the actual configuration path, ID and SHA-256. Its initial technical state must match the current schema. Existing receipts are immutable and must be validated when present.

Database validation uses `docs/00-context/engineering/schema.dbml`, the configured migration head, DBML checksum and runtime schema fingerprint. Follow [database policy](../../engineering/DATABASE-SCHEMA.md). Missing pins, connection errors or drift block the active operation and never trigger database setup.

After preflight passes, deterministic helpers may append only the evidence owned by the active operation. A successful validation or write does not authorize another operation.
