---
artifact_type: api-contract
status: Frozen
api_id: API-ACCOUNT-DELETE
related_uc_id: UC-09
---

# API-ACCOUNT-DELETE: Delete Bank Account

## General Information

### API ID

API-ACCOUNT-DELETE

### API Name

Delete Bank Account

### Related Use Case IDs

UC-09

### Method

DELETE

### Path

/api/v1/accounts/:id

### Description

Delete an owned account and all transactions related to it.

### Authentication

Bearer JWT

### Authorization

Account owner

## Business Rules / Validation Constraints

- BR-AUTH-01 — JWT-protected operation: Protected controllers require JwtAuthGuard and obtain userId from the validated JWT payload.
- BR-ACC-27 — Account deletion ownership validation: Delete succeeds only for an owned account. A missing account and a non-owned account both produce the same HTTP 404 exception.
- BR-ACC-28 — Account deletion data integrity (Cascading): Related Transaction rows and the Account row shall be deleted within one TypeORM query-runner transaction.

## Request Header(s)

### headers.Authorization

Type: string; Format: Bearer <JWT>; Required: Yes; Nullable: No
Validation: Must contain a valid, unexpired JWT access token.
Trigger: Every protected request.
Description: Authenticates the current user.
Example: Bearer eyJhbGciOiJIUzI1NiIs...
Note: Added by the frontend Axios interceptor.

## Path Parameter(s)

### path.id

Type: integer; Required: Yes; Nullable: No
Validation: Must parse as an integer account identifier.
Trigger: Account deletion request.
Description: Account identifier.
Example: 3

## Request Body

None

## Success Response — HTTP 200

### message

Type: string; Required: Yes; Nullable: No
Trigger: The account exists and is owned by the user.
Description: Deletion success message.
Example: Account deleted successfully


### deleted_account_id

Type: integer; Required: Yes; Nullable: No
Trigger: The account exists and is owned by the user.
Description: Deleted account identifier.
Example: 3

## Error Response — HTTP 400

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The path ID is not a valid integer.
Description: Error description returned by the global HTTP exception filter.
Example: Invalid account ID.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 401

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The JWT is missing, invalid, or expired.
Description: Error description returned by the global HTTP exception filter.
Example: Unable to authenticate the user. Please log in again.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 404

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The account does not exist or is not owned by the current user.
Description: Error description returned by the global HTTP exception filter.
Example: Account not found or not owned by current user
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 500

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: Deleting the account or related transactions fails.
Description: Error description returned by the global HTTP exception filter.
Example: A system error occurred. The account and related transactions could not be deleted.
Note: The error envelope also contains success=false and may contain an error field.
