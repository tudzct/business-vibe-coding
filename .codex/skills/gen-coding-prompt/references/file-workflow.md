# File-driven prompt workflow

Input: one frozen Sheet-derived use-case Markdown file.

Outputs:

- optional UI reconstruction record when applicable;
- `docs/02-construction/business-rules/<UC-ID>-business-rules.{json,md}`;
- `docs/02-construction/implementation/<UC-ID>/business-rule-baseline.json`;
- `docs/02-construction/coding-prompts/<UC-ID>-business-coding-prompt.md`.

Every output carries enough provenance and checksums for Phase 2 without relying on chat history.
