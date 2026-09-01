---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-04
uc_name: Create a Transaction
source_use_case: docs/01-inception/use-cases/uc-04-create-transaction.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "4740:1106"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-01T00:26:31.2000807Z
approved_by_researcher_id: kien
approved_at: 2026-09-01T00:32:10.4681048Z
---

# UC-04 Business Coding Prompt (RQ3) - Create a Transaction

## Prompt A: Backend API

### Objective: Build the protected transaction-creation endpoint, input validation, ownership-scoped persistence, atomic account-balance update, and server-side error handling.

Create the protected `POST /api/v1/transactions` endpoint for `API-TRANSACTION-CREATE` in the NestJS backend under `finalsource/be`.

- Extend the existing transaction module, controller, and service, and add request/response DTOs under the existing `src/modules/transaction` structure.
- Protect the endpoint with the project's Bearer JWT authentication mechanism. Derive the application user's ID from the validated token; do not accept a user ID from the request body.
- Return HTTP 201 after the Transaction insert and related Account balance update have both committed.
- Follow the existing TypeORM mappings and transaction conventions. Do not alter an entity or migration unless an explicit `docs/02-construction/implementation/UC-04/schema.json` proposal has been approved by the researcher.

### Request Format

Accept an `application/json` body with exactly these fields:

- `accountId`: required, non-null integer referencing an Account owned by the authenticated application user.
- `transactionDate`: required, non-null valid ISO date string.
- `type`: required, non-null string; exactly `Revenue` or `Expense`.
- `itemDescription`: required, non-null string; non-empty after trimming.
- `category_id`: optional nullable integer; when supplied, it must reference an existing Category.
- `shopName`: required, non-null string; non-empty after trimming.
- `amount`: required, non-null decimal number at least `0.01`.
- `paymentMethod`: required, non-null string; non-empty after trimming.
- `status`: optional non-null string; when supplied, exactly `Complete`, `Pending`, or `Failed`; default `Complete` when omitted.

Reject undeclared request fields through the existing validation pipeline. Do not treat an omitted or null `category_id` as an error.

### Logic

Implement `TransactionService.create(userId, dto)` using the existing Account, Category, and Transaction mappings.

1. Resolve the selected Account within the authenticated application user's ownership scope. Reject a missing or foreign Account without revealing another user's data.
2. If `category_id` is supplied, confirm that the Category exists. Leave the persisted category nullable when it is omitted or null.
3. For an `Expense`, require the selected Account balance to be at least the requested amount. A `Revenue` has no minimum-balance constraint.
4. Trim `itemDescription`, `shopName`, and `paymentMethod` before persistence.
5. Execute the Transaction insert and Account balance update in one database transaction. Increase the balance by the amount for Revenue and decrease it by the amount for Expense.
6. Re-read or lock the owned Account within the transaction so concurrent creation cannot cause a lost balance update or permit an Expense against stale funds.
7. Persist the supplied allowed status, or `Complete` when status is omitted.
8. Commit exactly one new Transaction only after every validation and balance update succeeds. Roll back both the insert and balance change if any step fails before commit.
9. Map `shopName` to `Transactions.shop_name`, `paymentMethod` to `Transactions.payment_method`, and `category_id` to nullable `Transactions.category_id`.

### Success Response

For HTTP 201, preserve the API contract and wrap the created domain payload as:

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transactionId": 8,
    "accountId": 3,
    "transactionDate": "2025-11-01T00:00:00.000Z",
    "type": "Expense",
    "itemDescription": "Movie Ticket",
    "shopName": "Cinema",
    "amount": 150000,
    "paymentMethod": "Credit Card",
    "status": "Complete",
    "receiptId": null,
    "createdAt": "2026-09-01T00:00:00.000Z",
    "category_id": 3
  }
}
```

`createdAt` is a response-time timestamp generated with `new Date()` and is not a persisted Transaction column. Return `category_id: null` when no category is assigned, and preserve the API contract's nullable receipt value.

### Error Handling

- Missing/invalid required input, an invalid type or status, a nonexistent supplied category, a missing/foreign Account, or an Expense exceeding the owned Account balance: preserve HTTP 400 with the validation or business error message.
- Missing, invalid, or expired JWT: preserve HTTP 401 with `Unauthorized` semantics.
- Database transaction or persistence failure: roll back all changes and preserve HTTP 500 with `Error when creating transaction. Try it again later.`
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/transactions" }`.

Follow the existing NestJS architecture and installed dependencies. Avoid a duplicated `/api` prefix when combining the global prefix with the controller route. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the transaction-creation screen according to the frozen Figma evidence and UC-04 functional scope.

Create the protected `/transactions/add` page and an `AddTransactionForm` in `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing layout and component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `107.1 Add Transactions` at node `4740:1106`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/4740-1106`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact target is:

- `107.1 Add Transactions` — node `4740:1106`, 1440×1024.

Reconstruct the screen as accessible React UI; do not use `screenshot.png`, `export.png`, or the flattened background image as the interactive page.

