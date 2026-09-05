---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-07
source_use_case: docs/01-inception/use-cases/uc-07-view-bank-account-details.md
source_use_case_sha256: sha256:1a659cb3709498c42d8e7496b256ce36ae53a2463aa865c612db5ea5bb0b398a
---

# UC-07 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A131:B152`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-08-27T03:49:28.570Z`

## Ordered Business Rules

### BR-ACC-15 - Account existence and ownership

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::findOneWithTransactions(
  accountId : Integer,
  userId : Integer
) : AccountDetailResponseDto
pre BR_ACC_15_AccountMustBeOwned:
  Account.allInstances()->exists(a | 
    a.account_id = accountId and 
    a.user_id = userId
  )
~~~

- Context: `AccountService::findOneWithTransactions(accountId : Integer, userId : Integer) : AccountDetailResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A nonexistent account returns HTTP 404; an account not owned by the authenticated application user returns HTTP 403 and no unauthorized account data.
- Traceability: `Use cases!A131:B152`; UC-07 PRE-1, POST-3, Basic Flow 3-5; UC-07 EF-2 and EF-3; `API-ACCOUNT-DETAIL`

### BR-ACC-16 - Five most recent account transactions

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
context AccountService::findOneWithTransactions(
  accountId : Integer,
  userId : Integer
) : AccountDetailResponseDto
post BR_ACC_16_MaxFiveRecentTransactions:
  result.recent_transactions->size() <= 5
post BR_ACC_16_OrderedByDateDescending:
  result.recent_transactions->size() <= 1 or
  Sequence{1..result.recent_transactions->size()-1}->forAll(i |
    result.recent_transactions->at(i).date >= result.recent_transactions->at(i + 1).date
  )
Technical constraint:
- The backend shall return at most five transactions ordered by transaction_date descending.
~~~

- Context: `AccountService::findOneWithTransactions(accountId : Integer, userId : Integer) : AccountDetailResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: A successful response contains at most five transactions in descending transaction-date order; no matching transactions produces an empty array, while retrieval failure returns HTTP 500.
- Traceability: `Use cases!A131:B152`; UC-07 Description, Basic Flow 6-8; UC-07 AF-1 and EF-4; `API-ACCOUNT-DETAIL`

### BR-ACC-17 - Response rows map to persisted data with signed amounts

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
context AccountService::findOneWithTransactions(
  accountId : Integer,
  userId : Integer
) : AccountDetailResponseDto
post BR_ACC_17_ResponseBackedByAccount:
  Account.allInstances()->exists(a |
    a.account_id = result.id and
    a.user_id = userId and
    a.bank_name = result.bank_name and
    a.account_type = result.account_type and
    (a.branch_name.oclIsUndefined() implies result.branch_name.oclIsUndefined()) and
    (not a.branch_name.oclIsUndefined() implies a.branch_name = result.branch_name) and
    a.account_number_full = result.account_number_full and
    a.balance = result.balance
  )
post BR_ACC_17_ResponseBackedByTransaction:
  result.recent_transactions->forAll(tDto |
    Transaction.allInstances()->exists(t |
      t.account_id = accountId and
      t.item_description = tDto.description and
      ((t.type = TransactionTypeEnum::Expense and tDto.amount = -(t.amount)) or
       (t.type = TransactionTypeEnum::Revenue and tDto.amount = t.amount)) and
      t.status = tDto.status and
      (t.receipt_id.oclIsUndefined() implies tDto.receipt_id.oclIsUndefined()) and
      (not t.receipt_id.oclIsUndefined() implies t.receipt_id = tDto.receipt_id) and
      t.type = tDto.type and
      tDto.date = toIsoDate(t.transaction_date)
    )
  )
Technical constraint:
- In the account-detail mapping, Expense amounts are negated (returned as negative) and Revenue amounts remain positive.
- Unused persisted fields in Transaction (e.g., shop_name, payment_method, category_id) are intentionally excluded from the returned TransactionDto.
~~~

