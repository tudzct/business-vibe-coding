---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-09
source_use_case: docs/01-inception/use-cases/uc-09-delete-bank-account.md
source_use_case_sha256: sha256:7cb25abbce1f2dd5f5e49b289fd461eeb8430a63c4de9132aa9f5f96030f7451
---

# UC-09 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A200:B218`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-08-27T03:49:28.570Z`

## Ordered Business Rules

### BR-ACC-27 - Account deletion ownership validation

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto
pre BR_ACC_27_MustOwnAccount:
  Account.allInstances()->exists(a | a.account_id = accountId and a.user_id = userId)
Technical constraint:
- If the account does not exist or does not belong to the user, the backend intentionally throws a 404 NotFoundException to prevent data enumeration.
~~~

- Context: `AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: If the account does not exist or does not belong to the authenticated application user, the backend throws HTTP 404 NotFoundException to prevent data enumeration.
- Traceability: `Use cases!A200:B218`; UC-09 PRE-2 and EF-2; `API-ACCOUNT-DELETE`

### BR-ACC-28 - Account deletion data integrity (Cascading)

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
context AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto
post BR_ACC_28_AtomicDeletion:
  not Account.allInstances()->exists(a | a.account_id = accountId) and
  not Transaction.allInstances()->exists(t | t.account_id = accountId)
Technical constraint:
- The backend MUST execute the deletion of all related Transaction rows and the Account row within a single atomic database transaction (using QueryRunner). If any step fails, the entire transaction rolls back.
~~~

- Context: `AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Successful deletion removes the Account and all related Transaction rows; if any deletion step fails, the transaction rolls back and the API returns the source-defined HTTP 500 processing failure.
- Traceability: `Use cases!A200:B218`; UC-09 POST-1 and Basic Flow 6-7; UC-09 UML AccountService deletes Account and Transaction cascade; UC-09 EF-4; `API-ACCOUNT-DELETE`

### BR-ACC-29 - Unsettled transaction protection

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: An account containing any Pending transaction produces HTTP 409 ConflictException and leaves the Account, its Transactions, and User.total_balance unchanged.
- Traceability: `Use cases!A200:B218`; UC-09 EF-3; `API-ACCOUNT-DELETE` HTTP 409

### BR-ACC-30 - Cross-entity net worth synchronization

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A successful deletion stores User.total_balance as the database-decimal sum of all remaining owned-account balances in the same atomic transaction; failure rolls back the deletion and synchronization together.
- Traceability: `Use cases!A200:B218`; UC-09 UML User owns Account; UC-09 EF-4; `API-ACCOUNT-DELETE`

### BR-ACC-31 - Portfolio liquidity coverage after deletion

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
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

- Context: `AccountService::delete(accountId : Integer, userId : Integer) : DeleteAccountResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: If remaining Checking and Savings balances do not cover 120% of remaining Loan balances plus all remaining Pending expenses, deletion returns HTTP 409 and persists no Account, Transaction, or User changes.
- Traceability: `Use cases!A200:B218`; UC-09 EF-3; UC-09 UML AccountType and Transaction; `API-ACCOUNT-DELETE` HTTP 409

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
