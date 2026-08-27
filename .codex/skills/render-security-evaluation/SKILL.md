---
name: render-security-evaluation
description: Render a researcher-readable Markdown report deterministically from a canonical independent security evaluation JSON. Use when a researcher or reviewer asks to view, export, or inspect `evaluation-summary.json`; support historical schemas 3/4 and canonical product-level schema 5 without rerunning Semgrep/ZAP or changing evaluation evidence.
---

# Render security evaluation

Read `docs/00-context/workflow/ARTIFACT-RETENTION-AND-CONTEXT.md` and resolve exactly one `docs/03-audit/security-tools/finalsource/<EVALUATION-ID>/evaluation-summary.json`. Historical per-UC schema-3/4 paths remain readable evidence. Do not load raw scanner output, source, generation reports or Docker history unless the researcher separately requests interpretation.

Run:

```text
python3 .codex/skills/render-security-evaluation/scripts/render_report.py <evaluation-summary.json> [--output <report.md>]
```

Default output is `evaluation-report.md` beside the selected JSON. The script supports historical schemas 3/4 and canonical schema 5, records the canonical source path and SHA-256, and renders only normalized safe fields. For schema 5 it renders the criteria-catalog reference and each finding's independent criterion identifier. It must not infer triage, convert findings to SR `met/unmet`, or claim vulnerability absence.

Markdown is a disposable on-demand view, not evidence or source of truth. Regenerate it after JSON changes; never reconcile Markdown edits back into canonical JSON.
