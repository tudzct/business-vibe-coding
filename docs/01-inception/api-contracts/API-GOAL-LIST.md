---
artifact_type: api-contract
status: Frozen
api_id: API-GOAL-LIST
related_uc_id: UC-13
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "API contract"
source_range: "A258:B272"
retrieved_at: 2026-09-05T08:24:09.000Z
---

# API-GOAL-LIST: List Financial Goals

## General Information

### API ID

API-GOAL-LIST

### API Name

List Financial Goals

### Related Use Case IDs

UC-13

### Method

GET

### Path

/api/v1/goals

### Description

Return financial-goal data for the authenticated user's Goals view.

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

### success

Type: boolean; Required: Yes; Nullable: No
Description: Indicates a successful request.
Example: true

### message

Type: string; Required: Yes; Nullable: No
Description: Success message following the project-wide API response convention.
Example: Lấy danh sách mục tiêu thành công

### data.savingGoal

Type: object; Required: Yes; Nullable: Yes
Description: Saving-goal data when available.
Example: null

### data.savingGoal.goal_id

Type: integer; Required: Yes; Nullable: No
Description: Saving goal identifier.
Example: 2

### data.savingGoal.goal_type

Type: string; Required: Yes; Nullable: No
Allowed values: Saving
Description: Saving goal type.
Example: Saving

### data.savingGoal.target_amount

Type: number; Required: Yes; Nullable: No
Description: Saving target amount.
Example: 10000000

### data.savingGoal.target_achieved

Type: number; Required: Yes; Nullable: No
Description: Calculated achieved amount for the saving goal.
Example: 3500000

### data.savingGoal.start_date

Type: string; Format: date; Required: Yes; Nullable: No
Description: Saving goal start date.
Example: 2025-11-01

### data.savingGoal.end_date

Type: string; Format: date; Required: Yes; Nullable: No
Description: Saving goal end date.
Example: 2025-11-30

### data.expenseGoals

Type: array<object>; Required: Yes; Nullable: No
Description: Expense-goal items returned for the Goals view.
Example: []

### data.expenseGoals[].goal_id

Type: integer; Required: Yes; Nullable: No
Description: Expense goal identifier.
Example: 5

### data.expenseGoals[].category

Type: string; Required: Yes; Nullable: No
Description: Category label for the expense goal.
Example: Food

### data.expenseGoals[].target_amount

Type: number; Required: Yes; Nullable: No
Description: Expense-goal target amount.
Example: 3000000

### data.expenseGoals[].current_expense

Type: number; Required: Yes; Nullable: No
Description: Calculated expense amount for the expense goal.
Example: 1200000

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
Trigger: Goal retrieval or response processing fails.
Description: Error description returned by the global HTTP exception filter.
Example: Đã xảy ra lỗi hệ thống khi tải mục tiêu, vui lòng thử lại sau.
Note: The error envelope also contains success=false and may contain an error field.

## Notes

Experiment classification:
- The API contract intentionally contains only interface structure, authentication requirements, response fields, and error contracts.
- UC-13 Business Rules are defined only in the Use cases sheet and are intentionally omitted from this API contract for ablation isolation.
- The project-standard successful/error response envelope remains authoritative at the API level.
- Response-field descriptions intentionally avoid restating calculation, selection, filtering, fallback, and ordering semantics defined by UC-13 Business Rules.
