---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-07
uc_name: View Bank Account Details
source_use_case: docs/01-inception/use-cases/uc-07-view-bank-account-details.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "4795:4"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-05T06:31:30.0304193Z
---

# UC-07 Business Coding Prompt (RQ3) - View Bank Account Details

## Prompt A: Backend API

### Objective: Build the protected account-detail endpoint, retrieval and response-mapping flow, input validation, and server-side error handling.

Create the protected `GET /api/v1/accounts/:id` endpoint for `API-ACCOUNT-DETAIL` in the existing NestJS account module under `finalsource/be`.

- Require a valid Bearer JWT and authorize the request as the authenticated application user.
- Read `id` from the path, parse it as an integer, and read the application-user identity from the validated authentication context. Do not accept a user ID in the path, query, or body.
- Implement the controller flow using the existing account controller conventions and the main retrieval logic in `AccountService.findOneWithTransactions(accountId, userId)`.
- Load the requested account, verify that it belongs to the authenticated application user, and only then load its five most recent transactions.
- Return at most five recent transactions. Use the persisted transaction date to determine recency and format returned dates as ISO date strings in `YYYY-MM-DD` form.
- Keep the operation read-only and use the existing Account and Transaction persistence mappings. Do not alter the database schema.
- Map the owned account to `AccountDetailResponseDto` with `id`, `bank_name`, `account_type`, nullable `branch_name`, `account_number_full`, `balance`, and `recent_transactions`.
- Map each included transaction to `TransactionDto` with `date`, `amount`, `description`, `status`, nullable `receipt_id`, and `type`. Do not add persistence fields absent from the API response contract.
- When the account has no recent transactions, return the account information with `recent_transactions: []`.

For HTTP 200, return the domain result inside the standard success envelope:

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": 3,
    "bank_name": "Vietcombank",
    "account_type": "Checking",
    "branch_name": "Hanoi Branch",
    "account_number_full": "9704221234567890123",
    "balance": 4500000,
    "recent_transactions": [
      {
        "date": "2025-11-01",
        "amount": 150000,
        "description": "Movie Ticket",
        "status": "Complete",
        "receipt_id": null,
        "type": "Expense"
      }
    ]
  }
}
```

Use an existing safe account-detail success message if the project already defines one; the sources do not prescribe exact success-message text. Preserve the domain fields and message semantics through the normalized envelope.

Error handling:

- Invalid account-ID format: preserve HTTP 400 and a safe message such as `"Invalid account identifier."`.
- Missing or invalid authentication: preserve HTTP 401 and `"Please log in to access account services."`.
- Authenticated application user does not have permission to view the requested account: preserve HTTP 403 and `"You do not have permission to view this account details."`; do not return account data.
- Requested account does not exist: preserve HTTP 404 and `"Account not found."`.
- Unexpected account-transaction retrieval failure: preserve HTTP 500 and `"A banking system error occurred. Please try again later."`.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/accounts/:id" }` while preserving the actual request path in runtime output.

Follow the existing NestJS 11, TypeORM/MySQL, class-validator, Passport JWT, Swagger, validation-pipe, and exception-filter conventions. Do not introduce unrelated layers or dependencies. Do not log JWTs, full account numbers, or sensitive account payloads. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the protected account-detail interface according to the frozen Figma evidence and UC-07 functional scope.

Create or complete `AccountDetailPage` for route `/accounts/:id` under `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `UC-07 • Bank Account Details` at node `4795:4`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/4795-4`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact target is:

- `UC-07 • Bank Account Details` — node `4795:4`, 1440×900.

