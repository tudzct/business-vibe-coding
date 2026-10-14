# Metric rubric

## Business Rule results

The frozen ordered BR list is the denominator. Each BR receives one terminal status:

- `met`: an integrated-runtime observation demonstrates the complete rule.
- `unmet`: an integrated-runtime observation demonstrates that an applicable part fails or contradicts the rule.
- `not_evaluable`: the system can be exercised, but runtime evidence still cannot support a defensible decision; state the exact limitation.
- `execution_blocked`: an evidenced defect in generated source prevents the integrated system from running, so every frozen BR is blocked for that audit stage.

Prompt prose alone is not evidence. Source/configuration/build findings diagnose defects but do not replace actual runtime evidence for `met` or `unmet`. Each normal result records its runtime observation IDs. Each `execution_blocked` result records the canonical blocking defect IDs. Initial and final snapshots contain exactly the baseline BR IDs in order and their totals match.

Canonical `defects` records one root cause once per source stage as `business_rule`, `flow` or `technical`. Every AI-audited `unmet` BR and `incorrect` Flow has a matching open defect; a direct researcher verdict retains its attribution without inventing a defect or runtime proof. Technical failures are retained even when no BR/Flow owns them. `not_evaluable` is not a defect. A generated-source defect with `blocks_execution: true` produces system-wide `execution_blocked`; environment/researcher setup failure or ambiguous cause does not.

Accepted BR reporting follows `accepted-br-audit-results-v1`. Researcher verdicts and evidence-backed LLM re-audits are append-only follow-ups tied to the immutable parent snapshot and source revision. The latest conclusive result per BR in the active stage is selected; a later `not_evaluable` result does not erase an earlier `met` or `unmet`. Researcher verdicts retain attribution and are never presented as independent runtime evidence.

## Supporting metrics

- First-pass audit and automatic verification within authorized repair run `audit-flow-accuracy` against the frozen Basic/Main, Alternative and Exception Flow denominator. Each flow has equal weight; steps only determine whether their parent flow can complete. No separate final-audit gate is required.
- Figma/UI accuracy is researcher-managed. Audit never calculates, validates or overwrites it.
- Complexity records actors, main steps, alternate/exception flows, entities, integrations, Business Rules and UI states.
- Time comes from automatic timezone-qualified ISO/epoch pairs; tokens come only from telemetry.
- Explicit close/finalize commands invoke the measurement engine, which owns canonical `metrics`; Audit preserves it while validating BR/flow evidence.
- Export input, cached input, output, reasoning output and total per prompt/source/repair and full workflow, plus captured seconds, selected turn count and observable tool-call count. Cached/reasoning are subsets, never added again. Do not publish fresh input, usage-update count, estimated call counts, money cost or a three-phase subtotal. Missing telemetry is null with a reason.
- Workflow seconds = Prompt execution + first-pass Source execution + all Repair executions at the shared START/END boundaries. Configuration, approval, dataset resolution, separate audit/runtime/finalization and Measure/report work are excluded from time. Capture endpoints live; aggregate after completion. Never substitute UI duration, whole-chat elapsed time or missing endpoints.
- Record generation, audit and each repair model independently. Use the exact [approved prompt](../../../../docs/02-construction/coding-prompts/%3CUC-ID%3E-coding-prompt.md) and source baseline pinned to the active run.
- The first-pass audit response and the repair response print BR and flow summaries. Researcher-managed UI and manual Excel fields remain untouched.
