# Metric rubric

## Business Rule results

The frozen ordered BR list is the denominator. Each BR receives one terminal status:

- `met`: inspectable implementation evidence satisfies the complete rule.
- `unmet`: an applicable part is missing or contradictory.
- `not_evaluable`: permitted evidence cannot support a defensible decision; state the exact limitation.

Prompt prose alone is not evidence. Cite source/configuration/build/bounded-runtime locations. Initial and final snapshots must contain exactly the baseline BR IDs in order and their totals must match.

## Supporting metrics

- UI accuracy uses the frozen design and reports structural coverage plus deterministic similarity when available.
- Flow accuracy is satisfied/evaluable UC checkpoints across trigger, request, domain decision, persistence, response, UI result and exceptions.
- Complexity records actors, main steps, alternate/exception flows, entities, integrations, Business Rules and UI states.
- Time comes from automatic timezone-qualified ISO/epoch pairs; tokens come only from telemetry.
- Record generation, audit and each repair model independently. Start model variants from the same approved prompt and source baseline.
