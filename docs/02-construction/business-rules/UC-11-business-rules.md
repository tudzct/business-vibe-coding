---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-11
source_use_case: docs/01-inception/use-cases/uc-11-view-expenses-by-category.md
source_use_case_sha256: sha256:b1aa742337d80cd75581afcb19a01a6f8d316e447b5b9515b4e0bcaaf96ad521
---

# UC-11 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A238:B256`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-08-31T12:21:01.000Z`

## Ordered Business Rules

### BR-EXP-CAT-01 - Authenticated ownership scope

- Representation: `ocl_precondition`
- Context: `ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)`
- Enforcement layers: `backend`, `database`
- Failure behavior: A missing, invalid, or expired JWT is rejected with HTTP 401; a successful breakdown uses the validated JWT userId and excludes transactions from accounts owned by other users.
- Traceability: `Use cases!A238:B256`, UC-11 PRE-1, Basic Flow 3-5, EF-1, `API-EXPENSE-BREAKDOWN`

~~~text
context ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)
pre BR_EXP_CAT_01_AuthenticatedIdentity:
  not userId.oclIsUndefined()
post BR_EXP_CAT_01_OwnedTransactionsOnly:
  result->forAll(item |
    item.subCategories->forAll(detail |
      Transaction.allInstances()->exists(t |
        Account.allInstances()->exists(a |
          a.accountId = t.accountId and a.userId = userId
        ) and
        t.itemDescription = detail.item_description and
        t.amount = detail.amount and
        toIsoDate(t.transactionDate) = detail.date
      )
    )
  )

Technical constraints:
- The userId used for the breakdown shall come from the validated JWT.
- Transactions belonging to accounts owned by another user shall not contribute to the breakdown.
~~~

### BR-EXP-CAT-02 - Eligible selected-month expenses

- Representation: `ocl_postcondition`
- Context: `ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)`
- Enforcement layers: `backend`, `database`
- Failure behavior: Only owned Expense transactions within the selected month contribute, regardless of transaction status; the source defines no separate error response for an eligibility violation.
- Traceability: `Use cases!A238:B256`, UC-11 PRE-2, Basic Flow 2-6, AF-1, `API-EXPENSE-BREAKDOWN`

~~~text
context ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)
post BR_EXP_CAT_02_EligibleRowsOnly:
  result->forAll(item |
    item.subCategories->forAll(detail |
      Transaction.allInstances()->exists(t |
        Account.allInstances()->exists(a |
          a.accountId = t.accountId and a.userId = userId
        ) and
        t.type = TransactionType::Expense and
        isWithinInclusiveMonth(t.transactionDate, month) and
        t.itemDescription = detail.item_description and
        t.amount = detail.amount and
        toIsoDate(t.transactionDate) = detail.date
      )
    )
  )

Technical constraint:
- Transaction status is not an eligibility predicate; a row is eligible when the ownership, type, and selected-month conditions are satisfied.
~~~

### BR-EXP-CAT-03 - Category classification

- Representation: `ocl_postcondition`
- Context: `ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)`
- Enforcement layers: `backend`, `database`
- Failure behavior: Every eligible transaction is grouped by categoryId and returned with the defined resolved, Uncategorized, or Unknown label; the source defines no separate error response for a classification violation.
- Traceability: `Use cases!A238:B256`, UC-11 Basic Flow 5-7, UML `Category` and `Transaction.categoryId`, `API-EXPENSE-BREAKDOWN`

~~~text
context ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)
post BR_EXP_CAT_03_CategoryDefined:
  result->forAll(item | not item.category.oclIsUndefined())

Technical constraints:
- Eligible transactions shall be grouped by categoryId.
- A null categoryId shall be classified as Uncategorized.
- A non-null categoryId that cannot be resolved to a Category shall be classified as Unknown.
- A resolved categoryId shall use the corresponding Category.categoryName.
~~~

### BR-EXP-CAT-04 - Category totals and detail mapping

- Representation: `ocl_postcondition`
- Context: `ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)`
- Enforcement layers: `backend`, `database`
- Failure behavior: Each category total equals its returned detail sum and each detail exposes the defined description, numeric amount, and ISO date mapping; processing failures return HTTP 500 with the source-defined safe message.
- Traceability: `Use cases!A238:B256`, UC-11 Basic Flow 5-7, UML `BreakdownResult` and `ExpenseSubCategory`, EF-3, `API-EXPENSE-BREAKDOWN`

