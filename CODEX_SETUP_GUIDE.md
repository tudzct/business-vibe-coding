# Codex Setup Guide — môi trường sản phẩm nghiên cứu

Tài liệu này hướng dẫn Codex rà soát repository sau khi nhà nghiên cứu triển khai sản phẩm nghiên cứu trên một môi trường mới. Mục tiêu của bước setup là xác nhận môi trường và cấu trúc nghiên cứu đã sẵn sàng; **không sinh tính năng, không sửa source và không tạo hoặc chạy test case**.

## 1. Nhà nghiên cứu cần chuẩn bị

- Git.
- Codex và quyền mở thư mục local.
- Docker Desktop, hoặc Docker Engine có Docker Compose v2.
- Quyền truy cập Figma/Google Drive chỉ khi use case đang xử lý có tham chiếu các nguồn đó.

Clone repository và mở đúng thư mục gốc:

```bash
git clone <REPOSITORY_URL>
cd security-vibe-coding
```

Trong Codex, chọn/open chính repository root, không mở riêng `finalsource/fe` hoặc `finalsource/be`. Codex phải nhìn thấy ít nhất:

```text
AGENTS.md
PROJECT_CONTEXT.md
CODEX_SETUP_GUIDE.md
.codex/skills/
docs/
finalsource/
templates/
```

### Bản đồ đọc dành cho researcher mới

Sau khi Setup Review, đọc theo nhu cầu thay vì tải toàn bộ repository vào context:

1. `README.md` — landing page và lệnh researcher-facing.
2. `PROJECT_CONTEXT.md` — objective, terminology, invariants và repository map.
3. `ARCHITECTURE.md` — generation component, data flow và gates.
4. `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md` — cách vận hành từng UC.
5. `docs/00-context/workflow/ARTIFACT-RETENTION-AND-CONTEXT.md` — canonical JSON và on-demand Markdown.

## 2. Prompt setup gửi cho Codex

Nhà nghiên cứu gửi đoạn sau trong task Codex đầu tiên:

```text
Đọc AGENTS.md, PROJECT_CONTEXT.md và CODEX_SETUP_GUIDE.md.
Hãy thực hiện Setup Review cho repository này theo đúng checklist trong
CODEX_SETUP_GUIDE.md. Chỉ rà soát và báo cáo; không sửa file, không sinh source,
không tạo hoặc chạy test case, không chạy docker compose down -v.
Nếu Docker đã sẵn sàng, hãy hỏi tôi trước khi build/start container.
```

Nếu muốn Codex vừa rà soát vừa khởi động ứng dụng, nhà nghiên cứu phải yêu cầu rõ:

```text
Sau khi Setup Review đạt, hãy tạo finalsource/.env từ file example nếu chưa có,
yêu cầu tôi tự điền secret còn thiếu, rồi chạy ứng dụng bằng Docker Compose.
Không in secret ra chat hoặc log và không chạy docker compose down -v.
```

Codex không được tự tạo secret yếu hoặc commit `finalsource/.env`.

## 3. Checklist Setup Review dành cho Codex

Codex phải chạy các bước theo thứ tự dưới đây và trả về kết quả `PASS`, `WARN` hoặc `BLOCKED` cho từng mục.

### 3.1 Xác nhận repository

Thực hiện các kiểm tra chỉ đọc:

```bash
pwd
git status --short
git rev-parse --show-toplevel
git log -1 --oneline
```

Tiêu chí:

- Git root chính là repository root `security-vibe-coding` đang mở.
- Không tự xóa hoặc ghi đè thay đổi local của nhà nghiên cứu.
- Nếu worktree có thay đổi, báo rõ file nào thay đổi trước khi làm bước khác.

### 3.2 Đọc ngữ cảnh bắt buộc

Đọc đầy đủ:

1. `AGENTS.md`
2. `PROJECT_CONTEXT.md`
3. `CODEX_SETUP_GUIDE.md`
4. `docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md`
5. `docs/00-context/sources/CONNECTED-SOURCES.md`

Sau đó xác nhận:

- Phạm vi generation của run mới gồm A01:2025–A10:2025, với 5 SEC cho mỗi category trong canonical catalog.
- Không sinh hoặc chạy test/test case.
- Source chỉ được triển khai vào `finalsource/fe` và `finalsource/be`.
- 16 UC chính `docs/01-inception/use-cases/uc-*.md` là read-only; Codex tuyệt đối không được sửa ngược.
- Security coding prompt phải được phê duyệt trước khi sinh source.
- Generation metrics source-score từng frozen Prompt E SR từ source/configuration/build/runtime evidence.

### 3.3 Kiểm tra cấu trúc và skills

