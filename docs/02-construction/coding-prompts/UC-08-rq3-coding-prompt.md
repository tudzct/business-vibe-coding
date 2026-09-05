---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Draft
uc_id: UC-08
uc_name: Edit a Bank Account
source_use_case: docs/01-inception/use-cases/uc-08-edit-bank-account.md
source_use_case_sha256: sha256:bc5def3659807ea37e4551779b1027a834f92394903fe6aa0274ae66164549ad
source_api_contract: docs/01-inception/api-contracts/API-ACCOUNT-UPDATE.md
source_api_contract_sha256: sha256:162a88672bfb684c8e3a26da9632d1ed6350629065497c9175ff94a09de86f33
figma_dataset_id: 2026-08-29-005
figma_node_id: "4795:5"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-05T13:51:41.9564329Z
---

# UC-08 Business Coding Prompt (RQ3) - Edit a Bank Account

## Prompt A: Backend API

### Objective: Build the protected bank-account update endpoint, validation, ownership-aware persistence flow, response mapping, and server-side error handling.

Create the protected `PUT /api/v1/accounts/:id` endpoint for `API-ACCOUNT-UPDATE` in the existing NestJS account module under `finalsource/be`.

- Require a valid Bearer JWT and authorize the request as the authenticated application user.
- Read `id` from the path, parse it as an integer, and read `userId` from the validated authentication context. Do not accept an application-user identifier in the path, query, or body.
- Accept `Content-Type: application/json` and validate the body through the global NestJS `ValidationPipe` and `UpdateAccountDto`.
- Implement the controller flow using the existing account-controller conventions and the main update logic in `AccountService.update(accountId, userId, dto)`.
- Determine whether the account exists and whether it belongs to the authenticated application user so the source-defined HTTP 404 and HTTP 403 outcomes remain distinguishable.
- Use the existing TypeORM `Account` entity and repository. Do not alter the database schema.

Accept exactly this request-body shape:

```json
{
  "bank_name": "Vietcombank",
  "account_type": "Checking",
  "branch_name": "Hanoi Branch",
  "account_number_full": "9704221234567890123",
  "balance": 4500000
}
```

Request and update requirements defined by the functional specification, UML model, API contract, and project controls:

- `bank_name`: required non-null string and not blank after trimming.
- `account_type`: required non-null string using one of `Checking`, `Credit Card`, `Savings`, `Investment`, or `Loan`. Preserve the source mapping between UML enum member `Credit_Card` and database/API literal `Credit Card`.
- `branch_name`: optional nullable string. If omitted or cleared, store it as null or undefined according to the existing nullable mapping.
- `account_number_full`: required non-null string containing only 8–34 numeric digits.
- When `account_number_full` changes, require the submitted value to remain unique among the authenticated application user's other accounts. Exclude the account currently being updated from that comparison. Reject a duplicate without modifying stored data, using the existing account-conflict or validation exception convention. The sources do not prescribe a duplicate-specific HTTP status or message; if the project has no established convention, stop for researcher resolution instead of inventing one.
- `balance`: required non-null numeric decimal value greater than or equal to zero; do not accept a string as the API-domain value.
- Do not accept `account_number_last_4` from the client. Derive it on the backend as the exact last four characters of the submitted `account_number_full`.
- Overwrite the selected account's `bank_name`, `account_type`, nullable `branch_name`, `account_number_full`, derived `account_number_last_4`, and `balance` only after all validation and ownership checks succeed.
- Keep the update atomic so validation, authorization, conflict, or storage failure leaves the stored account unchanged.
- Do not change `account_id` or `user_id`.

For HTTP 200, return the source-defined domain result inside the standard success envelope:

```json
{
  "success": true,
  "message": "Account updated successfully",
  "data": {
    "account": {
      "account_id": 3,
      "user_id": 1,
      "bank_name": "Vietcombank",
      "account_type": "Checking",
      "branch_name": "Hanoi Branch",
      "account_number_full": "9704221234567890123",
      "account_number_last_4": "0123",
      "balance": 4500000
    }
  }
}
```

Error handling:

