---
name: run-business-vibe-coding
description: "Run the research product's two phases: generate a Business Coding Prompt from a Sheet-derived UC/BR specification, then generate, audit and repair source code without test generation."
---

# Run Business Vibe Coding

Read the project context and two-phase workflow.

1. **Phase 1:** accept one frozen UC, validate a Confirmed configuration, invoke `gen-coding-prompt`, freeze all BRs and obtain researcher approval for the Prompt A-F artifact and material unresolved decisions.
2. **Phase 2:** activate exactly one configured run and invoke `gen-source-code`. Generate only under `finalsource/` through the frontend/backend skills.
3. Preserve initial evidence, assess every frozen BR and use one `bug-fixing-sub-prompt` per evidenced defect.
4. Use Docker Compose for authorized runtime evidence, then freeze the final source hash and canonical metrics when terminal.

Do not add enterprise lifecycle phases, independent scan workflows, or tests/test cases. Never infer a missing business decision.
