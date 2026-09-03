---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-15
uc_name: Adjust a Financial Goal
source_use_case: docs/01-inception/use-cases/uc-15-adjust-financial-goal.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "4795:6"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-03T12:56:11.3091712Z
approved_by_researcher_id: kien
approved_at: 2026-09-03T12:56:11.3091712Z
---

# UC-15 Business Coding Prompt (RQ3) - Adjust a Financial Goal

## Prompt A: Backend API

### Objective: Build the protected financial-goal update endpoint, request validation, persistence flow, and server-side error handling.

Create the protected `PUT /api/v1/goals/:goalId` endpoint for `API-GOAL-UPDATE` in the NestJS backend under `finalsource/be`.

- Require a valid, unexpired Bearer JWT and authorize the request as the authenticated application user.
- Read the application-user identity from the validated authentication context. Do not accept a user ID from the request body.
- Require `Content-Type: application/json`.
- Validate `goalId` as a required non-null integer path parameter identifying the goal to update.
- Define and validate an `UpdateGoalDto` containing only `target_amount`, a required, non-null, positive decimal number.
- Implement the controller and update flow using the `GoalController`, `GoalService`, `Goal`, `UpdateGoalDto`, `UpdatedGoalDto`, and `UpdateGoalResponseDto` structure defined by the UC-15 UML model.
- Authenticate and validate the request before persistence.
- Update the selected existing goal's target amount for the authenticated application user after source-defined validation succeeds.
- Map the public `target_amount` field to the existing entity's `targetAmount` convention.
- Do not accept or update `userId`, `goalType`, `categoryId`, `startDate`, or `endDate` through this endpoint because they are absent from the source-defined update DTO.
- Goal creation, deletion, and manual contribution entries are outside scope.

For HTTP 200, return the source-defined domain result inside the standard success envelope:

```json
{
  "success": true,
  "message": "Goal updated successfully",
  "data": {
    "updated_goal": {
      "goal_id": 5,
      "target_amount": 12000000
    }
  }
}
```

Error handling:

- Invalid `goalId`, missing or invalid `target_amount`, or another rejected update input: preserve HTTP 400 and the source validation message or message array, such as `"Invalid goal update data"`. Do not return a success result.
- Missing, invalid, or expired authentication: preserve HTTP 401 with the returned message, such as `"Unauthorized"`.
- An authenticated application user who is not authorized to modify the selected goal: preserve HTTP 403 with the returned message, such as `"Forbidden resource"`.
- A goal that cannot be found: preserve HTTP 404 with the returned message, such as `"Resource not found"`.
- Unexpected processing or persistence failure: preserve HTTP 500 with `"Đã xảy ra lỗi hệ thống khi cập nhật mục tiêu. Vui lòng thử lại sau."`.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/goals/<goalId>" }`.

Follow the existing NestJS 11, TypeORM/MySQL, class-validator, Passport JWT, Swagger, validation-pipe, and exception-filter conventions. Use existing ORM mappings and migration conventions. Do not alter the database schema without a researcher-approved schema proposal. Do not introduce unrelated layers or dependencies. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the protected Adjust Financial Goal modal on the Goals page using the frozen Figma visual evidence and UC-15 functional scope.

Create or complete `GoalsPage` and `AdjustGoalModal` for the protected `/goals` route under `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `UC-15 • Adjust Financial Goal` at node `4795:6`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/4795-6`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact identified target is:

- `UC-15 • Adjust Financial Goal` — node `4795:6`, 1440×900.

Reconstruct the interface as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Match the 1440×900 desktop composition: a 244px dark sidebar, light-gray page background, top content area, financial-goal cards, saving summary, and expense-goal category cards.
- Keep Goals as the active sidebar item and retain the established FINEbank.IO navigation treatment.
- Display goal actions using the design's outlined teal `Adjust` controls. Treat the selected goal's `Adjust` control as the UC-defined edit action that opens the modal.
- When a goal is selected, place a semi-transparent dark overlay over the page and center the white `AdjustGoalModal` shown in the design.
- Match the modal's approximate 520×356 desktop dimensions, 8px corner radius, padding, vertical spacing, and soft shadow.
- Display the title `Adjust Financial Goal`, supporting text `Update only the target amount for this goal.`, and an accessible close control.
- Display the current target amount in a read-only light-gray row labeled `Current target` with a VND-formatted value.
- Display one editable field labeled `New target amount`, with a visible `VND` suffix and the design's teal focus border.
- Display the source-backed hint `Enter a numeric amount greater than zero.` beneath the field.
- Display right-aligned `Cancel` and teal `Save` actions matching the design's dimensions, border treatment, typography, and colors.
- Preserve readable focus, validation, loading, and disabled states while keeping them visually consistent with the frame.
- Adapt the layout for narrower viewports without removing the modal fields or actions required by the use case.

