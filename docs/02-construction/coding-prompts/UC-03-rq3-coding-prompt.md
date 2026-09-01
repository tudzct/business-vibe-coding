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
generated_at: 2026-08-31T13:51:55.7244405Z
---

# UC-03 Business Coding Prompt (RQ3) - View Transaction History

## Prompt A: Backend API

### Objective: Build the protected transaction-list endpoint, query validation, ownership-scoped retrieval, pagination, and server-side error handling.

Create the protected `GET /api/v1/transactions` endpoint for `API-TRANSACTION-LIST` in the NestJS backend under `finalsource/be`.

- Add the transaction module, controller, service, query DTO, and response DTO under the existing `src/modules/transaction` structure, and register the module with the application.
- Protect the endpoint with the project's Bearer JWT authentication mechanism. Derive the authenticated user's ID from the validated token; do not accept a user ID from the query or request body.
- Keep the operation read-only. It must not create, update, or delete Transaction or Account records.
- Do not alter the database schema for this use case.

### Request Format

The request has no body. Accept these query parameters:

- `type`: required, non-null string; exactly `All`, `Revenue`, or `Expense`.
- `limit`: optional integer greater than 0; default `10` when omitted.
- `offset`: optional integer greater than or equal to 0; default `0` when omitted.

Reject undeclared query parameters through the existing validation pipeline. Parse numeric query values as integers and return HTTP 400 when validation fails.

### Logic

Implement `TransactionService.findAllByUserId(userId, type, limit, offset)` with the existing TypeORM mappings.

- Query only Transactions whose related Account belongs to the authenticated user.
- For `Revenue` or `Expense`, return only rows with the matching persisted transaction type. For `All`, do not add a transaction-type predicate.
- Order returned rows by `transaction_date` descending.
- Apply `offset` and `limit` after ownership and type filtering.
- Compute `total` from the full matching result set before page slicing.
- Compute `hasMore` as `offset + returnedCount < total`.
- Map each row to exactly these response fields: `transaction_id`, `account_id`, `transaction_date` as `YYYY-MM-DD`, `type`, `item_description`, `shop_name`, `amount`, `payment_method`, and `status`.
- When no rows match, return an empty array with `total: 0` and `hasMore: false`.
- Do not expose receipt, category, Account, User, or other undeclared fields.

### Success Response

For HTTP 200, wrap the domain response as:

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

### Error Handling

- Invalid `type`, `limit`, `offset`, or an undeclared query parameter: preserve HTTP 400 and the validation message or message array.
- Missing, invalid, or expired JWT: preserve HTTP 401 with `Unauthorized` semantics.
- Transaction or database retrieval failure: preserve HTTP 500 with the safe message `Đã xảy ra lỗi hệ thống khi lấy danh sách giao dịch. Vui lòng thử lại sau.`
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/transactions" }`.

Follow the existing NestJS architecture and installed dependencies. Avoid a duplicated `/api` prefix when combining the global prefix with the controller route. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the transaction-history interface according to the frozen Figma evidence and UC-03 functional scope.

Replace the placeholder `/transactions` page in `finalsource/fe/src/pages/Transactions/Transactions.tsx` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `107. Transactions` at node `66:5474`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/66-5474`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact target is:

- `107. Transactions` — node `66:5474`, 1440×1024.

Reconstruct the page as accessible React UI; do not use `screenshot.png`, `export.png`, or the flattened design image as the interactive page.

- Match the 280 px dark sidebar, `FINEbank.IO` wordmark, teal active Transactions navigation item, pale `#F4F5F7` main background, top date/breadcrumb area, notification control, and rounded search field.
- Show the `Recent Transaction` heading and the `All`, `Revenue`, and `Expenses` filter tabs. Map the visible `Expenses` tab to the API value `Expense`.
- Render the rounded white transaction panel with columns `Items`, `Shop Name`, `Date`, `Payment Method`, and `Amount`, matching the frame's spacing, typography, dividers, row icons, and right-aligned bold amounts.
- Format the API date for display in the design's human-readable style and render amounts with the design's dollar prefix and two decimal places without changing the underlying numeric value.
- Show the centered teal `Load More` button only while another page is available.
- Keep the search field, notification control, and any navigation destinations outside UC-03 as design-only or existing behavior; do not add an unsupported search API or notification flow.
- Preserve the desktop composition and adapt it with existing responsive conventions so filters, rows, and pagination remain usable on narrower screens.
- Provide design-consistent loading, empty, validation-error, and service-error states within the main content area.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the transaction page to the list API and implement filtering and load-more pagination.

Continue in `Transactions.tsx`, `finalsource/fe/src/api/transaction.service.ts`, and `finalsource/fe/src/api/types.ts`.

- Define a filter type of `All | Revenue | Expense` and a typed domain response `{ data: Transaction[]; total: number; hasMore: boolean }`.
- Align the `Transaction` response type with the API fields and requiredness for `API-TRANSACTION-LIST`.
- Update `transactionService.getTransactions` to accept exactly `{ type; limit?; offset? }` for this list flow and return the normalized domain response.
- Because the existing Axios base URL includes `/api`, call the relative path `/v1/transactions`.
- Initialize the page with `type=All`, `limit=10`, and `offset=0`, then fetch the first page when the authenticated user opens `/transactions`.
- Read the normalized envelope from Axios `response.data` and the domain response from `response.data.data`.
- On a filter-tab change, clear the current rows, reset `offset` to 0, and request the first page for the selected API filter.
- On `Load More`, request the next page using the current accumulated row count as `offset`, append the returned rows in response order, and update `total` and `hasMore` from the response.
- Replace, rather than append, data for an initial or filter-reset request.
- Do not mutate transaction or account data from this page.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side query validation, loading states, empty-state handling, and API error handling.

Refine the transaction-loading flow and page controls.

### Loading State

- Set the loading state immediately before a valid request and always settle it after success or failure.
- During the initial or filter-reset request, show a design-consistent loading state in the transaction panel.
- During a load-more request, disable the `Load More` button, show loading feedback in the button, and prevent duplicate requests without hiding existing rows.
- Disable filter actions that would issue duplicate requests while a request is already in flight.

### Client-Side Validation

Before calling the API:

- Ensure the selected API filter is exactly `All`, `Revenue`, or `Expense`.
- Ensure `limit` is an integer greater than 0.
- Ensure `offset` is an integer greater than or equal to 0.
- Do not call the API when client-side query validation fails; display the message near the filter or pagination control that caused it.

Backend validation remains authoritative. Do not infer additional filters, date ranges, account IDs, categories, sorting options, or page-size choices.

### Empty and API Error States

- When a successful response has no rows, display an appropriate empty transaction-history message and do not show `Load More`.
- HTTP 400: display the returned validation message or message array near the filter/pagination area without discarding previously loaded rows during a load-more failure.
- HTTP 401: rely on the existing authentication handling to clear the invalid session and redirect to `/login`.
- HTTP 500: display the returned safe server message as a visible error notification in the transaction content area.
- Network or unavailable-service failure: display a general transaction-retrieval failure message and keep the application user on `/transactions`.
- Do not render raw server objects, stack traces, JWTs, or sensitive payloads in errors or logs.

Do not create or run tests.
