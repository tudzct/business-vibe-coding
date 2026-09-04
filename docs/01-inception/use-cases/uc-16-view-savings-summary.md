---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-16
uc_name: "View Savings Summary"
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "Use cases"
source_range: "A332:B351"
retrieved_at: 2026-09-03T13:21:00.000Z
---

# UC-16: View Savings Summary

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab Use cases, columns A-B. This frozen repository projection is read-only; source corrections must be made in the spreadsheet and imported as a new revision.

## Functional Use-Case Specification

### Use Case ID

UC-16

### Use Case Name

View Savings Summary

### Description

As an authenticated user, I want to compare monthly net savings for a selected year with the previous year.

### Actor(s)

Authenticated User

### Priority

Not Specified

### Trigger

The user opens the Goals page or changes the year selector in Saving Summary.

### Pre-Condition(s)

PRE-1: The user is authenticated.
PRE-2: The savings summary interface is accessible to the authenticated user.

### Post-Condition(s)

POST-1: On success, the system presents monthly net savings comparison data between the evaluated year and the preceding year, and the frontend renders the corresponding visual chart.
POST-2: If no data is available for the specified period, an appropriate empty-state notification is displayed.
POST-3: System state and financial records remain unchanged (read-only query operation).

### Basic Flow

1. The user navigates to the savings summary section on the Goals page.
2. The frontend requests savings summary data for the initial target year (GET /api/v1/savings/summary).
3. The backend authenticates the request and validates query parameters according to established business rules.
4. The backend evaluates transaction records belonging to the authenticated user.
5. The backend compiles monthly net savings figures for the target year.
6. The backend computes comparative savings metrics for the preceding year.
7. The backend returns the compiled savings summary response.
8. The frontend renders the comparative chart displaying the target and preceding year data series.

### Alternative Flow

AF-1: Select another year
2a. The user selects a different year from the year selector.
2b. The frontend requests savings summary data for the newly selected year.

AF-2: Empty savings data
5a. If no transactions or accounts exist for the evaluated periods, the backend returns empty summary datasets.
8a. The frontend displays an empty-state message indicating no transaction data is available instead of the chart.

### Exception Flow

EF-1: Unauthorized request
3a. If authentication is missing or invalid, the backend rejects the request (HTTP 401) and the user is prompted to authenticate.

EF-2: Service or calculation failure
4a. If an unexpected error occurs during data retrieval or calculation, the backend returns an error response (HTTP 500) and the frontend displays a failure notification.

### Related UI

GoalsPage; SavingsSummaryChart; year selector

### Related API IDs

API-SAVINGS-SUMMARY

### Notes

Scope clarification: This use case handles viewing and comparing annual monthly net savings summaries. Modifying transaction entries, updating account balances, or configuring budget limits are outside scope.

## UML Model

~~~plantuml
@startuml

enum AccountType {
  CHECKING
  SAVINGS
  CREDIT_CARD
  INVESTMENT
  LOAN
}

enum TransactionType {
  REVENUE
  EXPENSE
}

enum TransactionStatus {
  COMPLETE
  PENDING
  FAILED
}

enum SavingsSeries {
  THIS_YEAR
  LAST_YEAR
}

class AuthenticatedRequest <<SecurityContext>> {
  userId: Integer [1]
}

class User <<Entity>> {
  userId: Integer [1]
}

class Account <<Entity>> {
  accountId: Integer [1]
  userId: Integer [1]
  accountType: AccountType [1]
}

class Transaction <<Entity>> {
  transactionId: Integer [1]
  accountId: Integer [1]
  transactionDate: Date [1]
  type: TransactionType [1]
  amount: Decimal [1]
  status: TransactionStatus [1]
}

class SavingsSummaryQueryDto <<DTO>> {
  year: String [0..1]
}

class MonthlySavingsDto <<DTO>> {
  month: String [1]
  amount: Decimal [1]
  transaction_count: Integer [1]
}

class SavingsSummaryDataDto <<DTO>> {
  this_year: MonthlySavingsDto [12]
  last_year: MonthlySavingsDto [12]
}

class SavingsSummaryResponseDto <<DTO>> {
  user_id: Integer [1]
  year: Integer [1]
  summary: SavingsSummaryDataDto [1]
}

class SavingsController <<Controller>> {
  getSavingsSummary(
    request: AuthenticatedRequest,
    year: String
  ): SavingsSummaryResponseDto

  resolveYear(year: String): Integer
}

