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
generated_at: 2026-09-01T01:32:00.509Z
---

# UC-04 Business Coding Prompt (RQ3) - Create a Transaction

## Prompt A: Backend API

### Objective: Build the protected transaction-creation endpoint, input validation, atomic persistence flow, account-balance update, and server-side error handling.

Create `POST /api/v1/transactions` for `API-TRANSACTION-CREATE` in the NestJS backend under `finalsource/be`.

- Require a valid, unexpired Bearer JWT and obtain the authenticated `Users.user_id` from the validated token. Return HTTP 401 when the token is missing, invalid, or expired.
- Accept `Content-Type: application/json` and define `CreateTransactionDto` with:
  - required integer `accountId`;
  - required ISO date string `transactionDate`;
  - required `type`, limited to `Revenue` or `Expense`;
  - required non-empty strings `itemDescription`, `shopName`, and `paymentMethod`;
  - required decimal `amount` of at least `0.01`;
  - optional nullable integer `category_id`;
  - optional non-null `status`, limited to `Complete`, `Pending`, or `Failed`, defaulting to `Complete` when omitted.
- Validate that `accountId` identifies an account owned by the authenticated user.
- When `category_id` is supplied, validate that the category exists. Do not require a category lookup when it is omitted or null.
- For an `Expense`, require the selected account balance to be at least the submitted amount. Do not apply this insufficient-balance check to `Revenue`.
- Map request fields to the transaction entity as follows: `accountId` to `account_id`, `transactionDate` to `transaction_date`, `itemDescription` to `item_description`, `shopName` to `shop_name`, `paymentMethod` to `payment_method`, and `category_id` to nullable `category_id`.
- In one TypeORM database transaction, create exactly one transaction row and update the selected account balance by `+amount` for `Revenue` or `-amount` for `Expense`.
- Commit the transaction row and balance update together. If validation, insertion, or balance update fails before commit, roll back the operation so neither partial change remains.
- Follow the existing controller, service, entity, repository, validation-pipeline, JWT guard, and normalized response conventions. Do not add unrelated architectural layers or dependencies.
- Do not alter the database schema without a separate researcher-approved schema proposal.

For HTTP 201, return:

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transactionId": 8,
    "accountId": 3,
    "transactionDate": "2026-09-01T00:00:00.000Z",
    "type": "Expense",
    "itemDescription": "Movie Ticket",
    "shopName": "Cinema",
    "amount": 150000,
    "paymentMethod": "Credit Card",
    "status": "Complete",
    "receiptId": null,
    "createdAt": "2026-09-01T01:32:00.000Z",
    "category_id": 3
  }
}
```

Treat `data.receiptId` as `integer | null`. Treat `data.category_id` as `integer | null`. Generate `data.createdAt` as a response-time timestamp; do not require a new persisted entity column solely for that field.

Error handling:

- Invalid or missing input, invalid type or status, nonexistent supplied category, nonexistent or non-owned account, or insufficient Expense balance: preserve HTTP 400 and the source validation message or message array.
- Missing, invalid, or expired JWT: preserve HTTP 401 with `Unauthorized` semantics.
- Database transaction or persistence failure: preserve HTTP 500 with `Error when creating transaction. Try it again later.`
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/transactions" }`.
- Do not expose stack traces, database details, JWTs, full account numbers, or sensitive request payloads in errors or logs.

Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the transaction-creation interface according to the frozen Figma evidence and UC-04 functional scope.

Create the authenticated `/transactions/add` route page, `AddTransactionPage`, and `AddTransactionForm` in `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `107.1 Add Transactions` at node `4740:1106`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/4740-1106`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact target is:

- `107.1 Add Transactions` — node `4740:1106`, 1440×1024.

Reconstruct the page as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Preserve the desktop application shell shown in the frame: dark left navigation with `Transactions` selected, top date/notification/search area, `Recent Transaction` heading, `All`, `Revenue`, and `Expenses` tabs, and the teal `+ Add Transaction` shell control.
- Place the form in the large white rounded card on the `#F4F5F7` content background, with the title `Add Transaction` and helper text `Enter the transaction details below. Fields marked * are required.`
- Use the frame's two-column form layout, restrained Inter typography, subtle gray borders, 6 px field radii, 16 px card radius, and teal `#2FA096` actions.
- Display these controls with the exact required/optional meaning shown in the design:
  - `Transaction Type *`, defaulting to `Expense` and allowing `Revenue` or `Expense`;
  - `Account *`, with `Select account` placeholder;
  - `Amount *`, with `0.00` placeholder;
  - `Transaction Date *`, defaulting to today;
  - `Item Description *`, with `Enter transaction description` placeholder;
  - `Shop Name *`, with `Enter shop or recipient name` placeholder;
  - `Payment Method *`, with `Enter payment method` placeholder;
  - `Category (Optional)`, with `Select category` placeholder.
