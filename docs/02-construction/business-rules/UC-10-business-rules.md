---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-10
source_use_case: docs/01-inception/use-cases/uc-10-view-monthly-expense-summary.md
source_use_case_sha256: sha256:1d2306543086e50d0769eaa91cf6934f2b41393d381163e18bd494dc91e46f13
---

# UC-10 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A219:B237`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-08-31T02:49:48.000Z`

## Ordered Business Rules

### BR-EXP-01 - Ownership scope

- Representation: `ocl_precondition`
- Context: `ExpensesService::getExpenseSummary(userId : Integer) : Sequence(ExpenseSummaryItem)`
- Enforcement layers: `backend`, `database`
- Failure behavior: A missing, invalid, or expired authenticated identity is rejected with HTTP 401; successful aggregation uses the validated JWT userId and only transactions from that user's accounts.
- Traceability: `Use cases!A219:B237`, UC-10 PRE-1, Basic Flow 2-4, EF-1, `API-EXPENSE-SUMMARY`

~~~text
context ExpensesService::getExpenseSummary(
  userId : Integer
) : Sequence(ExpenseSummaryItem)

pre BR_EXP_01_AuthenticatedIdentity:
  not userId.oclIsUndefined()

post BR_EXP_01_OwnedTransactionsOnly:
  let ownedAccountIds : Set(Integer) =
    Account.allInstances()
      ->select(a |
        a.userId = userId
      )
      ->collect(a |
        a.accountId
      )
      ->asSet()
  in
    result->forAll(item |
      Transaction.allInstances()->forAll(t |
        contributesTo(t, item)
        implies
        ownedAccountIds->includes(t.accountId)
      )
    )

Technical constraints:
- Only transactions associated with accounts owned by the authenticated user may contribute to the expense summary.
- The aggregation userId shall come from the validated JWT and shall not be supplied or overridden by the client.
~~~

### BR-EXP-02 - Expense eligibility

- Representation: `ocl_postcondition`
- Context: `ExpensesService::getExpenseSummary(userId : Integer) : Sequence(ExpenseSummaryItem)`
- Enforcement layers: `backend`, `database`
- Failure behavior: Only Expense transactions contribute to returned totals; the source defines no separate error response for an eligibility violation.
- Traceability: `Use cases!A219:B237`, UC-10 Basic Flow 4-5, `API-EXPENSE-SUMMARY`

~~~text
context ExpensesService::getExpenseSummary(
  userId : Integer
) : Sequence(ExpenseSummaryItem)

post BR_EXP_02_ExpenseOnly:
  result->forAll(item |
    Transaction.allInstances()
      ->select(t |
        monthOf(t.transactionDate) =
          monthNumber(item.month)
      )
      ->forAll(t |
        contributesTo(t, item)
        implies
        t.type = TransactionType::Expense
      )
  )

Technical constraints:
- Only transactions with `type = Expense` contribute to the summary.
- Revenue transactions shall not contribute to any monthly expense total.
~~~

### BR-EXP-03 - Reporting period

- Representation: `ocl_postcondition`
- Context: `ExpensesService::getExpenseSummary(userId : Integer) : Sequence(ExpenseSummaryItem)`
- Enforcement layers: `backend`, `database`
- Failure behavior: Only transactions in the backend server's current calendar year contribute, and no client year parameter is accepted; the source defines no separate error response for a reporting-period violation.
- Traceability: `Use cases!A219:B237`, UC-10 Basic Flow 4-5, `API-EXPENSE-SUMMARY`

~~~text
context ExpensesService::getExpenseSummary(
  userId : Integer
) : Sequence(ExpenseSummaryItem)

post BR_EXP_03_CurrentCalendarYearOnly:
  result->forAll(item |
    Transaction.allInstances()
      ->select(t |
        monthOf(t.transactionDate) =
          monthNumber(item.month)
      )
      ->forAll(t |
        contributesTo(t, item)
        implies
        yearOf(t.transactionDate) = currentYear()
      )
  )

Technical constraints:
- Only transactions whose `transactionDate` falls in the backend server's current calendar year are included.
- The endpoint does not accept a year parameter.
~~~

### BR-EXP-04 - Monthly attribution

- Representation: `ocl_postcondition`
- Context: `ExpensesService::getExpenseSummary(userId : Integer) : Sequence(ExpenseSummaryItem)`
- Enforcement layers: `backend`, `database`
- Failure behavior: Each contribution is attributed by transactionDate month; the source defines no separate error response for a monthly-attribution violation.
- Traceability: `Use cases!A219:B237`, UC-10 Basic Flow 4-5, UML `Transaction.transactionDate`, `API-EXPENSE-SUMMARY`

~~~text
context ExpensesService::getExpenseSummary(
  userId : Integer
) : Sequence(ExpenseSummaryItem)

post BR_EXP_04_TransactionDateDeterminesMonth:
  result->forAll(item |
    Transaction.allInstances()->forAll(t |
      contributesTo(t, item)
      implies
      monthOf(t.transactionDate) =
        monthNumber(item.month)
    )
  )

