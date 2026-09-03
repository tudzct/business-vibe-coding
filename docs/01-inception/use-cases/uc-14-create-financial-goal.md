---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-14
uc_name: "Create a Financial Goal"
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "Use cases"
source_range: "A295:B313"
retrieved_at: 2026-09-03T10:40:26.000Z
---

# UC-14: Create a Financial Goal

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab Use cases, columns A-B. This frozen repository projection is read-only; source corrections must be made in the spreadsheet and imported as a new revision.

## Functional Use-Case Specification

### Use Case ID

UC-14

### Use Case Name

Create a Financial Goal

### Description

As an authenticated user, I want to create a Saving or Expense_Limit goal.

### Actor(s)

Authenticated User

### Priority

Not Specified

### Trigger

The user selects Create Goal on the Goals page.

### Pre-Condition(s)

PRE-1: The user is authenticated.
PRE-2: The category reference data service is operational and accessible.

### Post-Condition(s)

POST-1: On success, the financial goal is created and persisted, the modal closes, a success notification appears, and the goals list refreshes.
POST-2: On failure, no goal is created and an appropriate error notification is displayed.

### Basic Flow

1. The user opens the Create Goal modal on the Goals page.
2. The modal loads available categories.
3. The form initializes default fields.
4. The user enters goal details: goal type, target amount, start date, end date, and category selection.
5. The user submits the goal creation form.
6. The frontend performs preliminary validation on the entered goal details.
7. The frontend sends the creation request (POST /api/v1/goals) to the backend API.
8. The backend authenticates the request and validates all goal inputs according to established business rules.
9. Upon successful validation, the backend creates and persists the new goal record.
10. The backend returns a success response with the created goal details.
11. The frontend displays a success notification, closes the modal, and refreshes the goals list.

### Alternative Flow

AF-1: Saving goal creation
4a. The user selects a Saving goal type.
9a. The system processes and records the saving goal.

AF-2: Expense limit goal creation
4b. The user selects an Expense Limit goal type and chooses a category.
9b. The system processes and records the expense limit goal.

AF-3: Form cancellation
5a. The user closes or cancels the modal, and the frontend terminates the operation without submitting data.

### Exception Flow

EF-1: Client-side validation failure
6a. If preliminary validation fails, the modal displays field errors and halts submission.

EF-2: Unauthorized request
8a. If user authentication is missing or expired, the backend rejects the request and the user is prompted to authenticate.

EF-3: Business validation failure
8b. If the goal inputs violate business constraints, the backend rejects the request and the modal displays the returned error message.

EF-4: Server or persistence failure
9a. If an unexpected error occurs during processing or storage, the backend returns an error and the frontend displays a failure notification.

### Related UI

GoalsPage; CreateGoalModal

### Related API IDs

API-GOAL-CREATE; API-CATEGORY-LIST

### Notes

Scope clarification: This use case handles the direct creation of financial goals (savings and expense limits). Goal tracking, contribution adjustments, and milestone calculations are outside scope.

## UML Model

~~~plantuml
@startuml

enum GoalType {
  SAVING
  EXPENSE_LIMIT
}

note right of GoalType
  SAVING maps to "Saving".
  EXPENSE_LIMIT maps to "Expense_Limit".
end note

class AuthenticatedRequest <<SecurityContext>> {
  userId: Integer [1]
}

class User <<Entity>> {
  userId: Integer [1]
}

class Category <<Entity>> {
  categoryId: Integer [1]
  categoryName: String [1]
}

class Goal <<Entity>> {
  goalId: Integer [1]
  userId: Integer [1]
  goalType: GoalType [1]
  categoryId: Integer [0..1]
  startDate: Date [1]
  endDate: Date [1]
  targetAmount: Decimal [1]
}

class CreateGoalDto <<DTO>> {
  goal_type: GoalType [1]
  category_id: Integer [0..1]
  start_date: String [1]
  end_date: String [1]
  target_amount: Decimal [1]
}

class CreateGoalResponseDto <<DTO>> {
  message: String [1]
  goal_id: Integer [1]
}

