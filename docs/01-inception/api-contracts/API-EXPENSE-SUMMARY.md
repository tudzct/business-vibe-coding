---
artifact_type: api-contract
status: Frozen
api_id: API-EXPENSE-SUMMARY
related_uc_id: UC-10
---

# API-EXPENSE-SUMMARY: Get Monthly Expense Summary

## General Information

### API ID

API-EXPENSE-SUMMARY

### API Name

Get Monthly Expense Summary

### Related Use Case IDs

UC-10

### Method

GET

### Path

/api/v1/expenses/summary

### Description

Aggregate the current year's expense transactions by month.

### Authentication

Bearer JWT

### Authorization

Authenticated user

## Business Rules / Validation Constraints

- BR-EXP-01: Authenticated ownership scope JwtAuthGuard shall validate the Bearer JWT and provide request.user.userId. Only Transactions whose account_id belongs to an Accounts row with user_id equal to that authenticated identifier are eligible.
- BR-EXP-02: Current-year Expense inclusion and amount calculation The service shall include a transaction only when type = Expense and transaction_date is within the backend server's current calendar year, inclusively from 1 January 00:00:00 through 31 December 23:59:59. Transactions.status is not filtered: Complete, Pending, and Failed rows are all included when the other predicates match. Each returned totalExpense shall equal SUM(amount) for the eligible transactions in that month.
- BR-EXP-03: Sparse monthly aggregation and ordering The service shall group eligible transactions by MONTH(transaction_date), calculate totalExpense as SUM(amount), convert the total to a JavaScript number, and order results chronologically from Jan to Dec. The API shall return at most one item for each returned month and only months with at least one eligible transaction; it shall not generate missing months with totalExpense = 0.
- BR-EXP-04: Client-side full-year display Only when the API returns one or more summary items, ExpenseSummaryChart shall create a 12-month Jan-to-Dec display, preserve each returned month's totalExpense, and use totalExpense = 0 for every absent month.
- BR-EXP-05: Empty result and no-data UI If the authenticated user owns no accounts, or owns accounts but has no eligible current-year Expense transactions, the successful response shall be { "data": [] }. The frontend shall display its no-expense-data state instead of the chart.
- BR-EXP-06: Read-only operation and response envelope The endpoint shall not create, update, or delete Accounts or Transactions. On HTTP 200, ExpensesController shall return exactly { data: ExpenseSummaryItem[] }; unlike the general API convention, it shall not include success or message fields.

## Request Header(s)

### headers.Authorization

Type: string; Format: Bearer <JWT>; Required: Yes; Nullable: No
Validation: Must contain a valid, unexpired JWT access token.
Trigger: Every protected request.
Description: Authenticates the current user.
Example: Bearer eyJhbGciOiJIUzI1NiIs...
Note: Added by the frontend Axios interceptor.

## Request Body

None

## Success Response — HTTP 200

### data

Type: array<object>; Required: Yes; Nullable: No
Trigger: Expense data is aggregated.
Description: Monthly summary array; only months containing expenses are returned.
Example: []


### data[].month

Type: string; Required: Yes; Nullable: No
Trigger: Expense data is aggregated.
Description: English three-letter month abbreviation.
Example: Nov


### data[].totalExpense

Type: number; Required: Yes; Nullable: No
Trigger: Expense data is aggregated.
Description: Total expense amount for the month.
Example: 3500000

## Error Response — HTTP 401

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The JWT is missing, invalid, or expired.
Description: Error description returned by the global HTTP exception filter.
Example: Unauthorized
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 500

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: Expense aggregation fails.
Description: Error description returned by the global HTTP exception filter.
Example: Không thể lấy dữ liệu chi tiêu.
Note: The error envelope also contains success=false and may contain an error field.
