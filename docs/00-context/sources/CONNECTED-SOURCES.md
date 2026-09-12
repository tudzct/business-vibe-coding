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
- Tab: `Coding prompt template mới` (`t.ae82d3zcwy8f`)
- Structure: Prompts A-F, where E is Business Rules Compliance and F is Implementation Context.

## Figma and API sources

Use them only where the Sheet references them. API contracts are explicitly defined as markdown files in `docs/01-inception/api-contracts/`. Figma mappings come only from `docs/00-context/FIGMA-LINK-REVIEW.md`; a frozen dataset is required before use.

- When creating or refreshing a dataset, read every file key, node ID and URL only from `docs/00-context/FIGMA-LINK-REVIEW.md`. The links inside immutable UC files are provenance-only and may be inaccessible; do not call Figma with them.
- Use `resolve-figma-design-dataset` whenever a prompt or UC contains a Figma URL, file key, frame name, node ID or selection ID.
- If no dataset exists, that is not permission to fall back to UC links. Start capture from the review mapping or stop if that mapping is incomplete.
- Use `resource/figma-design-dataset/active-dataset.json` only before configuration. New schema-2.3 configurations copy its exact version and manifest checksum; configured runs never follow a moving newest directory.
- Use the checksum-valid frozen snapshot as reproducible generation input. The researcher may inspect UI manually or explicitly invoke the independent, optional `audit-figma-ui-accuracy` skill against that snapshot. UI scoring is never an automatic audit or experiment prerequisite; missing UI results do not block the workflow.
- Use the installed Figma plugin only to create a new dataset version or complete entries explicitly marked pending. Never overwrite a dataset version already used by an experiment.
- Stop when the resolver reports `pending-rate-limit`, a checksum mismatch, a missing target or ambiguity. Do not substitute a different frame or infer hidden screens.
