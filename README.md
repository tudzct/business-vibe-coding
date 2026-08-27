# Security vibe coding — Hướng dẫn sử dụng

Security vibe coding là công cụ nghiên cứu quy trình sinh mã nguồn từ use case có tích hợp yêu cầu bảo mật. Người sử dụng làm việc bằng file; không cần điền `BUSINESS_PROMPT_TEMPLATE` tham khảo thủ công và không cần dán prompt vào cuộc trò chuyện.

## Bắt đầu ở đây nếu bạn vừa clone repository

Đọc theo thứ tự sau; không cần đọc toàn bộ `.codex/skills/`:

| Mục tiêu | Đọc/chạy |
|---|---|
| Hiểu sản phẩm nghiên cứu trong 5 phút | Phần này và `PROJECT_CONTEXT.md` |
| Chuẩn bị máy mới | `CODEX_SETUP_GUIDE.md`, rồi gửi prompt Setup Review có sẵn trong đó |
| Hiểu component, gate và luồng dữ liệu generation | `ARCHITECTURE.md` |
| Vận hành từng UC | `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md` và các lệnh trong README này |
| Thiết kế comparison group/run | `docs/00-context/workflow/gates/EXPERIMENT-CONFIGURATION-GATE.md` |
| Hiểu artifact canonical và file nào chỉ là view | `docs/00-context/workflow/ARTIFACT-RETENTION-AND-CONTEXT.md` |

Sau khi clone:

```bash
git clone <REPOSITORY_URL>
cd security-vibe-coding
```

Trong task Codex đầu tiên, dùng prompt Setup Review ở `CODEX_SETUP_GUIDE.md`. Setup Review chỉ kiểm tra môi trường; không sinh source hoặc test case.

Baseline chức năng của nghiên cứu là `resource/TechnicalReport.pdf`, được chuyển thành Prompt A–D. Phần bổ sung duy nhất của generation là Prompt E `SECURITY_REQUIREMENT`; hệ thống không sinh Prompt Business Requirements hoặc Business Rules Compliance riêng. Mỗi Prompt E SR được đánh giá trực tiếp từ source/configuration/build/runtime evidence.

Quy trình được rút gọn thành:

```text
Use case
   ↓
Confirmed experiment configuration
   ↓ logical gate 1 kích hoạt security scope
Security resource
   ↓
Security coding prompt (Prompt A–F)
   ↓ researcher phê duyệt prompt
Logical gate 2 kích hoạt đúng run/model
   ↓
Source code trong finalsource/
   ↓
Audit lần đầu → source-based SR scoring → sub-prompt sửa lỗi
→ audit lại → Docker runtime → freeze final source
```

Phạm vi bảo mật của thực nghiệm chỉ gồm:

- A01:2025–A10:2025 — 50 tiêu chí generation, 5 tiêu chí cho mỗi category.
- A03:2025 chỉ được giữ để đọc artifact lịch sử; không được chọn cho run mới.

Không sinh hoặc chạy test case trong toàn bộ quy trình.

## 1. Thành phần cần biết

| Đường dẫn | Mục đích |
|---|---|
| `docs/01-inception/use-cases/` | Chứa use case do người nghiên cứu cung cấp |
| `docs/02-construction/security-resources/` | Yêu cầu bảo mật nguyên tử active A01–A10 của từng UC |
| `docs/02-construction/coding-prompts/` | Security coding prompt hoàn chỉnh, gồm Prompt A–F |
| `docs/02-construction/implementation/` | Gate decisions, schema/model decisions, generation state và bug-fixing sub-prompt |
| `finalsource/fe/` | Mã nguồn frontend cuối cùng |
| `finalsource/be/` | Mã nguồn backend cuối cùng |
| `docs/05-experiments/` | Canonical generation/audit/repair metrics JSON; Markdown được render on demand |
| `.codex/skills/` | Các skill điều khiển quy trình |
| `templates/` | Template được nhóm theo `inception/`, `construction/`, `research/` và `operations/` |

Hai lệnh chính nhà nghiên cứu cần dùng:

```text
$gen-coding-prompt <đường-dẫn-use-case>
$gen-source-code <đường-dẫn-security-coding-prompt>
```

Sau khi run hoàn tất, các lệnh đọc báo cáo là:

