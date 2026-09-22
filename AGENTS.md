# Business vibe coding agent contract

Work only inside this repository unless the researcher expands scope. On setup or review requests, read `CODEX_SETUP_GUIDE.md`. Before planning or editing, read `PROJECT_CONTEXT.md` and `docs/00-context/sources/CONNECTED-SOURCES.md`. For each feature, follow `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md` and `docs/00-context/workflow/gates/EXPERIMENT-CONFIGURATION-GATE.md`.

Use the canonical terminology from `PROJECT_CONTEXT.md`: this repository is a research product, the human operator/approver is the researcher, and actors inside use cases are application users.

## Authoritative inputs

The canonical functional and business specification is the Google Sheet identified in `PROJECT_CONTEXT.md`, tab `Use cases`, columns A-B. Files under `docs/01-inception/use-cases/uc-*.md` are frozen, read-only projections of that source. They contain the functional specification, UML model, OCL business rules, natural-language constraints, UI/API mappings and source provenance.

Never edit a frozen UC to repair a source issue. Report the exact spreadsheet cell/range and stop for the researcher when ambiguity changes behavior, rule meaning, API, schema or evaluation. Refreshing the frozen UC set requires an explicit researcher request and a new source retrieval record.

When a UC contains a Figma reference, resolve it through `resolve-figma-design-dataset`. Use `docs/00-context/FIGMA-LINK-REVIEW.md` as the sole mapping authority when creating or refreshing a dataset.

## Two-phase method

The research method has exactly two phases:

1. **Phase 1 - Generate the business coding prompt.** Read one frozen UC, its UML model and applicable API/Figma sources under the existing input boundaries in `docs/00-context/workflow/FULL-RQ3-CONTRACT.md`. Source locations are recorded in `docs/00-context/sources/CONNECTED-SOURCES.md`. Validate the prepared inputs and create a Draft using the configured template: Prompts A-F for Full or Prompts A-D for RQ3.
2. **Phase 2 - Generate source code.** After the prompt-close command approves the Draft, implement the approved prompt in `finalsource/fe` and/or `finalsource/be`. Record first-pass evidence, assess every frozen BR from the baseline, create bounded bug-fixing sub-prompts for evidenced errors, rebuild/run with Docker Compose and freeze the final source hash.

Do not use a separate dimension to change Business Rule acceptance. Both Full and RQ3 runs evaluate against the identical frozen BR baseline; flow accuracy is a supplementary frozen measurement. The researcher may inspect UI by eye or skip scoring. Missing/null `ui_accuracy` or UI scores never block BR/flow audit, telemetry, export or completion.

Before Phase 1, resolve every BR and every explicit Basic/Main, Alternative and Exception Flow associated with the UC. Persist `business-rule-baseline.json` and `flow-baseline.json`; do not select, omit or add rules/flows after implementation is visible.

Before Phase 2 source mutation, validate the pinned configuration, approved prompt and closed prompt telemetry. `run-activation.json` is optional and validated when present; no activation file or turn is required.

## Command and measurement boundaries

Follow the command sequence in `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md`: generate prompt; close prompt; generate source; close source; audit BR/flows; repair when needed; finalize (which closes/skips Repair and finalizes telemetry atomically); optionally export. Each researcher command authorizes that step without an additional confirmation gate. Closing prompt also approves and pins the Draft. Invoking `$bug-fixing-sub-prompt` authorizes and begins evidenced repair in the same turn. Initial audit and follow-up measurement never automatically start repair.

Require four prepared research JSON inputs (Confirmed configuration, frozen BR baseline, frozen flow baseline and Draft Canonical Run JSON) plus the fifth database input: configured DBML and the existing MySQL schema. Validate them read-only using the existing preflight; no extra user turn. Never initialize or repair missing inputs during prompt/source generation, require root `.env`, or ask for configuration reconfirmation. Keep existing `gates` fields/receipts only as internal command bookkeeping; preserve recorded evidence.

Save partial flow results immediately. Offer researcher-supplied verdicts or bounded LLM measurement. Save either path with attribution, acknowledge the update and wait for the subsequent repair command if defects remain. Remaining unknown accepted flow verdicts block new repair authorization; pending evidence is not a defect. Use `accepted-audit-results-v1`, retaining conclusive results across repairs and later inconclusive audits. Do not fabricate runtime proof for researcher verdicts or reset accepted results to null.

