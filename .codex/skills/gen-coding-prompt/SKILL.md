---
name: gen-coding-prompt
description: Generate the configured coding prompt from validated, pre-existing active-run inputs and one frozen UC.
---

# Generate Business Coding Prompt

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Accept one readable `docs/01-inception/use-cases/uc-*.md` path. Optional `--configuration <config.json>`, `--run-id <RUN-ID>`, `--run-json <canonical.json>` and `--variant <configured-variant>` disambiguate existing inputs; explicit values must match their recorded identities. Resolve only a unique matching Canonical Run JSON. Never select the newest file.

Read the [configuration input contract](../../../docs/00-context/workflow/gates/EXPERIMENT-CONFIGURATION-GATE.md). Do not open any other skill or operation-owned reference. Timing boundaries required below are part of this skill's own contract.

## Read-only preflight

Before START, require four prepared run JSON inputs (Confirmed configuration, frozen BR baseline, frozen flow baseline and Draft Canonical Run JSON) plus the fifth input: the operator-provided database baseline. Configuration pins `database_baseline.migration_head`, `dbml_sha256` and `schema_fingerprint_sha256`, with no separate database status. Canonical draft state is `run_status: draft`, with `coding_prompt: null`, `metrics: null` before first measurement, and initial gates at `prompt` with empty history. Resume only an open prompt phase with valid existing evidence.

The operator may prepare these files manually, with another model, external Python or optional repository helpers. Validate their contents, identities and checksums; never require a particular creator, skill invocation, creation command or fabricated creation receipt. Configuration has no confirmation gate or summary for approval. Root `.env` is not required.

Resolve an available Python executable and run this read-only command, supplying explicit selection arguments when available:

```text
<python-executable> .codex/skills/gen-coding-prompt/scripts/preflight_configuration.py --uc-id <UC-ID> --run-json <canonical.json> --use-case <use-case.md>
```

Both baselines and the Canonical Run JSON are mandatory on every invocation, with all required fields. Missing, malformed, ambiguous or conflicting inputs stop the turn immediately with the exact file/field/checksum error. Do not create, fill, normalize, repair, replace or initialize any of the four inputs during preflight or prompt generation. Do not invoke baseline generation or activation creation to fill a gap.

Referenced provenance, frozen UC, configured checksum-pinned API dependencies when present, Figma and template dependencies must also validate under their existing contracts; they are not silently generated as a workaround. A frozen UC whose required `Related API IDs` section contains exactly `None.` has an empty configured API inventory and requires no API artifact. If a checksum-normalization receipt is required by the existing UC contract, it must already exist.

## Generate the Draft

The same preflight imports `database_baseline.py` internally to verify the ordered TypeORM migration history, DBML bytes and live MySQL metadata against the configured pins. Follow [database policy](../../../docs/00-context/engineering/DATABASE-SCHEMA.md). Require an initialized running Compose database and `finalsource/.env`; root `.env` remains unnecessary. Missing/mismatched input blocks before START. After PASS, read DBML once as technical input and use its exact structure wherever [the configured template](../../../templates/construction/coding-prompt.template.md) or applicable input contract requires it. Follow the database policy's missing-schema procedure: close an open interval before waiting, preserve partial evidence, and require a new configuration/run if operator setup changes the baseline.

1. Read `PROJECT_CONTEXT.md`, the exact permitted project inputs and the configured template: `templates/construction/coding-prompt.template.md`.
2. Verify frozen UC provenance and the exact source path returned by preflight. When the configured API inventory is non-empty, read only its ordered contract paths after preflight has matched their IDs to the frozen UC and verified their Frozen identity and SHA-256. When the frozen UC declares `None.`, require an empty inventory and do not discover or infer an API contract. Resolve frozen Figma evidence through `resolve-figma-design-dataset` in read-only resolution mode. Missing or changed required dataset/API evidence stops generation; no capture, refresh or helper-file setup occurs here.
3. Use the read-only preflight result for prepared-input integrity and preserve those inputs unchanged.
4. Once all input checks pass, immediately capture live prompt START. Analyze only the project inputs permitted above and populate the configured coding-prompt template. Do not add instructions sourced from shared environment documents.
5. The AI must reason over the validated provided inputs and author the complete coding prompt itself, following `templates/construction/coding-prompt.template.md`. Fill `prompt_variant` metadata from the pinned configuration, treating its value as an opaque identity rather than an instruction about prompt content. The configured template defines the prompt's sections, content and instructions, subject to the shared operational constitution and input contracts. Read-only preflight, timing and post-generation validation tools remain required; they do not generate prompt content.
6. Persist the Draft at `docs/02-construction/coding-prompts/<UC-ID>-business-coding-prompt.md`, including `source_api_contracts` as the semicolon-separated ordered configured API paths, or exactly `None.` for an empty inventory. Immediately capture END, then run `scripts/validate_prompt_contract.py --configuration <config.json> --uc-id <UC-ID> --run-id <RUN-ID> --prompt <prompt.md> --allow-draft`. Recheck configuration with preflight `--expected-checksum <original checksum>`; review semantic flow coverage and provenance. Any unresolved anomaly prevents reporting success.
7. Present the saved Draft, its path and validation result, then stop. Do not inspect or prepare another operation.

The existing timing helper appends actual timestamps to its runtime journal after successful input validation. This is measurement evidence, not initialization of the prepared inputs. Preflight must not mutate the Canonical Run JSON. Never invent a token deduction or promise zero measurement overhead.
