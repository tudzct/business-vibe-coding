# Two-phase artifact contract

| Phase | Required input | Output | Researcher action |
|---|---|---|---|
| 1. Prompt generation | frozen UC/UML/BR/flows + existing Confirmed JSON, BR/flow baselines and Draft Canonical Run JSON + pinned Figma dataset + fixed database/DBML | read-only validate prepared inputs; generate Draft Prompt A-F or A-D in one work turn | invoke prompt telemetry close, which approves/pins the Draft and creates/validates activation |
| 2. Source generation | approved prompt + closed prompt telemetry + pinned configuration + baseline source + fixed database/DBML | first-pass source + initial/final BR/flow audit + authorized repairs if needed + final hash | invoke source close, audit, repair if needed, and finalize in separate turns |

Commands:

```text
$gen-coding-prompt <use-case.md>
$measure-uc-workflow close-phase prompt_generation
$gen-source-code <business-coding-prompt.md>
$measure-uc-workflow close-phase source_generation
$audit-generation-metrics
$bug-fixing-sub-prompt
$measure-uc-workflow finalize-workflow
```

Follow [the command sequence](../../../../docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md). Each command authorizes its own operation without another confirmation. Skip the repair command when all frozen BR/flow results pass on unchanged source; finalize records the skipped Repair bucket. Finalize closes or skips Repair and finalizes telemetry in one measurement turn. Figma/UI scoring is optional: the researcher may inspect visually or manually request the independent `audit-figma-ui-accuracy` skill. Its absence or local validation result never blocks any gate. No step creates or runs tests.

After a flow follow-up, apply the [continuation policy](../../../../docs/00-context/workflow/gates/FLOW-FOLLOWUP-AUTO-REPAIR.md). Acknowledge saved researcher or LLM results and wait for a subsequent `$bug-fixing-sub-prompt` when defects remain; that command records explicit authorization and starts repair in the same turn without reconfirmation. Pending accepted flow verdicts block new repair authorization. All-passing unchanged-source results permit skipping repair. No work turn closes telemetry or reopens terminal runs.
