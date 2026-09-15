---
name: advance-experiment-gate
description: Handle Business experiment gate confirmations and automatic repair decisions after saved flow follow-ups; persist validated transitions and invoke internal engines without researcher skill commands. Never combine telemetry closure with source work.
---

# Advance Experiment Gate

Manual-result exception to automatic continuation: after a `researcher_result` follow-up is saved, acknowledge the updated results and wait for the researcher's subsequent repair request when defects remain. `continue_after_flow.py` returns `await_repair_request` without changing gates or authorization. Invoking `$bug-fixing-sub-prompt` is that explicit authorization: validate readiness, record the pending Repair Decision with the invocation turn ID (dry-run first), and execute repair in the same work turn without another confirmation. This explicit decision/work operation is an exception to the confirmation-close separation below and never closes telemetry. Any pending accepted flow verdict blocks new repair authorization; report the missing flow IDs. Preserve the existing all-passing skip and LLM remeasurement continuation paths, subject to that readiness check.

Use this automatically when the researcher confirms, approves, continues, repairs or skips at a gate shown by `run-business-vibe-coding`. Read [gate transitions](references/gates.md), the exact canonical UC/run and its pending gate. Reject ambiguous identity or an out-of-order confirmation.

Configuration is not a confirmation gate. New runs start at `prompt` after automatic validation of the researcher-prepared Confirmed JSON. Never ask for configuration reconfirmation or record a new `configuration` transition. Preserve historical receipts; a legacy pending `configuration` with empty history can close through `--gate prompt` after actual prompt approval and all normal Prompt Gate checks.

The researcher never needs to name Measure or Audit skills. Invoke those engines internally:

- Prompt Gate: record prompt approval and close `prompt_generation` telemetry.
- Source Gate: close `source_generation` telemetry.
- First-pass Audit Gate: run permitted checks, Business Rule audit and `audit-flow-accuracy`; preserve immutable initial evidence.
- Repair Decision Gate: record explicit authorize/skip, or automatically record the standing policy decision after a saved flow follow-up; see [automatic continuation](../../../docs/00-context/workflow/gates/FLOW-FOLLOWUP-AUTO-REPAIR.md).
- Repair Gate: close repair telemetry after authorized repair has automatically completed BR/flow/runtime verification and frozen the source hash in its work turn. Proceed directly to Final Metrics.
- Skipped repair: preserve the existing first-pass assessment and its original flow ID/stage/time when source is unchanged, retain equal initial/final BR snapshots and `repair_skip_reason`, and proceed directly to Final Metrics.
- Final Metrics Gate: internally finalize workflow telemetry and refresh the report.

A confirmation gate-close turn performs only its gate operation. It may combine the researcher's approval with the corresponding close receipt, but must not mutate application source, begin the next generation segment or execute another gate. The sole exception is the automatic Repair Decision after a saved flow follow-up: record it and begin repair in the same work turn under the linked policy. This does not close telemetry. End other gate-close turns with the next pending gate and required action.

If the researcher supplies flow results or chooses continued measurement, first route to `audit-flow-accuracy` and save its validated follow-up. Then automatically run `scripts/continue_after_flow.py` according to the linked policy, dry-run before persistence. On `begin_repair`, invoke bounded repair immediately without another confirmation; on `final_metrics`, present that gate. Pending-only evidence does not justify repair. Terminal/out-of-scope runs and repeated decisions do not start another cycle. Evaluation and decision/repair remain sequential operations in the same work turn.

After the internal action succeeds, persist the confirmation and actual turn ID with `scripts/record_gate.py`. Never close a gate before its action succeeds, infer confirmation, approve on behalf of the researcher, backfill a gate, or change immutable evidence. Telemetry-only work remains excluded; audit contributes no generation execution seconds.

Follow the [shared Full/RQ3 contract](../../../docs/00-context/workflow/FULL-RQ3-CONTRACT.md). Before Prompt Gate closes, store the approved `coding_prompt` path/checksum and configured `prompt_variant` in the canonical run. `record_gate.py --dry-run` validates the same preconditions as persistence without writing. First-pass Audit Gate and Repair Gate closure require their persisted initial/final BR/flow evidence, respectively; first-pass receipts retain hashes checked by later gates. Repair Decision records `repair_authorization` with the actual turn ID. For skip, pass `--reason` containing the researcher's explanation, or simply that the researcher explicitly chose to skip; do not ask again. Both variants proceed directly to Final Metrics after skip; no separate final-audit confirmation is required. Legacy pending `final_audit` states may be closed through `--gate final_metrics` once existing terminal evidence and finalized telemetry are valid; retain historical receipts unchanged. The script does not require UI scoring or run audit/repair itself.

The independent `audit-figma-ui-accuracy` skill is strictly optional and manually invoked by the researcher outside gates. Do not invoke it or require its data/validation outcome from any gate; missing/null UI fields never block a gate. The frozen Figma dataset remains an implementation input pinned by configuration.
