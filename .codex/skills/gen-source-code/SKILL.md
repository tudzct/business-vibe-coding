---
name: gen-source-code
description: Implement source from one approved coding prompt and preserve the resulting source evidence.
---

# Generate Source Code

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Accept one [approved `*-coding-prompt.md`](../../../docs/02-construction/coding-prompts/%3CUC-ID%3E-coding-prompt.md) path. Read the [active-run contract](../../../docs/00-context/workflow/WORKFLOW-CONTRACT.md), relevant engineering stack rules and this skill's own references.

The approved coding prompt and the current application source under `finalsource/` are the exclusive implementation inputs for deciding what code to write. Read the prompt in full, inspect the current source as needed and implement the requested change compatibly with that source. Technical and workflow documents authorized below constrain how the operation is performed; they do not add product behavior. If the prompt conflicts with the current source or an immutable technical boundary, report the exact conflict and stop instead of silently inventing a resolution.

## Source-Generation Technical Constraints

Generate source only. Modify only files under `finalsource/` required by the approved prompt. Follow the shared technical rules that prohibit creating or running tests or test cases and prohibit active-run database schema changes. Do not introduce an unapproved public API, ownership model, dependency or destructive change.

This operation adds only the following explicit read prohibitions. This list is exhaustive for this operation: it does not prohibit a repository path that is not listed here, subject to the shared operational constitution.

- Do not open or read any file under `docs/01-inception/`.
- Do not open or read `docs/00-context/FIGMA-LINK-REVIEW.md`, any file under `resource/figma-design-dataset/`, or `docs/00-context/engineering/schema.dbml`.
- Do not open any generated Coding Prompt other than the one exact approved active-run prompt supplied to this operation.
- Do not open or read any `defects-handoff.json`, any file under a `repairs/` directory, or any file under a `flow-accuracy/` directory beneath `docs/02-construction/implementation/`.
- Do not open or read any file under `docs/03-audit/`.
- Do not open the contents of `docs/04-experiments/configurations/*.json`, `docs/04-experiments/<UC-ID>/canonical-run-*.json`, `docs/02-construction/implementation/<UC-ID>/*-baseline.json`, or `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/{run-activation,phase-ledger,workflow-metrics}.{json,md}`. Passing an already resolved path to an execute-only helper and consuming that helper's emitted result remain permitted.
- Do not directly connect to, read or query a live database, including through SQL, ORM, an application runtime or an exploratory database client. Static source may define entities, repositories, query builders, SQL or other future database interactions, but this operation must not execute them against the database. Deterministic helper validation may inspect the pinned database state internally without exposing database contents to the agent.

For clarity, the following remain permitted and do not form a closed whitelist: `AGENTS.md`, the active-run contract, `docs/00-context/engineering/TECHNICAL-STACK-RULES.md`, `docs/00-context/engineering/DATABASE-SCHEMA.md`, this skill and its own references, the explicitly invoked build skills and their required technical references, the approved coding prompt, and `finalsource/`. Technical material constrains execution but does not add product behavior. Reading `DATABASE-SCHEMA.md` does not authorize reading `schema.dbml` or directly inspecting the live database. `source-input.json` and `source-output.json` remain operation-owned evidence; preserve them as required, but do not treat them as implementation requirements.

At the START/END boundaries below, execute `.codex/scripts/capture_timestamp.py --run-json <canonical.json> --phase source_generation --event <start|end> --segment-id <one-unique-segment-id> --source-revision sha256:<actual-64-hex>`. The helper resolves the active rollout and turn internally; never supply or guess either path or ID.

1. Resolve exact UC/run, pinned Confirmed configuration, four existing prepared inputs, approved prompt checksum and closed prompt telemetry through `.codex/scripts/preflight_configuration.py --uc-id <UC-ID> --run-json <canonical.json> --stage source`. If and only if this command exits with `DOCKER_ACCESS_REQUIRED`, rerun the identical read-only command once with host approval; denied approval or a failed retry blocks, and no other validation error is elevated or retried. Validate optional activation when present; never require/create an activation file or approval turn. Missing/invalid generation inputs block without initialization or repair.
2. Validate prompt structure and identity; configuration validation separately verifies configured input identities and SHA-256 values. Read only relevant stack sources and target manifests.
3. Preserve cumulative provenance in `source-input.json`: configuration/model/replicate/order, current input hash and predecessor hash. Do not reset between cumulative UCs or inherit another run without baseline evidence. Source preflight checks the fifth input using the migration history/head, DBML hash and runtime MySQL fingerprint without exposing that input as an implementation source. Follow [database policy](../../../docs/00-context/engineering/DATABASE-SCHEMA.md); entity/query changes must remain compatible with the approved prompt and current application source. If a schema gap is discovered after START, capture actual END, preserve partial source/evidence and stop. Operator setup changes require a new baseline/configuration/run, not resumption with edited pins.
4. Capture START immediately before first source mutation. Invoke `$build-nest-backend` and/or `$build-react-frontend`; extend the existing source only under `finalsource/`. Capture END immediately after the approved prompt has been implemented, before any separate operation. Preserve immutable source/hash/diff/model/raw timing evidence.
5. Report the changed files, preserved evidence and any current blocker, then stop. Do not inspect, describe or prepare another operation.