- Invalid path ID or request body: preserve HTTP 400 and the returned validation message or message array, such as `"Validation failed for one or more fields."`.
- Missing, invalid, or expired JWT: preserve HTTP 401 and the source message, such as `"Unable to authenticate the user. Please log in again."`.
- Account belongs to another application user: preserve HTTP 403 and `"You do not have permission to edit this account information."`.
- Account does not exist: preserve HTTP 404 and `"This account could not be found."`.
- Account cannot be stored: preserve HTTP 500 and `"An error occurred while saving the data. Please try again later."`.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/accounts/<id>" }`, preserving the actual runtime request path.

Follow the existing NestJS 11, TypeORM/MySQL, class-validator, Passport JWT, Swagger, validation-pipe, and exception-filter conventions. Do not introduce unrelated layers or dependencies. Do not log JWTs, full account numbers, or sensitive account payloads. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the protected Edit Bank Account interface for the detail and quick-edit flows according to the frozen Figma evidence and UC-08 functional scope.

Create or complete `AccountEditForm` and integrate it with `AccountDetailPage` on `/accounts/:id` and the UC-08.1 quick-edit state in `AccountListPage` on `/accounts`, using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `UC-08 • Edit Bank Account` at node `4795:5`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/4795-5`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact identified target is:

- `UC-08 • Edit Bank Account` — node `4795:5`, 1440×900; the approved mapping covers the primary UC and UC-08.1 UI variant.

Reconstruct the page and form as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive interface.

- Match the desktop composition: 244 px dark sidebar, 72 px white top bar, light `#F5F6F7` content background, Inter typography, and teal `#2FA79D` active and primary controls.
- Keep `Balances` active in the sidebar and preserve the `FINEbank.IO` wordmark, established navigation, logout area, search control, and top-bar avatar treatment.
- Display the breadcrumb `Accounts › Edit Account`, heading `Edit Bank Account`, and subtitle `Update the account information below. Changes apply after validation.`.
- Display a white, subtly shadowed `Edit account information` card approximately 804 px wide with 7 px rounded corners, 38 px horizontal padding, and 28 px vertical padding.
- Use a two-column desktop arrangement for `Bank name` and `Account type`, followed by `Branch name` and `Account number`; place `Current balance` across the full form width. Adapt fields responsively on narrower screens.
- Populate controlled, labelled fields from the selected account's already-loaded detail or account-card data. Do not hardcode the example values from the design.
- Provide an account-type selector containing `Checking`, `Credit Card`, `Savings`, `Investment`, and `Loan`.
- Treat `Branch name` as optional and allow the application user to clear it.
- Display the exact design hint `Account number must contain 8–34 digits and remain unique for this user; the last 4 digits are derived automatically.` in the pale information panel.
- Place the outlined `Cancel` action and teal `Save Changes` action at the lower right of the card.
- Include design-consistent field-error, submission-error, loading, disabled, and success-toast states without shifting the dashboard shell unnecessarily.
- Keep `/accounts/:id` and `/accounts` behind the existing protected-route mechanism.

For UC-08.1 on `/accounts`:

- `Edit Accounts` toggles list-level edit mode and shows a pencil action on each account card.
- Selecting a pencil opens or renders the same `AccountEditForm`, populated from that account card's loaded data, using the frame's form/card visual language.
- Toggling `Edit Accounts` off exits list-level edit mode and hides the pencil actions without sending an update request.
- Cancelling the selected form closes it without a request while leaving the Accounts page in edit mode.

Use the project's existing styling system and shared authenticated layout. Design-only controls outside UC-08 remain visual unless equivalent behavior already exists or another authoritative use case defines them. Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect AccountEditForm to the account-update API and implement the successful, optional-branch, primary, quick-edit, and cancel flows.

Continue in `AccountEditForm`, `AccountDetailPage`, `AccountListPage`, the existing frontend account API service, shared API types, and route configuration.

- Define typed request and response shapes matching `API-ACCOUNT-UPDATE`.
- Initialize form state from the selected loaded account with `bank_name`, `account_type`, nullable `branch_name`, `account_number_full`, and balance.
- Keep the selected account identifier outside the request body and obtain it from the active detail route or selected account-card data.
- Implement an asynchronous `updateAccount` operation that sends `PUT /api/v1/accounts/:id` through the existing Axios client. Because the existing client base URL includes `/api`, call relative path `/v1/accounts/${id}`.
- Let the existing Axios request interceptor attach the Bearer JWT.
- Convert the accepted balance input to a numeric JSON value before submission. Do not send a formatted currency string.
- When `branch_name` is empty, omit it or send null according to the existing API-client convention so the backend stores the optional value as null or undefined.
- Do not send `user_id` or `account_number_last_4`.

