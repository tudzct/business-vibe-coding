# Hướng dẫn chuyển sang dự án thực nghiệm mới

Tài liệu này dành cho researcher và thành viên nhóm khi thay toàn bộ đầu vào của một dự án thực nghiệm. Mục tiêu là chỉ thay dữ liệu đặc thù của dự án, đồng thời giữ nguyên các skill, template, workflow, telemetry và quy tắc đánh giá dùng chung.

## Nguyên tắc chung

- Hoàn tất và lưu kết quả của dự án cũ trước khi thay đầu vào.
- Thay toàn bộ inventory của dự án cũ; không để sót UC, API, Figma mapping hoặc source nghiệp vụ cũ trong dự án mới.
- Không sửa các file workflow, skill, template hoặc quy tắc đo lường chỉ để phù hợp với miền nghiệp vụ mới.
- Các file frozen là bản chiếu read-only của nguồn có thẩm quyền. Nếu nội dung nguồn sai, sửa nguồn gốc rồi tạo lại bản frozen; không sửa nội dung frozen giữa một run.
- Không đưa mật khẩu, token, cookie hoặc thông tin nhạy cảm vào repository.
- Chỉ bắt đầu tạo configuration của từng UC sau khi tất cả đầu vào cấp dự án dưới đây đã được chuẩn bị xong.

## 1. Cập nhật `PROJECT_PROFILE.json`

Đường dẫn: `PROJECT_PROFILE.json`

Đây là điểm vào cấp dự án. Cập nhật:

- `project_id`: mã ổn định, duy nhất của dự án;
- `project_name`: tên hiển thị của dự án;
- `clean_source_baseline_sha256`: SHA-256 của clean `source-baseline.zip` thuộc dự án;
- `authoritative_sources.use_case_specification`: loại nguồn, URL Google Sheets và tên tab chứa đặc tả UC;
- `authoritative_sources.api_specification`: loại nguồn, URL Google Sheets và tên tab chứa đặc tả API;
- `authoritative_sources.figma.root_node_urls`: một hoặc nhiều URL root của file/node Figma dùng cho dự án.

Ví dụ cấu trúc:

```json
{
  "project_id": "<project-id>",
  "project_name": "<Project Name>",
  "clean_source_baseline_sha256": "sha256:<64-lowercase-hex>",
  "authoritative_sources": {
    "use_case_specification": {
      "type": "Google Sheets",
      "url": "<UC-SHEET-URL>",
      "tab": "<UC-TAB-NAME>"
    },
    "api_specification": {
      "type": "Google Sheets",
      "url": "<API-SHEET-URL>",
      "tab": "<API-TAB-NAME>"
    },
    "figma": {
      "type": "Figma",
      "root_node_urls": [
        "<FIGMA-ROOT-NODE-URL>"
      ]
    }
  }
}
```

Không đưa range của từng UC/API, danh sách UC, số lượng UC hoặc mapping từng Figma frame vào profile. Những thông tin chi tiết đó nằm trong các đầu vào frozen tương ứng.

## 2. Thay bộ Use Case frozen

Đường dẫn: `docs/01-inception/use-cases/uc-*.md`

Thay toàn bộ các file `uc-*.md` của dự án cũ bằng inventory UC đầy đủ của dự án mới. Mỗi file phải:

- dùng `artifact_type: business-use-case-specification`;
- có `status: Frozen`;
- có `uc_id` và `uc_name` duy nhất;
- ghi đúng `source_type`, `source_spreadsheet_id`, `source_sheet`, `source_range` và `retrieved_at` của chính UC đó;
- giữ canonical source/provenance của chính bản frozen;
- chứa đầy đủ đặc tả chức năng, UML, Business Rules, flow và các tham chiếu API/UI có trong nguồn;
- không chứa dữ liệu của UC hoặc dự án cũ.

URL nguồn xuất hiện trong từng UC không thay thế `PROJECT_PROFILE.json`. Profile xác định nguồn tổng của dự án đang hoạt động; mỗi UC lưu provenance riêng để có thể truy nguyên chính xác range và lần retrieval đã tạo ra bản frozen đó.

Sau khi thay, kiểm tra inventory bằng chính tập file khớp mẫu `docs/01-inception/use-cases/uc-*.md`; không duy trì một con số UC fix cứng trong tài liệu dùng chung.

## 3. Thay OCL Utility Definitions

Đường dẫn: `docs/01-inception/use-cases/OCL-UTILITY-DEFINITIONS.md`

Nếu nguồn UC của dự án có các utility OCL dùng chung, thay file hiện tại bằng bản frozen của dự án mới. File phải:

- dùng `artifact_type: ocl-utility-definitions`;
- có `status: Frozen`;
- ghi đúng spreadsheet ID, tab, range và thời điểm retrieval;
- bảo toàn nguyên văn định nghĩa từ nguồn có thẩm quyền;
- không tự bổ sung hoặc suy diễn thêm utility semantics.

Nếu dự án mới không cung cấp OCL utility dùng chung, không tạo nội dung giả. Xử lý sự vắng mặt này nhất quán với nguồn đặc tả và quy ước chuẩn bị dữ liệu của nhóm.

## 4. Thay bộ API contract frozen

