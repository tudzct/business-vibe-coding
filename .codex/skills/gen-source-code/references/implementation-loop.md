# Implementation loop

Validate the active run and closed prompt telemetry, complete input/Figma/schema preflight, capture START immediately before the first source mutation, generate the smallest prompt diff (Prompt A-F for Full or Prompt A-D for RQ3), capture END immediately after first-pass source generation before build/audit/runtime/repair and preserve first-pass source/hash/evidence. End the response. Final token values are pending until the researcher confirms Source Gate and its internal telemetry closure runs.

For both Full and RQ3, require Source Gate confirmation and internal telemetry closure before First-pass Audit Gate. Audit BRs and flows, then obtain explicit Repair Decision Gate authorization. Never repair in a generation or telemetry gate-close turn.

When repairs are authorized, classify evidenced repairs as `technical`, `business_rule`, `ui` or `flow`; each invocation repairs one fingerprint and retains independent telemetry. Complete permitted non-test checks and authorized Docker observations before freezing the final hash.

Use the shared execution timing protocol: workflow seconds sum only Prompt + first-pass Source + all Repairs, not standalone auxiliary work. Each turn is indivisible for token attribution and receives one actual primary-work label under the shared selection-schema.md. Confirmation-only, configuration-only and other auxiliary turns contribute tokens only to workflow even inside an open generation bucket; mixed turns retain one label. Include earlier UC-specific setup. Confirmed telemetry gates close repair after its last work response and finalize workflow after terminal finalization; those internal gate-close turns are excluded.
