# PROJECT_CONTEXT

## Canonical terminology

- **Research product:** this repository, its two-phase generation workflow, artifacts, source and experiment evidence.
- **Researcher:** the human who supplies sources, confirms experiment configuration, approves prompts and resolves ambiguity.
- **Codex/AI:** the agent that projects sources, generates prompts/source and records evidence. It never approves its own output.
- **Application user:** an actor represented in a use case.
- **Reviewer:** an independent reader of the method and evidence.

Configuration confirmation is supplied by the researcher's externally prepared JSON with `status: Confirmed`, not an additional chat approval. Prompt generation requires the configuration, BR baseline, flow baseline and Draft Canonical Run JSON already on disk, validates them read-only and persists only the Draft prompt and live measurement evidence in the work turn; the next researcher command is prompt telemetry closure, which also approves the Draft; no additional confirmation gate is required. Any integrity issue blocks generation rather than being inferred or auto-corrected.

## Research objective

This project studies automated source-code generation from use-case specifications enriched with explicit Business Rules. Rules are expressed as OCL invariants, preconditions or postconditions when representable; remaining constraints stay in authoritative natural language.

The method extends the two-phase method described by Dang Thi Thanh Truc across two experimental setups:

1. **Full method (RQ1/RQ2):** Uses the complete Prompt A-F template. Prompt A covers backend/API, Prompt B frontend UI, Prompt C frontend logic/API integration and Prompt D validation/error handling.
2. **Ablation study (RQ3):** Uses only Prompts A-D, omitting Prompts E and F together, against the identical frozen evaluation baseline.

Both setups follow the two-phase method:
- **Phase 1 - Generate Business Coding Prompt:** produce and approve the designated prompt artifact (`*-business-coding-prompt.md` for Full, `*-rq3-coding-prompt.md` for RQ3).
- **Phase 2 - Generate Source Code:** implement the approved prompt starting from clean baseline, record first-pass evidence, assess every frozen BR, perform bounded repairs, and run Docker runtime observations.

The [shared Full/RQ3 contract](docs/00-context/workflow/FULL-RQ3-CONTRACT.md) defines identical functional-flow coverage, gates, evaluation and provenance controls. Cumulative UCs extend the recorded predecessor within the configured pipeline; new experimental conditions use their documented baseline. RQ3 differs in permitted generation input (A-D without E/F), not in required Alternative/Exception Flows or the evidence standard used during repair verification and no-repair completion.

## Authoritative sources

### Functional and business specification

- Spreadsheet ID: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- URL: https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0
- Tab/range authority: `Use cases`, columns A-B
- OCL utility definitions: `Use cases!A2:B2`
- Each UC section supplies functional fields, UML PlantUML, Business Rules, related UI/API IDs and notes.

The 16 files under `docs/01-inception/use-cases/` are frozen projections of this source. UC-08.1 is a UI-level variant inside UC-08 and is not a seventeenth experiment unit.

### Prompt template

- Document ID: `1-cQWpOig7A5HrSHkRvzdw6DsbYRI1-6W7b8BGurT7GY`
- Tab: `New coding prompt template`
- URL: https://docs.google.com/document/d/1-cQWpOig7A5HrSHkRvzdw6DsbYRI1-6W7b8BGurT7GY/edit?tab=t.ae82d3zcwy8f

### Method reference

`resource/TrucDTT_21020414-4889_baoveee.pdf` and the researcher-supplied thesis PDF describe the original two-phase method.

## Business-rule baseline

Follow the researcher command sequence in [FILE-DRIVEN-WORKFLOW.md](docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md). Every command authorizes its operation without extra gate confirmations. Prompt close approves the Draft; repair invocation authorizes the correction. Four research JSON inputs plus a researcher-provided database baseline are required for generation; activation is optional. Internal `gates` fields remain bookkeeping only.

The evaluation baseline contains all BRs supplied for the active UC. There is no rule-selection mode. Before invoking prompt generation, preparation by the researcher's chosen tool records:

- frozen UC path and SHA-256;
- spreadsheet ID, tab, range and retrieval time;
- exact ordered BR IDs;
- UML and OCL utility source references;
- baseline status.

This receipt prevents evaluation criteria from changing after source generation; it is not an approval or selection of rules.

Before invoking generation, preparation also freezes a supplementary flow baseline from every explicit Basic/Main, Alternative and Exception Flow. A flow is incorrect only when a completion-critical step fails or its specified terminal outcome is not achieved. Flow scoring never changes the BR denominator or BR result.

Configurations freeze `flow_audit_rubric: completion-critical-flow-runtime-v2` before generation. This rubric requires connected integrated-runtime observation for flow `correct`, with evidence linked to UC/run/stage/baseline/source revision. Source findings remain separate; unavailable critical/outcome or connected-runtime proof means `not_evaluable` unless a blocking failure is evidenced. Initial and final use the same rubric. Authorized repair automatically observes every flow on final source before repair closure. When repair is skipped and source is unchanged, the original first-pass assessment remains terminal evidence, preserving its original stage/ID/time; no duplicate assessment is required. Weights, formulas, BR criteria and generation-only timing remain unchanged; the researcher command sequence supplies authorization without extra confirmations.

