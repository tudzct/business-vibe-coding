# Two-phase artifact contract

| Phase | Required input | Output | Researcher action |
|---|---|---|---|
| 1. Prompt generation | frozen UC/UML/BR + confirmed configuration + sources | BR resource/baseline + approved Prompt A-F | resolve material ambiguity and approve prompt |
| 2. Source generation | approved prompt + active run + baseline source | generated source + initial/final BR audit + repairs + final hash | authorize runtime and resolve material decisions |

Commands:

```text
$gen-coding-prompt <use-case.md>
$gen-source-code <business-coding-prompt.md>
```

Audit and stack skills run inside Phase 2. No step creates or runs tests.
