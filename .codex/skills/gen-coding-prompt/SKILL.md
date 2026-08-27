---
name: gen-coding-prompt
description: Generate a complete security coding prompt directly from a use-case Markdown file, including security-resource derivation and Prompts A-F. Use when the user provides or names a file such as uc-1-login.md and wants a security-coding-prompt without manually filling or pasting the external BUSINESS_PROMPT_TEMPLATE; prohibit test-case generation.
---

# Generate Security Coding Prompt From Use Case

Accept a use-case path as the only required input, for example:

`$gen-coding-prompt docs/01-inception/use-cases/uc-1-login.md`

Do not ask the user to paste the use-case or prompt template into chat when the file is readable.

## Immutable source boundary

- Treat `docs/01-inception/use-cases/uc-*.md` as read-only inputs derived from `resource/TechnicalReport.pdf`.
- Never edit, format, rename, move, delete or append content to a source UC, including status, decisions, normalized contracts or Security Requirements.
- Write every derived value only to `docs/02-construction/` artifacts. If the source is inconsistent or incomplete, record the issue in generated artifact metadata or stop for researcher input; never fix the UC in place.

## Resolve input

1. Resolve the supplied path relative to the repository root. If only a filename is supplied, search `docs/01-inception/use-cases/` for one unambiguous match.
2. Read the complete use-case file as the authoritative TechnicalReport-derived functional input. The tracked UC files in `docs/01-inception/use-cases/` intentionally preserve Prompt A-D without normalization or added security text. Use `resource/TechnicalReport.pdf` only as provenance or when the researcher explicitly requests comparison.
3. Read project rules, artifact policy, experiment/security gates, compact activation/security-resource JSON templates, coding-prompt template and prompt/file contracts. Load connected-source details only when the UC references them.
4. Normalize a filename such as `uc-1-login.md` to canonical ID `UC-001` while preserving the original path. Do not rename the user's file unless requested.
5. Require the TechnicalReport-derived use-case specification and Project-Specific Implementation Context (Prompts A-D). Do not rewrite, normalize or append decisions/security requirements to the source UC. Record unresolved ambiguities only in generated artifact metadata. Apply the project-approved response normalization automatically: preserve UC HTTP status, business fields and safe messages; treat a raw success example as the domain payload inside `{ success: true, message, data }`; map errors to `{ success: false, statusCode, message, timestamp, path }`. Never ask again merely because the UC raw shape differs from these envelopes. Stop only for missing or high-impact ambiguity that changes behavior, authorization, data/schema, HTTP status, business fields or message semantics. Do not create a separate Business Requirements/Business Rules Compliance prompt.

## Resolve connected sources

- Use the Google Drive/Google Sheets plugin for referenced Sheets. Read only specified tabs, ranges or columns and record provenance.
- When a Figma URL/frame/node is referenced, first load `resolve-figma-design-dataset` and resolve the UC to its frozen snapshot. Use the installed `figma:figma-design-to-code` skill and live plugin only when creating or refreshing a missing dataset version. Record dataset ID, node ID and provenance; do not substitute or guess an inaccessible design.
- If the use case has no Figma/Sheet reference, continue from local sources and mark the connector input not applicable.

## Generate artifacts

1. Require a Confirmed configuration and compact security-scope activation receipt. Resolve scope fields from the configuration, then invoke `$gen-security-coding-resource`.
2. Validate exact SEC-ID equality between the activated security-point selection, the exact catalog-entry snapshots in the security resource and Prompt E.
3. Generate Prompt E only by running `.codex/skills/gen-security-coding-resource/scripts/render_prompt_e.py` with the canonical UC ID and exact selected SEC IDs. Insert its catalog projection verbatim. Do not paraphrase, shorten, translate or contextualize any SR field. Append a source-backed supplement only when the security resource records that a required catalog field was empty or explicitly not specified/not populated; the supplement must come solely from that SEC record's `primary_source_url` and retain its provenance. Never use another source or invent content. Fill Prompts A-D/F from the use case, connected sources and existing code context without changing Prompt E.
4. Write `docs/02-construction/coding-prompts/<UC-ID>-security-coding-prompt.md`.
5. Include artifact metadata: canonical UC ID/name, source use-case path, unified experiment configuration path/checksum, security-resource path, security-point selection mode/artifact, frozen totals, source provenance, generation timestamp, status and unresolved decisions.
6. For every Figma-backed UC, inventory the explicitly activated frozen frame. Create detailed UI mapping only for an inference, mismatch, omission dispute or reviewer request; it is never a gate. Preserve all visual/behavior boundaries and stop only for invalid evidence or material conflicts.
7. Prompt B-D must reference the exact dataset ID/node/checksum and, when present, the autonomous reconstruction record. Preserve all UC flow checkpoints without duplicating the full component tree. The immutable UC controls behavior, the frozen dataset controls visuals, and the FE skill owns autonomous reconstruction and visual-QA mechanics.
8. Preserve source AC/BR IDs only as traceability anchors and preserve mechanically derived SR IDs as the security intervention. Prompt E must be the exact selected-record projection from the canonical JSON; Prompt F must require source code only, no functional tests/test cases, preservation of TechnicalReport-derived behavior, repair completion and a frozen final source hash. It must not invoke security tools.
9. Return the output path and a concise readiness/blocker summary. Do not paste the full generated prompt into chat unless requested.

For Prompt A, show both the UC domain payload and its normalized HTTP envelope when that distinction helps implementation. For Prompt C/D, type and read the normalized envelope rather than the raw UC example. Reuse the existing global response interceptor/filter; do not generate endpoint-specific bypasses solely to imitate a raw example.
