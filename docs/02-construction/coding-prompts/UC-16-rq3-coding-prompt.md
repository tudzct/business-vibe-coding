---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-16
uc_name: View Savings Summary
source_use_case: docs/01-inception/use-cases/uc-16-view-savings-summary.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "66:5829"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-03T13:57:52.4939832Z
approved_by_researcher_id: kien
approved_at: 2026-09-03T14:03:37.1886122Z
---

# UC-16 Business Coding Prompt (RQ3) - View Savings Summary

## Prompt A: Backend API

### Objective: Build the protected savings-summary endpoint, monthly comparison flow, query validation, and server-side error handling.

Create the protected `GET /api/v1/savings/summary` endpoint for `API-SAVINGS-SUMMARY` in the NestJS backend under `finalsource/be`.

- Require a valid, unexpired Bearer JWT and authorize the request as the authenticated application user.
- Read the application-user identity from the validated authentication context. Do not accept a user ID from query parameters or a request body.
- Accept an optional, non-null integer `year` query parameter in `YYYY` format. Its source-defined default is the current calendar year.
- Define the query and response DTOs represented by `SavingsSummaryQueryDto`, `MonthlySavingsDto`, `SavingsSummaryDataDto`, and `SavingsSummaryResponseDto` in the UC-16 UML model.
- Add only the `SavingsModule`, `SavingsController`, `SavingsService`, DTOs, repository registration, and application-module wiring needed by this endpoint.
- In `SavingsController`, authenticate the request, resolve the optional target year, and call `SavingsService.getSavingsSummary(userId, year)`.
- In `SavingsService`, evaluate transaction records belonging to the authenticated application user and compile monthly net-savings data for the resolved target year and the immediately preceding year.
- Return `this_year` and `last_year` as the two monthly comparison series. Each series contains the 12 calendar months, and each monthly item exposes the source-defined `month`, `amount`, and `transaction_count` fields.
- Preserve the source-defined two-digit month representation used by `MonthlySavingsDto` and the API contract.
- If no transactions or accounts exist for the evaluated periods, return empty summary datasets suitable for the frontend empty state without turning that condition into a server error.
- Keep this endpoint read-only. Do not create, modify, or delete financial records as part of the query.
- Updating transactions, account balances, or budget limits is outside scope.

For HTTP 200, return the source-defined domain result inside the standard success envelope:

```json
{
  "success": true,
  "message": "Savings summary retrieved successfully",
  "data": {
    "user_id": 1,
    "year": 2025,
    "summary": {
      "this_year": [
        {
          "month": "01",
          "amount": 1500000,
          "transaction_count": 8
        }
      ],
      "last_year": [
        {
          "month": "01",
          "amount": 1200000,
          "transaction_count": 6
        }
      ]
    }
  }
}
```

The example abbreviates the arrays for readability; the implemented response must follow the `MonthlySavingsDto [12]` cardinality supplied by the UML model when monthly data is returned.

Error handling:

- Missing, invalid, or expired authentication: preserve HTTP 401 with the returned message, such as `"Không thể xác thực người dùng. Vui lòng đăng nhập lại."`.
- An unexpected retrieval or calculation failure: preserve HTTP 500 with `"An internal server error occurred while processing the savings summary."`.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/savings/summary" }`.
- Do not expose query syntax, stack traces, credentials, tokens, full account numbers, or sensitive payloads.

Follow the existing NestJS 11, TypeORM/MySQL, class-validator, Passport JWT, Swagger, validation-pipe, and exception-filter conventions. Reuse the existing account and transaction entities and their ownership mappings. Do not alter the database schema without a researcher-approved schema proposal. Do not introduce unrelated layers or dependencies. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the authenticated Saving Summary section on the Goals page using the frozen Figma visual evidence and UC-16 functional scope.

Create or complete `GoalsPage` and `SavingsSummaryChart` for the protected `/goals` route under `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, Recharts, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `110. Goals` at node `66:5829`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/66-5829`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact identified target is:

- `110. Goals` — node `66:5829`, 1440×1024.

