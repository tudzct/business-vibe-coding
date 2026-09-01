---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-04
source_use_case: docs/01-inception/use-cases/uc-04-create-transaction.md
source_use_case_sha256: sha256:0d6d0bc1aaa9e393bbeac88f9bc75420954049f4f6067de631ea45a876b17893
---

# UC-04 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A64:B82`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-09-01T01:22:04.719Z`

## Ordered Business Rules

### BR-TXN-08 - Required transaction data

- Representation: `ocl_precondition`
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
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Client field errors prevent submission for missing or invalid required values; backend independently rejects invalid or missing transaction data with HTTP 400 through the standard error envelope.
- Traceability: `Use cases!A64:B82`; UC-04 Basic Flow 6 and 9; UC-04 EF-2 and EF-4; `API-TRANSACTION-CREATE`

### BR-TXN-09 - Allowed transaction type and status

- Representation: `ocl_precondition`
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
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Invalid type or supplied status is rejected with HTTP 400; when status is omitted, the stored and returned status is Complete.
- Traceability: `Use cases!A64:B82`; UC-04 Basic Flow 4, 6, and 11; UC-04 AF-1; UC-04 EF-2 and EF-4; `API-TRANSACTION-CREATE`

### BR-TXN-10 - Optional category must be valid when supplied

- Representation: `ocl_precondition`
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
- Enforcement layer(s): `backend`, `database`
- Failure behavior: An omitted category remains null and is not an error; a supplied nonexistent category is rejected with HTTP 400 and no transaction is created.
- Traceability: `Use cases!A64:B82`; UC-04 PRE-4; UC-04 AF-2 and AF-3; UC-04 EF-4; `API-TRANSACTION-CREATE`; `API-CATEGORY-LIST`

### BR-TXN-11 - Account ownership

- Representation: `ocl_precondition`
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
- Enforcement layer(s): `backend`
- Failure behavior: A nonexistent or non-owned account is rejected with HTTP 400 and no transaction or balance change is committed.
- Traceability: `Use cases!A64:B82`; UC-04 PRE-2 and PRE-3; UC-04 Basic Flow 8 and 9; UC-04 EF-4; `API-TRANSACTION-CREATE`; `API-ACCOUNT-LIST`

### BR-TXN-12 - Sufficient balance for Expense

- Representation: `ocl_precondition`
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
- Enforcement layer(s): `backend`, `database`
- Failure behavior: An Expense that exceeds the owned account balance is rejected with HTTP 400 and no transaction or balance change is committed; Revenue is not subject to this check.
- Traceability: `Use cases!A64:B82`; UC-04 Basic Flow 10; UC-04 AF-1; UC-04 EF-4; `API-TRANSACTION-CREATE`

### BR-TXN-13 - Account balance adjustment

- Representation: `ocl_postcondition`
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
- Failure behavior: On successful commit, Revenue increases and Expense decreases the selected account balance by exactly the transaction amount; a failure rolls the balance change back.
- Traceability: `Use cases!A64:B82`; UC-04 POST-3 and POST-4; UC-04 Basic Flow 12; UC-04 AF-1; UC-04 EF-5; `API-TRANSACTION-CREATE`

### BR-TXN-14 - Created transaction maps to the request and database

- Representation: `ocl_postcondition`
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
- Failure behavior: Success creates exactly one mapped Transactions row and returns its created fields; persistence failure returns HTTP 500 and leaves no new row committed.
- Traceability: `Use cases!A64:B82`; UC-04 POST-1 and POST-2; UC-04 Basic Flow 11; UC-04 EF-5; `API-TRANSACTION-CREATE`

### BR-TXN-15 - Atomic transaction creation

- Representation: `natural_language`
- Expression / authoritative text:

~~~text
Technical constraints:
- The Transactions insert and Accounts.balance update shall execute in one database transaction.
- If any validation, persistence, or balance-update step fails before commit, the operation shall roll back and leave both Transactions and Accounts unchanged by this request.
- shopName maps to Transactions.shop_name and paymentMethod maps to Transactions.payment_method; both are mandatory and shall not be null or empty.
- category_id maps to Transactions.category_id and remains optional/nullable.
~~~

- Context: Transaction creation persistence, account balance update, and request-to-database field mapping
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: Any failure before commit rolls back both the Transactions insert and Accounts.balance update; invalid mandatory mapped fields are rejected, while category_id remains optional and nullable.
- Traceability: `Use cases!A64:B82`; UC-04 POST-2 and POST-4; UC-04 Basic Flow 6, 11, and 12; UC-04 EF-2, EF-4, and EF-5; `API-TRANSACTION-CREATE`

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
