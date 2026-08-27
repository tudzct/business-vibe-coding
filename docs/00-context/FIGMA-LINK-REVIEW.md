# Figma Link Review for 16 Use Cases

## Mục đích và cách sử dụng

File này là **downstream review/mapping input**. Không chỉnh sửa 16 file use case bất biến trong `docs/01-inception/use-cases/`.

Người nghiên cứu đã xác nhận các URL chuẩn trong cột **Replacement URL** và phần occurrence bên dưới. Đây là nguồn mapping chuẩn cho Codex; không đọc lại file key cũ từ UC bất biến để thay thế các giá trị này. `NOT_APPLICABLE` có nghĩa UC nguồn không cung cấp thiết kế Figma.

Ngày 2026-08-27, người nghiên cứu đã thay thế mapping của UC-01 bằng URL Figma `VibeTesting` bên dưới. Mapping này áp dụng cho frozen UC hiện tại `docs/01-inception/use-cases/uc-01-register-account.md`, có đặc tả nguồn tại `Use cases!A5:B25`. Figma connector chưa trả về frame context trong phiên này vì Figma Desktop không có layer được chọn; file key và node ID được lấy trực tiếp từ URL do người nghiên cứu cung cấp. Cùng ngày, mapping Login đã được xác nhận trước đây được gán lại cho frozen UC hiện tại `docs/01-inception/use-cases/uc-02-login.md`, có đặc tả nguồn tại `Use cases!A26:B44`.

Sau khi review hoàn tất, Codex sẽ:

1. Kiểm tra từng replacement URL bằng Figma plugin.
2. Xác nhận file key, node ID, tên frame và khả năng truy cập.
3. Tạo frozen design dataset có provenance và checksum.
4. Tạo skill ánh xạ UC nguồn bất biến sang dataset; không sửa UC gốc.

## Danh sách tổng hợp

| UC | Use case | Source UC | Current file key | Current node ID | Số lần xuất hiện | Replacement URL | Review status / note |
|---|---|---|---|---|---:|---|---|
| UC-001 | Register an Account | `docs/01-inception/use-cases/uc-01-register-account.md` | `BTSOvEnU2X3CNrNvSxX9Ry` | `66:4728` | 0 (external mapping) | `https://www.figma.com/design/BTSOvEnU2X3CNrNvSxX9Ry/Finebank---Financial-Management-Dashboard-UI-Kits--Community---VibeTesting-?node-id=66-4728&p=f&t=LTofk7XE4yZcHPBU-0` | Researcher-supplied replacement for current UC-01; capture the node into a new frozen dataset before frontend generation or UI audit. |
| UC-002 | Log In | `docs/01-inception/use-cases/uc-02-login.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `137:7477` | 0 (external mapping) | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=137-7477&t=t5xq1zzdRdWbBQza-0` | Previously researcher-confirmed Login mapping, retargeted to current UC-02; capture the node into a new frozen dataset before frontend generation or UI audit. |
| UC-003 | View the list of transactions | `docs/01-inception/use-cases/uc-03-view-transaction-list.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5474` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5474&t=JIvgR8yO5kRKVT0b-0` | URL chuẩn đã được người nghiên cứu xác nhận. |
| UC-004 | Add a new transaction | `docs/01-inception/use-cases/uc-04-create-new-transaction.md` | — | — | 0 | `NOT_APPLICABLE` | UC nguồn không chứa URL Figma. |
| UC-005 | View list of bank accounts | `docs/01-inception/use-cases/uc-05-view-user-account-list.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5320` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5320&t=JIvgR8yO5kRKVT0b-0` | URL chuẩn đã được người nghiên cứu xác nhận. |
| UC-006 | Add a new account | `docs/01-inception/use-cases/uc-06-add-new-account.md` | — | — | 0 | `NOT_APPLICABLE` | UC nguồn không chứa URL Figma. |
| UC-007 | Edit account | `docs/01-inception/use-cases/uc-07-edit-account-information.md` | — | — | 0 | `NOT_APPLICABLE` | UC nguồn không chứa URL Figma. |
| UC-008 | Delete bank account | `docs/01-inception/use-cases/uc-08-delete-account-and-related-transactions.md` | — | — | 0 | `NOT_APPLICABLE` | UC nguồn không chứa URL Figma. |
| UC-009 | View Bank Account Details | `docs/01-inception/use-cases/uc-09-view-account-details.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `416:7878` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-7878&t=JIvgR8yO5kRKVT0b-0` | URL chuẩn đã được người nghiên cứu xác nhận. |
| UC-010 | View Monthly Expenses | `docs/01-inception/use-cases/uc-10-view-monthly-expenses.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5698` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0` | URL chuẩn xác nhận dùng chung node với UC-011. |
| UC-011 | View Expenditure Details by Category | `docs/01-inception/use-cases/uc-11-view-expense-details-by-category.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5698` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0` | URL chuẩn xác nhận dùng chung node với UC-010. |
| UC-012 | View Upcoming Invoices List | `docs/01-inception/use-cases/uc-12-view-upcoming-bills-list.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5609` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5609&t=JIvgR8yO5kRKVT0b-0` | URL chuẩn đã được người nghiên cứu xác nhận. |
| UC-013 | View the list of Goals | `docs/01-inception/use-cases/uc-13-view-goals-list.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5829` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0` | URL chuẩn xác nhận dùng chung node với UC-016. |
| UC-014 | Create a New Goal | `docs/01-inception/use-cases/uc-14-create-new-goal.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `416:6052` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-6052&t=JIvgR8yO5kRKVT0b-0` | URL chuẩn đã được người nghiên cứu xác nhận. |
| UC-015 | Adjust Monthly Goals | `docs/01-inception/use-cases/uc-15-adjust-goal.md` | — | — | 0 | `NOT_APPLICABLE` | UC nguồn không chứa URL Figma. |
| UC-016 | View Savings Summary Chart | `docs/01-inception/use-cases/uc-16-view-savings-summary-chart.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5829` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0` | URL chuẩn xác nhận dùng chung node với UC-013. |

## URL hiện có theo đúng từng occurrence

Các URL dưới đây là URL chuẩn thay thế theo đúng từng occurrence do người nghiên cứu xác nhận. Chúng không khẳng định nội dung file UC bất biến đã được sửa. Bảng tổng hợp và danh sách này phải cùng file key/node ID; khi token `t` khác nhau, file key và node ID là định danh ánh xạ.

### UC-001

- Frozen UC hiện tại không chứa occurrence URL Figma. Researcher đã cung cấp replacement mapping ngoài UC:
  `https://www.figma.com/design/BTSOvEnU2X3CNrNvSxX9Ry/Finebank---Financial-Management-Dashboard-UI-Kits--Community---VibeTesting-?node-id=66-4728&p=f&t=LTofk7XE4yZcHPBU-0`

