---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-03
source_use_case: docs/01-inception/use-cases/uc-03-view-transaction-history.md
source_use_case_sha256: sha256:e9d22a282be0fee4edd9dcd55ac47191dba78440661c874e490f530b5e784882
---

# UC-03 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A45:B63`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-09-02T19:00:48.000Z`

## Ordered Business Rules

### BR-TXN-01 - Transaction ownership and user scope

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context TransactionService::findAllByUserId(
  user_id : Integer,
  type : TransactionFilterType,
  limit : Integer,
  offset : Integer
) : TransactionListResponseDto

pre BR_TXN_01_UserExists:
  User.allInstances()->exists(u |
    u.user_id = user_id
  )

post BR_TXN_01_OwnedAccountsOnly:
  result.data->forAll(t |
    Account.allInstances()->exists(a |
      a.account_id = t.account_id and
      a.user_id = user_id
    )
  )

Technical constraints:
- The authenticated user identity is derived from the validated JWT token.
- Only transaction records belonging to accounts owned by the authenticated user shall be retrieved.
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A missing, invalid, or expired authenticated identity is rejected with HTTP 401; a successful list contains only transactions belonging to accounts owned by the authenticated user.
- Traceability: `Use cases!A45:B63`; `UC-03 PRE-1`; `UC-03 Basic Flow 4-6`; `UC-03 POST-1`; `API-TRANSACTION-LIST`

### BR-TXN-02 - Type filter semantics and failed transaction retention window

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context TransactionService::findAllByUserId(
  user_id : Integer,
  type : TransactionFilterType,
  limit : Integer,
  offset : Integer
) : TransactionListResponseDto

pre BR_TXN_02_AllowedFilter:
  Set{TransactionFilterType::All,
      TransactionFilterType::Revenue,
      TransactionFilterType::Expense}->includes(type)

post BR_TXN_02_FilterApplied:
  (type = TransactionFilterType::Revenue implies
    result.data->forAll(t |
      t.type = TransactionType::Revenue
    )) and
  (type = TransactionFilterType::Expense implies
    result.data->forAll(t |
      t.type = TransactionType::Expense
    ))

post BR_TXN_02_FailedRetentionWindow:
  result.data->forAll(t |
    t.status = TransactionStatus::Failed implies
      t.transaction_date >= currentDate() - 30
  )

context Transaction
inv BR_TXN_02_StoredType:
  type = TransactionType::Revenue or
  type = TransactionType::Expense

Technical constraints:
- All is a query/UI filter only; it shall never be stored in Transactions.type.
- Transactions with status Failed that are older than 30 days relative to the current system date shall be automatically excluded from the query results.
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto; Transaction`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: The client and backend accept only All, Revenue, or Expense as filters; invalid values return HTTP 400. Failed transactions older than 30 days are automatically omitted.
- Traceability: `Use cases!A45:B63`; `UC-03 AF-1`; `UC-03 EF-2`; `UC-03 UML TransactionFilterType and TransactionType`; `API-TRANSACTION-LIST`

### BR-TXN-03 - Status-priority multi-tier ordering and dynamic limit clamping

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context TransactionService::findAllByUserId(
  user_id : Integer,
  type : TransactionFilterType,
  limit : Integer,
  offset : Integer
) : TransactionListResponseDto

pre BR_TXN_03_LimitPositive:
  limit > 0

pre BR_TXN_03_OffsetNonNegative:
  offset >= 0

post BR_TXN_03_MaxPageSizeClamped:
  (limit > 50 implies result.data->size() <= 50) and
  (limit <= 50 implies result.data->size() <= limit)

post BR_TXN_03_HasMore:
  result.hasMore =
    (offset + result.data->size() < result.total)

post BR_TXN_03_PriorityStatusOrdering:
  result.data->size() <= 1 or
  Sequence{1..result.data->size()-1}->forAll(i |
    let curr = result.data->at(i) in
    let nxt = result.data->at(i + 1) in
    (curr.status = TransactionStatus::Pending and nxt.status <> TransactionStatus::Pending) or
    (curr.status = nxt.status and curr.transaction_date > nxt.transaction_date) or
    (curr.status = nxt.status and curr.transaction_date = nxt.transaction_date and curr.transaction_id >= nxt.transaction_id) or
    (curr.status <> TransactionStatus::Pending and nxt.status <> TransactionStatus::Pending and curr.transaction_date > nxt.transaction_date) or
    (curr.status <> TransactionStatus::Pending and nxt.status <> TransactionStatus::Pending and curr.transaction_date = nxt.transaction_date and curr.transaction_id >= nxt.transaction_id)
  )

Technical constraints:
- If limit is omitted, default to limit = 10. If limit exceeds 50, clamp effective limit to 50 without rejecting the request.
- If offset is omitted, default to offset = 0.
- Transactions with status Pending shall be sorted first, followed by descending transaction_date, then descending transaction_id.
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: Invalid limit (<= 0) or offset (< 0) returns HTTP 400. Limits exceeding 50 are clamped to 50. Pending transactions are strictly ordered ahead of settled transactions.
- Traceability: `Use cases!A45:B63`; `UC-03 Basic Flow 2-7`; `UC-03 AF-2`; `UC-03 EF-2`; `API-TRANSACTION-LIST`

### BR-TXN-04 - Database relationship integrity

- Representation: `OCL invariant`
- Expression / authoritative text:

~~~text
context Account
inv BR_TXN_04_AccountOwnerExists:
  User.allInstances()->exists(u |
    u.user_id = self.user_id
  )

context Transaction
inv BR_TXN_04_TransactionAccountExists:
  Account.allInstances()->exists(a |
    a.account_id = self.account_id
  )

inv BR_TXN_04_OptionalCategoryValid:
  self.category_id.oclIsUndefined() or
  Category.allInstances()->exists(c |
    c.category_id = self.category_id
  )
~~~

- Context: `Account; Transaction`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Account ownership, Transaction-to-Account, and optional Transaction-to-Category references remain valid through the existing ORM/database relationships.
- Traceability: `Use cases!A45:B63`; `UC-03 UML User-Account-Transaction-Category relationships`; `API-TRANSACTION-LIST`

### BR-TXN-05 - Empty transaction result consistency

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context TransactionService::findAllByUserId(
  user_id : Integer,
  type : TransactionFilterType,
  limit : Integer,
  offset : Integer
) : TransactionListResponseDto

post BR_TXN_05_EmptyResultConsistency:
  result.total = 0 implies
    result.data->isEmpty() and
    result.hasMore = false

Technical constraint:
- When total equals 0, the frontend shall display the empty-state message "No transactions are found!" and pagination controls shall not load further records.
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto; transaction-list empty state`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: When total equals 0, an empty data array is returned and the frontend displays "No transactions are found!".
- Traceability: `Use cases!A45:B63`; `UC-03 POST-2`; `UC-03 AF-3`; `API-TRANSACTION-LIST`

