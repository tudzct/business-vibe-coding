# Four-step artifact contract

| Step | Required input | Output | Researcher action |
|---|---|---|---|
| 1. Use case | `uc-*.md` based on TechnicalReport | normalized UC ID and frozen functional/AC baseline | clarify only blocking ambiguity |
| 2. Prompt | use-case path + Confirmed unified configuration | security activation JSON + security resource JSON + `*-security-coding-prompt.md` | approve prompt |
| 3. Run activation + code | approved prompt + `run-activation.json` | `finalsource/fe` and/or `finalsource/be` | activate configured run, then inspect generated result |
| 4. Audit/repair | source + telemetry/evidence | canonical experiment JSON + optional sub-prompts | supply missing manual estimates/decisions |

There are only two researcher-facing commands:

```text
$gen-coding-prompt <use-case.md>
$gen-source-code <security-coding-prompt.md>
```

The audit and platform-specific skills are invoked automatically. Approved SAST/DAST runs only after the repair loop terminates; it does not participate in repair selection or mutate source.
