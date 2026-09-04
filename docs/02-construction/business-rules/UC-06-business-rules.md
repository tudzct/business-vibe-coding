---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-06
source_use_case: docs/01-inception/use-cases/uc-06-add-bank-account.md
source_use_case_sha256: sha256:4994be6bc348af9f8c788dd765918b65cb1c6bb725e8952442e3e1150c6ed66c
---

# UC-06 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A106:B130`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-08-27T03:49:28.570Z`

## Ordered Business Rules

### BR-ACC-07 - Allowed account type

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_07_ValidType:
  Set{'Checking', 'Credit Card', 'Savings', 'Investment', 'Loan'}->includes(dto.account_type)
~~~

- Context: `AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Invalid account types fail client-side validation before submission when possible; backend DTO/service validation remains authoritative and returns HTTP 400 for an invalid request.
- Traceability: `Use cases!A106:B130`; UC-06 Basic Flow 3, 5, 7-8; UC-06 EF-1 and EF-3; `API-ACCOUNT-CREATE`

### BR-ACC-08 - Required account text fields

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_08_RequiredText:
  not dto.bank_name.oclIsUndefined() and dto.bank_name.trim().size() > 0 and
  not dto.account_number_full.oclIsUndefined() and dto.account_number_full.trim().size() > 0
~~~

- Context: `AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Missing or blank required text fields display field errors and prevent submission on the frontend; backend validation returns HTTP 400 when such a request reaches the API.
- Traceability: `Use cases!A106:B130`; UC-06 Basic Flow 3, 5, 7-8; UC-06 EF-1 and EF-3; `API-ACCOUNT-CREATE`

### BR-ACC-09 - Numeric non-negative account balance

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_09_IsNumeric:
  dto.balance.oclIsTypeOf(Real) or dto.balance.oclIsTypeOf(Integer)

pre BR_ACC_09_NonNegativeBalance:
  not dto.balance.oclIsUndefined() and dto.balance >= 0
Technical constraint:
- The balance must be a valid numeric type (not a string), and must be greater than or equal to zero.
~~~

- Context: `AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: A non-numeric, missing, or negative balance displays a field error and prevents frontend submission; backend validation returns HTTP 400 if an invalid balance reaches the API.
- Traceability: `Use cases!A106:B130`; UC-06 Basic Flow 3, 5, 7-8; UC-06 EF-1 and EF-3; `API-ACCOUNT-CREATE`

### BR-ACC-10 - Unique account number per owner

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_10_UniqueAccount:
  not Account.allInstances()->exists(a | 
    a.user_id = userId and 
    a.account_number_full = dto.account_number_full
  )
~~~

- Context: `AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: When the authenticated owner already has the submitted full account number, creation is rejected with HTTP 409 and no account is added.
- Traceability: `Use cases!A106:B130`; UC-06 POST-3; UC-06 EF-2; `API-ACCOUNT-CREATE`

### BR-ACC-11 - Derive final four account characters

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

post BR_ACC_11_DeriveLast4:
  let newAcc = Account.allInstances()->any(a | a.account_id = result.id) in
  newAcc.account_number_last_4 = dto.account_number_full.substring(dto.account_number_full.size() - 3, dto.account_number_full.size())

Technical constraint:
- The backend derives account_number_last_4 by taking the exact last 4 characters of the submitted account_number_full (e.g., via .slice(-4)).
~~~

- Context: `AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A successfully created account stores account_number_last_4 as the exact final four characters of the submitted account_number_full.
- Traceability: `Use cases!A106:B130`; UC-06 POST-1; UC-06 Basic Flow 8-9; `API-ACCOUNT-CREATE`

### BR-ACC-12 - Account creation persistence mapping

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

post BR_ACC_12_StorageMapping:
  Account.allInstances()->exists(a |
    a.account_id = result.id and
    a.user_id = userId and
    a.bank_name = dto.bank_name and
    a.account_type = dto.account_type and
    a.branch_name = dto.branch_name and
    a.account_number_full = dto.account_number_full and
    a.balance = dto.balance
  )

post BR_ACC_12_ResponseMapping:
  result.id = Account.allInstances()->any(a | a.account_number_full = dto.account_number_full).account_id
~~~

- Context: `AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A successful response maps to the persisted account created for the authenticated user; a storage failure returns HTTP 500 and the account is not added by the request.
- Traceability: `Use cases!A106:B130`; UC-06 POST-1 and POST-3; UC-06 Basic Flow 8-9; UC-06 EF-4; `API-ACCOUNT-CREATE`

