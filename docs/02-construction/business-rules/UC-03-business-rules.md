---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-03
source_use_case: docs/01-inception/use-cases/uc-03-view-transaction-history.md
source_use_case_sha256: sha256:8d4cac9572e4181a9e55609fa7006538c41201522a97a93467d2235e8618bd7d
---

# UC-03 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A45:B63`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-08-27T03:49:28.570Z`

## Ordered Business Rules

### BR-TXN-01 - Transaction ownership scope

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
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A missing, invalid, or expired authenticated identity is rejected with HTTP 401; a successful list contains only transactions belonging to accounts owned by the authenticated user.
- Traceability: `Use cases!A45:B63`; `UC-03 PRE-1`; `UC-03 Basic Flow 4-6`; `UC-03 POST-1`; `API-TRANSACTION-LIST`

### BR-TXN-02 - Allowed transaction filter and stored transaction type

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

context Transaction
inv BR_TXN_02_StoredType:
  type = TransactionType::Revenue or
  type = TransactionType::Expense

Technical constraint:
- All is a query/UI filter only. It shall never be stored in Transactions.type.
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto; Transaction`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: The client and backend accept only All, Revenue, or Expense as filters; invalid values return HTTP 400. Revenue and Expense constrain returned rows, while All remains a query/UI sentinel and is never persisted.
- Traceability: `Use cases!A45:B63`; `UC-03 AF-1`; `UC-03 EF-2`; `UC-03 UML TransactionFilterType and TransactionType`; `API-TRANSACTION-LIST`

### BR-TXN-03 - Pagination and ordering

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

post BR_TXN_03_PageSize:
  result.data->size() <= limit

post BR_TXN_03_HasMore:
  result.hasMore =
    (offset + result.data->size() < result.total)

post BR_TXN_03_DescendingTransactionDate:
  result.data->size() <= 1 or
  Sequence{1..result.data->size()-1}->forAll(i |
    result.data->at(i).transaction_date >=
    result.data->at(i + 1).transaction_date
  )

Technical constraints:
- If limit is omitted, the endpoint shall use limit = 10.
- If offset is omitted, the endpoint shall use offset = 0.
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: Invalid limit or offset values return HTTP 400. Valid results use defaults limit 10 and offset 0 when omitted, return at most limit rows ordered by transaction date descending, and expose total and hasMore consistently for load-more pagination.
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
- Failure behavior: Account ownership, Transaction-to-Account, and optional Transaction-to-Category references remain valid through the existing ORM/database relationships; the source defines no separate list-response error for an integrity violation.
- Traceability: `Use cases!A45:B63`; `UC-03 UML User-Account-Transaction-Category relationships`; `API-TRANSACTION-LIST`

### BR-TXN-05 - Empty transaction result

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
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto; transaction-list empty state`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: No matching transactions return an empty data array, total 0, and hasMore false; the client displays the empty-state message.
- Traceability: `Use cases!A45:B63`; `UC-03 POST-2`; `UC-03 AF-3`; `API-TRANSACTION-LIST`

### BR-TXN-06 - Response rows map to persisted Transactions

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context TransactionService::findAllByUserId(
  user_id : Integer,
  type : TransactionFilterType,
  limit : Integer,
  offset : Integer
) : TransactionListResponseDto

post BR_TXN_06_ResponseBackedByTransaction:
  result.data->forAll(dto |
    Transaction.allInstances()->exists(t |
      t.transaction_id = dto.transaction_id and
      t.account_id = dto.account_id and
      t.transaction_date = dto.transaction_date and
      t.type = dto.type and
      t.item_description = dto.item_description and
      t.shop_name = dto.shop_name and
      t.amount = dto.amount and
      t.payment_method = dto.payment_method and
      t.status = dto.status
    )
  )
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Every returned DTO row maps to the corresponding persisted Transaction fields; retrieval failures return the source-defined HTTP 500 safe error.
- Traceability: `Use cases!A45:B63`; `UC-03 Basic Flow 5-6`; `UC-03 UML Transaction and TransactionDto`; `API-TRANSACTION-LIST`

### BR-TXN-07 - Viewing transaction history is read-only

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
- Listing transaction history shall not create, update, or delete Transactions or Accounts records.
~~~

- Context: `TransactionService::findAllByUserId(user_id : Integer, type : TransactionFilterType, limit : Integer, offset : Integer) : TransactionListResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: The GET list operation does not create, update, or delete Transaction or Account records; the source defines no separate error response for a read-only violation.
- Traceability: `Use cases!A45:B63`; `UC-03 POST-3`; `UC-03 Basic Flow 3-6`; `API-TRANSACTION-LIST`

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
