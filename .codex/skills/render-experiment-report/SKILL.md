---
name: render-experiment-report
description: Render a researcher-readable Markdown report deterministically from a finalized canonical experiment-run JSON. Use only when a researcher or reviewer explicitly asks to view, aggregate, export or prepare a completed run report; never use during generation, audit or repair finalization.
---

# Render experiment report

Read `docs/00-context/workflow/ARTIFACT-RETENTION-AND-CONTEXT.md`. Resolve exactly one finalized `docs/05-experiments/<UC-ID>/<RUN-ID>.json`; do not load source, prompts, Figma, or Docker history unless the researcher separately requests interpretation.

Run:

```text
python3 .codex/skills/render-experiment-report/scripts/render_report.py <run.json> [--output <report.md>]
```

The script validates `run_id`, `uc_id`, canonical `run_status`, and completed source-based security results, records the source path and SHA-256, and maps canonical fields into the researcher-readable sections defined by `templates/research/experiment-run.template.md`. It renders unexpected top-level fields under `Additional canonical fields` so information is not silently lost. Treat `run_status` as the run-lifecycle status; do not require or synthesize a duplicate top-level `status`. The script reads JSON bytes and writes only the requested Markdown output. Markdown is a disposable view, not evidence or source of truth. Regenerate it after JSON changes; never reconcile edits from Markdown back into JSON.

For cross-run synthesis, render requested runs first, then analyze only the selected canonical fields. Clearly separate deterministic values from AI interpretation.
