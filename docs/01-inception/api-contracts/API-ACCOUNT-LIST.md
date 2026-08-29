---
artifact_type: api-contract
status: Frozen
api_id: API-ACCOUNT-LIST
related_uc_id: UC-05
---

# API-ACCOUNT-LIST: List User Accounts

## General Information

### API ID

API-ACCOUNT-LIST

### API Name

List User Accounts

### Related Use Case IDs

UC-05

### Method

GET

### Path

/api/v1/accounts

### Description

Return all bank accounts owned by the authenticated user.

### Authentication

Bearer JWT

### Authorization

Authenticated user

## Business Rules / Validation Constraints

- BR-AUTH-01 — JWT-protected operation: Protected controllers require JwtAuthGuard and obtain userId from the validated JWT payload.
- BR-ACC-01 — Account list ownership scope: The account list query shall return only accounts whose userId equals the authenticated userId.
- BR-ACC-02 — Ordering: Owned accounts shall be returned in ascending accountId order.
- BR-ACC-03 — Response rows map to persisted Accounts: The API response fields must map directly to the corresponding persisted account columns.
- BR-ACC-04 — Account number exposure and masking: The backend shall return only the stored account_number_last_4. The frontend shall mask the account number by prefixing these 4 digits with exactly four asterisks (e.g., **** 1234), regardless of the original length.
- BR-ACC-05 — Empty account result: If the user owns no accounts, the API shall return a success response with an empty array.
- BR-ACC-06 — Viewing accounts is read-only: Listing accounts shall not create, update, or delete any Account or Transaction records.

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
Trigger: The user is authenticated.
Description: Indicates successful retrieval.
Example: true

### message

Type: string; Required: Yes; Nullable: No
Trigger: The user is authenticated.
Description: Human-readable success message.
Example: Account list retrieved successfully.

### data.user_id

Type: integer; Required: Yes; Nullable: No
Trigger: The user is authenticated.
Description: Authenticated user identifier.
Example: 1

### data.accounts

Type: array<object>; Required: Yes; Nullable: No
Trigger: The user is authenticated.
Description: Array of accounts. May be empty.
Example: []

### data.accounts[].id

Type: integer; Required: Yes; Nullable: No
Trigger: The user is authenticated.
Description: Account identifier.
Example: 3

### data.accounts[].bank_name

Type: string; Required: Yes; Nullable: No
Trigger: The user is authenticated.
Description: Bank or financial institution name.
Example: Vietcombank

### data.accounts[].account_type

Type: string; Required: Yes; Nullable: No
Allowed values: Checking; Credit Card; Savings; Investment; Loan
Trigger: The user is authenticated.
Description: Account type.
Example: Checking

### data.accounts[].branch_name

Type: string; Required: Yes; Nullable: Yes
Trigger: The user is authenticated.
Description: Branch name.
Example: Hanoi Branch

### data.accounts[].account_number_last_4

Type: string; Required: Yes; Nullable: No
Trigger: The user is authenticated.
Description: Last four digits of the account number.
Example: 0123

### data.accounts[].balance

Type: number; Required: Yes; Nullable: No
Trigger: The user is authenticated.
Description: Current account balance.
Example: 4500000

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
Trigger: Account retrieval fails.
Description: Error description returned by the global HTTP exception filter.
Example: system error occurred. Please try again later.
Note: The error envelope also contains success=false and may contain an error field.