### BR-TXN-06 - Status-dependent signed amount and conditional merchant masking

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context TransactionService::findAllByUserId(
  user_id : Integer,
  type : TransactionFilterType,
  limit : Integer,
  offset : Integer
) : TransactionListResponseDto

post BR_TXN_06_ResponseMappingAndSignedAmount:
  result.data->forAll(dto |
    Transaction.allInstances()->exists(t |
      t.transaction_id = dto.transaction_id and
      t.account_id = dto.account_id and
      t.transaction_date = dto.transaction_date and
      t.type = dto.type and
      t.item_description = dto.item_description and
      t.payment_method = dto.payment_method and
      t.status = dto.status and
      ((t.status = TransactionStatus::Complete and t.type = TransactionType::Expense and dto.amount = -(t.amount)) or
       (t.status = TransactionStatus::Complete and t.type = TransactionType::Revenue and dto.amount = t.amount) or
       (t.status <> TransactionStatus::Complete and dto.amount = t.amount)) and
      ((t.payment_method = 'Credit Card' and t.status = TransactionStatus::Pending and dto.shop_name = '***') or
       (not (t.payment_method = 'Credit Card' and t.status = TransactionStatus::Pending) and dto.shop_name = t.shop_name))
    )
  )

Technical constraints:
- Completed Expense transactions shall have negative amounts in the response; Completed Revenue transactions remain positive.
- Pending or Failed transactions shall preserve their unsigned absolute amount.
- Pending transactions paid via Credit Card shall have shop_name masked as '***'.
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Completed expenses map to negative amounts, pending credit transactions mask shop_name as '***', and unresolved rows preserve absolute amounts.
- Traceability: `Use cases!A45:B63`; `UC-03 Basic Flow 5-6`; `UC-03 UML Transaction and TransactionDto`; `API-TRANSACTION-LIST`

### BR-TXN-07 - Read-only query idempotency and audit immutability

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context TransactionService::findAllByUserId(
  user_id : Integer,
  type : TransactionFilterType,
  limit : Integer,
  offset : Integer
) : TransactionListResponseDto

post BR_TXN_07_TransactionIdentityUnchanged:
  Transaction.allInstances()->collect(t | t.transaction_id)->asSet() =
  Transaction.allInstances()@pre->collect(t | t.transaction_id)->asSet()

post BR_TXN_07_TransactionDataUnchanged:
  Transaction.allInstances()->forAll(t |
    Transaction.allInstances()@pre->exists(old |
      old.transaction_id = t.transaction_id and
      old.account_id = t.account_id and
      old.transaction_date = t.transaction_date and
      old.type = t.type and
      old.item_description = t.item_description and
      old.shop_name = t.shop_name and
      old.amount = t.amount and
      old.payment_method = t.payment_method and
      old.status = t.status and
      old.receipt_id = t.receipt_id and
      old.category_id = t.category_id
    )
  )

post BR_TXN_07_AccountIdentityUnchanged:
  Account.allInstances()->collect(a | a.account_id)->asSet() =
  Account.allInstances()@pre->collect(a | a.account_id)->asSet()

Technical constraint:
- Listing transaction history shall never create, mutate, or delete Transactions, Accounts, or Users records.
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: The GET list operation does not create, update, or delete Transaction or Account records; all tables remain immutable under query execution.
- Traceability: `Use cases!A45:B63`; `UC-03 POST-3`; `UC-03 Basic Flow 3-6`; `API-TRANSACTION-LIST`

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
