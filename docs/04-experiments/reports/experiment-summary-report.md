# Experiment Summary Report (Backend & Flow Focus)

- **Comparison Group:** `CG-100MS-01`
- **Model & Effort:** `gpt-5.6-luna` (`reasoning_effort: low`)
- **Scope:** 6 Use Cases (`UC-01`, `UC-02`, `UC-08`, `UC-09`, `UC-10`, `UC-03`), rút gọn quy trình bỏ pha Repair & bỏ chấm UI, tập trung đánh giá **Luồng (API/Flow)** và **Luật nghiệp vụ (Business Rules)** sau pha sinh mã nguồn lần đầu (`First Generated Source Code`).
- **Source of Truth:** Các file `canonical-run-UC-xx-GPT-5.6-LUNA.json` dưới `docs/04-experiments/`.

## 1. Tổng hợp Kết quả Audit, Độ phức tạp & Ước tính Thủ công

| Order | UC ID | Use Case Name | Use Case Complexity | Number of Business Requirements | Business Rules Passed (Correct / Incorrect / %) | Flow Accuracy (Correct / Total / %) | Manual Coding Time Estimate in Hours | Notes |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| 1 | UC-01 | Review Join Preview and Permissions | Dễ | 7 | 7 / 0 (100.0%) | 3 / 3 (100.0%) | 2.5 | Initial audit có 4 BR `not_evaluable` do thiếu quyền hardware/media trong trình duyệt headless; đã xác minh đạt `7/7` BR và `3/3` Flow ở follow-up mà không cần repair. |
| 2 | UC-02 | Join a Session | Khó | 19 | 0 / 19 (0.0%) | 1 / 3 (33.33%) | 8.5 | AI chỉ sinh 2 file Frontend (`PreJoinPreview.tsx`, `sessionJoin.ts`), bỏ quên toàn bộ Backend (`0/19` BR), khiến `BF-1` & `AF-1` lỗi (`33.33%` Flow). |
| 3 | UC-08 | View Session Participants | Trung bình | 7 | 4 / 3 (57.14%) | 3 / 3 (100.0%) | 5.5 | Hoàn thành `API-PARTICIPANT-LIST` (`4/7` BR, `3/3` Flow), nhưng bỏ sót chưa cài đặt endpoint `API-SESSION-STATE` (`SessionService::readState`) cho `BR-VSP-04..06`. |
| 4 | UC-09 | Send a Chat Message | Trung bình | 9 | 7 / 2 (77.78%) | 3 / 3 (100.0%) | 5.0 | Phần gửi tin nhắn (`send`) chuẩn 6/6 BR; phần đọc (`list`) thiếu check `JOINED` (`BR-SCM-07`) và check `session.status <> ENDED` (`BR-SCM-08`). Đạt `3/3` Flow. |
| 5 | UC-10 | Send an Emoji Reaction | Dễ | 7 | 7 / 0 (100.0%) | 3 / 3 (100.0%) | 3.5 | AI cài đặt chính xác 100% cả Backend (`7/7` BR: transaction `SERIALIZABLE`, `Idempotency-Key`, sequence) lẫn luồng (`3/3` Flow) ngay lần đầu. |
| 6 | UC-03 | Start a Live Stream | Khó | 9 | 7 / 2 (77.78%) | 3 / 3 (100.0%) | 7.5 | Phần `start` (`BR-SLS-01..07`) cài đặt chuẩn, nhưng thiếu hàm/endpoint callback `ProviderCompletion` (`LiveStreamService::complete`) cho `BR-SLS-08..09`. Đạt `3/3` Flow. |
| **ALL** | **6 UCs** | **Tổng hợp 6 Use Cases** | - | **58** | **32 / 26 (55.17%)** | **16 / 18 (88.89%)** | **32.5** | Tổng thời gian chuyên gia ước tính: 32.5 giờ; Tổng thời gian AI chạy (Wall Clock): 0.78 giờ (2794.894s) |

## 2. Thống kê Pha Coding Prompt (`prompt_generation`)

