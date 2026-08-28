# Implementation loop

Validate the active run, capture the initial timer, generate the smallest prompt diff (Prompt A-F for Full or Prompt A-D for RQ3), stop the timer and persist the initial per-BR assessment against the frozen BR baseline.

For RQ3 runs, enforce a mandatory hold gate after persisting the initial assessment: stop execution, end the turn, report initial results and require explicit researcher authorization before running any sub-prompt repairs (to support 'Sub-prompt off' evaluation and cleanly separate first-gen vs sub-prompt token telemetry).

When repairs are authorized, classify evidenced repairs as `technical`, `business_rule`, `ui` or `flow`; each invocation repairs one fingerprint and retains independent telemetry. Complete permitted non-test checks and authorized Docker observations before freezing the final hash.
