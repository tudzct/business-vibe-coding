---
name: run-business-vibe-coding
description: "Run the research product's two phases: generate a Business Coding Prompt from a Sheet-derived UC/BR specification, then generate, audit and repair source code without test generation."
---

# Run Business Vibe Coding

Read the project context and two-phase workflow.

Read the [shared Full/RQ3 contract](../../../docs/00-context/workflow/FULL-RQ3-CONTRACT.md). Resolve variant from configuration, cover every functional flow in A-D for both variants, and preserve identical evaluation/gate requirements. RQ3 omits E/F from generation input only. No variant-specific shortcut skips final audit or final metrics.

Use one task for one UC/run and the [shared measurement protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md). Load one-time experiment defaults from root `.env`, create a schema-2.3 configuration that pins the active Figma dataset, and present plain-language gates. `advance-experiment-gate` invokes telemetry and audit engines internally after confirmation. Never ask the researcher to invoke Measure/Audit skills or advance beyond a gate in the same turn.

1. **Configuration Gate:** validate root `.env`, derive run identities/order, freeze every BR and flow baseline, pin the active Figma dataset and show one summary. Persist only after researcher confirmation.
2. **Phase 1:** generate the Full A-F or RQ3 A-D Draft, then show Prompt Gate. On confirmation, approve it and internally close prompt telemetry; do not start source in that gate turn.
3. Activate one run and generate first-pass source. Preserve hash/evidence and show Source Gate. On confirmation, internally close source telemetry only.
4. Show First-pass Audit Gate. On confirmation, run permitted non-test checks, BR audit and flow audit. The researcher may separately request the optional `audit-figma-ui-accuracy` skill or inspect UI manually; this workflow never invokes it or requires its result.
5. Show Repair Decision Gate. Record explicit authorize or skip. For authorized repairs, execute bounded repairs, then use Repair Gate confirmation to close telemetry.
6. Show Final Audit Gate. On confirmation, run final BR/flow/runtime audit and freeze the final hash. Then show Final Metrics Gate; its confirmation internally finalizes workflow telemetry and refreshes reports.

Internal gate telemetry never invokes Excel export. After Final Metrics Gate persists `metrics.status: finalized`, the researcher may separately invoke `$export-experiment-excel <UC-ID> <LINK_OR_FILEPATH> <TAB_NAME>`. Export dynamically maps stored canonical values to inspected headings, including BR/flow/repair and optional UI fields, without running assessments or altering canonical evidence. Missing data becomes N/A; formulas and protected/manual content remain unchanged.

Do not add enterprise lifecycle phases, independent scan workflows, or tests/test cases. Never infer a missing business decision.
