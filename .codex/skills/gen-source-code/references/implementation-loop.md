# Implementation loop

Validate the active run and closed prompt telemetry, capture the source work timer, generate the smallest prompt diff (Prompt A-F for Full or Prompt A-D for RQ3), stop the timer and preserve first-pass source/hash/evidence. End the response. Final token values are pending until post-turn Measure.

For both Full and RQ3, require a researcher Measure turn closing source before separate first-pass BR audit and before any repair. After that audit, obtain explicit researcher repair authorization. Never perform repair in the first-generation or measurement turn. Keep RQ3 Sub-prompt-off available through an explicit skip decision.

When repairs are authorized, classify evidenced repairs as `technical`, `business_rule`, `ui` or `flow`; each invocation repairs one fingerprint and retains independent telemetry. Complete permitted non-test checks and authorized Docker observations before freezing the final hash.

Use the shared live segment/phase ledger protocol for timing. Each turn is indivisible for token attribution and receives one actual primary-work label under the shared selection-schema.md. Confirmation-only, configuration-only and other auxiliary turns contribute tokens only to workflow even inside an open generation bucket; mixed turns retain one label. Include earlier UC-specific setup. Measure closes repair after its last work response and finalizes workflow after terminal finalization; those measurement turns are excluded.
