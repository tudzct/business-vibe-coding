# Project input authority

- Frozen UC Markdown under `docs/01-inception/use-cases/` is authoritative for use-case input.
- Frozen API Markdown under `docs/01-inception/api-contracts/` is authoritative for API input.
- `docs/00-context/engineering/schema.dbml` and the pinned runtime fingerprint identify the database input.
- `docs/00-context/FIGMA-LINK-REVIEW.md` and the selected immutable dataset identify the design input.
- The current application tree and its pinned clean-source baseline identify source state.

Paths and raw-byte checksums pin exact identities. When prepared inputs conflict, report the exact discrepancy and stop; never normalize project meaning silently. This file defines input locations only and grants no access to an operation-owned prompt, rubric, template or result.
