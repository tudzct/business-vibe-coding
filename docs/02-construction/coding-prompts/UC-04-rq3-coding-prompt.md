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
generated_at: 2026-09-02T14:30:22.0129227Z
approved_by_researcher_id: kien
approved_at: 2026-09-02T15:23:28.0248517Z
---

# UC-04 Business Coding Prompt (RQ3) - Create a Transaction

## Prompt A: Backend API

### Objective: Build the protected transaction-creation endpoint, input validation, persistence flow, and server-side error handling.

Create the protected `POST /api/v1/transactions` endpoint for `API-TRANSACTION-CREATE` in the NestJS backend under `finalsource/be`.

- Require a valid, unexpired Bearer JWT and authorize the request as the authenticated application user.
- Read the authenticated user identity from the validated authentication context. Do not accept a user ID from the request body.
- Require `Content-Type: application/json`.
- Define and validate a `CreateTransactionDto` with these source-defined fields:
  - `accountId`: required non-null integer account identifier.
  - `transactionDate`: required non-null valid ISO date string.
  - `type`: required non-null `Revenue` or `Expense`.
  - `itemDescription`: required non-null, non-empty string.
  - `category_id`: optional nullable integer category identifier.
  - `shopName`: required non-null, non-empty string.
  - `amount`: required non-null positive decimal number.
  - `paymentMethod`: required non-null, non-empty string.
  - `status`: optional non-null value when supplied; accept only `Complete`, `Pending`, or `Failed`, with `Complete` as the API default.
- Implement the creation flow in the existing transaction module conventions. Add only the necessary controller, service, DTO, repository/module registration, and application-module wiring where they do not yet exist.
- Create the transaction for an account belonging to the authenticated application user.
- When `category_id` is omitted or null, persist the transaction without a category. When it is supplied, use the referenced category.
- Map request fields to the existing entity without renaming the public API: `accountId` to `account_id`, `transactionDate` to `transaction_date`, `itemDescription` to `item_description`, `shopName` to `shop_name`, `paymentMethod` to `payment_method`, and `category_id` to `category_id`.
- Receipt attachment and recurring schedule creation are outside scope.
- Persist one transaction record only after authentication and source-defined input validation succeed.

For HTTP 201, return the created domain result inside the standard success envelope:

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
    "createdAt": "2025-11-01T10:30:00.000Z",
    "category_id": 3
  }
}
```

Preserve `category_id: null` when no category is assigned and `receiptId: null` because receipt attachment is outside this use case. Generate `createdAt` at response time as specified by the API contract; do not require a new persisted column.

Error handling:

- Invalid or missing request data, an unavailable selected account, an account not belonging to the authenticated application user, or an invalid supplied category: preserve HTTP 400 and the source validation message or message array, such as `"Invalid or missing transaction data"`.
- Missing, invalid, or expired authentication: preserve HTTP 401 with `"Unauthorized"`.
- Unexpected transaction processing or persistence failure: preserve HTTP 500 with `"Error when creating transaction. Try it again later."` and do not return a success result.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/transactions" }`.

Follow the existing NestJS 11, TypeORM/MySQL, class-validator, Passport JWT, Swagger, validation-pipe, and exception-filter conventions. Use existing entity mappings and migration conventions. Do not alter the database schema without a researcher-approved schema proposal. Do not introduce unrelated layers or dependencies. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the protected Add Transaction interface according to the frozen Figma evidence and UC-04 functional scope.

Create or complete `AddTransactionPage` and `AddTransactionForm` for route `/transactions/add` under `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `107.1 Add Transactions` at node `4740:1106`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/4740-1106`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact target is:

- `107.1 Add Transactions` — node `4740:1106`, 1440×1024.

Reconstruct the page as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Match the desktop composition: dark left navigation sidebar, light `#F4F5F7` main background, compact top utility row, `Recent Transaction` heading and tabs, teal `Add Transaction` action, and the large rounded white form card.
- Preserve the `FINEbank.IO` wordmark, sidebar navigation labels and icons, teal active `Transactions` item, logout/profile area, top date, notification icon, and rounded search control shown in the frame.
- Render the card title `Add Transaction` and helper text `Enter the transaction details below. Fields marked * are required.`.
- Use the two-column form layout shown in the frame, with these rows and visible labels:
  - `Transaction Type *` and `Account *`.
  - `Amount *` and `Transaction Date *`.
  - `Item Description *` and `Shop Name *`.
  - `Payment Method *` and `Category (Optional)`.
