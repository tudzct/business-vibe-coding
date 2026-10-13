# Experiment configuration input contract

Before prompt generation, the operator supplies exactly one Confirmed configuration for one UC/model/variant. It contains one run assignment, uses `configuration_id: CFG-<run_id>` and is stored as `<configuration_id>.json`.

The following prepared JSON inputs must already exist:

- the Confirmed configuration;
- the frozen Business Rule baseline;
- the frozen Flow baseline;
- the Draft Canonical Run JSON.

Their referenced UC, API, Figma and database evidence must be valid. The API inventory is ordered and checksum-pinned, or `[]` only when the frozen UC's required `Related API IDs` section contains exactly `None.`. The operator may prepare these files manually or with an external helper; consumers validate the resulting files, not how they were created.

Resolve one configuration and run from explicit arguments or the checksum-pinned Canonical Run. Never select the newest file or guess between matches. Run `gen-coding-prompt/scripts/preflight_configuration.py` before producing output. Validation is read-only: missing, malformed, ambiguous, conflicting or drifted inputs stop the operation with the exact blocker. Never create, fill, normalize, confirm or replace prepared inputs automatically.

Canonical `gates` begins as `{"current": "prompt", "history": []}`. Before first measurement, `metrics` is null and `coding_prompt` is null. The Canonical Run pins the actual configuration path, ID and SHA-256. Existing receipts are immutable and must be validated when present.

Database validation uses `docs/00-context/engineering/schema.dbml`, the configured migration head, DBML checksum and runtime schema fingerprint. Follow [database policy](../../engineering/DATABASE-SCHEMA.md). Missing pins, connection errors or drift block the active operation and never trigger database setup.

After preflight passes, deterministic helpers may append only the evidence owned by the active operation. A successful validation or write does not authorize another operation.