Send this request-payload shape:

```json
{
  "bank_name": "Vietcombank",
  "account_type": "Checking",
  "branch_name": "Hanoi Branch",
  "account_number_full": "9704221234567890123",
  "balance": 4500000
}
```

- Read the normalized success envelope from Axios `response.data` and the updated account from `response.data.data.account`.
- On HTTP 200 success:
  1. Display the exact success toast `Update successful`.
  2. Wait 1500 ms without closing the form early.
  3. Invoke the form's success callback with the updated account when useful to the existing parent contract.
  4. In `AccountDetailPage`, close edit mode and reload account details.
  5. In UC-08.1, close the selected form, reload the account list, and exit list-level edit mode.
- Clear the pending success timer if the component unmounts or the active account changes.
- When the application user selects `Cancel`, close the detail form or selected quick-edit form without calling the API and without changing stored or parent account data.
- Do not mutate authentication/session identity after a successful account update.

Preserve numeric monetary values in request and typed state, applying display formatting only at the UI boundary. Prevent a stale response for a previously selected account from updating the current form or parent view by following the project's existing cancellation or request-lifecycle convention. Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, field-error mapping, cancellation, and API error handling for account editing.

Refine `updateAccount` and `AccountEditForm` in both parent flows.

### Loading State

- Set `isSubmitting` immediately before the request and always settle it after success, cancellation, or failure.
- While `isSubmitting` is true, disable `Save Changes`, display a spinner or `Saving...` text inside it, and prevent duplicate submissions.
- Disable or safely guard cancellation and account switching while an unresolved request could produce a stale update.
- Preserve the entered values until the request completes and clear stale API errors before a new valid submission.

### Client-Side Validation

Before calling the API:

- Require a valid integer account identifier from the active route or selected account.
- Require `bank_name`, `account_type`, `account_number_full`, and balance; treat `branch_name` as optional.
- Reject a `bank_name` or `account_number_full` value that is blank after trimming.
- Accept only `Checking`, `Credit Card`, `Savings`, `Investment`, or `Loan` for `account_type`.
- Require `account_number_full` to contain only numeric digits and to be 8–34 characters long.
- Require balance input to convert to a finite numeric value greater than or equal to zero; send the converted number, not a string.
- Display each field-validation message next to or below its corresponding input.
- Do not call the API while any client-side validation error remains.

Backend authentication, ownership, uniqueness, DTO validation, derived-field handling, and persistence remain authoritative.

### API and Network Errors

- HTTP 400: map returned validation messages to the corresponding fields when possible; otherwise display the message in the form-level error area.
- HTTP 401: rely on the existing authentication handling to clear the invalid session and redirect the application user to `/login`; do not continue the success flow.
- HTTP 403: keep the form open, display `"You do not have permission to edit this account information."`, and do not change the parent account view.
- HTTP 404: display `"This account could not be found."`, do not submit again against stale data, and allow the parent to return to or reload its safe account state.
- Duplicate account number: display the safe message supplied by the existing backend conflict or validation convention and keep values available for correction. If no status/message convention exists, do not invent one; surface the source gap for researcher resolution before implementation.
- HTTP 500: keep the stored and displayed account unchanged and display `"An error occurred while saving the data. Please try again later."`.
- Network, timeout, malformed-envelope, or unavailable-service failure: display a general account-save failure and keep the form values available for retry.
- Read safe string or string-array messages from the normalized error envelope. Never render raw response objects, database errors, stack traces, JWTs, or full account numbers in error messages or logs.
- On any failed request, do not show the success toast, schedule the 1500 ms success callback, close the form, reload as though persistence succeeded, or mutate account data optimistically.

Use accessible field-error associations and an `aria-live` form notification region where appropriate. Do not add validation absent from the functional specification, UML model, API contract, or frozen UI evidence. Do not create or run tests.
