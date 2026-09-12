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

Render the three measured bucket breakdowns and full workflow from canonical `metrics`. Mark unclosed values N/A until Final Metrics Gate. Rendering has no authority to recompute telemetry or change BR/flow results.

Render the current flow assessment without recomputation. Figma/UI data is strictly optional: render available researcher-entered values or results from the independently requested `audit-figma-ui-accuracy` skill without calculating or inferring scores. Missing/null UI data may be omitted; incomplete optional UI data must not crash or block the BR/flow/metrics report. A UI result never becomes an experiment completion gate. Excel output remains separate.
