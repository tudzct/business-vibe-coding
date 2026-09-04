---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-16
source_use_case: docs/01-inception/use-cases/uc-16-view-savings-summary.md
source_use_case_sha256: sha256:d4abbcbfcd5bb2f77acc9bc3209fa5b843a2f379bbd706b5fee8ce550b493a8a
---

# UC-16 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A332:B351`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-09-03T13:33:06.000Z`

## Ordered Business Rules

### BR-SAV-01 - Eligible account types and authenticated user ownership scope

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `SavingsService::getSavingsSummary(userId : Integer, year : Integer) : SavingsSummaryResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Accounts not belonging to the user or not of type Checking/Savings are excluded from the query. Missing or invalid JWT produces HTTP 401.
- Traceability: `Use cases!A332:B351`; `UC-16 PRE-1`; `UC-16 Basic Flow 4`; `API-SAVINGS-SUMMARY`

### BR-SAV-02 - Rolling 5-year evaluation window and fallback clamping

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `SavingsController::getSavingsSummary(request : AuthenticatedRequest, year : String) : SavingsSummaryResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Out-of-window, missing, or invalid year parameters silently fallback to currentYear() without throwing validation errors.
- Traceability: `Use cases!A332:B351`; `UC-16 Basic Flow 3`; `API-SAVINGS-SUMMARY`

### BR-SAV-03 - Ordered 12-month calendar series and transaction count metadata

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `SavingsService::getSavingsSummary(userId : Integer, year : Integer) : SavingsSummaryResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Response strictly maintains 12 ordered monthly elements from '01' to '12' with non-negative integer transaction_count for both series.
- Traceability: `Use cases!A332:B351`; `UC-16 Basic Flow 7`; `API-SAVINGS-SUMMARY`

### BR-SAV-04 - Completed transaction status filtering and monthly net savings calculation

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `SavingsService::getSavingsSummary(userId : Integer, year : Integer) : SavingsSummaryResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Only Complete transactions are summed; Pending/Failed are ignored; net savings can be negative if expenses exceed revenues.
- Traceability: `Use cases!A332:B351`; `UC-16 Basic Flow 5`; `API-SAVINGS-SUMMARY`

### BR-SAV-05 - Symmetrical preceding-year baseline and historical data ceiling

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `SavingsService::getSavingsSummary(userId : Integer, year : Integer) : SavingsSummaryResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Symmetrical calculation for year - 1; users without history in year - 1 receive zeroes without runtime errors.
- Traceability: `Use cases!A332:B351`; `UC-16 Basic Flow 6`; `API-SAVINGS-SUMMARY`

### BR-SAV-06 - Future months zero-capping and missing period normalization

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `SavingsService::getSavingsSummary(userId : Integer, year : Integer) : SavingsSummaryResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Future months in the current year are strictly clamped to amount=0.00 and count=0. Missing periods or accounts return zeros.
- Traceability: `Use cases!A332:B351`; `UC-16 AF-2`; `API-SAVINGS-SUMMARY`

### BR-SAV-07 - Accounting-grade decimal precision and half-up rounding

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `SavingsService::getSavingsSummary(userId : Integer, year : Integer) : SavingsSummaryResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Full precision aggregation with final round-half-up to 2 decimals; negative zero is normalized to positive 0.
- Traceability: `Use cases!A332:B351`; `UC-16 Basic Flow 7`; `API-SAVINGS-SUMMARY`

### BR-SAV-08 - Idempotent read-only execution, audit immutability, and safe error containment

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `SavingsService::getSavingsSummary(userId : Integer, year : Integer) : SavingsSummaryResponseDto`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Pure read-only operation; database remains completely unmodified; errors produce standard HTTP 500.
- Traceability: `Use cases!A332:B351`; `UC-16 POST-3`; `UC-16 EF-2`; `API-SAVINGS-SUMMARY`

### BR-SAV-09 - Interactive point hover parity and signed currency tooltip

- Representation: `OCL pre/postcondition`
- Expression / authoritative text:

~~~text
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

- Context: `SavingsSummaryChart::hoverPoint(series : SavingsSeries, month : String) : SavingsTooltip`
- Enforcement layer(s): `frontend`
- Failure behavior: Point hover renders signed currency tooltip with transaction count; mouse leave hides tooltip.
- Traceability: `Use cases!A332:B351`; `UC-16 Basic Flow 8`; `SavingsSummaryChart`