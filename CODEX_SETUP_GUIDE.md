# Codex setup guide - Business vibe coding

Setup Review verifies that the research repository and mandatory runtime are available. It does not generate prompts/source, alter frozen UCs, start containers or create/run tests.

## Required read order

1. `AGENTS.md`
2. `PROJECT_CONTEXT.md`
3. `CODEX_SETUP_GUIDE.md`
4. `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md`
5. `docs/00-context/sources/CONNECTED-SOURCES.md`

## Read-only setup checklist

Run:

```bash
pwd
git status --short
git rev-parse --show-toplevel
git log -1 --oneline
find .codex/skills -mindepth 2 -maxdepth 2 -name SKILL.md -print | sort
find docs/01-inception/use-cases -maxdepth 1 -name 'uc-*.md' -print | sort
docker --version
docker compose version
docker info
```

Expected repository invariants:

- 16 primary frozen UC files sourced from the canonical Sheet.
- UC-01 is Register an Account and UC-02 is Log In.
- Each UC contains functional specification, UML Model and Business Rules.
- `docs/00-context/business-rules/OCL-UTILITY-DEFINITIONS.md` exists.
- Only the two-phase Business Rule workflow and its implementation/audit skills are installed.
- The two-phase commands are `$gen-coding-prompt` and `$gen-source-code`.
- Docker Compose v2 is available; native host Node.js/MySQL is unsupported.

## Local configuration

`finalsource/.env` is ignored and must not be committed. If it is absent, create it only when the researcher asks to initialize runtime:

```bash
cp finalsource/.env.example finalsource/.env
```

The researcher fills at least:

```dotenv
MYSQL_PASSWORD=<strong-local-password>
JWT_SECRET=<at-least-32-random-characters>
```

Never print secret values. Verify only presence and Git ignore status.

## Runtime authorization

Do not build/start containers during Setup Review. After explicit researcher authorization:

```bash
docker compose --env-file finalsource/.env -f finalsource/compose.yaml up --build -d
docker compose --env-file finalsource/.env -f finalsource/compose.yaml ps
```

Distinguish container state, health and UI/API reachability. Do not run `docker compose down -v` unless the researcher explicitly requests destructive database reset.

## Connected sources

The Google Sheet is required when explicitly refreshing UC/business-rule inputs. Ordinary Phase 1 uses the frozen repository projection and recorded provenance.

Figma is required only to create/refresh an offline design dataset. Resolve targets through `docs/00-context/FIGMA-LINK-REVIEW.md`.

If connector access fails, mark the source `BLOCKED`; do not scrape or guess.

## Setup report

```markdown
# Setup Review

- Repository: PASS | WARN | BLOCKED
- Required context: PASS | WARN | BLOCKED
- Use-case/UML/BR inputs: PASS | WARN | BLOCKED
- Repo-local skills: PASS | WARN | BLOCKED
- Docker/Compose: PASS | WARN | BLOCKED
- Local configuration: PASS | WARN | BLOCKED
- Connected sources: PASS | NOT_APPLICABLE | BLOCKED
- Runtime: NOT_RUN | PASS | BLOCKED
- Git safety: PASS | WARN | BLOCKED

Overall: READY | READY_WITH_WARNINGS | NOT_READY
Next action: <one concrete action>
```

`READY` means the environment can execute the two-phase method; it does not mean generated source satisfies Business Rules.
