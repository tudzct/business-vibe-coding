---
name: gen-coding-prompt
description: Generate the configured coding prompt from validated, pre-existing active-run inputs.
---

# Generate Coding Prompt

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Accept one readable `docs/01-inception/use-cases/uc-*.md` path. Optional `--configuration <config.json>`, `--run-id <RUN-ID>` and `--run-json <canonical.json>` disambiguate existing inputs; explicit values must match their recorded identities. Resolve only a unique matching Canonical Run JSON. Never select the newest file.

## Primary Inputs

The following are the only project-content inputs authorized for this operation. Do not inspect or use any other project-content source.

1. **The configured prompt template**: `templates/construction/coding-prompt.template.md`.
2. **The single active frozen use case**: The explicit `docs/01-inception/use-cases/uc-*.md` path provided.
3. **The active frozen business-rule specification**: Only the exact `business_rule_path` returned by successful preflight validation.
4. **The ordered active API contracts (if applicable)**: Only the exact paths declared in the active UC's `Related API IDs` section after preflight validation. If `Related API IDs` is `None.`, **DO NOT read any file in `docs/01-inception/api-contracts/`**.
5. **The database baseline schema**: Read `docs/00-context/engineering/schema.dbml` ONCE after preflight PASS.
6. **The configured live database**: Read-only inspection is permitted after preflight PASS. Do not insert, update or delete data; execute DDL; run migrations or schema synchronization; or change tables, columns, indexes, constraints, grants or any other database state.
7. **The active UC's resolved Figma evidence**: Only the local snapshot JSON/node directory returned by `resolve.py` from the configured frozen dataset.
8. **The entire current application source**: Read the cumulative source under `finalsource/`, including implementation added by earlier UCs. This operation must not modify source files.

### Technical and Control-Plane Material

Technical and control-plane material may be read only to operate this workflow and must not add product behavior or requirements. Permitted material is `AGENTS.md`, this skill and its own references, [technical stack rules](../../../docs/00-context/engineering/TECHNICAL-STACK-RULES.md), [database policy](../../../docs/00-context/engineering/DATABASE-SCHEMA.md), the [active-run contract](../../../docs/00-context/workflow/WORKFLOW-CONTRACT.md), and output emitted by required execute-only helpers.

## Content Boundary

Do not read or use the following as prompt-generation content:

- any pre-existing generated Coding Prompt under `docs/02-construction/coding-prompts/`;
- any `defects-handoff.json`, any file under a `repairs/` directory, or any file under a `flow-accuracy/` directory beneath `docs/02-construction/implementation/`;
- any file under `docs/03-audit/`;
- `docs/00-context/FIGMA-LINK-REVIEW.md` or any Figma dataset content outside the exact target returned by the resolver; or
- the direct contents of `docs/04-experiments/configurations/*.json`, `docs/04-experiments/<UC-ID>/canonical-run-*.json`, `docs/02-construction/implementation/<UC-ID>/*-baseline.json`, or `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/{run-activation,phase-ledger,workflow-metrics}.{json,md}`.

Execute-only helpers may inspect exact active-run configuration, baseline, mapping, database and telemetry state internally. Use only the paths, identities, checksums, statuses and validation results they emit; do not open the managed files merely because a helper reports their paths.

## Phase 1: Read-Only Preflight & START (Execute-Only)

Before START, run the deterministic read-only preflight over the operator-prepared inputs. Continue only when it passes for the exact active identity and operation state.

The operator may prepare these files manually, with another model, external Python or optional repository helpers. Validate their contents, identities and checksums; never require a particular creator, skill invocation, creation command or fabricated creation receipt. Configuration has no confirmation gate or summary for approval. Root `.env` is not required.

Resolve an available Python executable and execute this read-only command:

```text
<python-executable> .codex/scripts/preflight_configuration.py --uc-id <UC-ID> --use-case <use-case.md> [--run-json <canonical.json>]
```

