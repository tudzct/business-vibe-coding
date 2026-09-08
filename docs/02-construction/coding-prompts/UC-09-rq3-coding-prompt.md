---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-09
uc_name: Delete a Bank Account
source_use_case: docs/01-inception/use-cases/uc-09-delete-bank-account.md
source_use_case_sha256: sha256:7cb25abbce1f2dd5f5e49b289fd461eeb8430a63c4de9132aa9f5f96030f7451
source_api_contract: docs/01-inception/api-contracts/API-ACCOUNT-DELETE.md
source_api_contract_sha256: sha256:564161e59c68c24e8c08d4009b2f97e23c5e99ea5ef01906d7b6d1531042521e
figma_dataset_id: 2026-08-29-005
figma_node_ids:
  - "2798:2356"
  - "2798:2468"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-08T07:58:45.6968651Z
---

# UC-09 Business Coding Prompt (RQ3) - Delete a Bank Account

## Prompt A: Backend API

### Objective: Build the protected bank-account deletion endpoint, authenticated resource-resolution flow, response mapping, and server-side error handling.

Create the protected `DELETE /api/v1/accounts/:id` endpoint for `API-ACCOUNT-DELETE` in the existing NestJS account module under `finalsource/be`.

- Require a valid Bearer JWT and authorize the operation as the authenticated application user.
- Read `id` from the path, parse it as an integer in the controller, and read `userId` only from the validated authentication context. Do not accept an application-user identifier in the path, query, or body.
- Add the endpoint to the existing account controller and implement the main logic as `AccountService.delete(accountId, userId)`.
- Resolve the requested account for the authenticated application user. Return the source-defined unavailable-resource response when the account cannot be resolved; do not expose whether an account identifier belongs to another application user.
- On a successful request, remove the selected account so it is no longer available to the application user.
- Preserve the UML relationship in which deleting the account also deletes its related Transaction records. Use the existing TypeORM entity relationships and migration conventions, and do not alter the database schema.
- Accept no request body.

For HTTP 200, return the source-defined domain result inside the standard success envelope:

```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": {
    "deleted_account_id": 3
  }
}
```

Error handling:

- Path `id` is not a valid integer: preserve HTTP 400 and the source message, such as `"Invalid account ID."`.
- Bearer JWT is missing, invalid, or expired: preserve HTTP 401 and the source message, such as `"Unable to authenticate the user. Please log in again."`.
- Requested account is unavailable to the authenticated application user: preserve HTTP 404 and `"The requested account could not be found."`.
- The deletion conflicts with current system state: preserve HTTP 409 and `"The operation cannot be completed due to a conflict."`.
- Processing fails: preserve HTTP 500 and `"A system error occurred while processing the request."`.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/accounts/<id>" }`, preserving the actual runtime request path.

Follow the existing NestJS 11, TypeORM/MySQL, Passport JWT, Swagger, validation-pipe, and exception-filter conventions. Do not introduce unrelated layers or dependencies. Do not log JWTs, full account numbers, or sensitive account payloads. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the Delete Account confirmation and success interfaces for the protected account-list and account-detail flows according to the frozen Figma evidence.

Create or complete accessible `DeleteAccountModal` and `AccountDeletionSuccessDialog` components and integrate them with `AccountListPage` on `/accounts` and `AccountDetailPage` on `/accounts/:id`, using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, primary frame `106.4 Remove and Confirm Account Deletion` at node `2798:2356`, supplementary success frame `106.5 Account Removed Successfully` at node `2798:2468`, snapshots under `resource/figma-design-dataset/2026-08-29-005/nodes/`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact identified targets are:

- `106.4 Remove and Confirm Account Deletion` — node `2798:2356`, 1440×1024.
- `106.5 Account Removed Successfully` — node `2798:2468`, 1160×1024; supplementary success-state evidence.

Reconstruct the interaction as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive interface.

- Use the project's shared authenticated layout, with `Balances` active, and preserve the established dark sidebar, white header, light `#f4f5f7` content background, Inter typography, and teal `#299d91` application controls.
- Open the confirmation UI when the application user selects Delete from an account card or the account-detail page. Keep both routes behind the existing protected-route mechanism.
- Present a centered white confirmation card/dialog approximately 560 px wide with 48 px padding, 16 px corners, subtle shadow, 32 px vertical gaps, and responsive sizing on narrow screens.
- Show the pale-red circular warning treatment, heading `Confirm Account Deletion`, and warning copy populated from the selected account's bank name and final four account digits. Do not hardcode `Vietcombank` or `3123`, and never display or log the full account number.
- Make the warning clear that the action permanently deletes the account and all related transactions.
- Provide an outlined neutral `Cancel` control and a red `Confirm Delete` control with equal visual weight and accessible focus treatment.
- Allow Cancel, the dialog close control, and the Escape key to dismiss the confirmation state without changing account data.
- After confirmed success, replace or close the confirmation UI and display the supplementary success dialog: teal success icon treatment, heading `Account Removed Successfully!`, message `Your account has been removed successfully.`, and the design's `Back to Balances` control.
- Include design-consistent pending, disabled, API-error, and focus states without shifting the shared application shell unnecessarily.

