---
artifact_type: api-contract
status: Frozen
api_id: API-TRANSACTION-LIST
related_uc_id: UC-03
---

# API-TRANSACTION-LIST: List Transactions

## General Information

### API ID

API-TRANSACTION-LIST

### API Name

List Transactions

### Related Use Case IDs

UC-03

### Method

GET

### Path

/api/v1/transactions

### Description

Return the authenticated user's transactions with filtering and pagination.

### Authentication

Bearer JWT

### Authorization

Authenticated user

## Business Rules / Validation Constraints

- BR-AUTH-01 — JWT-protected operation: JwtAuthGuard shall validate the bearer JWT and provide the authenticated identifier corresponding to Users.user_id.
- BR-TXN-01 — Transaction ownership scope: Every returned Transactions row shall have account_id referencing an Accounts row whose user_id equals the authenticated Users.user_id.
- BR-TXN-02 — Allowed transaction filter: query.type shall be All, Revenue, or Expense. All is a query/UI sentinel only and shall never be stored in Transactions.type; persisted type values are Revenue or Expense.
- BR-TXN-03 — Pagination and ordering: limit defaults to 10 and must be > 0; offset defaults to 0 and must be >= 0; matching rows are ordered by Transactions.transaction_date descending; hasMore = offset + returnedCount < total.
- BR-TXN-04 — Relationship integrity: Transactions.account_id shall reference Accounts.account_id. Transactions.category_id may be null; when present it shall reference Categories.category_id.
- BR-TXN-05 — Empty result consistency: When no transaction matches the authenticated ownership scope and selected filter, data shall be [], total shall be 0, and hasMore shall be false.
- BR-TXN-06 — Response persistence mapping: Every transaction DTO returned by the endpoint shall correspond to a persisted Transactions row with matching transaction_id, account_id, transaction_date, type, item_description, shop_name, amount, payment_method, and status.
- BR-TXN-07 — Read-only operation: Listing transaction history shall not create, update, or delete Transactions or Accounts records.

## Request Header(s)

### headers.Authorization

Type: string; Format: Bearer <JWT>; Required: Yes; Nullable: No
Validation: Must contain a valid, unexpired JWT access token.
Trigger: Every protected request.
Description: Authenticates the current user.
Example: Bearer eyJhbGciOiJIUzI1NiIs...
Note: Added by the frontend Axios interceptor.

## Query Parameter(s)

### query.type

Type: string; Required: Yes; Nullable: No
Allowed values: All; Revenue; Expense
Validation: Must be All, Revenue, or Expense. All is a filtering sentinel and is not a persisted Transactions.type value.
Trigger: Transaction list request.
Description: Transaction type filter.
Example: All


### query.limit

Type: integer; Required: No; Nullable: No
Default: 10
Validation: Must parse as an integer and must be greater than 0.
Trigger: Transaction list request.
Description: Maximum number of returned records.
Example: 10


### query.offset

Type: integer; Required: No; Nullable: No
Default: 0
Validation: Must parse as an integer and must be greater than or equal to 0.
Trigger: Transaction list request.
Description: Zero-based pagination offset.
Example: 0

## Request Body

None

## Success Response — HTTP 200

### data

Type: array<object>; Required: Yes; Nullable: No
Trigger: The query is valid.
Description: Transaction array. May be empty.
Example: []


### data[].transaction_id

Type: integer; Required: Yes; Nullable: No
Trigger: The query is valid.
Description: Transactions.transaction_id.
Example: 8


### data[].account_id

Type: integer; Required: Yes; Nullable: No
Trigger: The query is valid.
Description: Transactions.account_id; references an account owned by the authenticated user.
Example: 3


### data[].transaction_date

Type: string; Format: date; Required: Yes; Nullable: No
Trigger: The query is valid.
Description: Transactions.transaction_date.
Example: 2025-11-01


### data[].type

Type: string; Required: Yes; Nullable: No
Allowed values: Revenue; Expense
Trigger: The query is valid.
Description: Transactions.type. All is never returned as a stored type.
Example: Expense


### data[].item_description

Type: string; Required: Yes; Nullable: No
Trigger: The query is valid.
Description: Transactions.item_description.
Example: Movie Ticket


### data[].shop_name

Type: string; Required: Yes; Nullable: No
Trigger: The query is valid.
Description: Transactions.shop_name.
Example: Cinema


### data[].amount

Type: number; Required: Yes; Nullable: No
Trigger: The query is valid.
Description: Transactions.amount.
Example: 150000


### data[].payment_method

Type: string; Required: Yes; Nullable: No
Trigger: The query is valid.
Description: Transactions.payment_method.
Example: Credit Card


### data[].status

Type: string; Required: Yes; Nullable: No
Allowed values: Complete; Pending; Failed
Trigger: The query is valid.
Description: Transactions.status.
Example: Complete


### total

Type: integer; Required: Yes; Nullable: No
Trigger: The query is valid.
Description: Total records matching the ownership scope and selected filter.
Example: 25


### hasMore

Type: boolean; Required: Yes; Nullable: No
Trigger: The query is valid.
Description: Whether another page exists; computed as offset + returnedCount < total.
Example: true

## Error Response — HTTP 400

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: type is not All, Revenue, or Expense; limit cannot be parsed or is less than or equal to 0; or offset cannot be parsed or is less than 0.
Description: Error description returned by the global HTTP exception filter.
Example: Invalid transaction query parameter
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
Trigger: Transaction retrieval fails.
Description: Error description returned by the global HTTP exception filter.
Example: Đã xảy ra lỗi hệ thống khi lấy danh sách giao dịch. Vui lòng thử lại sau.
Note: The error envelope also contains success=false and may contain an error field.
