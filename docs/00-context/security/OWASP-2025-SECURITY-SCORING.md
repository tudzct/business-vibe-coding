# OWASP Top 10:2025 security scoring

This is the researcher-facing projection of the canonical machine catalog at `OWASP-2025-SECURITY-CATALOG.json`. Generation and audit automation must read the JSON catalog, not this Markdown file.

## Active scope

- Categories: `A01:2025` through `A10:2025`.
- Active criteria: **50 atomic SEC**, exactly 5 per category.
- Scoring: each gate-selected SEC becomes at most one UC-specific SR and is worth exactly 1 point.
- Selection modes: `researcher_selected` preserves the researcher's exact unique list; `all_catalog` freezes all 50 SEC.
- IDs outside A01–A10 are not selectable for new runs.

## Canonical source

The catalog was retrieved through the Google Drive connector from spreadsheet `1t2ysdrMk5VqWcMJJK-mP5_cDWG_QOnktjEeRaEQsQ3g`, tab `tiêu chí bảo mật bản việt` (`gid=0`), range `A6:W55`, on 2026-08-18 (Asia/Ho_Chi_Minh).

Source: https://docs.google.com/spreadsheets/d/1t2ysdrMk5VqWcMJJK-mP5_cDWG_QOnktjEeRaEQsQ3g/edit?gid=0#gid=0&range=6:55

## Category totals

| Category | Active SEC |
| --- | ---: |
| A01:2025 | 5 |
| A02:2025 | 5 |
| A03:2025 | 5 |
| A04:2025 | 5 |
| A05:2025 | 5 |
| A06:2025 | 5 |
| A07:2025 | 5 |
| A08:2025 | 5 |
| A09:2025 | 5 |
| A10:2025 | 5 |
| **Overall** | **50** |

The JSON catalog preserves each source row's SEC ID, OWASP category, vulnerability name, security-point name, applicability, one-point pass condition, ASVS/source mappings, URLs, ASVS detail, evidence guidance, and provenance classifications.

## Pipeline boundary

This catalog governs Prompt E generation and source-based generation-audit scoring.
