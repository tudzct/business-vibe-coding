---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-15
uc_name: "Adjust a Financial Goal"
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "Use cases"
source_range: "A314:B331"
retrieved_at: 2026-09-03T10:57:46.000Z
---

# UC-15: Adjust a Financial Goal

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab Use cases, columns A-B. This frozen repository projection is read-only; source corrections must be made in the spreadsheet and imported as a new revision.

## Functional Use-Case Specification

### Use Case ID

UC-15

### Use Case Name

Adjust a Financial Goal

### Description

As an authenticated goal owner, I want to change an existing goal's target amount.

### Actor(s)

Authenticated User

### Priority

Not Specified

### Trigger

The user selects Edit on a displayed Saving or Expense_Limit goal.

### Pre-Condition(s)

PRE-1: The user is authenticated.
PRE-2: The financial goal adjustment interface is accessible.

### Post-Condition(s)

POST-1: On success, the financial goal is updated, the modal closes, a success notification appears, and the goals list refreshes.
POST-2: On failure, the goal remains unchanged and an appropriate error notification is displayed.

### Basic Flow

1. The user selects Edit for a displayed goal on the Goals page.
2. The modal opens displaying the current goal details.
3. The user modifies the target amount and submits the form.
4. The frontend performs preliminary validation on the entered target amount.
5. The frontend sends the update request (PUT /api/v1/goals/:goalId) to the backend API.
6. The backend authenticates the request and validates all update inputs according to established business rules.
7. Upon successful validation, the backend updates the goal record.
8. The backend returns a success response with the updated goal details.
9. The frontend displays a success notification, closes the modal, and refreshes the goals list.

### Alternative Flow

AF-1: Form cancellation
3a. The user closes or cancels the modal, and the frontend terminates the operation without submitting data.

### Exception Flow

EF-1: Client-side validation failure
4a. If preliminary validation fails, the modal displays field errors and halts submission.

EF-2: Unauthorized request
6a. If user authentication is missing or expired, the backend rejects the request and the user is prompted to authenticate.

EF-3: Business validation or permission failure
6b. If the update request violates business constraints or security rules, the backend rejects the request and the frontend displays the returned error notification.

EF-4: Server or persistence failure
7a. If an unexpected error occurs during processing or storage, the backend returns an error and the frontend displays a failure notification.

### Related UI

GoalsPage; AdjustGoalModal

### Related API IDs

API-GOAL-UPDATE

### Notes

Scope clarification: This use case handles adjusting existing financial goals. Goal creation, deletion, and manual contribution entries are outside scope.

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

class Goal <<Entity>> {
  goalId: Integer [1]
  userId: Integer [1]
  goalType: GoalType [1]
  categoryId: Integer [0..1]
  startDate: Date [1]
  endDate: Date [1]
  targetAmount: Decimal [1]
}

class UpdateGoalDto <<DTO>> {
  target_amount: Decimal [1]
}

class UpdatedGoalDto <<DTO>> {
  goal_id: Integer [1]
  target_amount: Decimal [1]
}

class UpdateGoalResponseDto <<DTO>> {
  message: String [1]
  updated_goal: UpdatedGoalDto [1]
}

class GoalController <<Controller>> {
  updateGoal(
    request: AuthenticatedRequest,
    goalId: Integer,
    dto: UpdateGoalDto
  ): UpdateGoalResponseDto
}

class GoalService <<Service>> {
  updateGoal(
    userId: Integer,
    goalId: Integer,
    dto: UpdateGoalDto
  ): Goal
}

User "1" -- "0..*" Goal : owns

GoalController ..> AuthenticatedRequest
GoalController ..> UpdateGoalDto
GoalController ..> UpdateGoalResponseDto
GoalController ..> GoalService

GoalService ..> Goal
GoalService ..> UpdateGoalDto

UpdateGoalResponseDto --> UpdatedGoalDto
UpdatedGoalDto ..> Goal : maps from

@enduml
~~~

## Business Rules

The following rules are authoritative for Prompt E. OCL is preserved where supplied; technical or non-OCL constraints remain authoritative natural-language requirements.

~~~text
BR-GOAL-12: Target amount domain thresholds, currency rounding, and non-identical value requirement

