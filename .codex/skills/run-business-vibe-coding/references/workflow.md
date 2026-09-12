# Two-phase artifact contract

| Phase | Required input | Output | Researcher action |
|---|---|---|---|
| 1. Prompt generation | frozen UC/UML/BR/flows + confirmed `.env`-derived configuration + pinned Figma dataset | BR/flow baselines + approved Prompt A-F or A-D | confirm Configuration and Prompt Gates |
| 2. Source generation | approved prompt + active run + baseline source | generated source + initial/final BR/flow audit + optional repairs + final hash | confirm Source/Audit/Repair/Final Metrics Gates |

Commands:

```text
$gen-coding-prompt <use-case.md>
$gen-source-code <business-coding-prompt.md>
```

Telemetry and audit engines run internally after gate confirmation; the researcher does not invoke them by skill name. Figma/UI scoring is optional: the researcher may inspect visually or manually request the independent `audit-figma-ui-accuracy` skill. Its absence or local validation result never blocks any gate. No step creates or runs tests.
