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

## Business Rules / Validation Constraints

- BR-AUTH-01 - JWT-protected operation Protected controllers require JwtAuthGuard and obtain userId from the validated JWT payload.
- BR-ACC-07 - Allowed account type The account_type field must be one of the explicitly allowed enum values ('Checking', 'Credit Card', 'Savings', 'Investment', 'Loan').
- BR-ACC-08 - Required account text fields The bank_name and account_number_full fields must be provided and cannot consist solely of whitespace characters.
- BR-ACC-09 - Numeric non-negative account balance The balance field must be a valid numeric type and must be greater than or equal to zero.
- BR-ACC-10 - Unique account number per owner The account_number_full must not already be associated with another account owned by the same authenticated user.
- BR-ACC-11 - Derive final four account characters The backend shall automatically extract and store the exact last 4 characters of the provided account_number_full.
- BR-ACC-12 - Account creation persistence mapping The provided account data shall be mapped and stored persistently under the authenticated userId, and the new account ID shall be returned.
- BR-ACC-13 - Account number format and length The account_number_full must contain only numeric digits and shall be between 8 and 34 characters in length.
- BR-ACC-14 - Optional branch name The branch_name field is optional; if omitted, the system shall store it as null or undefined without raising an error.

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

### bank_name

Type: string; Required: Yes; Nullable: No
Validation: Must be a non-empty string.
Trigger: Account creation request.
Description: Bank name.
Example: Vietcombank


### account_type

Type: string; Required: Yes; Nullable: No
Allowed values: Checking; Credit Card; Savings; Investment; Loan
Validation: Must be one of the allowed account types.
Trigger: Account creation request.
Description: Account type.
Example: Checking


### branch_name

Type: string; Required: No; Nullable: Yes
Validation: If supplied, must be a string.
Trigger: Account creation request.
Description: Optional branch name.
Example: Hanoi Branch


### account_number_full

Type: string; Required: Yes; Nullable: No
Validation: Must be a numeric string between 8 and 34 characters, and must be unique for the current user.
Trigger: Account creation request.
Description: Full account number.
Example: 9704221234567890123


### balance

Type: number; Format: decimal; Required: Yes; Nullable: No
Validation: Must be a number greater than or equal to 0.
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
Trigger: Request validation fails.
Description: Error description returned by the global HTTP exception filter.
Example: The balance must be greater than or equal to 0.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 401

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The JWT is missing, invalid, or expired.
Description: Error description returned by the global HTTP exception filter.
Example: Unauthorized
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 409

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The full account number already exists for the current user.
Description: Error description returned by the global HTTP exception filter.
Example: This account already exists in your account list.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 500

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The account cannot be stored.
Description: Error description returned by the global HTTP exception filter.
Example: Unable to add the account at this time. Please try again later.
Note: The error envelope also contains success=false and may contain an error field.
