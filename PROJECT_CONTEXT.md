# PROJECT_CONTEXT

## Canonical terminology

- **Research product:** this repository, its two-phase generation workflow, artifacts, source and experiment evidence.
- **Researcher:** the human who supplies sources, confirms experiment configuration, approves prompts/schema and resolves ambiguity.
- **Codex/AI:** the agent that projects sources, generates prompts/source and records evidence. It never approves its own output.
- **Application user:** an actor represented in a use case.
- **Reviewer:** an independent reader of the method and evidence.

## Research objective

This project studies automated source-code generation from use-case specifications enriched with explicit Business Rules. Rules are expressed as OCL invariants, preconditions or postconditions when representable; remaining constraints stay in authoritative natural language.

The method extends the two-phase method described by Đặng Thị Thanh Trúc:

1. **Phase 1 - Generate Business Coding Prompt:** combine a use-case specification, UML model, Business Rules, API/Figma sources and the Prompt A-F template.
2. **Phase 2 - Generate Source Code:** combine the approved prompt, existing codebase, database summary and project rules; generate source and use evidence-driven bug-fixing sub-prompts until the permitted completion gates pass.

Prompt A covers backend/API, Prompt B frontend UI, Prompt C frontend logic/API integration, Prompt D validation/error handling, Prompt E Business Rules Compliance and Prompt F Implementation Context.

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
- Tab: `Coding prompt template mới`
- URL: https://docs.google.com/document/d/1-cQWpOig7A5HrSHkRvzdw6DsbYRI1-6W7b8BGurT7GY/edit?tab=t.ae82d3zcwy8f

### Method reference

`resource/TrucDTT_21020414-4889_baoveee.pdf` and the researcher-supplied thesis PDF describe the original two-phase method.

## Business-rule baseline

Phase 1 uses all BRs supplied for the active UC. There is no rule-selection mode. Before prompt generation, the workflow records:

- frozen UC path and SHA-256;
- spreadsheet ID, tab, range and retrieval time;
- exact ordered BR IDs;
- UML and OCL utility source references;
- baseline status.

This receipt prevents evaluation criteria from changing after source generation; it is not an approval or selection of rules.

## System baseline

- Frontend: React 18, TypeScript, Vite, Tailwind, React Router, Axios, Context/Zustand, Recharts.
- Backend: NestJS 11, TypeScript, TypeORM/MySQL, class-validator, Passport JWT, bcrypt and Swagger.
- Runtime: Docker Compose v2 with frontend, backend and MySQL.
- API prefix: `/api`.
- Success envelope: `{ success: true, message, data }`.
- Error envelope: `{ success: false, statusCode, message, timestamp, path }`.
- Domain: users own accounts, bills and goals; accounts own transactions; categories classify transactions and goals.

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

- the approved prompt contains Prompts A-F and the exact frozen BR set;
- initial generation telemetry is preserved before repair;
- every BR has one `met`, `unmet` or `not_evaluable` assessment with evidence;
- every evidenced defect has a bounded repair record or an explicit researcher decision;
- permitted validators, lint/typecheck/build checks pass;
- Docker images are rebuilt from current source and required services are healthy/reachable;
- bounded runtime observation covers the UC trigger, main flow, success and exception behavior;
- the final `finalsource/` hash is frozen.

No test or test-case generation is part of this method.
