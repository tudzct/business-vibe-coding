# Metric rubric

## Business Rule results

The frozen ordered BR list is the denominator. Each BR receives one terminal status:

- `met`: inspectable implementation evidence satisfies the complete rule.
- `unmet`: an applicable part is missing or contradictory.
- `not_evaluable`: permitted evidence cannot support a defensible decision; state the exact limitation.

Prompt prose alone is not evidence. Cite source/configuration/build/bounded-runtime locations. Initial and final snapshots must contain exactly the baseline BR IDs in order and their totals must match.

## Supporting metrics

- Every Audit invocation also runs the Figma UI accuracy child workflow for the same UC/run/source revision. UI accuracy uses the frozen design and reports raw category-checkpoint total/met/unmet/not-evaluable counts, weighted accuracy, structural coverage and deterministic similarity when available. A no-design or evidence-blocked result is persisted and reported as N/A with its exact status/reason; it is never silently omitted.
- Flow accuracy is satisfied/evaluable UC checkpoints across trigger, request, domain decision, persistence, response, UI result and exceptions.
- Complexity records actors, main steps, alternate/exception flows, entities, integrations, Business Rules and UI states.
- Time comes from automatic timezone-qualified ISO/epoch pairs; tokens come only from telemetry.
- Measure owns post-turn token/time calculation and canonical `metrics`; Audit preserves it while validating BR evidence. Capture audit time with the shared helper under the open timing bucket, or auxiliary `audit` after closure. Token attribution follows actual primary work: audit-only and other auxiliary turns contribute tokens only to workflow regardless of timing bucket. Necessary blocked attempts remain selected and are classified by work, not outcome; see the shared selection-schema.md.
- Export input, cached input, output, reasoning output and total per prompt/source/repair and full workflow, plus captured seconds, selected turn count and observable tool-call count. Cached/reasoning are subsets, never added again. Do not publish fresh input, usage-update count, estimated call counts, money cost or a three-phase subtotal. Missing telemetry is null with a reason.
- Workflow seconds sum all non-overlapping captured UC work segments, including auxiliary work. Capture endpoints in the work turn; aggregate only after completion. Never substitute UI duration or start-of-chat to end-of-chat elapsed time. Researcher waiting between segments and Measure/report-only turns are excluded.
- Record generation, audit and each repair model independently. Start model variants from the same approved prompt and source baseline.
- The final Audit response prints the BR and UI summaries together for manual researcher transcription. Audit does not write those judgment fields to Excel.
