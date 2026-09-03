---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-14
source_use_case: docs/01-inception/use-cases/uc-14-create-financial-goal.md
source_use_case_sha256: sha256:5745e236a1fbd9a12fb9ed0aad8011cc11877b26c33c6dac43ff487ff3ab097b
---

# UC-14 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A295:B313`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-09-03T10:40:26.000Z`

## Ordered Business Rules

### BR-GOAL-04 - Allowed goal type, active goals quota, and single active saving goal

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context GoalService::createGoal(
  userId : Integer,
  dto : CreateGoalDto
) : Goal

pre BR_GOAL_04_GoalTypeDefined:
  not dto.goal_type.oclIsUndefined()

pre BR_GOAL_04_AllowedGoalType:
  Set{
    GoalType::SAVING,
    GoalType::EXPENSE_LIMIT
  }->includes(dto.goal_type)

pre BR_GOAL_04_MaxActiveGoalsLimit:
  Goal.allInstances()->select(g |
    g.userId = userId and
    g.endDate >= currentDate()
  )->size() < 5

pre BR_GOAL_04_SingleActiveSavingGoal:
  dto.goal_type = GoalType::SAVING implies
    not Goal.allInstances()->exists(g |
      g.userId = userId and
      g.goalType = GoalType::SAVING and
      g.endDate >= currentDate()
    )
~~~

- Context: `GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Attempting to create a goal with an invalid type, exceeding the quota of 5 active goals, or creating a concurrent active Saving goal results in HTTP 400 Bad Request.
- Traceability: `Use cases!A295:B313`; `UC-14 Basic Flow 4 and 8`; `UC-14 AF-1`; `UC-14 EF-1`; `UC-14 EF-3`; `API-GOAL-CREATE`

### BR-GOAL-05 - Target amount domain thresholds and currency rounding

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context GoalService::createGoal(
  userId : Integer,
  dto : CreateGoalDto
) : Goal

pre BR_GOAL_05_TargetDefined:
  not dto.target_amount.oclIsUndefined()

pre BR_GOAL_05_TargetRange:
  dto.target_amount >= 100000 and
  dto.target_amount <= 1000000000

pre BR_GOAL_05_CurrencyRoundingStep:
  dto.target_amount.mod(10000) = 0
~~~

- Context: `GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: A target amount outside [100000, 1000000000] VND or not rounded to multiples of 10,000 VND results in HTTP 400 Bad Request.
- Traceability: `Use cases!A295:B313`; `UC-14 Basic Flow 4 and 8`; `UC-14 EF-1`; `UC-14 EF-3`; `API-GOAL-CREATE`

### BR-GOAL-06 - Goal date horizon, minimum duration, and maximum duration window

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
context GoalService::createGoal(
  userId : Integer,
  dto : CreateGoalDto
) : Goal

pre BR_GOAL_06_DatesDefined:
  not dto.start_date.oclIsUndefined() and
  not dto.end_date.oclIsUndefined()

pre BR_GOAL_06_ValidDates:
  self.isValidDate(dto.start_date) and
  self.isValidDate(dto.end_date)

pre BR_GOAL_06_StartDateHorizon:
  self.toDate(dto.start_date) >= currentDate() - 7 and
  self.toDate(dto.start_date) <= currentDate() + 30

pre BR_GOAL_06_DurationIntervalWindow:
  self.toDate(dto.end_date) >= self.toDate(dto.start_date) + 7 and
  self.toDate(dto.end_date) <= self.toDate(dto.start_date) + 365
~~~

