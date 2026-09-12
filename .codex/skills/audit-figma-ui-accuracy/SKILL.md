---
name: audit-figma-ui-accuracy
description: Optional standalone Figma/UI scoring, invoked manually only when the researcher explicitly requests it. Compare implemented UI with frozen Figma evidence and save screenshot-backed results; never run automatically from audit or experiment gates.
---

# Optional Standalone Figma UI Audit

This skill is independent and strictly optional. Run it only on an explicit researcher request, for example `$audit-figma-ui-accuracy for UC-01 / <RUN-ID>`. The researcher may inspect the interface by eye instead, skip scoring entirely, or request this skill separately at any time. A generation request, Audit Gate confirmation or request to export results does not invoke this skill.

Neither using this skill nor passing its local UI validation is a condition for BR/flow audit, telemetry closure, Excel export or experiment completion. Missing `ui_accuracy`, a missing/null score, or UI statuses such as `not_evaluable`, `similarity_pending` and `repair_required` never block those operations. These statuses describe this optional comparison only.

## Evidence and scoring

Read project context, connected sources, the selected canonical UC/run and [the UI rubric](references/ui-rubric.md). Use the existing `scripts/score_ui_accuracy.py` unchanged.

1. Identify exactly one UC/run, source revision and assessment stage (`initial` or `final`). Resolve the configuration/approved-prompt-pinned frozen dataset through `resolve-figma-design-dataset`. Retain checksum-verified evidence and provenance; never choose the latest dataset implicitly or follow Figma URLs from frozen UCs.
2. Before judging implementation, enumerate the frozen visible nodes/groups, required states and viewports. Save the inventory and keep it consistent across comparisons. Do not omit missing or difficult elements.
3. Inspect runtime screenshots at the reference viewport and required states, plus source-to-node mapping. Retain source revision, viewport, browser/font/device-scale details, capture time and screenshot SHA-256. Use valid existing evidence; new runtime execution follows existing Docker authorization. Source inspection alone cannot establish a final UI score.
4. Assign evidence-backed `met`, `unmet` or `not_evaluable` judgments per checkpoint. Run the existing scorer to validate the evidence and calculate the fixed six-category weighted rubric. The AI supplies visual judgments; the script performs evidence validation and arithmetic.
5. Report structural coverage and the separate perceptual-similarity value when reproducible evidence is available. Keep comparator method/version/settings, image hashes and limitations. The scorer validates supplied similarity evidence; do not claim it autonomously compares pixels or invent a missing similarity value. Missing evidence produces an unavailable result with a reason.
6. Follow [assessment input and persistence](references/assessment-schema.md). Preserve immutable initial evidence and append subsequent final assessments. Save the optional UI JSON/Markdown and print checkpoint counts, weighted accuracy, structural coverage and available similarity. An existing complete-run report may be refreshed through `render-experiment-report`; preserve all BR, flow, telemetry, repair, gate and run-status fields.

## Independent operation

- Do not call this skill from `audit-generation-metrics`, telemetry, Excel export, or an experiment gate. Do not invoke those operations after scoring automatically.
- Evidence requirements apply only when producing a valid optional UI assessment. If evidence or local validation fails, explain that limitation for this UI request and leave the main experiment state unchanged. Do not fabricate a passing score or weaken scorer validation.
- A `repair_required` UI result is an observation, not repair authorization or a blocked experiment gate. Further repair requires a separate researcher request under the existing repair rules.
- Use `not_applicable` only for verified `no-design`; unavailable evidence is `not_evaluable`, never fabricated 0% or 100%.
- Follow the shared [timing protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md) if this request is within an open UC workflow. Standalone UI audit contributes no generation execution seconds. Never reopen or recalculate closed phase/workflow telemetry to include a later optional UI request.
- Do not create/run tests, change frozen inputs or application source, or score Business Rules/flows. Return the optional UI result directly to the researcher.
