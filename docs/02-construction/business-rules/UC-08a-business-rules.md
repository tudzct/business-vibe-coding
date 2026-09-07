---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-08a
source_use_case: docs/01-inception/use-cases/uc-08a-quick-edit-bank-account.md
source_use_case_sha256: sha256:3e34d75e07702605c4ea5c00212325e11c659932c9c8914f2e2195ec8a9bf061
---

# UC-08a Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Variant tab/range: `Use cases!A180:B196`
- Inherited rule source: `docs/01-inception/use-cases/uc-08-edit-bank-account.md`, `Use cases!A153:B199`, SHA-256 `5da3d61d3bed32941c0d49c34aa37694a83b345b5b6bf12d860f7dff963fc35b`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-08-27T03:49:28.570Z`

UC-08a is a UI variant whose frozen specification explicitly reuses UC-08's backend operation and the ordered range BR-ACC-19 through BR-ACC-26. The expressions below are preserved exactly from that frozen inherited source.

## Ordered Business Rules

### BR-ACC-19 - Account ownership validation for update

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `AccountService::update(accountId : Integer, userId : Integer, dto : UpdateAccountDto) : UpdatedAccountDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A nonexistent account returns HTTP 404; an account owned by another application user returns HTTP 403, and the stored account remains unchanged.
- Traceability: `Use cases!A180:B196`; UC-08a PRE-2 and Basic Flow 9-10; UC-08a EF-2 and EF-3 inherited from UC-08; `Use cases!A153:B199`; `API-ACCOUNT-UPDATE`

### BR-ACC-20 - Allowed account types for update

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
pre BR_ACC_20_ValidType:
  Set{AccountType::Checking, AccountType::Credit_Card, AccountType::Savings, AccountType::Investment, AccountType::Loan}->includes(dto.account_type)
~~~

- Context: `AccountService::update(accountId : Integer, userId : Integer, dto : UpdateAccountDto) : UpdatedAccountDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: An unsupported account type displays a client-side field error when possible; authoritative backend validation returns HTTP 400 and does not update the account.
- Traceability: `Use cases!A180:B196`; UC-08a Basic Flow 5, 7 and 11; UC-08a EF-1 inherited from UC-08; `Use cases!A153:B199`; `API-ACCOUNT-UPDATE`

### BR-ACC-21 - Required account text fields for update

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
pre BR_ACC_21_RequiredText:
  not dto.bank_name.oclIsUndefined() and dto.bank_name.trim().size() > 0 and
  not dto.account_number_full.oclIsUndefined() and dto.account_number_full.trim().size() > 0
~~~

- Context: `AccountService::update(accountId : Integer, userId : Integer, dto : UpdateAccountDto) : UpdatedAccountDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Missing or blank required text displays a client-side field error and prevents submission; backend validation returns HTTP 400 when such a request reaches the API.
- Traceability: `Use cases!A180:B196`; UC-08a Basic Flow 5, 7 and 11; UC-08a EF-1 inherited from UC-08; `Use cases!A153:B199`; `API-ACCOUNT-UPDATE`

### BR-ACC-22 - Account number format and length for update

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `AccountService::update(accountId : Integer, userId : Integer, dto : UpdateAccountDto) : UpdatedAccountDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: An account number containing non-digits or fewer than 8 or more than 34 characters displays a field error and prevents frontend submission; backend validation returns HTTP 400 if it reaches the API.
- Traceability: `Use cases!A180:B196`; UC-08a Basic Flow 5, 7 and 11; UC-08a EF-1 inherited from UC-08; `Use cases!A153:B199`; `API-ACCOUNT-UPDATE`; Figma `4795:5` account hint

### BR-ACC-23 - Numeric non-negative account balance for update

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
pre BR_ACC_23_IsNumeric:
  dto.balance.oclIsTypeOf(Real) or dto.balance.oclIsTypeOf(Integer)
pre BR_ACC_23_NonNegativeBalance:
  not dto.balance.oclIsUndefined() and dto.balance >= 0
~~~

- Context: `AccountService::update(accountId : Integer, userId : Integer, dto : UpdateAccountDto) : UpdatedAccountDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: A missing, non-numeric, or negative balance displays a client-side field error and prevents submission; backend validation returns HTTP 400 when invalid balance data reaches the API.
- Traceability: `Use cases!A180:B196`; UC-08a Basic Flow 5, 7 and 11; UC-08a EF-1 inherited from UC-08; `Use cases!A153:B199`; `API-ACCOUNT-UPDATE`

### BR-ACC-24 - Optional branch name handling during update

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::update(
  accountId : Integer,
  userId : Integer,
  dto : UpdateAccountDto
) : UpdatedAccountDto
pre BR_ACC_24_BranchNameOptional:
  dto.branch_name.oclIsUndefined() or dto.branch_name.oclIsTypeOf(String)
~~~

- Context: `AccountService::update(accountId : Integer, userId : Integer, dto : UpdateAccountDto) : UpdatedAccountDto`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: The application user may omit or clear `branch_name`; the backend stores the omitted value as null or undefined without rejecting an otherwise valid update.
- Traceability: `Use cases!A180:B196`; UC-08a AF-2 and Basic Flow 5; `Use cases!A153:B199`; `API-ACCOUNT-UPDATE`

### BR-ACC-25 - Derive final four account characters for update

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `AccountService::update(accountId : Integer, userId : Integer, dto : UpdateAccountDto) : UpdatedAccountDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A successful update stores `account_number_last_4` as the exact final four characters of the submitted `account_number_full`; the client cannot supply this derived field.
- Traceability: `Use cases!A180:B196`; UC-08a POST-2 and Basic Flow 8 and 12; `Use cases!A153:B199`; `API-ACCOUNT-UPDATE`

### BR-ACC-26 - Account update persistence mapping

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
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

- Context: `AccountService::update(accountId : Integer, userId : Integer, dto : UpdateAccountDto) : UpdatedAccountDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A successful update overwrites the specified persisted account fields; validation, authorization, or storage failure leaves the stored account unchanged, with storage failure returning HTTP 500.
- Traceability: `Use cases!A180:B196`; UC-08a POST-1 and POST-4 and Basic Flow 12; UC-08a EF-4 inherited from UC-08; `Use cases!A153:B199`; `API-ACCOUNT-UPDATE`

## Unresolved items

- UC-08a inherits UC-08's requirement that a changed `account_number_full` remain unique among the authenticated application user's accounts, but the frozen UC and `API-ACCOUNT-UPDATE` do not prescribe the HTTP status or exact message for a duplicate. This does not change the verbatim BR set and must be resolved before implementation if the existing application has no established conflict convention.

This artifact contains every inherited BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.

