---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Draft
uc_id: UC-05
uc_name: View Bank Accounts
source_use_case: docs/01-inception/use-cases/uc-05-view-bank-accounts.md
source_use_case_sha256: sha256:225d9f81b2665af2818c8711fe05faf859679bfdc35e0eb8c2f34effbd975d11
source_api_contract: docs/01-inception/api-contracts/API-ACCOUNT-LIST.md
source_api_contract_sha256: sha256:4d0257394e728523003c2d964247de6f5fa5e9ec090ebcbb87dd2aaeff192c55
figma_dataset_id: 2026-08-29-005
figma_node_id: "2883:1676"
figma_target_frame_node_id: "66:5320"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-02T11:27:10.1961532Z
---

# UC-05 Business Coding Prompt (RQ3) - View Bank Accounts

## Prompt A: Backend API

### Objective: Build the protected account-list endpoint, authenticated-user retrieval flow, response mapping, and server-side error handling.

Create the protected `GET /api/v1/accounts` endpoint for `API-ACCOUNT-LIST` in the NestJS backend under `finalsource/be`.

- Protect the endpoint with the existing bearer-JWT authentication mechanism and `JwtAuthGuard`.
- Read the authenticated user identifier supplied by the guard. Do not accept a user identifier from request-controlled input.
- Accept the required `Authorization: Bearer <JWT>` header.
- Accept no request body, query parameters, or path parameters.
- Implement the retrieval flow in the account controller/service using the existing TypeORM `Account` entity and repository, and register the account module through the existing NestJS module structure.
- Retrieve the bank accounts linked to the authenticated user identifier.
- Map every returned account to the API contract fields: `id`, `bank_name`, `account_type`, nullable `branch_name`, `account_number_last_4`, and numeric `balance`.
- Preserve the allowed account-type values `Checking`, `Credit Card`, `Savings`, `Investment`, and `Loan`.
- Return `data.user_id` as the authenticated user identifier and `data.accounts` as an array that may be empty.
- Do not add undeclared domain fields to the list response.

For HTTP 200, return:

```json
{
  "success": true,
  "message": "Account list retrieved successfully.",
  "data": {
    "user_id": 1,
    "accounts": [
      {
        "id": 3,
        "bank_name": "Vietcombank",
        "account_type": "Checking",
        "branch_name": "Hanoi Branch",
        "account_number_last_4": "0123",
        "balance": 4500000
      }
    ]
  }
}
```

An authenticated user with no linked accounts still receives HTTP 200 with the same success message and `data.accounts: []`.

Error handling:

- Missing, invalid, or expired JWT: preserve HTTP 401 and the source message, such as `"Unauthorized"`.
- Account-retrieval failure: preserve HTTP 500 with a safe message, such as `"system error occurred. Please try again later."`.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/accounts" }`.

Follow the existing NestJS architecture and installed dependencies. Do not introduce unrelated layers or dependencies. Use the existing entity mappings and do not alter the database schema for this use case. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the bank-account list interface according to the frozen Figma evidence and UC-05 functional scope.

