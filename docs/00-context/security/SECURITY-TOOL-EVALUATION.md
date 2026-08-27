# Independent security-tool evaluation

## Purpose

Semgrep and OWASP ZAP are independent evaluators of the frozen final source and isolated runtime. They do not participate in use-case analysis, security-resource generation, coding-prompt generation, source generation, audit, or bug-fixing sub-prompts.

The evaluator answers only this bounded product-level question:

> What A01:2025 Broken Access Control or A02:2025 Security Misconfiguration findings are detectable in the current frozen `finalsource/` product snapshot and runtime under the frozen evaluation policy and recorded coverage?

The evaluator does not select, interpret or score an individual UC. UC identifiers may appear only as optional source-lineage provenance describing which completed UC range contributed to the current product snapshot.

`no_finding_detected` means no configured rule produced a finding within recorded coverage. It is not a claim that the system is free of A01/A02 vulnerabilities.

## Isolation boundary

The evaluator is **SR-blind**. It must not load, receive, infer or interpret SR identifiers, security resources, Prompt E/coding prompts, generation audit/repair records or experiment-run reports. Its orchestration context is restricted to the Approved evaluation input and policy, checksum-bound tool contracts/rules/version lock, the frozen `finalsource/` snapshot and evaluator-owned temporary/canonical output. `contributing_uc_range` is source-lineage provenance only.

The generation pipeline must not read, reference, validate, or depend on:

- Semgrep/ZAP rule IDs, policies, fixtures, validation evidence, raw reports, or findings;
- security-tool versions or evaluator approval;
- any tool-derived score or result.

Security Requirements remain Prompt E generation controls. They are defined from OWASP/ASVS and the UC, not from evaluator capabilities. No tool-support gate may block security-resource, coding-prompt, source, audit, or repair completion.

Any comparison between finalized SR/generation evidence and finalized evaluator findings is performed only by the researcher as a separate post-hoc analysis after both artifact sets are frozen. It is outside evaluator execution, does not change canonical generation or evaluator evidence, and cannot reopen the completed generation run.

After audit/repair reaches a terminal state, freeze the `finalsource/` hash. Only then may the independent evaluator run. It is read-only and must preserve the hash. A finding must never create a repair sub-prompt or mutate source/configuration/prompt/report in the same run. A later remediation study requires a separate researcher-authorized run and artifact lineage.

## Frozen evaluation policy

Use one canonical SR-blind criteria catalog created from `templates/security-evaluation/third-party-security-criteria.template.json` and stored under `security-tools/criteria/`. Each criterion records a stable evaluator-only ID, tool/rule identity, detector type, vendor/custom origin, maturity, A01/A02 classification, CWE/WASC identifiers when verified, detection intent, applicability, evidence fields, explicit limitations and versioned official source records. Custom Semgrep detectors remain `candidate` until separate calibration evidence is approved; vendor ZAP maturity is retained as published.

Use one product-level policy created from `templates/security-evaluation/security-tool-evaluation-policy.template.json` and stored under:

```text
security-tools/evaluation-policies/<POLICY-ID>.json
```

The policy contains only A01/A02 evaluator scope, research-product identity, checksum references to the criteria catalog/tool lock/rule bundles, explicit enabled criterion IDs, target/coverage declarations, and researcher approval. Freeze it before evaluating a final-source snapshot, but do not expose or link it to generation inputs.

The same policy revision must be applied to every compared final-source snapshot. Changing a rule, tool version, target, authentication context, or classification mapping creates a new policy revision.

Product-level policies use schema version 4. `refs` checksum-bind the canonical criteria catalog, tool lock and rule bundles; `enabled_criteria` must exactly resolve to the rule IDs present in the Semgrep/ZAP bundles. `coverage_contract` declares context IDs, target-set IDs, authorization probe IDs, applicability and limitations without storing credentials. Authentication secrets are supplied only through named runtime environment variables and are never persisted.

Before execution, instantiate and approve `templates/security-evaluation/final-source-security-evaluation-input.template.json`. It binds one immutable evaluation ID, the current `finalsource/` hash, the product-level policy, both enabled tools and the canonical output path. Semgrep and ZAP adapter contracts are defined by their respective input/output templates in the same directory. Native/raw tool output and normalized per-tool adapter output are ephemeral; `evaluation-summary.json` is the only persisted evaluator result.

