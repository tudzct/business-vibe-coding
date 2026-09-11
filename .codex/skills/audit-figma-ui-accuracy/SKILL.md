---
name: audit-figma-ui-accuracy
description: Score implemented UI against the frozen Figma design using the Security reference rubric, retain screenshot-backed checkpoint evidence and save UI accuracy in the Business experiment result. Does not score flow accuracy or authorize repairs.
---

# Audit Figma UI Accuracy

Use this for a researcher-requested UI/Figma comparison. Read project context, connected sources, the active run JSON and [references/ui-rubric.md](references/ui-rubric.md). UI accuracy is a supplementary visual measurement; it does not change the frozen Business Rules, their denominator, or the two-phase method.

## Evidence and scoring

1. Identify exactly one UC/run, source revision and assessment stage (`initial` or `final`). Use `resolve-figma-design-dataset` with the dataset version pinned by the configuration/approved prompt. Do not select the latest dataset, refresh it implicitly, or follow Figma URLs from frozen UCs. Read the capture specification and require complete, checksum-valid evidence. Retain the resolver output and its provenance.
2. Before judging implementation, enumerate the complete visible-node/group inventory, required states and viewports from the frozen design/UC. Save this checklist as a run artifact. Use the same inventory for initial/final comparison. Do not omit difficult or missing elements to inflate the score.
3. Inspect runtime screenshots at the reference's natural viewport and required states, plus source-to-node mapping. Record source revision, viewport, browser/font/device-scale conditions, capture time and screenshot SHA-256. Use existing evidence when valid. New runtime execution requires the repository's Docker authorization. Never create/run tests. Source inspection alone cannot produce a final UI score.
4. Assign evidence-backed `met`, `unmet`, or `not_evaluable` to each checkpoint. Missing implementation visible in a valid capture is `unmet`; missing evidence is not a pass. Calculate the unchanged six-category weighted rubric using `scripts/score_ui_accuracy.py`. The AI makes the visual judgments; the helper validates evidence references and performs arithmetic, not autonomous pixel recognition.
5. Report structural coverage and, in a deterministic environment, a separately reproducible perceptual similarity with target `>= 0.90`. Preserve comparator name/version/settings, image hashes and limitations. The reference project does not provide a pixel-comparison algorithm: do not claim this helper copies one, invent similarity, or substitute weighted accuracy for similarity. If unavailable, record null and why, and leave similarity verification unresolved.
6. Persist using the schema/command in [references/assessment-schema.md](references/assessment-schema.md). Keep initial evidence immutable; append final assessments rather than replacing history. Save canonical JSON and a readable UI report. Refresh an existing complete-run Markdown report through `render-experiment-report` when applicable. Preserve all BR, token/time and repair fields.

## Boundaries

- A visual miss is a repair-required observation, not a request to approve a different mapping. Report defects; do not repair source or bypass the Full/RQ3 hold gate. Repair still requires separate researcher authorization.
- For UC work, follow the shared [phase/timestamp protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md): reuse an open captured work segment; otherwise capture under the currently open phase or auxiliary `audit` after phase closure. Do not reopen a closed phase. Do not run Measure in this turn.
- Return `not_applicable` only for a verified `no-design` mapping. Incomplete/blocked evidence is `not_evaluable`, with null score and a reason, not a fabricated 0% or 100%.
- Do not implement/evaluate flow accuracy. Do not alter Security reference files, frozen designs, frozen UCs or application code.
