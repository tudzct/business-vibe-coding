# Business vibe coding

Business vibe coding is a research workbench for generating source code from use-case specifications enriched with Business Rules expressed in OCL where possible and authoritative natural language otherwise.

## Method

```text
Phase 1: validated inputs + configured template
         -> approved Business Coding Prompt A-F

Phase 2: approved prompt + codebase + project/database rules
         -> source -> evidence-based repair loop -> runnable final source
```


## Authoritative sources

- Business specification: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab `Use cases`, columns A-B.
- Prompt template: [New coding prompt template](https://docs.google.com/document/d/1-cQWpOig7A5HrSHkRvzdw6DsbYRI1-6W7b8BGurT7GY/edit?tab=t.ae82d3zcwy8f).
- Frozen UC projections: `docs/01-inception/use-cases/`.
- OCL utility definitions: `docs/00-context/business-rules/OCL-UTILITY-DEFINITIONS.md`.

## Researcher entry points

1. Read `PROJECT_CONTEXT.md`.
2. Run the setup review in `CODEX_SETUP_GUIDE.md`.
3. Read `ARCHITECTURE.md` for components and command boundaries.
4. Follow `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md`.

## Main commands

Prepare the four research JSON files and the database input described in [FILE-DRIVEN-WORKFLOW.md](docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md): Confirmed configuration, frozen BR/flow baselines and Draft Canonical Run JSON. Generation validates them read-only, including configured DBML SHA-256 and live MySQL structure fingerprint. See [database preparation](docs/00-context/engineering/DATABASE-SCHEMA.md). The schema is fixed; data accumulates across UCs. Activation is optional; no additional gate confirmation turns are required.

Run these commands in separate turns for the same UC/run:

```text
$gen-coding-prompt docs/01-inception/use-cases/uc-01-register-account.md
$measure-uc-workflow close-phase prompt_generation
$gen-source-code docs/02-construction/coding-prompts/UC-01-business-coding-prompt.md
$measure-uc-workflow close-phase source_generation
$audit-generation-metrics
$bug-fixing-sub-prompt
$measure-uc-workflow finalize-workflow
$export-experiment-excel uc-01 "<LINK_OR_FILEPATH>" "<TAB_NAME>"
```

Prompt close also approves/pins the Draft. For RQ3, use `UC-01-rq3-coding-prompt.md`. Audit includes flow measurement. If all frozen results pass, skip the correction command and invoke `finalize-workflow`, which records skipped Repair and finalizes telemetry. If flows are unknown, save researcher verdicts or requested LLM observations, then wait for the repair command when defects remain. Repair automatically verifies final BR/flow/runtime evidence. Export is optional, excluded from workflow telemetry, and produces a new filled `.xlsx` copy.

Render a finalized run separately with `$render-experiment-report docs/05-experiments/<UC-ID>/<RUN-ID>.json`.

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

Prompt telemetry close (Turn 2) automatically creates a missing `run-activation.json` from the pinned configuration and approved prompt, or validates an existing receipt without replacing it. The receipt records the actual prompt-close turn/time, before source generation. No standalone activation turn is required.
