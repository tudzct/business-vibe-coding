---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-09
uc_name: "Delete a Bank Account"
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "Use cases"
source_range: "A200:B218"
retrieved_at: 2026-08-27T03:49:28.570Z
---

# UC-09: Delete a Bank Account

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab Use cases, columns A-B. This frozen repository projection is read-only; source corrections must be made in the spreadsheet and imported as a new revision.

## Functional Use-Case Specification

### Use Case ID

UC-09

### Use Case Name

Delete a Bank Account

### Description

As a user, I want to delete a specified account.

### Actor(s)

Authenticated User

### Priority

Not Specified

### Trigger

The user selects Delete from an account card or account detail page.

### Pre-Condition(s)

PRE-1: The user is authenticated.
PRE-2: The system resolves the requested account identifier.

### Post-Condition(s)

POST-1: On confirmed success, the account is no longer available to the user.
POST-2: On confirmed success, the system displays a success dialog, waits 1500ms, and then refreshes the account list or navigates to /accounts.

### Basic Flow

1. The user selects Delete for an account.
2. Delete Account Modal displays the bank name, final four account digits, and a warning about the deletion.
3. The user selects Confirm Delete.
4. The frontend submits the deletion request to the accounts resource.
5. The controller validates that id parses to an integer.
6. The system processes the request.
7. The system removes the account.
8. The frontend closes the modal, displays a success dialog, waits 1500ms, and then refreshes the list or navigates to /accounts.

### Alternative Flow

AF-1: Cancel deletion
3a. The user selects Cancel or closes the modal.
3b. No API request is sent.

### Exception Flow

EF-1: Invalid account ID
5a. The controller returns HTTP 400.

EF-2: Account unavailable
6a. The backend returns HTTP 404.

EF-3: Request conflict
6b. The backend returns HTTP 409.

EF-4: Processing failure
6c. The backend returns HTTP 500.

### Related UI

AccountListPage; AccountDetailPage; DeleteAccountModal

### Related API IDs

API-ACCOUNT-DELETE

### Notes

Standard REST semantics apply to request processing and resource resolution.

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
  branch_name: String [0..1]
  account_number_full: String [1]
  account_number_last_4: String [1]
  balance: Decimal [1]
}

class Transaction <<Entity>> {
  transaction_id: Integer [1]
  account_id: Integer [1]
  transaction_date: Date [1]
  type: TransactionType [1]
  item_description: String [1]
  shop_name: String [0..1]
  amount: Decimal [1]
  payment_method: String [0..1]
  status: TransactionStatus [1]
  receipt_id: String [0..1]
  category_id: Integer [0..1]
}

enum AccountType {
  Checking
  Credit_Card
  Savings
  Investment
  Loan
}

enum TransactionType {
  Revenue
  Expense
}

enum TransactionStatus {
  Complete
  Pending
  Failed
}

class DeleteAccountResponseDto <<DTO>> {
  message: String [1]
  deleted_account_id: Integer [1]
}

class AccountService <<Service>> {
  delete(accountId: Integer, userId: Integer): DeleteAccountResponseDto
}

User "1" -- "0..*" Account : owns
Account "1" -- "0..*" Transaction : contains
AccountService ..> DeleteAccountResponseDto
AccountService ..> Account : deletes
AccountService ..> Transaction : deletes cascade

@enduml
~~~

## Business Rules

The following rules are candidate requirements for researcher review. OCL and natural-language constraints become authoritative only after promotion through the canonical source workflow.

~~~text
BR-ACC-27: Account deletion ownership validation
context AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto
pre BR_ACC_27_MustOwnAccount:
  Account.allInstances()->exists(a | a.account_id = accountId and a.user_id = userId)
Technical constraint:
- If the account does not exist or does not belong to the user, the backend intentionally throws a 404 NotFoundException to prevent data enumeration.

BR-ACC-28: Account deletion data integrity (Cascading)
context AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto
post BR_ACC_28_AtomicDeletion:
  not Account.allInstances()->exists(a | a.account_id = accountId) and
  not Transaction.allInstances()->exists(t | t.account_id = accountId)
Technical constraint:
- The backend MUST execute the deletion of all related Transaction rows and the Account row within a single atomic database transaction (using QueryRunner). If any step fails, the entire transaction rolls back.

BR-ACC-29: Unsettled transaction protection
context AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto
pre BR_ACC_29_NoPendingTransactions:
  not Transaction.allInstances()->exists(t |
    t.account_id = accountId and
    t.status = TransactionStatus::Pending
  )
Technical constraint:
- The backend MUST throw a 409 ConflictException if the account contains any Pending transaction.
- The validation MUST use the same locked database snapshot as the deletion operation so that a concurrent request cannot introduce a new Pending transaction after validation.
- Rejected deletion MUST leave the Account, its Transactions, and User.total_balance unchanged.

BR-ACC-30: Cross-entity net worth synchronization
context AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto
post BR_ACC_30_SyncUserTotalBalance:
  let newSum : Decimal =
    Account.allInstances()
      ->select(a | a.user_id = userId)
      ->collect(a | a.balance)
      ->sum()
  in
    User.allInstances()->exists(u |
      u.user_id = userId and
      u.total_balance = newSum
    )
Technical constraint:
- The backend MUST recalculate the user's total_balance from all remaining accounts and update the User entity within the same atomic database transaction used for deletion.
- The calculation MUST use database decimal arithmetic and a consistent locked snapshot; it MUST NOT derive the result from client input or an unchecked cached total.

BR-ACC-31: Portfolio liquidity coverage after deletion
context AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto
pre BR_ACC_31_RemainingLiquidityCoverage:
  let remainingLiquidAssets : Decimal =
    Account.allInstances()
      ->select(a |
        a.user_id = userId and
        a.account_id <> accountId and
        (a.account_type = AccountType::Checking or
         a.account_type = AccountType::Savings)
      )
      ->collect(a | a.balance)
      ->sum()
  in
  let remainingLoanDebt : Decimal =
    Account.allInstances()
      ->select(a |
        a.user_id = userId and
        a.account_id <> accountId and
        a.account_type = AccountType::Loan
      )
      ->collect(a | a.balance)
      ->sum()
  in
  let remainingPendingExpenses : Decimal =
    Transaction.allInstances()
      ->select(t |
        t.type = TransactionType::Expense and
        t.status = TransactionStatus::Pending and
        Account.allInstances()->exists(a |
          a.account_id = t.account_id and
          a.user_id = userId and
          a.account_id <> accountId
        )
      )
      ->collect(t | t.amount)
      ->sum()
  in
    remainingLiquidAssets >=
      (remainingLoanDebt * 1.20) + remainingPendingExpenses
Technical constraints:
- The backend MUST evaluate the coverage formula from a consistent locked database snapshot.
- Deletion MUST return HTTP 409 when the user's remaining Checking and Savings balances do not cover 120% of remaining Loan balances plus all remaining Pending expenses.
- A coverage rejection MUST persist no Account, Transaction, or User changes.
~~~

