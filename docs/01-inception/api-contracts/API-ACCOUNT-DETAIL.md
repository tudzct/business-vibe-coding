---
artifact_type: api-contract
status: Frozen
api_id: API-ACCOUNT-DETAIL
related_uc_id: UC-07
---

# API-ACCOUNT-DETAIL: Get Account Details

## General Information

### API ID

API-ACCOUNT-DETAIL

### API Name

Get Account Details

### Related Use Case IDs

UC-07

### Method

GET

### Path

/api/v1/accounts/:id

### Description

Return account details and recent transactions.

### Authentication

Bearer JWT

### Authorization

Authorized user

## Request Header(s)

### headers.Authorization

Type: string; Format: Bearer <JWT>; Required: Yes; Nullable: No
Trigger: Every protected request.
Description: Authenticates the current user.
Example: Bearer eyJhbGciOiJIUzI1NiIs...
Note: Added by the frontend Axios interceptor.

## Path Parameter(s)

### path.id

Type: integer; Required: Yes; Nullable: No
Trigger: Account detail request.
Description: Account identifier.
Example: 3

## Request Body

None

## Success Response — HTTP 200

### id

Type: integer; Required: Yes; Nullable: No
Trigger: The requested account is valid and accessible.
Description: Account identifier.
Example: 3


### bank_name

Type: string; Required: Yes; Nullable: No
Trigger: The requested account is valid and accessible.
Description: Bank name.
Example: Vietcombank


### account_type

Type: string; Required: Yes; Nullable: No
Allowed values: Checking; Credit Card; Savings; Investment; Loan
Trigger: The requested account is valid and accessible.
Description: Account type.
Example: Checking


### branch_name

Type: string; Required: Yes; Nullable: Yes
Trigger: The requested account is valid and accessible.
Description: Branch name.
Example: Hanoi Branch


### account_number_full

Type: string; Required: Yes; Nullable: No
Trigger: The requested account is valid and accessible.
Description: Full account number.
Example: 9704221234567890123


### balance

Type: number; Required: Yes; Nullable: No
Trigger: The requested account is valid and accessible.
Description: Current balance.
Example: 4500000


### recent_transactions

Type: array<object>; Required: Yes; Nullable: No
Trigger: The requested account is valid and accessible.
Description: List of recent transactions.
Example: []


### recent_transactions[].date

Type: string; Required: Yes; Nullable: No
Trigger: The requested account is valid and accessible.
Description: Transaction date.
Example: 2025-11-01


### recent_transactions[].amount

Type: number; Required: Yes; Nullable: No
Trigger: The requested account is valid and accessible.
Description: Transaction amount.
Example: 150000


### recent_transactions[].description

Type: string; Required: Yes; Nullable: No
Trigger: The requested account is valid and accessible.
Description: Transaction description.
Example: Movie Ticket


### recent_transactions[].status

Type: string; Required: Yes; Nullable: No
Allowed values: Complete; Pending; Failed
Trigger: The requested account is valid and accessible.
Description: Transaction status.
Example: Complete


### recent_transactions[].receipt_id

Type: string; Required: Yes; Nullable: Yes
Trigger: The requested account is valid and accessible.
Description: Receipt identifier.
Example: null


### recent_transactions[].type

Type: string; Required: Yes; Nullable: No
Allowed values: Revenue; Expense
Trigger: The requested account is valid and accessible.
Description: Transaction type.
Example: Expense

## Error Response — HTTP 400

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The provided account ID format is invalid.
Description: Error description returned by the global HTTP exception filter.
Example: Invalid account identifier.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 401

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The authentication token is missing or invalid.
Description: Error description returned by the global HTTP exception filter.
Example: Please log in to access account services.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 403

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The user lacks permission to view this specific account.
Description: Error description returned by the global HTTP exception filter.
Example: You do not have permission to view this account details.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 404

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The requested bank account does not exist.
Description: Error description returned by the global HTTP exception filter.
Example: Account not found.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 500

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The system encountered an error while fetching account transactions.
Description: Error description returned by the global HTTP exception filter.
Example: A banking system error occurred. Please try again later.
Note: The error envelope also contains success=false and may contain an error field.