context GoalService::updateGoal(
  userId : Integer,
  goalId : Integer,
  dto : UpdateGoalDto
) : Goal

pre BR_GOAL_12_TargetDefined:
  not dto.target_amount.oclIsUndefined()

pre BR_GOAL_12_TargetRange:
  dto.target_amount >= 100000 and
  dto.target_amount <= 1000000000

pre BR_GOAL_12_CurrencyRoundingStep:
  dto.target_amount.mod(10000) = 0

pre BR_GOAL_12_TargetAmountChanged:
  Goal.allInstances()->exists(g |
    g.goalId = goalId and
    g.targetAmount <> dto.target_amount
  )

Technical constraints:
- target_amount shall be at least 100,000 VND and at most 1,000,000,000 VND.
- target_amount shall be an exact multiple of 10,000 VND.
- The new target_amount shall be different from the currently stored targetAmount of the goal.
- Any amount violating these thresholds or matching the current target amount shall result in HTTP 400 Bad Request.


BR-GOAL-13: Existing goal and active period requirement

context GoalService::updateGoal(
  userId : Integer,
  goalId : Integer,
  dto : UpdateGoalDto
) : Goal

pre BR_GOAL_13_GoalExists:
  Goal.allInstances()->exists(g |
    g.goalId = goalId
  )

pre BR_GOAL_13_GoalIsActive:
  Goal.allInstances()->exists(g |
    g.goalId = goalId and
    g.endDate >= currentDate()
  )

Technical constraints:
- If no Goal exists with goalId, the backend shall return HTTP 404 Not Found with message "Mục tiêu không tồn tại."
- If the goal exists but has already expired (endDate < currentDate()), the backend shall return HTTP 400 Bad Request with message "Không thể điều chỉnh mục tiêu tài chính đã kết thúc."


BR-GOAL-14: Authenticated goal ownership

context GoalService::updateGoal(
  userId : Integer,
  goalId : Integer,
  dto : UpdateGoalDto
) : Goal

pre BR_GOAL_14_OwnedByAuthenticatedUser:
  Goal.allInstances()->exists(g |
    g.goalId = goalId and
    g.userId = userId
  )

Technical constraints:
- userId shall be obtained from the validated JWT access token.
- If the goal belongs to another user, the backend shall return HTTP 403 Forbidden with message "Bạn không có quyền chỉnh sửa mục tiêu này."


BR-GOAL-15: Target-only goal update and structural field immutability

context GoalService::updateGoal(
  userId : Integer,
  goalId : Integer,
  dto : UpdateGoalDto
) : Goal

post BR_GOAL_15_NoGoalCreatedOrDeleted:
  Goal.allInstances()->size() =
    Goal.allInstances()@pre->size()

post BR_GOAL_15_OnlyTargetAmountChanged:
  let original : Goal =
    Goal.allInstances()@pre->any(g |
      g.goalId = goalId
    )
  in
  let updated : Goal =
    Goal.allInstances()->any(g |
      g.goalId = goalId
    )
  in
    updated.targetAmount = dto.target_amount and
    updated.userId = original.userId and
    updated.goalType = original.goalType and
    updated.startDate = original.startDate and
    updated.endDate = original.endDate and
    updated.categoryId.oclIsUndefined() =
      original.categoryId.oclIsUndefined() and
    (
      not original.categoryId.oclIsUndefined()
      implies updated.categoryId = original.categoryId
    )

Technical constraints:
- Only targetAmount shall be updated; all other fields (userId, goalType, startDate, endDate, categoryId) must remain strictly unchanged.
- The update operation shall not create or delete any Goal records.


BR-GOAL-16: Successful update response

context GoalController::updateGoal(
  request : AuthenticatedRequest,
  goalId : Integer,
  dto : UpdateGoalDto
) : UpdateGoalResponseDto

post BR_GOAL_16_Response:
  result.message = 'Goal updated successfully' and
  result.updated_goal.goal_id = goalId and
  result.updated_goal.target_amount = dto.target_amount and
  Goal.allInstances()->exists(g |
    g.goalId = goalId and
    g.userId = request.userId and
    g.targetAmount = dto.target_amount
  )

Technical constraints:
- On successful update, the backend shall return HTTP 200 OK with success envelope containing message="Goal updated successfully" and updated_goal payload containing goal_id and target_amount.



