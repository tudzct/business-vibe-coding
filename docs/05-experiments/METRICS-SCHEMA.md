# Experiment metrics schema

Capture generation/repair telemetry and one source-based security assessment for every frozen Prompt E SR. There are no security-evaluation protocol versions: every generation run uses this schema and scoring model.

Do not create or report `business.*` metrics. TechnicalReport supplies the functional baseline for source generation. Prompt E SR results are determined only from inspectable source, configuration, build, and runtime evidence.

| Vietnamese criterion | Canonical field | Calculation/source |
|---|---|---|
| Id | `run_id`, `uc_id` | assigned identifiers |
| Cấu hình thí nghiệm | `experiment_configuration.*` | Confirmed comparison-group manifest path, ID and checksum |
| Tên use case | `uc_name` | approved use case |
| Nhãn model thực nghiệm | `generation_model.requested_label` | researcher-selected label, e.g. `Sol Light`, `Luna`, `Terra` |
| Model ID yêu cầu | `generation_model.requested_model_id` | exact configured ID; `Sol Light` = `gpt-5.6-sol` + effort `low` |
| Model ID thực tế/snapshot | `generation_model.effective_model_id`, `effective_snapshot` | runtime/telemetry; do not infer |
| Reasoning effort/mode | `generation_model.requested_reasoning_effort`, `requested_reasoning_mode` | planned experimental configuration |
| Model audit | `audit_model.*` | record separately because auditor model may affect judgments |
| Giao thức audit | `audit_protocol` | `fixed`, `matched` or `cross`; never mix protocols in one comparison group |
| Chế độ chọn điểm bảo mật | `security.selection_mode` | `researcher_selected` or `all_catalog`; never mix modes silently |
| Artifact chọn điểm | `security.selection_artifact` | persisted researcher decision and exact frozen SEC IDs |
| Lần lặp và thứ tự chạy | `replicate_index`, `run_order` | distinguish repeated runs and detect order effects |
| Phương pháp đo thời gian | `timing_method` | fixed value `system_timestamp_delta` |
| Mốc thời gian sinh code đầu | `timing_wall_clock.initial_*` | automatic timezone-qualified ISO-8601 and Unix epoch milliseconds |
| Thời gian sinh code đầu | `timing_seconds.initial` | `(initial_ended_epoch_ms - initial_started_epoch_ms) / 1000` |
| Tổng số bug-fixing sub-prompt | `all_sub_prompt_count` | all appended repair iterations |
| Số sub-prompt sửa bảo mật | `security_repair_sub_prompt_count` | repairs categorized `security` |
| Thời gian mọi sub-prompt | `timing_seconds.all_repairs` | sum of independently derived repair timestamp deltas |
| Thời gian sub-prompt bảo mật | `timing_seconds.security_repairs` | security repair duration sum |
| Manual estimate chuyên gia 1-3 | `manual_estimates_minutes[]` | independent expert input |
| Token lần sinh đầu | `tokens.initial_total` | model/tool telemetry |
| Token các sub-prompt | `tokens.all_repairs_total` | all repair telemetry sum |
| Token toàn UC | `tokens.whole_uc_total` | initial plus all repairs |
| Độ chính xác giao diện | `ui_accuracy_percent` | weighted UI rubric |
| Độ chính xác flow | `flow_accuracy_percent` | satisfied/evaluable checkpoints |
| Độ phức tạp UC | `complexity.score`, `level` | seven-component rubric |
| Frozen final source | `security.source_revision` | hash recorded when generation audit/repair becomes terminal |
| Tổng điểm bảo mật | `security.categories.*.total`, `security.total` | frozen selected SR count; one SR = one point |
| YC bảo mật đã đảm bảo | `security.categories.*.met`, `security.met` | complete, mutually consistent source/configuration/build/runtime evidence |
| YC bảo mật chưa đảm bảo | `security.categories.*.unmet`, `security.unmet` | missing, partial, or contradictory implementation for an applicable SR |
| YC bảo mật chưa thể đánh giá | `security.categories.*.not_evaluable`, `security.not_evaluable` | not applicable or insufficient permitted generation evidence, with a specific rationale |

Freeze selected Prompt E SR IDs before generation. A complete run contains exactly one assessment row per frozen SR with `sr_id`, `sec_id`, category, status, inspectable evidence, and rationale. Category and overall counts must match those rows. Token/time values must not be guessed.

Each `$bug-fixing-sub-prompt` invocation appends exactly one `repairs[]` record using `.codex/skills/bug-fixing-sub-prompt/references/repair-contract.md`.

## On-demand Markdown report

Every run persists one canonical JSON record. Render Markdown deterministically with `$render-experiment-report` only when requested by a researcher/reviewer. The report is a disposable view, never a finalization requirement or second source of truth. Finalization depends on JSON validation only.

## Model configuration protocol

Treat the model configuration as an experimental independent variable. Record the requested configuration before generation and the effective configuration from runtime telemetry after generation.

Enforce the experiment/model gates before every initial source mutation. Requested model fields come from a Confirmed configuration referenced by matching `runs/<RUN-ID>/run-activation.json`; they must never be incomplete or inferred. Only unavailable effective telemetry may be `null` with a reason.

| Research label | Requested model ID | Reasoning effort |
|---|---|---|
| Sol Light | `gpt-5.6-sol` | `low` |
| Luna Medium | `gpt-5.6-luna` | `medium` |
| Terra Medium | `gpt-5.6-terra` | `medium` |

Do not store only a friendly label. A model run identity consists of at least model ID + reasoning effort + reasoning mode + snapshot when exposed. Keep generation and audit model configurations separate. Every repair entry must also record the model configuration that executed it.

Audit protocols:

- `fixed` (recommended for the primary comparison): all generated outputs are evaluated by the same auditor model/configuration and the same human rubric, isolating the generation-model effect.
- `matched`: each output is audited by the same model/configuration that generated it; this measures the full model-specific workflow but confounds generator and auditor effects.
- `cross`: one generation is audited by multiple model configurations; create a separate audit record for every generator × auditor pair.

For a fair comparison, reuse the same approved UC, frozen AC/BR/SR lists, Prompt A-F revision, Figma/Sheet snapshot and clean source baseline. Start each model variant from the same baseline rather than from code generated by a previous variant. Assign a new `run_id` for every model × UC × replicate combination; never overwrite another model's report. `run_order` values are unique across the comparison group and represent execution order, not presentation sorting.
