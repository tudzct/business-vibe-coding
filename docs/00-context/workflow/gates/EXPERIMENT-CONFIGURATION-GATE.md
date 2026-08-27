# Unified experiment configuration gate

The researcher may provide the complete experiment configuration once, but the workflow activates it through two independent logical gates. The machine-readable source of truth is:

```text
docs/05-experiments/configurations/<CONFIG-ID>.json
```

Create it from `templates/research/experiment-configuration.template.json`. Never infer, default, or store `null` for researcher decisions or requested model fields.

Before activation, run:

```text
python3 .codex/skills/run-secure-aidlc/scripts/validate_experiment_configuration.py docs/05-experiments/configurations/<CONFIG-ID>.json
```

## Configuration structure

One configuration identifies a comparison group and contains:

- stable researcher identity and decision timestamp;
- one security scope for each included UC;
- audit protocol and, when required, an exact auditor configuration;
- one run assignment for every UC × generation model × replicate;
- unique positive `run_order` values across the comparison group.

`replicate_index` identifies repetition within the same UC and generation-model tuple. `run_order` is execution order, not display sorting. `audit_protocol` is one of `fixed`, `matched`, or `cross`; it is not an audit outcome.

## Logical gate 1 — security scope activation

Before generating the security resource or Prompt E, validate the selected UC's `security_scope` entry. It must contain `researcher_selected` plus exact active A01–A10 SEC IDs, or `all_catalog` plus all 50 active IDs (5 per category). Freeze the canonical JSON catalog checksum and project the decision to:

```text
docs/02-construction/implementation/<UC-ID>/security-scope-activation.json
```

The receipt records `configuration_artifact` and `configuration_checksum`. Prompt generation remains blocked until it exists; resolve actual scope fields from the configuration. Security-tool policy or approval is never a prompt-generation gate.

## Logical gate 2 — run activation

After the prompt and any required schema decision are approved, select exactly one configured `run_id`. Validate its requested model tuple, `replicate_index`, `run_order`, and audit protocol against the comparison-group configuration. Project the selected assignment to:

```text
docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/run-activation.json
```

Only this run-specific receipt unlocks `codex --version`, the timer and source mutation; resolve the complete assignment from its configuration. Every compared run starts from the same recorded clean baseline and approved prompt revision.

## Audit protocols

- `fixed`: all generated outputs use one exact auditor configuration recorded at comparison-group level.
- `matched`: each run uses its generation model tuple as its auditor tuple.
- `cross`: every generator × auditor pairing has a separately identified audit record; auditor assignments must be explicit.

Do not mix protocols within one comparison group. Effective runtime fields and observed findings are outputs and never belong in this input gate.

## Compatibility boundary

Historical Markdown projections remain read-only evidence. New runs use compact gate-version-3 JSON receipts.
