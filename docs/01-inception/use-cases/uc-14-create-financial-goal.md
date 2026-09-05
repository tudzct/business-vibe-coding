---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-14
uc_name: "Create a Financial Goal"
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "Use cases"
source_range: "A295:B313"
retrieved_at: 2026-09-05T08:24:09.000Z
---

# UC-14: Create a Financial Goal

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab `Use cases`, range `A295:B313`. This frozen repository projection is read-only; source corrections must be made in the spreadsheet and imported as a new revision.

## Functional Use-Case Specification

### Use Case ID

UC-14

### Use Case Name

Create a Financial Goal

### Description

As an authenticated user, I want to create a financial goal so that I can track a desired financial outcome.

### Actor(s)

Authenticated User

### Priority

Not Specified

### Trigger

The user selects Create Goal on the Goals page.

### Pre-Condition(s)

PRE-1: The user is authenticated.

### Post-Condition(s)

POST-1: After successful processing, the new financial goal is persisted in the database.
POST-2: After the goal is created successfully, the Create Goal modal closes and the user remains on /goals with the goal list refreshed.
POST-3: The page displays the successful creation feedback.

### Basic Flow

1. The user opens the Create Goal modal.
2. The frontend prepares the information required by the goal-creation form.
3. The user enters the financial-goal information.
4. The user submits the form.
5. The frontend sends a goal-creation request.
6. The backend authenticates the request and validates the submitted data according to the applicable business rules.
7. The backend creates and persists the new goal.
8. The backend returns the creation result.
9. The frontend closes the modal, refreshes the goal list, and displays the updated Goals page.

### Alternative Flow

AF-1: Select a different goal type
3a. The user selects another supported goal type.
3b. The frontend updates the form fields applicable to the selected type.
3c. The flow continues from Step 3.

AF-2: Cancel creation
4a. The user closes or cancels the modal.
4b. No goal-creation request is sent and the use case ends.

### Exception Flow

EF-1: Submitted data is rejected
6a. The submitted goal data does not satisfy the applicable validation or business rules.
6b. The backend returns HTTP 400.
6c. The modal displays the returned validation message and remains open.

EF-2: Authentication failure
6a. The backend cannot authenticate the request.
6b. The backend returns HTTP 401.
6c. The frontend applies the application's authentication-error handling.

EF-3: Persistence or processing failure
7a. An unexpected error occurs while creating the goal.
7b. The backend returns HTTP 500.
7c. The modal displays its create-goal failure state.

### Related UI

GoalsPage; CreateGoalModal

### Related API IDs

API-GOAL-CREATE; API-CATEGORY-LIST

### Notes

Experiment isolation:
- BR-GOAL-CREATE-01 through BR-GOAL-CREATE-07 are the treatment-sensitive Business Rules for UC-14.
- Description, pre/post-conditions, flows, UML, and the non-BR API contract intentionally avoid restating ownership authority, category semantics, target precision, prospective date limits, overlap conflicts, exact persistence, and atomicity semantics.
- The API contract defines only endpoint structure, authentication, request/response field shapes, and generic error contracts.
- The standard response envelope and HTTP transport behavior are project/API concerns and are not part of the core Business Rule effectiveness score.
- Figma layout/styling requirements are UI evidence and are not part of the core Business Rule score.

## UML Model

~~~plantuml
@startuml

enum GoalType {
  SAVING
  EXPENSE_LIMIT
}

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
  createGoal(request: AuthenticatedRequest, dto: CreateGoalDto): CreateGoalResponseDto
}

class GoalService <<Service>> {
  createGoal(userId: Integer, dto: CreateGoalDto): Goal
}

class GoalsPage <<UI>>
class CreateGoalModal <<UI>>

User "1" -- "0..*" Goal : owns
Category "0..1" -- "0..*" Goal : categorizes
GoalController ..> AuthenticatedRequest
GoalController ..> CreateGoalDto
GoalController ..> CreateGoalResponseDto
GoalController ..> GoalService
GoalService ..> Goal
GoalService ..> Category
GoalsPage --> CreateGoalModal
CreateGoalModal ..> CreateGoalResponseDto

@enduml
~~~

## Business Rules

The following rules are authoritative for Prompt E. OCL is preserved where supplied; technical or non-OCL constraints remain authoritative natural-language requirements.

~~~text
Specification helper semantics used only by the UC-14 Business Rules:
- parseIsoDate(s): parses s only when s is a valid calendar date written exactly as YYYY-MM-DD.
- todayAtMidnight(): returns the backend server's current calendar date with the time component normalized to 00:00:00.000.
- calendarDaysBetween(a, b): returns the number of calendar-day boundaries from a to b.
- decimalScale(x): returns the number of fractional decimal digits in x after removing insignificant trailing zeros.

BR-GOAL-CREATE-01: Authenticated ownership is authoritative

context GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal

pre BR_GOAL_CREATE_01_AuthenticatedIdentity:
  not userId.oclIsUndefined()

post BR_GOAL_CREATE_01_Ownership:
  result.userId = userId

Technical constraints:
- userId shall come from the validated authentication context.
- The client shall not provide, select, or override the owner of the created goal.
- No goal belonging to another user may be modified as part of this operation.

BR-GOAL-CREATE-02: Goal type determines category semantics

context GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal

pre BR_GOAL_CREATE_02_AllowedType:
  Set{GoalType::SAVING, GoalType::EXPENSE_LIMIT}->includes(dto.goal_type)

