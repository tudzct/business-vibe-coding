---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-03
uc_name: View Transaction History
source_use_case: docs/01-inception/use-cases/uc-03-view-transaction-history.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "66:5474"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-02T12:34:57.8584901Z
approved_by_researcher_id: kien
approved_at: 2026-09-02T12:40:06.1445325Z
---

# UC-03 Business Coding Prompt (RQ3) - View Transaction History

## Prompt A: Backend API

### Objective: Build the protected transaction-list endpoint, filtering and pagination logic, validation, and server-side error handling.

Create the protected `GET /api/v1/transactions` endpoint for `API-TRANSACTION-LIST` in the NestJS backend under `finalsource/be`.

- Require a valid, unexpired Bearer JWT and authorize the request as the authenticated application user.
- Read the authenticated user identity from the validated authentication context; do not accept a user ID from the query string or request body.
- Define and validate a transaction-list query DTO with `type`, `limit`, and `offset`.
- `type` is required, non-null, and must be exactly `All`, `Revenue`, or `Expense`.
- `limit` is an optional positive integer and defaults to `10` when omitted.
- `offset` is an optional non-negative integer and defaults to `0` when omitted.
- Accept no request body.
- Implement the list flow in the existing transaction module conventions. Add the smallest required controller, service, DTO, repository/module registration, and application-module wiring where they do not yet exist.
- Retrieve only transactions associated with accounts belonging to the authenticated user.
- Apply the requested transaction-type filter and pagination parameters and compute the total matching record count and whether another page is available.
- Map each returned record to the API fields `transaction_id`, `account_id`, `transaction_date`, `type`, `item_description`, `shop_name`, `amount`, `payment_method`, and `status`.
- Keep this GET operation read-only; it must not create, update, or delete transaction records.

For HTTP 200, return the domain result inside the standard success envelope:

```json
{
  "success": true,
  "message": "Transactions retrieved successfully.",
  "data": {
    "data": [
      {
        "transaction_id": 8,
        "account_id": 3,
        "transaction_date": "2025-11-01",
        "type": "Expense",
        "item_description": "Movie Ticket",
        "shop_name": "Cinema",
        "amount": 150000,
        "payment_method": "Credit Card",
        "status": "Complete"
      }
    ],
    "total": 25,
    "hasMore": true
  }
}
```

An empty matching result remains HTTP 200 with an empty inner `data` array, `total: 0`, and the corresponding boolean `hasMore` value.

Error handling:

- Invalid query parameters: preserve HTTP 400 and the source validation message or message array, such as `"Invalid transaction query parameter"`.
- Missing, invalid, or expired authentication: preserve HTTP 401 with `"Unauthorized"`.
- Unexpected transaction retrieval or database failure: preserve HTTP 500 with the safe message `"Đã xảy ra lỗi hệ thống khi lấy danh sách giao dịch. Vui lòng thử lại sau."`.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/transactions" }`.

Follow the existing NestJS 11, TypeORM/MySQL, class-validator, Passport JWT, Swagger, validation-pipe, and exception-filter conventions. Do not introduce unrelated layers or dependencies. Use existing entity mappings and do not alter the database schema for this use case. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the protected transaction-history interface according to the frozen Figma evidence and UC-03 functional scope.

Create or replace the `/transactions` route page in `finalsource/fe/src/pages/Transactions/Transactions.tsx` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `107. Transactions` at node `66:5474`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/66-5474`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact target is:

- `107. Transactions` — node `66:5474`, 1440×1024.

Reconstruct the page as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Match the desktop composition: a dark left navigation sidebar, light `#F4F5F7` main background, compact top utility row, `Recent Transaction` heading, filter tabs, and a large rounded white transaction card.
- Preserve the `FINEbank.IO` wordmark, sidebar navigation labels and icons, teal active `Transactions` item, logout/profile area, top date, notification icon, and rounded search control shown in the frame.
- Render the filter tabs `All`, `Revenue`, and `Expenses`; map the visible `Expenses` label to the API value `Expense`.
- Render the table headers `Items`, `Shop Name`, `Date`, `Payment Method`, and `Amount` with design-consistent spacing, typography, dividers, row icons, and amount alignment.
- Render transaction values from `item_description`, `shop_name`, `transaction_date`, `payment_method`, and `amount` without changing the underlying domain values.
- Show the centered teal `Load More` control only when additional results are available.
- When no records match the selected criteria, replace the rows with a clear, design-consistent empty-state message and do not offer further pagination.
- Include stable loading and error areas that do not unnecessarily shift the page composition.
- Keep search, notification, profile-menu, and navigation controls that lack UC/API behavior visual-only unless equivalent behavior already exists in the project.
- Keep `/transactions` behind the existing protected-route mechanism. Reuse or adapt the shared layout and navigation where possible while matching the frozen frame.
- Preserve the desktop hierarchy and make the table, tabs, and actions usable on narrower screens using existing responsive conventions without inventing new content.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the transaction page to the list API and implement filtering and incremental pagination.