Reconstruct the interface as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Match the desktop composition: 280px dark navigation sidebar, light `#F4F5F7` main background, compact top utility row, `Goals` heading, savings-goal card, large white Saving Summary chart card, and expense-goal category cards.
- Preserve the `FINEbank.IO` wordmark, sidebar navigation, teal active `Goals` item, logout/profile area, top date, notification indicator, and rounded search control shown in the frame.
- Build the Saving Summary card as real UI with its white surface, rounded corners, soft shadow, header row, selector, legend, chart grid, axes, two comparison series, and responsive chart container.
- Replace the frame's example month-period selector with an accessible year selector because UC-16 compares a selected year with the preceding year.
- Replace the frame's example `This month` and `Same period last month` legend semantics with the resolved target year and preceding year. Keep the solid teal and muted comparison-series visual treatment.
- Plot the 12 monthly values returned in `summary.this_year` and `summary.last_year`, ordered on the horizontal axis by their two-digit month values.
- Display monetary values using the project's existing currency formatting at the UI boundary.
- Provide an interactive chart tooltip for a hovered data point using the `SavingsTooltip` UI model from the UML. Show the month, selected series, amount, and transaction count, and hide it when the pointer leaves the point.
- When both returned comparison datasets contain no transaction data, replace the chart with an appropriate empty-state notification indicating that no transaction data is available.
- Preserve accessible loading, failure, and empty states without changing the card's dimensions or causing avoidable layout shifts.
- Adapt the layout for narrower viewports while preserving the selector, legend, chart or empty state, and required feedback.

Use existing project styling and shared layout conventions. Reuse local checksum-addressed assets only where the frame requires them. Design-only controls outside UC-16 remain visual unless equivalent behavior already exists or another source defines them. Do not implement transaction editing, account-balance updates, or budget configuration. Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Load the annual comparison data, react to year changes, and render the successful or empty flow.

Continue in `GoalsPage`, `SavingsSummaryChart`, the existing frontend API services, and shared API types.

- Add typed definitions matching `MonthlySavingsDto`, `SavingsSummaryDataDto`, and `SavingsSummaryResponseDto` with `user_id`, `year`, `summary.this_year`, `summary.last_year`, and each monthly item's `month`, `amount`, and `transaction_count`.
- Add state for the selected year, resolved response year, both monthly series, initial loading, year-change loading, request errors, and the active chart tooltip using the project's existing React approach.
- Initialize the selector to the current calendar year and request the summary when the authenticated application user opens the Goals page.
- Implement an asynchronous `getSavingsSummary` operation that sends `GET /api/v1/savings/summary` through the project's existing Axios client. Because that client already supplies the `/api` base prefix, use relative path `/v1/savings/summary`.
- Let the existing Axios authentication interceptor attach the Bearer JWT.
- When a year is supplied, send it as the optional query parameter:

```text
GET /api/v1/savings/summary?year=2025
```

- Send no request body.
- Read the normalized success envelope from Axios `response.data` and the domain result from `response.data.data`.
- Treat the response's `data.year` as the resolved year displayed by the selector and legend.
- Bind `data.summary.this_year` to the target-year series and `data.summary.last_year` to the preceding-year series without renaming or reshaping their public fields beyond the chart adapter.

When the request succeeds:

1. Clear stale request errors.
2. Update the selector and legend from the resolved `data.year`.
3. Render both monthly series in the comparative chart when transaction data is available.
4. Otherwise render the source-defined no-transaction empty state instead of the chart.

When the application user selects another valid year, request the summary for that year and replace the displayed comparison only after a successful response. Ignore or cancel stale in-flight responses so a slower earlier request cannot overwrite a later selection. Keep the savings-summary read operation separate from goal creation or adjustment flows. Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete year validation, loading states, empty-state handling, and API error handling for the savings summary.

Refine `getSavingsSummary` and `SavingsSummaryChart` on `/goals`.

### Loading State

- During the initial request, show a design-consistent chart-card loading state or skeleton.
- While a year-change request is pending, disable the year selector, display a compact loading indicator, and prevent duplicate requests for the same selection.
- Keep the previously successful chart visible during a year-change request when this matches existing page conventions, but clearly indicate that updated data is loading.
- Always settle the applicable loading state after success or failure.

### Client-Side Validation

Before calling the API with a selected year:

- Require the value to be present and represent an integer year in `YYYY` format.
- Display a validation message adjacent to the year selector and do not call the API when validation fails.
- Do not add client-side constraints that are not stated by the use-case functional specification, UML model, Figma evidence, or API contract.

Backend validation remains authoritative.

### Empty State

- Determine the empty display from the returned monthly datasets and their transaction-count data.
- When no transaction data is available for the evaluated periods, hide the chart and display an appropriate no-transaction-data notification within the Saving Summary card.
- Do not treat an empty dataset as an API failure or show fabricated chart values.

### API Error

- For HTTP 401, clear protected savings-summary state and prompt the application user to authenticate using the project's existing authentication flow.
- For HTTP 500, preserve the previously successful chart when available and display `"An internal server error occurred while processing the savings summary."` in the chart-card notification area.
- For a network or unavailable-service failure, display a safe general savings-summary failure message and provide a retry action.
- Read messages from the normalized error envelope and support both string and string-array messages.
- Do not expose stack traces, raw database errors, tokens, full account numbers, or sensitive payloads in UI errors or logs.
- Clear stale validation and API errors when the application user chooses another year or retries the request.

Use accessible error associations and an `aria-live` notification region where appropriate. Do not create or run tests.