- Provide an outlined `Cancel` action and a teal `Save Transaction` action aligned at the lower right of the form.
- Use design-consistent inputs or selects for every field. Account and category options must come from their APIs; transaction type must offer `Revenue` and `Expense`.
- Show field-level validation text without breaking the form hierarchy. Reserve stable areas for account-loading, category-warning, submission-error, and success feedback.
- Keep search, notification, profile-menu, top transaction tabs, and the duplicate top `Add Transaction` control visual-only unless equivalent behavior already exists in the project or another source defines it.
- Keep `/transactions/add` behind the existing protected-route mechanism. Reuse or adapt the shared layout and navigation while matching the frozen frame.
- Preserve the desktop hierarchy and make the form usable on narrower screens by collapsing the paired fields through existing responsive conventions without inventing new content.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Load form options, submit the transaction, and complete the successful or cancelled flow.

Continue in `AddTransactionPage`, `AddTransactionForm`, the existing frontend API services, and shared API types.

- Keep typed state for `accountId`, `transactionDate`, `type`, `itemDescription`, `category_id`, `shopName`, `amount`, and `paymentMethod`, plus loading, field-error, warning, request-error, and success-notification state.
- Use `Expense` as the initial transaction-type selection shown by the design. Treat the sample date visible in Figma as presentation evidence, not a hardcoded application date; use an interactive date control and existing project date conventions.
- On page load, request the authenticated user's account options with `GET /api/v1/accounts` through the existing Axios instance. Because its base URL already includes `/api`, call relative path `/v1/accounts`. Read the account array from normalized Axios data at `response.data.data.accounts`.
- On page load, request category options with public `GET /api/categories`; with the existing `/api` base URL, call relative path `/categories`. Read the category array from `response.data.data`.
- If account retrieval fails, display an account-loading error and keep submission disabled until at least one selectable account is available.
- If category retrieval fails, display a warning and keep transaction creation available without a category.
- When the application user selects `Cancel`, navigate to `/transactions` without sending a creation request.
- Implement an asynchronous submit function that sends `POST /api/v1/transactions`; with the existing `/api` Axios base URL, call relative path `/v1/transactions`.
- Let the existing Axios interceptor attach the Bearer token.
- Send this JSON shape, omitting `category_id` when no category is selected and relying on the API default when no status control is present:

```json
{
  "accountId": 3,
  "transactionDate": "2025-11-01",
  "type": "Expense",
  "itemDescription": "Movie Ticket",
  "category_id": 3,
  "shopName": "Cinema",
  "amount": 150000,
  "paymentMethod": "Credit Card"
}
```

- Read the normalized success envelope from Axios `response.data` and the created transaction from `response.data.data`.
- On HTTP 201 success:
  1. Display a success notification using the returned message.
  2. Clear the editable form fields and field errors.
  3. Navigate to `/transactions`.
- Do not attach receipt files or create recurring schedules.
- Preserve the API date and decimal formats in the request. Convert form strings to typed integer/decimal values only after successful client-side validation.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side form validation, loading states, option-loading exceptions, and API error handling.

Refine the transaction submit flow and `/transactions/add` page.

### Loading State

- Track account loading, category loading, and transaction submission independently.
- While account options are loading, disable `Save Transaction` because a valid account is required.
- While category options are loading, keep the optional category control in a stable loading state without blocking the other form fields.
- During a valid submission, disable `Save Transaction`, display design-consistent loading feedback, and prevent duplicate submissions.
- Keep `Cancel` available unless navigation is already in progress.
- Always settle the applicable loading state after success or failure and clear stale submission errors before a new valid request.

### Client-Side Validation

Before calling the creation API:

- Require `accountId` to identify a currently selectable account option.
- Require `transactionDate` and submit it as a valid ISO date string.
- Require `type` to be exactly `Revenue` or `Expense`.
- Require non-empty `itemDescription`, `shopName`, and `paymentMethod` values.
- Require `amount` to be a valid positive decimal number.
- Keep `category_id` optional. When selected, require it to identify one of the loaded category options.
- Do not infer additional date windows, amount thresholds, account types, balance checks, status controls, receipt validation, or recurring behavior that are absent from the functional specification, UI evidence, and API contracts.
- Display validation messages adjacent to the applicable fields, focus or identify the first invalid field accessibly, and do not call the API when validation fails.

Backend validation remains authoritative.

### API and Network Results

- Account-list HTTP 401: allow the existing authentication handling to clear the invalid session and redirect the application user to `/login`.
- Account-list HTTP 500 or network failure: display the account-loading error and keep submission disabled.
- Category-list HTTP 500 or network failure: display a non-blocking category warning and allow submission without `category_id`.
- Transaction-create HTTP 400: display the returned validation message or message array in the form error area while preserving the entered form values for correction.
- Transaction-create HTTP 401: allow the existing authentication handling to clear the invalid session and redirect the application user to `/login`.
- Transaction-create HTTP 500: display the returned safe server message in the form error area and keep the application user on `/transactions/add`.
- Network or unavailable-service failure: display a general transaction-creation failure message and retain the form values when authentication remains valid.
- Never render raw server objects, stack traces, JWTs, full account numbers, or sensitive payloads in errors or logs.

Do not create or run tests.
