---
name: render-experiment-report
description: Render a researcher-readable Markdown view from finalized canonical Business Rule experiment-run JSON without changing evidence.
---

# Render Experiment Report

Resolve exactly one finalized canonical run JSON and run:

```text
python3 .codex/skills/render-experiment-report/scripts/render_report.py <run.json> [--output <report.md>]
```

The renderer validates lifecycle fields and completed per-BR results, records input path/checksum, and maps canonical fields to the report template. Markdown is disposable; never reconcile edits back into JSON. Do not load unrelated source/prompts/runtime history unless interpretation is separately requested.

Render the three measured phase breakdowns and full workflow directly from canonical `metrics`. Mark unclosed/missing values N/A and workflow provisional until `metrics.status=finalized`. Do not invent a three-phase subtotal. Measure automatically writes a metrics-only Markdown beside the run ledger; refresh any existing final experiment report after final workflow measurement in that same excluded reporting turn. Rendering has no authority to recompute telemetry or change BR results.

If `ui_accuracy` exists, render its current assessment, stage, weighted percentage, structural coverage and separate perceptual comparison without recomputing judgments. The UI skill owns that block. Excel output uses `export-experiment-excel`; this renderer remains Markdown-only.
