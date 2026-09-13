---
name: run-business-vibe-coding
description: "Run the research product's two phases: generate a Business Coding Prompt from a Sheet-derived UC/BR specification, then generate, audit and repair source code without test generation."
---

# Run Business Vibe Coding

Read the project context and two-phase workflow.

Read the [shared Full/RQ3 contract](../../../docs/00-context/workflow/FULL-RQ3-CONTRACT.md). Resolve variant from configuration, cover every functional flow in A-D for both variants, and preserve identical evaluation/gate requirements. RQ3 omits E/F from generation input only. Both variants use automatic verification within repair and the same final measurement boundary.

Use one task for one UC/run and the [shared measurement protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md). Read the researcher-prepared Confirmed JSON; root `.env` is not a prerequisite. Configuration preflight is automatic, not a human gate. `advance-experiment-gate` invokes telemetry and audit engines internally after confirmation of later gates. Never ask the researcher to invoke Measure/Audit skills or advance beyond a human gate in the same turn.

1. **Automatic configuration preflight:** use `gen-coding-prompt/scripts/preflight_configuration.py` to resolve and read-only validate the existing Confirmed configuration, frozen BR baseline, frozen flow baseline and Draft Canonical Run JSON. Their preparation tool is irrelevant; all four must already exist. Stop on any integrity issue or ambiguity; never infer settings, modify Confirmed JSON or request redundant confirmation.
2. **Phase 1, same work turn:** verify existing inputs without creating or initializing them, generate the Full A-F or RQ3 A-D Draft, then show Prompt Gate. The prepared canonical run starts with gates at `prompt`; no configuration receipt is needed. On later confirmation, approve the Draft and internally close prompt telemetry; do not start source in that gate turn.
3. Validate the existing run activation receipt and generate first-pass source. The researcher prepares the receipt with any tool outside generation; missing/invalid receipts block without auto-creation. Preserve hash/evidence and show Source Gate. On confirmation, internally close source telemetry only.
4. Show First-pass Audit Gate. On confirmation, run permitted non-test checks, BR audit and flow audit. The researcher may separately request the optional `audit-figma-ui-accuracy` skill or inspect UI manually; this workflow never invokes it or requires its result.
5. Show Repair Decision Gate. Record explicit authorize or skip. For authorized repairs, execute bounded repairs and automatically run `audit-generation-metrics` with BR/flow/runtime verification in the repair work turn, freeze the final hash and terminal status, then use Repair Gate confirmation to close telemetry. For skipped repair, retain the existing first-pass evidence on unchanged source as terminal evidence; record the skip reason and actual outcome.
6. Proceed directly to Final Metrics after repair telemetry closure or the recorded no-repair decision. Its confirmation, or explicit `$measure-uc-workflow-tokens finalize-workflow`, finalizes workflow telemetry and refreshes reports. Never insert a separately confirmed final audit.

Internal gate telemetry never invokes Excel export. After Final Metrics Gate persists `metrics.status: finalized`, the researcher may separately invoke `$export-experiment-excel <UC-ID> <LINK_OR_FILEPATH> <TAB_NAME>`. Export dynamically maps stored canonical values to inspected headings, including BR/flow/repair and optional UI fields, without running assessments or altering canonical evidence. Missing data becomes N/A; formulas and protected/manual content remain unchanged.

Do not add enterprise lifecycle phases, independent scan workflows, or tests/test cases. Never infer a missing business decision.