class GoalController <<Controller>> {
  createGoal(
    request: AuthenticatedRequest,
    dto: CreateGoalDto
  ): CreateGoalResponseDto
}

class GoalService <<Service>> {
  createGoal(
    userId: Integer,
    dto: CreateGoalDto
  ): Goal

  isValidDate(value: String): Boolean {query}
  toDate(value: String): Date {query}
}

User "1" -- "0..*" Goal : owns
Category "0..1" -- "0..*" Goal : categorizes

GoalController ..> AuthenticatedRequest
GoalController ..> CreateGoalDto
GoalController ..> CreateGoalResponseDto
GoalController ..> GoalService

GoalService ..> Goal
GoalService ..> Category
GoalService ..> CreateGoalDto

@enduml
~~~

## Business Rules

The following rules are authoritative for Prompt E. OCL is preserved where supplied; technical or non-OCL constraints remain authoritative natural-language requirements.

~~~text
BR-GOAL-04: Allowed goal type, active goals quota, and single active saving goal

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

Technical constraints:
- A user shall have at most 5 active goals (where endDate >= currentDate()) at any given time.
- A user shall have at most 1 active Saving goal at any given time.
- Creating a goal that exceeds the active quota or creates a concurrent active Saving goal shall result in HTTP 400 Bad Request.


BR-GOAL-05: Target amount domain thresholds and currency rounding

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

Technical constraints:
- target_amount shall be at least 100,000 VND and at most 1,000,000,000 VND.
- target_amount shall be an exact multiple of 10,000 VND.
- Any amount violating these thresholds shall result in HTTP 400 Bad Request.


BR-GOAL-06: Goal date horizon, minimum duration, and maximum duration window

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

Technical constraints:
- start_date and end_date shall use valid YYYY-MM-DD date strings.
- start_date shall not be more than 7 days in the past and not more than 30 days in the future relative to currentDate().
- The goal duration (end_date - start_date) shall be at least 7 days and at most 365 days.


BR-GOAL-07: Category requirements, non-overlapping expense limit periods, and persistence

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

Technical constraints:
- Expense_Limit goals require a valid, existing category_id.
- For Expense_Limit, no two goals for the same user and category may have overlapping date intervals ([startDate, endDate] overlap where existing.startDate <= new.endDate and existing.endDate >= new.startDate).
- Any category_id supplied for a Saving goal is not persisted; Saving goals are stored with categoryId = null.


BR-GOAL-08: Authenticated goal ownership and active account prerequisite

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

Technical constraints:
- The authenticated user shall own at least one bank account (Accounts record with user_id = userId) to establish a financial goal.
- userId shall be obtained from the validated JWT access token.
- The client shall not determine the owner through the request body.


BR-GOAL-09: Created goal persistence and initial progress state

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

Technical constraints:
- Exactly one new Goal record shall be inserted into the database.
- The created goal values must exactly reflect the validated input and normalized category assignment.


BR-GOAL-10: Successful creation response

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

Technical constraints:
- On successful creation, the backend shall return HTTP 201 Created with JSON structure containing success=true, message="Goal created successfully", and data containing the created goal_id.


BR-GOAL-11: Creation failure handling, transactionality, and concurrency safety

Technical constraints:
- Any validation failure (invalid goal type, active goal quota reached, concurrent saving goal conflict, amount out of range, unrounded amount, date window violation, goal duration outside [7, 365] days, missing/invalid category, or overlapping expense-limit interval) shall result in HTTP 400 Bad Request.
- If the authenticated user has no existing bank account, creation shall be rejected with HTTP 400 Bad Request.
- Validation or business constraint failures shall not persist any Goal record.
- Goal creation shall execute inside a database transaction to prevent partial persistence and ensure atomicity.
- Concurrency control or database locking shall prevent race conditions during concurrent goal creation requests for the same user.
- An unexpected repository/database failure shall result in HTTP 500 Internal Server Error with message:
  "Không thể tạo mục tiêu lúc này. Vui lòng thử lại sau."
~~~

