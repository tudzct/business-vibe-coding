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

This projection activates exactly one run confirmed by the researcher in the unified experiment configuration. Every field must match the configuration and checksum; this file must not be shared or overwritten for another run.

The Business Rule baseline was previously frozen to generate Prompt E. Model assignment comes from the pinned Confirmed configuration; this optional historical activation adds no workflow gate. Source mutation requires prompt-close approval and closed prompt telemetry. The researcher-provided database schema is fixed; verify its configured pins without proposing or approving schema changes.