Use existing project styling and shared layout conventions. Reuse local checksum-addressed assets only where the frame requires them. Design-only controls outside UC-15 remain visual unless another source defines their behavior. Do not introduce unrelated UI behavior. Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the selected goal and adjustment modal to the update API and implement the successful flow.

Continue working on `GoalsPage` and `AdjustGoalModal`.

- Add state for the selected goal, modal visibility, current target amount, new target amount, field validation, submission state, and notification state using the project's existing React approach.
- Open the modal when the application user selects the goal's edit/adjust action.
- Populate the read-only current-target display and initialize the new-target input from the selected goal.
- Close the modal without sending a request when the application user selects Cancel or the close control.
- Add or refine the typed goal API request and response definitions needed by this flow.
- Implement an asynchronous `updateGoal` operation that sends `PUT /api/v1/goals/:goalId` through the project's existing Axios client. If that client already supplies the `/api` base prefix, use the relative request path `/v1/goals/${goalId}`.
- Rely on the existing Axios authentication interceptor to attach the Bearer JWT.

Send exactly this request body shape:

```json
{
  "target_amount": 12000000
}
```

Read the normalized response's domain payload from `data`:

```json
{
  "success": true,
  "message": "Goal updated successfully",
  "data": {
    "updated_goal": {
      "goal_id": 5,
      "target_amount": 12000000
    }
  }
}
```

When the request succeeds:

1. Display the success message returned by the API.
2. Update or reconcile the selected goal using `data.updated_goal`.
3. Close the adjustment modal.
4. Refresh the goals list so the persisted target amount is visible.

Prevent duplicate submissions while the request is pending. Preserve numeric monetary values in the request and use the project's display formatting only at the UI boundary. Do not implement creation, deletion, or contribution behavior as part of this flow. Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, cancellation, and API error handling for goal adjustment.

Refine `updateGoal` in `AdjustGoalModal` and its integration with `GoalsPage`.

### Loading State

While the update request is pending:

- Disable Save, Cancel, the close control, and repeated goal-adjustment actions as needed to prevent duplicate submissions or accidental modal replacement.
- Display a spinner or `Saving...` text in the Save action.
- Preserve the entered value until the request completes.

### Client-Side Validation

Before calling the API:

- Require a selected goal with a valid integer `goalId`.
- Require `target_amount` to be present, numeric, finite, and greater than zero, as stated by the API contract and visible design hint.
- Display the field message adjacent to or directly beneath `New target amount`.
- Keep the modal open and do not call the API when validation fails.
- Do not add client-side constraints not stated by the use-case functional specification, UI evidence, or API contract.

Backend validation remains authoritative.

### API Error

- For HTTP 400, keep the modal open and display the returned validation message or message array near the target field when field-related; otherwise display it in the modal notification area.
- For HTTP 401, keep the goal unchanged and prompt the application user to authenticate using the project's existing authentication flow.
- For HTTP 403 or 404, keep the goal unchanged and display the returned message in the modal notification area.
- For HTTP 500 or an unexpected request failure, keep the goal unchanged and display the returned failure message, falling back to `"Đã xảy ra lỗi hệ thống khi cập nhật mục tiêu. Vui lòng thử lại sau."` only when no safe server message is available.
- Read messages from the normalized error envelope and do not expose stack traces, raw database errors, tokens, or sensitive payloads.
- Clear stale field and API errors when the application user edits the amount, cancels, or opens the modal for another goal.
- On any failure, do not close the modal, show a success notification, or update the displayed target amount as if persistence succeeded.

Use accessible error associations and an `aria-live` notification region where appropriate. Do not create or run tests.
