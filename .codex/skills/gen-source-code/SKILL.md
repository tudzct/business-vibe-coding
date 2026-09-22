---
name: gen-source-code
description: Implement source from an approved Full Prompt A-F or RQ3 Prompt A-D and preserve first-pass evidence before the subsequent audit command.
---

# Generate Source Code

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Accept one approved Full `*-business-coding-prompt.md` or RQ3 `*-rq3-coding-prompt.md` path. Read [FILE-DRIVEN-WORKFLOW.md](../../../docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md), Full/RQ3 boundaries, engineering stack rules and execution timing protocol.

1. Resolve exact UC/run, pinned Confirmed configuration, four existing prepared inputs, approved prompt checksum and closed prompt telemetry through `gen-coding-prompt/scripts/preflight_configuration.py --uc-id <UC-ID> --run-json <canonical.json> --stage source`. Validate optional activation when present; never require/create an activation file or approval turn. Missing/invalid generation inputs block without initialization or repair.
2. Validate prompt structure, variant and generation provenance. For RQ3, validate BR baseline identity through metadata/validators without loading BR expressions/resources into generation context.
3. Preserve cumulative provenance in `source-input.json`: configuration/model/variant/replicate/order, current input hash and predecessor hash. Do not reset between cumulative UCs or inherit another condition without baseline evidence. Source preflight checks the fifth input using the migration history/head, DBML hash and runtime MySQL fingerprint. Read the pinned DBML and follow [database policy](../../../docs/00-context/engineering/DATABASE-SCHEMA.md); entity/query changes map existing structure. Resolve API ambiguity or pinned-schema incompatibility before mutation. If a schema gap is discovered after START, capture actual END, preserve partial source/evidence and stop. Researcher setup changes require a new baseline/configuration/run, not resumption with edited pins.
4. Capture START immediately before first source mutation. Invoke `$build-nest-backend` and/or `$build-react-frontend`; extend the existing source only under `finalsource/`. Capture END immediately after complete first-pass generation, before build/audit/runtime/repair. Preserve immutable first-pass source/hash/diff/model/raw timing evidence; tokens await the subsequent close turn.
5. End with `$measure-uc-workflow close-phase source_generation`. No Source Gate confirmation or audit in this work turn. Source close records telemetry; the next researcher command directly requests first-pass BR/flow audit. Do not request audit-result approval or automatically initiate repair.

Repair belongs to a subsequent `$bug-fixing-sub-prompt` request and automatically includes terminal BR/flow/runtime verification. Frozen baselines, API envelopes, required application controls, Figma dataset mapping and Docker Compose v2 remain. Missing/null optional UI results never block the sequence.
