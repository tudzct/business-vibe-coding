---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-05
source_use_case: docs/01-inception/use-cases/uc-05-view-bank-accounts.md
source_use_case_sha256: sha256:fe08cb8f7877f07891e484e1723fecb3915b55702a97b14a042b5a3c1c54da44
---

# UC-05 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A83:B105`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-08-27T03:49:28.570Z`

## Ordered Business Rules

### BR-ACC-01 - Account ownership scope

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context AccountService::findAllByUserId(
  user_id : Integer
) : AccountListResponseDto

pre BR_ACC_01_UserDefined:
  not user_id.oclIsUndefined()

post BR_ACC_01_OwnedAccountsOnly:
  result.success implies
    result.data.accounts->forAll(dto |
      Account.allInstances()->exists(a |
        a.account_id = dto.id and
        a.user_id = user_id
      )
    )
~~~

- Context: `AccountService::findAllByUserId(user_id : Integer) : AccountListResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A missing, invalid, or expired authenticated identity is rejected with HTTP 401; a successful list contains only accounts owned by the authenticated user.
- Traceability: `Use cases!A83:B105`; `UC-05 PRE-1`; `UC-05 Basic Flow 3-4`; `UC-05 POST-1`; `API-ACCOUNT-LIST`

### BR-ACC-02 - Ordering

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context AccountService::findAllByUserId(
  user_id : Integer
) : AccountListResponseDto

post BR_ACC_02_OrderedByAccountIdAsc:
  result.success implies
    result.data.accounts->size() <= 1 or
    Sequence{1..result.data.accounts->size()-1}->forAll(i |
      result.data.accounts->at(i).id < result.data.accounts->at(i + 1).id
    )
~~~

- Context: `AccountService::findAllByUserId(user_id : Integer) : AccountListResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Every successful response orders owned accounts by account ID ascending; the source defines no separate error response for an ordering violation.
- Traceability: `Use cases!A83:B105`; `UC-05 POST-2`; `UC-05 Basic Flow 4`; `API-ACCOUNT-LIST`

### BR-ACC-03 - Response rows map to persisted Accounts

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context AccountService::findAllByUserId(
  user_id : Integer
) : AccountListResponseDto

post BR_ACC_03_ResponseBackedByAccount:
  result.success implies
    result.data.accounts->forAll(dto |
      Account.allInstances()->exists(a |
        a.account_id = dto.id and
        a.bank_name = dto.bank_name and
        a.account_type = dto.account_type and
        a.branch_name = dto.branch_name and
        a.account_number_last_4 = dto.account_number_last_4 and
        a.balance = dto.balance
      )
    )
~~~

- Context: `AccountService::findAllByUserId(user_id : Integer) : AccountListResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Each successful response row maps directly from one persisted Account; retrieval failures return the source-defined HTTP 500 safe error.
- Traceability: `Use cases!A83:B105`; `UC-05 Basic Flow 4-6`; `UC-05 UML Account and AccountDto`; `API-ACCOUNT-LIST`

### BR-ACC-04 - Account number exposure restriction

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context AccountService::findAllByUserId(
  user_id : Integer
) : AccountListResponseDto
post BR_ACC_04_NoFullAccountNumber:
  result.success implies
    result.data.accounts->forAll(dto |
      dto.account_number_full.oclIsUndefined()
    )

Technical constraints:
- The backend shall only query the necessary columns to optimize performance.
- The backend shall not return the full account number (account_number_full) in the list response to prevent exposing sensitive data over the network.
- The backend shall return only the stored account_number_last_4.
- The frontend shall mask the account number by prefixing these 4 digits with exactly four asterisks (e.g., ""**** 1234""), regardless of the original account number's length."
~~~

- Context: `AccountService::findAllByUserId(user_id : Integer) : AccountListResponseDto; account-list presentation`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: The full account number is never selected or returned by the list endpoint; the client displays only the stored last four digits prefixed with exactly four asterisks.
- Traceability: `Use cases!A83:B105`; `UC-05 Basic Flow 5 and 7`; `UC-05 UML AccountDto`; `API-ACCOUNT-LIST`

### BR-ACC-05 - Empty account result

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context AccountService::findAllByUserId(
  user_id : Integer
) : AccountListResponseDto
post BR_ACC_05_EmptyResultConsistency:
  not Account.allInstances()->exists(a | a.user_id = user_id)
  implies
    result.success and
    result.data.accounts->isEmpty()
~~~

- Context: `AccountService::findAllByUserId(user_id : Integer) : AccountListResponseDto; account-list empty state`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: When the authenticated user owns no accounts, the API returns success with an empty accounts array and the client displays the no-account state with an Add Account action to `/accounts/add`.
- Traceability: `Use cases!A83:B105`; `UC-05 POST-3`; `UC-05 AF-1`; `API-ACCOUNT-LIST`

### BR-ACC-06 - Viewing accounts is read-only

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context AccountService::findAllByUserId(
  user_id : Integer
) : AccountListResponseDto

post BR_ACC_06_AccountIdentityUnchanged:
  Account.allInstances()->collect(a | a.account_id)->asSet() =
  Account.allInstances()@pre->collect(a | a.account_id)->asSet()

post BR_ACC_06_AccountDataUnchanged:
  Account.allInstances()->forAll(a |
    Account.allInstances()@pre->exists(old |
      old.account_id = a.account_id and
      old.user_id = a.user_id and
      old.bank_name = a.bank_name and
      old.account_type = a.account_type and
      old.branch_name = a.branch_name and
      old.account_number_full = a.account_number_full and
      old.account_number_last_4 = a.account_number_last_4 and
      old.balance = a.balance
    )
  )

Technical constraint:
- Listing accounts shall not create, update, or delete any Account or Transaction records.
~~~

- Context: `AccountService::findAllByUserId(user_id : Integer) : AccountListResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: The GET list operation performs no Account or Transaction creation, update, or deletion; the source defines no separate error response for a read-only violation.
- Traceability: `Use cases!A83:B105`; `UC-05 Basic Flow 2-6`; `API-ACCOUNT-LIST`

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.

