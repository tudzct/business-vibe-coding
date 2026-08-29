---
artifact_type: api-contract
status: Frozen
api_id: API-GOAL-CREATE
related_uc_id: UC-14
---

# API-GOAL-CREATE: Create Financial Goal

## General Information

### API ID

API-GOAL-CREATE

### API Name

Create Financial Goal

### Related Use Case IDs

UC-14

### Method

POST

### Path

/api/v1/goals

### Description

Create a saving or expense-limit goal for the authenticated user.

### Authentication

Bearer JWT

### Authorization

Authenticated user

## Business Rules / Validation Constraints

- BR-GOAL-04: Valid Goal Type The goal type must be provided and must be either `Saving` or `Expense_Limit`.
- BR-GOAL-05: Positive Target Amount The target amount must be provided and must be greater than 0.
- BR-GOAL-06: Valid Goal Date Interval The start date and end date must be provided as valid dates in `YYYY-MM-DD` format. The end date must be later than the start date.
- BR-GOAL-07: Goal Category Rules An `Expense_Limit` goal must specify a category, and the selected category must exist in the system. A `Saving` goal does not use a category and must be stored with `categoryId = null`.
- BR-GOAL-08: Authenticated Goal Ownership A newly created goal must belong to the authenticated user identified by the validated JWT. The goal owner must not be determined from data supplied by the client.
- BR-GOAL-09: Created Goal Persistence When goal creation succeeds, exactly one new Goal record must be stored with the authenticated user ID, selected goal type, target amount, start date, end date, and the applicable category.
- BR-GOAL-10: Successful Goal Creation When a goal is created successfully, the API must return a success message and the identifier of the newly created goal. The returned goal identifier must correspond to a persisted goal owned by the authenticated user.
- BR-GOAL-11: Goal Creation Failure Handling Invalid goal type, target amount, date values, date ordering, or an invalid or missing category for an `Expense_Limit` goal must result in HTTP 400 and no Goal record must be created. If the goal cannot be stored because of an unexpected server or database error, the API must return HTTP 500. The current implementation does not prevent multiple `Saving` goals or duplicate `Expense_Limit` goals.

## Request Header(s)

### headers.Authorization

Type: string; Format: Bearer <JWT>; Required: Yes; Nullable: No
Validation: Must contain a valid, unexpired JWT access token.
Trigger: Every protected request.
Description: Authenticates the current user.
Example: Bearer eyJhbGciOiJIUzI1NiIs...
Note: Added by the frontend Axios interceptor.


### headers.Content-Type

Type: string; Format: MIME type; Required: Yes; Nullable: No
Default: application/json
Allowed values: application/json
Validation: Request body must be JSON.
Trigger: Every request containing a JSON body.
Description: Declares the request body format.
Example: application/json

## Request Body

### goal_type

Type: string; Required: Yes; Nullable: No
Allowed values: Saving; Expense_Limit
Validation: Must be Saving or Expense_Limit.
Trigger: Goal creation request.
Description: Goal type.
Example: Saving


### category_id

Type: integer; Required: Conditional; Nullable: Yes
Validation: Required and must reference an existing category when goal_type is Expense_Limit.
Trigger: Goal creation request.
Description: Category for an expense-limit goal.
Example: 3


### start_date

Type: string; Format: YYYY-MM-DD; Required: Yes; Nullable: No
Validation: Must be a valid date.
Trigger: Goal creation request.
Description: Goal start date.
Example: 2025-11-01


### end_date

Type: string; Format: YYYY-MM-DD; Required: Yes; Nullable: No
Validation: Must be a valid date later than start_date.
Trigger: Goal creation request.
Description: Goal end date.
Example: 2025-11-30


### target_amount

Type: number; Format: decimal; Required: Yes; Nullable: No
Validation: Must be greater than 0.
Trigger: Goal creation request.
Description: Target amount.
Example: 10000000

## Success Response — HTTP 201

### message

Type: string; Required: Yes; Nullable: No
Trigger: The goal is stored.
Description: Creation success message.
Example: Goal created successfully


### goal_id

Type: integer; Required: Yes; Nullable: No
Trigger: The goal is stored.
Description: Created goal identifier.
Example: 5

## Error Response — HTTP 400

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: Input validation fails, end_date is not after start_date, or an expense-limit category is missing or invalid.
Description: Error description returned by the global HTTP exception filter.
Example: target_amount phải lớn hơn 0.
Note: The error envelope also contains success=false and may contain an error field.

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
Trigger: The goal cannot be stored.
Description: Error description returned by the global HTTP exception filter.
Example: Không thể tạo mục tiêu lúc này. Vui lòng thử lại sau.
Note: The error envelope also contains success=false and may contain an error field.