Chạy kiểm tra chỉ đọc:

```bash
find .codex/skills -mindepth 2 -maxdepth 2 -name SKILL.md -print | sort
find docs/01-inception/use-cases -maxdepth 1 -type f -name 'uc-*.md' -print | sort
```

Kỳ vọng hiện tại:

- Có đúng 16 UC chính được dẫn xuất từ Technical Report.
- Mỗi UC giữ nguyên Functional Use-Case Specification và Project-Specific Implementation Context (Prompt A-D).
- Khi sinh prompt, Codex đọc trực tiếp UC chính; `resource/TechnicalReport.pdf` là nguồn provenance để đối chiếu khi người nghiên cứu yêu cầu.
- Có 13 repo-local skills: 9 workflow/component skills, 2 support skills (`docker-deployment`, `resolve-figma-design-dataset`) và 2 deterministic report renderers (`render-experiment-report`, `render-security-evaluation`).
- `docker-deployment` review, initialize, run và troubleshoot Docker nhưng không tự chấm security metrics.
- `render-experiment-report` chỉ chuyển canonical JSON thành Markdown on demand; nó không chạy lại generation và không tạo source of truth thứ hai.

Nếu thiếu file hoặc đường dẫn không khớp, đánh dấu `BLOCKED`; không tự đoán hoặc tái tạo tài liệu nghiên cứu.

### 3.4 Kiểm tra Docker mà chưa khởi động ứng dụng

```bash
docker --version
docker compose version
docker info
docker compose -f finalsource/compose.yaml config --quiet
```

Lệnh `docker info` có thể yêu cầu Docker Desktop đang chạy. Nếu Docker daemon chưa chạy, đánh dấu `BLOCKED`, hướng dẫn nhà nghiên cứu mở/cài Docker theo kênh chính thức rồi chạy lại. Research runtime không hỗ trợ fallback native Node.js/MySQL.

`docker compose ... config --quiet` cần các biến bắt buộc. Nếu chưa có `finalsource/.env`, chỉ báo `WARN` và chuyển sang bước cấu hình bên dưới.

### 3.5 Kiểm tra cấu hình local an toàn

File `finalsource/.env` là cấu hình local, đã bị Git ignore và không được commit. Nếu chưa có, sau khi nhà nghiên cứu cho phép, tạo từ mẫu:

```bash
cp finalsource/.env.example finalsource/.env
```

Nhà nghiên cứu phải thay ít nhất:

```dotenv
MYSQL_PASSWORD=<strong-local-database-password>
JWT_SECRET=<at-least-32-random-characters>
```

Quy tắc cho Codex:

- Không đọc/in toàn bộ `.env` vào chat hoặc báo cáo.
- Chỉ xác nhận biến bắt buộc là có/thiếu; không hiển thị giá trị.
- Không commit `.env`.
- Có thể kiểm tra `.gitignore` và dùng `git check-ignore finalsource/.env`.
- Nếu phát hiện secret đang được Git theo dõi, đánh dấu `BLOCKED` và cảnh báo nhà nghiên cứu; không tự public/push.

## 4. Khởi động ứng dụng sau khi được nhà nghiên cứu cho phép

Từ repository root:

```bash
docker compose --env-file finalsource/.env -f finalsource/compose.yaml up --build -d
docker compose --env-file finalsource/.env -f finalsource/compose.yaml ps
```

Chờ các service `database`, `backend`, `frontend` healthy rồi mở:

```text
http://localhost:8080
```

Nếu `APP_PORT` đã đổi trong `.env`, sử dụng `http://localhost:<APP_PORT>`.

Kiểm tra runtime không tạo test case:

```bash
docker compose --env-file finalsource/.env -f finalsource/compose.yaml logs --tail=100 backend
docker compose --env-file finalsource/.env -f finalsource/compose.yaml logs --tail=100 frontend
```

Codex phải tóm tắt lỗi từ log và che mọi credential/token nếu có. Không khẳng định ứng dụng hoạt động chỉ vì container đang chạy; phải phân biệt trạng thái container, healthcheck và khả năng truy cập UI/API.

Các lệnh vận hành an toàn:

```bash
docker compose --env-file finalsource/.env -f finalsource/compose.yaml ps
docker compose --env-file finalsource/.env -f finalsource/compose.yaml logs -f backend
docker compose --env-file finalsource/.env -f finalsource/compose.yaml down
```

Không chạy `docker compose down -v` trong setup. Lệnh đó xóa volume MySQL và dữ liệu thực nghiệm.

## 5. Figma và Google Sheets

Không bắt buộc cấu hình connector để chỉ chạy Docker. Connector chỉ cần khi UC hoặc security coding prompt tham chiếu nguồn tương ứng.

