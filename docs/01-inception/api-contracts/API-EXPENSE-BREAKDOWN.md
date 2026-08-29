---
artifact_type: api-contract
status: Frozen
api_id: API-EXPENSE-BREAKDOWN
related_uc_id: UC-11
---

# API-EXPENSE-BREAKDOWN: Get Expense Breakdown by Category

## General Information

### API ID

API-EXPENSE-BREAKDOWN

### API Name

Get Expense Breakdown by Category

### Related Use Case IDs

UC-11

### Method

GET

### Path

/api/v1/expenses/breakdown

### Description

Return category totals, month-over-month changes, and transaction details for a selected month.

### Authentication

Bearer JWT

### Authorization

Authenticated user

## Business Rules / Validation Constraints

- BR-EXP-07: Authenticated ownership scope JwtAuthGuard shall validate the Bearer JWT and provide request.user.userId. Only Expense transactions whose accountId belongs to an Account owned by that user may contribute to the breakdown.
- BR-EXP-08: Breakdown month syntax query.month is required and shall match YYYY-MM (^\d{4}-\d{2}$). A missing or syntactically invalid value shall return HTTP 400.
- BR-EXP-09: Valid breakdown calendar month The MM portion shall be in 01..12. A syntactically valid value outside that range shall produce the service's HTTP 404 no-data response.
- BR-EXP-10: Eligible current-month expenses and no-data handling Only owned transactions with type = Expense and transactionDate within the selected calendar month, inclusively, are eligible. No status filter is applied. The service shall return HTTP 404 when the user owns no accounts or no eligible current-month rows exist.
- BR-EXP-11: Category grouping, totals, and detail mapping Eligible rows shall be grouped by categoryId. null categoryId shall map to Uncategorized; an unresolved non-null categoryId shall map to Unknown. total is the sum of group amounts. Each subCategories item maps itemDescription, amount, and transactionDate to item_description, numeric amount, and an ISO YYYY-MM-DD date.
- BR-EXP-12: Previous-month comparison changePercent = ((currentTotal - previousTotal) / previousTotal) * 100. If previousTotal = 0, changePercent is 100 when currentTotal > 0 and null otherwise. January compares with December of the preceding year.
- BR-EXP-13: Rounding and deterministic ordering Each total and non-null changePercent shall be rounded to two decimal places. Category groups shall be sorted by total descending; transaction details shall retain transactionDate ascending order.
- BR-EXP-14: Selected-month UI and Figma breakdown mapping The client shall initialize the picker to the current YYYY-MM value and refetch when it changes. Each result shall render as a Figma-aligned breakdown card showing category, total, comparison to last month, and transaction description, amount, and date. null changePercent displays N/A; loading, no-data, and error states replace the grid when applicable.
- BR-EXP-15: Read-only operation and response envelope The request shall not mutate Accounts, Transactions, or Categories. On HTTP 200 the endpoint returns exactly { data: BreakdownResult[] } without success or message fields.

## Request Header(s)

### headers.Authorization

Type: string; Format: Bearer <JWT>; Required: Yes; Nullable: No
Validation: Must contain a valid, unexpired JWT access token.
Trigger: Every protected request.
Description: Authenticates the current user.
Example: Bearer eyJhbGciOiJIUzI1NiIs...
Note: Added by the frontend Axios interceptor.

## Query Parameter(s)

### query.month

Type: string; Format: YYYY-MM; Required: Yes; Nullable: No
Validation: Must match YYYY-MM and represent a month from 01 to 12.
Trigger: Expense breakdown request.
Description: Selected month.
Example: 2025-11

## Request Body

None

## Success Response — HTTP 200

### data

Type: array<object>; Required: Yes; Nullable: No
Trigger: Expense data exists for the selected month.
Description: Category breakdown sorted by total descending.
Example: []


### data[].category

Type: string; Required: Yes; Nullable: No
Trigger: Expense data exists for the selected month.
Description: Category name; uncategorized records use Uncategorized.
Example: Entertainment


### data[].total

Type: number; Required: Yes; Nullable: No
Trigger: Expense data exists for the selected month.
Description: Total expense amount in the category.
Example: 1500000


### data[].changePercent

Type: number; Required: Yes; Nullable: Yes
Trigger: Expense data exists for the selected month.
Description: Percentage change from the previous month.
Example: 25.5


### data[].subCategories

Type: array<object>; Required: Yes; Nullable: No
Trigger: Expense data exists for the selected month.
Description: Underlying expense transactions.
Example: []


### data[].subCategories[].item_description

Type: string; Required: Yes; Nullable: No
Trigger: Expense data exists for the selected month.
Description: Transaction description.
Example: Movie Ticket


### data[].subCategories[].amount

Type: number; Required: Yes; Nullable: No
Trigger: Expense data exists for the selected month.
Description: Transaction amount.
Example: 150000


### data[].subCategories[].date

Type: string; Format: date; Required: Yes; Nullable: No
Trigger: Expense data exists for the selected month.
Description: Transaction date.
Example: 2025-11-01

## Error Response — HTTP 400

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: month is missing or does not match YYYY-MM.
Description: Error description returned by the global HTTP exception filter.
Example: Tham số month không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM (ví dụ: 2025-11)
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 401

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The JWT is missing, invalid, or expired.
Description: Error description returned by the global HTTP exception filter.
Example: Unauthorized
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 404

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The user has no account, the month is invalid, or no expense exists in the selected month.
Description: Error description returned by the global HTTP exception filter.
Example: Không có dữ liệu chi tiêu cho tháng này.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 500

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: Breakdown calculation fails.
Description: Error description returned by the global HTTP exception filter.
Example: Không thể lấy dữ liệu breakdown chi tiêu.
Note: The error envelope also contains success=false and may contain an error field.
