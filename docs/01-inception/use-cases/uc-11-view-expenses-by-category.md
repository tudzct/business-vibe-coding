---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-11
uc_name: "View Expenses by Category"
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "Use cases"
source_range: "A238:B256"
retrieved_at: 2026-08-31T12:21:01.000Z
---

# UC-11: View Expenses by Category

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab `Use cases`, range `A238:B256`. This frozen repository projection was refreshed from the source on 2026-08-31.

## Functional Use-Case Specification

### Use Case ID

UC-11

### Use Case Name

View Expenses by Category

### Description

As an authenticated user, I want to view my expenses by category for a selected month so that I can understand how my spending is distributed.

### Actor(s)

Authenticated User

### Priority

Not Specified

### Trigger

The user opens the Expenses page or selects another month.

### Pre-Condition(s)

PRE-1: The user is authenticated.

PRE-2: A selected month is available for the expense-breakdown request.

### Post-Condition(s)

POST-1: After processing, the expense breakdown for the selected month is displayed on /expenses.

POST-2: If no breakdown data is available, the page displays its no-data state.

POST-3: The operation does not modify stored financial data.

### Basic Flow

1. The user opens the Expenses page.
2. The frontend determines the selected month for the breakdown request.
3. The frontend requests the user's expense breakdown for the selected month.
4. The backend authenticates the request.
5. The backend retrieves and processes the relevant expense data according to the applicable business rules.
6. The backend returns the expense breakdown.
7. The frontend displays the category breakdown on the Expenses page.

### Alternative Flow

AF-1: Select another month

2a. The user selects a different month.
3a. The frontend requests the expense breakdown for the new selected month.
4a. The flow continues from Step 4.

AF-2: No breakdown data

6a. The backend reports that no breakdown data is available for the selected month.
7a. The frontend displays its no-data state instead of the category breakdown.

### Exception Flow

EF-1: Authentication failure

4a. The backend cannot authenticate the request.
4b. The backend returns HTTP 401.
4c. The frontend applies the application's authentication-error handling.

EF-2: Invalid month request

5a. The backend rejects an invalid month request with HTTP 400.
5b. The frontend displays its request-error state.

EF-3: Retrieval or processing failure

5a. An unexpected error occurs while retrieving or processing the breakdown data.
5b. The backend returns HTTP 500.
5c. The frontend displays its expense-breakdown error state.

## UML Model

~~~plantuml
@startuml

class AuthenticatedRequest <<DTO>> {
  userId: Integer [1]
}

class Account <<Entity>> {
  accountId: Integer [1]
  userId: Integer [1]
}

class Transaction <<Entity>> {
  transactionId: Integer [1]
  accountId: Integer [1]
  transactionDate: Date [1]
  type: TransactionType [1]
  itemDescription: String [1]
  amount: Decimal [1]
  status: TransactionStatus [1]
  categoryId: Integer [0..1]
}

class Category <<Entity>> {
  categoryId: Integer [1]
  categoryName: String [1]
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

class ExpenseSubCategory <<DTO>> {
  item_description: String [1]
  amount: Number [1]
  date: String [1]
}

class BreakdownResult <<DTO>> {
  category: String [1]
  total: Number [1]
  changePercent: Number [0..1]
  subCategories: ExpenseSubCategory [1..*] {ordered}
}

class ExpenseBreakdownResponse <<DTO>> {
  success: Boolean [1]
  message: String [1]
  data: BreakdownResult [0..*] {ordered}
}

class JwtAuthGuard <<Guard>> {
  validate(token: BearerJWT): AuthenticatedRequest
}

class ExpensesController <<Controller>> {
  getExpensesBreakdown(request: AuthenticatedRequest, month: String): ExpenseBreakdownResponse
}

class ExpensesService <<Service>> {
  getExpensesBreakdown(userId: Integer, month: String): Sequence(BreakdownResult)
}

class ExpensesPage <<UI>> {
  selectedMonth: String [1]
}

class ExpensesBreakdown <<UI>> {
  month: String [1]
  expensesData: BreakdownResult [*]
  fetchExpensesBreakdown(month: String)
}

Account "1" -- "0..*" Transaction
Category "0..1" -- "0..*" Transaction
ExpensesController ..> JwtAuthGuard
ExpensesController ..> ExpensesService
ExpensesController ..> ExpenseBreakdownResponse
ExpensesService ..> Account
ExpensesService ..> Transaction
ExpensesService ..> Category
ExpenseBreakdownResponse --> BreakdownResult
BreakdownResult --> ExpenseSubCategory
ExpensesPage --> ExpensesBreakdown
ExpensesBreakdown ..> ExpenseBreakdownResponse

@enduml
~~~

## Business Rules

The following rules are authoritative for Prompt E. OCL is preserved verbatim from the Sheet.

~~~text
BR-EXP-CAT-01: Authenticated ownership scope

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

BR-EXP-CAT-02: Eligible selected-month expenses

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

BR-EXP-CAT-03: Category classification

context ExpensesService::getExpensesBreakdown(userId : Integer, month : String) : Sequence(BreakdownResult)
post BR_EXP_CAT_03_CategoryDefined:
  result->forAll(item | not item.category.oclIsUndefined())

Technical constraints:
- Eligible transactions shall be grouped by categoryId.
- A null categoryId shall be classified as Uncategorized.
- A non-null categoryId that cannot be resolved to a Category shall be classified as Unknown.
- A resolved categoryId shall use the corresponding Category.categoryName.

BR-EXP-CAT-04: Category totals and detail mapping

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

BR-EXP-CAT-05: Previous-month comparison

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

BR-EXP-CAT-06: Rounding and deterministic ordering

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

BR-EXP-CAT-07: No-data outcome

Technical constraints:
- If the authenticated user owns no accounts, the breakdown has no data for the selected month.
- If no eligible current-month Expense transaction exists, the breakdown has no data for the selected month.
- The backend shall return the API's configured no-data response, and the frontend shall display its no-data state.
~~~

## Related UI

ExpensesPage; ExpensesBreakdown; month input; route /expenses

## Related API IDs

API-EXPENSE-BREAKDOWN

## Notes

Experiment isolation:
- BR-EXP-CAT-01 through BR-EXP-CAT-07 are the treatment-sensitive Business Rules for UC-11.
- Description, pre/post-conditions, flows, UML, and non-BR API fields intentionally avoid restating these business semantics.
- Month syntax/format validation is part of the API interface contract, not a treatment-sensitive Business Rule.
- Figma layout/styling requirements are UI evidence and are not part of the core Business Rule effectiveness score.
- Read-only HTTP semantics and the standard success/error response envelope are project-constrained and are not core treatment-sensitive BRs.
