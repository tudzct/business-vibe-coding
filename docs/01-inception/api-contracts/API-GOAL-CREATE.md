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

Create a new financial goal record for the authenticated user.

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

Type: integer; Required: No; Nullable: Yes
Validation: When supplied, must be an integer category identifier.
Trigger: Goal creation request.
Description: Identifier of the category associated with the goal.
Example: 3


### start_date

Type: string; Format: YYYY-MM-DD; Required: Yes; Nullable: No
Validation: Must be a valid date.
Trigger: Goal creation request.
Description: Goal start date.
Example: 2025-11-01


### end_date

Type: string; Format: YYYY-MM-DD; Required: Yes; Nullable: No
Validation: Must be a valid date string formatted as YYYY-MM-DD.
Trigger: Goal creation request.
Description: Goal end date.
Example: 2025-11-30


### target_amount

Type: number; Format: decimal; Required: Yes; Nullable: No
Validation: Must be a valid positive number.
Trigger: Goal creation request.
Description: Target monetary amount for the financial goal.
Example: 10000000

## Success Response — HTTP 201

### message

Type: string; Required: Yes; Nullable: No
Trigger: The goal is successfully created.
Description: Creation success message.
Example: Goal created successfully


### goal_id

Type: integer; Required: Yes; Nullable: No
Trigger: The goal is successfully created.
Description: Created goal identifier.
Example: 5

## Error Response — HTTP 400

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: Request body fields fail validation or violate business constraints.
Description: Error description returned by the global HTTP exception filter.
Example: Invalid or missing goal data
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
Trigger: An unexpected server error occurs during processing.
Description: Error description returned by the global HTTP exception filter.
Example: Đã xảy ra lỗi hệ thống khi tạo mục tiêu. Vui lòng thử lại sau.
Note: The error envelope also contains success=false and may contain an error field.