### BR-ACC-13 - Account number format and length

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_13_NumericCharactersOnly:
  not dto.account_number_full.oclIsUndefined() and 
  matches(dto.account_number_full, '^[0-9]+$')
pre BR_ACC_13_LengthConstraints:
  dto.account_number_full.size() >= 8 and dto.account_number_full.size() <= 34

Technical constraint:
- account_number_full must contain only numeric digits.
- The length must be between 8 and 34 characters (to safely derive the last 4 digits and reflect real-world bank account numbers).
~~~

- Context: `AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: An account number containing non-digits or fewer than 8 or more than 34 characters displays a field error and prevents frontend submission; backend validation returns HTTP 400 if it reaches the API.
- Traceability: `Use cases!A106:B130`; UC-06 Basic Flow 3, 5, 7-8; UC-06 EF-1 and EF-3; `API-ACCOUNT-CREATE`

### BR-ACC-14 - Conditional branch name requirement

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_14_BranchNameConditional:
  if Set{'Loan', 'Investment'}->includes(dto.account_type) then
    not dto.branch_name.oclIsUndefined() and dto.branch_name.trim().size() > 0
  else
    dto.branch_name.oclIsUndefined() or dto.branch_name.oclIsTypeOf(String)
  endif

Technical constraint:
- This rule overrides the base optional branch rule. If the account_type is 'Loan' or 'Investment', the branch_name field is strictly required and cannot be empty.
- For all other account types, branch_name is optional. If omitted, it shall be processed and stored as null or undefined.
~~~

- Context: `AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: Loan and Investment submissions without a non-empty branch name are rejected; other account types may omit branch_name, which is stored as null or undefined.
- Traceability: `Use cases!A106:B130`; UC-06 AF-1; UC-06 EF-1 and EF-3; `API-ACCOUNT-CREATE`

### BR-ACC-15 - Minimum initial deposit for specific types

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_15_MinInitialDeposit:
  if Set{'Savings', 'Investment'}->includes(dto.account_type) then
    not dto.balance.oclIsUndefined() and dto.balance >= 50000
  else
    not dto.balance.oclIsUndefined() and dto.balance >= 0
  endif

Technical constraint:
- If the user creates a 'Savings' or 'Investment' account, the initial balance must be at least 50,000.
- For other account types, the balance can be 0 or more.
~~~

- Context: `AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Savings or Investment creation with balance below 50,000 is rejected; other account types require a balance of zero or more.
- Traceability: `Use cases!A106:B130`; UC-06 Basic Flow 3, 5, 7-8; UC-06 EF-1 and EF-3

### BR-ACC-16 - Financial capacity proof for Investment accounts

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_16_InvestmentCapacity:
  dto.account_type = 'Investment' implies
    Account.allInstances()
      ->select(a | a.user_id = userId and (a.account_type = 'Checking' or a.account_type = 'Savings'))
      ->collect(balance)
      ->sum() >= 100000
      
Technical constraint:
- If a user attempts to create an 'Investment' account, the backend must query the user's existing accounts.
- The creation is only allowed if the sum of the balances of all the user's existing 'Checking' and 'Savings' accounts is greater than or equal to 100,000.
- If the user does not meet this financial capacity requirement, the request must be rejected.
~~~

- Context: `AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Investment account creation is rejected unless the authenticated user's existing Checking and Savings account balances total at least 100,000.
- Traceability: `Use cases!A106:B130`; UC-06 Basic Flow 8; UC-06 POST-3

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
