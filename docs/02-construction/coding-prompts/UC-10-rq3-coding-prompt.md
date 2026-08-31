---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-10
uc_name: View Monthly Expense Summary
source_use_case: docs/01-inception/use-cases/uc-10-view-monthly-expense-summary.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "66:5698"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-08-31T07:39:49Z
---

# UC-10 Business Coding Prompt (RQ3) - View Monthly Expense Summary

## Prompt A: Backend API

### Objective: Build the monthly expense-summary endpoint, retrieval and aggregation flow, validation, and server-side error handling.

Create the protected `GET /api/v1/expenses/summary` endpoint for `API-EXPENSE-SUMMARY` in the existing NestJS expenses module under `finalsource/be`.

- Protect the endpoint with the existing Bearer JWT authentication mechanism and `JwtAuthGuard`.
- Obtain the authenticated `userId` from the validated request identity represented by `AuthenticatedRequest`; do not accept request body, query, or path parameters.
- Implement the controller flow in `ExpensesController.getExpenseSummary(request)` and the main retrieval and aggregation logic in `ExpensesService.getExpenseSummary(userId)` using the existing Account and Transaction persistence mappings.
- Retrieve and aggregate the relevant expense data for the authenticated user's monthly summary, following the functional flow and existing persistence conventions without inventing unsupported filters, parameters, or fields.
- Keep this GET operation read-only. It must not intentionally create, update, or delete financial data.
- Use the existing entities and schema. Do not edit entities or migrations and do not enable TypeORM `synchronize` without a separate researcher-approved schema proposal.

For HTTP 200, return the domain payload as an array of monthly summary items:

```json
[
  {
    "month": "Aug",
    "totalExpense": 160000
  }
]
```

Wrap the domain payload through the normalized success handling:

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "month": "Aug",
      "totalExpense": 160000
    }
  ]
}
```

When no expense summary data is available, return HTTP 200 with the same envelope semantics and `data: []`. When only partial monthly data is available, return the available monthly summary items without inventing additional source data.

Error handling:

- Missing, invalid, or expired JWT: preserve HTTP 401 and the safe authentication message through `{ "success": false, "statusCode": 401, "message": "<safe message>", "timestamp": "<ISO-8601>", "path": "/api/v1/expenses/summary" }`.
- Unexpected retrieval or aggregation failure: preserve HTTP 500 and `"Không thể lấy dữ liệu chi tiêu."` through the normalized error envelope.
- Other failures: preserve their source HTTP status and safe message through `{ "success": false, "statusCode": <status>, "message": "<safe message>", "timestamp": "<ISO-8601>", "path": "/api/v1/expenses/summary" }`.

Follow the existing project architecture and dependencies. Do not log JWTs or sensitive financial payloads. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the monthly expense-comparison interface according to the frozen Figma evidence and UC-10 functional scope.

Create or refine the `/expenses` route, `ExpensesPage`, and reusable `ExpenseSummaryChart` in `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, Recharts, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `109. Expenses` at node `66:5698`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/66-5698`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact active target identified for UC-10 is:

- `109. Expenses` — node `66:5698`, 1440×1024.

The frame is shared with UC-11. For UC-10, implement the top `Expenses Comparison` / `Monthly Comparison` visualization and its surrounding page shell. The `Expenses Breakdown` category cards belong to a separate use case and are outside this prompt; preserve existing implementations if present, but do not create their data behavior here.

### Required UI

Reconstruct the target as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Preserve the desktop composition shown in the frozen target: 280 px dark navigation sidebar, top date/notification/search header, `#F4F5F7` content background, `Expenses Comparison` heading, and a white rounded monthly-chart card with subtle shadow.
- Show the `Monthly Comparison` card title, Jan-Dec horizontal labels, the money-value vertical axis and horizontal grid lines, following the target's typography, spacing, gray surfaces, and teal `#299D91` accent treatment.
- The API defines one `totalExpense` value per returned month. Render one truthful expense-total data series. Do not invent a second comparison value merely to reproduce the paired sample bars or `This Week` / `Last Week` sample legend visible in the reference image.
- Apply the Figma-derived current-month emphasis using the teal accent and a neutral gray treatment for the other displayed months.
- Keep navigation and header controls consistent with existing application behavior. Design-only controls remain visual unless another authoritative use case defines their behavior.
- Include design-consistent loading, no-data, and expense-loading error states within the comparison area.
- When the summary response is empty, display a clear no-data state and do not display the monthly comparison chart.
- Preserve the natural desktop layout and use the project's existing responsive conventions to prevent overflow on narrower viewports without inventing new content or interactions.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Load the authenticated user's monthly expense summary and implement the successful, partial-data, and empty flows.

Continue in `ExpensesPage`, `ExpenseSummaryChart`, and the existing frontend API layer.

- Add typed `ExpenseSummaryItem` and normalized expense-summary response shapes with `month: string` and `totalExpense: number`.
- Manage the summary data, loading state, and error state using the project's existing state approach.
- Implement `fetchExpenseSummary` to send `GET /api/v1/expenses/summary` through the existing Axios client when the authenticated user opens the Expenses page. The request has no body, query parameters, or path parameters.
- Rely on the existing request interceptor to attach the Bearer JWT.
- Read the domain array from Axios `response.data.data`, where `response.data` is the normalized success envelope.
- On a non-empty successful response, prepare the returned monthly items for the chart and render the monthly expense comparison using the API's `month` and `totalExpense` values.
- On a partial successful response, visualize the available monthly summary data without inventing missing source values.
- On an empty successful response, skip chart-data preparation and render the no-data state.
- Format monetary values using the project's existing display convention. Do not invent a currency when the API supplies none.
- Keep the flow read-only and do not add mutations to the Expenses page.

For HTTP 401, allow the existing Axios authentication-error handling to clear invalid session state and redirect or otherwise apply the application's established authentication flow. Do not duplicate that global session-reset behavior inside the page.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete loading-state, response validation, and API error handling for the expense-summary retrieval.

Refine `fetchExpenseSummary`, `ExpensesPage`, and `ExpenseSummaryChart`.

### Loading State

- Show a design-consistent loading indicator or chart skeleton while the initial GET is pending.
- Prevent duplicate concurrent summary requests from the same page lifecycle.
- Hide stale error content while a new authorized retrieval is pending.
- Always settle the loading state after success or failure.

### API and Response Errors

- HTTP 401: use the application's established authentication-error handling and do not render protected expense data afterward.
- HTTP 500 or another normalized API error: display the returned safe `message` when present; otherwise display a general expense-loading error within the comparison area.
- Network failure: display the same general expense-loading error state.
- Treat a malformed success payload that is not an array, or an item without a string `month` and finite numeric `totalExpense`, as a retrieval failure. Do not render partial malformed data.
- Ensure the page can perform a later authorized retrieval after a failure without issuing overlapping requests.

### Client-Side Validation

This GET operation has no client-entered request fields, request body, query parameters, or path parameters, so no field-level client validation applies. Authentication and expense retrieval remain authoritative in the backend.

Do not log JWTs, financial payloads, or sensitive errors. Do not create or run tests.