- Context: `GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Dates outside valid format, start dates outside [-7, +30] days relative to current date, or duration outside [7, 365] days result in HTTP 400 Bad Request.
- Traceability: `Use cases!A295:B313`; `UC-14 Basic Flow 4 and 8`; `UC-14 EF-1`; `UC-14 EF-3`; `API-GOAL-CREATE`

### BR-GOAL-07 - Category requirements, non-overlapping expense limit periods, and persistence

- Representation: `OCL precondition and postcondition`
- Expression / authoritative text:

~~~text
context GoalService::createGoal(
  userId : Integer,
  dto : CreateGoalDto
) : Goal

pre BR_GOAL_07_ExpenseCategoryRequiredAndExists:
  dto.goal_type = GoalType::EXPENSE_LIMIT implies
    (not dto.category_id.oclIsUndefined() and
     Category.allInstances()->exists(c |
       c.categoryId = dto.category_id
     ))

pre BR_GOAL_07_NoOverlappingExpenseLimitForCategory:
  dto.goal_type = GoalType::EXPENSE_LIMIT implies
    not Goal.allInstances()->exists(g |
      g.userId = userId and
      g.goalType = GoalType::EXPENSE_LIMIT and
      g.categoryId = dto.category_id and
      g.startDate <= self.toDate(dto.end_date) and
      g.endDate >= self.toDate(dto.start_date)
    )

post BR_GOAL_07_CategoryPersisted:
  (dto.goal_type = GoalType::SAVING implies
    result.categoryId.oclIsUndefined()) and
  (dto.goal_type = GoalType::EXPENSE_LIMIT implies
    result.categoryId = dto.category_id)
~~~

- Context: `GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal`
- Enforcement layer(s): `frontend`, `backend`, `database`
- Failure behavior: Missing or invalid category for Expense_Limit, or overlapping date ranges for the same user and category, results in HTTP 400 Bad Request. Saving goals persist categoryId as null.
- Traceability: `Use cases!A295:B313`; `UC-14 Basic Flow 2, 4, 8, 9`; `UC-14 AF-1`; `UC-14 AF-2`; `UC-14 EF-1`; `UC-14 EF-3`; `API-GOAL-CREATE`

### BR-GOAL-08 - Authenticated goal ownership and active account prerequisite

- Representation: `OCL precondition and postcondition`
- Expression / authoritative text:

~~~text
context GoalService::createGoal(
  userId : Integer,
  dto : CreateGoalDto
) : Goal

pre BR_GOAL_08_UserHasActiveAccount:
  Account.allInstances()->exists(a |
    a.user_id = userId
  )

post BR_GOAL_08_OwnedByAuthenticatedUser:
  result.userId = userId
~~~

- Context: `GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Missing authentication produces HTTP 401; user having no active bank accounts produces HTTP 400.
- Traceability: `Use cases!A295:B313`; `UC-14 PRE-1`; `UC-14 Basic Flow 8-9`; `UC-14 EF-2`; `API-GOAL-CREATE`

### BR-GOAL-09 - Created goal persistence and initial progress state

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context GoalService::createGoal(
  userId : Integer,
  dto : CreateGoalDto
) : Goal

post BR_GOAL_09_ExactlyOneGoalCreated:
  Goal.allInstances()->size() =
    Goal.allInstances()@pre->size() + 1

post BR_GOAL_09_PersistedValues:
  Goal.allInstances()->one(g |
    g.goalId = result.goalId and
    g.userId = userId and
    g.goalType = dto.goal_type and
    g.startDate = self.toDate(dto.start_date) and
    g.endDate = self.toDate(dto.end_date) and
    g.targetAmount = dto.target_amount and
    ((dto.goal_type = GoalType::SAVING and g.categoryId.oclIsUndefined()) or
     (dto.goal_type = GoalType::EXPENSE_LIMIT and g.categoryId = dto.category_id))
  )
~~~

- Context: `GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Persistence failure results in HTTP 500 and creates no Goal record.
- Traceability: `Use cases!A295:B313`; `UC-14 POST-1`; `UC-14 Basic Flow 9`; `UC-14 EF-4`; `API-GOAL-CREATE`

### BR-GOAL-10 - Successful creation response

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
context GoalController::createGoal(
  request : AuthenticatedRequest,
  dto : CreateGoalDto
) : CreateGoalResponseDto

post BR_GOAL_10_Response:
  result.message = 'Goal created successfully' and
  Goal.allInstances()->exists(g |
    g.goalId = result.goal_id and
    g.userId = request.userId
  )
~~~

- Context: `GoalController::createGoal(request : AuthenticatedRequest, dto : CreateGoalDto) : CreateGoalResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Response returns HTTP 201 with success envelope and goal_id.
- Traceability: `Use cases!A295:B313`; `UC-14 Basic Flow 10`; `API-GOAL-CREATE`

### BR-GOAL-11 - Creation failure handling, transactionality, and concurrency safety

- Representation: `natural language`
- Expression / authoritative text:

~~~text
Technical constraints:
- Any validation failure (invalid goal type, active goal quota reached, concurrent saving goal conflict, amount out of range, unrounded amount, date window violation, goal duration outside [7, 365] days, missing/invalid category, or overlapping expense-limit interval) shall result in HTTP 400 Bad Request.
- If the authenticated user has no existing bank account, creation shall be rejected with HTTP 400 Bad Request.
- Validation or business constraint failures shall not persist any Goal record.
- Goal creation shall execute inside a database transaction to prevent partial persistence and ensure atomicity.
- Concurrency control or database locking shall prevent race conditions during concurrent goal creation requests for the same user.
- An unexpected repository/database failure shall result in HTTP 500 Internal Server Error with message:
  "Không thể tạo mục tiêu lúc này. Vui lòng thử lại sau."
~~~

- Context: `GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Constraint failures yield HTTP 400; system/database failures yield HTTP 500 with exact error message and rollback.
- Traceability: `Use cases!A295:B313`; `UC-14 POST-2`; `UC-14 EF-1`; `UC-14 EF-3`; `UC-14 EF-4`; `API-GOAL-CREATE`

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
