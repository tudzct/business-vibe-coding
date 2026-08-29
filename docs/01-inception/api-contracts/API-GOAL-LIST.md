---
artifact_type: api-contract
status: Frozen
api_id: API-GOAL-LIST
related_uc_id: UC-13
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

Return the user's saving goal and current expense-limit goals with calculated progress.

### Authentication

Bearer JWT

### Authorization

Authenticated user

## Business Rules / Validation Constraints

- BR-GOAL-01: Goals selected for display The API shall return only goals owned by the authenticated user. It returns one Saving goal or null, and every Expense_Limit goal whose date interval overlaps the current month, where start_date <= endOfMonth and end_date >= startOfMonth. The current implementation uses findOne for Saving goals, so if multiple Saving goals exist, one matching goal is returned.
- BR-GOAL-02: Saving goal achieved amount If a Saving goal exists, target_achieved shall equal the authenticated user's total Revenue for the current month minus total Expense for the current month, calculated only from accounts owned by that user. If there are no owned accounts or no matching transactions, the corresponding totals are treated as 0.
- BR-GOAL-03: Expense-limit current expense For each returned Expense_Limit goal, current_expense shall equal the authenticated user's total current-month Expense for that goal's category, calculated only from accounts owned by that user. If there are no owned accounts or no matching transactions, current_expense is 0. The response category is the persisted category name; if the category cannot be resolved, the implementation returns "Unknown".

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
Trigger: Goal data is calculated.
Description: Indicates successful retrieval.
Example: true


### message

Type: string; Required: Yes; Nullable: No
Trigger: Goal data is calculated.
Description: Human-readable success message.
Example: Lấy danh sách mục tiêu thành công


### data.savingGoal

Type: object; Required: Yes; Nullable: Yes
Trigger: Goal data is calculated.
Description: Saving goal or null.
Example: null


### data.savingGoal.goal_id

Type: integer; Required: Yes; Nullable: No
Trigger: Goal data is calculated.
Description: Saving goal identifier.
Example: 2


### data.savingGoal.goal_type

Type: string; Required: Yes; Nullable: No
Allowed values: Saving
Trigger: Goal data is calculated.
Description: Saving goal type.
Example: Saving


### data.savingGoal.target_amount

Type: number; Required: Yes; Nullable: No
Trigger: Goal data is calculated.
Description: Saving target amount.
Example: 10000000


### data.savingGoal.target_achieved

Type: number; Required: Yes; Nullable: No
Trigger: Goal data is calculated.
Description: Current-month revenue minus expenses.
Example: 3500000


### data.savingGoal.start_date

Type: string; Format: date; Required: Yes; Nullable: No
Trigger: Goal data is calculated.
Description: Goal start date.
Example: 2025-11-01


### data.savingGoal.end_date

Type: string; Format: date; Required: Yes; Nullable: No
Trigger: Goal data is calculated.
Description: Goal end date.
Example: 2025-11-30


### data.expenseGoals

Type: array<object>; Required: Yes; Nullable: No
Trigger: Goal data is calculated.
Description: Active expense-limit goals for the current month.
Example: []


### data.expenseGoals[].goal_id

Type: integer; Required: Yes; Nullable: No
Trigger: Goal data is calculated.
Description: Expense goal identifier.
Example: 5


### data.expenseGoals[].category

Type: string; Required: Yes; Nullable: No
Trigger: Goal data is calculated.
Description: Category name.
Example: Food


### data.expenseGoals[].target_amount

Type: number; Required: Yes; Nullable: No
Trigger: Goal data is calculated.
Description: Expense limit.
Example: 3000000


### data.expenseGoals[].current_expense

Type: number; Required: Yes; Nullable: No
Trigger: Goal data is calculated.
Description: Current month's expense in the category.
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
Trigger: Goal retrieval or progress calculation fails.
Description: Error description returned by the global HTTP exception filter.
Example: Đã xảy ra lỗi hệ thống khi tải mục tiêu, vui lòng thử lại sau.
Note: The error envelope also contains success=false and may contain an error field.