| Order | UC ID | Use Case Name | Cached Input Tokens | Input Tokens | Output Tokens | Total Tokens | Duration Time (s) | Wall Clock Time (s) | Workflow Turns | Tool Calls |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | UC-01 | Review Join Preview and Permissions | 897,664 | 956,202 | 8,176 | 964,378 | 139.859 | 228.284 | 1 | 19 |
| 2 | UC-02 | Join a Session | 1,030,016 | 1,112,685 | 10,396 | 1,123,081 | 175.196 | 273.372 | 1 | 18 |
| 3 | UC-08 | View Session Participants | 943,488 | 1,029,770 | 8,449 | 1,038,219 | 139.403 | 231.063 | 1 | 17 |
| 4 | UC-09 | Send a Chat Message | 1,154,944 | 1,241,195 | 9,171 | 1,250,366 | 144.764 | 245.746 | 1 | 21 |
| 5 | UC-10 | Send an Emoji Reaction | 1,104,896 | 1,191,358 | 8,336 | 1,199,694 | 172.511 | 245.172 | 1 | 21 |
| 6 | UC-03 | Start a Live Stream | 688,512 | 761,419 | 7,348 | 768,767 | 103.486 | 211.069 | 1 | 14 |
| **ALL** | **6 UCs** | **Tổng Coding Prompt** | **5,819,520** | **6,292,629** | **51,876** | **6,344,505** | **875.219** | **1434.706** | **6** | **110** |

## 3. Thống kê Pha First Generated Source Code (`source_generation`)

| Order | UC ID | Use Case Name | Cached Input Tokens | Input Tokens | Output Tokens | Total Tokens | Duration Time (s) | Wall Clock Time (s) | Workflow Turns | Tool Calls |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | UC-01 | Review Join Preview and Permissions | 1,175,680 | 1,197,919 | 7,813 | 1,205,732 | 96.163 | 194.820 | 1 | 12 |
| 2 | UC-02 | Join a Session | 1,699,328 | 1,739,827 | 6,459 | 1,746,286 | 55.769 | 176.166 | 1 | 13 |
| 3 | UC-08 | View Session Participants | 2,693,120 | 2,736,236 | 9,015 | 2,745,251 | 131.855 | 243.415 | 1 | 20 |
| 4 | UC-09 | Send a Chat Message | 2,034,560 | 2,076,949 | 9,139 | 2,086,088 | 147.491 | 230.323 | 1 | 15 |
| 5 | UC-10 | Send an Emoji Reaction | 2,981,632 | 3,025,234 | 11,412 | 3,036,646 | 193.091 | 284.316 | 1 | 22 |
| 6 | UC-03 | Start a Live Stream | 2,459,520 | 2,500,887 | 8,608 | 2,509,495 | 95.842 | 231.148 | 1 | 20 |
| **ALL** | **6 UCs** | **Tổng First Generated Source Code** | **13,043,840** | **13,277,052** | **52,446** | **13,329,498** | **720.211** | **1360.188** | **6** | **102** |

## 4. Tổng hợp Hai Pha (`Coding Prompt + First Generated Source Code`)

| Order | UC ID | Use Case Name | Total Cached Input Tokens | Total Input Tokens | Total Output Tokens | Total Tokens | Total Duration Time (s) | Total Wall Clock Time (s) | Total Workflow Turns | Total Tool Calls |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | UC-01 | Review Join Preview and Permissions | 2,073,344 | 2,154,121 | 15,989 | 2,170,110 | 236.022 | 423.104 | 2 | 31 |
| 2 | UC-02 | Join a Session | 2,729,344 | 2,852,512 | 16,855 | 2,869,367 | 230.965 | 449.538 | 2 | 31 |
| 3 | UC-08 | View Session Participants | 3,636,608 | 3,766,006 | 17,464 | 3,783,470 | 271.258 | 474.478 | 2 | 37 |
| 4 | UC-09 | Send a Chat Message | 3,189,504 | 3,318,144 | 18,310 | 3,336,454 | 292.255 | 476.069 | 2 | 36 |
| 5 | UC-10 | Send an Emoji Reaction | 4,086,528 | 4,216,592 | 19,748 | 4,236,340 | 365.602 | 529.488 | 2 | 43 |
| 6 | UC-03 | Start a Live Stream | 3,148,032 | 3,262,306 | 15,956 | 3,278,262 | 199.328 | 442.217 | 2 | 34 |
| **ALL** | **6 UCs** | **Tổng cộng 2 pha (6 UCs)** | **18,863,360** | **19,569,681** | **104,322** | **19,674,003** | **1595.430** | **2794.894** | **12** | **212** |

## 5. Bảng Tổng Hợp Đầy Đủ Toàn Bộ Các Cột (Master Table)

