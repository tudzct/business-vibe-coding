---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-06
uc_name: Add a Bank Account
source_use_case: docs/01-inception/use-cases/uc-06-add-bank-account.md
source_use_case_sha256: sha256:4994be6bc348af9f8c788dd765918b65cb1c6bb725e8952442e3e1150c6ed66c
source_api_contract: docs/01-inception/api-contracts/API-ACCOUNT-CREATE.md
source_api_contract_sha256: sha256:25fecb9135d68ccf067bedbc6bf2b1498dad33c89c2186704da19497d8fcb2e5
figma_dataset_id: 2026-08-29-005
figma_node_id: "4795:3"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-03T13:17:49.1994874Z
---

# UC-06 Business Coding Prompt (RQ3) - Add a Bank Account

## Prompt A: Backend API

### Objective: Build the protected account-creation endpoint, persistence flow, validation, response mapping, and server-side error handling.

Create the protected `POST /api/v1/accounts` endpoint for `API-ACCOUNT-CREATE` in the NestJS backend under `finalsource/be`.

- Protect the endpoint with the existing bearer-JWT authentication mechanism and `JwtAuthGuard`.
- Read the authenticated user identifier supplied by the guard. Do not accept `user_id` from request-controlled input.
- Accept `Authorization: Bearer <JWT>` and `Content-Type: application/json` headers.
- Validate the request through the global NestJS `ValidationPipe` and `CreateAccountDto`.
- Implement the creation flow in the account controller/service using the existing TypeORM `Account` entity and repository.
- Preserve the existing project architecture, module registration, ORM mappings, and installed dependencies.

Accept this JSON request body:

```json
{
  "bank_name": "Vietcombank",
  "account_type": "Checking",
  "branch_name": "Hanoi Branch",
  "account_number_full": "9704221234567890123",
  "balance": 4500000
}
```

Request requirements defined by the functional specification, UML, and API contract:

- `bank_name`: required non-null string.
- `account_type`: required non-null string using one of `Checking`, `Credit Card`, `Savings`, `Investment`, or `Loan`.
- `branch_name`: optional nullable string. If omitted, process and persist it using the existing nullable account mapping.
- `account_number_full`: required non-null string.
- `balance`: required non-null decimal number; do not accept a string as the API-domain value.
- Use the exact database literal `Credit Card` for that account type.
- Assign `user_id` from the authenticated JWT identity.
- Derive `account_number_last_4` on the backend as the exact last four characters of the submitted `account_number_full`.
- Persist the account fields represented by the UML model and return only the response fields declared below.
- If validation or creation fails, do not add an account for that request.

For HTTP 201, return:

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "account": {
      "id": 3,
      "user_id": 1,
      "bank_name": "Vietcombank",
      "account_type": "Checking",
      "branch_name": "Hanoi Branch",
      "account_number_last_4": "0123",
      "balance": 4500000
    }
  }
}
```

Do not return `account_number_full` in the success payload.

Error handling:

- Malformed payload or missing required fields: preserve HTTP 400 and the validation message or message array.
- Missing, invalid, or expired JWT: preserve HTTP 401 and the source message, such as `"Unauthorized access. Please log in again."`.
- Authenticated user denied access: preserve HTTP 403 and the source message, such as `"Forbidden. You do not have sufficient privileges to execute this action."`.
- Persistence conflict during account creation: preserve HTTP 409 and a safe source-consistent conflict message.
- Unexpected storage failure: preserve HTTP 500 and a safe create-account failure message; do not expose database details.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/accounts" }`.

Do not alter the database schema for this use case. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the Add Bank Account form according to the frozen Figma evidence and UC-06 functional scope.

Create `AddAccountPage` and `AddAccountForm` for the protected `/accounts/add` route in `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `UC-06 • Add Bank Account` at node `4795:3`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/4795-3`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

