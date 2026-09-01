---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-11
uc_name: View Expenses by Category
source_use_case: docs/01-inception/use-cases/uc-11-view-expenses-by-category.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "66:5698"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-08-31T12:34:58Z
---

# UC-11 Business Coding Prompt (RQ3) - View Expenses by Category

## Prompt A: Backend API

### Objective: Build the selected-month expense-breakdown endpoint, retrieval and processing flow, validation, and server-side error handling.

Create the protected `GET /api/v1/expenses/breakdown` endpoint for `API-EXPENSE-BREAKDOWN` in the existing NestJS expenses module under `finalsource/be`.

- Protect the endpoint with the existing Bearer JWT authentication mechanism and `JwtAuthGuard`.
- Obtain the authenticated `userId` from the validated request identity represented by `AuthenticatedRequest`; do not accept a client-supplied user identifier.
- Accept the required `month` query parameter as a string in `YYYY-MM` format. The request has no body or path parameters.
- Implement the controller flow in `ExpensesController.getExpensesBreakdown(request, month)` and the main retrieval and processing flow in `ExpensesService.getExpensesBreakdown(userId, month)` using the existing Account, Transaction, and Category persistence mappings.
- Retrieve and process the authenticated user's expense-breakdown data for the selected month according to the use-case flow and existing persistence conventions. Do not invent unsupported filters, fields, calculations, or fallback data.
- Keep this GET operation read-only. It must not intentionally create, update, or delete financial data.
- Use the existing entities and schema. Do not edit entities or migrations and do not enable TypeORM `synchronize` without a separate researcher-approved schema proposal.

For HTTP 200, return the domain payload as an array of breakdown results with this interface:

```json
[
  {
    "category": "Entertainment",
    "total": 1500000,
    "changePercent": 25.5,
    "subCategories": [
      {
        "item_description": "Movie Ticket",
        "amount": 150000,
        "date": "2025-11-01"
      }
    ]
  }
]
```

`changePercent` is nullable. Wrap the domain payload through the normalized success handling:

```json
{
  "success": true,
  "message": "Expense breakdown retrieved successfully",
  "data": [
    {
      "category": "Entertainment",
      "total": 1500000,
      "changePercent": 25.5,
      "subCategories": [
        {
          "item_description": "Movie Ticket",
          "amount": 150000,
          "date": "2025-11-01"
        }
      ]
    }
  ]
}
```

Error handling:

- Missing or syntactically invalid `month`: preserve HTTP 400 and `"Tham số month không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM (ví dụ: 2025-11)"` through the normalized error envelope.
- Missing, invalid, or expired JWT: preserve HTTP 401 and the safe authentication message through the normalized error envelope.
- No expense-breakdown data for the selected month: preserve HTTP 404 and `"Không có dữ liệu chi tiêu cho tháng này."` through the normalized error envelope.
- Unexpected retrieval or processing failure: preserve HTTP 500 and `"Không thể lấy dữ liệu breakdown chi tiêu."` through the normalized error envelope.
- A syntactically shaped `YYYY-MM` value whose month portion is outside `01` through `12`, such as `2026-13`, is invalid and must return HTTP 400 with the month-validation error semantics. HTTP 404 is reserved for a valid calendar month with no expense-breakdown data.
- Preserve every error as `{ "success": false, "statusCode": <status>, "message": "<safe message>", "timestamp": "<ISO-8601>", "path": "/api/v1/expenses/breakdown" }`.

Follow the existing project architecture and dependencies. Do not log JWTs or sensitive financial payloads. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the selected-month expenses-breakdown interface according to the frozen Figma evidence and UC-11 functional scope.

Create or refine the `/expenses` route, `ExpensesPage`, and reusable `ExpensesBreakdown` component in `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `109. Expenses` at node `66:5698`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/66-5698`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact active target identified for UC-11 is:

- `109. Expenses` — node `66:5698`, 1440×1024.

The frame is shared with UC-10. For UC-11, implement the lower `Expenses Breakdown` category-card section and its surrounding page shell. The upper `Expenses Comparison` / `Monthly Comparison` visualization belongs to a separate use case; preserve an existing implementation if present, but do not create or change its data behavior here.

### Required UI