| Order | UC ID | Use Case Name | Use Case Complexity | Number of Business Requirements | CP Cached Input Tokens | CP Input Tokens | CP Output Tokens | CP Total Tokens | CP Duration (s) | CP Wall Clock (s) | CP Turns | CP Tool Calls | SG Cached Input Tokens | SG Input Tokens | SG Output Tokens | SG Total Tokens | SG Duration (s) | SG Wall Clock (s) | SG Turns | SG Tool Calls | Sum Cached Input Tokens | Sum Input Tokens | Sum Output Tokens | Sum Total Tokens | Sum Duration (s) | Sum Wall Clock (s) | Sum Turns | Sum Tool Calls | Flow Accuracy (%) | Flow Correct / Total | BR Correct / Incorrect | BR Accuracy (%) | Manual Coding Time Estimate (Hours) | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | UC-01 | Review Join Preview and Permissions | Dễ | 7 | 897664 | 956202 | 8176 | 964378 | 139.859 | 228.284 | 1 | 19 | 1175680 | 1197919 | 7813 | 1205732 | 96.163 | 194.820 | 1 | 12 | 2073344 | 2154121 | 15989 | 2170110 | 236.022 | 423.104 | 2 | 31 | 100.0% | 3/3 | 7/0 | 100.0% | 2.5 | Initial audit có 4 BR `not_evaluable` do thiếu quyền hardware/media trong trình duyệt headless; đã xác minh đạt `7/7` BR và `3/3` Flow ở follow-up mà không cần repair. |
| 2 | UC-02 | Join a Session | Khó | 19 | 1030016 | 1112685 | 10396 | 1123081 | 175.196 | 273.372 | 1 | 18 | 1699328 | 1739827 | 6459 | 1746286 | 55.769 | 176.166 | 1 | 13 | 2729344 | 2852512 | 16855 | 2869367 | 230.965 | 449.538 | 2 | 31 | 33.33% | 1/3 | 0/19 | 0.0% | 8.5 | AI chỉ sinh 2 file Frontend (`PreJoinPreview.tsx`, `sessionJoin.ts`), bỏ quên toàn bộ Backend (`0/19` BR), khiến `BF-1` & `AF-1` lỗi (`33.33%` Flow). |
| 3 | UC-08 | View Session Participants | Trung bình | 7 | 943488 | 1029770 | 8449 | 1038219 | 139.403 | 231.063 | 1 | 17 | 2693120 | 2736236 | 9015 | 2745251 | 131.855 | 243.415 | 1 | 20 | 3636608 | 3766006 | 17464 | 3783470 | 271.258 | 474.478 | 2 | 37 | 100.0% | 3/3 | 4/3 | 57.14% | 5.5 | Hoàn thành `API-PARTICIPANT-LIST` (`4/7` BR, `3/3` Flow), nhưng bỏ sót chưa cài đặt endpoint `API-SESSION-STATE` (`SessionService::readState`) cho `BR-VSP-04..06`. |
| 4 | UC-09 | Send a Chat Message | Trung bình | 9 | 1154944 | 1241195 | 9171 | 1250366 | 144.764 | 245.746 | 1 | 21 | 2034560 | 2076949 | 9139 | 2086088 | 147.491 | 230.323 | 1 | 15 | 3189504 | 3318144 | 18310 | 3336454 | 292.255 | 476.069 | 2 | 36 | 100.0% | 3/3 | 7/2 | 77.78% | 5.0 | Phần gửi tin nhắn (`send`) chuẩn 6/6 BR; phần đọc (`list`) thiếu check `JOINED` (`BR-SCM-07`) và check `session.status <> ENDED` (`BR-SCM-08`). Đạt `3/3` Flow. |
| 5 | UC-10 | Send an Emoji Reaction | Dễ | 7 | 1104896 | 1191358 | 8336 | 1199694 | 172.511 | 245.172 | 1 | 21 | 2981632 | 3025234 | 11412 | 3036646 | 193.091 | 284.316 | 1 | 22 | 4086528 | 4216592 | 19748 | 4236340 | 365.602 | 529.488 | 2 | 43 | 100.0% | 3/3 | 7/0 | 100.0% | 3.5 | AI cài đặt chính xác 100% cả Backend (`7/7` BR: transaction `SERIALIZABLE`, `Idempotency-Key`, sequence) lẫn luồng (`3/3` Flow) ngay lần đầu. |
| 6 | UC-03 | Start a Live Stream | Khó | 9 | 688512 | 761419 | 7348 | 768767 | 103.486 | 211.069 | 1 | 14 | 2459520 | 2500887 | 8608 | 2509495 | 95.842 | 231.148 | 1 | 20 | 3148032 | 3262306 | 15956 | 3278262 | 199.328 | 442.217 | 2 | 34 | 100.0% | 3/3 | 7/2 | 77.78% | 7.5 | Phần `start` (`BR-SLS-01..07`) cài đặt chuẩn, nhưng thiếu hàm/endpoint callback `ProviderCompletion` (`LiveStreamService::complete`) cho `BR-SLS-08..09`. Đạt `3/3` Flow. |

