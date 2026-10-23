# File-driven prompt workflow

## Input sources (Closed Whitelist)

- **Primary invocation input**: Exactly one frozen use-case Markdown path (`docs/01-inception/use-cases/uc-*.md`).
- **Ordered API contracts**: Only the specific paths declared under `Related API IDs` in the active UC (empty if `None.`).
- **Prompt template**: `templates/construction/coding-prompt.template.md`.
- **Database schema**: `docs/00-context/engineering/schema.dbml` (read once as technical reference after preflight PASS).
- **Resolved Figma snapshot**: Read-only snapshot of target frame node(s) returned by `resolve.py`.
- **Codebase structural discovery**: Shallow inspection of entry points in `finalsource/` to determine module/component paths.

## Execute-only helpers (No source reading)

The following scripts must only be executed; their source code must NEVER be read or inspected:
- `.codex/scripts/preflight_configuration.py`
- `.codex/scripts/capture_timestamp.py`
- `.codex/scripts/validate_prompt_contract.py`
- `.codex/skills/resolve-figma-design-dataset/scripts/resolve.py`

## Forbidden file reads

- Any file in `docs/02-construction/coding-prompts/` (no reading existing or prior prompts).
- Any other file in `docs/01-inception/use-cases/`.
- Unrelated API contracts in `docs/01-inception/api-contracts/`.
- Any file in `docs/04-experiments/` (except active run/configuration JSON passed via arguments).
- Any python script file (`.py`).

## Outputs

- `docs/02-construction/coding-prompts/<UC-ID>-coding-prompt.md` as the Draft;
- Live prompt timing evidence appended via deterministic timestamp capture.

Every output carries enough provenance and checksums without relying on chat history.
