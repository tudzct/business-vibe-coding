---
artifact_type: api-contract
status: Frozen
api_id: API-GOAL-UPDATE
related_uc_id: UC-15
---

# API-GOAL-UPDATE: Update Financial Goal

## General Information

### API ID

API-GOAL-UPDATE

### API Name

Update Financial Goal

### Related Use Case IDs

UC-15

### Method

PUT

### Path

/api/v1/goals/:goalId

### Description

Update an existing financial goal for the authenticated user.

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

## Path Parameter(s)

### path.goalId

Type: integer; Required: Yes; Nullable: No
Validation: Must be a valid integer goal identifier.
Trigger: Every goal update request.
Description: Unique identifier of the financial goal.
Example: 5

## Request Body

### target_amount

Type: number; Format: decimal; Required: Yes; Nullable: No
Validation: Must be a valid positive number.
Trigger: Goal update request.
Description: Updated target monetary amount for the financial goal.
Example: 12000000

## Success Response — HTTP 200

### message

Type: string; Required: Yes; Nullable: No
Trigger: The goal is successfully updated.
Description: Update success message.
Example: Goal updated successfully


### updated_goal.goal_id

Type: integer; Required: Yes; Nullable: No
Trigger: The goal is successfully updated.
Description: Updated goal identifier.
Example: 5


### updated_goal.target_amount

Type: number; Required: Yes; Nullable: No
Trigger: The goal is successfully updated.
Description: Updated target amount.
Example: 12000000

## Error Response — HTTP 400

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: Request parameters or body fields fail validation or violate business constraints.
Description: Error description returned by the global HTTP exception filter.
Example: Invalid goal update data
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 401

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The JWT is missing, invalid, or expired.
Description: Error description returned by the global HTTP exception filter.
Example: Unauthorized
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 403

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The authenticated user is not authorized to modify the specified goal.
Description: Error description returned by the global HTTP exception filter.
Example: Forbidden resource
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 404

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The requested goal cannot be found.
Description: Error description returned by the global HTTP exception filter.
Example: Resource not found
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 500

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: An unexpected server error occurs during processing.
Description: Error description returned by the global HTTP exception filter.
Example: Đã xảy ra lỗi hệ thống khi cập nhật mục tiêu. Vui lòng thử lại sau.
Note: The error envelope also contains success=false and may contain an error field.
