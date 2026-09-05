---
artifact_type: api-contract
status: Frozen
api_id: API-GOAL-CREATE
related_uc_id: UC-14
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "API contract"
source_range: "A274:B289"
retrieved_at: 2026-09-05T08:24:09.000Z
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

Create financial-goal data for the authenticated user's Goals workflow.

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
Description: Goal type supplied by the client.
Example: Saving

### category_id

Type: integer; Required: No; Nullable: Yes
Description: Optional category identifier supplied with the goal request.
Example: 3

### start_date

Type: string; Format: YYYY-MM-DD; Required: Yes; Nullable: No
Description: Goal start date supplied by the client.
Example: 2025-11-01

### end_date

Type: string; Format: YYYY-MM-DD; Required: Yes; Nullable: No
Description: Goal end date supplied by the client.
Example: 2025-11-30

### target_amount

Type: number; Format: decimal; Required: Yes; Nullable: No
Description: Goal target amount supplied by the client.
Example: 10000000

## Success Response — HTTP 201

### message

Type: string; Required: Yes; Nullable: No
Description: Creation success message.
Example: Goal created successfully

### goal_id

Type: integer; Required: Yes; Nullable: No
Description: Identifier returned for the created goal.
Example: 5

## Error Response — HTTP 400

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The submitted request is rejected as invalid under the applicable validation or business rules.
Description: Error description returned by the global HTTP exception filter.
Example: Invalid goal data.
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
Trigger: Goal creation cannot be completed because of an unexpected server, repository, or database failure.
Description: Error description returned by the global HTTP exception filter.
Example: Không thể tạo mục tiêu lúc này. Vui lòng thử lại sau.
Note: The error envelope also contains success=false and may contain an error field.

## Notes

Experiment classification:
- The API contract intentionally contains only endpoint structure, authentication requirements, request/response field shapes, and generic error contracts.
- UC-14 Business Rules are defined only in the Use cases sheet and are intentionally omitted from this API contract for ablation isolation.
- Request-field descriptions intentionally avoid restating category dependency, monetary precision, date-boundary, overlap-conflict, persistence, and atomicity semantics.
- The project-standard success/error response convention remains authoritative at the API level.