```text
$render-experiment-report docs/05-experiments/<UC-ID>/<RUN-ID>.json
```

Để kiểm tra máy, cấu hình, chạy hoặc xử lý lỗi Docker, dùng skill hỗ trợ:

```text
$docker-deployment review
$docker-deployment initialize
$docker-deployment run
$docker-deployment troubleshoot
```

Skill lưu lịch sử môi trường và lỗi đã che secrets trong `docs/03-audit/docker-deployment/`; nó không thay đổi security metrics của use case.

`$docker-deployment run` build/start và xác minh FE/BE/MySQL cho generation runtime gate.

## 2. Chuẩn bị use case

Các file Markdown trong `docs/01-inception/use-cases/` là context chức năng lấy từ `resource/TechnicalReport.pdf`. Với bộ 16 UC của nghiên cứu, nội dung file UC chính phải giữ nguyên Functional Use-Case Specification và Project-Specific Implementation Context (Prompt A-D), không được tóm lược hoặc bổ sung yêu cầu bảo mật.

Ví dụ tên file:

```text
docs/01-inception/use-cases/uc-1-login.md
```

Format Technical Report gồm:

- Functional Use-Case Specification: name, description, actor, preconditions, postconditions, main/alternative/exception flow, UI, API và request/response.
- Project-Specific Implementation Context: Backend, Frontend UI, Frontend Logic/API và Validation/Error Handling (Prompt A-D).

Không thêm `Status`, `Open decisions`, Prompt E hoặc Security Requirements vào UC context. Trạng thái phê duyệt và các ambiguity được ghi trong security coding prompt sinh ra ở bước tiếp theo.

> **Immutable boundary:** toàn bộ 16 UC chính `docs/01-inception/use-cases/uc-*.md` là read-only. Không một skill nào được sửa, format, rename, move, delete hoặc ghi bổ sung vào các file này. Nếu phát hiện vấn đề, chỉ báo cáo và ghi nhận trong artifact downstream.

Nếu UC tham chiếu Figma hoặc Google Sheets, ghi URL và đúng frame/node hoặc sheet/tab/range cần đọc. Không ghi token, cookie hoặc thông tin đăng nhập vào use case.

## 3. Sinh security coding prompt

Trong Codex, khi đang làm việc tại repository root `security-vibe-coding`, nhập:

```text
$gen-coding-prompt docs/01-inception/use-cases/uc-1-login.md
```

Skill sẽ tự động:

1. Đọc use case, `PROJECT_CONTEXT.md`, quy tắc dự án và technical stack.
2. Đọc đúng Figma/Google Sheets được tham chiếu nếu có.
3. Tạo hoặc đọc unified experiment configuration chứa researcher, security scope, audit protocol và các run assignment; researcher chỉ cần nhập các quyết định này một lần.
4. Kích hoạt logical gate 1 bằng receipt `security-scope-activation.json`; scope A01–A10 được resolve từ Confirmed configuration. Bước này chưa cho phép sửa source.
5. Sinh security resource theo `format_security`.
6. Sinh security coding prompt gồm:
   - Prompt A — Backend API.
   - Prompt B — Frontend UI.
   - Prompt C — Frontend logic/API integration.
   - Prompt D — Validation và error handling.
   - Prompt E — Security Requirements.
   - Prompt F — Implementation context.

Kết quả ví dụ:

```text
docs/02-construction/security-resources/UC-001-security.json
docs/02-construction/implementation/UC-001/security-scope-activation.json
docs/02-construction/coding-prompts/UC-001-security-coding-prompt.md
docs/05-experiments/configurations/<CONFIG-ID>.json
```

## 4. Kiểm tra và phê duyệt prompt

Đây là điểm dừng bắt buộc trước khi sinh source code. Mở hai file vừa tạo và kiểm tra:

- Prompt A-D có giữ đúng nghiệp vụ và contract trong UC/Technical Report không.
- Prompt A–D có đúng API, UI và flow không.
- Prompt E chỉ chứa active A01–A10 SR đã được đóng băng.
- Mỗi Security Requirement có SR ID, canonical SEC ID, source mapping/link, 1 điểm và tiêu chí đánh giá rõ ràng.
- Các yêu cầu không áp dụng có lý do `not_applicable` hợp lý.
- Tổng điểm bảo mật đã được khóa trước khi sinh code.
- Không còn quyết định quan trọng chưa giải quyết.