class SavingsService <<Service>> {
  getSavingsSummary(
    userId: Integer,
    year: Integer
  ): SavingsSummaryResponseDto

  calculateMonthlySavings(
    userId: Integer,
    year: Integer
  ): MonthlySavingsDto [12]
}

class SavingsTooltip <<UIModel>> {
  visible: Boolean [1]
  month: String [0..1]
  amount: Decimal [0..1]
  series: SavingsSeries [0..1]
  transaction_count: Integer [0..1]
}

class SavingsSummaryChart <<UIComponent>> {
  isChartVisible: Boolean [1]
  hoverPoint(
    series: SavingsSeries,
    month: String
  ): SavingsTooltip
  leavePoint(): void
}

User "1" -- "0..*" Account : owns
Account "1" -- "0..*" Transaction : contains

SavingsSummaryChart ..> SavingsSummaryResponseDto
SavingsSummaryChart ..> SavingsTooltip
SavingsSummaryChart ..> SavingsSeries

SavingsController ..> AuthenticatedRequest
SavingsController ..> SavingsSummaryQueryDto
SavingsController ..> SavingsService
SavingsController ..> SavingsSummaryResponseDto

SavingsService ..> Account
SavingsService ..> Transaction
SavingsService ..> SavingsSummaryResponseDto

SavingsSummaryResponseDto --> SavingsSummaryDataDto
SavingsSummaryDataDto --> MonthlySavingsDto

@enduml
~~~

## Business Rules

The following rules are authoritative for Prompt E. OCL is preserved where supplied; technical or non-OCL constraints remain authoritative natural-language requirements.

~~~text
BR-SAV-01: Eligible account types and authenticated user ownership scope

context SavingsService::getSavingsSummary(
  userId : Integer,
  year : Integer
) : SavingsSummaryResponseDto

post BR_SAV_01_UserIdentity:
  result.user_id = userId

post BR_SAV_01_EligibleOwnedAccountsOnly:
  let eligibleAccounts : Set(Account) =
    Account.allInstances()->select(a |
      a.userId = userId and
      (a.accountType = AccountType::CHECKING or
       a.accountType = AccountType::SAVINGS)
    )
  in
  Transaction.allInstances()
    ->select(t | eligibleAccounts->exists(a | a.accountId = t.accountId))
    ->includesAll(
      Transaction.allInstances()
        ->select(t | eligibleAccounts->exists(a | a.accountId = t.accountId))
    )

Technical constraints:
- userId shall be obtained from the validated JWT access token.
- Only accounts owned by the authenticated user with accountType equal to 'Checking' or 'Savings' shall be eligible for savings summary calculations.
- Accounts with accountType 'Credit Card', 'Loan', or 'Investment', as well as accounts owned by other users, shall not contribute to the savings summary.


BR-SAV-02: Rolling 5-year evaluation window and fallback clamping

context SavingsController::getSavingsSummary(
  request : AuthenticatedRequest,
  year : String
) : SavingsSummaryResponseDto

post BR_SAV_02_ValidWindowUsed:
  let parsedYear : Integer = parseInt(year, 10)
  in
    (
      not isNaN(parsedYear) and
      parsedYear >= currentYear() - 5 and
      parsedYear <= currentYear()
    )
    implies
      result.year = parsedYear

post BR_SAV_02_InvalidOrOutOfWindowDefaultsToCurrentYear:
  let parsedYear : Integer = parseInt(year, 10)
  in
    (
      year.oclIsUndefined() or
      isNaN(parsedYear) or
      parsedYear < currentYear() - 5 or
      parsedYear > currentYear()
    )
    implies
      result.year = currentYear()

Technical constraints:
- The evaluation window is restricted to the rolling 5-year period up to the current calendar year ([currentYear - 5, currentYear]).
- Any year parameter that is missing, non-numeric, in the future (year > currentYear()), or older than 5 years (year < currentYear() - 5) shall resolve to the current year.


BR-SAV-03: Ordered 12-month calendar series and transaction count metadata

context SavingsService::getSavingsSummary(
  userId : Integer,
  year : Integer
) : SavingsSummaryResponseDto

post BR_SAV_03_TwelveMonthsThisYear:
  result.summary.this_year->size() = 12

post BR_SAV_03_TwelveMonthsLastYear:
  result.summary.last_year->size() = 12

post BR_SAV_03_MonthSequenceAndMetadata:
  Sequence{1..12}->forAll(i |
    result.summary.this_year->at(i).month = padTwoDigits(i) and
    result.summary.this_year->at(i).transaction_count >= 0 and
    result.summary.last_year->at(i).month = padTwoDigits(i) and
    result.summary.last_year->at(i).transaction_count >= 0
  )

