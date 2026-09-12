---
name: activate-experiment-run
description: Prepare a Draft experiment configuration or validate a Confirmed configuration and create its immutable UC run-activation receipt. Use before source generation; do not generate prompts or source code.
---

# Activate Experiment Run

Use this skill when the researcher wants to prepare or activate one configured use-case run.

Read the [shared execution timing protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md). UC-specific configuration/confirmation/activation contributes tokens only to workflow under `configuration_and_approval`, even inside an open generation phase. It does not start a generation timer and contributes no phase/workflow execution seconds. A Draft canonical identity may be initialized without granting source permission. Common setup outside the UC is recorded separately. Do not run Measure here.

Read `docs/00-context/workflow/gates/EXPERIMENT-CONFIGURATION-GATE.md`, `docs/00-context/workflow/gates/MODEL-SELECTION-GATE.md`, and the selected frozen UC. For activation, also read the referenced Business Rule baseline.

## Prepare a configuration

Load researcher defaults from the ignored root `.env` using `scripts/load_experiment_env.py --ensure`. If `.env` is created or any researcher field is empty, list all missing keys once and stop. Never read experiment settings from `finalsource/.env`, which is reserved for runtime secrets.

Treat `.env` as convenience input only. Build a Draft configuration from it, derive UC/BR/flow paths, unique run IDs and run order, pin the activated Figma dataset version/checksum, show one complete summary, and ask the researcher to confirm the Configuration Gate. On confirmation, persist a new immutable Confirmed configuration; later `.env` changes require a new configuration ID.

Create a Draft configuration at `docs/05-experiments/configurations/<CONFIG-ID>.json` from `templates/research/experiment-configuration.template.json`. Every new configuration uses schema 2.3, retains `timing_method: system_timestamp_delta`, and pins the active Figma manifest. Use every ordered BR ID and record both BR and flow baseline paths; do not select rules or flows. Baselines are frozen before source generation and checked again at activation.

Freeze `flow_audit_rubric: completion-critical-flow-runtime-v2` in the schema-2.3 configuration before generation and include it in the Configuration Gate summary. Keep `audit_design.protocol` for auditor assignment. All Full/RQ3/model conditions in the comparison group share this rubric. Existing configurations and receipts retain their original method/version. New activation receipts use gate version 5, pin the configuration checksum and approved prompt path/checksum, and record the canonical variant. Historical gate-3/4 receipts remain readable without backfilling fields.

Never infer a model tuple, replicate, run order, audit assignment, alternative timing method, or a `Confirmed` status. Stop for the researcher to confirm the complete configuration.

## Activate one run

Activate only after the researcher explicitly confirms the configuration. First validate it:

```bash
python3 .codex/skills/run-business-vibe-coding/scripts/validate_experiment_configuration.py docs/05-experiments/configurations/<CONFIG-ID>.json
```

Then create the receipt without copying model or researcher fields into it:

```bash
python3 .codex/skills/activate-experiment-run/scripts/create_run_activation.py \
  docs/05-experiments/configurations/<CONFIG-ID>.json UC-01 <RUN-ID>
```

The script resolves the canonical approved Full/RQ3 prompt (or explicit `--prompt <path>`), validates its identity/structure, configuration and frozen baseline, and pins the configuration and approved prompt SHA-256 values. Use `--dry-run` first for read-only preflight. It writes only:

`docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/run-activation.json`

It refuses to overwrite an existing receipt. Do not begin source-generation model/version capture, source timing, source mutation, Docker execution, or `$gen-source-code` within this skill; activation is the gate for those later operations. Configuration/approval is excluded from measured generation and workflow execution time.
