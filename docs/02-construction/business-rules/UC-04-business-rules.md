---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-04
source_use_case: docs/01-inception/use-cases/uc-04-create-transaction.md
source_use_case_sha256: sha256:ae0185a8d42a037253d3a7208135679f0f29ab90dc2f48d9796237dfd147846a
---

# UC-04 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A64:B82`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-08-27T03:49:28.570Z`

## Ordered Business Rules

### BR-TXN-08 - Required transaction data

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context TransactionService::create(
  user_id : Integer,
  dto : CreateTransactionDto
) : CreateTransactionResponseDto

pre BR_TXN_08_RequiredFields:
  not dto.accountId.oclIsUndefined() and
  not dto.transactionDate.oclIsUndefined() and
  not dto.type.oclIsUndefined() and
  not dto.itemDescription.oclIsUndefined() and
  trim(dto.itemDescription).size() > 0 and
  not dto.shopName.oclIsUndefined() and
  trim(dto.shopName).size() > 0 and
  not dto.paymentMethod.oclIsUndefined() and
  trim(dto.paymentMethod).size() > 0 and
  not dto.amount.oclIsUndefined() and
  dto.amount >= 0.01
~~~

- Context: `TransactionService::create(user_id : Integer, dto : CreateTransactionDto) : CreateTransactionResponseDto`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: Client-side failure displays field errors and prevents submission; backend validation failure returns HTTP 400. No Transaction or Account change is committed on failure.
- Traceability: `Use cases!A64:B82`; `UC-04 Basic Flow 3-8`; `UC-04 EF-2`; `UC-04 EF-4`; `API-TRANSACTION-CREATE`

### BR-TXN-09 - Allowed transaction type and status

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context TransactionService::create(
  user_id : Integer,
  dto : CreateTransactionDto
) : CreateTransactionResponseDto

pre BR_TXN_09_AllowedType:
  dto.type = TransactionType::Revenue or
  dto.type = TransactionType::Expense

pre BR_TXN_09_AllowedStatus:
  dto.status.oclIsUndefined() or
  Set{TransactionStatus::Complete,
      TransactionStatus::Pending,
      TransactionStatus::Failed}->includes(dto.status)

post BR_TXN_09_DefaultStatus:
  (dto.status.oclIsUndefined() implies
    result.data.status = TransactionStatus::Complete) and
  (not dto.status.oclIsUndefined() implies
    result.data.status = dto.status)
~~~

- Context: `TransactionService::create(user_id : Integer, dto : CreateTransactionDto) : CreateTransactionResponseDto`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: An invalid type or supplied status returns HTTP 400; an omitted status is stored and returned as Complete.
- Traceability: `Use cases!A64:B82`; `UC-04 AF-1`; `UC-04 UML TransactionType and TransactionStatus`; `API-TRANSACTION-CREATE`

### BR-TXN-10 - Optional category must be valid when supplied

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context TransactionService::create(
  user_id : Integer,
  dto : CreateTransactionDto
) : CreateTransactionResponseDto

pre BR_TXN_10_CategoryOptionalAndValid:
  dto.category_id.oclIsUndefined() or
  Category.allInstances()->exists(c |
    c.category_id = dto.category_id
  )

post BR_TXN_10_CategoryStored:
  (dto.category_id.oclIsUndefined() implies
    result.data.category_id.oclIsUndefined()) and
  (not dto.category_id.oclIsUndefined() implies
    result.data.category_id = dto.category_id)
~~~

- Context: `TransactionService::create(user_id : Integer, dto : CreateTransactionDto) : CreateTransactionResponseDto`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: Omitting or supplying null `category_id` remains valid; a supplied nonexistent category returns HTTP 400 and no Transaction or Account change is committed.
- Traceability: `Use cases!A64:B82`; `UC-04 AF-2`; `UC-04 AF-3`; `UC-04 UML Category relationship`; `API-TRANSACTION-CREATE`; `API-CATEGORY-LIST`

### BR-TXN-11 - Account ownership

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context TransactionService::create(
  user_id : Integer,
  dto : CreateTransactionDto
) : CreateTransactionResponseDto

pre BR_TXN_11_AccountOwnedByUser:
  Account.allInstances()->exists(a |
    a.account_id = dto.accountId and
    a.user_id = user_id
  )
~~~

