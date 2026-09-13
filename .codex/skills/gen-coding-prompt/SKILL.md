---
name: gen-coding-prompt
description: Generate a Full Prompt A-F or RQ3 Prompt A-D from validated, pre-existing experiment inputs and one frozen UC; never initialize configuration/baselines/trackers or generate tests.
---

# Generate Business Coding Prompt

Accept one readable `docs/01-inception/use-cases/uc-*.md` path. Optional `--configuration <config.json>`, `--run-id <RUN-ID>`, `--run-json <canonical.json>` and `--variant [full|rq3]` disambiguate existing inputs; explicit values must match their recorded identities. Resolve only a unique matching Canonical Run JSON. Never select the newest file or silently default a configured RQ3 run to Full.

Read [configuration input contract](../../../docs/00-context/workflow/gates/EXPERIMENT-CONFIGURATION-GATE.md), [shared Full/RQ3 contract](../../../docs/00-context/workflow/FULL-RQ3-CONTRACT.md) and [execution timing protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md).

## Read-only preflight

Before START, all four core inputs must already exist: Confirmed Experiment Configuration JSON, frozen `business-rule-baseline.json`, frozen `flow-baseline.json` and Draft Canonical Run JSON. Canonical draft state is `run_status: draft`, with `coding_prompt: null`, `metrics: null` before first measurement, and initial gates at `prompt` with empty history. Resume only an open prompt phase with valid existing evidence.

The researcher may prepare these files manually, with another model, external Python or optional repository helpers. Validate their contents, identities and checksums; never require a particular creator, skill invocation, creation command or fabricated historical receipt. Configuration has no confirmation gate or summary for approval. Root `.env` is not required.

Resolve an available Python executable and run this read-only command, supplying explicit selection arguments when available:

```text
<python-executable> .codex/skills/gen-coding-prompt/scripts/preflight_configuration.py --uc-id <UC-ID> --run-json <canonical.json> --use-case <use-case.md>
```

Both baselines and the Canonical Run JSON are mandatory on every invocation, including without the legacy `--require-baselines` flag. Missing, malformed, ambiguous or conflicting inputs stop the turn immediately with the exact file/field/checksum error. Do not create, fill, normalize, repair, replace or initialize any of the four inputs during preflight or prompt generation. Do not invoke `gen-business-rule-resource`, baseline generation or activation creation to fill a gap.

Referenced BR resource/provenance, frozen UC, API/Figma and template dependencies must also exist and validate under their existing contracts; they are not silently generated as a workaround. A read-only deterministic Prompt E rendering from the existing BR resource is allowed. If a checksum-normalization receipt is required by the existing UC contract, it must already exist.

## Generate the Draft

1. Read `PROJECT_CONTEXT.md`, source/workflow rules and the configured template: `templates/construction/coding-prompt.template.md` for Full or `templates/construction/coding-prompt-rq3.template.md` for RQ3.
2. Verify frozen UC provenance and the exact source path returned by preflight. Resolve referenced API contracts and frozen Figma evidence through `resolve-figma-design-dataset` in read-only resolution mode. Missing dataset/API evidence stops generation; no capture, refresh or helper-file setup occurs here.
3. Validate equality of source-order BR IDs, existing resource and BR baseline, and complete Main/Alternative/Exception Flow coverage in the existing flow baseline. Preserve these artifacts unchanged. For RQ3, use metadata/deterministic validation for excluded BR/OCL inputs and retain the shared ablation context boundary.
4. Once all input checks pass, immediately capture live prompt START and generate A-D from functional UC/UML/API/Figma inputs, covering every frozen flow and terminal outcome. Apply the standard response envelope without changing domain status, fields or message semantics.
5. For Full, insert deterministic Prompt E verbatim and fill F with source priority and implementation boundaries. For RQ3, omit E/F together and exclude BR resource/baseline links, OCL projections and BR-derived additions.
6. Persist the Draft at `docs/02-construction/coding-prompts/<UC-ID>-business-coding-prompt.md` or `<UC-ID>-rq3-coding-prompt.md`. Immediately capture END, then run `scripts/validate_prompt_contract.py --configuration <config.json> --uc-id <UC-ID> --run-id <RUN-ID> --prompt <prompt.md> --allow-draft`. Recheck configuration with preflight `--expected-checksum <original checksum>`; review semantic flow coverage and provenance. Any unresolved anomaly prevents reporting success.
7. Present the Draft result and Prompt Gate. Actual approval in a later turn permits `advance-experiment-gate` to store the approved prompt reference and close telemetry. Do not approve the Draft or start source here.

The existing timing helper appends actual timestamps to its runtime journal after successful input validation. This is measurement evidence, not initialization of the four configuration inputs. Preflight must not mutate the Canonical Run JSON; later approval/audit/measurement operations may update its results normally. Whole-turn token telemetry still includes reads, validation and timestamp calls; never invent a token deduction or promise zero measurement overhead. No tests or test cases.
