# Implementation loop

`context -> require model -> freeze SRs/baseline -> generate -> capture initial telemetry -> permitted build/runtime evidence -> repair until terminal -> freeze final source hash -> stop`

Require requested configuration through `docs/00-context/workflow/gates/MODEL-SELECTION-GATE.md`; never use `null`, `unknown` or `not-requested` requested fields. Record requested/effective/observed-post-run configuration separately. A client version is not a model ID. Keep only unavailable effective/runner telemetry `null` with a reason. Categorize repairs as security, UI, flow or technical; business repair metrics are outside this study. Every invocation counts as one total sub-prompt, while only a direct frozen-SR repair counts as a security sub-prompt. Do not create/run test cases.
