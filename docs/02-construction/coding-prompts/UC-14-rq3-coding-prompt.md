---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-14
uc_name: Create a Financial Goal
source_use_case: docs/01-inception/use-cases/uc-14-create-financial-goal.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "416:6052"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-03T10:47:38.7709117Z
approved_by_researcher_id: kien
approved_at: 2026-09-03T10:50:03.3516991Z
---

# UC-14 Business Coding Prompt (RQ3) - Create a Financial Goal

## Prompt A: Backend API

### Objective: Build the protected financial-goal creation endpoint, request validation, persistence flow, and server-side error handling.

Create the protected `POST /api/v1/goals` endpoint for `API-GOAL-CREATE` in the NestJS backend under `finalsource/be`.

- Require a valid, unexpired Bearer JWT and authorize the request as the authenticated application user.
- Read the owner identity from the validated authentication context. Do not accept a user ID from the request body.
- Require `Content-Type: application/json`.
- Define and validate a `CreateGoalDto` with these source-defined fields:
  - `goal_type`: required non-null string; accept only `Saving` or `Expense_Limit`.
  - `category_id`: optional nullable integer category identifier.
  - `start_date`: required non-null valid date string in `YYYY-MM-DD` format.
  - `end_date`: required non-null valid date string in `YYYY-MM-DD` format.
  - `target_amount`: required non-null positive decimal number.
- Implement the controller and creation flow using the `GoalController`, `GoalService`, `Goal`, `Category`, and DTO structure defined by the UC-14 UML model. Add only the module, controller, service, DTO, repository registration, and application-module wiring necessary for this endpoint.
- Authenticate and validate the request before persistence.
- Create exactly one goal for the authenticated application user after source-defined validation succeeds.
- Map the public request fields to the existing entity conventions: `goal_type` to `goalType`, `category_id` to `categoryId`, `start_date` to `startDate`, `end_date` to `endDate`, and `target_amount` to `targetAmount`.
- Preserve the UML cardinality that a goal category is optional. If the current database schema cannot persist the source-defined nullable category, prepare the required schema proposal and do not edit the entity or migration until the researcher approves it.
- Goal tracking, contribution adjustments, and milestone calculations are outside scope.

For HTTP 201, return the source-defined domain result inside the standard success envelope:

```json
{
  "success": true,
  "message": "Goal created successfully",
  "data": {
    "goal_id": 5
  }
}
```

Error handling:

- Invalid or missing request data or a rejected goal constraint: preserve HTTP 400 and the source validation message or message array, such as `"Invalid or missing goal data"`. Do not persist a goal.
- Missing, invalid, or expired authentication: preserve HTTP 401 with `"Unauthorized"`.
- Unexpected goal processing or persistence failure: preserve HTTP 500 with `"Đã xảy ra lỗi hệ thống khi tạo mục tiêu. Vui lòng thử lại sau."` and do not return a success result.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/goals" }`.

Follow the existing NestJS 11, TypeORM/MySQL, class-validator, Passport JWT, Swagger, validation-pipe, and exception-filter conventions. Use existing ORM mappings and migration conventions. Do not alter the database schema without a researcher-approved schema proposal. Do not introduce unrelated layers or dependencies. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the protected Create Goal modal on the Goals page using the frozen Figma visual evidence and UC-14 functional scope.

Create or complete `GoalsPage` and `CreateGoalModal` for the protected `/goals` route under `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `110.1. Goals` at node `416:6052`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/416-6052`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact identified target is:

- `110.1. Goals` — node `416:6052`, 1440×1024.

Reconstruct the interface as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Match the desktop composition: dark left navigation sidebar, light `#F4F5F7` main background, compact top utility row, `Goals` heading, savings-goal summary card, saving-summary chart card, expense-goal category cards, and centered white modal over a dimmed page overlay.
- Preserve the `FINEbank.IO` wordmark, sidebar labels and icons, teal active `Goals` item, logout/profile area, top date, notification icon, and rounded search control shown in the frame.
- Use the modal's visual language: centered rounded white card, close icon at the upper right, vertically stacked labeled controls, subtle gray input borders, and centered teal primary action.
- The approved frame depicts an adjustment modal with `Target Amounts` and `Present Amounts`, while UC-14 requires creation. Use the frame only as the visual contract for the modal and page shell. Replace the adjustment content with the smallest design-consistent Create Goal form containing:
  - A visible `Create Goal` title.
  - A required goal-type control with `Saving` and `Expense Limit` options, mapped to API values `Saving` and `Expense_Limit`.
  - A required target-amount input.
  - Required start-date and end-date controls.
  - A category selector populated from the category API and shown as required for `Expense Limit`.
  - A teal `Create Goal` submit action and an accessible close/cancel action.