Use the project's existing styling system and shared account components. UC-backed controls must be functional; controls shown only by the design remain visual unless equivalent behavior already exists or the functional specification defines it. Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect account deletion to the API and implement the confirm, cancel, success, refresh, and navigation flows.

Continue in `DeleteAccountModal`, `AccountDeletionSuccessDialog`, `AccountListPage`, `AccountDetailPage`, the existing frontend account API service, shared API types, and route configuration.

- Keep the selected account identifier, bank name, and final four digits in component or parent state. Obtain them from already-loaded account data; do not put them in the request body.
- Implement a typed asynchronous `deleteAccount` operation that sends `DELETE /api/v1/accounts/:id` through the existing Axios client. Because the client base URL includes `/api`, call relative path `/v1/accounts/${id}`.
- Let the existing Axios request interceptor attach the Bearer JWT.
- Send no request body and do not send `user_id`, bank name, full account number, or balance.
- Read the normalized success envelope from Axios `response.data` and the deleted identifier from `response.data.data.deleted_account_id`.
- Guard the result so a stale response for a previously selected account cannot update the current dialog or parent view; follow the project's existing abort or request-lifecycle conventions.

On HTTP 200 success:

1. Verify that the response contains the selected integer `deleted_account_id` before treating the operation as complete.
2. Close the confirmation state and display the success dialog with the frozen success-state text.
3. Wait 1500 ms while preserving the success state.
4. From the account-list flow, close the success dialog and refresh the account list; from the account-detail flow, navigate to `/accounts` and refresh through the destination page's normal loading path.

Clear the pending 1500 ms timer if the component unmounts or the route changes. Do not optimistically remove the account before a valid success response.

When the application user selects Cancel or closes the confirmation UI, clear only the local selection/dialog state. Send no API request and leave the loaded account data unchanged.

Do not mutate authentication/session identity after deletion. Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side identifier validation, loading state, cancellation, normalized API-error handling, and safe post-success behavior.

Refine `deleteAccount`, `DeleteAccountModal`, and both parent account flows.

### Loading State

- Set `isDeleting` immediately before the request and always settle it after success, cancellation, or failure.
- While `isDeleting` is true, disable `Confirm Delete`, show a spinner or `Deleting...` text inside it, and prevent duplicate submissions.
- Disable or safely guard modal dismissal and account switching while an unresolved request could produce a stale result.
- Clear a stale API error before a new valid deletion attempt.

### Client-Side Validation

Before calling the API:

- Require the selected account identifier to parse as an integer.
- Require selected account display data sufficient to show the bank name and final four account digits without exposing the full account number.
- If the identifier is invalid or the selected account data is unavailable, do not call the API; keep or close the dialog according to the existing safe account-page state and display a concise form-level message in an `aria-live` region.
- Do not infer additional client-side validation.

Backend authentication, authorization, resource resolution, conflict handling, and deletion remain authoritative.

### API and Network Errors

- HTTP 400: keep the confirmation UI open and display the returned validation message, such as `"Invalid account ID."`.
- HTTP 401: rely on the existing authentication handling to clear the invalid session and redirect the application user to `/login`; do not continue the success flow.
- HTTP 404: close or disable the stale confirmation target, display `"The requested account could not be found."`, and allow the parent account list to reload or return to `/accounts` safely.
- HTTP 409: keep the confirmation UI open and display `"The operation cannot be completed due to a conflict."`.
- HTTP 500: keep the account visible and display `"A system error occurred while processing the request."`.
- Network, timeout, malformed-envelope, or unavailable-service failure: keep the account visible, preserve a safe retry path, and display a general account-deletion failure.
- Read safe string or string-array messages from the normalized error envelope. Never render raw response objects, database errors, stack traces, JWTs, full account numbers, or sensitive account payloads.
- On any failed request, do not show the success dialog, schedule the 1500 ms completion flow, remove the account optimistically, refresh as though deletion succeeded, or navigate as though deletion succeeded.

Use an accessible dialog title/description relationship, return focus to the originating Delete control on cancellation or recoverable failure, and announce pending, error, and success states appropriately. Do not add validation absent from the functional specification, UML model, API contract, or frozen UI evidence. Do not create or run tests.
