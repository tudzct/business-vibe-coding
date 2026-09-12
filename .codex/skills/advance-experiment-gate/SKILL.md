---
name: advance-experiment-gate
description: Handle a researcher's plain-language confirmation of the pending Business experiment gate, invoke the required measurement or audit engine internally, and persist the transition without requiring skill commands. Never combine a gate close with later generation work.
---

# Advance Experiment Gate

Use this automatically when the researcher confirms, approves, continues, repairs or skips at a gate shown by `run-business-vibe-coding`. Read [gate transitions](references/gates.md), the exact canonical UC/run and its pending gate. Reject ambiguous identity or an out-of-order confirmation.

The researcher never needs to name Measure or Audit skills. Invoke those engines internally:

- Prompt Gate: record prompt approval and close `prompt_generation` telemetry.
- Source Gate: close `source_generation` telemetry.
- First-pass Audit Gate: run permitted checks, Business Rule audit and `audit-flow-accuracy`; preserve immutable initial evidence.
- Repair Decision Gate: record explicit authorize/skip only; measurement is not authorization.
- Repair Gate: close repair telemetry after completed authorized repair work.
- Final Audit Gate: run final BR/flow/runtime audit and freeze the source hash. Resolve the original rubric from checksum-pinned configuration; for runtime-v2, observe every flow again with fresh final-stage evidence, including after skipped repair. Never copy initial flow conclusions into final.
- Final Metrics Gate: internally finalize workflow telemetry and refresh the report.

A gate-close turn performs only its gate operation. It may combine the researcher's approval with the corresponding close receipt, but must not mutate application source, begin the next generation segment or execute another gate. End with the next pending gate and the one confirmation/action required from the researcher.

After the internal action succeeds, persist the confirmation and actual turn ID with `scripts/record_gate.py`. Never close a gate before its action succeeds, infer confirmation, approve on behalf of the researcher, backfill a gate, or change immutable evidence. Telemetry-only work remains excluded; audit contributes no generation execution seconds.

Follow the [shared Full/RQ3 contract](../../../docs/00-context/workflow/FULL-RQ3-CONTRACT.md). Before Prompt Gate closes, store the approved `coding_prompt` path/checksum and configured `prompt_variant` in the canonical run. `record_gate.py --dry-run` validates the same preconditions as persistence without writing. Audit Gate closure requires persisted stage-specific BR/flow evidence; first-pass receipts retain hashes checked by later gates. Repair Decision records `repair_authorization` with the actual turn ID. For skip, pass `--reason` containing the researcher's explanation, or simply that the researcher explicitly chose to skip; do not ask again. Both variants must proceed through Final Audit and Final Metrics after skip. The script does not require UI scoring or run audit/repair itself.

The independent `audit-figma-ui-accuracy` skill is strictly optional and manually invoked by the researcher outside gates. Do not invoke it or require its data/validation outcome from any gate; missing/null UI fields never block a gate. The frozen Figma dataset remains an implementation input pinned by configuration.
