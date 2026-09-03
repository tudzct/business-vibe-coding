---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-04
source_use_case: docs/01-inception/use-cases/uc-04-create-transaction.md
source_use_case_sha256: sha256:1fe38316635ece4af2d7a9a774fd2efdd731c25d3b74c5aaeb5f3e9b9eb04f43
---

# UC-04 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A64:B82`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-09-02T20:55:00.000Z`

## Ordered Business Rules

### BR-TXN-08 - Required transaction data, date horizon, and cash payment threshold

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

pre BR_TXN_08_DateWindow:
  dto.transactionDate <= currentDate() + 1 and
  dto.transactionDate >= currentDate() - 365

pre BR_TXN_08_CashLimit:
  dto.paymentMethod = 'Cash' implies dto.amount <= 50000000
~~~

- Context: `TransactionService::create(user_id : Integer, dto : CreateTransactionDto) : CreateTransactionResponseDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Client-applicable invalid fields prevent submission and display field errors; backend validation or constraint violations return HTTP 400 and no transaction is created.
- Traceability: `Use cases!A64:B82`; `UC-04 Basic Flow 3-7`; `UC-04 EF-2`; `UC-04 EF-4`; `API-TRANSACTION-CREATE`

### BR-TXN-09 - Account type eligibility, allowed transaction types, and default status

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context TransactionService::create(
  user_id : Integer,
  dto : CreateTransactionDto
) : CreateTransactionResponseDto

pre BR_TXN_09_EligibleAccountType:
  Account.allInstances()->exists(a |
    a.account_id = dto.accountId and
    Set{AccountType::Checking, AccountType::Savings, AccountType::Credit_Card}->includes(a.account_type)
  )

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
- Failure behavior: Unsupported account, transaction type, or supplied status produces HTTP 400; an omitted status is persisted and returned as Complete.
- Traceability: `Use cases!A64:B82`; `UC-04 PRE-2`; `UC-04 Basic Flow 2-9`; `UC-04 AF-1`; `UC-04 EF-1`; `UC-04 EF-4`; `API-TRANSACTION-CREATE`; `API-ACCOUNT-LIST`

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
- Failure behavior: An invalid supplied category produces HTTP 400; an omitted category remains null and does not prevent creation.
- Traceability: `Use cases!A64:B82`; `UC-04 Basic Flow 2-9`; `UC-04 AF-2`; `UC-04 AF-3`; `UC-04 EF-4`; `API-TRANSACTION-CREATE`; `API-CATEGORY-LIST`

### BR-TXN-11 - Account ownership scope

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
- Failure behavior: A missing or non-owned account produces HTTP 400 and no transaction is created; missing or expired authentication produces HTTP 401.
- Traceability: `Use cases!A64:B82`; `UC-04 PRE-1`; `UC-04 PRE-2`; `UC-04 Basic Flow 2 and 7`; `UC-04 EF-3`; `UC-04 EF-4`; `API-TRANSACTION-CREATE`; `API-ACCOUNT-LIST`

### BR-TXN-12 - Sufficient balance for Expense with Savings maintaining reserve

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
      ((a.account_type = AccountType::Savings and a.balance - dto.amount >= 50000) or
       (a.account_type <> AccountType::Savings and a.balance >= dto.amount))
    )
~~~

- Context: `TransactionService::create(user_id : Integer, dto : CreateTransactionDto) : CreateTransactionResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: An Expense that exceeds the available balance or violates the Savings reserve produces HTTP 400 and no transaction or balance change is committed.
- Traceability: `Use cases!A64:B82`; `UC-04 Basic Flow 7-8`; `UC-04 EF-4`; `API-TRANSACTION-CREATE`

### BR-TXN-13 - Status-dependent account balance adjustment and user total balance sync

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context TransactionService::create(
  user_id : Integer,
  dto : CreateTransactionDto
) : CreateTransactionResponseDto

post BR_TXN_13_AccountBalanceAdjusted:
  Account.allInstances()->exists(a |
    a.account_id = dto.accountId and
    ((result.data.status = TransactionStatus::Complete and dto.type = TransactionType::Revenue and a.balance = a.balance@pre + dto.amount) or
     (result.data.status = TransactionStatus::Complete and dto.type = TransactionType::Expense and a.balance = a.balance@pre - dto.amount) or
     (result.data.status <> TransactionStatus::Complete and a.balance = a.balance@pre))
  )

post BR_TXN_13_UserTotalBalanceSynced:
  User.allInstances()->exists(u |
    u.user_id = user_id and
    ((result.data.status = TransactionStatus::Complete and dto.type = TransactionType::Revenue and u.total_balance = u.total_balance@pre + dto.amount) or
     (result.data.status = TransactionStatus::Complete and dto.type = TransactionType::Expense and u.total_balance = u.total_balance@pre - dto.amount) or
     (result.data.status <> TransactionStatus::Complete and u.total_balance = u.total_balance@pre))
  )
~~~

- Context: `TransactionService::create(user_id : Integer, dto : CreateTransactionDto) : CreateTransactionResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Complete transactions adjust both account and user totals according to type; non-Complete transactions adjust neither. A failed update or synchronization rolls back the request and returns HTTP 500.
- Traceability: `Use cases!A64:B82`; `UC-04 Basic Flow 7-9`; `UC-04 AF-1`; `UC-04 EF-5`; `API-TRANSACTION-CREATE`

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
- Failure behavior: Success creates exactly one mapped transaction; a persistence failure creates none after rollback and returns HTTP 500.
- Traceability: `Use cases!A64:B82`; `UC-04 POST-1`; `UC-04 Basic Flow 3 and 8-9`; `UC-04 AF-2`; `UC-04 EF-5`; `UC-04 UML`; `API-TRANSACTION-CREATE`

### BR-TXN-15 - Atomic transaction creation, concurrency safety, and rollback

- Representation: `natural language`
- Expression / authoritative text:

~~~text
Technical constraints:
- The Transactions insert, Accounts.balance update, and Users.total_balance sync shall execute inside a single atomic database transaction.
- If any validation, persistence, balance-update, or synchronization step fails before commit, the operation shall roll back and leave all tables unchanged by this request.
- Database locking or isolation shall prevent race conditions during concurrent balance updates on the same account.
- shopName maps to Transactions.shop_name and paymentMethod maps to Transactions.payment_method; both are mandatory and shall be trimmed non-empty strings.
- category_id maps to Transactions.category_id and remains optional/nullable.
~~~

- Context: `Transaction creation persistence, balance updates, synchronization, and concurrent requests`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Any pre-commit failure rolls back all request changes and returns the source-defined validation or server error; locking or isolation prevents lost concurrent balance updates.
- Traceability: `Use cases!A64:B82`; `UC-04 POST-1`; `UC-04 Basic Flow 7-9`; `UC-04 AF-2`; `UC-04 EF-5`; `UC-04 UML`; `API-TRANSACTION-CREATE`

## Unresolved items

None. The researcher explicitly confirmed that the frozen UC-04 projection is the governing source for this generation despite the later live-Sheet mismatch observed in `Use cases!B71:B78`.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