Khi chấp thuận, đổi metadata đầu security coding prompt thành:

```yaml
status: Approved
```

Không chạy bước sinh source nếu prompt vẫn là `Draft`.

## 5. Sinh source code

Sau khi prompt đã được phê duyệt, nhập:

```text
$gen-source-code docs/02-construction/coding-prompts/UC-001-security-coding-prompt.md
```

Skill sẽ:

1. Đọc prompt và tự tìm use case/security resource liên quan.
2. Gọi skill React/Vite cho frontend và NestJS/TypeORM/MySQL cho backend tùy phạm vi UC.
3. Chỉ ghi mã nguồn vào:

   ```text
   finalsource/fe/
   finalsource/be/
   ```

4. Chạy các kiểm tra build/lint/runtime được phép, nhưng không sinh hoặc chạy test case.
5. Gọi `$audit-generation-metrics` ngay sau lần sinh đầu và lưu first-pass audit kể cả khi build/lint/runtime lỗi.
6. Gọi nội bộ `$bug-fixing-sub-prompt` cho từng repair iteration có bằng chứng; mỗi lần tạo một artifact và metric entry riêng.
7. Audit lại sau mỗi sub-prompt mà không ghi đè số liệu lần sinh đầu; mọi repair đều tính tổng thời gian/token, còn security-repair là tập con sửa trực tiếp SR.

## 6. Cấu hình và chạy final source

### 6.1 Chạy bằng Docker Compose — bắt buộc

Research runtime chỉ hỗ trợ Docker Desktop hoặc Docker Engine có Compose v2. Không có nhánh vận hành native bằng Node.js/MySQL trên host; thiếu Docker daemon là trạng thái `BLOCKED`.

Từ repository root `security-vibe-coding`:

```bash
cd finalsource
cp .env.example .env
```

Mở `finalsource/.env` và thay ít nhất hai giá trị:

```dotenv
MYSQL_PASSWORD=<strong-local-database-password>
JWT_SECRET=<at-least-32-random-characters>
```

Có thể tạo JWT secret ngẫu nhiên bằng một trong các lệnh sau:

```bash
openssl rand -hex 32
```

Khởi động toàn bộ MySQL, backend và frontend:

```bash
docker compose up --build
```

Khi cả ba service đã healthy, mở:

```text
http://localhost:8080
```

Frontend Nginx chuyển tiếp `/api` nội bộ sang NestJS; MySQL chỉ nằm trong Docker network và không mở port ra host.

Các lệnh vận hành:

```bash
# Chạy nền
docker compose up --build -d

# Xem trạng thái
docker compose ps

# Xem log tất cả service
docker compose logs -f

# Chỉ xem backend
docker compose logs -f backend

# Dừng và giữ database
docker compose down

# Build lại sau khi source thay đổi
docker compose up --build -d
```

Muốn reset toàn bộ dữ liệu MySQL:

```bash
docker compose down -v
```

`down -v` xóa named volume và không thể khôi phục dữ liệu MySQL từ volume đó. Không dùng lệnh này nếu cần giữ dữ liệu thực nghiệm.

Đổi cổng truy cập bằng `APP_PORT` trong `finalsource/.env`, ví dụ:

```dotenv
APP_PORT=8090
```

Sau đó mở `http://localhost:8090` và build/start lại Compose.

Trong Docker research runtime:

- Backend chạy với cấu hình research cố định; OpenAPI/Swagger phục vụ inspection và tài liệu API nội bộ.
- Backend chạy bằng non-root user.
- Frontend dùng Nginx unprivileged trên cổng nội bộ `8080`.
- MySQL có healthcheck và lưu dữ liệu trong named volume.
- Backend chỉ khởi động sau khi MySQL healthy; frontend chỉ khởi động sau khi backend healthy.
- Credential chỉ lấy từ `finalsource/.env`, file này bị Git ignore; không dùng env riêng dưới `fe/` hoặc `be/` để thay thế Compose networking.
- TypeORM vẫn dùng `synchronize: false`; feature cần thay đổi schema phải cung cấp migration.

Nếu Docker báo lỗi:

| Hiện tượng | Cách xử lý |
|---|---|
| Compose yêu cầu `MYSQL_PASSWORD`/`JWT_SECRET` | Kiểm tra đã copy `finalsource/.env.example` thành `finalsource/.env` |
| Port `8080` đã được sử dụng | Đổi `APP_PORT` trong `.env` |
| Backend không healthy | Chạy `docker compose logs backend database` |
| Source mới chưa xuất hiện | Chạy lại `docker compose up --build -d` |
| Database cũ không tương thích schema | Chạy migration; chỉ dùng `down -v` nếu chấp nhận mất dữ liệu |

## 7. Generation audit

Kết quả được lưu tại:

```text
docs/05-experiments/<UC-ID>/<run-id>.json
```

JSON trên là canonical source of truth cho generation/repair telemetry, source-based Prompt E assessment và frozen final source hash. Mỗi SR phải có đúng một kết quả `met`, `unmet` hoặc `not_evaluable` kèm bằng chứng inspectable và rationale. Chỉ khi researcher/reviewer muốn đọc bản Markdown, chạy:

```text
$render-experiment-report docs/05-experiments/<UC-ID>/<run-id>.json
```

Audit còn ghi nhận:

- Model sinh code và model audit: nhãn, model ID, snapshot, reasoning effort/mode và Codex client version khi có telemetry.
- Lần lặp (`replicate_index`), thứ tự chạy và audit protocol.
- Thời gian và token của lần sinh đầu.
- Số sub-prompt cùng thời gian/token sửa lỗi.
- Tổng token toàn UC.
- Ba ước lượng code manual độc lập.
- Độ chính xác UI, flow và độ phức tạp UC.
- Tổng source-based `met`, `unmet`, `not_evaluable` theo A01–A10 và toàn UC.

Nếu telemetry thời gian/token hoặc bằng chứng không có, hệ thống phải ghi `null` cùng lý do; không được tự ước lượng.

### So sánh Sol Light, Luna và Terra

Trước batch, khai báo model, replicate, `run_order` và audit protocol trong unified configuration. Ngay trước khi sửa source, kích hoạt logical gate 2 bằng receipt `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/run-activation.json`:

| Nhãn nghiên cứu | Model ID | Reasoning effort |
|---|---|---|
| Sol Light | `gpt-5.6-sol` | `low` |
| Luna Medium | `gpt-5.6-luna` | `medium` |
| Terra Medium | `gpt-5.6-terra` | `medium` |

Mỗi model phải bắt đầu từ cùng use case, prompt đã duyệt và clean source baseline. Không để Terra tiếp tục sửa source do Sol sinh hoặc ngược lại. Mỗi tổ hợp UC × model × effort × lần lặp có `run_id` riêng.

Nên dùng audit protocol `fixed` cho so sánh chính: một model audit cố định đánh giá output của mọi model. Nếu dùng `matched` (model nào sinh thì model đó audit) hoặc `cross` (nhiều model audit chéo), phải ghi rõ vì model đánh giá cũng có thể làm thay đổi kết quả.

## 8. Sửa lỗi bằng sub-prompt

Sau khi immutable first-pass audit đã được lưu, lỗi có bằng chứng sẽ kích hoạt skill nội bộ `$bug-fixing-sub-prompt`. Mỗi invocation tạo đúng một sub-prompt từ `templates/construction/sub-prompt.template.md`, ví dụ:

```text
docs/02-construction/implementation/UC-001/sub-prompts/repair-001.md
```

Sub-prompt phải:

- Liên kết lỗi với AC/BR/SR ID cụ thể.
- Chỉ sửa nguyên nhân đã có bằng chứng.
- Không thay đổi nghiệp vụ, API contract, schema hoặc policy bảo mật đã duyệt.
- Không sinh màn hình, endpoint, entity, dependency hoặc nghiệp vụ mới.
- Không làm yếu Prompt E để che lỗi.
- Gọi audit lại sau khi sửa.
- Ghi một repair entry riêng gồm category/trigger, model, thời gian, token, revisions, file và evidence trước/sau.

Các chỉ số lần đầu luôn được giữ nguyên; kết quả sau sửa được ghi ở trường trạng thái hiện tại. Lỗi syntax/compile/lint/runtime được phân loại `technical`; sửa trực tiếp một frozen SR được phân loại `security`. Cả hai đều tăng tổng số sub-prompt, nhưng chỉ loại `security` tăng security-repair subset.

