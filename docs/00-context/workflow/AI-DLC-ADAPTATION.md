# AI-DLC tối giản cho đề tài

## AI-DLC là gì?

Trong sản phẩm nghiên cứu này, AI-DLC là một quy trình có cấu trúc để AI chuyển yêu cầu thành source code và lưu lại bằng chứng đánh giá. Nhà nghiên cứu không cần áp dụng đầy đủ các vai trò, tài liệu và nghi thức của AI-DLC doanh nghiệp.

Quy trình nghiên cứu chỉ giữ bốn bước:

```text
1. USE CASE
   ↓
2. SECURITY CODING PROMPT
   - gate chọn điểm: researcher_selected hoặc all_catalog
   - Prompts A-D: chức năng, giao diện, luồng và xử lý lỗi
   - Prompt E: Security Requirements
   - Prompt F: ngữ cảnh triển khai
   ↓ nhà nghiên cứu xem và phê duyệt
3. SOURCE CODE
   - kích hoạt run/model bắt buộc trước khi sửa source
   - finalsource/fe
   - finalsource/be
   ↓
4. AUDIT VÀ SỬA LỖI
   - đo kết quả lần sinh đầu
   - tạo sub-prompt khi có lỗi
   - sửa tối thiểu và audit lại
```

Unified experiment configuration nằm phía trên quy trình và được nhập một lần. Logical gate 1 chỉ kích hoạt security scope để tạo Prompt E; logical gate 2 chỉ kích hoạt một `run_id` sau khi prompt/schema đã được duyệt. Không có source mutation giữa hai mốc này.

## Bốn thành phần cốt lõi

### 1. Use case - đầu vào

Use case mô tả chức năng cần xây dựng: actor, điều kiện, luồng chính/ngoại lệ, input/output và acceptance criteria từ baseline TechnicalReport. Nhà nghiên cứu chỉ cần cung cấp file `uc-*.md`; không cần tự điền `BUSINESS_PROMPT_TEMPLATE` tham khảo.

### 2. Security coding prompt - đặc tả cho AI sinh code

`$gen-coding-prompt <use-case.md>` tự đọc use case, project context, Google Sheets và Figma khi có liên kết. Trước khi sinh security resource, skill chờ researcher chọn `researcher_selected` hoặc `all_catalog` và lưu quyết định. Sau đó skill sinh security resource và prompt A-F.

### 3. Source code - kết quả sinh mã

Sau khi nhà nghiên cứu xem và đặt prompt ở trạng thái `Approved`, `$gen-source-code <security-coding-prompt.md>` tự đọc toàn bộ artifact liên quan và sinh code vào `finalsource/`. Nhà nghiên cứu không paste prompt vào chat.

### 4. Audit và bug-fixing sub-prompt - vòng lặp hiệu chỉnh

`$audit-generation-metrics` lưu telemetry sinh code, thời gian, token, UI accuracy, flow accuracy, độ phức tạp UC, từng repair iteration và đúng một source-based assessment cho mỗi frozen Prompt E SR. Khi có lỗi có bằng chứng từ generation audit, hệ thống gọi `$bug-fixing-sub-prompt`, sửa tối thiểu rồi ghi telemetry và assessment lại. Không tạo business-correctness metrics.

## Các điểm nhà nghiên cứu cần quyết định

1. Xác nhận unified experiment configuration; security scope được kích hoạt trước khi sinh security resource.
2. Phê duyệt security coding prompt trước khi sinh source code.
3. Quyết định khi yêu cầu còn mơ hồ hoặc việc sửa lỗi phải thay đổi nghiệp vụ, API, schema hay chính sách bảo mật.
4. Kích hoạt cấu hình model/replicate/run order đầy đủ của đúng run trước khi sinh source. Các assignment có thể được nhập một lần từ đầu nhưng chỉ run đang kích hoạt mới được phép sửa source.

## Những phần không sử dụng trong nghiên cứu

- Không chia vai trò BA, Tech Lead, Developer và Tester.
- Không tạo PRD/TAR bundle hoặc nhiều guard gate doanh nghiệp.
- Không có phase Operations độc lập.
- Không sinh hoặc chạy test case.
- Không yêu cầu nhà nghiên cứu copy/paste prompt thủ công.