Reconstruct the page as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Match the desktop composition: 244 px dark left sidebar, white 72 px top bar, light `#F5F6F7` main background, and vertically stacked title, account-summary, and recent-transactions sections.
- Preserve the `FINEbank.IO` wordmark, sidebar navigation, teal active `Balances` item, logout area, `Accounts › Account Details` breadcrumb, search control, and circular top-bar avatar shown in the frame.
- Render the title `Account Details` and helper text `View account information and the five most recent transactions.`.
- Render the teal `Edit Account` control shown in the design. Keep it visual-only unless equivalent behavior already exists or another authoritative use case supplies its behavior.
- In the white account-summary card, display the bank identity, account type with the account-ending treatment shown by the design, current balance, bank name, account type, branch, and full account number.
- Handle a null branch with a design-consistent empty-value treatment; do not invent bank data.
- In the white `Recent Transactions` card, display `Latest 5` and columns for `Date`, `Description`, `Status`, and right-aligned `Amount`.
- Format transaction data for display using existing date and monetary conventions. Preserve the design's green treatment for positive amounts, red treatment for negative amounts, and status pills for `Complete`, `Pending`, and `Failed` without changing API values.
- When `recent_transactions` is empty, keep the account-summary card visible and show a clear, design-consistent empty state inside the recent-transactions section.
- Provide stable loading and retrieval-error states that fit the same content area without exposing stale account data.
- Keep search, the avatar, navigation items, and other design-only controls visual unless equivalent behavior already exists or another source defines it.
- Keep `/accounts/:id` behind the existing protected-route mechanism. Reuse or adapt the shared layout and navigation while matching the frozen target.
- Preserve the desktop hierarchy and use the project's existing responsive conventions to avoid overflow on narrower screens without inventing new content.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Load one authenticated account and implement the successful and empty-transaction flows.

Continue in `AccountDetailPage`, the existing frontend account API service, shared API types, and route configuration.

- Add typed account-detail and recent-transaction response shapes matching `API-ACCOUNT-DETAIL` exactly.
- Read the account identifier from the `/accounts/:id` route parameter.
- Manage account-detail data, loading state, route-parameter error state, and request-error state using the project's existing state approach.
- Implement `fetchAccountDetails` to send `GET /api/v1/accounts/:id` through the existing Axios client when an authenticated application user opens the page or the route identifier changes. Because the existing client base URL includes `/api`, call relative path `/v1/accounts/${id}`.
- Send no request body or query parameters. Let the existing Axios interceptor attach the Bearer token.
- Read the normalized success envelope from Axios `response.data` and the account-detail domain result from `response.data.data`.
- On HTTP 200 success:
  1. Store the account-detail domain result.
  2. Display bank name, type, branch, full account number, and balance.
  3. Format the returned transaction rows for display without mutating the response object.
  4. Display up to the returned five recent transactions, or the empty recent-transactions state when the array is empty.
- Treat the sample bank, balance, account number, and transactions in Figma and the API contract as presentation examples only; never hardcode them as application data.
- Prevent stale responses from a previous route identifier from replacing the current page state by following the project's existing cancellation or request-lifecycle convention.
- Preserve API dates and monetary values in typed state. Apply locale display formatting only at render time.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete route validation, loading state, empty state, and API error handling.

Refine `fetchAccountDetails` and `AccountDetailPage`.

### Loading State

- While the request is pending, display a design-consistent account-detail loading state and prevent repeated retrieval for the same active route value.
- Do not show stale account details from a previously visited identifier while a different account is loading.
- Always settle loading state after success, cancellation, or failure, and clear stale request errors before a new valid retrieval.
- The design-only `Edit Account` control must not initiate an action while account data is unavailable.

### Client-Side Validation

- Before calling the API, require the route `id` to be present and to have a valid integer format, as defined by the path contract.
- If route validation fails, display a route-level account error and do not call the API.
- Do not infer additional identifier ranges or validation absent from the functional specification and API contract.

Backend authentication, authorization, identifier parsing, and retrieval validation remain authoritative.

### API and Network Results

- HTTP 400: display the returned invalid-account-identifier message in the page error area and do not render account details.
- HTTP 401: allow the existing authentication handling to clear the invalid session and redirect the application user to `/login`.
- HTTP 403: display the returned permission message and do not retain or render account data for the denied identifier.
- HTTP 404: display the returned account-not-found message and do not render an account-summary card with fabricated values.
- HTTP 500: display the returned safe banking-system message in the page error state.
- Network or unavailable-service failure: display a general account-retrieval failure message and allow a design-consistent retry if that behavior already exists in the project.
- When the response is successful with `recent_transactions: []`, render the empty recent-transactions state rather than treating it as an error.
- Render safe string or string-array messages from the normalized error envelope. Never render raw response objects, stack traces, JWTs, or sensitive payloads, and do not log full account numbers.

Do not create or run tests.