### UC-002

- Frozen UC hiện tại không chứa occurrence URL Figma. Mapping Login đã được researcher xác nhận trước đây được gán lại ngoài UC:
  `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=137-7477&t=t5xq1zzdRdWbBQza-0`

### UC-003

- Dòng 53: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5474&t=JIvgR8yO5kRKVT0b-0`
- Dòng 170: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5474&t=JIvgR8yO5kRKVT0b-0`

### UC-004

- Không có URL Figma trong UC nguồn.

### UC-005

- Dòng 48: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5320&t=JIvgR8yO5kRKVT0b-0`
- Dòng 139: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5320&t=JIvgR8yO5kRKVT0b-0`

### UC-006

- Không có URL Figma trong UC nguồn.

### UC-007

- Không có URL Figma trong UC nguồn.

### UC-008

- Không có URL Figma trong UC nguồn.

### UC-009

- Dòng 52: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-7878&t=JIvgR8yO5kRKVT0b-0`
- Dòng 161: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-7878&t=JIvgR8yO5kRKVT0b-0`

### UC-010

- Dòng 50: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0`
- Dòng 120: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0`

### UC-011

- Dòng 46: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0`
- Dòng 139: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0`

### UC-012

- Dòng 45: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5609&t=JIvgR8yO5kRKVT0b-0`
- Dòng 133: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5609&t=JIvgR8yO5kRKVT0b-0`

### UC-013

- Dòng 47: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0`
- Dòng 144: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0`

### UC-014

- Dòng 48: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-6052&t=JIvgR8yO5kRKVT0b-0`
- Dòng 135: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-6052&t=JIvgR8yO5kRKVT0b-0`

### UC-015

- Không có URL Figma trong UC nguồn.

### UC-016

- Dòng 45: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0`
- Dòng 126: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0`

## Điều kiện để bắt đầu tạo dataset

- Tất cả 16 UC đã có replacement URL hợp lệ hoặc `NOT_APPLICABLE` có chủ ý.
- Mỗi replacement URL phải chứa exact `fileKey` và `node-id`; không dùng file-only URL.
- Các cặp dùng chung node (`UC-010/011`, `UC-013/016`) đã được xác nhận theo URL chuẩn.
- Dataset chỉ được tạo từ URL replacement đã kiểm tra, không tự fallback về URL inaccessible trong UC.
- Không lưu cookie, OAuth token hoặc credential Figma trong repository.
