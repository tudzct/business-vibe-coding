---
name: activate-experiment-run
description: Validate an existing run activation receipt or optionally create one on explicit researcher request outside source generation; never generate prompts or source code.
---

# Activate Experiment Run

This is an optional preparation/validation helper. The researcher chooses how to create the Confirmed configuration, frozen BR/flow baselines, Draft Canonical Run JSON and run activation receipt: manually, with an external script/model, or with optional repository helpers. A valid file is accepted regardless of its creator. Never require a skill invocation or creation-command history as evidence.

Read `docs/00-context/workflow/gates/EXPERIMENT-CONFIGURATION-GATE.md`, `docs/00-context/workflow/gates/MODEL-SELECTION-GATE.md`, the selected frozen UC and referenced baselines. Configuration has no summary/reconfirmation gate and root `.env` is optional. Prompt generation requires its four inputs already present; source generation does not require an activation receipt; existing receipts are an optional run receipt. Neither generation path creates missing inputs.

## Validate an existing receipt

Require the existing Canonical Run JSON, approved Full/RQ3 prompt and closed prompt telemetry. Resolve an available Python executable; PowerShell uses `& '<absolute-python-path>' ...`.

```text
<python-executable> .codex/skills/activate-experiment-run/scripts/create_run_activation.py <config.json> <UC-ID> <RUN-ID> --run-json <canonical.json> --validate-existing
```

This requested receipt validation fails on missing/invalid contents. Absence never blocks ordinary source/audit/repair commands. Never replace an existing receipt merely because it was created externally.

## Optional creation outside generation

Only an explicit researcher request to create a receipt authorizes this mode. The four pre-prompt inputs and approved prompt must already exist. Use:

```text
<python-executable> .codex/skills/activate-experiment-run/scripts/create_run_activation.py <config.json> <UC-ID> <RUN-ID> --run-json <canonical.json> --dry-run
```

On successful validation, repeat without `--dry-run` only within that explicit creation request. The helper writes a missing receipt at `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/run-activation.json`. It accepts an existing valid receipt without overwriting it. `--prompt <path>` must match the canonical approved prompt. This helper is never required to establish that a valid external receipt exists.

Receipts use gate version 5 and pin the actual configuration and approved prompt SHA-256 with the configured variant. Preserve the configured timing method, Figma version/checksum and runtime-v2 flow rubric, requested model/replicate/order/audit assignment, and immutable recorded receipts. Missing/conflicting settings block; never infer or change them.

Do not generate source, create other missing inputs or run Measure in this skill. Follow the [execution timing protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md): standalone UC-specific setup/approval/activation turns contribute workflow tokens under their actual semantic label and no generation execution seconds. External preparation has no fabricated local telemetry. `scripts/load_experiment_env.py` remains an optional preparation helper only.

Prompt telemetry close (Turn 2) automatically creates a missing `run-activation.json` from the pinned configuration and approved prompt, or validates an existing receipt without replacing it. The receipt records the actual prompt-close turn/time, before source generation. No standalone activation turn is required.
