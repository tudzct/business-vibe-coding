---
name: gen-business-rule-resource
description: Generate and freeze a use-case-specific Business Rule resource from the canonical Sheet-derived UC with exact source provenance.
---

# Generate Business Rule Resource

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

This is an optional preparation tool, used only when the researcher explicitly requests resource/baseline creation outside prompt/source generation. Valid externally prepared artifacts are equally acceptable; no validator may require this skill's invocation or creator identity. `gen-coding-prompt` only reads existing resources/baselines and must never invoke this creation workflow to fill missing inputs. Preserve existing matching frozen artifacts and report conflicts without overwriting them.

Read `PROJECT_CONTEXT.md`, the selected frozen UC, `docs/00-context/business-rules/OCL-UTILITY-DEFINITIONS.md`, `references/business-rule-contract.md`, the baseline gate and the Business Rule resource templates.

1. Verify UC provenance and checksum. Its Sheet range must be explicit. When a retained checksum differs from raw checkout bytes, run `scripts/verify_uc_checksum.py`; accept only an exact raw, canonical-LF or canonical-CRLF match and retain a separate normalization receipt. Never rewrite the frozen UC merely to change line endings.
2. Extract every BR in source order. Preserve its ID, OCL expression or authoritative natural-language text verbatim; do not select, paraphrase, merge or invent rules.
3. Classify only the observable representation (`ocl_invariant`, `ocl_precondition`, `ocl_postcondition`, `natural_language`). Record context, enforcement layer, failure behavior and traceability only when sources support them.
4. Put missing information in `unresolved_items`. Stop for the researcher when it changes semantics, public API, ownership, schema or destructive behavior.
5. Write `docs/02-construction/business-rules/<UC-ID>-business-rules.{json,md}` and freeze `docs/02-construction/implementation/<UC-ID>/business-rule-baseline.json` with ordered BR IDs and checksums.
6. Run `scripts/render_prompt_e.py <resource.json>` to produce the deterministic Prompt E projection.
