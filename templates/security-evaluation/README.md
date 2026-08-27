# Security evaluation templates

These templates define one product-level, read-only evaluation of the current frozen `finalsource/` snapshot.

The evaluator is SR-blind. Evaluator artifacts must not contain SR IDs or direct references to security resources, Prompt E/coding prompts, generation audit/repair records or experiment-run reports. `contributing_uc_range` is source-lineage provenance only. Any comparison with finalized SR/generation evidence is a separate researcher-owned post-hoc analysis after both sides are frozen.

## Canonical lifecycle

1. Create the SR-blind criteria catalog from `third-party-security-criteria.template.json`; validate it with `third-party-security-criteria.schema.json` and `validate_security_criteria.py`, then obtain researcher approval.
2. Create and approve `security-tool-evaluation-policy.template.json`. The policy checksum-binds the catalog, tool lock and Semgrep/ZAP rule bundles and explicitly selects criterion IDs.
3. Instantiate `final-source-security-evaluation-input.template.json`; bind the exact current source hash, policy checksum, both tools and immutable evaluation ID.
4. The runner resolves rule IDs and classifications only through the approved catalog/policy. The adapter contracts are documented by the corresponding `*-evaluation-input.template.json` files.
5. Native raw reports are normalized against the corresponding `*-evaluation-output.template.json` contracts and remain ephemeral.
6. Persist only `security-tool-evaluation-summary.template.json`, validated by `security-tool-evaluation-summary.schema.json`, under `docs/03-audit/security-tools/finalsource/<EVALUATION-ID>/evaluation-summary.json`.

The evaluator does not require or assign a UC ID. `contributing_uc_range` is source-lineage provenance only.