If `--run-json` (or `--configuration` / `--run-id`) is supplied explicitly by the operator, include it. If omitted, execute preflight with `--uc-id <UC-ID>` (uppercase, e.g. `UC-01`) and `--use-case`; the preflight script internally and deterministically resolves the unique matching Canonical Run JSON under `docs/04-experiments/<UC-ID>/`. Do not search, scan, or select files manually. If missing or ambiguous, preflight fails deterministically.

Use the `canonical_run.path` returned in preflight's JSON stdout as `<canonical.json>` for timestamp capture and subsequent steps.

If and only if this command exits with `DOCKER_ACCESS_REQUIRED`, rerun the identical read-only command once with host approval. A denied approval or failed retry blocks the operation. Never elevate, retry or reinterpret any other validation error.

Every input required by preflight must be present and schema-valid on every invocation. Missing, malformed, ambiguous or conflicting inputs stop the turn immediately with the exact file, field or checksum error. Do not create, fill, normalize, repair, replace or initialize prepared inputs during preflight or prompt generation. Do not invoke preparation or activation logic to fill a gap.

Referenced provenance, frozen UC, configured checksum-pinned API dependencies when present, Figma and template dependencies must also validate under their existing contracts; they are not silently generated as a workaround. A frozen UC whose required `Related API IDs` section contains exactly `None.` has an empty configured API inventory and requires no API artifact. If a checksum-normalization receipt is required by the existing UC contract, it must already exist.

The same preflight imports `database_baseline.py` internally to verify the ordered TypeORM migration history, DBML bytes and live MySQL metadata against the configured pins. Follow [database policy](../../../docs/00-context/engineering/DATABASE-SCHEMA.md). Require an initialized running Compose database and `finalsource/.env`; root `.env` remains unnecessary. Missing/mismatched input blocks before START.

Once preflight PASSES:
Capture live prompt START immediately:
```text
<python-executable> .codex/scripts/capture_timestamp.py --run-json <canonical.json> --phase prompt_generation --event start --segment-id <one-unique-segment-id> --source-revision sha256:<actual-64-hex>
```
The helper resolves the active rollout and turn internally; never supply or guess either path or ID.

## Phase 2: Read Authorized Inputs

After preflight PASS, read the authorized [Primary Inputs](#primary-inputs) under their declared access boundaries. This phase is read-only; persistence is limited to the Draft and required telemetry in Phase 4.

## Phase 3: Author the Coding Prompt Draft

1. Read `templates/construction/coding-prompt.template.md` in full and strictly follow the instructions declared inside it.
2. Author the Coding Prompt Draft at the canonical output path. Do not copy SKILL/reference instructions into the artifact or create any additional content artifact.
3. If a template instruction cannot be completed because an authorized input is missing, invalid, ambiguous, or contradictory, report the exact input problem and stop. Do not repair an input, modify source or database state, or invent a replacement value.

## Phase 4: Save Draft, END Timing & Post-Validation (Execute-Only)

1. **Persist the Draft**: Write the prompt to `docs/02-construction/coding-prompts/<UC-ID>-coding-prompt.md`.
2. **Capture live prompt END immediately**:
   ```text
   <python-executable> .codex/scripts/capture_timestamp.py --run-json <canonical.json> --phase prompt_generation --event end --segment-id <one-unique-segment-id> --source-revision sha256:<actual-64-hex>
   ```
3. **Execute prompt contract validation**:
   ```text
   <python-executable> .codex/scripts/validate_prompt_contract.py --configuration <config.json> --uc-id <UC-ID> --run-id <RUN-ID> --prompt docs/02-construction/coding-prompts/<UC-ID>-coding-prompt.md --allow-draft
   ```
4. **Recheck configuration integrity**:
   ```text
   <python-executable> .codex/scripts/preflight_configuration.py --uc-id <UC-ID> --run-json <canonical.json> --use-case <use-case.md> --expected-checksum <original-checksum>
   ```
5. **Report and terminate**: Present the saved Draft path and validation result, then stop. Do not inspect or prepare any subsequent operation.

The existing timing helper appends actual timestamps to its runtime journal after successful input validation. This is measurement evidence, not initialization of the prepared inputs. Preflight must not mutate the Canonical Run JSON. Never invent a token deduction or promise zero measurement overhead.
