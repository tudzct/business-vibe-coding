---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-08
uc_name: "Edit a Bank Account"
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "Use cases"
source_range: "A153:B199"
retrieved_at: 2026-08-27T03:49:28.570Z
---

# UC-08: Edit a Bank Account

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab Use cases, columns A-B. This frozen repository projection is read-only; source corrections must be made in the spreadsheet and imported as a new revision.

## Functional Use-Case Specification

### Use Case ID

UC-08

### Use Case Name

Edit a Bank Account

### Description

As an authenticated account owner, I want to edit an account's bank name, type, branch, full account number, and balance.

### Actor(s)

Authenticated User

### Priority

Not Specified

### Trigger

The user selects Edit on an account detail page.

### Pre-Condition(s)

PRE-1: The user is authenticated.
PRE-2: The account exists and is owned by the authenticated user.
PRE-3: Account details have been loaded.

### Post-Condition(s)

POST-1: On success, the account fields are overwritten with the submitted values.
POST-2: The final four characters of the account identifier are derived automatically by the system.
POST-3: On success, the system displays a success toast notification ("Update successful"), waits 1500 ms, closes the edit form, and reloads the account details to reflect the updated data.
POST-4: On failure, the stored account remains unchanged by the failed request.

### Basic Flow

1. The user opens an account detail page and selects Edit.
2. AccountEditForm is populated from loaded AccountDetail data.
3. The user changes bank_name, account_type, optional branch_name, account_number_full, or balance.
4. The user selects Save Changes.
5. The frontend validates all required fields, including format structure and domain constraints.
6. The frontend submits the modification payload to the accounts resource.
7. The controller validates that id parses to an integer.
8. AccountService verifies that the account exists and belongs to userId.
9. ValidationPipe and AccountService validate the submitted fields.
10. The system processes the modification, deriving any necessary internal fields, and persists the changes to the ledger.
11. The frontend displays a success toast, waits 1500ms, and invokes its success callback; AccountDetailPage reloads account data and exits edit mode.

### Alternative Flow

AF-1: Optional branch omitted
3a. The user clears branch_name.
10a. The backend stores branchName as undefined/null.

AF-2: Cancel
4a. The user selects Cancel and the detail page exits edit mode without sending an update request.

### Exception Flow

EF-1: Client-side or DTO validation failure
5a. The frontend displays field errors, or the backend returns HTTP 400.

EF-2: Account not found
8a. The backend returns HTTP 404.

EF-3: Account belongs to another user
8a. The backend returns HTTP 403 and the frontend displays its permission error.

EF-4: Storage failure
10a. The backend returns HTTP 500 and the frontend displays its save failure message.

### Related UI

AccountDetailPage; AccountEditForm; route /accounts/:id

### Related API IDs

API-ACCOUNT-UPDATE

### Notes

Clarification: When account_number_full is changed, the new value must remain unique among the authenticated user's accounts.

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

class UpdateAccountDto <<DTO>> {
  bank_name: String [1]
  account_type: AccountType [1]
  branch_name: String [0..1]
  account_number_full: String [1]
  balance: Decimal [1]
}
note left of UpdateAccountDto
  account_number_last_4 is deliberately omitted 
  from input to enforce backend derivation.
end note

class UpdatedAccountDto <<DTO>> {
  account_id: Integer [1]
  user_id: Integer [1]
  bank_name: String [1]
  account_type: AccountType [1]
  branch_name: String [0..1]
  account_number_full: String [1]
  account_number_last_4: String [1]
  balance: Decimal [1]
}

class UpdateAccountResponseDto <<DTO>> {
  message: String [1]
  account: UpdatedAccountDto [1]
}

class AccountService <<Service>> {
  update(accountId: Integer, userId: Integer, dto: UpdateAccountDto): UpdatedAccountDto
}

User "1" -- "0..*" Account : owns
AccountService ..> UpdatedAccountDto
AccountService ..> UpdateAccountDto
UpdateAccountDto ..> Account : mapped to
UpdatedAccountDto ..> Account : mapped from
UpdateAccountResponseDto *-- "1" UpdatedAccountDto : contains

@enduml
~~~

## Business Rules

The following rules are authoritative for Prompt E. OCL is preserved where supplied; technical or non-OCL constraints remain authoritative natural-language requirements.

~~~text
BR-ACC-19: Account ownership validation for update
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
pre BR_ACC_19_MustOwnAccount:
  Account.allInstances()->exists(a |
    a.account_id = accountId and
    a.user_id = userId
  )

BR-ACC-20: Allowed account types for update
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
pre BR_ACC_20_ValidType:
  Set{AccountType::Checking, AccountType::Credit_Card, AccountType::Savings, AccountType::Investment, AccountType::Loan}->includes(dto.account_type)

BR-ACC-21: Required account text fields for update
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
pre BR_ACC_21_RequiredText:
  not dto.bank_name.oclIsUndefined() and dto.bank_name.trim().size() > 0 and
  not dto.account_number_full.oclIsUndefined() and dto.account_number_full.trim().size() > 0

BR-ACC-22: Account number format and length for update
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
pre BR_ACC_22_NumericCharactersOnly:
  not dto.account_number_full.oclIsUndefined() and 
  matches(dto.account_number_full, '^[0-9]+$')
pre BR_ACC_22_LengthConstraints:
  dto.account_number_full.size() >= 8 and dto.account_number_full.size() <= 34

BR-ACC-23: Numeric non-negative account balance for update
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
pre BR_ACC_23_IsNumeric:
  dto.balance.oclIsTypeOf(Real) or dto.balance.oclIsTypeOf(Integer)
pre BR_ACC_23_NonNegativeBalance:
  not dto.balance.oclIsUndefined() and dto.balance >= 0

BR-ACC-24: Optional branch name handling during update
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
pre BR_ACC_24_BranchNameOptional:
  dto.branch_name.oclIsUndefined() or dto.branch_name.oclIsTypeOf(String)

BR-ACC-25: Derive final four account characters for update
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
post BR_ACC_25_DeriveLast4:
  let updatedAcc = Account.allInstances()->any(a | a.account_id = accountId) in
  updatedAcc.account_number_last_4 = dto.account_number_full.substring(
    dto.account_number_full.size() - 3, 
    dto.account_number_full.size()
  )
Technical constraint:
- The backend MUST implicitly derive account_number_last_4 by taking the exact last 4 characters of the submitted account_number_full.

BR-ACC-26: Account update persistence mapping
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
post BR_ACC_26_StorageMapping:
  Account.allInstances()->exists(a |
    a.account_id = accountId and
    a.bank_name = dto.bank_name and
    a.account_type = dto.account_type and
    (dto.branch_name.oclIsUndefined() implies a.branch_name.oclIsUndefined()) and
    (not dto.branch_name.oclIsUndefined() implies a.branch_name = dto.branch_name) and
    a.account_number_full = dto.account_number_full and
    a.balance = dto.balance
  )
~~~
