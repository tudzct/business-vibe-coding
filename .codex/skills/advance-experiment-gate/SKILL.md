---
name: advance-experiment-gate
description: Handle a researcher's plain-language confirmation of the pending Business experiment gate, invoke the required measurement or audit engine internally, and persist the transition without requiring skill commands. Never combine a gate close with later generation work.
---

# Advance Experiment Gate

Use this automatically when the researcher confirms, approves, continues, repairs or skips at a gate shown by `run-business-vibe-coding`. Read [gate transitions](references/gates.md), the exact canonical UC/run and its pending gate. Reject ambiguous identity or an out-of-order confirmation.

Configuration is not a confirmation gate. New runs start at `prompt` after automatic validation of the researcher-prepared Confirmed JSON. Never ask for configuration reconfirmation or record a new `configuration` transition. Preserve historical receipts; a legacy pending `configuration` with empty history can close through `--gate prompt` after actual prompt approval and all normal Prompt Gate checks.

The researcher never needs to name Measure or Audit skills. Invoke those engines internally:

- Prompt Gate: record prompt approval and close `prompt_generation` telemetry.
- Source Gate: close `source_generation` telemetry.
- First-pass Audit Gate: run permitted checks, Business Rule audit and `audit-flow-accuracy`; preserve immutable initial evidence.
- Repair Decision Gate: record explicit authorize/skip only; measurement is not authorization.
- Repair Gate: close repair telemetry after authorized repair has automatically completed BR/flow/runtime verification and frozen the source hash in its work turn. Proceed directly to Final Metrics.
- Skipped repair: preserve the existing first-pass assessment and its original flow ID/stage/time when source is unchanged, retain equal initial/final BR snapshots and `repair_skip_reason`, and proceed directly to Final Metrics.
- Final Metrics Gate: internally finalize workflow telemetry and refresh the report.

A gate-close turn performs only its gate operation. It may combine the researcher's approval with the corresponding close receipt, but must not mutate application source, begin the next generation segment or execute another gate. End with the next pending gate and the one confirmation/action required from the researcher.

After the internal action succeeds, persist the confirmation and actual turn ID with `scripts/record_gate.py`. Never close a gate before its action succeeds, infer confirmation, approve on behalf of the researcher, backfill a gate, or change immutable evidence. Telemetry-only work remains excluded; audit contributes no generation execution seconds.

Follow the [shared Full/RQ3 contract](../../../docs/00-context/workflow/FULL-RQ3-CONTRACT.md). Before Prompt Gate closes, store the approved `coding_prompt` path/checksum and configured `prompt_variant` in the canonical run. `record_gate.py --dry-run` validates the same preconditions as persistence without writing. First-pass Audit Gate and Repair Gate closure require their persisted initial/final BR/flow evidence, respectively; first-pass receipts retain hashes checked by later gates. Repair Decision records `repair_authorization` with the actual turn ID. For skip, pass `--reason` containing the researcher's explanation, or simply that the researcher explicitly chose to skip; do not ask again. Both variants proceed directly to Final Metrics after skip; no separate final-audit confirmation is required. Legacy pending `final_audit` states may be closed through `--gate final_metrics` once existing terminal evidence and finalized telemetry are valid; retain historical receipts unchanged. The script does not require UI scoring or run audit/repair itself.

The independent `audit-figma-ui-accuracy` skill is strictly optional and manually invoked by the researcher outside gates. Do not invoke it or require its data/validation outcome from any gate; missing/null UI fields never block a gate. The frozen Figma dataset remains an implementation input pinned by configuration.