## 9. Figma và Google Sheets

- Figma được dùng khi UC có thiết kế FE. Luôn cung cấp chính xác URL và frame/node cần triển khai.
- Google Sheets được dùng khi UC, business rules, API specification hoặc dữ liệu đánh giá nằm trên Sheet. Luôn chỉ rõ tab và range/column.
- Các plugin đã cung cấp connector cần thiết; repository không cần lưu MCP credential thủ công.
- Skill chỉ đọc nguồn kết nối để sinh code/audit. Chỉ ghi ngược vào Figma hoặc Sheets khi nhà nghiên cứu yêu cầu rõ ràng.
- Nếu nguồn không truy cập được hoặc mơ hồ, hệ thống phải dừng thay vì đoán.

## 10. Chạy toàn bộ quy trình bằng một skill

Có thể yêu cầu skill điều phối:

```text
$run-secure-aidlc docs/01-inception/use-cases/uc-1-login.md
```

Skill vẫn dừng sau bước sinh prompt để nhà nghiên cứu kiểm tra và phê duyệt. Sau đó tiếp tục bằng `$gen-source-code` với đường dẫn được trả về.

## 11. Những điều không được làm

- Không paste lại toàn bộ `BUSINESS_PROMPT_TEMPLATE` tham khảo vào chat.
- Không sinh source trước khi security coding prompt được phê duyệt.
- Không thêm A04–A10 vào mẫu số thực nghiệm.
- Không thay đổi danh sách SR hoặc tổng điểm sau khi đã quan sát code lần đầu.
- Không coi kiểm tra ở frontend là thay thế cho authorization ở backend.
- Không ghi secret/token/password vào source, prompt, log hoặc báo cáo.
- Không tự thêm dependency nếu khả năng có sẵn đã đáp ứng yêu cầu.
- Không sinh hoặc chạy test/test case.

## 12. Checklist nhanh cho mỗi use case

- [ ] UC được chọn từ 16 immutable baseline files trong `docs/01-inception/use-cases/`; không sửa hoặc thêm status vào UC.
- [ ] Prompt A-D giữ đúng nội dung UC/Technical Report và mọi ambiguity quan trọng đã được ghi trong artifact sinh ra.
- [ ] Figma/Sheet có URL và phạm vi cụ thể nếu được sử dụng.
- [ ] Đã chạy `$gen-coding-prompt`.
- [ ] Đã kiểm tra security resource, Prompt A–F và tổng điểm active A01–A10.
- [ ] Security coding prompt đã chuyển thành `Approved`.
- [ ] Đã chạy `$gen-source-code`.
- [ ] Source chỉ xuất hiện trong `finalsource/`.
- [ ] Có canonical audit `.json`; chỉ render `.md` khi researcher/reviewer cần xem.
- [ ] Các lỗi được sửa qua sub-prompt và audit lại.
- [ ] Số liệu lần sinh đầu không bị ghi đè sau khi sửa.
- [ ] Mỗi frozen SR có đúng một source-based assessment và tổng A01–A10 khớp denominator.

## Tài liệu tham khảo nội bộ

- `PROJECT_CONTEXT.md` — ngữ cảnh và ràng buộc toàn dự án.
- `CODEX_SETUP_GUIDE.md` — setup/review checklist cho clone hoặc research environment mới.
- `ARCHITECTURE.md` — component, luồng dữ liệu và artifact của generation project.
- `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md` — workflow dựa trên file.
- `docs/00-context/workflow/ARTIFACT-RETENTION-AND-CONTEXT.md` — canonical JSON, on-demand views và context routing.
- `docs/00-context/workflow/AI-DLC-ADAPTATION.md` — AI-DLC rút gọn cho nghiên cứu.
- `docs/00-context/security/OWASP-2025-SECURITY-CATALOG.json` — nguồn canonical để AI đọc và sinh/audit SR.
- `docs/00-context/security/OWASP-2025-SECURITY-SCORING.md` — projection dễ đọc dành cho researcher; không dùng làm machine input.
- `docs/05-experiments/METRICS-SCHEMA.md` — schema dữ liệu thực nghiệm.
