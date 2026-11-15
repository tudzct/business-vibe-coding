---
name: gen-coding-prompt
description: Generate the configured coding prompt from validated, pre-existing active-run inputs.
---

# Generate Coding Prompt

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Resolve the exact prepared active-run identity from the invocation and validated state. Explicit identity values must match their recorded identities. Resolve one unique matching Canonical Run JSON; never select the newest file.

## Technical and Control-Plane Material

Technical and control-plane material may be read only to operate this workflow and must not add product behavior or requirements. Permitted material is `AGENTS.md`, this skill and its own references, [technical stack rules](../../../docs/00-context/engineering/TECHNICAL-STACK-RULES.md), [database policy](../../../docs/00-context/engineering/DATABASE-SCHEMA.md), the [active-run contract](../../../docs/00-context/workflow/WORKFLOW-CONTRACT.md), and output emitted by required execute-only helpers.

## Content Boundary

Do not read or use the following as prompt-generation content:

- any pre-existing generated Coding Prompt under `docs/02-construction/coding-prompts/`;
- any `defects-handoff.json`, any file under a `repairs/` directory, or any file under a `flow-accuracy/` directory beneath `docs/02-construction/implementation/`;
- any file under `docs/03-audit/`;
- the direct contents of `docs/04-experiments/configurations/*.json`, `docs/04-experiments/<UC-ID>/canonical-run-*.json`, `docs/02-construction/implementation/<UC-ID>/*-baseline.json`, or `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/{run-activation,phase-ledger,workflow-metrics}.{json,md}`.

Execute-only helpers may inspect exact active-run configuration, baseline, mapping, database and telemetry state internally. Their output is validation metadata, not prompt-generation material; do not open a managed file merely because a helper reports its path.

## Phase 1: Read-Only Preflight & START (Execute-Only)

Before START, run the deterministic read-only preflight over the operator-prepared inputs. Continue only when it passes for the exact active identity and operation state.

The operator may prepare these files manually, with another model, external Python or optional repository helpers. Validate their contents, identities and checksums; never require a particular creator, skill invocation, creation command or fabricated creation receipt. Configuration has no confirmation gate or summary for approval. Root `.env` is not required.

Resolve an available Python executable and execute this read-only command:

```text
<python-executable> .codex/scripts/preflight_configuration.py --uc-id <UC-ID> [--run-json <canonical.json>]
```

If `--run-json` (or `--configuration` / `--run-id`) is supplied explicitly by the operator, include it. If omitted, execute preflight with `--uc-id <UC-ID>` (uppercase, e.g. `UC-01`); the preflight script internally and deterministically resolves the unique matching Canonical Run JSON under `docs/04-experiments/<UC-ID>/`. Do not search, scan, or select files manually. If missing or ambiguous, preflight fails deterministically.

Use the `canonical_run.path` returned in preflight's JSON stdout as `<canonical.json>` for timestamp capture and subsequent steps.

If and only if this command exits with `DOCKER_ACCESS_REQUIRED`, rerun the identical read-only command once with host approval. A denied approval or failed retry blocks the operation. Never elevate, retry or reinterpret any other validation error.

Every input required by preflight must be present and schema-valid on every invocation. Missing, malformed, ambiguous or conflicting inputs stop the turn immediately with the exact file, field or checksum error. Do not create, fill, normalize, repair, replace or initialize prepared inputs during preflight or prompt generation. Do not invoke preparation or activation logic to fill a gap.

Every dependency required by the prepared run state must validate internally under its existing contract; no missing dependency, normalization receipt or prepared artifact is silently generated as a workaround.

The same preflight verifies the prepared database baseline internally under [database policy](../../../docs/00-context/engineering/DATABASE-SCHEMA.md). Require an initialized running Compose database and `finalsource/.env`; root `.env` remains unnecessary. A missing or mismatched prepared input blocks before START.

Once preflight PASSES:
Capture live prompt START immediately:
```text
<python-executable> .codex/scripts/capture_timestamp.py --run-json <canonical.json> --phase prompt_generation --event start --segment-id <one-unique-segment-id> --source-revision sha256:<actual-64-hex>
```
The helper resolves the active rollout and turn internally; never supply or guess either path or ID.

## Phase 2: Author the Coding Prompt Draft

1. Read `templates/construction/coding-prompt.template.md` in full and follow its instructions.
2. Author the Coding Prompt Draft at the canonical output path. Do not copy SKILL/reference instructions into the artifact or create any additional content artifact.
3. If a template instruction cannot be completed because required material is missing, invalid, ambiguous, or contradictory, report the exact problem and stop. Do not repair an input, modify source or database state, or invent a replacement value.

## Phase 3: Save Draft, END Timing & Post-Validation (Execute-Only)

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
   <python-executable> .codex/scripts/preflight_configuration.py --uc-id <UC-ID> --run-json <canonical.json> --expected-checksum <original-checksum>
   ```
5. **Report and terminate**: Present the saved Draft path and validation result, then stop. Do not inspect or prepare any subsequent operation.

The existing timing helper appends actual timestamps to its runtime journal after successful input validation. This is measurement evidence, not initialization of the prepared inputs. Preflight must not mutate the Canonical Run JSON. Never invent a token deduction or promise zero measurement overhead.
