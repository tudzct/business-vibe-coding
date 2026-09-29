# Connected sources

## Canonical functional and Business Rule source

- Google Sheet ID: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab: `Use cases`
- Authorized source range: columns `A:B`
- OCL utilities: `A2:B2`
- Use cases: 16 primary UCs; UC-08.1 is a UI variant within UC-08.

Use the connected Google Drive/Sheets interface. Never scrape, reconstruct or guess cell contents. Store spreadsheet ID, tab, exact range and retrieval time in derived artifacts. Read only the named spreadsheet/tab/range or columns authorized by the parent prompt. Stop when access fails or when duplicate/conflicting rows make a business requirement ambiguous.

## Prompt template

- Google Doc ID: `1-cQWpOig7A5HrSHkRvzdw6DsbYRI1-6W7b8BGurT7GY`
- Tab: `New coding prompt template` (`t.ae82d3zcwy8f`)
- [The configured coding-prompt template](../../../templates/construction/coding-prompt.template.md) defines all prompt structure and section responsibilities.

## Figma and API sources

Use them only where the Sheet references them. API contracts are explicitly defined as markdown files in `docs/01-inception/api-contracts/`. Figma mappings come only from `docs/00-context/FIGMA-LINK-REVIEW.md`; a frozen dataset is required before use.

- Treat API contracts as frozen, read-only inputs. For each UC, copy every ID from its frozen `Related API IDs` into the Confirmed configuration in source order, together with the exact repository path and raw-byte SHA-256. Do not scan for substitutes or select an API by filename similarity.
- Configuration validation requires every pinned API file to exist under `docs/01-inception/api-contracts/` with `artifact_type: api-contract`, `status: Frozen`, the configured `api_id` and the configured checksum. Prompt and Source preflight additionally require the configured ordered IDs to equal the frozen UC references.

- When creating or refreshing a dataset, read every file key, node ID and URL only from `docs/00-context/FIGMA-LINK-REVIEW.md`. The links inside immutable UC files are provenance-only and may be inaccessible; do not call Figma with them.
- Use `resolve-figma-design-dataset` whenever a prompt or UC contains a Figma URL, file key, frame name, node ID or selection ID.
- If no dataset exists, that is not permission to fall back to UC links. Start capture from the review mapping or stop if that mapping is incomplete.
- Use `resource/figma-design-dataset/active-dataset.json` only before configuration. Configurations copy its exact version and manifest checksum; configured runs never follow a moving newest directory.
- Use the checksum-valid frozen snapshot as reproducible generation input. The researcher may inspect UI manually. UI scoring is never an automatic audit or experiment prerequisite; missing UI results do not block the workflow.
- Use the installed Figma plugin only to create a new dataset version or complete entries explicitly marked pending. Never overwrite a dataset version already used by an experiment.
- Stop when the resolver reports `pending-rate-limit`, a checksum mismatch, a missing target or ambiguity. Do not substitute a different frame or infer hidden screens.
