---
name: run-business-vibe-coding
description: "Run the research product's two phases: generate the configured coding prompt, then generate, audit and repair source code."
---

# Run Business Vibe Coding

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Read [FILE-DRIVEN-WORKFLOW.md](../../../docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md) and the [workflow boundaries](../../../docs/00-context/workflow/WORKFLOW-CONTRACT.md). Route the current researcher command to its step and end with the next command, never another confirmation gate.

Require four prepared research JSON inputs and the per-run database baseline and read-only preflight before prompt generation. Generate Draft; prompt close approves and pins it. Generate first-pass source only; source close precedes directly requested audit. Audit includes BR/flows. If all pass, record repair unnecessary and offer finalize. Otherwise save pending verdicts or wait for the repair command. Repair invocation records authorization and immediately runs bounded corrections with automatic final BR/flow/runtime verification. Then request one `finalize-workflow` measurement turn to close/skip Repair and finalize atomically; optionally export afterward in a separate turn.

Do not require activation, automatically repair after follow-up or overwrite recorded evidence. UI scoring is optional. Telemetry capture/selection uses `generation_execution_with_repair_audit_v2`; close/report/export turns are excluded. Use `record_command.py` for internal step history, not human approvals.
