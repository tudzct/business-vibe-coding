---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-03
uc_name: "View Transaction History"
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "Use cases"
source_range: "A45:B63"
retrieved_at: 2026-08-27T03:49:28.570Z
---

# UC-03: View Transaction History

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab Use cases, columns A-B. This frozen repository projection is read-only; source corrections must be made in the spreadsheet and imported as a new revision.

## Functional Use-Case Specification

### Use Case ID

UC-03

### Use Case Name

View Transaction History

### Description

As an authenticated user, I want to view, filter, and paginate transactions belonging to my accounts.

### Actor(s)

Authenticated User

### Priority

Not Specified

### Trigger

The user opens the Transactions page.

### Pre-Condition(s)

PRE-1: The user is authenticated.
PRE-2: The validated JWT identifies an existing Users.user_id.
PRE-3: The protected route /transactions is accessible to the authenticated user.

### Post-Condition(s)

POST-1: Every displayed transaction belongs to an Accounts row whose user_id equals the authenticated Users.user_id.
POST-2: The page displays transactions using the selected filter All, Revenue, or Expense; All is a query/UI filter only and is never a stored Transactions.type value.
POST-3: Returned transactions are ordered by transaction_date descending.
POST-4: The frontend stores the current offset and hasMore state for pagination.
POST-5: If no owned accounts or no matching transactions exist, the page displays an empty state.
POST-6: Viewing transaction history does not create, update, or delete Transactions or Accounts records.

### Basic Flow

1. The user opens /transactions.
2. The page initializes filterType = All, offset = 0, and limit = 10.
3. The frontend sends GET /api/v1/transactions with type=All, limit=10, and offset=0.
4. JwtAuthGuard validates the JWT and supplies the authenticated identifier corresponding to Users.user_id.
5. TransactionService loads account_id values from Accounts where Accounts.user_id equals the authenticated user_id.
6. TransactionService queries Transactions whose account_id belongs to those owned Accounts. If type is Revenue or Expense, it additionally filters Transactions.type by that enum value. It counts the matching rows, orders them by transaction_date descending, and applies offset and limit.
7. The backend returns data, total, and hasMore.
8. The frontend displays transaction data including item_description, shop_name, transaction_date, payment_method, amount, status, and a sign derived from Transactions.type.

### Alternative Flow

AF-1: Filter by transaction type
2a. The user selects All, Revenue, or Expense.
2b. The page clears the current list and requests the first page using the selected filter.
2c. If All is selected, no Transactions.type predicate is applied. All is not persisted in the database.

AF-2: Load more
8a. If hasMore is true, the user selects Load More.
8b. The frontend requests the next page using the current filter and offset and appends the returned rows.

AF-3: No owned accounts or no matching transactions
5a. If no Accounts rows exist for the authenticated user_id, or no Transactions rows match the selected filter, the backend returns data=[], total=0, and hasMore=false.
8c. The frontend displays its empty-state message.

### Exception Flow

EF-1: Unauthorized request
4a. If the JWT is missing, invalid, expired, or cannot resolve the authenticated user identity, the backend returns HTTP 401.
4b. The Axios response interceptor removes token and user from localStorage and redirects to /login.

EF-2: Invalid transaction filter or pagination
6a. The backend returns HTTP 400 when type is outside All, Revenue, or Expense, when limit cannot be parsed or is not positive, or when offset cannot be parsed or is negative.
6b. The frontend displays the returned message and an error toast.

EF-3: Retrieval failure
6c. If transaction retrieval fails, the backend returns HTTP 500.
6d. The frontend displays the returned message and an error toast.

### Related UI

TransactionsPage; route /transactions

### Related API IDs

API-TRANSACTION-LIST

### Notes

Not specified

## UML Model

~~~plantuml
@startuml

class User <<Entity>> {
  user_id: Integer [1]
  full_name: String [1]
  email: String [1]
  username: String [1]
  password: String [1]
  phone_number: String [1]
  profile_picture_url: String [1]
  total_balance: Decimal [1]
}

class Account <<Entity>> {
  account_id: Integer [1]
  user_id: Integer [1]
  bank_name: String [1]
  account_type: AccountType [1]
  branch_name: String [1]
  account_number_full: String [1]
  account_number_last_4: String [1]
  balance: Decimal [1]
}

class Category <<Entity>> {
  category_id: Integer [1]
  category_name: String [1]
}

class Transaction <<Entity>> {
  transaction_id: Integer [1]
  account_id: Integer [1]
  transaction_date: Date [1]
  type: TransactionType [1]
  item_description: String [1]
  shop_name: String [1]
  amount: Decimal [1]
  payment_method: String [1]
  status: TransactionStatus [1]
  receipt_id: Integer [1]
  category_id: Integer [0..1]
}

enum AccountType {
  Checking
  Credit_Card
  Savings
  Investment
  Loan
}
note right of AccountType
  Credit_Card maps to database literal 'Credit Card'.
end note

enum TransactionType {
  Revenue
  Expense
}

enum TransactionStatus {
  Complete
  Pending
  Failed
}

enum TransactionFilterType {
  All
  Revenue
  Expense
}

class TransactionListQueryDto <<DTO>> {
  type: TransactionFilterType [1]
  limit: Integer [0..1]
  offset: Integer [0..1]
}

class TransactionDto <<DTO>> {
  transaction_id: Integer [1]
  account_id: Integer [1]
  transaction_date: Date [1]
  type: TransactionType [1]
  item_description: String [1]
  shop_name: String [1]
  amount: Decimal [1]
  payment_method: String [1]
  status: TransactionStatus [1]
}

class TransactionListResponseDto <<DTO>> {
  data: TransactionDto [*]
  total: Integer [1]
  hasMore: Boolean [1]
}

class TransactionService <<Service>> {
  findAllByUserId(user_id: Integer, type: TransactionFilterType, limit: Integer, offset: Integer): TransactionListResponseDto
}

User "1" -- "0..*" Account : owns
Account "1" -- "0..*" Transaction : contains
Category "0..1" -- "0..*" Transaction : classifies

TransactionService ..> TransactionListQueryDto
TransactionService ..> TransactionListResponseDto
TransactionListResponseDto --> TransactionDto
TransactionDto ..> Transaction : maps from

@enduml
~~~

## Business Rules

The following rules are authoritative for Prompt E. OCL is preserved where supplied; technical or non-OCL constraints remain authoritative natural-language requirements.

~~~text
BR-TXN-01: Transaction ownership scope
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

BR-TXN-02: Allowed transaction filter and stored transaction type
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

BR-TXN-03: Pagination and ordering
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

BR-TXN-04: Database relationship integrity
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

BR-TXN-05: Empty transaction result
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

BR-TXN-06: Response rows map to persisted Transactions
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

BR-TXN-07: Viewing transaction history is read-only
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

