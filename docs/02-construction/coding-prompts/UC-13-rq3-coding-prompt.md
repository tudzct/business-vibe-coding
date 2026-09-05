---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-13
uc_name: View Financial Goals
source_use_case: docs/01-inception/use-cases/uc-13-view-financial-goals.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "66:5829"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-05T08:33:13Z
---

# UC-13 Business Coding Prompt (RQ3) - View Financial Goals

## Prompt A: Backend API

### Objective: Build the financial-goals endpoint, retrieval and processing flow, and server-side error handling.

Create the protected `GET /api/v1/goals` endpoint for `API-GOAL-LIST` in the existing NestJS backend under `finalsource/be`.

- Protect the endpoint with the existing Bearer JWT authentication mechanism and `JwtAuthGuard`.
- Obtain the authenticated `userId` from the validated request identity represented by `AuthenticatedRequest`. The request has no body, query parameters, or path parameters.
- Implement the controller entry point as `GoalController.getGoals(request)` and the main retrieval and processing flow as `GoalService.getGoals(userId)` using the existing `Goal`, `Account`, `Transaction`, and `Category` persistence mappings.
- Retrieve and process the authenticated user's relevant financial-goal and financial data for the Goals view according to the use-case functional flow and existing persistence conventions. Do not invent unsupported request inputs, response fields, filters, calculations, mutations, or fallback data.
- Keep this GET operation read-only. It must not intentionally create, update, or delete stored goal, account, category, or transaction data.
- Use the existing entities and schema. Do not edit entities or migrations and do not enable TypeORM `synchronize` without a separate researcher-approved schema proposal.

For HTTP 200, return this domain payload shape:

```json
{
  "savingGoal": {
    "goal_id": 2,
    "goal_type": "Saving",
    "target_amount": 10000000,
    "target_achieved": 3500000,
    "start_date": "2025-11-01",
    "end_date": "2025-11-30"
  },
  "expenseGoals": [
    {
      "goal_id": 5,
      "category": "Food",
      "target_amount": 3000000,
      "current_expense": 1200000
    }
  ]
}
```

`savingGoal` is nullable and `expenseGoals` is always an array. Wrap the domain payload through the normalized success handling:

```json
{
  "success": true,
  "message": "Lấy danh sách mục tiêu thành công",
  "data": {
    "savingGoal": null,
    "expenseGoals": []
  }
}
```

When no applicable goal data is available, return HTTP 200 with the same success message, `savingGoal: null`, and an empty `expenseGoals` array. When only part of the goal data is available, return the available section while preserving the same response structure.

Error handling:

- Missing, invalid, or expired JWT: preserve HTTP 401 and the safe authentication message through the normalized error envelope.
- Unexpected goal retrieval or response-processing failure: preserve HTTP 500 and `"Đã xảy ra lỗi hệ thống khi tải mục tiêu, vui lòng thử lại sau."` through the normalized error envelope.
- Preserve every error as `{ "success": false, "statusCode": <status>, "message": "<safe message>", "timestamp": "<ISO-8601>", "path": "/api/v1/goals" }`.

Follow the existing project architecture and dependencies. Do not log JWTs or sensitive financial payloads. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the Goals interface according to the frozen Figma evidence and UC-13 functional scope.

Create or refine the protected `/goals` route and `GoalsPage` under `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `110. Goals` at node `66:5829`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/66-5829`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact active target identified for UC-13 is:

- `110. Goals` — node `66:5829`, 1440×1024.

### Required UI

