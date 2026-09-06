---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-08a
uc_name: Quick Edit a Bank Account
source_use_case: docs/01-inception/use-cases/uc-08a-quick-edit-bank-account.md
source_use_case_sha256: sha256:3e34d75e07702605c4ea5c00212325e11c659932c9c8914f2e2195ec8a9bf061
source_inherited_use_case: docs/01-inception/use-cases/uc-08-edit-bank-account.md
source_inherited_use_case_sha256: sha256:5da3d61d3bed32941c0d49c34aa37694a83b345b5b6bf12d860f7dff963fc35b
source_api_contract: docs/01-inception/api-contracts/API-ACCOUNT-UPDATE.md
source_api_contract_sha256: sha256:d9a5cfe80f31fd14547917def55e70d50f95c81025d532478a84eaaae5193c04
figma_dataset_id: 2026-08-29-005
figma_node_id: "4795:5"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-06T13:55:18.7378853Z
---

# UC-08a Business Coding Prompt (RQ3) - Quick Edit a Bank Account

## Prompt A: Backend API

### Objective: Reuse or complete the protected bank-account update endpoint, validation, ownership-aware persistence flow, normalized responses, and server-side error handling required by the quick-edit flow.

Use the existing `API-ACCOUNT-UPDATE` operation: protected `PUT /api/v1/accounts/:id` in the NestJS account module under `finalsource/be`. UC-08a is a UI variant and MUST NOT introduce a second backend operation.

- Require a valid Bearer JWT and obtain `userId` from the validated authentication context.
- Read `id` from the path and validate that it parses to an integer. Do not accept an application-user identifier in the path, query, or body.
- Accept `Content-Type: application/json` and validate the request through the existing global NestJS `ValidationPipe` and update DTO conventions.
- Use the existing controller and implement or reuse the main flow in `AccountService.update(accountId, userId, dto)`.
- Determine whether the account exists and whether it belongs to the authenticated application user so HTTP 404 and HTTP 403 remain distinguishable.
- Use the existing TypeORM `Account` entity and repository. Do not alter the database schema.

Accept this request-body shape, excluding `account_number_last_4`:

```json
{
  "bank_name": "Vietcombank",
  "account_type": "Checking",
  "branch_name": "Hanoi Branch",
  "account_number_full": "9704221234567890123",
  "balance": 4500000
}
```

Implement the source-defined request and persistence behavior:

- `bank_name`: required, non-null string.
- `account_type`: required, non-null string using `Checking`, `Credit Card`, `Savings`, `Investment`, or `Loan`. Preserve the UML mapping between enum member `Credit_Card` and the API/database literal `Credit Card`.
- `branch_name`: optional nullable string. If omitted or cleared, store it as null or undefined according to the existing nullable mapping.
- `account_number_full`: required, non-null string. The frozen UI states that it contains 8–34 digits and remains unique for this application user.
- If `account_number_full` changes, exclude the current account when checking uniqueness. Reject a duplicate without changing stored data. The sources do not prescribe a duplicate-specific status or message; use an existing account-conflict or validation convention, and stop for researcher resolution if none exists rather than inventing a public API contract.
- `balance`: required, non-null decimal number. Do not accept a formatted currency string as the API-domain value.
- Do not accept `account_number_last_4` from the client. Derive it on the backend from the exact last four characters of the submitted `account_number_full`.
- After all validation and ownership checks succeed, overwrite only `bank_name`, `account_type`, nullable `branch_name`, `account_number_full`, derived `account_number_last_4`, and `balance`. Do not change `account_id` or `user_id`.
- Keep the persistence operation atomic so validation, authorization, conflict, or storage failure leaves the stored account unchanged.

For HTTP 200, return the source-defined result inside the standard success envelope:

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

- Invalid path ID or request body: preserve HTTP 400 and the returned validation message or message array.
- Missing, invalid, or expired JWT: preserve HTTP 401 and the authentication message.
- Account belongs to another application user: preserve HTTP 403 and `You do not have permission to edit this account information.`
- Account does not exist: preserve HTTP 404 and `This account could not be found.`
- Account cannot be stored: preserve HTTP 500 and `An error occurred while saving the data. Please try again later.`
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/accounts/<id>" }`, preserving the actual runtime request path.

Follow the existing NestJS 11, TypeORM/MySQL, class-validator, Passport JWT, Swagger, validation-pipe, and exception-filter conventions. Do not introduce unrelated layers or dependencies. Do not log JWTs, full account numbers, or sensitive payloads. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the authenticated quick-edit account experience directly on the Accounts page using the frozen design evidence.

Create or complete `AccountEditForm` and integrate its quick-edit state into `AccountListPage` at `/accounts` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `UC-08 • Edit Bank Account` at node `4795:5`, local snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/4795-5`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact identified target is:

- `UC-08 • Edit Bank Account` — node `4795:5`, 1440×900; the approved mapping explicitly covers the UC-08a quick-edit variant.

Reconstruct the interface as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive interface.

- Preserve the Accounts page's existing authenticated dashboard shell and account cards.
- Match the frozen frame's visual language: dark sidebar, white top bar, light `#F5F6F7` content surface, Inter typography, white subtly shadowed form card, and teal `#2FA79D` active and primary controls.
- Provide an `Edit Accounts` control that toggles list-level edit mode.
- In edit mode, display a design-consistent pencil action on every account card. Hide those actions when edit mode is off.
- Selecting a pencil opens or renders `AccountEditForm` directly from the Accounts page, populated from that selected card's already-loaded account data; do not navigate to the account-detail route.
- Display controlled, labelled fields for `Bank name`, `Account type`, optional `Branch name`, `Account number`, and `Current balance`.
- Provide an account-type selector containing `Checking`, `Credit Card`, `Savings`, `Investment`, and `Loan`.
- Allow the application user to clear `Branch name`.
- Display the exact frozen-design hint `Account number must contain 8–34 digits and remain unique for this user; the last 4 digits are derived automatically.`
- Place an outlined `Cancel` action and teal `Save Changes` action at the lower right of the form. Adapt the two-column desktop field arrangement responsively for narrower screens.
- Include design-consistent field-error, form-error, loading, disabled, and success-toast states without destabilizing the Accounts page layout.
- Keep `/accounts` behind the existing protected-route mechanism.

