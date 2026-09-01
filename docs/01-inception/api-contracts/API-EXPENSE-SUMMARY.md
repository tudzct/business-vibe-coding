---
artifact_type: api-contract
status: Frozen
api_id: API-EXPENSE-SUMMARY
related_uc_id: UC-10
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "API contract"
source_range: "A206:B221"
retrieved_at: 2026-08-31T02:49:48.000Z
---

# API-EXPENSE-SUMMARY: Get Monthly Expense Summary

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab `API contract`, range `A206:B221`. This frozen repository projection was refreshed from the source on 2026-08-31.

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

Return a monthly expense summary for visualization.

### Authentication

Bearer JWT

### Authorization

Authenticated user

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

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "month": "string",
      "totalExpense": "number"
    }
  ]
}
```

### data

Type: array<object>; Required: Yes; Nullable: No
Description: Monthly expense summary data.
Example: []

### data[].month

Type: string; Required: Yes; Nullable: No
Example: Aug

### data[].totalExpense

Type: number; Required: Yes; Nullable: No
Description: Expense amount represented for the returned month.
Example: 160000

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

## Notes

Experiment classification:
- BR-EXP-01 through BR-EXP-07 are the treatment-sensitive Business Rules used for the core Business Rule effectiveness score.
- The current-month color treatment is a Figma-derived UI requirement and is not a core Business Rule.
- Read-only behavior is redundantly constrained by the GET method.
- The successful response envelope is project-constrained by PROJECT_CONTEXT.md and AGENTS.md.
