---
artifact_type: api-contract
status: Frozen
api_id: API-BILL-LIST
related_uc_id: UC-12
---

# API-BILL-LIST: List Upcoming Bills

## General Information

### API ID

API-BILL-LIST

### API Name

List Upcoming Bills

### Related Use Case IDs

UC-12

### Method

GET

### Path

/api/v1/bills

### Description

Return the authenticated user's bills whose due date is today or later.

### Authentication

Bearer JWT

### Authorization

Authenticated user

## Business Rules / Validation Constraints

- BR-BILL-01: Bill ownership scope The bill list shall contain only Bills whose userId equals the authenticated userId.
- BR-BILL-02: Upcoming date boundary Before querying bills, the backend shall create the current system date and reset its time to 00:00:00.000. Only Bills whose dueDate is greater than or equal to that normalized current date shall be returned.
- BR-BILL-03: Due-date ordering Returned Bills shall be ordered by dueDate in ascending order.
- BR-BILL-04: Response mapping and normalization Each returned row shall map the persisted billId, userId, itemDescription, and amount. amount shall be returned as a number. dueDate shall be formatted as YYYY-MM-DD. lastChargeDate shall be formatted as YYYY-MM-DD when present and returned as null when absent. logoUrl shall be returned as its stored non-empty value and as null when missing or empty.
- BR-BILL-05: Empty upcoming-bill result If the authenticated user has no Bills satisfying the upcoming-date condition, the API shall return HTTP 200 with data as an empty array.
- BR-BILL-06: Read-only list operation Listing upcoming Bills shall not create, update, or delete Bill records.
- BR-BILL-07: Retrieval failure handling If the bill repository query or response mapping fails, the backend shall return HTTP 500 Internal Server Error with the message "Failed to fetch bills".

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
Trigger: Bills are retrieved.
Description: Upcoming bills ordered by due date.
Example: []


### data[].billId

Type: integer; Required: Yes; Nullable: No
Trigger: Bills are retrieved.
Description: Bill identifier.
Example: 7


### data[].userId

Type: integer; Required: Yes; Nullable: No
Trigger: Bills are retrieved.
Description: Owner user identifier.
Example: 1


### data[].itemDescription

Type: string; Required: Yes; Nullable: No
Trigger: Bills are retrieved.
Description: Bill description.
Example: Netflix


### data[].logoUrl

Type: string; Required: Yes; Nullable: Yes
Trigger: Bills are retrieved.
Description: Optional logo URL.
Example: https://example.com/netflix.png


### data[].dueDate

Type: string; Format: date; Required: Yes; Nullable: No
Trigger: Bills are retrieved.
Description: Due date.
Example: 2025-11-15


### data[].lastChargeDate

Type: string; Format: date; Required: Yes; Nullable: Yes
Trigger: Bills are retrieved.
Description: Most recent charge date.
Example: 2025-10-15


### data[].amount

Type: number; Required: Yes; Nullable: No
Trigger: Bills are retrieved.
Description: Bill amount.
Example: 260000

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
Trigger: Bill retrieval fails.
Description: Error description returned by the global HTTP exception filter.
Example: Failed to fetch bills
Note: The error envelope also contains success=false and may contain an error field.
