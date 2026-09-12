---
name: run-business-vibe-coding
description: "Run the research product's two phases: generate a Business Coding Prompt from a Sheet-derived UC/BR specification, then generate, audit and repair source code without test generation."
---

# Run Business Vibe Coding

Read the project context and two-phase workflow.

Use one task for one UC/run and the [shared measurement protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md). The three telemetry buckets (prompt/source/repair) subdivide the existing two-phase research method. Time includes only instrumented Prompt generation, first-pass Source generation and each Repair execution, at the shared START/END boundaries. Workflow seconds sum those three execution scopes; standalone setup/approval/dataset/audit/runtime/finalization is excluded from time. Token labels follow each turn's actual primary work under selection-schema.md; config/approval-only, dataset-only and other auxiliary turns contribute tokens only to workflow regardless of the open bucket. Common setup outside the UC is recorded separately. Never advance across a researcher measurement boundary in the same turn.

1. **Phase 1:** accept one frozen UC, validate a Confirmed configuration, invoke `gen-coding-prompt` (with `--variant full` or `--variant rq3`), freeze all BRs and obtain researcher approval for the prompt artifact (Prompt A-F or Prompt A-D) and material unresolved decisions.
2. After the researcher closes prompt telemetry using Measure in a later turn, activate exactly one configured run and invoke `gen-source-code` with the approved prompt. Generate only under `finalsource/` through the frontend/backend skills.
3. For BOTH Full A-F and RQ3 A-D, preserve first-pass source/hash/evidence, end the response and hold before repair. The researcher measures/closes source telemetry in the next measurement turn. A later first-pass audit assesses every frozen BR, then explicit researcher authorization is required to start repair. Never bypass the hold because the parent workflow requests a full run.
4. After repair ends, wait for researcher Measure closure. Perform separately requested final audit/Docker runtime/finalization as workflow work, freeze final source hash and terminal run evidence. The researcher then invokes `finalize-workflow` in a later turn to save final telemetry and derived reports. Measure/report-only turns are always excluded.

Measure never invokes Excel export. After the final workflow Measure turn has persisted `metrics.status: finalized`, the researcher may separately invoke `export-experiment-excel` once with the workbook target. That reporting turn exports all recognized finalized phase/workflow telemetry; BR/Figma/flow cells remain researcher-maintained.

Do not add enterprise lifecycle phases, independent scan workflows, or tests/test cases. Never infer a missing business decision.
