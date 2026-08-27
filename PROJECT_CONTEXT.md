# PROJECT_CONTEXT

## Canonical terminology and roles

Use the following vocabulary consistently across documentation, skills, templates, artifacts and reports:

- **Research product / Sản phẩm nghiên cứu:** this repository and its reproducible workflow, source-generation environment, security controls, evaluation tooling and evidence artifacts. Use this term consistently instead of framing the repository through an education context.
- **Researcher / Nhà nghiên cứu:** the human operator who supplies research inputs, selects experimental configurations, analyzes evidence and grants approvals. The researcher is the sole authority for approval gates and accepted residual risk.
- **Codex/AI:** the computational agent that proposes mappings, generates artifacts/source and collects evidence. Codex/AI does not approve its own proposal or substitute for researcher judgment.
- **Application user / Người dùng ứng dụng:** the domain actor represented inside a use case or generated application. This role is distinct from the researcher and must not be used to describe experiment operation or approval.
- **Reviewer / Người phản biện:** an independent reader or evaluator of the research product, protocol and evidence. Reviewers are not assigned operational approval authority unless the protocol explicitly identifies them as researchers.

Avoid education-context role labels. Use **research environment** for the machine/runtime in which experiments are conducted and **researcher-facing** for commands or instructions operated by a human researcher.

## Researcher entry points

For a fresh clone, use one authoritative reading path:

1. `README.md` is the researcher-facing landing page and command index.
2. `CODEX_SETUP_GUIDE.md` performs environment/setup review without source generation.
3. `ARCHITECTURE.md` explains generation components, gates and data flow.
4. `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md` governs per-UC operation.
5. `docs/00-context/workflow/ARTIFACT-RETENTION-AND-CONTEXT.md` identifies canonical JSON versus disposable Markdown views.
6. `docs/00-context/security/SECURITY-TOOL-EVALUATION.md` governs post-repair evaluation.

Do not require a new researcher to read every skill or historical artifact. Route each operation to the smallest canonical file set.

## Research objective

This is an experimental secure vibe-coding workbench. It extends the two-phase use-case-to-code method in `TrucDTT_21020414-4889_baoveee` and VC-AWG with security knowledge during generation. A read-only TechnicalReport-derived use case becomes Prompts A-D, a security resource becomes Prompt E, and generated code enters an evidence-driven correction loop. Before prompt generation, the selected SR list is frozen. Model configuration is an independent variable. A unified experiment configuration captures researcher identity, frozen UC security scopes, audit design, and all run assignments once. Two logical gates activate it: security scope before Prompt E, then one run/model assignment before source mutation. Every run records generation and repair model ID/snapshot/reasoning settings plus replicate and run order. Every frozen Prompt E SR receives one source-based `met`, `unmet`, or `not_evaluable` result from inspectable source/configuration/build/runtime evidence.

`resource/TechnicalReport.pdf` is the functional baseline for Prompts A-D. The only added experimental prompt component is Prompt E `SECURITY_REQUIREMENT`, selected from the A01–A10 generation catalog. Do not generate a separate Business Requirements/Business Rules Compliance prompt or business-correctness metrics. AC/BR IDs may remain only as source traceability anchors.

## Simplified AI-DLC

The research uses only four components: (1) use-case input, (2) security coding prompt generation, (3) source-code generation, and (4) audit plus targeted repair sub-prompts. Details are in `docs/00-context/workflow/AI-DLC-ADAPTATION.md`.

The two researcher-facing commands are file-based: `$gen-coding-prompt <use-case.md>` produces a security resource and persistent security-coding-prompt; `$gen-source-code <security-coding-prompt.md>` implements and audits it. Neither command relies on manually pasted prompt content or prior chat history.

Enterprise role separation, PRD/TAR bundles, extensive guard gates, a standalone Operations phase and test-case generation are outside this study.

## System baseline

- Runtime/deployment: Docker Compose v2 is mandatory for FE/BE/MySQL execution, runtime gates and independent evaluation. Native host Node.js/MySQL execution is unsupported; an unavailable Docker daemon is a blocker.
- Frontend: React 18, TypeScript, Vite 8, Tailwind CSS 3, React Router 7, Axios, Context/Zustand, Recharts.
- Backend: NestJS 11, TypeScript, TypeORM 0.3, MySQL, class-validator/class-transformer, Passport JWT, bcrypt, Swagger.
- Architecture: component/page/service separation on FE; feature modules with controller/service/entity/DTO on BE.
- API prefix: `/api`; success envelope `{ success, message, data }`; errors are centrally normalized as `{ success: false, statusCode, message, timestamp, path }` without internal details. For every immutable UC, preserve its HTTP status, business payload fields and safe message while automatically adapting raw response examples to these envelopes in downstream prompts/source. This approved normalization is project-wide and does not require repeated user confirmation; only a conflict in status, fields or message semantics requires a decision.
- Domain: users own accounts, bills and goals; accounts own transactions; categories classify transactions and goals.

