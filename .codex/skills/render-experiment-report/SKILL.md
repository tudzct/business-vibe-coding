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