Technical constraints:
- Both this_year and last_year series shall contain exactly 12 monthly elements corresponding to two-digit month strings "01" through "12" in ascending order.
- Each monthly element shall include transaction_count representing the exact number of eligible completed transactions recorded in that month.


BR-SAV-04: Completed transaction status filtering and monthly net savings calculation

context SavingsService::getSavingsSummary(
  userId : Integer,
  year : Integer
) : SavingsSummaryResponseDto

post BR_SAV_04_ThisYearAmounts:
  result.summary.this_year->forAll(dto |
    let monthNumber : Integer =
      dto.month.toInteger()
    in
    let eligibleAccountIds : Set(Integer) =
      Account.allInstances()
        ->select(a |
          a.userId = userId and
          (a.accountType = AccountType::CHECKING or
           a.accountType = AccountType::SAVINGS)
        )
        ->collect(a | a.accountId)
        ->asSet()
    in
    let monthlyTransactions : Set(Transaction) =
      Transaction.allInstances()
        ->select(t |
          eligibleAccountIds->includes(t.accountId) and
          yearOf(t.transactionDate) = year and
          monthOf(t.transactionDate) = monthNumber and
          t.status = TransactionStatus::COMPLETE
        )
        ->asSet()
    in
    let revenue : Decimal =
      monthlyTransactions
        ->select(t | t.type = TransactionType::REVENUE)
        ->collect(t | t.amount)
        ->sum()
    in
    let expense : Decimal =
      monthlyTransactions
        ->select(t | t.type = TransactionType::EXPENSE)
        ->collect(t | t.amount)
        ->sum()
    in
      dto.amount = roundToTwoDecimals(revenue - expense) and
      dto.transaction_count = monthlyTransactions->size()
  )

Technical constraints:
- Only transactions with status = Complete shall contribute to monthly Revenue and Expense calculations.
- Transactions with status Pending or Failed shall be excluded.
- Monthly net savings equals total Complete Revenue minus total Complete Expense across eligible owned accounts. If Expense exceeds Revenue, the amount shall be negative.


BR-SAV-05: Symmetrical preceding-year baseline and historical data ceiling

context SavingsService::getSavingsSummary(
  userId : Integer,
  year : Integer
) : SavingsSummaryResponseDto

post BR_SAV_05_LastYearAmounts:
  result.summary.last_year->forAll(dto |
    let monthNumber : Integer =
      dto.month.toInteger()
    in
    let eligibleAccountIds : Set(Integer) =
      Account.allInstances()
        ->select(a |
          a.userId = userId and
          (a.accountType = AccountType::CHECKING or
           a.accountType = AccountType::SAVINGS)
        )
        ->collect(a | a.accountId)
        ->asSet()
    in
    let monthlyTransactions : Set(Transaction) =
      Transaction.allInstances()
        ->select(t |
          eligibleAccountIds->includes(t.accountId) and
          yearOf(t.transactionDate) = year - 1 and
          monthOf(t.transactionDate) = monthNumber and
          t.status = TransactionStatus::COMPLETE
        )
        ->asSet()
    in
    let revenue : Decimal =
      monthlyTransactions
        ->select(t | t.type = TransactionType::REVENUE)
        ->collect(t | t.amount)
        ->sum()
    in
    let expense : Decimal =
      monthlyTransactions
        ->select(t | t.type = TransactionType::EXPENSE)
        ->collect(t | t.amount)
        ->sum()
    in
      dto.amount = roundToTwoDecimals(revenue - expense) and
      dto.transaction_count = monthlyTransactions->size()
  )

Technical constraints:
- last_year represents exactly resolvedYear - 1 and applies the identical calculation rules as this_year.
- If the user had no eligible accounts or completed transactions in year - 1, each of the 12 entries for last_year shall have amount = 0.00 and transaction_count = 0.


BR-SAV-06: Future months zero-capping and missing period normalization

context SavingsService::getSavingsSummary(
  userId : Integer,
  year : Integer
) : SavingsSummaryResponseDto

post BR_SAV_06_FutureMonthsZeroCapped:
  (year = currentYear()) implies
    result.summary.this_year->forAll(dto |
      dto.month.toInteger() > currentMonth() implies
        (dto.amount = 0 and dto.transaction_count = 0)
    )