Create `AccountListPage` and reusable `AccountCard` UI for the protected `/accounts` route in `finalsource/fe`, replacing the current account placeholder and using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, parent frame `105. View Bank Accounts` at node `2883:1676`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/2883-1676`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact UC-05 target inside the grouped parent is:

- `105. Balances` — node `66:5320`, 1440×1024.

The sibling nodes `105.1 Add account` (`2798:2163`), `105.2 Input Validation for Adding an Account` (`2798:2264`), and `105.3 Account Added — Success Toast Notification` (`2798:2372`) document account-creation states and are outside this account-list use case.

Reconstruct the page as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Preserve the desktop dashboard composition: dark 280 px sidebar, top header, light `#F4F5F7` content background, Inter/Poppins typography, and teal `#299D91` active and primary controls.
- Keep `Balances` active in the sidebar and display the `Balances` page heading.
- Render account cards in the design's three-column grid, with white backgrounds, 8 px rounded corners, 24 px padding, restrained shadows, and responsive wrapping on narrower screens.
- Each card must display the account type, bank name, account-number presentation using only `account_number_last_4`, an `Account Number` label, the balance, and the `Total amount` label.
- Match the design's masked account-number visual treatment without requiring or exposing digits that are absent from the API response.
- Preserve the visible `Details` and `Remove` controls as design elements, but do not implement their separate detail or deletion flows in UC-05.
- Include the design-consistent Add Account card/action. The UC-backed action must navigate to `/accounts/add`.
- Keep the design-only `Edit Accounts` control visibly unavailable or non-functional because editing is outside UC-05.
- When `accounts` is empty, replace the grid content with a design-consistent no-account state and a clear Add Account action that navigates to `/accounts/add`.
- Include loading and retrieval-error presentation that fits the page without shifting the dashboard shell unnecessarily.
- Reuse or adapt the project's shared authenticated layout when it can represent the frozen frame; update the shared layout only as needed to match the frozen dashboard composition.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the account-list page to the API and implement the successful and empty-result flows.

Continue in `AccountListPage`, `AccountCard`, `finalsource/fe/src/api/account.service.ts`, the shared API types, and the application router.

- Register the protected route as `/accounts`, matching the use case. Replace or redirect the current singular `/account` route without creating a second independent account-list implementation.
- Define the list account DTO with exactly these fields: `id`, `bank_name`, `account_type`, nullable `branch_name`, `account_number_last_4`, and `balance`.
- Define the domain response data as `{ user_id: number; accounts: AccountListItem[] }`.
- Update `accountService.getAccounts` to send `GET /api/v1/accounts` through the existing Axios instance. Because its base URL already includes `/api`, call the relative path `/v1/accounts`.
- Send no request payload or user identifier. Let the Axios request interceptor attach the bearer token.
- Fetch the account list when the protected page opens, using component state for `accounts`, `isLoading`, and the page-level retrieval error.
- Read the normalized envelope from Axios `response.data` and read the domain payload from `response.data.data`.
- On HTTP 200 with accounts, store the returned array in page state and render one `AccountCard` per item.
- On HTTP 200 with an empty array, render the no-account state and Add Account action instead of treating the result as an error.
- Display the returned numeric balance consistently with the frozen design without changing its underlying value.
- Do not update authentication/session state after a successful list request.
- Wire the Add Account action to `/accounts/add`. Keep detail, removal, and edit behaviors outside this use case.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete loading, empty-state, authentication-error, retrieval-error, and safe rendering behavior.

Refine the account-list loading function and `AccountListPage`.

### Loading State

- Set `isLoading` before the initial request and always settle it after success or failure.
- While loading, display a design-consistent skeleton, spinner, or loading message in the account-grid area.
- Prevent duplicate in-flight retrievals caused by repeated page initialization.
- Do not render stale account cards as a fresh successful result while a replacement request is unresolved.

### Empty Result

- Treat HTTP 200 with `data.accounts: []` as a successful empty result.
- Display the no-account message and Add Account action in the content area.
- Do not display a failure alert for the empty result.

### API and Network Errors

- HTTP 401: rely on the existing Axios response interceptor to clear local authentication data and redirect to `/login`; do not render protected account data afterward.
- HTTP 500: display the returned safe server message in the page-level error area.
- Network, timeout, malformed-envelope, or unavailable-service failure: display a general account-loading error and keep the application stable.
- Provide a design-consistent retry action for recoverable retrieval failures and prevent concurrent retry requests.
- Do not render raw server objects, stack traces, bearer tokens, or sensitive response data in errors or logs.

### Client-Side Validation

The list request has no client-entered body, query, or path fields, so no field validation applies. Do not invent request inputs or validation rules. Backend authentication remains authoritative.

Do not create or run tests.
