---
name: resolve-figma-design-dataset
description: Create, refresh, validate, or resolve the repository's frozen, checksum-verifiable Figma design dataset for immutable UCs. Use when asked to build a full offline Figma dataset, when no dataset exists, and before prompt generation, source generation, frontend implementation, review, or audit whenever a UC may depend on Figma. Always source capture mappings from FIGMA-LINK-REVIEW.md; never call Figma with URLs or file keys taken from immutable UC files.
---

# Resolve Figma Design Dataset

Use only the dataset version explicitly referenced by the active configuration/prompt under `resource/figma-design-dataset/<version>/manifest.json`. If none is referenced, stop for dataset activation; never auto-select the latest directory. Unreferenced versions are cold evidence. The immutable UC is only research input.

## Create or refresh

1. Read `docs/00-context/FIGMA-LINK-REVIEW.md` before any Figma call. Treat its `Replacement URL` column as the sole capture authority.
2. Ignore all Figma URLs and file keys inside `docs/01-inception/use-cases/uc-*.md`; they are provenance-only and may point to inaccessible files.
3. Validate that the review contains one approved replacement or `NOT_APPLICABLE` for all 16 UCs. Stop if any placeholder, conflict or missing mapping remains.
4. Deduplicate by exact file key plus node ID, then capture each unique node once through the installed Figma plugin.
5. Require every artifact in `resource/figma-design-dataset/CAPTURE-SPEC.md`. Within a new unfrozen dataset, deduplicate identical assets to one checksum-addressed canonical file referenced from asset maps. Never mutate an already frozen version.
6. Create a new immutable dataset version. Never revive or infer a deleted version and never overwrite a version used by an experiment.

## Resolve

1. Run `python3 .codex/skills/resolve-figma-design-dataset/scripts/resolve.py <UC-ID-or-path>` from the repository root. Pass `--dataset-version <version>` when an experiment has frozen a specific version.
2. If status is `complete`, use only the returned local snapshot directory, require valid checksums, and verify `resource/figma-design-dataset/CAPTURE-SPEC.md` before implementation or audit.
3. If status is `no-design`, record that no design is applicable; do not invent a mapping.
4. If status is `partial-content` or `pending-rate-limit`, stop design-dependent generation and report the exact missing capture state. Refresh through the installed Figma plugin using the approved review mapping; do not fall back to a UC link.
5. Treat two UCs mapped to one node as deliberate shared evidence. Never duplicate or mutate a snapshot per UC.

## Integrity and refresh

Run `python3 .codex/skills/resolve-figma-design-dataset/scripts/resolve.py --validate-all` after capture or before a research run. A refresh creates a new dataset version; do not overwrite evidence already used by an experiment. Never commit short-lived Figma asset URLs, credentials, or guessed metadata.
