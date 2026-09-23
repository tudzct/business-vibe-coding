---
name: gen-coding-prompt
description: Generate a Full Prompt A-F from validated, pre-existing experiment inputs and one frozen UC; never initialize configuration/baselines/trackers.
---

# Generate Business Coding Prompt

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Accept one readable `docs/01-inception/use-cases/uc-*.md` path. Optional `--configuration <config.json>`, `--run-id <RUN-ID>`, `--run-json <canonical.json>` and `--variant full` disambiguate existing inputs; explicit values must match their recorded identities. Resolve only a unique matching Canonical Run JSON. Never select the newest file.

Read [configuration input contract](../../../docs/00-context/workflow/gates/EXPERIMENT-CONFIGURATION-GATE.md), [Full contract](../../../docs/00-context/workflow/FULL-CONTRACT.md) and [execution timing protocol](../measure-uc-workflow/references/phase-ledger-schema.md).

## Read-only preflight

Before START, require four prepared research JSON inputs (Confirmed configuration, frozen BR baseline, frozen flow baseline and Draft Canonical Run JSON) plus the fifth input: the researcher-provided database baseline. Configuration pins `database_baseline.migration_head`, `dbml_sha256` and `schema_fingerprint_sha256`, with no separate database status. Canonical draft state is `run_status: draft`, with `coding_prompt: null`, `metrics: null` before first measurement, and initial gates at `prompt` with empty history. Resume only an open prompt phase with valid existing evidence.

The researcher may prepare these files manually, with another model, external Python or optional repository helpers. Validate their contents, identities and checksums; never require a particular creator, skill invocation, creation command or fabricated creation receipt. Configuration has no confirmation gate or summary for approval. Root `.env` is not required.

Resolve an available Python executable and run this read-only command, supplying explicit selection arguments when available:

```text
<python-executable> .codex/skills/gen-coding-prompt/scripts/preflight_configuration.py --uc-id <UC-ID> --run-json <canonical.json> --use-case <use-case.md>
```

Both baselines and the Canonical Run JSON are mandatory on every invocation, with all required fields. Missing, malformed, ambiguous or conflicting inputs stop the turn immediately with the exact file/field/checksum error. Do not create, fill, normalize, repair, replace or initialize any of the four inputs during preflight or prompt generation. Do not invoke `gen-business-rule-resource`, baseline generation or activation creation to fill a gap.

Referenced BR resource/provenance, frozen UC, API/Figma and template dependencies must also exist and validate under their existing contracts; they are not silently generated as a workaround. A read-only deterministic Prompt E rendering from the existing BR resource is allowed. If a checksum-normalization receipt is required by the existing UC contract, it must already exist.

## Generate the Draft

The same preflight imports `database_baseline.py` internally to verify the ordered TypeORM migration history, DBML bytes and live MySQL metadata against the configured pins. Follow [database policy](../../../docs/00-context/engineering/DATABASE-SCHEMA.md). Require an initialized running Compose database and `finalsource/.env`; root `.env` remains unnecessary. Missing/mismatched input blocks before START. After PASS, read DBML once as Full technical input and use its exact structure in Prompt A/D. An incompatible requirement is a blocker. Follow the database policy's missing-schema procedure: close an open interval before waiting, preserve partial evidence, and require a new configuration/run if researcher setup changes the baseline.

1. Read `PROJECT_CONTEXT.md`, source/workflow rules and the configured template: `templates/construction/coding-prompt.template.md` for Full.
2. Verify frozen UC provenance and the exact source path returned by preflight. Resolve referenced API contracts and frozen Figma evidence through `resolve-figma-design-dataset` in read-only resolution mode. Missing dataset/API evidence stops generation; no capture, refresh or helper-file setup occurs here.
3. Validate equality of source-order BR IDs, existing resource and BR baseline, and complete Main/Alternative/Exception Flow coverage in the existing flow baseline. Preserve these artifacts unchanged.
4. Once all input checks pass, immediately capture live prompt START and generate A-D from functional UC/UML/API/Figma inputs, covering every frozen flow and terminal outcome. Apply the standard response envelope without changing domain status, fields or message semantics.
5. For Full, assemble the configured template using the existing deterministic renderer.
6. Persist the Draft at `docs/02-construction/coding-prompts/<UC-ID>-business-coding-prompt.md`. Immediately capture END, then run `scripts/validate_prompt_contract.py --configuration <config.json> --uc-id <UC-ID> --run-id <RUN-ID> --prompt <prompt.md> --allow-draft`. Recheck configuration with preflight `--expected-checksum <original checksum>`; review semantic flow coverage and provenance. Any unresolved anomaly prevents reporting success.
7. Present the Draft and next command `$measure-uc-workflow close-phase prompt_generation`. That command approves/pins the Draft and closes telemetry without another confirmation. Do not start source here.

The existing timing helper appends actual timestamps to its runtime journal after successful input validation. This is measurement evidence, not initialization of the four configuration inputs. Preflight must not mutate the Canonical Run JSON; later approval/audit/measurement operations may update its results normally. Whole-turn token telemetry still includes reads, validation and timestamp calls; never invent a token deduction or promise zero measurement overhead.