- Context: `TransactionService::create(user_id : Integer, dto : CreateTransactionDto) : CreateTransactionResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A referenced account not owned by the authenticated user returns HTTP 400; a missing, invalid, or expired JWT returns HTTP 401. No Transaction or Account change is committed.
- Traceability: `Use cases!A64:B82`; `UC-04 PRE-1`; `UC-04 Basic Flow 7`; `UC-04 EF-3`; `UC-04 EF-4`; `API-TRANSACTION-CREATE`

### BR-TXN-12 - Sufficient balance for Expense

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context TransactionService::create(
  user_id : Integer,
  dto : CreateTransactionDto
) : CreateTransactionResponseDto

pre BR_TXN_12_SufficientExpenseBalance:
  dto.type = TransactionType::Expense implies
    Account.allInstances()->exists(a |
      a.account_id = dto.accountId and
      a.user_id = user_id and
      a.balance >= dto.amount
    )
~~~

- Context: `TransactionService::create(user_id : Integer, dto : CreateTransactionDto) : CreateTransactionResponseDto`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: An Expense exceeding the selected owned account balance returns HTTP 400; Revenue is not subject to a minimum-balance constraint. No Transaction or Account change is committed on failure.
- Traceability: `Use cases!A64:B82`; `UC-04 AF-1`; `UC-04 EF-4`; `API-TRANSACTION-CREATE`; `API-ACCOUNT-LIST`

### BR-TXN-13 - Account balance adjustment

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context TransactionService::create(
  user_id : Integer,
  dto : CreateTransactionDto
) : CreateTransactionResponseDto

post BR_TXN_13_BalanceAdjusted:
  Account.allInstances()->exists(a |
    a.account_id = dto.accountId and
    ((dto.type = TransactionType::Revenue and
      a.balance = a.balance@pre + dto.amount) or
     (dto.type = TransactionType::Expense and
      a.balance = a.balance@pre - dto.amount))
  )
~~~

- Context: `TransactionService::create(user_id : Integer, dto : CreateTransactionDto) : CreateTransactionResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A successful Revenue increases and a successful Expense decreases the referenced account balance by exactly the transaction amount; processing failure rolls the change back and returns the source-defined HTTP 500 error.
- Traceability: `Use cases!A64:B82`; `UC-04 POST-1`; `UC-04 Basic Flow 8`; `UC-04 AF-1`; `UC-04 EF-5`; `API-TRANSACTION-CREATE`

### BR-TXN-14 - Created transaction maps to the request and database

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context TransactionService::create(
  user_id : Integer,
  dto : CreateTransactionDto
) : CreateTransactionResponseDto

post BR_TXN_14_OneNewTransaction:
  Transaction.allInstances()->size() =
    Transaction.allInstances()@pre->size() + 1

post BR_TXN_14_PersistedTransaction:
  Transaction.allInstances()->exists(t |
    t.transaction_id = result.data.transactionId and
    t.account_id = dto.accountId and
    t.transaction_date = dto.transactionDate and
    t.type = dto.type and
    t.item_description = trim(dto.itemDescription) and
    t.shop_name = trim(dto.shopName) and
    t.amount = dto.amount and
    t.payment_method = trim(dto.paymentMethod) and
    t.status = result.data.status and
    ((dto.category_id.oclIsUndefined() and
      t.category_id.oclIsUndefined()) or
     (not dto.category_id.oclIsUndefined() and
      t.category_id = dto.category_id))
  )
~~~

- Context: `TransactionService::create(user_id : Integer, dto : CreateTransactionDto) : CreateTransactionResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A successful request creates exactly one Transaction whose returned and persisted fields map to the validated request; a failed request creates none.
- Traceability: `Use cases!A64:B82`; `UC-04 POST-1`; `UC-04 POST-2`; `UC-04 Basic Flow 8-9`; `UC-04 UML CreateTransactionDataDto`; `API-TRANSACTION-CREATE`

### BR-TXN-15 - Atomic transaction creation

- Representation: `natural language`
- Expression / authoritative text:

~~~text
Technical constraints:
- The Transactions insert and Accounts.balance update shall execute in one database transaction.
- If any validation, persistence, or balance-update step fails before commit, the operation shall roll back and leave both Transactions and Accounts unchanged by this request.
- shopName maps to Transactions.shop_name and paymentMethod maps to Transactions.payment_method; both are mandatory and shall not be null or empty.
- category_id maps to Transactions.category_id and remains optional/nullable.
~~~

- Context: `Transaction creation persistence and account-balance update`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Any validation, persistence, or balance-update failure before commit rolls back the complete operation; database transaction failure returns HTTP 500 with `Error when creating transaction. Try it again later.`
- Traceability: `Use cases!A64:B82`; `UC-04 POST-1`; `UC-04 POST-2`; `UC-04 EF-5`; `UC-04 Notes`; `API-TRANSACTION-CREATE`

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