Technical constraints:
- A transaction belongs to the month represented by its `transactionDate`, not another system timestamp.
~~~

### BR-EXP-05 - Monthly aggregation

- Representation: `ocl_postcondition`
- Context: `ExpensesService::getExpenseSummary(userId : Integer) : Sequence(ExpenseSummaryItem)`
- Enforcement layers: `backend`, `database`
- Failure behavior: Each totalExpense is the sum of all eligible transaction amounts assigned to that month; aggregation failures return HTTP 500 with the source-defined safe message.
- Traceability: `Use cases!A219:B237`, UC-10 Basic Flow 4-5, EF-2, `API-EXPENSE-SUMMARY`

~~~text
context ExpensesService::getExpenseSummary(
  userId : Integer
) : Sequence(ExpenseSummaryItem)

post BR_EXP_05_MonthlyExpenseTotal:
  let ownedAccountIds : Set(Integer) =
    Account.allInstances()
      ->select(a |
        a.userId = userId
      )
      ->collect(a |
        a.accountId
      )
      ->asSet()
  in
    result->forAll(item |
      item.totalExpense =
        Transaction.allInstances()
          ->select(t |
            ownedAccountIds->includes(t.accountId) and
            t.type = TransactionType::Expense and
            yearOf(t.transactionDate) = currentYear() and
            monthOf(t.transactionDate) =
              monthNumber(item.month)
          )
          ->collect(t |
            t.amount
          )
          ->sum()
    )

Technical constraints:
- A month's `totalExpense` equals the sum of `amount` for all eligible transactions assigned to that month.
~~~

### BR-EXP-06 - Backend result semantics

- Representation: `ocl_postcondition`
- Context: `ExpensesService::getExpenseSummary(userId : Integer) : Sequence(ExpenseSummaryItem)`
- Enforcement layers: `backend`, `database`
- Failure behavior: The backend returns a sparse, unique, chronologically ordered sequence using valid Jan-Dec abbreviations; the source defines no separate error response for a result-semantics violation.
- Traceability: `Use cases!A219:B237`, UC-10 AF-1, AF-2, UML `ExpenseSummaryItem`, `API-EXPENSE-SUMMARY`

~~~text
context ExpensesService::getExpenseSummary(
  userId : Integer
) : Sequence(ExpenseSummaryItem)

post BR_EXP_06_UniqueMonth:
  result->isUnique(item |
    item.month
  )

post BR_EXP_06_ValidMonth:
  result->forAll(item |
    monthNumber(item.month) >= 1 and
    monthNumber(item.month) <= 12
  )

post BR_EXP_06_ChronologicalOrder:
  result->size() <= 1 or
  Sequence{1..result->size() - 1}->forAll(i |
    monthNumber(result->at(i).month) <
    monthNumber(result->at(i + 1).month)
  )

Technical constraints:
- The backend returns only months containing eligible expense data.
- Each returned month shall appear at most once and results shall be ordered chronologically.
- `month` shall use Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, or Dec.
- The backend shall not generate zero-valued entries solely to fill missing calendar months.
~~~

### BR-EXP-07 - Missing-month normalization

- Representation: `ocl_precondition`
- Context: `ExpenseSummaryChart::buildChartData(summaryData : Sequence(ExpenseSummaryItem)) : Sequence(ExpenseChartItem)`
- Enforcement layer: `frontend`
- Failure behavior: When summary data is non-empty, the frontend preserves returned totals and supplies zero for every missing Jan-Dec month; an empty summary displays the no-data state rather than preparing chart data.
- Traceability: `Use cases!A219:B237`, UC-10 Basic Flow 6-7, AF-1, AF-2, `ExpensesPage`, `ExpenseSummaryChart`

~~~text
context ExpenseSummaryChart::buildChartData(
  summaryData : Sequence(ExpenseSummaryItem)
) : Sequence(ExpenseChartItem)

pre BR_EXP_07_HasSummaryData:
  summaryData->notEmpty()

post BR_EXP_07_TwelveMonths:
  result->size() = 12

post BR_EXP_07_UniqueMonth:
  result->isUnique(item |
    item.month
  )

post BR_EXP_07_AllCalendarMonths:
  Set{'Jan', 'Feb', 'Mar', 'Apr',
      'May', 'Jun', 'Jul', 'Aug',
      'Sep', 'Oct', 'Nov', 'Dec'}
  =
  result->collect(item |
    item.month
  )->asSet()

post BR_EXP_07_PreserveReturnedTotals:
  summaryData->forAll(source |
    result->one(item |
      item.month = source.month and
      item.totalExpense = source.totalExpense
    )
  )

post BR_EXP_07_MissingMonthIsZero:
  result->forAll(item |
    summaryData->forAll(source |
      source.month <> item.month
    )
    implies
      item.totalExpense = 0
  )

Technical constraints:
- When at least one monthly result exists, the frontend constructs Jan–Dec and assigns `0` to missing months.
~~~

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
