---
name: gen-coding-prompt
description: Generate the configured coding prompt from validated, pre-existing active-run inputs.
---

# Generate Coding Prompt

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Accept one readable `docs/01-inception/use-cases/uc-*.md` path. Optional `--configuration <config.json>`, `--run-id <RUN-ID>` and `--run-json <canonical.json>` disambiguate existing inputs; explicit values must match their recorded identities. Resolve only a unique matching Canonical Run JSON. Never select the newest file.

## Strict Read Boundary (Mandatory)

To prevent context contamination, token waste, and accidental data leakage, prompt generation must adhere to a strict closed whitelist. Reading any file outside this list is a direct violation of operational policy.

### 1. Closed Whitelist (Only Permitted Reads)
During this operation, the agent may read ONLY:
1. **The single active frozen use case**: The explicit `docs/01-inception/use-cases/uc-*.md` path provided.
2. **The configured prompt template**: `templates/construction/coding-prompt.template.md`.
3. **The ordered active API contracts (if applicable)**: Only the exact paths declared in the active UC's `Related API IDs` section after preflight validation. If `Related API IDs` is `None.`, **DO NOT read any file in `docs/01-inception/api-contracts/`**.
4. **The database baseline schema**: Read `docs/00-context/engineering/schema.dbml` ONCE after preflight PASS.
5. **The resolved Figma design target**: Only the specific local snapshot JSON/node directory returned by `resolve.py` for the UC's mapped frame/node.
6. Investigate the source code from D:\business-vibe-coding\finalsource
7. **Additional inputs explicitly required by the prompt template**: The agent may read additional baseline/specification inputs if a section or instruction in `templates/construction/coding-prompt.template.md` explicitly requires them.
### 2. Forbidden Reads (Strict Negative Constraints)
- **Execute-only scripts**: All repository and skill helper scripts (`.codex/scripts/*.py`, `.codex/skills/*/scripts/*.py`) are execute-only. **NEVER open, view, or read Python script source code**. Only execute them via CLI and inspect stdout/stderr.
- **No prior or existing coding prompts**: **NEVER open, read, or inspect any file in `docs/02-construction/coding-prompts/`** (including prior drafts or prompts from other UCs).
- **No other use cases**: **NEVER open or read any other UC file** under `docs/01-inception/use-cases/`.
- **No experiment artifacts or logs**: **NEVER open or read files in `docs/04-experiments/`** (e.g., reports, excel sheets, previous run journals, audits) other than reading the single active Canonical Run JSON / Configuration JSON required by arguments or resolved by preflight.
- **No governance or gate documents**: Do not read gate documents (`EXPERIMENT-CONFIGURATION-GATE.md`, `PROJECT_CONTEXT.md`, etc.) as generation context. Input integrity is verified deterministically by preflight.
- **No recursive scanning**: Do not run recursive directory scans or broad file search commands across the repository.

## Phase 1: Read-Only Preflight & START (Execute-Only)

Before START, run the deterministic read-only preflight over the operator-prepared inputs. Continue only when it passes for the exact active identity and operation state.

The operator may prepare these files manually, with another model, external Python or optional repository helpers. Validate their contents, identities and checksums; never require a particular creator, skill invocation, creation command or fabricated creation receipt. Configuration has no confirmation gate or summary for approval. Root `.env` is not required.

Resolve an available Python executable and execute this read-only command (do not read the script source):

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

## Phase 2: Ingest Permitted Technical Inputs

Ingest ONLY the items in the Closed Whitelist:
1. **Read `templates/construction/coding-prompt.template.md`**: Understand required prompt sections and structure.
2. **Read the active `docs/01-inception/use-cases/uc-*.md`**: Extract functional specifications, flows, actors, preconditions, postconditions, and UML model.
3. **Read active API contracts**: If `Related API IDs` is non-empty, read only the specified contract paths under `docs/01-inception/api-contracts/`. If `None.`, skip this step completely.
4. **Resolve Figma evidence**: Execute `resolve.py` in read-only mode:
   ```text
   <python-executable> .codex/skills/resolve-figma-design-dataset/scripts/resolve.py <UC-ID-or-path> --dataset-version <version>
   ```
   Read only the local snapshot JSON/node data for the resolved target node(s).
5. **Read DBML once**: Read `docs/00-context/engineering/schema.dbml` once as technical input for exact table, column, and constraint definitions.
6. **Identify entry points**: If template placeholders require component or controller placement locations, inspect minimal entry point files in `finalsource/` without reading unrelated feature logic.
7. **Read additional inputs required by the template**: Ingest any additional baseline or specification input strictly required by a section present in `templates/construction/coding-prompt.template.md` (e.g., reading the Business Rule baseline and frozen specification if Prompt E is included).

## Phase 3: Author the Coding Prompt Draft

1. Reason over the whitelisted inputs collected in Phase 2.
2. Author the complete coding prompt draft by populating `templates/construction/coding-prompt.template.md`.
3. Do not call any additional file reading tools during authoring.
4. Distribute use-case behaviors across Prompts A-D (and any additional sections such as Prompt E/F present in the configured template) without altering frozen scope:
   - **Prompt A (Backend API)**: API endpoints, DTOs, logic location, database behavior, success/error envelopes.
   - **Prompt B (Frontend UI)**: UI components, styling, layout matching the resolved Figma target frame.
   - **Prompt C (Frontend Logic & Integration)**: State management, API integration, data mapping.
   - **Prompt D (Validation & Error Handling)**: Client-side validation, loading states, error handling.
   - **Additional sections (e.g., Prompt E / F)**: Populate according to the configured template instructions.

## Phase 4: Save Draft, END Timing & Post-Validation (Execute-Only)

1. **Persist the Draft**: Write the prompt to `docs/02-construction/coding-prompts/<UC-ID>-coding-prompt.md`. Include `source_api_contracts` as the semicolon-separated ordered configured API paths, or exactly `None.` for an empty inventory.
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
