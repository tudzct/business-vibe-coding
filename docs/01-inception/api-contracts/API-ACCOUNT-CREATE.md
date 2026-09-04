---
artifact_type: api-contract
status: Frozen
api_id: API-ACCOUNT-CREATE
related_uc_id: UC-06
---

# API-ACCOUNT-CREATE: Create Bank Account

## General Information

### API ID

API-ACCOUNT-CREATE

### API Name

Create Bank Account

### Related Use Case IDs

UC-06

### Method

POST

### Path

/api/v1/accounts

### Description

Create a new bank account owned by the authenticated user.

### Authentication

Bearer JWT

### Authorization

Authenticated user

## Request Header(s)

### headers.Authorization

Type: string; Format: Bearer <JWT>; Required: Yes; Nullable: No
Trigger: Every protected request.
Description: Authenticates the current user.
Example: Bearer eyJhbGciOiJIUzI1NiIs...
Note: Added by the frontend Axios interceptor.


### headers.Content-Type

Type: string; Format: MIME type; Required: Yes; Nullable: No
Default: application/json
Allowed values: application/json
Trigger: Every request containing a JSON body.
Description: Declares the request body format.
Example: application/json

## Request Body

### bank_name

Type: string; Required: Yes; Nullable: No
Trigger: Account creation request.
Description: Bank name.
Example: Vietcombank


### account_type

Type: string; Required: Yes; Nullable: No
Allowed values: Checking; Credit Card; Savings; Investment; Loan
Trigger: Account creation request.
Description: Account type.
Example: Checking


### branch_name

Type: string; Required: No; Nullable: Yes
Trigger: Account creation request.
Description: Optional branch name.
Example: Hanoi Branch


### account_number_full

Type: string; Required: Yes; Nullable: No
Trigger: Account creation request.
Description: Full account number.
Example: 9704221234567890123


### balance

Type: number; Format: decimal; Required: Yes; Nullable: No
Trigger: Account creation request.
Description: Initial balance.
Example: 4500000

## Success Response — HTTP 201

### message

Type: string; Required: Yes; Nullable: No
Trigger: The account is created.
Description: Creation success message.
Example: Account created successfully


### account.id

Type: integer; Required: Yes; Nullable: No
Trigger: The account is created.
Description: Created account identifier.
Example: 3


### account.user_id

Type: integer; Required: Yes; Nullable: No
Trigger: The account is created.
Description: Owner user identifier.
Example: 1


### account.bank_name

Type: string; Required: Yes; Nullable: No
Trigger: The account is created.
Description: Bank name.
Example: Vietcombank


### account.account_type

Type: string; Required: Yes; Nullable: No
Allowed values: Checking; Credit Card; Savings; Investment; Loan
Trigger: The account is created.
Description: Account type.
Example: Checking


### account.branch_name

Type: string; Required: Yes; Nullable: Yes
Trigger: The account is created.
Description: Branch name.
Example: Hanoi Branch


### account.account_number_last_4

Type: string; Required: Yes; Nullable: No
Trigger: The account is created.
Description: Derived last four digits.
Example: 0123


### account.balance

Type: number; Required: Yes; Nullable: No
Trigger: The account is created.
Description: Stored account balance.
Example: 4500000

## Error Response — HTTP 400

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: Request validation fails due to malformed payload or missing required fields.
Description: Error description returned by the global HTTP exception filter.
Example: Invalid input formatting or missing required parameters.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 401

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The JWT is missing, invalid, or expired.
Description: Error description returned by the global HTTP exception filter.
Example: Unauthorized access. Please log in again.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 403

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The authenticated user is denied access to perform the requested operation on this resource.
Description: Error description returned by the global HTTP exception filter.
Example: Forbidden. You do not have sufficient privileges to execute this action.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 409

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: A unique constraint violation occurred during data insertion.
Description: Error description returned by the global HTTP exception filter.
Example: The submitted resource conflicts with an existing record in the system.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 500

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: An unexpected server error prevents the resource from being saved.
Description: Error description returned by the global HTTP exception filter.
Example: An internal server error occurred while processing your request. Please try again later.
Note: The error envelope also contains success=false and may contain an error field.