Đường dẫn: `docs/01-inception/api-contracts/`

Thay toàn bộ API contract của dự án cũ bằng inventory API đầy đủ của dự án mới. Mỗi file phải:

- dùng `artifact_type: api-contract`;
- có `status: Frozen`;
- có `api_id` duy nhất và khớp với API ID được UC tham chiếu;
- khai báo đúng `related_uc_id` hoặc các UC liên quan;
- mô tả chính xác method, path, authentication/authorization, request, response và error contract từ nguồn API;
- không giữ endpoint, entity hoặc ví dụ nghiệp vụ của dự án cũ.

Tên file nên ổn định theo API ID. Khi chuẩn bị configuration cho một UC, configuration sẽ pin toàn bộ API mà UC đó tham chiếu theo đúng thứ tự, đường dẫn và SHA-256; không dùng tên file gần giống để suy đoán API thay thế.

## 5. Cập nhật DBML

Thực hiện theo hướng dẫn đã có ở tab **Database**.

## 6. Cập nhật database thực tế

Thực hiện theo hướng dẫn đã có ở tab **Database**.

## 7. Thay Figma mapping và frozen dataset

Các vị trí chính:

- Root Figma URL: `PROJECT_PROFILE.json`;
- Mapping từng UC: `docs/00-context/FIGMA-LINK-REVIEW.md`;
- Frozen dataset: `resource/figma-design-dataset/`.

Thực hiện theo thứ tự:

1. Cập nhật `root_node_urls` trong `PROJECT_PROFILE.json`.
2. Thay toàn bộ mapping của dự án cũ trong `FIGMA-LINK-REVIEW.md` bằng mapping của dự án mới.
3. Với mỗi UC có UI, ghi đúng UC ID/path, Figma file key, node ID và URL frame/node đã được researcher xác nhận.
4. Không giữ số lượng UC, tên frame, file key, node ID hoặc URL của dự án cũ.
5. Dùng skill `resolve-figma-design-dataset` để tạo một version frozen dataset mới từ `FIGMA-LINK-REVIEW.md`.
6. Chỉ cập nhật `active-dataset.json` sang version đã được capture và kiểm tra đầy đủ. Không ghi đè một dataset version đã được dùng cho thực nghiệm.
7. Chạy validate-all của resolver trước khi tạo configuration đầu tiên của dự án mới.

`FIGMA-LINK-REVIEW.md` là authority cho mapping chi tiết từng UC. Không lấy URL hoặc file key trong frozen UC làm nguồn capture thay thế.

## 8. Thay clean `finalsource`

Đường dẫn chính:

- `finalsource/fe`;
- `finalsource/be`;
- `.codex/skills/restore-source-baseline/assets/source-baseline.zip`.

Chuẩn bị frontend/backend sạch làm vạch xuất phát cho dự án mới:

- loại bỏ toàn bộ feature và nội dung nghiệp vụ được sinh cho dự án cũ;
- giữ stack kỹ thuật, Docker/runtime contract và các điều chỉnh compatibility dùng chung;
- chuẩn bị TypeORM/database infrastructure theo hướng dẫn ở tab **Database**;
- giữ secrets trong `finalsource/.env`, không commit hoặc sao chép secrets vào baseline;
- xác nhận clean source có thể được dùng giống nhau cho mọi condition/model/replicate của dự án mới.

Sau khi clean `finalsource` được researcher chốt:

1. Tạo lại `source-baseline.zip` từ đúng các source tree mà restore skill quản lý.
2. Tính SHA-256 của ZIP mới.
3. Cập nhật `clean_source_baseline_sha256` trong `PROJECT_PROFILE.json`.
4. Chạy chế độ `--check` của restore script để xác nhận baseline và source hiện tại đồng nhất.

Không dùng restore skill giữa các UC trong cùng một cumulative pipeline. Chỉ restore trước một pipeline, replicate hoặc model condition mới theo đúng contract của skill.

## Checklist trước khi tạo configuration đầu tiên

- [ ] `PROJECT_PROFILE.json` chỉ còn thông tin của dự án mới, có đúng clean source baseline SHA-256 và không còn placeholder.
- [ ] Bộ `uc-*.md` là inventory đầy đủ của dự án mới.
- [ ] OCL Utility Definitions khớp nguồn mới hoặc được xử lý đúng khi nguồn không cung cấp.
- [ ] Bộ API contract đầy đủ, frozen và khớp các API ID trong UC.
- [ ] DBML đã hoàn thành theo tab Database.
- [ ] Database thực tế đã hoàn thành theo tab Database.
- [ ] `FIGMA-LINK-REVIEW.md` chỉ chứa mapping của dự án mới.
- [ ] Frozen Figma dataset mới đã validate và được chọn làm active dataset.
- [ ] `finalsource` là clean baseline của dự án mới.
- [ ] `source-baseline.zip` khớp `clean_source_baseline_sha256` trong `PROJECT_PROFILE.json`.
- [ ] Không sửa skill, template, workflow hoặc telemetry chỉ vì thay domain/project.

Sau khi checklist này hoàn tất, nhóm mới bắt đầu chuẩn bị bốn JSON đầu vào và database pins cho từng UC theo workflow hiện hành.