- Context: `AccountService::findOneWithTransactions(accountId : Integer, userId : Integer) : AccountDetailResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: A successful response maps the owned persisted account and its included transaction rows to the specified DTO, using negative Expense amounts, positive Revenue amounts, and ISO dates.
- Traceability: `Use cases!A131:B152`; UC-07 POST-1 and POST-2; UC-07 Basic Flow 4-8; `API-ACCOUNT-DETAIL`

### BR-ACC-18 - Account and transaction data unchanged

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
post BR_ACC_18_AccountIdentityUnchanged:
  Account.allInstances()->collect(a | a.account_id)->asSet() =
  Account.allInstances()@pre->collect(a | a.account_id)->asSet()
post BR_ACC_18_AccountDataUnchanged:
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
post BR_ACC_18_TransactionIdentityUnchanged:
  Transaction.allInstances()->collect(t | t.transaction_id)->asSet() =
  Transaction.allInstances()@pre->collect(t | t.transaction_id)->asSet()
post BR_ACC_18_TransactionDataUnchanged:
  Transaction.allInstances()->forAll(t |
    Transaction.allInstances()@pre->exists(old |
      old.transaction_id = t.transaction_id and
      old.account_id = t.account_id and
      old.category_id = t.category_id and
      old.transaction_date = t.transaction_date and
      old.type = t.type and
      old.item_description = t.item_description and
      old.shop_name = t.shop_name and
      old.amount = t.amount and
      old.payment_method = t.payment_method and
      old.status = t.status and
      old.receipt_id = t.receipt_id
    )
  )
Technical constraint:
- Viewing account details shall not create, update, or delete any Account or Transaction records.
~~~

- Context: `AccountService::findOneWithTransactions(accountId : Integer, userId : Integer) : AccountDetailResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Viewing account details leaves all Account and Transaction identities and persisted field values unchanged.
- Traceability: `Use cases!A131:B152`; UC-07 GET retrieval flow; `API-ACCOUNT-DETAIL`

### BR-ACC-19 - High-value expense transaction flagging

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
context AccountService::findOneWithTransactions(
  accountId : Integer,
  userId : Integer
) : AccountDetailResponseDto
post BR_ACC_19_HighValueFlag:
  let acc = Account.allInstances()->any(a | a.account_id = accountId) in
  result.recent_transactions->forAll(tDto |
    (tDto.type = TransactionTypeEnum::Expense and tDto.amount.abs() > (acc.balance / 2))
    implies tDto.description.substring(tDto.description.size() - 13, tDto.description.size()) = ' [HIGH VALUE]'
  )
Technical constraint:
- For any transaction in the response, if its type is Expense and its absolute amount strictly exceeds 50% of the account's current balance, the exact string " [HIGH VALUE]" must be appended to its description.
~~~

- Context: `AccountService::findOneWithTransactions(accountId : Integer, userId : Integer) : AccountDetailResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Each returned Expense whose absolute amount strictly exceeds half the current account balance has the exact suffix ` [HIGH VALUE]` appended to its description.
- Traceability: `Use cases!A131:B152`; UC-07 Basic Flow 7; `API-ACCOUNT-DETAIL`

### BR-ACC-20 - Cross-account risk exposure lock

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AccountService::findOneWithTransactions(
  accountId : Integer,
  userId : Integer
) : AccountDetailResponseDto
pre BR_ACC_20_RiskExposureLimit:
  let targetAccount = Account.allInstances()->any(a | a.account_id = accountId) in
  (targetAccount.account_type = AccountType::Investment or targetAccount.account_type = AccountType::Credit_Card)
  implies
  (
    Account.allInstances()->select(a | a.user_id = userId and a.account_type = AccountType::Loan)->collect(balance)->sum()
    <=
    Account.allInstances()->select(a | a.user_id = userId and (a.account_type = AccountType::Checking or a.account_type = AccountType::Savings))->collect(balance)->sum()
  )
Technical constraint:
- When a user attempts to view an Investment or Credit Card account, the system must calculate their total debt (sum of balances of all their Loan accounts) and total safe assets (sum of balances of all their Checking and Savings accounts).
- If the total debt is strictly greater than the total safe assets, the system must deny access by throwing an HTTP 403 Forbidden exception.
~~~

- Context: `AccountService::findOneWithTransactions(accountId : Integer, userId : Integer) : AccountDetailResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Viewing an Investment or Credit Card account is denied with HTTP 403 when the authenticated user's total Loan balances are strictly greater than total Checking and Savings balances.
- Traceability: `Use cases!A131:B152`; UC-07 Basic Flow 4-5; UC-07 EF-3; `API-ACCOUNT-DETAIL`

## Unresolved items

- The frozen source omits an explicit BR-ACC-18 heading and name. BR-ACC-18 is identified from its four supplied postcondition identifiers; the descriptive resource label does not alter the verbatim OCL postconditions or technical constraint.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
