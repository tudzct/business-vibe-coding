---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-15
source_use_case: docs/01-inception/use-cases/uc-15-adjust-financial-goal.md
source_use_case_sha256: sha256:8a0a1b0255e499a2d35494b400951ee712825b6f8471143894a9884b6e51e096
---

# UC-15 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A314:B331`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-09-03T10:57:46.000Z`

## Ordered Business Rules

### BR-GOAL-12 - Target amount domain thresholds, currency rounding, and non-identical value requirement

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `GoalService::updateGoal(userId : Integer, goalId : Integer, dto : UpdateGoalDto) : Goal`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: A target amount outside [100000, 1000000000] VND, not rounded to multiples of 10,000 VND, or identical to the current target amount results in HTTP 400 Bad Request.
- Traceability: `Use cases!A314:B331`; `UC-15 Basic Flow 3-6`; `UC-15 EF-1`; `UC-15 EF-3`; `API-GOAL-UPDATE`

### BR-GOAL-13 - Existing goal and active period requirement

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `GoalService::updateGoal(userId : Integer, goalId : Integer, dto : UpdateGoalDto) : Goal`
- Enforcement layer(s): `backend`
- Failure behavior: If the goal does not exist, return HTTP 404 Not Found with message "Mục tiêu không tồn tại." If the goal exists but is expired (endDate < currentDate()), return HTTP 400 Bad Request with message "Không thể điều chỉnh mục tiêu tài chính đã kết thúc."
- Traceability: `Use cases!A314:B331`; `UC-15 Basic Flow 6-7`; `UC-15 EF-3`; `API-GOAL-UPDATE`

### BR-GOAL-14 - Authenticated goal ownership

- Representation: `OCL precondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `GoalService::updateGoal(userId : Integer, goalId : Integer, dto : UpdateGoalDto) : Goal`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Missing or invalid JWT produces HTTP 401; attempting to modify a goal owned by another user produces HTTP 403 Forbidden with message "Bạn không có quyền chỉnh sửa mục tiêu này."
- Traceability: `Use cases!A314:B331`; `UC-15 PRE-1`; `UC-15 Basic Flow 6`; `UC-15 EF-2`; `UC-15 EF-3`; `API-GOAL-UPDATE`

### BR-GOAL-15 - Target-only goal update and structural field immutability

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `GoalService::updateGoal(userId : Integer, goalId : Integer, dto : UpdateGoalDto) : Goal`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Only targetAmount is modified; metadata fields remain strictly unchanged. The operation creates no new records and deletes no existing records.
- Traceability: `Use cases!A314:B331`; `UC-15 POST-1`; `UC-15 Basic Flow 7`; `API-GOAL-UPDATE`

### BR-GOAL-16 - Successful update response

- Representation: `OCL postcondition`
- Expression / authoritative text:

~~~text
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
~~~

- Context: `GoalController::updateGoal(request : AuthenticatedRequest, goalId : Integer, dto : UpdateGoalDto) : UpdateGoalResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Successful update returns HTTP 200 OK with success envelope, updated goal identifier, and updated target amount.
- Traceability: `Use cases!A314:B331`; `UC-15 Basic Flow 8`; `API-GOAL-UPDATE`

### BR-GOAL-17 - Update failure handling, transactionality, and concurrency safety

- Representation: `natural language`
- Expression / authoritative text:

~~~text
Technical constraints:
- An invalid amount, amount out of range, unrounded amount, identical amount to current, or an expired goal shall result in HTTP 400 Bad Request.
- If the goal does not exist, the backend shall return HTTP 404 Not Found.
- If the goal belongs to another user, the backend shall return HTTP 403 Forbidden.
- A failed or rejected update shall not persist any changed values in the database.
- Goal update shall execute inside an atomic database transaction.
- Concurrency control or database locking shall prevent race conditions during concurrent goal adjustments.
- An unexpected repository/database failure while saving shall result in HTTP 500 Internal Server Error with message:
  "Không thể lưu thay đổi lúc này. Vui lòng thử lại sau."
~~~

- Context: `GoalService::updateGoal(userId : Integer, goalId : Integer, dto : UpdateGoalDto) : Goal`
- Enforcement layer(s): `backend`, `database`
- Failure behavior: Validation or constraint failures produce HTTP 400, 403, or 404 without mutating stored data; server errors produce HTTP 500 with rollback.
- Traceability: `Use cases!A314:B331`; `UC-15 POST-2`; `UC-15 EF-1`; `UC-15 EF-3`; `UC-15 EF-4`; `API-GOAL-UPDATE`

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
