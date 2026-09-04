# Hướng dẫn đồng bộ và Cập nhật Use Cases vào Google Sheet

- **Spreadsheet ID:** `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- **Spreadsheet URL:** [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0)
- **Tab:** `Use cases`
- **Phạm vi cột:** Cột `A` (Tên trường) và Cột `B` (Nội dung)

---

## 1. Bảng tra cứu dải ô (Cell Ranges) của 16 Use Cases

| Mã UC | Tên Use Case | Tệp tin đặc tả | Dải ô trong Sheet | Tình trạng cập nhật |
| :---: | :--- | :--- | :---: | :---: |
| **UC-01** | Register an Account | `uc-01-register-account.md` | `A5:B25` | Nguyên bản |
| **UC-02** | Login | `uc-02-login.md` | `A26:B44` | Nguyên bản |
| **UC-03** | View Transaction History | `uc-03-view-transaction-history.md` | `A45:B63` | **Đã Sanitize & Upgrade BR-TXN-01..07** |
| **UC-04** | Create a Transaction | `uc-04-create-transaction.md` | `A64:B82` | **Đã Sanitize & Upgrade BR-TXN-08..15** |
| **UC-05** | View Bank Accounts | `uc-05-view-bank-accounts.md` | `A83:B105` | Nguyên bản |
| **UC-06** | Add a Bank Account | `uc-06-add-bank-account.md` | `A106:B130` | Nguyên bản |
| **UC-07** | View Bank Account Details | `uc-07-view-bank-account-details.md` | `A131:B152` | Nguyên bản |
| **UC-08** | Edit Bank Account | `uc-08-edit-bank-account.md` | `A153:B199` | Nguyên bản |
| **UC-09** | Delete Bank Account | `uc-09-delete-bank-account.md` | `A200:B218` | Nguyên bản |
| **UC-10** | View Monthly Expense Summary | `uc-10-view-monthly-expense-summary.md` | `A219:B237` | Nguyên bản |
| **UC-11** | View Expenses by Category | `uc-11-view-expenses-by-category.md` | `A238:B256` | Nguyên bản |
| **UC-12** | View Upcoming Bills | `uc-12-view-upcoming-bills.md` | `A257:B275` | Nguyên bản |
| **UC-13** | View Financial Goals | `uc-13-view-financial-goals.md` | `A276:B294` | Nguyên bản |
| **UC-14** | Create a Financial Goal | `uc-14-create-financial-goal.md` | `A295:B313` | **Đã Sanitize & Upgrade BR-GOAL-04..11** |
| **UC-15** | Adjust a Financial Goal | `uc-15-adjust-financial-goal.md` | `A314:B331` | **Đã Sanitize & Upgrade BR-GOAL-12..17** |
| **UC-16** | View Savings Summary | `uc-16-view-savings-summary.md` | `A332:B351` | **Đã Sanitize & Upgrade BR-SAV-01..09** |

---

## 2. Dữ liệu xuất sẵn để Import hoặc Copy-Paste hàng loạt

Toàn bộ nội dung 16 Use Case đã được trích xuất thành tệp dữ liệu dạng bảng phân cách bằng tab (TSV):
- **Đường dẫn tệp TSV:** [`docs/00-context/sources/ALL_USE_CASES_GOOGLE_SHEET_EXPORT.tsv`](file:///D:/business-vibe-coding/docs/00-context/sources/ALL_USE_CASES_GOOGLE_SHEET_EXPORT.tsv)
- Tệp này gồm 2 cột chính tương ứng với Cột A và Cột B của Google Sheet. Bạn có thể mở tệp này bằng Excel hoặc Text Editor, bôi đen toàn bộ và dán thẳng vào Google Sheet từ ô `A5`.

---

## 3. Nội dung cập nhật chi tiết cho UC-16 (Ô A332:B347)

Dưới đây là nội dung tương ứng từng dòng trong dải ô `A332:B347` của **UC-16** vừa được nâng cấp:

- **Ô A332:** `Use Case ID`  
  **Ô B332:** `UC-16`

- **Ô A333:** `Use Case Name`  
  **Ô B333:** `View Savings Summary`

- **Ô A334:** `Description`  
  **Ô B334:** `As an authenticated user, I want to compare monthly net savings for a selected year with the previous year.`

- **Ô A335:** `Actor(s)`  
  **Ô B335:** `Authenticated User`

- **Ô A336:** `Priority`  
  **Ô B336:** `Not Specified`

- **Ô A337:** `Trigger`  
  **Ô B337:** `The user opens the Goals page or changes the year selector in Saving Summary.`

- **Ô A338:** `Pre-Condition(s)`  
  **Ô B338:**  
  ```text
  PRE-1: The user is authenticated.
  PRE-2: The savings summary interface is accessible to the authenticated user.
  ```

- **Ô A339:** `Post-Condition(s)`  
  **Ô B339:**  
  ```text
  POST-1: On success, the system presents monthly net savings comparison data between the evaluated year and the preceding year, and the frontend renders the corresponding visual chart.
  POST-2: If no data is available for the specified period, an appropriate empty-state notification is displayed.
  POST-3: System state and financial records remain unchanged (read-only query operation).
  ```

- **Ô A340:** `Basic Flow`  
  **Ô B340:**  
  ```text
  1. The user navigates to the savings summary section on the Goals page.
  2. The frontend requests savings summary data for the initial target year (GET /api/v1/savings/summary).
  3. The backend authenticates the request and validates query parameters according to established business rules.
  4. The backend evaluates transaction records belonging to the authenticated user.
  5. The backend compiles monthly net savings figures for the target year.
  6. The backend computes comparative savings metrics for the preceding year.
  7. The backend returns the compiled savings summary response.
  8. The frontend renders the comparative chart displaying the target and preceding year data series.
  ```

- **Ô A341:** `Alternative Flow`  
  **Ô B341:**  
  ```text
  AF-1: Select another year
  2a. The user selects a different year from the year selector.
  2b. The frontend requests savings summary data for the newly selected year.

  AF-2: Empty savings data
  5a. If no transactions or accounts exist for the evaluated periods, the backend returns empty summary datasets.
  8a. The frontend displays an empty-state message indicating no transaction data is available instead of the chart.
  ```

- **Ô A342:** `Exception Flow`  
  **Ô B342:**  
  ```text
  EF-1: Unauthorized request
  3a. If authentication is missing or invalid, the backend rejects the request (HTTP 401) and the user is prompted to authenticate.

  EF-2: Service or calculation failure
  4a. If an unexpected error occurs during data retrieval or calculation, the backend returns an error response (HTTP 500) and the frontend displays a failure notification.
  ```

- **Ô A343:** `Related UI`  
  **Ô B343:** `GoalsPage; SavingsSummaryChart; year selector`

- **Ô A344:** `Related API IDs`  
  **Ô B344:** `API-SAVINGS-SUMMARY`

- **Ô A345:** `Notes`  
  **Ô B345:** `Scope clarification: This use case handles viewing and comparing annual monthly net savings summaries. Modifying transaction entries, updating account balances, or configuring budget limits are outside scope.`

- **Ô A346:** `UML Model`  
  **Ô B346:**  
  *(Dán toàn bộ mã nguồn PlantUML của UC-16)*

- **Ô A347:** `Business Rules`  
  **Ô B347:**  
  *(Dán toàn bộ nội dung 9 Business Rules BR-SAV-01 đến BR-SAV-09)*