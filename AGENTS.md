# Business vibe coding agent contract

Work only inside this repository unless the researcher expands scope. On setup or review requests, read `CODEX_SETUP_GUIDE.md`. Before planning or editing, read `PROJECT_CONTEXT.md` and `docs/00-context/sources/CONNECTED-SOURCES.md`. For each feature, follow `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md` and `docs/00-context/workflow/gates/EXPERIMENT-CONFIGURATION-GATE.md`.

Use the canonical terminology from `PROJECT_CONTEXT.md`: this repository is a research product, the human operator/approver is the researcher, and actors inside use cases are application users.

## Authoritative inputs

The canonical functional and business specification is the Google Sheet identified in `PROJECT_CONTEXT.md`, tab `Use cases`, columns A-B. Files under `docs/01-inception/use-cases/uc-*.md` are frozen, read-only projections of that source. They contain the functional specification, UML model, OCL business rules, natural-language constraints, UI/API mappings and source provenance.

Never edit a frozen UC to repair a source issue. Report the exact spreadsheet cell/range and stop for the researcher when ambiguity changes behavior, rule meaning, API, schema or evaluation. Refreshing the frozen UC set requires an explicit researcher request and a new source retrieval record.

When a UC contains a Figma reference, resolve it through `resolve-figma-design-dataset`. Use `docs/00-context/FIGMA-LINK-REVIEW.md` as the sole mapping authority when creating or refreshing a dataset.

## Two-phase method

The research method has exactly two phases:

1. **Phase 1 - Generate the business coding prompt.** Read one frozen UC, its UML model, all associated Business Rules, OCL utility definitions, API/Figma sources and the approved prompt template (Prompts A-F for full runs, or Prompts A-D for RQ3 ablation runs). Create an exact Business Rule resource and a Draft business coding prompt. In full runs, Prompt E is Business Rules Compliance and Prompt F is Implementation Context; in RQ3 runs, Prompts E and F are omitted together.
2. **Phase 2 - Generate source code.** After researcher approval and run activation, implement the approved prompt in `finalsource/fe` and/or `finalsource/be`. Record first-pass evidence, assess every frozen BR from the baseline, create bounded bug-fixing sub-prompts for evidenced errors, rebuild/run with Docker Compose and freeze the final source hash.

Do not use a separate dimension to change Business Rule acceptance. Both Full and RQ3 runs evaluate against the identical frozen BR baseline; flow accuracy is a supplementary frozen measurement. The repository provides `audit-figma-ui-accuracy` as an independent, strictly optional skill, invoked manually only on an explicit researcher request. The researcher may inspect UI by eye or skip scoring. Neither invoking this skill nor passing its UI validation is required by any experiment gate; missing/null `ui_accuracy` or UI scores never block BR/flow audit, telemetry, export or completion.

Before Phase 1, resolve every BR and every explicit Basic/Main, Alternative and Exception Flow associated with the UC. Persist `business-rule-baseline.json` and `flow-baseline.json`; do not select, omit or add rules/flows after implementation is visible.

Before Phase 2 source mutation, activate exactly one run through `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/run-activation.json`. Requested model, replicate and run order come from the Confirmed experiment configuration.

## Measurement and hold boundaries

For an identified UC/run, follow the phase-ledger and selection schemas. Prompt/source/repair remain telemetry buckets. After a work turn, present the pending gate; only after researcher confirmation may `advance-experiment-gate` invoke the telemetry engine internally. The researcher never needs to invoke Measure/Audit skills. A gate-close turn performs no later generation work. AI assigns one semantic token label per completed turn; workflow time still sums only Prompt + Source + Repair execution intervals.

Internal telemetry gates never invoke Excel export. After Final Metrics Gate, the researcher may invoke `$export-experiment-excel <UC-ID> <LINK_OR_FILEPATH> <TAB_NAME>`. The standalone skill dynamically maps every result heading to stored canonical JSON, including BR/flow/repair and optional UI data; unavailable or ambiguous values become N/A. It preserves formulas, protected/manual content and canonical evidence, and saves a new workbook copy without clarification questions.

Full and RQ3 first-pass generation end at Source Gate. Preserve source/hash/evidence and wait for confirmation; close telemetry internally without auditing or generating. First-pass Audit Gate separately assesses BRs and flows. Repair Decision Gate authorization remains mandatory before repair.

## Business-rule contract

Preserve each Rule ID and its supplied OCL invariant, precondition or postcondition verbatim. Preserve natural-language and technical constraints for content that is not represented in OCL. Map every rule to its enforceable layer and failure behavior without weakening, duplicating or inventing requirements.

In full runs, Prompt A and Prompt D implement and reference Prompt E rules; they do not redefine them. In RQ3 runs, Prompts A-D derive strictly from functional/UI/API specifications without Prompt E references. Backend/database enforcement is authoritative when a rule crosses trust boundaries. Frontend validation is an additional user-experience control only.

Every frozen BR receives exactly one evidence-based result: `met`, `unmet` or `not_evaluable`. Evidence may come from inspectable source, configuration, non-test build/lint checks and bounded Docker runtime observation. Prompt text alone is never evidence.

## Technical and operational invariants

Apply the project-wide API normalization downstream: successful payloads use `{ success: true, message, data }`; errors use `{ success: false, statusCode, message, timestamp, path }`. Preserve source status, business fields and message semantics.

Keep JWT, password hashing, validation, ownership, secret handling, safe errors, transactionality and concurrency behavior when the UC, BR, API contract or required technical baseline calls for them. They are ordinary application controls, not a separate research intervention.

Database schema changes require a self-contained proposal in `docs/02-construction/implementation/<UC-ID>/schema.json` and explicit researcher approval before entity or migration edits.

Docker Compose v2 is mandatory for FE/BE/MySQL execution. A missing daemon is `BLOCKED`; do not fall back to native host Node.js/MySQL.

Do not create or run tests or test cases. Permitted checks are source inspection, deterministic validators, typecheck, lint, build, Docker health/reachability and bounded manual runtime observation.

Never store credentials, access tokens, passwords, full account numbers or sensitive payloads in source, logs, prompts or reports.
