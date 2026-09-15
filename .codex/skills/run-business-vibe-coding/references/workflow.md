# Two-phase artifact contract

| Phase | Required input | Output | Researcher action |
|---|---|---|---|
| 1. Prompt generation | frozen UC/UML/BR/flows + existing Confirmed JSON, BR/flow baselines and Draft Canonical Run JSON + pinned Figma dataset | read-only validate four pre-existing inputs; generate Draft Prompt A-F or A-D in one work turn | approve the completed Draft at Prompt Gate; no configuration reconfirmation |
| 2. Source generation | approved prompt + active run + baseline source | generated source + initial/final BR/flow audit + optional repairs + final hash | confirm Source/Audit/Repair/Final Metrics Gates |

Commands:

```text
$gen-coding-prompt <use-case.md>
$gen-source-code <business-coding-prompt.md>
```

Telemetry and audit engines run internally after gate confirmation; the researcher does not invoke them by skill name. Figma/UI scoring is optional: the researcher may inspect visually or manually request the independent `audit-figma-ui-accuracy` skill. Its absence or local validation result never blocks any gate. No step creates or runs tests.

After a flow follow-up, apply the [continuation policy and manual-result exception](../../../../docs/00-context/workflow/gates/FLOW-FOLLOWUP-AUTO-REPAIR.md). Acknowledge saved researcher results and wait for a subsequent `$bug-fixing-sub-prompt` when defects remain; that command records explicit authorization and starts repair in the same turn without reconfirmation. Pending accepted flow verdicts block new repair authorization. Preserve the LLM remeasurement continuation and all-passing skip paths. No decision/work turn closes telemetry or reopens terminal runs; Source, initial Audit, Repair and Final Metrics confirmations remain.
