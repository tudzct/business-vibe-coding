# Shared Full/RQ3 contract

RQ1/RQ2 use Full Prompts A-F. RQ3 uses A-D and omits E and F together. Both variants preserve the same functional Basic/Main, Alternative and Exception Flows, required technical controls, frozen BR/flow evaluation baseline, audit rubric, gate sequence and telemetry rules. Omitting explicit BR/OCL input is not permission to omit functional branches or weaken evaluation.

## Input boundaries

Both variants receive the same researcher-prepared database baseline through configuration `database_baseline`. DBML is shared technical input in A/D even when E/F are omitted. Read the configured DBML; use existing structure and authorized business DML only. Prompt/Source preflight verifies DBML bytes and runtime fingerprint before START. Neither variant permits migrations or DDL. See [database policy](../engineering/DATABASE-SCHEMA.md). Database data persists across cumulative UCs.

| Operation | Full | RQ3 |
|---|---|---|
| Evaluation preparation | Freeze all BRs and flows before generation | Same complete baseline, stored separately from generation input |
| Prompt generation | Functional/UML/UI/API sources, exact BR projection in E, context in F | Functional/UML/UI/API sources and required technical baseline; no E/F, BR resource links, OCL projection or BR-derived additions |
| First-pass source | Approved A-F and their permitted inputs | Approved A-D and their permitted inputs; inspect baseline identity through validators/metadata, not BR expressions |
| First-pass audit / automatic repair verification | Every frozen BR and flow, configured rubric | Identical criteria and evidence standard |
| Authorized repair | One evidenced defect per bounded sub-prompt | Same; repair evidence must remain distinguishable from first-pass ablation results |

For both variants, map every frozen flow and terminal clause to the relevant A-D sections before approval. This is a traceability check, not a new flow denominator. Required JWT/hash/ownership/validation and other technical controls remain where the permitted functional/API/technical sources require them.

For RQ3, use bounded reads or a functional projection to avoid passing BR/OCL sections and evaluation resources into generation. Baseline preparation may inspect those resources for evaluation, but do not silently paraphrase them into the generated prompt. A validator can check identity/headings/explicit references; the author must review provenance and semantic leakage. If excluded material has already entered the generation context, record that limitation and resolve the generation context before claiming a clean ablation; never claim that an instruction to ignore it erased it.

## Identity

Prompt metadata requires `prompt_variant: full` or `rq3`; configuration, canonical run and activation use the same value. Validate the exact heading structure, filename and approved prompt checksum.

`gen-coding-prompt/scripts/validate_prompt_contract.py` validates the configured UC/run, approved status (or `--allow-draft`), source UC, filename, ordered A-F/A-D headings, BR reference boundaries and optional activation checksum. It is read-only. It does not prove semantic flow coverage or absence of paraphrased BR information.

At `$measure-uc-workflow close-phase prompt_generation`, approve the Draft and pin canonical `coding_prompt: {path, sha256}` and configured variant. Keep a run-local approved snapshot if the common prompt path will be reused. Optional activation receipts remain immutable and are validated when present; no activation preparation or turn is mandatory.

## One command sequence

Both variants follow [FILE-DRIVEN-WORKFLOW.md](FILE-DRIVEN-WORKFLOW.md): prompt -> close prompt -> source -> close source -> audit -> requested repair if needed -> finalize (atomically close/skip Repair and finalize workflow) -> optional export. Each command supplies authorization without extra gate confirmations. Audit includes all frozen BRs/flows. Follow-ups save attributed results and wait for a repair command when defects remain; unknown accepted flow verdicts block new repair. All-passing unchanged-source audit records repair unnecessary and skips correction.

`record_command.py` preserves the internal `gates` history, with actual command turn/time and evidence hashes; it does not ask for confirmation. Audit evidence remains pinned and immutable. Repair records authorization within its work turn; final verification is automatic there. `finalize-workflow` closes or skips Repair, validates all aggregates and records Repair-close plus Final receipts before one canonical commit. Missing UI scores never block a command.

## Cumulative source provenance

Allow cumulative UCs within the configured pipeline and source order. Before each source generation, record in the run's `source-input.json`: UC/run, configuration reference/checksum, prompt variant, model tuple, replicate, run order, input source SHA-256 and predecessor run/final hash (null at pipeline start), with references to the preserved source/hash evidence. Compare the observed input to that predecessor or the documented clean baseline before mutation.

Do not restore between cumulative UCs. A new pipeline/model/replicate condition uses its documented starting baseline; it cannot silently inherit another condition's generated source. An unresolved source identity is a preflight blocker, not permission to bypass comparison checks or reset files automatically. Restore only within the researcher's authorized scope. Preserve existing source and recorded evidence while resolving provenance.

Prompt/source/repair remain telemetry buckets in two phases. Audit, runtime, approval and finalization do not add generation execution seconds. No tests or test cases are created or run by this contract.

Prompt telemetry close (Turn 2) automatically creates a missing `run-activation.json` from the pinned configuration and approved prompt, or validates an existing receipt without replacing it. The receipt records the actual prompt-close turn/time, before source generation. No standalone activation turn is required.
