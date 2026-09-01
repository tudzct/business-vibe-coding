---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-04
uc_name: "Create a Transaction"
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "Use cases"
source_range: "A64:B82"
retrieved_at: 2026-09-01T01:22:04.719Z
---

# UC-04: Create a Transaction

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab Use cases, columns A-B. This frozen repository projection is read-only; source corrections must be made in the spreadsheet and imported as a new revision.

## Functional Use-Case Specification

### Use Case ID

UC-04

### Use Case Name

Create a Transaction

### Description

As an authenticated user, I want to create a revenue or expense transaction for one of my accounts.

### Actor(s)

Authenticated User

### Priority

Not Specified

### Trigger

The user selects Add Transaction from the Transactions page.

### Pre-Condition(s)

PRE-1: The user is authenticated and the validated JWT identifies an existing Users.user_id.
PRE-2: At least one Accounts row exists with Accounts.user_id equal to the authenticated user_id.
PRE-3: The selected account exists and is owned by the authenticated user.
PRE-4: A category is optional. If category_id is supplied, it must reference an existing Categories.category_id.

### Post-Condition(s)

POST-1: On success, exactly one new Transactions row is stored for the selected account.
POST-2: The stored transaction has type Revenue or Expense, amount > 0, and non-empty item_description, shop_name, and payment_method. category_id may be null.
POST-3: For Revenue, the selected Accounts.balance increases by amount; for Expense, it decreases by amount.
POST-4: The Transactions insert and Accounts.balance update are committed atomically; on failure neither partial change remains.
POST-5: The frontend shows a success toast, resets the form, and navigates to /transactions after 1.5 seconds.

### Basic Flow

1. The user opens /transactions/add.
2. AddTransactionForm loads the user's accounts and loads categories for optional classification.
3. The user enters itemDescription, amount, transaction type, account, transaction date, shopName, and paymentMethod; the user may optionally select a category.
4. The form defaults type to Expense, transactionDate to today, and submitted status to Complete.
5. The user selects Save.
6. The frontend validates accountId, transactionDate, type, non-empty itemDescription, non-empty shopName, non-empty paymentMethod, and amount >= 0.01. category_id is not required.
7. The frontend sends POST /api/v1/transactions.
8. JwtAuthGuard validates the JWT and supplies the authenticated identifier corresponding to Users.user_id.
9. The backend validates CreateTransactionDto, verifies category_id only when supplied, and verifies that accountId references an Accounts row owned by the authenticated user_id.
10. For Expense, the backend verifies Accounts.balance >= amount.
11. The backend creates the Transactions row, mapping accountId -> account_id, transactionDate -> transaction_date, itemDescription -> item_description, shopName -> shop_name, and paymentMethod -> payment_method. If status is omitted, Complete is used.
12. In the same database transaction, the backend updates Accounts.balance by +amount for Revenue or -amount for Expense and commits both changes.
13. The frontend displays a success toast, resets fields, and navigates to /transactions after 1.5 seconds.

### Alternative Flow

AF-1: Create Revenue
4a. The user selects Revenue.
10a. The insufficient-balance check is not applied.
12a. The backend increases Accounts.balance by amount.

AF-2: Create transaction without category
3a. The user leaves category unselected.
9a. The backend does not require a category lookup and stores Transactions.category_id = null.

AF-3: Category list unavailable
2a. If categories cannot be loaded, the frontend shows a warning but still allows creation without category because category_id is optional.

AF-4: Cancel
5a. The user selects Cancel and the frontend navigates to /transactions without submitting.

### Exception Flow

EF-1: Accounts cannot be loaded
2a. If the user's accounts cannot be loaded, the frontend displays an error and cannot submit because accountId is required.

EF-2: Client-side validation failure
6a. If accountId, transactionDate, type, itemDescription, shopName, or paymentMethod is missing/empty, or amount < 0.01, the frontend displays field errors and does not send the request.

EF-3: Unauthorized request
8a. If the JWT is missing, invalid, or expired, the backend returns HTTP 401.

EF-4: Backend validation or business-rule failure
9a. Invalid required input, an invalid supplied category_id, a non-owned account, or insufficient Expense balance produces HTTP 400; the frontend displays the returned error.

EF-5: Database failure
12a. The backend rolls back the database transaction so neither the Transactions row nor Accounts.balance is partially changed, and returns HTTP 500.

### Related UI

AddTransactionPage; AddTransactionForm; route /transactions/add

### Related API IDs

API-TRANSACTION-CREATE; API-ACCOUNT-LIST; API-CATEGORY-LIST

### Notes

Specification alignment: Transaction ownership follows Users → Accounts → Transactions. category_id is optional/nullable; shopName and paymentMethod are required and must be non-empty. BR-TXN-08..15 belong to UC-04 and are intentionally distinct from UC-03 rules BR-TXN-01..07.

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

class CreateTransactionDto <<DTO>> {
  accountId: Integer [1]
  transactionDate: Date [1]
  type: TransactionType [1]
  itemDescription: String [1]
  category_id: Integer [0..1]
  shopName: String [1]
  amount: Decimal [1]
  paymentMethod: String [1]
  status: TransactionStatus [0..1]
}

class CreateTransactionDataDto <<DTO>> {
  transactionId: Integer [1]
  accountId: Integer [1]
  transactionDate: Date [1]
  type: TransactionType [1]
  itemDescription: String [1]
  shopName: String [1]
  amount: Decimal [1]
  paymentMethod: String [1]
  status: TransactionStatus [1]
  receiptId: Integer [0..1]
  category_id: Integer [0..1]
}

class CreateTransactionResponseDto <<DTO>> {
  message: String [1]
  data: CreateTransactionDataDto [1]
}

class TransactionService <<Service>> {
  create(user_id: Integer, dto: CreateTransactionDto): CreateTransactionResponseDto
}

User "1" -- "0..*" Account : owns
Account "1" -- "0..*" Transaction : contains
Category "0..1" -- "0..*" Transaction : classifies

TransactionService ..> CreateTransactionDto
TransactionService ..> CreateTransactionResponseDto
CreateTransactionResponseDto --> CreateTransactionDataDto
CreateTransactionDataDto ..> Transaction : maps from

@enduml
~~~

## Business Rules

The following rules are authoritative for Prompt E. OCL is preserved where supplied; technical or non-OCL constraints remain authoritative natural-language requirements.

~~~text
BR-TXN-08: Required transaction data
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

BR-TXN-09: Allowed transaction type and status
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

BR-TXN-10: Optional category must be valid when supplied
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

BR-TXN-11: Account ownership
context TransactionService::create(
  user_id : Integer,
  dto : CreateTransactionDto
) : CreateTransactionResponseDto

pre BR_TXN_11_AccountOwnedByUser:
  Account.allInstances()->exists(a |
    a.account_id = dto.accountId and
    a.user_id = user_id
  )

BR-TXN-12: Sufficient balance for Expense
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

BR-TXN-13: Account balance adjustment
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

BR-TXN-14: Created transaction maps to the request and database
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

BR-TXN-15: Atomic transaction creation
Technical constraints:
- The Transactions insert and Accounts.balance update shall execute in one database transaction.
- If any validation, persistence, or balance-update step fails before commit, the operation shall roll back and leave both Transactions and Accounts unchanged by this request.
- shopName maps to Transactions.shop_name and paymentMethod maps to Transactions.payment_method; both are mandatory and shall not be null or empty.
- category_id maps to Transactions.category_id and remains optional/nullable.
~~~

