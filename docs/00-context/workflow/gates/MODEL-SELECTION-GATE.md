# Run/model activation gate

This is logical gate 2 of `EXPERIMENT-CONFIGURATION-GATE.md`. Before initial source generation, require one complete run assignment in the Confirmed unified configuration and persist a compact activation receipt. Never default, infer or store `null` for requested model fields.

## Fixed choices

| Choice | Research label | Requested model ID | Reasoning effort | Reasoning mode |
|---:|---|---|---|---|
| 1 | `Sol Light` | `gpt-5.6-sol` | `low` | `standard` |
| 2 | `Luna Medium` | `gpt-5.6-luna` | `medium` | `standard` |
| 3 | `Terra Medium` | `gpt-5.6-terra` | `medium` | `standard` |
| 4 | `Custom` | researcher supplies an exact supported model ID | researcher supplies an allowed effort | researcher supplies `standard` or `pro` |

When no valid assignment exists, stop before `codex --version`, timing or source edits. Collect the model choice, `run_id`, positive `replicate_index`, unique positive `run_order` and audit protocol in a Draft unified configuration, then stop for researcher confirmation. Do not preselect a choice unless asked.

## Persistent receipt

Create `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/run-activation.json` from `templates/research/run-activation.template.json`. Validate its configuration checksum and resolve the complete assignment directly from that configuration. Do not copy researcher, model tuple, replicate, order or audit design into the receipt.

The configuration entry must match the receipt UC/run identity. Use the confirmed generation tuple for repair unless the researcher explicitly assigns a different complete repair tuple. Persist each repair's requested/effective fields in canonical run JSON.

## Null boundary

- Requested label, model ID, reasoning effort and reasoning mode must not be `null`, `unknown`, `not-requested` or inferred from the client version.
- Effective model ID/snapshot/effort and token telemetry may be `null` only when unavailable; record the reason.
- Historical `model-selection.md` files remain read-only evidence. New runs use gate version 3 and `run-activation.json`.
