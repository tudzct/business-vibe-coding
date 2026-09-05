---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-13
source_use_case: docs/01-inception/use-cases/uc-13-view-financial-goals.md
source_use_case_sha256: sha256:3becb7b921eaa09e29efa66a64b4a1ed55b16de7cdc02cd5d50646742e31af21
---

# UC-13 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A276:B294`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-09-05T08:24:09.000Z`

## Ordered Business Rules

### BR-GOAL-VIEW-01 - Authenticated ownership scope

- Representation: `ocl_precondition`
- Context: `GoalService::getGoals(userId : Integer) : GoalListResponseDto`
- Enforcement layers: `backend`, `database`
- Failure behavior: A missing, invalid, or expired JWT is rejected with HTTP 401; successful retrieval uses the validated authenticated userId and excludes other users' goals, accounts, transactions, and calculated values.
- Traceability: `Use cases!A276:B294`, UC-13 PRE-1, Basic Flow 2-5, EF-1, `API-GOAL-LIST`

~~~text
context GoalService::getGoals(userId : Integer) : GoalListResponseDto

pre BR_GOAL_VIEW_01_AuthenticatedIdentity:
  not userId.oclIsUndefined()

post BR_GOAL_VIEW_01_OwnedGoalsOnly:
  result.success implies
    (
      result.data.savingGoal.oclIsUndefined() or
      Goal.allInstances()->exists(g |
        g.goalId = result.data.savingGoal.goalId and
        g.userId = userId
      )
    ) and
    result.data.expenseGoals->forAll(dto |
      Goal.allInstances()->exists(g |
        g.goalId = dto.goalId and
        g.userId = userId
      )
    )

Technical constraints:
- The userId used by GoalService shall come from the validated authenticated request context.
- A client-supplied user identifier shall not override the authenticated userId.
- Goals, accounts, and transactions owned by another user shall not contribute to any returned goal or calculated progress value.
~~~

### BR-GOAL-VIEW-02 - Deterministic saving-goal selection

- Representation: `ocl_postcondition`
- Context: `GoalService::getGoals(userId : Integer) : GoalListResponseDto`
- Enforcement layers: `backend`, `database`
- Failure behavior: A successful response returns no saving goal when no eligible candidate exists; otherwise it returns the uniquely selected eligible saving goal defined by the date and goalId tie-breakers.
- Traceability: `Use cases!A276:B294`, UC-13 Basic Flow 4-7, AF-1, UML `Goal` and `SavingGoalDto`

~~~text
context GoalService::getGoals(userId : Integer) : GoalListResponseDto

post BR_GOAL_VIEW_02_SavingSelection:
  let candidates : Set(Goal) =
    Goal.allInstances()
      ->select(g |
        g.userId = userId and
        g.goalType = GoalType::SAVING and
        g.startDate <= g.endDate and
        g.startDate <= currentMonthEnd() and
        g.endDate >= currentMonthStart()
      )
      ->asSet()
  in
    if candidates->isEmpty() then
      result.data.savingGoal.oclIsUndefined()
    else
      let latestStart : Date = candidates->collect(g | g.startDate)->max() in
      let latestStartCandidates : Set(Goal) = candidates->select(g | g.startDate = latestStart)->asSet() in
      let selectedId : Integer = latestStartCandidates->collect(g | g.goalId)->max() in
        not result.data.savingGoal.oclIsUndefined() and
        result.data.savingGoal.goalId = selectedId
    endif

Technical constraints:
- A Saving goal is eligible only when its persisted date range is valid and overlaps the current calendar month.
- If multiple eligible Saving goals exist, select the one with the latest startDate; if multiple candidates share that startDate, select the one with the highest goalId.
- For the OCL in UC-13, currentMonthStart() and currentMonthEnd() denote the first and last instants of the backend server's current calendar month.
~~~

### BR-GOAL-VIEW-03 - Expense-limit goal eligibility and exact coverage

- Representation: `ocl_postcondition`
- Context: `GoalService::getGoals(userId : Integer) : GoalListResponseDto`
- Enforcement layers: `backend`, `database`
- Failure behavior: A successful response includes every eligible expense-limit goal exactly once and excludes every ineligible goal; when none is eligible, expenseGoals is empty.
- Traceability: `Use cases!A276:B294`, UC-13 Basic Flow 4-7, AF-1, AF-2, UML `GoalDataDto`

~~~text
context GoalService::getGoals(userId : Integer) : GoalListResponseDto