- Add the smallest design-consistent `Create Goal` trigger to the Goals page because the approved frame contains only `Adjust Goal` actions but the UC trigger requires creation.
- Show field errors without breaking the modal hierarchy. Reserve stable modal areas for category-loading, submission-error, and success feedback.
- Keep search, notification, profile-menu, summary-period controls, chart interactions, and `Adjust Goal` controls visual-only unless equivalent behavior already exists or another source defines it.
- Keep `/goals` behind the existing protected-route mechanism. Reuse or adapt the shared layout and navigation rather than duplicating an existing application shell.
- Preserve the 1440×1024 desktop hierarchy and make the modal usable on narrower screens using existing responsive conventions without inventing new content.

The visual-to-functional mapping above is intentional: the checksum-valid frame governs styling and composition, while the UC-14 fields and actions govern creation behavior.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Load categories, submit the goal, and complete the successful or cancelled flow.

Continue in `GoalsPage`, `CreateGoalModal`, the existing frontend API services, and shared API types.

- Keep typed form state for `goal_type`, `category_id`, `start_date`, `end_date`, and `target_amount`, plus modal visibility, category loading, submission loading, field errors, request errors, and notification state.
- When the application user selects the `Create Goal` trigger, open the modal, initialize the form defaults, clear stale errors, and request categories through public `GET /api/categories` using the existing Axios instance. Because its base URL already includes `/api`, call relative path `/categories`.
- Read the category array from normalized Axios data at `response.data.data` and display each `category_name` with its `category_id` as the submitted value.
- When the application user closes or cancels the modal, terminate the operation without sending a creation request.
- Implement an asynchronous submit function that sends `POST /api/v1/goals`; with the existing `/api` Axios base URL, call relative path `/v1/goals`.
- Let the existing Axios interceptor attach the Bearer token.
- Send this JSON shape, converting form values to typed integer/decimal values after successful validation and omitting `category_id` when no category is selected:

```json
{
  "goal_type": "Expense_Limit",
  "category_id": 3,
  "start_date": "2025-11-01",
  "end_date": "2025-11-30",
  "target_amount": 10000000
}
```

- Read the normalized success envelope from Axios `response.data` and the created identifier from `response.data.data.goal_id`.
- On HTTP 201 success:
  1. Display a success notification using the returned `"Goal created successfully"` message.
  2. Clear the editable form fields and field errors.
  3. Close the modal.
  4. Refresh the goals list so the new goal is visible.
- Do not implement goal tracking, contribution adjustments, or milestone calculations.
- Preserve the API `YYYY-MM-DD` date strings and decimal value in the request.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side form validation, loading states, cancellation, and API error handling.

Refine the Create Goal flow on `/goals`.

### Loading State

- Track category loading and goal submission independently.
- While categories are loading, show a stable loading state in the category control and prevent submission until the category-loading result settles.
- During a valid submission, disable `Create Goal`, display design-consistent loading feedback, and prevent duplicate submissions.
- Keep the close/cancel control available unless navigation or modal teardown is already in progress.
- Always settle the applicable loading state after success or failure and clear stale submission errors before a new valid request.

### Client-Side Validation

Before calling the creation API:

- Require `goal_type` to be exactly `Saving` or `Expense_Limit`.
- Require `target_amount` to be a valid positive decimal number.
- Require `start_date` and `end_date` to be valid `YYYY-MM-DD` date strings.
- When `goal_type` is `Expense_Limit`, require `category_id` to identify one of the loaded category options.
- When an optional `category_id` is supplied, require it to be an integer identifying one of the loaded category options.
- Do not infer additional amount thresholds, date windows, duration limits, quotas, overlap checks, progress values, or contribution behavior that are absent from the functional specification, UI evidence, and API contracts.
- Display validation messages adjacent to the applicable controls, focus or identify the first invalid field accessibly, and do not call the creation API when validation fails.

Backend validation remains authoritative.

### API and Network Results

- Category-list HTTP 500 or network failure: display `"Đã xảy ra lỗi hệ thống khi lấy danh sách danh mục. Vui lòng thử lại sau."`, provide a retry action, and do not silently invent category options.
- Goal-create HTTP 400: display the returned validation message or message array in the modal error area while preserving entered values for correction.
- Goal-create HTTP 401: allow the existing authentication handling to clear the invalid session and redirect the application user to `/login`.
- Goal-create HTTP 500: display `"Đã xảy ra lỗi hệ thống khi tạo mục tiêu. Vui lòng thử lại sau."` in the modal error area and keep the application user on `/goals`.
- Network or unavailable-service failure: display a general goal-creation failure message and retain the form values when authentication remains valid.
- Never render raw server objects, stack traces, JWTs, full account numbers, or sensitive payloads in errors or logs.

Do not create or run tests.
