# Defects Handoff contract

`defects-handoff.json` is the self-contained defect-information input for `gen-bug-fixing-prompt`. Canonical Run JSON remains authoritative for Audit history and metrics. The Handoff contains the accepted repair facts required to author a sub-prompt without reopening the frozen UC, Business Rule specification, API contracts, Audit evidence files or application source.

Use [defects-handoff.template.json](../assets/defects-handoff.template.json) as the exact schema and `scripts/build_defects_handoff.py` as the only writer. Write only to:

```text
docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/defects-handoff.json
```

## Selection

- Include one record per open root-cause defect that affects an accepted `incorrect` BR or Flow.
- Also include open `technical` and functional `ui` defects.
- One root cause remains one defect even when it affects multiple targets or files.
- Exclude resolved defects and `correct` results.
- `not_evaluable` is not a defect. Do not create or replace the Handoff while any accepted BR or Flow remains `not_evaluable`.
- If no repairable defect remains, write `status: no_repair_required` and an empty `defects` array.

## Audit enrichment

Audit supplies one complete English enrichment entry for every selected defect through stdin. Use this exact shape:

```json
{
  "defects": [
    {
      "defect_id": "<DEFECT-ID>",
      "title": "<bounded defect title>",
      "description": "<what is wrong and its observed impact>",
      "reproduction_steps": ["<ordered action>"],
      "affected_flow_step_ids": ["<FLOW-STEP-ID>"],
      "affected_api_ids": ["<API-ID>"],
      "affected_ui_targets": ["<functional UI target>"],
      "affected_files": ["<repository-relative affected file>"],
      "evidence_annotations": {
        "<canonical evidence path>": {
          "source_file": "<repository-relative source or evidence path>",
          "line_start": null,
          "line_end": null,
          "locator": "<precise source or runtime locator>",
          "defect_finding": "<evidence-backed defect and cause>",
          "content": null
        }
      },
      "required_correction": "<observable behavior required after repair>"
    }
  ]
}
```

Use empty arrays when a target type does not apply. Annotate every immutable evidence item exactly once. `content` may be `null` for readable text or JSON evidence because the builder copies the validated evidence content. Binary or image evidence requires a complete textual `content` annotation.

## Required correction

The builder combines the Audit-supplied post-repair behavior with applicable checksum-pinned authoritative material:

- **Business Rule:** affected BR IDs, exact BR/OCL text and every referenced OCL Utility Definition.
- **Flow:** affected parent Flow IDs, exact step IDs, exact step text and the complete affected Flow definitions that preserve branch and outcome semantics.
- **API:** affected API IDs and their checksum-pinned contract content.
- **UI:** functional UI target identifiers and the observable correct interaction/state supplied by Audit. Cosmetic scoring is excluded.
- **Technical:** the observable correct result supplied by Audit, without prescribing an implementation strategy.

When one root cause affects several target types, combine all applicable material in the same `required_correction`. Do not split it into category-specific defects.

## Evidence

Each evidence record contains only the information required by the fixed sub-prompt template:

- `source_file`
- `line_start` and `line_end`, or both `null`
- `locator`
- `defect_finding`
- self-contained `content`

Do not add model metadata, token/time data, gates, repair strategy, permitted-verification lists, prompt paths or researcher-message history.

Run dry-run first with identical stdin, then persist:

```text
python -B .codex/skills/audit-generation-metrics/scripts/build_defects_handoff.py --run-json <canonical.json> --input - --dry-run
python -B .codex/skills/audit-generation-metrics/scripts/build_defects_handoff.py --run-json <canonical.json> --input -
```