post BR_GOAL_VIEW_03_AllAndOnlyEligibleExpenseGoals:
  let eligible : Set(Goal) =
    Goal.allInstances()
      ->select(g |
        g.userId = userId and
        g.goalType = GoalType::EXPENSE_LIMIT and
        g.startDate <= g.endDate and
        g.startDate <= currentMonthEnd() and
        g.endDate >= currentMonthStart()
      )
      ->asSet()
  in
    result.data.expenseGoals->size() = eligible->size() and
    result.data.expenseGoals->isUnique(dto | dto.goalId) and
    result.data.expenseGoals->forAll(dto |
      eligible->exists(g | g.goalId = dto.goalId)
    )

Technical constraints:
- Expired, not-yet-active, invalid-range, or other-user Expense_Limit goals shall not be returned.
- Every eligible Expense_Limit goal shall appear exactly once.
~~~

### BR-GOAL-VIEW-04 - Saving progress uses the goal/month overlap interval

- Representation: `ocl_postcondition`
- Context: `GoalService::getGoals(userId : Integer) : GoalListResponseDto`
- Enforcement layers: `backend`, `database`
- Failure behavior: When a saving goal is returned, targetAchieved equals owned revenue minus owned expense within the inclusive goal/month overlap; empty sums are zero and negative results remain negative.
- Traceability: `Use cases!A276:B294`, UC-13 Basic Flow 4-7, UML `Account`, `Transaction`, and `SavingGoalDto`

~~~text
context GoalService::getGoals(userId : Integer) : GoalListResponseDto

post BR_GOAL_VIEW_04_SavingTargetAchieved:
  not result.data.savingGoal.oclIsUndefined()
  implies
    let goal : Goal = Goal.allInstances()->any(g | g.goalId = result.data.savingGoal.goalId) in
    let periodStart : Date = if goal.startDate > currentMonthStart() then goal.startDate else currentMonthStart() endif in
    let periodEnd : Date = if goal.endDate < currentMonthEnd() then goal.endDate else currentMonthEnd() endif in
    let ownedAccountIds : Set(Integer) =
      Account.allInstances()
        ->select(a | a.userId = userId)
        ->collect(a | a.accountId)
        ->asSet()
    in
    let periodTransactions : Set(Transaction) =
      Transaction.allInstances()
        ->select(t |
          ownedAccountIds->includes(t.accountId) and
          t.transactionDate >= periodStart and
          t.transactionDate <= periodEnd
        )
        ->asSet()
    in
    let revenue : Decimal =
      periodTransactions
        ->select(t | t.type = TransactionType::REVENUE)
        ->collect(t | t.amount)
        ->sum()
    in
    let expense : Decimal =
      periodTransactions
        ->select(t | t.type = TransactionType::EXPENSE)
        ->collect(t | t.amount)
        ->sum()
    in
      result.data.savingGoal.targetAchieved = revenue - expense

Technical constraints:
- Saving progress is calculated only for the intersection between the selected Saving goal's date interval and the current calendar month.
- Transactions outside that intersection shall not contribute even if they are in the same calendar month.
- If no owned account or no matching transaction exists, the corresponding sum is treated as 0.
- Negative targetAchieved values are allowed and shall not be clamped to zero.
~~~

### BR-GOAL-VIEW-05 - Expense-limit progress uses category and goal/month overlap

- Representation: `ocl_postcondition`
- Context: `GoalService::getGoals(userId : Integer) : GoalListResponseDto`
- Enforcement layers: `backend`, `database`
- Failure behavior: Each returned expense goal's currentExpense contains only owned expense transactions in the matching category and inclusive goal/month overlap; empty sums are zero.
- Traceability: `Use cases!A276:B294`, UC-13 Basic Flow 4-7, UML `Goal`, `Account`, `Transaction`, and `ExpenseGoalDto`

~~~text
context GoalService::getGoals(userId : Integer) : GoalListResponseDto

post BR_GOAL_VIEW_05_CurrentExpense:
  result.data.expenseGoals->forAll(dto |
    let goal : Goal = Goal.allInstances()->any(g | g.goalId = dto.goalId) in
    let periodStart : Date = if goal.startDate > currentMonthStart() then goal.startDate else currentMonthStart() endif in
    let periodEnd : Date = if goal.endDate < currentMonthEnd() then goal.endDate else currentMonthEnd() endif in
    let ownedAccountIds : Set(Integer) =
      Account.allInstances()
        ->select(a | a.userId = userId)
        ->collect(a | a.accountId)
        ->asSet()
    in
    let expectedExpense : Decimal =
      Transaction.allInstances()
        ->select(t |
          ownedAccountIds->includes(t.accountId) and
          t.type = TransactionType::EXPENSE and
          t.categoryId = goal.categoryId and
          t.transactionDate >= periodStart and
          t.transactionDate <= periodEnd
        )
        ->collect(t | t.amount)
        ->sum()
    in
      dto.currentExpense = expectedExpense
  )