- Reuse the application's shared shell for the 280 px dark sidebar, `FINEbank.IO` wordmark, active teal Transactions navigation item, pale `#F4F5F7` content background, top date/breadcrumb area, notification control, and rounded search field.
- Preserve the `Recent Transaction` heading, `All`, `Revenue`, and `Expenses` tabs, and teal `+ Add Transaction` control above the form as design context. Keep unrelated search, notifications, and filter behavior design-only or existing behavior.
- Render the large rounded white form panel with the `Add Transaction` title and the helper text `Enter the transaction details below. Fields marked * are required.`
- Use the frame's two-column desktop grid and field order: Transaction Type / Account, Amount / Transaction Date, Item Description / Shop Name, and Payment Method / Category (Optional).
- Provide `Revenue` and `Expense` transaction-type choices, owned-account and optional-category selectors, an amount input, ISO-compatible date input, and text inputs for description, shop/recipient, and payment method.
- Match the design's Inter typography, 48 px controls, subtle gray borders, 6 px field radii, teal `#2FA096` accents, white panel shadow, and right-aligned action row.
- Render an outlined `Cancel` button and filled `Save Transaction` button. Mark every required field visibly and accessibly; keep Category explicitly optional.
- Preserve the desktop composition and adapt the grid, actions, and form widths through existing responsive conventions for narrower screens.
- Provide design-consistent account-loading, category-warning, field-error, submission-error, and submission-loading states without replacing the form with a static image.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Load form choices, submit a typed transaction-creation request, and complete the successful flow.

Continue in the new transaction page/form, `finalsource/fe/src/api/transaction.service.ts`, the account/category API services, `finalsource/fe/src/api/types.ts`, and `finalsource/fe/src/router/AppRouter.tsx`.

- Register `/transactions/add` as a protected route and keep `/transactions` as the cancellation and post-success destination.
- Define a typed creation payload with `accountId`, `transactionDate`, `type`, `itemDescription`, optional nullable `category_id`, `shopName`, `amount`, `paymentMethod`, and optional `status`.
- Define the created response fields exactly as documented by `API-TRANSACTION-CREATE`, including nullable `receiptId`, response-only `createdAt`, and nullable `category_id`.
- Because the existing Axios base URL includes `/api`, use relative `/v1/transactions` for creation, relative `/v1/accounts` for the authenticated account list, and relative `/categories` for the public category list.
- On page load, request owned accounts from `GET /api/v1/accounts` and categories from `GET /api/categories`. Read account options from normalized `response.data.data.accounts` and category options from normalized `response.data.data`.
- If accounts cannot be loaded or the returned account array is empty, display an account error and disable submission until an eligible account is available.
- If categories cannot be loaded, show a non-blocking warning and leave transaction creation available without a category.
- Do not expose `account_number_full`; use the bank name, account type, last four digits, and balance needed for the selector and preliminary Expense feedback.
- Submit the validated form through `POST /api/v1/transactions`. Omit `status` so the API default applies unless an existing source-backed control supplies an allowed status; the Figma form does not define a status control.
- Omit `category_id` or send it as null when no category is selected. Do not invent a fallback category.
- Read the created transaction from the normalized envelope's `data` field.
- On HTTP 201, show the success message `Transaction created successfully`, clear the form, and navigate to `/transactions`.
- On Cancel, navigate to `/transactions` without sending a request or changing form-related server state.

Use the project's existing Axios client and authentication interceptor. Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete source-defined client validation, loading states, duplicate-submit prevention, and API error handling.

Refine the transaction form submission and supporting choice-loading flows.

### Loading State

- Show design-consistent loading feedback while accounts and categories load.
- Set submission loading immediately before a valid creation request and always settle it after success or failure.
- While submitting, disable `Save Transaction`, display loading feedback in or beside it, and prevent duplicate submissions.
- Keep Cancel available only if it cannot trigger a second submission; cancellation never sends the creation request.

### Client-Side Validation

Before calling the creation API:

- Require an available selected account from the successfully loaded owned-account options.
- Require transaction type exactly `Revenue` or `Expense`.
- Require a valid ISO date value.
- Require `itemDescription`, `shopName`, and `paymentMethod` to remain non-empty after trimming.
- Require a finite decimal amount of at least `0.01`.
- For Expense, require the entered amount not to exceed the selected account's loaded balance. Do not apply this minimum-balance check to Revenue.
- When a category is selected, require it to match a category returned by the category-list API. Category remains optional, including when category retrieval is unavailable.
- If an allowed status is ever supplied by an existing source-backed control, require exactly `Complete`, `Pending`, or `Failed`; do not add a status control solely for this flow.

Display field-specific validation messages adjacent to the corresponding controls. Do not call the creation API when client-side validation fails. Backend validation, ownership checks, current-balance checks, and atomic persistence remain authoritative.

### API and Loading Errors

- Account-list failure: display the returned safe message near the Account control and disable submission until an account is available.
- Category-list failure: display a non-blocking warning near Category and allow submission without a category.
- HTTP 400 from transaction creation: display the returned validation/business message or message array near the relevant field when it can be mapped safely, otherwise in a visible form-level alert. Preserve the user's valid inputs.
- HTTP 401: rely on the existing authentication handling to clear the invalid session and redirect to `/login`.
- HTTP 500: display `Error when creating transaction. Try it again later.` in a visible form-level alert and keep the application user on `/transactions/add`.
- Network or unavailable-service failure: display a general transaction-creation failure message and preserve the entered form values for retry.
- Do not render raw server objects, stack traces, JWTs, account numbers, or sensitive payloads in errors or logs.

Do not create or run tests.