Khi cần:

- Với Figma, Codex phải dùng `docs/00-context/FIGMA-LINK-REVIEW.md` làm mapping URL chuẩn; không lấy lại file key cũ từ UC bất biến.
- Khi quota Figma MCP đã sẵn sàng và repository chưa có full offline dataset, gửi nguyên yêu cầu sau cho Codex:

  > Tạo full offline Figma design dataset cho toàn bộ 16 UC theo CAPTURE-SPEC. Chỉ đánh dấu complete khi đủ design context, metadata, screenshot, export, toàn bộ assets, asset-map và checksum.

- Codex phải thực hiện theo `resource/figma-design-dataset/CAPTURE-SPEC.md` và dùng Figma skill/plugin đã cài để capture đúng từng file/frame/node. Các UC dùng chung node chỉ capture một lần.
- Sau khi một dataset version đạt `complete`, các lần generation và audit phải dùng version offline đã khóa; chỉ gọi lại Figma MCP khi người nghiên cứu yêu cầu tạo dataset version mới.
- Với Google Sheets, Codex phải dùng Google Drive/Google Sheets connector và chỉ đọc đúng spreadsheet/tab/range được chỉ định.
- Nếu chưa đăng nhập hoặc thiếu quyền, báo `BLOCKED` cho nguồn đó; không scrape, không đoán nội dung và không thay bằng ảnh/chụp màn hình không được phê duyệt.
- Không đưa access token, cookie hoặc credential vào repository.

## 6. Mẫu báo cáo Setup Review

Codex trả về báo cáo ngắn theo mẫu:

```markdown
# Setup Review

- Repository: PASS | WARN | BLOCKED — <evidence>
- Required context: PASS | WARN | BLOCKED — <files read>
- Use cases/specs: PASS | WARN | BLOCKED — <counts>
- Codex skills: PASS | WARN | BLOCKED — <missing items or none>
- Docker/Compose: PASS | WARN | BLOCKED — <versions/daemon state>
- Local configuration: PASS | WARN | BLOCKED — <presence only; never values>
- Figma/Sheets: PASS | NOT_APPLICABLE | BLOCKED — <connection status when required>
- Runtime: PASS | NOT_RUN | BLOCKED — <container/health/UI evidence>
- Git safety: PASS | WARN | BLOCKED — <dirty files, ignored .env, secret risk>

Overall: READY | READY_WITH_WARNINGS | NOT_READY
Next action: <one concrete action>
```

`READY` chỉ có nghĩa là môi trường sẵn sàng cho quy trình nghiên cứu. Nó không có nghĩa source đã đáp ứng các Security Requirements; kết luận đó chỉ được ghi bởi quy trình audit có evidence.

## 7. Bắt đầu một use case sau setup

Khi Setup Review đã đạt và UC được phê duyệt, nhà nghiên cứu chọn đúng model Codex cần thực nghiệm và ghi tên/model identifier vào metrics. Sau đó chạy:

```text
$gen-coding-prompt docs/01-inception/use-cases/uc-1-login.md
```

Đọc và phê duyệt security resource/security coding prompt trước khi chạy:

```text
$gen-source-code docs/02-construction/coding-prompts/UC-001-security-coding-prompt.md
```

Không dùng chung một kết quả sinh giữa các model nếu mục tiêu là so sánh model. Mỗi lần thực nghiệm phải giữ riêng audit artifacts, thời gian và token metrics theo quy ước trong dự án.

Sau khi generation/audit/repair terminal, canonical metrics nằm ở `docs/05-experiments/<UC-ID>/<RUN-ID>.json`. Xem Markdown bằng:

```text
$render-experiment-report docs/05-experiments/<UC-ID>/<RUN-ID>.json
```


## 8. Các hành động Codex không được tự làm trong setup

- Không sửa source, use case, template, prompt hoặc audit artifact.
- Không format, rename, move, delete hoặc bổ sung bất kỳ nội dung nào vào 16 UC chính.
- Không tạo hoặc chạy test/test case.
- Không sinh security coding prompt khi nhà nghiên cứu chỉ yêu cầu Setup Review.
- Không chạy migration phá hủy, reset database hoặc `docker compose down -v`.
- Không commit, push hoặc thay đổi branch nếu nhà nghiên cứu chưa yêu cầu.
- Không cài plugin/package hoặc thay đổi cấu hình máy mà chưa có sự đồng ý.
- Không hiển thị hoặc ghi lại secrets.

Để hiểu toàn bộ cách sử dụng sau bước setup, đọc tiếp `README.md`. Để hiểu kiến trúc và các AI component, đọc `ARCHITECTURE.md`.