Technical constraints:
- Revenue transactions never contribute to currentExpense.
- Expense progress is calculated only for the intersection between each Expense_Limit goal's date interval and the current calendar month.
- Only transactions whose categoryId equals the goal's categoryId contribute.
- If no owned account or no matching transaction exists, currentExpense is 0.
~~~

### BR-GOAL-VIEW-06 - Category resolution and numeric normalization

- Representation: `ocl_postcondition`
- Context: `GoalService::getGoals(userId : Integer) : GoalListResponseDto`
- Enforcement layer: `backend`
- Failure behavior: Successful goal DTOs use the defined category fallback and trimming rules, and all returned saving and expense monetary values are rounded to two decimal places.
- Traceability: `Use cases!A276:B294`, UC-13 Basic Flow 4-6, UML `Category`, `SavingGoalDto`, and `ExpenseGoalDto`, `API-GOAL-LIST`

~~~text
context GoalService::getGoals(userId : Integer) : GoalListResponseDto

post BR_GOAL_VIEW_06_CategoryAndAmounts:
  result.data.expenseGoals->forAll(dto |
    let goal : Goal = Goal.allInstances()->any(g | g.goalId = dto.goalId) in
      dto.targetAmount = round2(goal.targetAmount) and
      dto.currentExpense = round2(dto.currentExpense) and
      (
        (goal.categoryId.oclIsUndefined() and dto.category = 'Uncategorized') or
        (not goal.categoryId.oclIsUndefined() and
          Category.allInstances()->exists(c |
            c.categoryId = goal.categoryId and
            StringNormalizer.trim(c.categoryName).size() > 0 and
            dto.category = StringNormalizer.trim(c.categoryName)
          )) or
        (not goal.categoryId.oclIsUndefined() and
          not Category.allInstances()->exists(c |
            c.categoryId = goal.categoryId and
            StringNormalizer.trim(c.categoryName).size() > 0
          ) and
          dto.category = 'Unknown')
      )
  )

Technical constraints:
- A null categoryId is represented as Uncategorized.
- A non-null categoryId with no resolvable non-blank category name is represented as Unknown.
- A resolved category name is trimmed before being returned.
- Saving and expense monetary values returned by this use case shall be rounded to two decimal places.
~~~

### BR-GOAL-VIEW-07 - Deterministic expense-goal priority ordering

- Representation: `ocl_postcondition`
- Context: `GoalService::getGoals(userId : Integer) : GoalListResponseDto`
- Enforcement layers: `backend`, `database`
- Failure behavior: Successful expenseGoals arrays use the defined exceeded-status, endDate, targetAmount, and goalId priority order deterministically.
- Traceability: `Use cases!A276:B294`, UC-13 Basic Flow 4-7, UML `Goal` and `GoalDataDto`

~~~text
context GoalService::getGoals(userId : Integer) : GoalListResponseDto

post BR_GOAL_VIEW_07_ExpenseGoalOrder:
  result.data.expenseGoals->size() <= 1 or
  Sequence{1..result.data.expenseGoals->size() - 1}->forAll(i |
    let a : ExpenseGoalDto = result.data.expenseGoals->at(i),
        b : ExpenseGoalDto = result.data.expenseGoals->at(i + 1),
        ga : Goal = Goal.allInstances()->any(g | g.goalId = a.goalId),
        gb : Goal = Goal.allInstances()->any(g | g.goalId = b.goalId),
        aExceeded : Boolean = a.currentExpense >= a.targetAmount,
        bExceeded : Boolean = b.currentExpense >= b.targetAmount
    in
      (aExceeded and not bExceeded) or
      (aExceeded = bExceeded and ga.endDate < gb.endDate) or
      (aExceeded = bExceeded and ga.endDate = gb.endDate and a.targetAmount < b.targetAmount) or
      (aExceeded = bExceeded and ga.endDate = gb.endDate and a.targetAmount = b.targetAmount and a.goalId < b.goalId)
  )

Technical constraints:
- Goals that have reached or exceeded their target amount shall be listed before goals still below their limit.
- Within the same exceeded/not-exceeded group, order by endDate ascending, then targetAmount ascending, then goalId ascending.
- The ordering shall be deterministic for the same persisted data and calculation date.
~~~

## Unresolved items

None.
