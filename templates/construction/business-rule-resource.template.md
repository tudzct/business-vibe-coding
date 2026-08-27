---
artifact_type: business-rule-resource
status: Draft | Frozen
uc_id: <UC-ID>
source_use_case: docs/01-inception/use-cases/<file>.md
source_use_case_sha256: sha256:<checksum>
---

# <UC-ID> Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!<range>`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `<ISO-8601>`

## Ordered Business Rules

### <BR-ID> - <name>

- Representation: `<OCL invariant | OCL precondition | OCL postcondition | natural language>`
- Expression / authoritative text: `<verbatim source content>`
- Context: `<class/operation/business scope>`
- Enforcement layer(s): `<frontend/backend/database>`
- Failure behavior: `<source-backed behavior or unresolved>`
- Traceability: `<UC/API/UI/source range>`

## Unresolved items

Record missing information without inventing a value. Stop for the researcher when it changes public API, schema, ownership, destructive behavior, or rule semantics.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
