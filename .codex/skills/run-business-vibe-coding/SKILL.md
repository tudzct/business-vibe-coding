---
name: run-business-vibe-coding
description: "Run the research product's two phases: generate a Business Coding Prompt from a Sheet-derived UC/BR specification, then generate, audit and repair source code without test generation."
---

# Run Business Vibe Coding

Read the project context and two-phase workflow.

1. **Phase 1:** accept one frozen UC, validate a Confirmed configuration, invoke `gen-coding-prompt` (with `--variant full` or `--variant rq3`), freeze all BRs and obtain researcher approval for the prompt artifact (Prompt A-F or Prompt A-D) and material unresolved decisions.
2. Treat prompt generation as one measured stage that may span multiple turns when researcher-supplied configuration is needed. Record every turn ID from the initial phase request through the turn that presents the Draft prompt, then end that assistant turn for approval. At the start of the next researcher-triggered turn, extract those now-closed turns and persist `prompt-generation-telemetry.json` beside the run activation before source mutation. Never measure the active turn or move its end time to a later token event.
3. **Phase 2:** activate exactly one configured run and invoke `gen-source-code` with the approved prompt. Generate only under `finalsource/` through the frontend/backend skills.
4. Treat first-pass code generation as a second measured stage. Preserve its source hash and assessment, end the turn at the hold gate, then extract the closed code-generation turn at the start of the next researcher-triggered turn before any repair. The hold applies to both variants for telemetry; RQ3 additionally requires explicit repair authorization.
5. Treat all authorized bug-fixing sub-prompts as the third measured stage. After the last repair and verification, stop at a telemetry-finalization gate. Finalize the run only in the next researcher-triggered turn, after every repair turn is closed and its aggregate telemetry has been extracted.
6. Use Docker Compose for authorized runtime evidence, then freeze the final source hash and canonical metrics when terminal.

The canonical token metrics must expose `prompt_generation_total`, `code_generation_total`, `repair_total`, `implementation_total`, and `overall_total`. Keep `initial_total` as a compatibility alias for `code_generation_total` and `total` as a compatibility alias for `implementation_total`. A measured stage is `null`, with a reason, only when its closed-turn token event is genuinely absent; never substitute a later mixed-stage aggregate.

Do not add enterprise lifecycle phases, independent scan workflows, or tests/test cases. Never infer a missing business decision.
