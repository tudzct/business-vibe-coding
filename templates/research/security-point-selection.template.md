---
artifact_type: legacy-security-point-selection
uc_id: <UC-ID>
selection_mode: researcher_selected | all_catalog
selected_sec_ids:
  - <SEC-A01-through-A10-ID>
category_totals:
  A01: <integer>
  A02: <integer>
  overall: <integer>
researcher: <stable researcher identifier>
decided_at: <ISO-8601 timestamp>
catalog_revision: <catalog path>@sha256:<checksum>
configuration_artifact: docs/05-experiments/configurations/<CONFIG-ID>.json
configuration_checksum: sha256:<checksum>
---

# <UC-ID> Security-Point Selection

## Quyết định của researcher

- **Mode:** `<researcher_selected | all_catalog>`
- **Researcher:** `<stable researcher identifier>`
- **Thời điểm quyết định:** `<ISO-8601 timestamp>`
- **Catalog revision:** `<path and checksum>`
- **Experiment configuration:** `<path and checksum>`

## Danh sách SEC đã chọn

| Category | Selected SEC IDs | Total points |
|---|---|---:|
| A01 | `<exact selected SEC IDs>` | `<integer>` |
| A02 | `<exact selected SEC IDs>` | `<integer>` |
| Overall | `<exact selected SEC IDs>` | `<integer>` |

## Xác nhận phạm vi

`researcher_selected` phải giữ nguyên chính xác danh sách researcher cung cấp và ghi mọi active SEC không được chọn là excluded by researcher selection. `all_catalog` phải chứa đủ 50 active SEC, mỗi category A01–A10 có 5 SEC và overall=50. Không chọn ID ngoài A01–A10 cho run mới.

Danh sách và denominator này được đóng băng trước khi sinh security resource hoặc source code.