- Display the outlined `Cancel` button and teal `Save Transaction` button aligned at the lower right of the card.
- Keep the shell-level `+ Add Transaction` control visually consistent with the frame, but do not let it submit the form.
- Add design-consistent field errors, form-level warnings/errors, and loading feedback without unnecessarily shifting the core card composition.
- Preserve the desktop composition and use existing responsive conventions so the form becomes a usable single-column layout on narrower screens without inventing new fields or content.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Load form options, submit the transaction through the API, and complete the successful flow.

Continue in `AddTransactionPage`, `AddTransactionForm`, and the existing frontend API service layer.

- Keep typed form state for `accountId`, `transactionDate`, `type`, `itemDescription`, `category_id`, `shopName`, `amount`, `paymentMethod`, and submitted `status`.
- Initialize `type` to `Expense`, `transactionDate` to today's local calendar date in the request format, `category_id` to no selection, and submitted `status` to `Complete`.
- On page load, request the authenticated user's accounts with `GET /api/v1/accounts` through the existing Axios instance. Read account options from the normalized `data.accounts` payload and use each account's `id` as the submitted `accountId`.
- On page load, request categories with public `GET /api/categories`. Read the normalized category array from `data` and use `category_id` as the option value.
- If category loading fails, show a warning and keep transaction creation available without a category. If account loading fails or produces no selectable account, show an error and keep submission disabled until an account is available.
- Implement `handleSubmit` to send `POST /api/v1/transactions` through the existing Axios instance. Use relative paths that remain consistent with its configured base URL so `/api` is not duplicated.
- Send this request shape:

```json
{
  "accountId": 3,
  "transactionDate": "2026-09-01",
  "type": "Expense",
  "itemDescription": "Movie Ticket",
  "category_id": 3,
  "shopName": "Cinema",
  "amount": 150000,
  "paymentMethod": "Credit Card",
  "status": "Complete"
}
```

- Omit `category_id` or send it as null when no category is selected; do not fabricate a category value.
- Read the normalized success envelope from Axios `response.data` and the created transaction from `response.data.data`.
- On HTTP 201 success, display a success toast using the returned message, reset the form to its initial defaults, and navigate to `/transactions` after 1.5 seconds.
- When the application user selects `Cancel`, navigate immediately to `/transactions` without sending a creation request.
- Do not update local success state, clear the form, or navigate to the transaction list when creation fails.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading states, option-loading failures, and API error handling.

Refine `handleSubmit` and `AddTransactionForm`.

### Loading State

- Track account-loading, category-loading, and submit-loading states separately.
- While submitting, disable `Save Transaction`, show design-consistent saving feedback, and prevent duplicate submissions.
- Disable submission whenever no selectable account is available.
- Always settle submit loading after success or failure, and clear stale field/form errors before a new valid request.

### Client-Side Validation

Before calling the creation API:

- Require a selected integer `accountId`.
- Require a valid transaction date.
- Require `type` to be `Revenue` or `Expense`.
- Require non-empty `itemDescription`, `shopName`, and `paymentMethod` values.
- Require a numeric amount of at least `0.01`.
- Do not require `category_id`.
- Display field-level messages adjacent to the affected controls.
- Do not call the API while any client validation error remains.

Backend validation and ownership checks remain authoritative. Do not infer additional date ranges, amount limits, text-length limits, payment-method enums, or category requirements absent from the functional specification and API contract.

### API, Option-Loading, and Network Errors

- Account-list HTTP 401: clear invalid authenticated state as required by existing auth handling and redirect to `/login`.
- Account-list failure: display an account-loading error and disable submission until an account can be selected.
- Category-list failure: display a non-blocking warning and allow submission without `category_id`.
- Creation HTTP 400: display the returned validation message or message array at the relevant field when it can be mapped safely; otherwise use the form-level error area.
- Creation HTTP 401: redirect to `/login` through the existing authentication flow without treating the transaction as created.
- Creation HTTP 500: display the returned safe persistence message in the form-level error area.
- Network or unavailable-service failure: display a general transaction-creation failure message and keep the application user on `/transactions/add` with entered values preserved.
- Do not render raw server objects, stack traces, JWTs, full account numbers, or sensitive payloads in errors or logs.

Do not create or run tests.
