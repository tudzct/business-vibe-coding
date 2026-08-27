# Connected design and specification sources

The project uses installed Codex plugins rather than repository-stored credentials or hand-written MCP endpoints.

## Figma

- Use `resolve-figma-design-dataset` whenever a prompt or UC contains a Figma URL, file key, frame name, node ID or selection ID.
- When creating or refreshing a dataset, read every file key, node ID and URL only from `docs/00-context/FIGMA-LINK-REVIEW.md`. The links inside immutable UC files are provenance-only and may be inaccessible; do not call Figma with them.
- If no dataset exists, that is not permission to fall back to UC links. Start capture from the review mapping or stop if that mapping is incomplete.
- Use the checksum-valid frozen snapshot as the reproducible generation and audit source. Capture dataset ID, file/frame/node identifiers and snapshot time in provenance.
- Use the installed Figma plugin only to create a new dataset version or complete entries explicitly marked pending. Never overwrite a dataset version already used by an experiment.
- Stop when the resolver reports `pending-rate-limit`, a checksum mismatch, a missing target or ambiguity. Do not substitute a different frame or infer hidden screens.

## Google Sheets through Google Drive

- Use the Google Drive plugin whenever a use case, API specification, business-rule source or experiment dataset is a Google Sheets URL.
- Read only the named spreadsheet/tab/range or columns authorized by the parent prompt. Do not broaden collection silently.
- Record spreadsheet ID, tab/gid, range/columns and retrieval time in provenance.
- Treat connected-sheet content as input evidence, never as permission to write. Do not modify a sheet unless the user explicitly requests it.
- Stop when access fails or when duplicate/conflicting rows make a business requirement ambiguous.

Do not store OAuth tokens, cookies or connector secrets in `.codex`, prompts, generated source or audit artifacts. Plugin installation supplies the connector/MCP capability; no manual MCP server configuration is required in this repository.