Flow accuracy retains evaluated-only accuracy/error, coverage, failures and pending targets. Offer researcher verdicts or bounded LLM measurement; persist attributed follow-ups without changing source/telemetry. After saving either path, wait for `$bug-fixing-sub-prompt` if defects remain. Unknown accepted flow verdicts block new repair. All-passing unchanged-source audit records repair unnecessary. Never automatically reopen terminal runs. See the [follow-up contract](docs/00-context/workflow/gates/FLOW-FOLLOWUP-AUTO-REPAIR.md).

The reported experiment flow result follows `accepted-audit-results-v1`: use the latest conclusive accepted verdict per flow across audit stages. Both researcher results and LLM re-audits update canonical JSON directly; repair/source changes or later inconclusive observations do not erase accepted results. Per-flow source/stage provenance and latest-source limitations remain visible. This reporting policy does not change frozen evidence rubrics, BR acceptance, telemetry or gates. Show the selection policy in comparisons.

## Database input

The fifth input is the researcher-prepared MySQL database and `docs/00-context/engineering/schema.dbml`. Configurations pin exactly `migration_head`, `dbml_sha256` and `schema_fingerprint_sha256` inside `database_baseline`; no separate status or manifest. See [database policy](docs/00-context/engineering/DATABASE-SCHEMA.md). Researcher setup builds a complete initial schema with TypeORM migrations and adds migrations between runs only when needed. Each run locks its schema/history/DBML; AI maps existing tables and may perform authorized business DML only. Prompt/Source preflight checks migration history and both hashes before START. Subsequent UCs retain data; changed baselines require new configuration/run identities. Docker setup applies migrations; application rebuilds within a run use `--no-deps backend frontend`.

## System baseline

- Frontend: React 18, TypeScript, Vite, Tailwind, React Router, Axios, Context/Zustand, Recharts.
- Backend: NestJS 11, TypeScript, TypeORM/MySQL, class-validator, Passport JWT, bcrypt and Swagger.
- Runtime: Docker Compose v2 with frontend, backend and MySQL.
- API prefix: `/api`.
- Success envelope: `{ success: true, message, data }`.
- Error envelope: `{ success: false, statusCode, message, timestamp, path }`.
- Domain: users own accounts, bills and goals; accounts own transactions; categories classify transactions and goals.

The [shared operational constitution](AGENTS.md#shared-operational-constitution) governs every skill and both variants, including testing, database mutations, secrets and destructive operations.

Implementation controls such as authentication, hashing, ownership, validation, secret handling, safe errors and transactions remain when required by BRs, APIs or the baseline. They are not treated as a separate experimental dimension.

## Repository map

```text
.codex/skills/                         two-phase workflow and implementation skills
docs/00-context/business-rules/        OCL utilities and business-method guidance
docs/01-inception/use-cases/           frozen Sheet-derived UC/UML/BR specifications
docs/02-construction/business-rules/   per-UC exact Business Rule resources
docs/02-construction/coding-prompts/   approved Prompt A-F artifacts
docs/02-construction/implementation/   BR baseline, schema, run and repair records
docs/05-experiments/                   canonical run JSON and rendered views
templates/                             artifact contracts
finalsource/fe                         generated React source
finalsource/be                         generated NestJS source
```

## Definition of done

A run is complete only when:

- the approved prompt has the configured structure: Prompts A-F with the exact frozen BR set for Full, or Prompts A-D with no Prompt E or F content for RQ3;
- initial generation telemetry is preserved before repair;
- Full and RQ3 first-pass generation end before audit; the subsequent close command preserves telemetry, and the repair command supplies explicit authorization when needed;
- every BR has one `met`, `unmet` or `not_evaluable` assessment with evidence;
- every frozen flow has one `correct`, `incorrect` or `not_evaluable` assessment with evidence;
- every evidenced defect has a bounded repair record or an explicit researcher decision;
- permitted validators, lint/typecheck/build checks pass;
- Docker images are rebuilt from current source and required services are healthy/reachable;
- bounded runtime observation covers the UC trigger, main flow, success and exception behavior;
- the final `finalsource/` hash is frozen.

No test or test-case generation is part of this method.

Telemetry uses prompt/source/repair buckets within the two phases and follows [the command sequence](docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md). Close/report/export turns are excluded. Captures follow `generation_execution_with_repair_audit_v2`: Repair includes integrated BR/flow/runtime verification and final evidence persistence, and a turn's token label must match any captured core execution. Standalone audit remains workflow-only tokens and excluded from counted execution time. Audit and repair verification preserve frozen BR/flow evidence. The existing gate field records completed commands without asking the researcher for further approval.

Missing/null UI scores never block audit, measurements, reports, export or completion. After finalization, `$export-experiment-excel <UC-ID> <LINK_OR_FILEPATH> <TAB_NAME>` is a separate reporting operation that copies stored canonical values into a new workbook while preserving formulas/protected/manual content.

Prompt telemetry close (Turn 2) automatically creates a missing `run-activation.json` from the pinned configuration and approved prompt, or validates an existing receipt without replacing it. The receipt records the actual prompt-close turn/time, before source generation. No standalone activation turn is required.
