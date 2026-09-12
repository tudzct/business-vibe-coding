# Shared Full/RQ3 contract

RQ1/RQ2 use Full Prompts A-F. RQ3 uses A-D and omits E and F together. Both variants preserve the same functional Basic/Main, Alternative and Exception Flows, required technical controls, frozen BR/flow evaluation baseline, audit rubric, gate sequence and telemetry rules. Omitting explicit BR/OCL input is not permission to omit functional branches or weaken evaluation.

## Input boundaries

| Operation | Full | RQ3 |
|---|---|---|
| Evaluation preparation | Freeze all BRs and flows before generation | Same complete baseline, stored separately from generation input |
| Prompt generation | Functional/UML/UI/API sources, exact BR projection in E, context in F | Functional/UML/UI/API sources and required technical baseline; no E/F, BR resource links, OCL projection or BR-derived additions |
| First-pass source | Approved A-F and their permitted inputs | Approved A-D and their permitted inputs; inspect baseline identity through validators/metadata, not BR expressions |
| First-pass/final audit | Every frozen BR and flow, configured rubric | Identical criteria and evidence standard |
| Authorized repair | One evidenced defect per bounded sub-prompt | Same; repair evidence must remain distinguishable from first-pass ablation results |

For both variants, map every frozen flow and terminal clause to the relevant A-D sections before approval. This is a traceability check, not a new flow denominator. Required JWT/hash/ownership/validation and other technical controls remain where the permitted functional/API/technical sources require them.

For RQ3, use bounded reads or a functional projection to avoid passing BR/OCL sections and evaluation resources into generation. Baseline preparation may inspect those resources for evaluation, but do not silently paraphrase them into the generated prompt. A validator can check identity/headings/explicit references; the author must review provenance and semantic leakage. If excluded material has already entered the generation context, record that limitation and resolve the generation context before claiming a clean ablation; never claim that an instruction to ignore it erased it.

## Identity and compatibility

New prompt metadata uses `prompt_variant: full` or `rq3`; configuration, canonical run and activation use those same values. The reader accepts historical `rq3-ad` as an alias for `rq3` and absent Full metadata as legacy Full only when the actual heading structure and filename agree. Do not rewrite approved historical prompts/configurations/activations to normalize their metadata.

`gen-coding-prompt/scripts/validate_prompt_contract.py` validates the configured UC/run, approved status (or `--allow-draft`), source UC, filename, ordered A-F/A-D headings, BR reference boundaries and optional activation checksum. It is read-only. It does not prove semantic flow coverage or absence of paraphrased BR information.

At confirmed Prompt Gate, preserve the approved artifact and set canonical `coding_prompt: {path, sha256}` using its approved bytes; set `prompt_variant` from configuration. Preserve that version in a run-local snapshot if its usual prompt path may later be reused. New activation receipts use gate version 5 and add `approved_prompt: {path, sha256}`. Creation resolves the canonical UC/variant prompt by default or accepts `--prompt`; `--dry-run` validates without writing. Before source mutation, revalidate against `--activation`. Older receipts retain their original versions and fields; never backfill approval or hashes.

## One gate sequence

Configuration -> Prompt -> activation/source -> Source Gate -> First-pass Audit -> Repair Decision -> Repair/Repair Gate when authorized -> Final Audit -> Final Metrics.

For both Full and RQ3, skipping repair goes directly from Repair Decision to Final Audit, not completion. Record the actual researcher decision/turn and skip reason; when the researcher supplies no further explanation, the reason can state that they explicitly chose to skip. Do not ask for a second authorization. Runtime-v2 final audit observes every flow again on final source, even after skip. Keep initial evidence unchanged and label comparisons by rubric and stage.

`advance-experiment-gate/scripts/record_gate.py` uses this same sequence for both variants. It validates contiguous history, one gate per turn, closed telemetry, prompt identity at Prompt/Source Gates and required BR/flow evidence at Audit Gates. First-pass gate receipts freeze BR/flow result hashes; later gates check them without rewriting historical receipts lacking those fields. Repair authorization or skip is persisted with the decision, and Final Metrics requires persisted finalized telemetry. `--dry-run` validates without changing gates. None of these checks substitutes for actual researcher confirmation or authorizes audit/repair by itself. Missing/null UI scores never block this sequence.

## Cumulative source provenance

Allow cumulative UCs within the configured pipeline and source order. Before each source generation, record in the run's `source-input.json`: UC/run, configuration reference/checksum, prompt variant, model tuple, replicate, run order, input source SHA-256 and predecessor run/final hash (null at pipeline start), with references to the preserved source/hash evidence. Compare the observed input to that predecessor or the documented clean baseline before mutation.

Do not restore between cumulative UCs. A new pipeline/model/replicate condition uses its documented starting baseline; it cannot silently inherit another condition's generated source. An unresolved source identity is a preflight blocker, not permission to bypass comparison checks or reset files automatically. Restore only within the researcher's authorized scope. Preserve existing source and historical evidence while resolving provenance.

Prompt/source/repair remain telemetry buckets in two phases. Audit, runtime, approval and finalization do not add generation execution seconds. No tests or test cases are created or run by this contract.