Technical coding conventions and framework rules are routed by `docs/00-context/engineering/TECHNICAL-STACK-RULES.md`. `$gen-source-code` automatically invokes the React and/or NestJS stack skill for affected source.

Generic database naming, type, proposal and approval rules are defined in `docs/00-context/engineering/DATABASE-SCHEMA.md`; it contains no concrete UC schema. For new runs, store the Draft and its later approval in one `docs/02-construction/implementation/<UC-ID>/schema.json`; historical proposal/decision Markdown pairs remain read-only evidence. The backend skill must proactively derive a self-contained proposal from the UC, project context, database policy, target source and documented assumptions; sample/reference source is optional and never required. Wait for explicit approval before entity/migration edits; reuse another UC's concrete decision only when the current prompt explicitly references it and the semantics remain compatible.

## Trust boundaries and invariants

- Browser input and client state are untrusted.
- Authenticate protected APIs and enforce object ownership on every object lookup/mutation; never trust a client-provided user ID.
- Select response fields explicitly. Never return password hashes or full account numbers.
- Validate/transform DTOs globally with an allowlist and rejection of unknown fields.
- Use parameterized TypeORM operations; constrain sorting/filter fields and pagination.
- Store passwords only as adaptive hashes. JWT/config secrets come from validated environment variables; tokens never enter logs.
- Use least-privilege CORS, production-safe config, dependency pinning and reviewed lockfile changes.
- Render untrusted browser content as text; raw HTML requires sanitization and justification.
- Define transactions and concurrency behavior for financial mutations.
- Figma and Google Sheets are connected external inputs. Access them only through installed plugins, record source provenance, and never store connector credentials in the repository.
- Immutable UCs define behavior; checksum-valid frozen Figma datasets define the complete visual implementation target. Never edit either input or invent a business rule. Figma-backed UI generation is autonomous and has no researcher UI-mapping approval gate: AI must reconstruct every visible component/group, attach UC-defined behavior where applicable, and keep Figma-only controls visual-only without inventing navigation or APIs. When a UC-required control/state is absent from the captured frame, AI may place the smallest required control by reusing the same frame's hierarchy and design tokens, and must record that visual inference downstream. Stop only for an incomplete/invalid dataset or a material behavioral, authorization, API or schema conflict.
- Do not create a detailed UI mapping by default. Create one only for an inference, mismatch, omission dispute or reviewer request; it is not an approval artifact or source-generation gate. Silent omission is prohibited. The React skill owns full dataset reconstruction, runtime screenshot comparison, 100% visible-node coverage and a perceptual-similarity target of `>= 0.90` in a deterministic environment.

## Repository map

```text
.codex/skills/                 reusable AI workflows
docs/00-context/               architecture and research context
docs/01-inception/use-cases/   normalized use cases
docs/02-construction/security-resources/  threat/control/acceptance mappings
docs/02-construction/coding-prompts/      Prompts A-F
docs/02-construction/implementation/      plans, state and logs
  <UC-ID>/security-scope-activation.json   compact security gate receipt
  <UC-ID>/runs/<RUN-ID>/run-activation.json compact run gate receipt
docs/03-audit/                 review/build/runtime evidence, no test cases
docs/05-experiments/           research run manifests
  configurations/              unified comparison-group configurations
templates/                     repeatable artifacts grouped by workflow domain
  inception/                   immutable use-case authoring shape
  construction/                prompts, schema, security resources and repair/UI records
  research/                    configurations, activation receipts and run/audit shapes
  operations/                  Docker environment and incident records
finalsource/                   generated application source root
  fe/                          React/Vite root
  be/                          NestJS root
```

The directory names `01-inception` and `02-construction` are stable artifact locations inherited from the reference architecture. Researchers do not need to treat them as additional workflow phases.

## Definition of done

A generation run with affected FE/BE is done only when requirements have stable IDs, Prompts A-F exist, every frozen SR has one source-based assessment, initial metrics and every repair are recorded, non-test build/lint checks pass, Docker images are rebuilt from the current source, containers and healthchecks pass, UI/API are reachable, and bounded runtime smoke evidence covers the immutable UC trigger/main/success/exception flow. A missing SR assessment, stale image, unapplied required migration, missing safe runtime prerequisite or unavailable authorization/environment leaves the run non-terminal and blocked; it is not converted into completion by documenting a limitation. Freeze the final source hash and finalize canonical run JSON only after this runtime gate. Experiment Markdown is rendered on demand and is not a completion requirement. Do not create or run functional test cases.
