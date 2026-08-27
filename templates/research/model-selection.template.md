---
artifact_type: legacy-model-selection
status: Confirmed
gate_version: 2
uc_id: <UC-ID>
run_id: <RUN-ID>
selected_at: <ISO-8601 timestamp>
selection_source: docs/05-experiments/configurations/<CONFIG-ID>.json
configuration_artifact: docs/05-experiments/configurations/<CONFIG-ID>.json
configuration_checksum: sha256:<checksum>
comparison_group_id: <COMPARISON-GROUP-ID>
researcher_id: <stable researcher identifier>
requested_label: <exact label>
requested_model_id: <exact model ID>
requested_reasoning_effort: <none|low|medium|high|xhigh|max>
requested_reasoning_mode: <standard|pro>
replicate_index: <positive integer>
run_order: <unique positive integer within the comparison group>
audit_protocol: <fixed|matched|cross>
auditor_assignment: <fixed-auditor|same-as-generation|explicit cross auditor ID>
---

# <RUN-ID> Run/Model Activation

Projection này kích hoạt đúng một run đã được researcher xác nhận trong unified experiment configuration. Mọi field phải khớp configuration và checksum; file này không được dùng chung hoặc ghi đè cho run khác.

Business Rule baseline đã được đóng băng trước đó để sinh Prompt E. Source mutation chỉ được phép sau khi activation này hợp lệ và prompt/schema cần thiết đã được phê duyệt.
