---
name: activate-experiment-run
description: Prepare a Draft experiment configuration or validate a Confirmed configuration and create its immutable UC run-activation receipt. Use before source generation; do not generate prompts or source code.
---

# Activate Experiment Run

Use this skill when the researcher wants to prepare or activate one configured use-case run.

Read `docs/00-context/workflow/gates/EXPERIMENT-CONFIGURATION-GATE.md`, `docs/00-context/workflow/gates/MODEL-SELECTION-GATE.md`, and the selected frozen UC. For activation, also read the referenced Business Rule baseline.

## Prepare a configuration

Create a Draft configuration at `docs/05-experiments/configurations/<CONFIG-ID>.json` from `templates/research/experiment-configuration.template.json` only after collecting the researcher-supplied comparison group, researcher identifier, audit protocol, run IDs, model tuples, replicate indexes, and run orders. Use every ordered BR ID from the frozen UC and record the prescribed baseline path; do not select rules. The baseline itself is frozen during Phase 1 and checked again at activation.

Never infer a model tuple, replicate, run order, audit assignment, or a `Confirmed` status. Stop for the researcher to confirm the complete configuration.

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

The script verifies the configuration, matching frozen BR baseline, UC/run assignment, calculates the configuration's SHA-256, and writes only:

`docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/run-activation.json`

It refuses to overwrite an existing receipt. Do not begin model/version capture, timing, source mutation, Docker execution, or `$gen-source-code` within this skill; activation is the gate for those later operations.