~~~text
context ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)
post BR_EXP_CAT_04_CategoryTotal:
  result->forAll(item |
    item.total = item.subCategories->collect(detail | detail.amount)->sum()
  )
post BR_EXP_CAT_04_DetailDefined:
  result->forAll(item |
    item.subCategories->forAll(detail |
      not detail.item_description.oclIsUndefined() and
      not detail.amount.oclIsUndefined() and
      not detail.date.oclIsUndefined()
    )
  )

Technical constraint:
- Each detail item shall map Transaction.itemDescription, amount, and transactionDate to item_description, numeric amount, and an ISO YYYY-MM-DD date string.
~~~

### BR-EXP-CAT-05 - Previous-month comparison

- Representation: `ocl_postcondition`
- Context: `ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)`
- Enforcement layers: `backend`, `database`
- Failure behavior: Each category's changePercent follows the defined immediately preceding calendar-month comparison, including the zero baseline and January rollover cases; the source defines no separate error response for a comparison violation.
- Traceability: `Use cases!A238:B256`, UC-11 Basic Flow 5-7, UML `BreakdownResult.changePercent`, `API-EXPENSE-BREAKDOWN`

~~~text
context ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)
post BR_EXP_CAT_05_ChangePercent:
  result->forAll(item |
    let previousTotal : Decimal = previousMonthExpenseTotal(userId, month, item.category)
    in
      if previousTotal = 0 then
        if item.total > 0 then item.changePercent = 100
        else item.changePercent.oclIsUndefined()
        endif
      else
        item.changePercent = ((item.total - previousTotal) / previousTotal) * 100
      endif
  )

Technical constraints:
- The comparison period is the immediately preceding calendar month.
- January shall compare with December of the preceding year.
- Previous-month totals shall use the same ownership, Expense eligibility, selected-period, and category-classification rules as the current month.
~~~

### BR-EXP-CAT-06 - Rounding and deterministic ordering

- Representation: `ocl_postcondition`
- Context: `ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)`
- Enforcement layer: `backend`
- Failure behavior: Returned totals and non-null change percentages are rounded to two decimals, groups are sorted by total descending, and details are sorted by date ascending; the source defines no separate error response for a formatting or ordering violation.
- Traceability: `Use cases!A238:B256`, UC-11 Basic Flow 5-7, UML ordered response collections, `API-EXPENSE-BREAKDOWN`

~~~text
context ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)
post BR_EXP_CAT_06_RoundedValues:
  result->forAll(item |
    item.total = round2(item.total) and
    (item.changePercent.oclIsUndefined() or item.changePercent = round2(item.changePercent))
  )
post BR_EXP_CAT_06_GroupsSortedDescending:
  Sequence{1..result->size()}->forAll(i |
    i < result->size() implies result->at(i).total >= result->at(i + 1).total
  )
post BR_EXP_CAT_06_DetailsSortedAscending:
  result->forAll(item |
    Sequence{1..item.subCategories->size()}->forAll(i |
      i < item.subCategories->size() implies
      item.subCategories->at(i).date <= item.subCategories->at(i + 1).date
    )
  )
~~~

### BR-EXP-CAT-07 - No-data outcome

- Representation: `natural_language`
- Context: UC-11 expense-breakdown backend and frontend no-data flow
- Enforcement layers: `backend`, `frontend`
- Failure behavior: When the user owns no accounts or has no eligible current-month Expense transaction, the backend returns HTTP 404 with `Không có dữ liệu chi tiêu cho tháng này.` and the frontend displays its no-data state.
- Traceability: `Use cases!A238:B256`, UC-11 POST-2, AF-2, `API-EXPENSE-BREAKDOWN` HTTP 404

~~~text
Technical constraints:
- If the authenticated user owns no accounts, the breakdown has no data for the selected month.
- If no eligible current-month Expense transaction exists, the breakdown has no data for the selected month.
- The backend shall return the API's configured no-data response, and the frontend shall display its no-data state.
~~~

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