If all BRs and flows pass on unchanged source, record repair unnecessary during audit, skip Turn 6 and let `finalize-workflow` persist the skipped Repair bucket and final workflow in Turn 7. Authorized repair automatically verifies BR/flow/runtime and freezes final source hash/status before returning; the same finalize command closes its telemetry. No separate audit-result approval, Repair Decision confirmation, Repair-close command, final-audit or Final Metrics confirmation is required.

Prompt/source/repair remain telemetry buckets within two phases. Close telemetry only in the subsequent requested close turn; do no source/audit/repair work in a measurement turn. Assign one semantic token label per work turn; observations must match any captured core execution, including repair's integrated audit under label `repair`. Counted time sums only Prompt + Source + Repair execution intervals; Repair includes integrated BR/flow/runtime verification and final evidence/hash/status persistence before END. Use `generation_execution_with_repair_audit_v2`. Standalone audit remains workflow-only tokens, outside counted execution time. Export remains separate after finalization, excluded from workflow tokens/time; it copies validated skipped-Repair zero values and preserves canonical evidence, formulas/manual/protected content and saves a new workbook copy.

## Business-rule contract

Baseline preparation and validation preserve source Rule IDs, OCL and natural-language text exactly. In RQ3 runs, Prompts A-D derive strictly from functional/UI/API specifications without Prompt E references.

Every frozen BR receives exactly one evidence-based result: `met`, `unmet` or `not_evaluable`. Evidence may come from inspectable source, configuration, non-test build/lint checks and bounded Docker runtime observation. Prompt text alone is never evidence.

## Shared operational constitution

These rules apply to every skill and to both Full and RQ3, independently of the selected coding-prompt template. Skills inherit them; no prompt or missing local repetition grants an exception.

During source generation, generate source only and modify only files required by the active use case. Do not introduce unapproved public API, ownership, dependency or destructive-data changes. Stop for researcher resolution when a material business/API/schema/ownership decision is missing. Skill-specific preflight checks, evidence requirements and stopping conditions remain mandatory.

Apply the project-wide API normalization downstream: successful payloads use `{ success: true, message, data }`; errors use `{ success: false, statusCode, message, timestamp, path }`. Preserve source status, business fields and message semantics.

Keep JWT, password hashing, validation, ownership, secret handling, safe errors, transactionality and concurrency behavior when the UC, BR, API contract or required technical baseline calls for them. They are ordinary application controls, not a separate research intervention.

Database follows `docs/00-context/engineering/DATABASE-SCHEMA.md`. The researcher prepares a complete initial schema and may add reviewed TypeORM migrations between runs when necessary; retain cumulative data. Configuration pins exactly `migration_head`, `dbml_sha256` and `schema_fingerprint_sha256` using its existing status. Read `docs/00-context/engineering/schema.dbml` and map code to existing tables. Schema and migration inputs are immutable within each run. AI may perform authorized business DML but never DDL, migration execution/edits, DBML edits or schema sync. Missing structure blocks work; preserve actual END/partial evidence, then researcher setup and a new configuration/run are required if the baseline changes. Prompt/Source verify pins/history before START; Audit/Repair recheck drift. Within a run, rebuild only backend/frontend with `--no-deps` so Docker cannot invoke the setup migration service. Measure/activation/export perform no live DB check.

Docker Compose v2 is mandatory for FE/BE/MySQL execution. A missing daemon is `BLOCKED`; do not fall back to native host Node.js/MySQL.

Generation preflight reads the existing database only. Never start, reset or bootstrap database inputs, replace expected pins, or dump SQL/metadata into generation context. Use the existing validators to report missing or mismatched inputs.

Do not create or run tests or test cases. Permitted checks are source inspection, deterministic validators, typecheck, lint, build, Docker health/reachability and bounded manual runtime observation.

Never store credentials, access tokens, passwords, full account numbers or sensitive payloads in source, logs, prompts or reports.

Keep secrets out of client bundles, `.env.example`, public API documentation and persisted tool output. Never commit `.env` or raw sensitive logs. Use sanitized evidence. Destructive database resets, volume/image cleanup and destructive migrations require an explicit researcher request outside an active run. Preserve cumulative data and frozen evidence.

Prompt telemetry close (Turn 2) automatically creates a missing `run-activation.json` from the pinned configuration and approved prompt, or validates an existing receipt without replacing it. The receipt records the actual prompt-close turn/time, before source generation. No standalone activation turn is required.
