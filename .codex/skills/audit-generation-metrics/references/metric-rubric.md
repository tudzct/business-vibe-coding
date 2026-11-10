# Metric rubric

## Business Rule results

The frozen ordered BR list is the denominator. Each BR receives one terminal status:

- `correct`: an integrated-runtime observation demonstrates the complete rule.
- `incorrect`: an integrated-runtime observation demonstrates that the rule fails, is contradicted or cannot be completed because of a proven generated-source defect.
- `not_available`: runtime evidence cannot yet support a defensible decision and no generated-source failure has been proven; state the exact limitation.

Prompt prose alone is not evidence. Source/configuration/build findings diagnose defects but do not replace actual runtime evidence for a normal conclusive result. Under the operational completion rule, a proven generated-source technical/UI defect makes every affected BR and Flow `incorrect`; a system-wide blocker affects the complete frozen inventories and produces Flow accuracy `0%`. Every affected result references the causing canonical defect IDs instead of claiming successful runtime observations. Initial and final snapshots contain exactly the baseline BR IDs in order and their totals match.

Canonical `defects` records one root cause once per source stage as `business_rule`, `flow`, `technical` or `ui`. Functional UI defects prevent required interaction, navigation, state transition or frontend integration; cosmetic Figma differences remain researcher-managed. Every `incorrect` BR/Flow contains `caused_by_defect_ids`, and every affected target named by an open functional defect is `incorrect` and references that defect. A direct researcher correction to `incorrect` creates an attributed defect from the supplied repair facts without inventing runtime proof; `correct` creates no defect. `not_available` is not a defect and requires an `unavailable_reason` plus researcher resolution or bounded remeasurement. A generated-source defect with `blocks_execution: true` produces system-wide `incorrect` verdicts and a separate execution-blocked note; environment/researcher setup failure or ambiguous cause does not unless the researcher makes the final classification.

Accepted BR reporting follows `accepted-br-audit-results-v1`. Researcher verdicts and evidence-backed LLM re-audits are append-only follow-ups tied to the immutable parent snapshot and source revision. The latest conclusive result per BR in the active stage is selected; a later `not_available` result does not erase an earlier `correct` or `incorrect`. Researcher verdicts retain attribution and are never presented as independent runtime evidence.

## Supporting metrics

- First-pass audit and automatic verification within authorized repair run `audit-flow-accuracy` against the frozen Basic/Main, Alternative and Exception Flow denominator. Each flow has equal weight; steps only determine whether their parent flow can complete. No separate final-audit gate is required.
- Figma/UI visual accuracy is researcher-managed. Functional UI failures are canonical `ui` defects; Audit never calculates, validates or overwrites the manual visual score.
- Complexity records actors, main steps, alternate/exception flows, entities, integrations, Business Rules and UI states.
- Time comes from automatic timezone-qualified ISO/epoch pairs; tokens come only from telemetry.
- Explicit close/finalize commands invoke the measurement engine, which owns canonical `metrics`; Audit preserves it while validating BR/flow evidence.
- Export input, cached input, output, reasoning output and total per prompt/source/repair and full workflow, plus captured seconds, selected turn count and observable tool-call count. Cached/reasoning are subsets, never added again. Do not publish fresh input, usage-update count, estimated call counts, money cost or a three-phase subtotal. Missing telemetry is null with a reason.
- Workflow seconds = Prompt execution + first-pass Source execution + complete sub-prompt generation + the complete source-correction invocation at the shared START/END boundaries. Configuration, approval, dataset resolution, separate audit/runtime/finalization and Measure/report work are excluded from time. Capture endpoints live; aggregate after completion. Never substitute UI duration, whole-chat elapsed time or missing endpoints.
- Record generation, audit and each repair model independently. Use the exact [approved prompt](../../../../docs/02-construction/coding-prompts/%3CUC-ID%3E-coding-prompt.md) and source baseline pinned to the active run.
- The first-pass audit response and the repair response print BR and flow summaries. Researcher-managed UI and manual Excel fields remain untouched.
