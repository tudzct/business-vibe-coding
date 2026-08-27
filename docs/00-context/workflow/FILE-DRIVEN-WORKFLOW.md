# Quy trình vận hành dành cho nhà nghiên cứu

## Bước 1 - Chuẩn bị use case

Các UC baseline trong `docs/01-inception/use-cases/` phải giữ nguyên nội dung tương ứng từ `resource/TechnicalReport.pdf`, bao gồm Functional Use-Case Specification và Project-Specific Implementation Context (Prompt A-D). Không thêm Security Requirements, trạng thái phê duyệt hoặc diễn giải mới vào các file UC này.

16 file UC chính `uc-*.md` là **read-only/immutable research context**. Mọi skill chỉ được đọc. Không sửa, format, rename, move hoặc delete; nếu phát hiện sai khác thì báo cho người nghiên cứu. Ambiguity, nội dung chuẩn hóa và security intervention chỉ được ghi vào artifact downstream.

## Bước 2 - Sinh security coding prompt

```text
$gen-coding-prompt docs/01-inception/use-cases/uc-1-login.md
```

Với run mới, researcher có thể khai báo toàn bộ security scope, model, replicate, run order và audit protocol một lần trong unified experiment configuration theo `gates/EXPERIMENT-CONFIGURATION-GATE.md`. Trước khi sinh artifact, Codex kích hoạt security scope của UC và yêu cầu đúng một mode:

- `researcher_selected`: researcher cung cấp danh sách SEC ID chính xác.
- `all_catalog`: lấy đủ 50 SEC đang hoạt động, với 5 SEC cho mỗi category A01–A10.

Lưu receipt tại `docs/02-construction/implementation/<UC-ID>/security-scope-activation.json`; receipt tham chiếu checksum configuration và scope được resolve trực tiếp từ configuration.

Kết quả ban đầu:

```text
docs/02-construction/implementation/UC-001/security-scope-activation.json
docs/02-construction/security-resources/UC-001-security.json
```

Receipt phải được sinh từ `templates/research/security-scope-activation.template.json`. Security resource và Prompt E chỉ dùng UC, security scope đã chọn và nguồn OWASP/ASVS.

### Quy tắc chuẩn hóa response đã phê duyệt

Áp dụng tự động cho mọi UC mà không hỏi lại:

- Giữ nguyên HTTP status, các field dữ liệu nghiệp vụ và safe message trong UC.
- Xem raw success response trong UC là domain payload; đặt payload đó vào `data` của `{ success: true, message, data }`.
- Chuẩn hóa lỗi qua `{ success: false, statusCode, message, timestamp, path }`; giữ nguyên status và safe message của UC, không giữ các chi tiết nội bộ không an toàn.
- Chỉ ghi phép chuẩn hóa vào artifact downstream; không sửa file UC.
- Không coi khác biệt hình dạng raw response/envelope là ambiguity. Chỉ dừng hỏi khi status, field nghiệp vụ hoặc ý nghĩa message xung đột thực sự.

## Bước 3 - Sinh source code

Trước khi sinh source, Codex kích hoạt đúng một run bằng `runs/<RUN-ID>/run-activation.json`. Receipt chỉ giữ configuration checksum; assignment được resolve từ Confirmed configuration. Thiếu hoặc sai receipt thì dừng.

```text
$gen-source-code docs/02-construction/coding-prompts/UC-001-security-coding-prompt.md
```

Code được lưu trong `finalsource/fe` và `finalsource/be`. Skill tự chọn coding convention phù hợp; không cần paste prompt vào chat.

## Bước 4 - Xem audit

Audit được tạo tự động trong `docs/05-experiments/UC-001/`. Nếu phát hiện lỗi, hệ thống tạo sub-prompt trong `docs/02-construction/implementation/UC-001/sub-prompts/`, sửa tối thiểu và audit lại.

Sau khi có initial metrics và ghi nhận mọi repair, audit phải gán đúng một kết quả source-based `met`, `unmet` hoặc `not_evaluable` cho từng SR đã đóng băng, kèm bằng chứng source/configuration/build/runtime và rationale. Mọi UC sinh FE/BE phải qua cổng runtime Docker: rebuild image từ source hiện tại, start stack, xác minh riêng container/healthcheck/reachability, rồi smoke-check trigger, main flow, success và exception theo UC mà không tạo test case. Assessment thiếu, image cũ, migration chưa áp dụng, runtime prerequisite còn thiếu hoặc flow chưa có bằng chứng làm run ở trạng thái non-terminal; lỗi có bằng chứng quay lại repair bằng sub-prompt mới. Chỉ sau khi assessment đầy đủ và runtime gate đạt mới đóng băng hash `finalsource/` và finalize canonical audit JSON. Markdown được tạo bằng `$render-experiment-report` khi researcher/reviewer yêu cầu, không phải completion evidence.

UC bất biến quyết định hành vi; checksum-valid frozen Figma dataset quyết định toàn bộ hình thức UI. Không có researcher UI-mapping gate. Codex tự reconstruct toàn bộ component tree/assets/hierarchy; node có hành vi trong UC là functional, node chỉ có trong Figma vẫn phải render nhưng không được tự phát minh navigation/API. Nếu UC yêu cầu control/state không có trong frame, Codex được tự đặt control tối thiểu bằng hierarchy/design tokens gần nhất và ghi rõ visual inference downstream; chỉ dừng khi dataset thiếu/hỏng hoặc có xung đột nghiệp vụ, authorization, API hay schema.

`docs/02-construction/implementation/<UC-ID>/ui-mapping-decision.md`, nếu được tạo, chỉ là AI reconstruction record để traceability, không cần researcher duyệt và không chặn prompt/source generation. FE skill phải đạt 100% visible-node structural coverage, rebuild Docker và thực hiện screenshot comparison ở viewport chuẩn với perceptual similarity target `>= 0.90` khi môi trường deterministic. Thiếu threshold là UI defect và tạo một repair sub-prompt mới được tính metrics.

Nhà nghiên cứu vận hành quy trình bằng hai lệnh ở Bước 2 và Bước 3.