Reconstruct the page as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Preserve the 1440×900 desktop dashboard composition: dark 244 px sidebar, 72 px white top bar, light `#F5F6F7` content background, Inter typography, and teal `#2FA79D` active and primary controls.
- Keep `Balances` active in the sidebar.
- Display the breadcrumb `Accounts › Add Account`, heading `Add Bank Account`, and subtitle `Connect a bank account manually and enter its current balance.`
- Display a white, subtly shadowed `Account information` card approximately 804 px wide with 7 px rounded corners, 38 px horizontal padding, and 28 px vertical padding.
- Use a two-column desktop arrangement for `Bank name` and `Account type`, followed by `Branch name` and `Account number`; place `Current balance` across the full form width. Adapt the fields responsively on narrower screens.
- Provide controlled, labelled inputs for bank name, optional branch name, account number, and current balance.
- Provide an account-type selector defaulted to `Checking`, with the API-defined values `Checking`, `Credit Card`, `Savings`, `Investment`, and `Loan`.
- Display the design hint `Account number must contain 8–34 digits. The last 4 digits are derived automatically.` in the pale information panel.
- Place the outlined `Cancel` action and teal `Add Account` action at the lower right of the card.
- Keep the top-bar search and avatar consistent with the frozen frame, but do not add behavior that is not defined by the use case or existing shared layout.
- Reuse or adapt the project's shared authenticated layout when it can represent the frozen frame; update it only as needed for this route.
- Include design-consistent field-error, submission-error, loading, and success-toast states without shifting the dashboard shell unnecessarily.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the Add Bank Account form to the API and implement the successful, optional-branch, and cancel flows.

Continue in `AddAccountPage`, `AddAccountForm`, `finalsource/fe/src/api/account.service.ts`, shared API types, and the application router.

- Register `/accounts/add` as a protected route.
- Initialize form state with `account_type: "Checking"`.
- Track `bank_name`, `account_type`, `branch_name`, `account_number_full`, and the user-entered balance value.
- Implement an asynchronous create-account submission function that sends `POST /api/v1/accounts` through the existing Axios instance. Because its base URL includes `/api`, call the relative path `/v1/accounts`.
- Let the existing Axios request interceptor attach the bearer token; do not send a request-controlled user identifier.
- Convert the accepted balance input to a numeric JSON value before submission. Do not send a formatted currency string.
- When `branch_name` is empty, omit it from the request body rather than sending an invented value.
- Read the normalized envelope from Axios `response.data` and the created account from `response.data.data.account`.
- On HTTP 201, show a success toast using `Account created successfully`, then navigate to `/accounts` after 1.5 seconds.
- Do not navigate early, and clear any pending navigation timer if the component unmounts.
- When the application user selects `Cancel`, navigate directly to `/accounts` without calling the API.
- Do not update authentication/session identity after successful account creation.

Request payload shape:

```json
{
  "bank_name": "Vietcombank",
  "account_type": "Checking",
  "branch_name": "Hanoi Branch",
  "account_number_full": "9704221234567890123",
  "balance": 4500000
}
```

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, field-error mapping, and API error handling.

Refine the create-account submission function and `AddAccountForm`.

### Loading State

- Set `isSubmitting` immediately before the API request and always settle it after success or failure.
- While `isSubmitting` is true, disable `Add Account`, display a spinner or loading text inside it, and prevent duplicate submissions.
- Keep `Cancel` behavior safe and ensure no additional request is submitted while the first request is unresolved.

### Client-Side Validation

Before calling the API:

- Require `bank_name`, `account_type`, `account_number_full`, and balance; treat `branch_name` as optional.
- Accept only the API-defined account-type values.
- Validate `account_number_full` against the frozen UI instruction: it must contain 8–34 digits.
- Validate that balance input can be converted to a valid number and send the converted numeric value, not a string.
- Display each field message next to or below its corresponding input.
- Do not call the API while any client-side validation error remains.

Backend validation remains authoritative.

### API and Network Errors

- HTTP 400: map returned validation messages to the corresponding fields when possible; otherwise display the message in the form-level error area.
- HTTP 401: rely on the existing Axios response interceptor to clear local authentication data and redirect to `/login`; do not continue the success flow.
- HTTP 403: display the returned safe authorization message in the form-level error area.
- HTTP 409: display the returned conflict message in the form-level error area and keep the form values available for correction.
- HTTP 500: display the returned safe create-account failure message in the form-level error area.
- Network, timeout, malformed-envelope, or unavailable-service failure: display a general create-account error and keep the application stable.
- Do not show a success toast or schedule navigation after any failed request.
- Do not render raw server objects, database errors, stack traces, bearer tokens, or sensitive request data in errors or logs.

Do not create or run tests.
