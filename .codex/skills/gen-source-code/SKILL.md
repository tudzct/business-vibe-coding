---
name: gen-source-code
description: Implement source from one approved coding prompt and preserve the resulting source evidence.
---

# Generate Source Code

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Accept one [approved `*-business-coding-prompt.md`](../../../docs/02-construction/coding-prompts/%3CUC-ID%3E-business-coding-prompt.md) path. Read the [active-run contract](../../../docs/00-context/workflow/WORKFLOW-CONTRACT.md), relevant engineering stack rules and this skill's own references. Do not open another top-level skill, evaluation rubric, correction template or command roadmap.

Read the approved prompt together with the original specification resources it references: the frozen use case, any ordered checksum-pinned API contracts returned by preflight, resolved frozen Figma evidence when applicable and the configured DBML. An empty API inventory is valid only when the frozen UC's required `Related API IDs` section contains exactly `None.`; in that case do not discover or infer an API contract. Use this input set to generate source against the existing application codebase.

1. Resolve exact UC/run, pinned Confirmed configuration, four existing prepared inputs, approved prompt checksum and closed prompt telemetry through `gen-coding-prompt/scripts/preflight_configuration.py --uc-id <UC-ID> --run-json <canonical.json> --stage source`. Validate optional activation when present; never require/create an activation file or approval turn. Missing/invalid generation inputs block without initialization or repair.
2. Validate prompt structure, variant and generation provenance, including exact ordered `source_api_contracts` paths against pinned API entries, or the exact `None.` marker against an empty inventory; configuration validation separately verifies any configured IDs and SHA-256 values. Read only relevant stack sources and target manifests.
3. Preserve cumulative provenance in `source-input.json`: configuration/model/variant/replicate/order, current input hash and predecessor hash. Do not reset between cumulative UCs or inherit another condition without baseline evidence. Source preflight checks the fifth input using the migration history/head, DBML hash and runtime MySQL fingerprint. Read the pinned DBML and follow [database policy](../../../docs/00-context/engineering/DATABASE-SCHEMA.md); entity/query changes map existing structure. If a schema gap is discovered after START, capture actual END, preserve partial source/evidence and stop. Operator setup changes require a new baseline/configuration/run, not resumption with edited pins.
4. Capture START immediately before first source mutation. Invoke `$build-nest-backend` and/or `$build-react-frontend`; extend the existing source only under `finalsource/`. Capture END immediately after the approved prompt has been implemented, before any separate operation. Preserve immutable source/hash/diff/model/raw timing evidence.
5. Report the changed files, preserved evidence and any current blocker, then stop. Do not inspect, describe or prepare another operation.