## 6. Cơ sở Ước tính Thời gian Lập trình Thủ công (`Manual Coding Time Estimate in Hours`)

Ước tính dựa trên năng suất của một kỹ sư phần mềm có kinh nghiệm (Expert: NestJS + TypeORM + MySQL + React), code độc lập theo đúng kiến trúc hệ thống hiện tại để đáp ứng **100% Business Rules (OCL preconditions/postconditions, locking, idempotency, validation)** và **100% Flows (Basic, Alternative, Exception)** kèm thời gian tự kiểm thử API/luồng:

- **UC-01 (2.5 giờ — Dễ, 7 BRs):** Xử lý trạng thái pre-join preview, kiểm tra quyền camera/mic (`GRANTED`/`DENIED`), ràng buộc sẵn sàng theo vai trò (`VIEWER` vs `HOST`/`BROADCASTER`), validate tên hiển thị (trim 1–50 ký tự) và test các nhánh lỗi quyền.
- **UC-10 (3.5 giờ — Dễ, 7 BRs):** Xây dựng endpoint `POST /reactions` với `SessionAuthGuard`, transaction `SERIALIZABLE` khóa `sessions`, cơ chế `Idempotency-Key` 24 giờ, tăng `sequence = version + 1`, tích hợp `API-SESSION-STATE` và kiểm thử đủ 7 BR.
- **UC-09 (5.0 giờ — Trung bình, 9 BRs):** Xây dựng 2 endpoint `POST /chat/messages` (transaction `SERIALIZABLE`, `Idempotency-Key`, validate 1–1000 ký tự, `sequence`) và `GET /chat/messages` (kiểm tra `JOINED`, `status <> ENDED`, keyset pagination có chữ ký HMAC-SHA256) cùng client giữ nguyên draft khi lỗi.
- **UC-08 (5.5 giờ — Trung bình, 7 BRs):** Xây dựng 2 endpoint đọc phức tạp gồm `GET /participants` (keyset pagination theo `(joined_at, id)` ký HMAC) và `GET /state` (`API-SESSION-STATE` tổng hợp snapshot từ nhiều bảng: `session`, `selfParticipant`, `stream`, `recording`, `share`, `media`, `view`, `stageRequests` lọc theo role, `reactions` cursor).
- **UC-03 (7.5 giờ — Khó, 9 BRs):** Xây dựng state machine 2 pha cho live stream: `start` (khóa `SERIALIZABLE`, kiểm tra `HOST`, `LIVE_STREAM`, `READY`, optimistic `expectedVersion`, chuyển `STARTING` + idempotency) và `complete` (`ProviderCompletion` webhook/callback có xác thực provider, khóa session, chuyển `LIVE`/`READY`, đồng bộ `stream.version` & `session.version`) cùng kiểm thử xung đột concurrency.
- **UC-02 (8.5 giờ — Khó, 19 BRs):** UC có bề mặt luật nghiệp vụ lớn nhất (19 BRs): cài đặt `SessionAuthGuard` (JWT), `MutationGateway` `SERIALIZABLE` (`FOR UPDATE`), kiểm tra trùng lặp & sức chứa (`1000` cho `LIVE_STREAM`, `100` cho `VIDEO_CONFERENCE`), suy luận role/mic/cam theo loại phiên, tự động mở phòng `LOBBY -> LIVE` cho Host, kiểm tra `virtual_background` active, khởi tạo nguyên tử 3 bảng (`participants`, `media_preferences`, `view_preferences`), `Idempotency-Key` 24h replay/conflict không sinh side-effect khi replay/reject, và kiểm thử toàn diện 19 BR.
