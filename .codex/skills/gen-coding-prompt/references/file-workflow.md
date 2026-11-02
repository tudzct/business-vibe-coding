# File-driven prompt workflow

## Exclusive project-content sources

- **Prompt template**: `templates/construction/coding-prompt.template.md`.
- **Primary invocation input**: Exactly one frozen use-case Markdown path (`docs/01-inception/use-cases/uc-*.md`).
- **Business-rule specification**: Only the exact `business_rule_path` emitted by successful preflight validation.
- **Ordered API contracts**: Only the specific paths declared under `Related API IDs` in the active UC (empty if `None.`).
- **Database schema**: `docs/00-context/engineering/schema.dbml` (read once as technical reference after preflight PASS).
- **Configured live database**: Read-only inspection after preflight PASS; never mutate data, schema or database configuration.
- **Resolved Figma snapshot**: Read-only local snapshot of the active UC's target node(s) returned by `resolve.py` from the configured frozen dataset.
- **Current application source**: The entire cumulative source under `finalsource/`, including implementation added by earlier UCs; prompt generation does not mutate it.

No other project-content source may be inspected or used to author the Coding Prompt. Technical and control-plane material authorized by the skill constrains workflow execution only and does not supply product behavior or requirements.

## Outputs

- `docs/02-construction/coding-prompts/<UC-ID>-coding-prompt.md` as the Draft;
- Live prompt timing evidence appended via deterministic timestamp capture.

Every output carries enough provenance and checksums without relying on chat history.
