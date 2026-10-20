# Repository agent contract

Work only inside this repository unless the operator explicitly expands scope. On an explicit setup or repository-review request, read `CODEX_SETUP_GUIDE.md`. For run-scoped work, follow only the skill explicitly invoked in the current turn and the technical inputs that skill authorizes.

## Authoritative project inputs

Files under `docs/01-inception/use-cases/`, `docs/01-inception/business-rules/` and `docs/01-inception/api-contracts/` are frozen, read-only project specifications. `docs/00-context/FIGMA-LINK-REVIEW.md` is the mapping authority for approved Figma capture targets. `docs/00-context/engineering/schema.dbml` and the configured live database describe the database structure available to the active run. The clean source archive is integrity-pinned by `.codex/skills/restore-source-baseline/assets/source-baseline.sha256`.

Never alter a frozen input, baseline, configuration or recorded result to make an operation pass. When an authorized project input is ambiguous or conflicts with another pinned input, report the exact location and stop for operator resolution. A changed frozen input requires refreshed dependent checksums and a new compatible run configuration.

## Shared operational constitution

These rules apply to every skill.

Execute a top-level operation only when the operator explicitly invokes that operation in the current turn. The invocation authorizes the active skill and only subordinate skills that its own contract explicitly requires to finish the same operation. It does not authorize any other skill.

Read only:

- the active skill;
- references explicitly required by the active skill for the requested operation;
- explicitly authorized subordinate skills;
- the current application codebase;
- exact active-run inputs and handoff artifacts required by the active skill.

Do not search for, list, open, preload, summarize or infer the instructions, templates, references or scripts of another operation. Do not inspect an operation merely because its name, directory or short description is visible. Do not read an overall command roadmap. End after the requested operation is complete; never prepare or execute another top-level operation automatically.

Operation-owned prompts and templates are private to their owning operation. Each is a separate instruction source; reading one never authorizes reading another. Shared environment documents must not restate, interpret or supplement an operation-owned prompt.

Operations exchange information only through their validated handoff artifacts. Reading an artifact does not authorize reading the provider skill's instructions. Deterministic helpers may inspect exact active-run identities, state, hashes and receipts required for validation, but must not expose unrelated artifact contents or another operation's instructions to the AI context.

During run-scoped operations, all repository helper scripts, including skill-owned and shared helpers, are execute-only. Do not open or read their source code; only execute them as required and read their returned output.

Project inputs differ from skill instructions. An active skill may inspect project inputs that its own contract permits. Do not add a global prohibition against autonomous discovery of permitted project inputs, and do not use shared documentation to direct attention toward particular requirement categories or evaluation criteria.

During run-scoped work, do not open, compare or use configurations, results, reports or other artifacts belonging to another UC, run or model. If encountered incidentally, disregard them. `finalsource` is the permitted cumulative application codebase and is not treated as a prior result artifact.

Use only the current working tree and current `HEAD` during run-scoped work. Do not enumerate, open, compare or infer context from other branches, tags, remote refs, reflog, commit messages or repository history unless the operator explicitly requests a repository review outside the run.

Any path containing `<UC-ID>` or its URL-encoded form `%3CUC-ID%3E` is a generic pattern. Substitute the active ID before using it; never treat the placeholder as a literal file.

When a material ambiguity, contradiction or missing decision appears, do not invent or change requirements, behavior, API, data structures, ownership, security or evaluation semantics. Report exact evidence and wait unless the active skill defines a specific evidence-preserving outcome.

## Technical environment

Database handling follows `docs/00-context/engineering/DATABASE-SCHEMA.md`. The configured DBML, migration history and database fingerprint are immutable within a run. Authorized operations may perform DML, but never DDL, schema synchronization, migration execution or migration/DBML edits. Database baseline changes require operator setup and a new compatible configuration.

Docker Compose v2 is the supported FE/BE/MySQL runtime. Do not fall back to native host services. Do not reset volumes, execute setup migrations or perform destructive cleanup unless the operator explicitly requests that action outside an active run.

Do not create or run tests or test cases unless the active skill explicitly authorizes them. Permitted non-test checks include deterministic validators, source inspection, typecheck, lint, build, Docker health/reachability and bounded runtime observation when required by the active skill.

Never store credentials, access tokens, passwords, full account numbers or sensitive payloads in source, logs, prompts, reports or evidence. Never commit `.env` or raw sensitive logs.