pre BR_GOAL_CREATE_02_CategorySemantics:
  (dto.goal_type = GoalType::SAVING implies dto.category_id.oclIsUndefined()) and
  (dto.goal_type = GoalType::EXPENSE_LIMIT implies
    not dto.category_id.oclIsUndefined() and
    Category.allInstances()->exists(c | c.categoryId = dto.category_id))

post BR_GOAL_CREATE_02_CategoryPersisted:
  (dto.goal_type = GoalType::SAVING implies result.categoryId.oclIsUndefined()) and
  (dto.goal_type = GoalType::EXPENSE_LIMIT implies result.categoryId = dto.category_id)

Technical constraints:
- A Saving goal request containing a non-null category_id is invalid; the category value shall not be silently discarded.
- An Expense_Limit goal requires a category_id that resolves to an existing Category.

BR-GOAL-CREATE-03: Target amount precision and positivity

context GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal

pre BR_GOAL_CREATE_03_TargetDefined:
  not dto.target_amount.oclIsUndefined()

pre BR_GOAL_CREATE_03_TargetPositive:
  dto.target_amount > 0

pre BR_GOAL_CREATE_03_TargetScale:
  decimalScale(dto.target_amount) <= 2

post BR_GOAL_CREATE_03_TargetPreserved:
  result.targetAmount = dto.target_amount

Technical constraints:
- target_amount shall be a finite decimal value greater than zero.
- More than two significant fractional decimal digits shall be rejected rather than silently rounded.

BR-GOAL-CREATE-04: Prospective bounded date interval

context GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal

pre BR_GOAL_CREATE_04_StrictDates:
  parseIsoDate(dto.start_date) is defined and
  parseIsoDate(dto.end_date) is defined

pre BR_GOAL_CREATE_04_ProspectiveInterval:
  parseIsoDate(dto.start_date) >= todayAtMidnight() and
  parseIsoDate(dto.end_date) > parseIsoDate(dto.start_date)

pre BR_GOAL_CREATE_04_MaxDuration:
  calendarDaysBetween(parseIsoDate(dto.start_date), parseIsoDate(dto.end_date)) <= 366

Technical constraints:
- start_date and end_date shall be valid calendar dates written exactly as YYYY-MM-DD.
- A goal may start today or in the future, but shall not start before the backend server's current calendar date.
- end_date shall be strictly later than start_date.
- A single goal interval shall not exceed 366 calendar days.

BR-GOAL-CREATE-05: Conflicting goal intervals are prohibited

context GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal

pre BR_GOAL_CREATE_05_NoConflictingOverlap:
  let newStart : Date = parseIsoDate(dto.start_date),
      newEnd : Date = parseIsoDate(dto.end_date)
  in
    if dto.goal_type = GoalType::SAVING then
      Goal.allInstances()
        ->select(g | g.userId = userId and g.goalType = GoalType::SAVING)
        ->forAll(g | not (g.startDate <= newEnd and g.endDate >= newStart))
    else
      Goal.allInstances()
        ->select(g |
          g.userId = userId and
          g.goalType = GoalType::EXPENSE_LIMIT and
          g.categoryId = dto.category_id
        )
        ->forAll(g | not (g.startDate <= newEnd and g.endDate >= newStart))
    endif

Technical constraints:
- Date intervals are inclusive for conflict detection.
- Two Saving goals owned by the same user shall not have overlapping intervals.
- Two Expense_Limit goals owned by the same user for the same category shall not have overlapping intervals.
- Expense_Limit goals for different categories may overlap.
- Because interval boundaries are inclusive, an existing goal ending on the requested start_date is considered conflicting.

BR-GOAL-CREATE-06: Exact persistence with existing-goal preservation

context GoalService::createGoal(userId : Integer, dto : CreateGoalDto) : Goal

post BR_GOAL_CREATE_06_ExactlyOneCreated:
  Goal.allInstances()->size() = Goal.allInstances()@pre->size() + 1

post BR_GOAL_CREATE_06_PersistedValues:
  Goal.allInstances()->one(g |
    g.goalId = result.goalId and
    g.userId = userId and
    g.goalType = dto.goal_type and
    g.startDate = parseIsoDate(dto.start_date) and
    g.endDate = parseIsoDate(dto.end_date) and
    g.targetAmount = dto.target_amount and
    ((dto.goal_type = GoalType::SAVING and g.categoryId.oclIsUndefined()) or
     (dto.goal_type = GoalType::EXPENSE_LIMIT and g.categoryId = dto.category_id))
  )

Technical constraints:
- A successful operation shall insert exactly one new Goal record.
- Existing Goal records shall not be updated or deleted by creation.
- The returned goal_id shall identify the newly persisted Goal record.

BR-GOAL-CREATE-07: Validation, conflict, and persistence failures are atomic

Technical constraints:
- Any violation of BR-GOAL-CREATE-01 through BR-GOAL-CREATE-05 shall reject the request with HTTP 400 and shall not persist a Goal record.
- An unexpected repository or database failure shall return HTTP 500 and shall not leave a partially persisted Goal record.
- The conflict check in BR-GOAL-CREATE-05 and insertion of the new Goal shall be executed atomically, transactionally, or with an equivalent concurrency-safe mechanism so that two concurrent conflicting requests cannot both succeed.
- Success shall be reported only after persistence has completed.
~~~