Continue in `finalsource/fe/src/pages/Transactions/Transactions.tsx`, `finalsource/fe/src/api/transaction.service.ts`, and the shared API types.

- Define the filter type as `All | Revenue | Expense` and the list result as `{ data: Transaction[]; total: number; hasMore: boolean }`.
- Keep state for the selected filter, transaction rows, total count, `hasMore`, offset, loading mode, and request error.
- Initialize the page with `type=All`, `limit=10`, and `offset=0`.
- Update `transactionService.getTransactions` to send a typed `GET` request through the existing Axios instance. Because its base URL already includes `/api`, call the relative path `/v1/transactions`.
- Send query parameters only; send no request body:

```text
type=All|Revenue|Expense&limit=<positive-integer>&offset=<non-negative-integer>
```

- Let the existing Axios interceptor attach the Bearer token.
- Read the normalized envelope from Axios `response.data` and the transaction-list domain result from `response.data.data`.
- On initial page entry, request the first page and replace the displayed rows with the returned inner `data` array.
- When the user changes the filter, reset the offset and current rows, request the first page for the selected type, and render the replacement result.
- When the user activates `Load More`, request the subsequent offset and append the returned inner `data` array to the existing rows without duplicating the current page.
- Update `total`, `hasMore`, and offset from the successful result and the number of records already loaded. Hide or disable `Load More` when `hasMore` is false.
- Format the API date and amount for the Figma presentation using existing project utilities while preserving the returned values and field meanings.
- Do not mutate transaction records as part of viewing, filtering, or pagination.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side query validation, loading states, empty results, and API error handling.

Refine the transaction-list request flow and `/transactions` page.

### Loading State

- Set loading state immediately before each valid request and always settle it after success or failure.
- During the initial request or filter replacement, prevent duplicate requests and show design-consistent loading feedback in the transaction card.
- During incremental pagination, disable the `Load More` control, prevent duplicate submissions, and show loading feedback without clearing previously loaded rows.
- Prevent filter changes from triggering duplicate requests while the replacement request is in progress.
- Clear stale request errors before a new valid request.

### Client-Side Validation

Before calling the API:

- Require `type` to be exactly `All`, `Revenue`, or `Expense`.
- Require `limit` to be a positive integer.
- Require `offset` to be a non-negative integer.
- Do not call the API when these client-side query values are invalid.
- Display an accessible validation message in the transaction-card error area if invalid internal query state is encountered.

Backend validation remains authoritative. Do not infer additional filter values, limits, date ranges, account filters, category filters, or search behavior that are absent from the functional specification and API contract.

### API, Empty, and Network Results

- HTTP 400: display the returned validation message or message array in the transaction-card error area and keep the selected filter available for correction.
- HTTP 401: allow the existing authentication handling to clear the invalid session and redirect the application user to `/login`.
- HTTP 500: display the returned safe server message in the transaction-card error area.
- Network or unavailable-service failure: display a general transaction-loading failure message and keep the application user on `/transactions` when authentication remains valid.
- A successful empty array is not an error. Display the empty state, retain the selected filter, and offer no further load action.
- On a failed `Load More` request, preserve the rows already displayed and allow a later retry.
- Never render raw server objects, stack traces, JWTs, full account numbers, or sensitive payloads in errors or logs.

Do not create or run tests.
