# File-driven prompt workflow

## Authorized 8 project-content inputs

1. **Prompt template**: `templates/construction/coding-prompt.template.md`.
2. **Active frozen use case**: Exactly one frozen use-case Markdown path (`docs/01-inception/use-cases/uc-*.md`).
3. **Business-rule specification**: Only the exact `business_rule_path` emitted by successful preflight validation.
4. **Ordered API contracts**: Only the specific paths declared under `Related API IDs` in the active UC (none if `None.`).
5. **Database schema**: `docs/00-context/engineering/schema.dbml` (read once after preflight PASS).
6. **Configured live database**: Read-only inspection after preflight PASS; never mutate data, schema or database configuration.
7. **Resolved Figma snapshot**: Read-only local snapshot of the active UC's target node(s) returned by `resolve.py` from the configured frozen dataset.
8. **Current application source**: The entire cumulative source under `finalsource/` (read-only).

No other project-content source may be inspected or used to author the Coding Prompt. Concrete authoring and synthesis instructions are defined inside `templates/construction/coding-prompt.template.md`.

## Outputs

- `docs/02-construction/coding-prompts/<UC-ID>-coding-prompt.md` as the Draft;
- Live prompt timing evidence appended via deterministic timestamp capture.