Reconstruct the target as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Preserve the desktop composition shown in the frozen target: 280 px dark navigation sidebar, top date/notification/search header, `#F4F5F7` content background, `Expenses Breakdown` heading, and a three-column grid of white category cards with subtle shadows.
- Each populated card displays its category icon area, category label, prominent total, comparison percentage and direction indicator, `Compare to last month` caption, and underlying expense rows with description, amount, and date.
- Follow the target's typography, spacing, dividers, gray surfaces, teal `#299D91` accent, green decrease indicator, and red increase indicator.
- Because UC-11 requires selecting another month but the frozen frame does not show a dedicated month control, add the smallest accessible, design-consistent month input adjacent to the `Expenses Breakdown` heading. Do not repurpose a design-only control whose behavior is defined elsewhere.
- Keep navigation and header controls consistent with existing application behavior. Design-only controls remain visual unless another authoritative use case defines their behavior.
- Include design-consistent loading, no-data, request-error, and expense-loading error states within the breakdown section.
- When the endpoint reports no breakdown data, display the no-data state instead of populated cards.
- Preserve the natural desktop layout and use the project's existing responsive conventions to collapse the card grid and prevent overflow on narrower viewports without inventing new content or interactions.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Load the authenticated user's expense breakdown for the selected month and implement the successful and month-change flows.

Continue in `ExpensesPage`, `ExpensesBreakdown`, and the existing frontend API layer.

- Add typed `ExpenseSubCategory`, `BreakdownResult`, and normalized expense-breakdown response shapes matching the interface from Prompt A.
- Manage `selectedMonth`, breakdown data, loading state, no-data state, and error state using the project's existing state approach.
- Initially select the current calendar month in local `YYYY-MM` form.
- Implement `fetchExpensesBreakdown(month)` to send `GET /api/v1/expenses/breakdown` with `query.month` through the existing Axios client when the authenticated user opens the Expenses page and whenever the user selects a different valid month.
- The request has no body or path parameters. Rely on the existing request interceptor to attach the Bearer JWT.
- Read the domain array from Axios `response.data.data`, where `response.data` is the normalized success envelope.
- On a non-empty HTTP 200 response, store the returned breakdown results and render one card per returned item using `category`, `total`, nullable `changePercent`, and `subCategories`.
- Render each detail using `item_description`, `amount`, and `date`. Format monetary values and ISO dates using the project's existing display conventions; do not invent a currency when the API supplies none.
- When the selected month changes, request that month's breakdown and replace the prior rendered result after the new request succeeds.
- Keep the flow read-only and do not add mutations to the Expenses page.

For HTTP 401, allow the existing Axios authentication-error handling to clear invalid session state and redirect or otherwise apply the application's established authentication flow. Do not duplicate that global session-reset behavior inside the page.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side month validation, loading state, no-data handling, response validation, and API error handling.

Refine `fetchExpensesBreakdown`, `ExpensesPage`, and `ExpensesBreakdown`.

### Loading State

- Show design-consistent card skeletons or a loading indicator while the initial or month-change GET is pending.
- Disable the month input while its request is pending and prevent duplicate concurrent requests for the same selected month.
- Do not replace the current breakdown with stale results from an earlier request after a later month has been selected.
- Hide stale error and no-data content while a new authorized retrieval is pending.
- Always settle the loading state after success or failure.

### API and Response Errors

- HTTP 400: display the returned month-validation message adjacent to the month input or at the top of the breakdown section.
- HTTP 401: use the application's established authentication-error handling and do not render protected expense data afterward.
- HTTP 404: clear populated breakdown data and display the design-consistent no-data state, using the returned safe message when present.
- HTTP 500 or another normalized API error: display the returned safe `message` when present; otherwise display a general expense-breakdown loading error within the breakdown section.
- Network failure: display the same general expense-breakdown loading error state.
- Treat a malformed success payload that is not an array, or an item missing a string `category`, finite numeric `total`, nullable finite numeric `changePercent`, or array `subCategories`, as a retrieval failure. Each detail must contain string `item_description`, finite numeric `amount`, and string `date`; do not render partial malformed data.
- Ensure the page can perform a later authorized retrieval after a failure without issuing overlapping requests.

### Client-Side Validation

- Before calling the API, require a selected month that matches `YYYY-MM` and identifies a calendar month from `01` through `12`.
- Display a validation message adjacent to the month input and do not call the API when client-side validation fails.
- Backend validation remains authoritative.

Do not log JWTs, financial payloads, or sensitive errors. Do not create or run tests.
