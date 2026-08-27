---
name: run-secure-aidlc
description: "Run the research product's simplified four-step AI-DLC: use case, security coding prompt, source generation, and audit/repair. Use when researchers want an end-to-end workflow or need to resume a use case without adopting enterprise AI-DLC roles, TAR/PRD artifacts, operations phases or test-case processes."
---

# Run Simplified Secure AI-DLC

Read `PROJECT_CONTEXT.md`, `docs/00-context/workflow/AI-DLC-ADAPTATION.md`, `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md`, `docs/00-context/workflow/gates/EXPERIMENT-CONFIGURATION-GATE.md` and `references/workflow.md`.

1. **Use case:** Accept one readable `uc-*.md` file. Ask only about a missing decision that materially changes behavior, authorization, API or data.
2. **Unified configuration and security-scope activation:** Collect researcher identity, UC security scope, audit design and planned run assignments once in a unified experiment configuration. Run `scripts/validate_experiment_configuration.py` and require `status: Confirmed` before activation. Invoke `$gen-coding-prompt <use-case-path>`. Activate and project only the selected UC security scope before Prompt E. Generate Prompts A-F from the UC and security resource.
3. **Run/model activation and source code:** After prompt/schema approval, read `docs/00-context/workflow/gates/MODEL-SELECTION-GATE.md`. Select exactly one configured `run_id`; require its run-specific model-selection projection and validate model, replicate, run order and audit protocol against the unified configuration. Only then invoke `$gen-source-code <prompt-path>`. It generates only under `finalsource/` using the FE/BE technical skills.
4. **Audit and repair:** Invoke `$audit-generation-metrics` and persist initial generation telemetry/evidence before repair. Assess every frozen Prompt E SR from source/configuration/build/runtime evidence. If an evidenced generation-audit error exists, invoke `$bug-fixing-sub-prompt` for one minimal repair iteration and append telemetry. Repeat with a new repair ID only while evidence supports another bounded attempt.
5. **Runtime completion:** After initial metrics exist and every evidenced repair is recorded, require researcher-authorized `$docker-deployment run` for any generated FE/BE. Rebuild the affected images from current source, start the stack, verify containers, healthchecks, UI/API reachability, and exercise the approved UC trigger/main/success/exception flow as bounded runtime smoke evidence without creating test cases. A stale pre-generation image is not evidence. Runtime failures re-enter step 4 through a new evidenced repair; unavailable authorization/environment leaves the run non-terminal and explicitly blocked.
6. **Generation completion:** End the AI-DLC only after step 5 passes and every frozen SR has one complete source-based assessment, then freeze the final source hash and finalize the canonical JSON metrics. Markdown remains on demand.

Do not introduce BA/Tech Lead/Tester role workflows, PRD/TAR bundles, an Operations phase, or tests/test cases. Never infer/default requested model fields or store them as `null`. Report only the current step, generated paths and the next action expected from the researcher.
