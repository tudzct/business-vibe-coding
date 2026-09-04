---
artifact_type: api-contract
status: Frozen
api_id: API-EXPENSE-BREAKDOWN
related_uc_id: UC-11
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "API contract"
source_range: "A222:B240"
retrieved_at: 2026-08-31T12:21:01.000Z
---

# API-EXPENSE-BREAKDOWN: Get Expense Breakdown by Category

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab `API contract`, range `A222:B240`. This frozen repository projection was refreshed from the source on 2026-08-31.

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

Return the authenticated user's expense breakdown by category for a selected month.

### Authentication

Bearer JWT

### Authorization

Authenticated user

## Business Rules / Validation Constraints

BR-EXP-CAT-01: Authenticated ownership scope

Only transactions associated with accounts owned by the authenticated user may contribute to the breakdown. The userId used for the operation must come from the validated JWT and must not be supplied or overridden by the client.

BR-EXP-CAT-02: Eligible selected-month expenses

Only transactions with type = Expense and transactionDate within the selected calendar month are eligible. Transaction status is not used as an eligibility condition.

BR-EXP-CAT-03: Category classification

Eligible transactions are grouped by categoryId. A null categoryId is classified as Uncategorized; an unresolved non-null categoryId is classified as Unknown; a resolved categoryId uses the corresponding Category.categoryName.

BR-EXP-CAT-04: Category totals and detail mapping

For each category group, total equals the sum of the eligible transaction amounts in that group. Each returned detail maps itemDescription, amount, and transactionDate to item_description, numeric amount, and an ISO YYYY-MM-DD date.

BR-EXP-CAT-05: Previous-month comparison

changePercent compares the current category total with the immediately preceding calendar month using ((currentTotal - previousTotal) / previousTotal) * 100. If previousTotal = 0, changePercent is 100 when currentTotal > 0 and null otherwise. January compares with December of the preceding year.

BR-EXP-CAT-06: Rounding and deterministic ordering

Each total and non-null changePercent is rounded to two decimal places. Category groups are ordered by total descending, and transaction details within each category are ordered by transaction date ascending.

BR-EXP-CAT-07: No-data outcome

If the authenticated user owns no accounts or no eligible Expense transaction exists for the selected month, the endpoint produces its configured no-data response and the frontend displays its no-data state.

Interface validation (not a core treatment-sensitive BR):

- query.month is required and must use YYYY-MM format.
- Missing or syntactically invalid month values return HTTP 400.
- A syntactically valid month whose MM portion is outside 01..12 follows the endpoint's configured invalid-month/no-data handling.

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
Validation: Must match YYYY-MM and identify the selected month for the breakdown request.
Trigger: Expense breakdown request.
Description: Month selected by the user.
Example: 2025-11

## Request Body

None

## Success Response — HTTP 200

```json
{
  "success": true,
  "message": "Expense breakdown retrieved successfully",
  "data": [
    {
      "category": "Entertainment",
      "total": 1500000,
      "changePercent": 25.5,
      "subCategories": [
        {
          "item_description": "Movie Ticket",
          "amount": 150000,
          "date": "2025-11-01"
        }
      ]
    }
  ]
}
```

### success

Type: boolean; Required: Yes; Nullable: No
Description: Indicates a successful request.
Example: true

### message

Type: string; Required: Yes; Nullable: No
Description: Success message following the project-wide API response convention.
Example: Expense breakdown retrieved successfully

### data

Type: array<object>; Required: Yes; Nullable: No
Description: Expense breakdown results for the selected month.
Example: []

### data[].category

Type: string; Required: Yes; Nullable: No
Description: Category label for the group.
Example: Entertainment

### data[].total

Type: number; Required: Yes; Nullable: No
Description: Total expense amount for the category group.
Example: 1500000

### data[].changePercent

Type: number; Required: Yes; Nullable: Yes
Description: Percentage change compared with the previous month.
Example: 25.5

### data[].subCategories

Type: array<object>; Required: Yes; Nullable: No
Description: Underlying transaction details for the category group.
Example: []

### data[].subCategories[].item_description

Type: string; Required: Yes; Nullable: No
Description: Transaction description.
Example: Movie Ticket

### data[].subCategories[].amount

Type: number; Required: Yes; Nullable: No
Description: Transaction amount.
Example: 150000

### data[].subCategories[].date

Type: string; Format: date; Required: Yes; Nullable: No
Description: Transaction date.
Example: 2025-11-01

## Error Response — HTTP 400

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: month is missing or does not satisfy the request format.
Description: Error description returned by the global HTTP exception filter.
Example: Tham số month không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM (ví dụ: 2025-11)
Note: The project error envelope also contains success=false and may contain an error field.

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
Trigger: No expense-breakdown data is available for the selected month under the applicable business rules, or the endpoint applies its configured invalid-month/no-data handling.
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

## Notes

Experiment classification:
- BR-EXP-CAT-01 through BR-EXP-CAT-07 are the treatment-sensitive Business Rules used for UC-11's core Business Rule effectiveness score.
- Month input syntax is part of the API interface contract and is not a core treatment-sensitive BR.
- Figma presentation requirements are UI evidence and are not part of the core Business Rule score.
- Read-only behavior is redundantly constrained by the GET method.
- The standard successful/error response envelope is project-constrained by the project-level API convention.
