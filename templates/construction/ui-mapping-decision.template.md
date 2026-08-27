---
artifact_type: ui-reconstruction-record
status: Recorded
uc_id: <UC-ID>
source_use_case: docs/01-inception/use-cases/<uc-file>.md
figma_dataset_id: <dataset-version>
figma_node_id: <node-id>
figma_snapshot_dir: resource/figma-design-dataset/<version>/nodes/<node-id>
figma_manifest_checksum: sha256:<checksum>
generated_by: <model/run-id>
generated_at: <ISO-8601>
---

# <UC-ID> Autonomous UI Reconstruction Record

## Immutable source boundaries

- UC behavior source:
- Frozen Figma visual source:
- Confirm that neither source was edited:

## Functional-flow checkpoints

| UC checkpoint | Required behavior | Mapped Figma node/frame | Coverage | Autonomous visual inference |
|---|---|---|---|---|
| | | | covered / missing / conflict | |

## Figma node disposition

Every visible/interactive design node or component group must be accounted for. No silent omission is allowed. This inventory records AI reconstruction choices and requires no researcher approval.

| Node ID | Component/text | Dataset asset(s) | Rendering mode | Behavior | Rationale |
|---|---|---|---|---|---|
| | | | `render-functional` / `render-visual-only` | | |

## Visual fidelity contract

- Natural reference viewport:
- Required fonts and availability decision:
- Structural coverage target: `100%` of non-omitted nodes/groups.
- Perceptual screenshot-similarity target: `>= 0.90` when the comparison environment is deterministic.
- Recorded rendering tolerances/limitations:
- Required runtime screenshots/states:

## Non-gating status

This record is optional traceability, not a researcher approval artifact or a source-generation gate. The checksum-valid Figma dataset is the visual contract; the immutable UC is the behavioral contract. Stop only for an invalid/incomplete dataset or a material behavioral, authorization, API or schema conflict.