Reconstruct the target as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Preserve the desktop composition shown in the frozen target: 280 px dark navigation sidebar, top date/notification/search header, `#F4F5F7` content background, and the `Goals` page heading.
- Present returned saving-goal data in the large white `Savings Goal` card, including target achieved, target amount, the goal date interval, and a design-consistent progress visualization derived from returned values.
- Present returned expense-goal items under `Expenses Goals by Category` as responsive white cards showing the returned category and monetary goal/progress information without fabricating fields.
- Preserve the target's rounded cards, subtle shadows, gray surfaces, dark text, teal `#299D91` navigation accent, typography, spacing, and responsive layout.
- Keep navigation, header, search, notification, logout, profile, and overflow controls consistent with existing application behavior.
- The shared Figma frame also contains a `Saving Summary` chart and `Adjust` controls. They remain visual or retain existing behavior unless another authoritative use case already implements their data or interaction; do not invent summary data, goal-adjustment behavior, or additional APIs for UC-13.
- Keep the available Create Goal action consistent with the existing application behavior and design. Do not implement the create-goal workflow as part of UC-13.
- Include design-consistent loading, no-goals, partial-data, and retryable goal-loading error states in the main content area.
- The no-goals state must render no goal cards, clearly communicate that no goals are available, and retain the available Create Goal action.
- The partial-data state must render only the available goal sections.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Load and display the authenticated user's financial-goal data.

Continue in `GoalsPage` and the existing frontend API layer.

- Add typed saving-goal, expense-goal, goal-data, and normalized response shapes matching Prompt A and the API field names exactly.
- Manage goal data, loading state, empty state, partial-data state, and error state using the project's existing state approach.
- Implement `fetchGoals()` to send `GET /api/v1/goals` through the existing Axios client when the authenticated user opens `/goals`.
- The request has no body, query parameters, or path parameters. Rely on the existing request interceptor to attach the Bearer JWT.
- Read the goal payload from Axios `response.data.data`, where `response.data` is the normalized success envelope.
- When a saving goal is returned, render the saving-goal section from its returned fields. When it is null, do not prepare or render that goal card.
- Render one expense-goal card per returned `expenseGoals` item. When that array is empty, do not prepare or render expense-goal cards.
- When both sections are absent, clear previously populated data and display the no-goals state with the available Create Goal action.
- When only one section is available, render only that section without fabricating placeholder goal data.
- Render returned date and monetary values using the project's existing display conventions while preserving source values and without inventing a currency when the API supplies none.
- Keep the flow read-only and do not add goal creation, adjustment, account, category, or transaction mutations to this page.

For HTTP 401, allow the existing Axios authentication-error handling to clear invalid session state and redirect or otherwise apply the application's established authentication flow. Do not duplicate that global session-reset behavior inside the page.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete loading, empty/partial state, response validation, retry, and API-error handling.

Refine `fetchGoals()` and `GoalsPage`.

### Loading State

- Show design-consistent card skeletons or a loading indicator while the initial or retried GET is pending.
- Disable the retry action while a request is pending and prevent duplicate concurrent retrievals.
- Hide stale error and empty-state content while a new authorized retrieval is pending.
- Do not allow a stale response from an earlier request to replace a later request's result.
- Always settle the loading state after success or failure.

### API and Response Errors

- HTTP 401: use the application's established authentication-error handling and do not render protected goal data afterward.
- HTTP 500 or another normalized API error: clear protected goal data and display the returned safe `message` when present; otherwise display a general goal-loading error in the main content area.
- Network failure: clear protected goal data and display the same general goal-loading error state.
- Treat a malformed success payload as a retrieval failure. Require `data` to be an object, `savingGoal` to be null or an object with finite numeric `goal_id`, `target_amount`, and `target_achieved`, string `goal_type`, `start_date`, and `end_date`, and `expenseGoals` to be an array whose items have finite numeric `goal_id`, `target_amount`, and `current_expense` plus string `category`.
- Do not render partial malformed data.
- Provide an accessible retry action in the goal-loading error state. Selecting it calls `fetchGoals()` again and permits a later authorized retrieval without overlapping requests.

### Client-Side Validation

The list request has no user-entered body, query, or path values, so no additional client-side field validation is required. Backend authentication remains authoritative.

Do not log JWTs, financial payloads, or sensitive errors. Do not create or run tests.