Behavioral UI states:

- Toggling `Edit Accounts` off exits edit mode and hides pencil actions without sending an update request.
- Cancelling `AccountEditForm` closes the selected form without sending a request and leaves the Accounts page in edit mode.
- Design-only shell controls remain visual unless equivalent behavior already exists or another authoritative use case defines them.

Use the project's existing styling system and shared components. Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect quick-edit AccountEditForm to the account-update API and implement the successful, optional-branch, cancel, and edit-mode flows.

Continue in `AccountEditForm`, `AccountListPage`, the existing frontend account API service, shared API types, and route configuration.

- Define typed request and response shapes matching `API-ACCOUNT-UPDATE`.
- Track list-level edit mode and the selected account separately.
- Initialize form state from the selected account card using `bank_name`, `account_type`, nullable `branch_name`, `account_number_full`, and `balance`.
- Keep the selected account identifier outside the request body and obtain it from the selected account-card data.
- Implement or reuse asynchronous `updateAccount` to send `PUT /api/v1/accounts/:id` through the existing Axios client. If the existing client base URL includes `/api`, call relative path `/v1/accounts/${id}`.
- Let the existing Axios request interceptor attach the Bearer JWT.
- Convert the accepted balance input to a numeric JSON value before submission. Do not send a formatted currency string.
- When `branch_name` is empty, omit it or send null according to the existing API-client convention.
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
  1. Display the exact toast `Update successful`.
  2. Wait 1500 ms without closing the form early.
  3. Invoke the form's success callback with the updated account when useful to the existing parent contract.
  4. Close the selected form.
  5. Reload the account list so it reflects persisted data.
  6. Exit list-level edit mode.
- Clear the pending success timer if the component unmounts or the active account changes.
- When the application user selects `Cancel`, close only the selected form without calling the API, without changing parent account data, and without exiting list-level edit mode.
- When the application user toggles `Edit Accounts` off, close any selected form and exit edit mode without calling the API.
- Do not mutate authentication or session identity after a successful account update.

Preserve numeric monetary values in request and typed state, applying display formatting only at the UI boundary. Prevent a stale response for a previously selected account from updating the current form or list by following the project's existing cancellation or request-lifecycle convention. Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, submission state, field-error mapping, cancellation, and API error handling for quick account editing.

Refine `updateAccount` and `AccountEditForm` within `AccountListPage`.

### Loading State

- Set `isSubmitting` immediately before the request and always settle it after success, cancellation, or failure.
- While `isSubmitting` is true, disable `Save Changes`, display a spinner or `Saving...` text, and prevent duplicate submissions.
- Disable or safely guard cancellation, edit-mode toggling, and account switching while an unresolved request could produce stale UI state.
- Preserve entered values until the request completes and clear stale API errors before a new valid submission.

### Client-Side Validation

Before calling the API:

- Require a valid integer account identifier from the selected loaded account.
- Require `bank_name`, `account_type`, `account_number_full`, and balance; treat `branch_name` as optional.
- Enforce the frozen UI's account-number instruction: 8–34 numeric digits. Display any validation message next to or below the Account number field.
- Accept only `Checking`, `Credit Card`, `Savings`, `Investment`, or `Loan` for `account_type`.
- Require the balance input to convert to a finite numeric value and send the converted number rather than a string. Do not invent a balance threshold absent from the functional specification, UI evidence, or API contract.
- Display each field-validation message next to or below its corresponding input.
- Do not call the API while any client-side validation error remains.

Backend authentication, ownership, uniqueness, DTO validation, derived-field handling, and persistence remain authoritative.

### API and Network Errors

- HTTP 400: map returned validation messages to corresponding fields when possible; otherwise display the message in an `aria-live` form-level error area.
- HTTP 401: rely on existing authentication handling to clear the invalid session and redirect the application user to `/login`; do not continue the success flow.
- HTTP 403: keep the form open, display `You do not have permission to edit this account information.`, and do not change the account list.
- HTTP 404: display `This account could not be found.`, prevent another submission against stale data, and allow the Accounts page to reload its safe list state.
- Duplicate account number: display the safe message supplied by the existing backend conflict or validation convention and keep values available for correction. If no status/message convention exists, surface the source gap for researcher resolution before implementation rather than inventing one.
- HTTP 500: keep stored and displayed account data unchanged and display `An error occurred while saving the data. Please try again later.`
- Network, timeout, malformed-envelope, or unavailable-service failure: display a general account-save failure and keep form values available for retry.
- Read safe string or string-array messages from the normalized error envelope. Never render raw response objects, database errors, stack traces, JWTs, or full account numbers in errors or logs.
- On failure, do not show the success toast, schedule the 1500 ms callback, close the form, exit edit mode, reload as though persistence succeeded, or mutate account data optimistically.

Use accessible field-error associations and an `aria-live` notification region. Do not add validation absent from the functional specification, inherited UML and exception flows, API contract, or frozen UI evidence. Do not create or run tests.