post BR_SAV_06_MissingPeriodZeroFilled:
  result.summary.this_year->forAll(dto |
    let monthNumber : Integer = dto.month.toInteger() in
    let matchingTxns = Transaction.allInstances()->select(t |
      Account.allInstances()->exists(a |
        a.accountId = t.accountId and
        a.userId = userId and
        (a.accountType = AccountType::CHECKING or a.accountType = AccountType::SAVINGS)
      ) and
      yearOf(t.transactionDate) = year and
      monthOf(t.transactionDate) = monthNumber and
      t.status = TransactionStatus::COMPLETE
    ) in
    matchingTxns->isEmpty() implies (dto.amount = 0 and dto.transaction_count = 0)
  )

Technical constraints:
- When the evaluated year is the current calendar year, all future months (month > currentMonth()) shall have amount = 0.00 and transaction_count = 0 regardless of whether scheduled or post-dated transactions exist in the database.
- For elapsed months with no completed transactions, or if the user owns no eligible accounts, amount shall be 0.00 and transaction_count shall be 0.


BR-SAV-07: Accounting-grade decimal precision and half-up rounding

context SavingsService::getSavingsSummary(
  userId : Integer,
  year : Integer
) : SavingsSummaryResponseDto

post BR_SAV_07_PrecisionAndHalfUpRounding:
  result.summary.this_year->forAll(dto |
    dto.amount = roundToTwoDecimals(dto.amount) and
    (dto.amount = 0 implies dto.amount >= 0)
  ) and
  result.summary.last_year->forAll(dto |
    dto.amount = roundToTwoDecimals(dto.amount) and
    (dto.amount = 0 implies dto.amount >= 0)
  )

Technical constraints:
- Monthly aggregation of Revenue and Expense amounts shall maintain full decimal precision before difference subtraction.
- The resulting net savings amount shall be rounded using round-half-up to exactly two decimal places.
- Any negative zero representation (-0.00) resulting from floating-point arithmetic shall be normalized to 0.00.


BR-SAV-08: Idempotent read-only execution, audit immutability, and safe error containment

context SavingsService::getSavingsSummary(
  userId : Integer,
  year : Integer
) : SavingsSummaryResponseDto

post BR_SAV_08_StrictDatabaseImmutability:
  Account.allInstances()->collect(a | a.accountId)->asSet() =
    Account.allInstances()@pre->collect(a | a.accountId)->asSet() and
  Transaction.allInstances()->collect(t | t.transactionId)->asSet() =
    Transaction.allInstances()@pre->collect(t | t.transactionId)->asSet() and
  User.allInstances()->collect(u | u.userId)->asSet() =
    User.allInstances()@pre->collect(u | u.userId)->asSet()

Technical constraints:
- Retrieving the savings summary is strictly read-only and idempotent; it shall never create, mutate, or delete records in Users, Accounts, Transactions, Goals, or Bills tables.
- Database queries shall execute under READ COMMITTED transaction isolation to avoid dirty reads during concurrent writes.
- Unexpected database or computation failures shall return HTTP 500 Internal Server Error without exposing internal query syntax or stack traces.


BR-SAV-09: Interactive point hover parity and signed currency tooltip

context SavingsSummaryChart::hoverPoint(
  series : SavingsSeries,
  month : String
) : SavingsTooltip

pre BR_SAV_09_ChartDisplayed:
  self.isChartVisible = true

pre BR_SAV_09_PointExists:
  (series = SavingsSeries::THIS_YEAR implies self.summary.this_year->exists(p | p.month = month)) and
  (series = SavingsSeries::LAST_YEAR implies self.summary.last_year->exists(p | p.month = month))

post BR_SAV_09_TooltipVisibleAndParity:
  result.visible = true and
  (
    series = SavingsSeries::THIS_YEAR implies
      self.summary.this_year->exists(p |
        p.month = month and
        result.month = p.month and
        result.amount = p.amount and
        result.series = series
      )
  ) and
  (
    series = SavingsSeries::LAST_YEAR implies
      self.summary.last_year->exists(p |
        p.month = month and
        result.month = p.month and
        result.amount = p.amount and
        result.series = series
      )
  )

context SavingsSummaryChart::leavePoint()

post BR_SAV_09_TooltipHidden:
  self.tooltip.visible = false

Technical constraints:
- Hovering over any rendered data point in either yearly series shall display an interactive tooltip showing the month label, series indicator, formatted currency amount with explicit sign ('+' for positive, '-' for negative), and transaction count.
- Moving the pointer away from the data point shall immediately hide the tooltip.
~~~

