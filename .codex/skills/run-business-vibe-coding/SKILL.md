---
name: run-business-vibe-coding
description: "Run the research product's two phases: generate a Business Coding Prompt from a Sheet-derived UC/BR specification, then generate, audit and repair source code without test generation."
---

# Run Business Vibe Coding

Read the project context and two-phase workflow.

Use one task for one UC/run and the [shared measurement protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md). The three telemetry buckets (prompt/source/repair) subdivide the existing two-phase research method. UC-specific setup and approvals before opening a bucket count only toward workflow; related work while a bucket is open counts toward it as well. Common setup outside the UC is recorded separately. Never advance across a researcher measurement boundary in the same turn.

1. **Phase 1:** accept one frozen UC, validate a Confirmed configuration, invoke `gen-coding-prompt` (with `--variant full` or `--variant rq3`), freeze all BRs and obtain researcher approval for the prompt artifact (Prompt A-F or Prompt A-D) and material unresolved decisions.
2. After the researcher closes prompt telemetry using Measure in a later turn, activate exactly one configured run and invoke `gen-source-code` with the approved prompt. Generate only under `finalsource/` through the frontend/backend skills.
3. For BOTH Full A-F and RQ3 A-D, preserve first-pass source/hash/evidence, end the response and hold before repair. The researcher measures/closes source telemetry in the next measurement turn. A later first-pass audit assesses every frozen BR, then explicit researcher authorization is required to start repair. Never bypass the hold because the parent workflow requests a full run.
4. After repair ends, wait for researcher Measure closure. Perform separately requested final audit/Docker runtime/finalization as workflow work, freeze final source hash and terminal run evidence. The researcher then invokes `finalize-workflow` in a later turn to save final telemetry and derived reports. Measure/report-only turns are always excluded.

If a Measure request includes `Excel target: <path-or-link>`, Measure automatically invokes `export-experiment-excel` after committing metrics and exports only the just-measured telemetry scope. The link applies to that Measure turn only; BR/Figma/flow cells remain researcher-maintained.

Do not add enterprise lifecycle phases, independent scan workflows, or tests/test cases. Never infer a missing business decision.
