# Business vibe coding

Business vibe coding is a research workbench for generating source code from use-case specifications enriched with Business Rules expressed in OCL where possible and authoritative natural language otherwise.

## Method

```text
Phase 1: UC + UML/OCL Business Rules + API/Figma + template
         -> approved Business Coding Prompt A-F

Phase 2: approved prompt + codebase + project/database rules
         -> source -> evidence-based repair loop -> runnable final source
```

Prompt E is Business Rules Compliance. Prompt F supplies implementation context and priority.

## Authoritative sources

- Business specification: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab `Use cases`, columns A-B.
- Prompt template: [Coding prompt template mới](https://docs.google.com/document/d/1-cQWpOig7A5HrSHkRvzdw6DsbYRI1-6W7b8BGurT7GY/edit?tab=t.ae82d3zcwy8f).
- Frozen UC projections: `docs/01-inception/use-cases/`.
- OCL utility definitions: `docs/00-context/business-rules/OCL-UTILITY-DEFINITIONS.md`.

## Researcher entry points

1. Read `PROJECT_CONTEXT.md`.
2. Run the setup review in `CODEX_SETUP_GUIDE.md`.
3. Read `ARCHITECTURE.md` for components and gates.
4. Follow `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md`.

## Main commands

Phase 1:

```text
$gen-coding-prompt docs/01-inception/use-cases/uc-01-register-account.md
```

The command creates:

```text
docs/02-construction/implementation/UC-01/business-rule-baseline.json
docs/02-construction/business-rules/UC-01-business-rules.json
docs/02-construction/coding-prompts/UC-01-business-coding-prompt.md
```

Review the prompt and set `status: Approved` only after checking the UC, UML and every Prompt E BR.

Phase 2:

```text
$gen-source-code docs/02-construction/coding-prompts/UC-01-business-coding-prompt.md
```

The command activates one configured run, generates source in `finalsource/`, records the first pass, performs evidence-based repairs, validates the permitted non-test gates and freezes the final source hash.

Render a completed run report:

```text
$render-experiment-report docs/05-experiments/<UC-ID>/<RUN-ID>.json
```

## Use cases

The spreadsheet defines 16 primary UCs. UC-08.1 Quick Edit Account is retained as a UI variant within UC-08 and reuses its API/BR set.

All files under `docs/01-inception/use-cases/` are frozen source projections. Do not edit them directly. Correct the spreadsheet and explicitly refresh the snapshot instead.

## Runtime

Docker Compose v2 is mandatory:

```bash
cp finalsource/.env.example finalsource/.env
docker compose --env-file finalsource/.env -f finalsource/compose.yaml up --build -d
docker compose --env-file finalsource/.env -f finalsource/compose.yaml ps
```

The researcher must provide strong local values for `MYSQL_PASSWORD` and `JWT_SECRET`. Never commit `finalsource/.env`.

## Current verification boundary

Do not create or run tests or test cases. The workflow may inspect source/configuration, run deterministic artifact validators, lint/typecheck/build, rebuild Docker images, inspect health/reachability and perform bounded manual runtime observation.

## Application controls

JWT, bcrypt, DTO validation, ownership checks, secret handling, safe errors and database transactions remain when required by the UC, Business Rules, API contract or technical baseline. They are ordinary business/technical implementation requirements.
