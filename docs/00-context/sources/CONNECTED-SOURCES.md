# Connected sources

## Canonical functional and Business Rule source

- Google Sheet ID: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab: `Use cases`
- Authorized source range: columns `A:B`
- OCL utilities: `A2:B2`
- Use cases: 16 primary UCs; UC-08.1 is a UI variant within UC-08.

Use the connected Google Drive/Sheets interface. Never scrape, reconstruct or guess cell contents. Store spreadsheet ID, tab, exact range and retrieval time in derived artifacts.

## Prompt template

- Google Doc ID: `1-cQWpOig7A5HrSHkRvzdw6DsbYRI1-6W7b8BGurT7GY`
- Tab: `Coding prompt template mới` (`t.ae82d3zcwy8f`)
- Structure: Prompts A-F, where E is Business Rules Compliance and F is Implementation Context.

## Figma and API sources

Use them only where the Sheet references them. Figma mappings come only from `docs/00-context/FIGMA-LINK-REVIEW.md`; a frozen dataset is required before use.
