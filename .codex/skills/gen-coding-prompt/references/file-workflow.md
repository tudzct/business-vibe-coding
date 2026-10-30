# File-driven prompt workflow

## Primary input sources

- **Primary invocation input**: Exactly one frozen use-case Markdown path (`docs/01-inception/use-cases/uc-*.md`).
- **Ordered API contracts**: Only the specific paths declared under `Related API IDs` in the active UC (empty if `None.`).
- **Prompt template**: `templates/construction/coding-prompt.template.md`.
- **Database schema**: `docs/00-context/engineering/schema.dbml` (read once as technical reference after preflight PASS).
- **Resolved Figma snapshot**: Read-only snapshot of target frame node(s) returned by `resolve.py`.
- **Codebase structural discovery**: Shallow inspection of entry points in `finalsource/` to determine module/component paths.

## Outputs

- `docs/02-construction/coding-prompts/<UC-ID>-coding-prompt.md` as the Draft;
- Live prompt timing evidence appended via deterministic timestamp capture.

Every output carries enough provenance and checksums without relying on chat history.