The per-evaluation `evaluation-summary.json` references the criteria catalog, policy and lock by path, checksum and ID instead of copying criterion/rule declarations or declared coverage. Configured findings retain the evaluator-only criterion ID. The summary stores only product-level execution facts and observed coverage.

Evaluator policy, input and summary validators reject SR identifiers and direct references to security-resource, coding-prompt, generation-audit/repair or experiment-run artifacts. This enforces the SR-blind artifact boundary independently of operator convention.

## Result semantics

Raw findings are preserved and normalized without modifying final source. Each normalized observation has one of:

- `potential_finding`: a configured rule raised an alert and researcher triage is pending;
- `confirmed_finding`: the researcher confirmed the finding;
- `rejected_finding`: the researcher rejected it as a false positive or out of target;
- `no_finding_detected`: the scan completed with no configured finding for a declared coverage unit;
- `not_evaluable`: the tool, target, authentication context, or rule coverage cannot evaluate the unit;
- `scan_failed`: execution did not complete reliably.

Automated normalization initially emits `potential_finding`, never `confirmed_finding`. Absence of findings never becomes SR `met`, and a pending finding never becomes SR `unmet` automatically.

Report counts by tool and A01/A02 category, plus scanned targets, enabled rules, authentication/role coverage, excluded surfaces, limitations, source hash, policy checksum and tool status. Findings outside the frozen A01/A02 policy may be retained as `unscored_observation`; they do not change the experiment result.

Exact enabled rules and classifications are resolved from the checksum-bound catalog and policy. Results record catalog/policy references, criterion IDs, rule execution status/counts and observed coverage rather than duplicating static criterion definitions.

## Tool scoping

- Semgrep runs an allowlisted local policy containing only the approved A01/A02 evaluator rules.
- ZAP active scanning uses a default-off scan policy and explicitly enables approved rule IDs.
- ZAP passive scanning disables all scanners and explicitly enables approved passive rule IDs when strict execution scoping is required.
- If the packaged API scan cannot prove strict passive-rule execution scoping, record that limitation. Filtering reports is not equivalent to preventing rule execution.

The canonical runner rejects `strict_execution: true` until the selected ZAP executor can prove a default-off active/passive policy. Supplying tokens without an authenticated executor does not count as authenticated coverage. Cross-owner coverage requires two independent contexts plus a disposable object fixture; otherwise its probe is `not_evaluable`.

Automated scanners cannot establish complete absence of broken access control or other business-logic vulnerabilities. Missing multi-user, multi-role, tenant, authenticated-state, or endpoint coverage must be explicit as `not_evaluable` or a coverage limitation.

## Canonical artifacts and batch use

- Criteria catalog: `security-tools/criteria/third-party-security-criteria.json`, created from `templates/security-evaluation/third-party-security-criteria.template.json`.
- Input policy: `security-tools/evaluation-policies/<POLICY-ID>.json`, created from `templates/security-evaluation/security-tool-evaluation-policy.template.json`.
- Approved run input: `docs/03-audit/security-tools/finalsource/inputs/<evaluation-id>.json`, instantiated from `templates/security-evaluation/final-source-security-evaluation-input.template.json`.
- Output: only `docs/03-audit/security-tools/finalsource/<evaluation-id>/evaluation-summary.json`, shaped by `templates/security-evaluation/security-tool-evaluation-summary.schema.json`.
- On-demand view: `$render-security-evaluation <evaluation-summary.json>` creates `evaluation-report.md` beside the canonical JSON without rerunning tools or changing evidence.
- Raw Semgrep/ZAP reports, tokens, cookies and complete execution logs are temporary and deleted after normalization.
- A new evaluation may run after generation terminates and the exact current `finalsource/` hash is approved. A hash alone cannot reconstruct an overwritten historical snapshot.
- Re-evaluating a recoverable frozen final-source snapshot under a new policy creates a new immutable evaluation ID and preserves every earlier result.
