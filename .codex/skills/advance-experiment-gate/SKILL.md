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
- Final Audit Gate: run final BR/flow/runtime audit and freeze the source hash.
- Final Metrics Gate: internally finalize workflow telemetry and refresh the report.

A gate-close turn performs only its gate operation. It may combine the researcher's approval with the corresponding close receipt, but must not mutate application source, begin the next generation segment or execute another gate. End with the next pending gate and the one confirmation/action required from the researcher.

After the internal action succeeds, persist the confirmation and actual turn ID with `scripts/record_gate.py`. Never close a gate before its action succeeds, infer confirmation, approve on behalf of the researcher, backfill a gate, or change immutable evidence. Telemetry-only work remains excluded; audit contributes no generation execution seconds.

Figma UI accuracy is researcher-managed. Do not invoke or calculate automated Figma scoring from any gate. The frozen Figma dataset remains an implementation input pinned by configuration.
