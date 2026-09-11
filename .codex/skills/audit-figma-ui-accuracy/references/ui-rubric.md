# Business UI accuracy rubric

Use the frozen dataset as the complete visual contract and any autonomous reconstruction record only as traceability. Require 100% structural coverage for every visible node/group, then score weighted inspected checkpoints: visible elements 20%, hierarchy/layout 25%, spacing/dimensions 15%, typography/colors/assets 15%, interaction states 15%, responsive behavior 10%. Runtime screenshots must use the natural reference viewport and UC-required states and, when the environment is deterministic, report perceptual similarity with mandatory target `>= 0.90` separately from the weighted score. A miss is a repair-required defect, not a researcher mapping question. Do not award a final UI score from source inspection alone or hide font/browser/antialiasing limitations. Use N/A only without a referenced design.

## Deterministic implementation

The rubric defines weights and evidence requirements. This skill supplies a deterministic checkpoint calculator. Freeze checkpoint granularity before comparison; use equally weighted binary checkpoints within each category:

| Category key | Weight |
|---|---:|
| visible_elements | 20 |
| hierarchy_layout | 25 |
| spacing_dimensions | 15 |
| typography_colors_assets | 15 |
| interaction_states | 15 |
| responsive_behavior | 10 |

Category fraction = met checkpoints / all checkpoints in that category. Weighted percent = sum(weight × category fraction). Do not reweight missing categories. If any category/checkpoint is not evaluable, retain category evidence but publish null overall score with reasons. Unknown structural coverage also prevents a complete score. An incomplete structure with known misses may have a diagnostic weighted score, but status remains `repair_required`, never a passed comparison.

Structural coverage is separately the percentage of frozen visible nodes/groups present in the runtime. A high weighted score does not waive the 100% structural target. Every known visual miss remains a defect. Similarity is a separate 0–1 metric with its own method and limitations; it is not another weight. Without reproducible similarity in a deterministic environment, a weighted score may be reported as `similarity_pending`, not fully verified.

Checkpoint design and AI judgments remain auditable human/AI assessments; arithmetic reproducibility does not make visual judgment objective. Use the same checkpoints, viewports and comparator settings across comparable runs. No new flow or Business Rule scoring is introduced.
