# Independent final-source evaluation result contract

Store one immutable evaluator directory per evaluation:

```text
docs/03-audit/security-tools/finalsource/<evaluation-id>/
  evaluation-summary.json
```

`evaluation-summary.json` is the sole persisted evaluator result and follows `templates/security-evaluation/security-tool-evaluation-summary.schema.json`. It evaluates the current frozen `finalsource/` product snapshot, not an individual UC. It records source integrity, runtime health, catalog/policy/lock references, tool completion, observed context/target/probe coverage, normalized findings and counts. Static criterion definitions and official sources remain canonical in the checksum-bound catalog; execution selection and declared coverage remain canonical in the policy. Configured findings retain only their evaluator criterion ID and do not copy full criterion definitions.

The approved orchestration input and the two adapter contracts are defined by:

- `templates/security-evaluation/final-source-security-evaluation-input.template.json`
- `templates/security-evaluation/semgrep-evaluation-input.template.json`
- `templates/security-evaluation/semgrep-evaluation-output.template.json`
- `templates/security-evaluation/zap-evaluation-input.template.json`
- `templates/security-evaluation/zap-evaluation-output.template.json`

Per-tool output contracts describe normalized ephemeral adapter output. They are not additional canonical artifacts.

Raw scanner output, execution logs, secrets and temporary files are deleted after normalization. Automated output never confirms a finding or assigns SR `met/unmet`; `no_finding_detected` is bounded to coverage observations whose status is `evaluated`. Unavailable authentication, ownership fixture, endpoint or executor capability must be a `not_evaluable` observation with a stable reason code.

When requested, `$render-security-evaluation` may create `evaluation-report.md` beside the JSON. The Markdown is a deterministic disposable view and is not part of scan completion or canonical evidence.
