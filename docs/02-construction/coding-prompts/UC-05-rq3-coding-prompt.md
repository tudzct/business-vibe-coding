---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved 
uc_id: UC-05
uc_name: View Bank Accounts
source_use_case: docs/01-inception/use-cases/uc-05-view-bank-accounts.md
figma_dataset_id: 2026-08-29-003
figma_node_id: "2883:1676"
figma_manifest_sha256: sha256:36f7e6b4876ad0ddd97352f89f9e77365ed52ae51e64758b241588e27248e623
generated_at: 2026-08-29T12:16:02.0170404+00:00
---

# UC-05 Business Coding Prompt (RQ3) - View Bank Accounts

## Prompt A: Backend API

### Objective: Build the API endpoint, retrieval logic, validation, and server-side error handling.

Create the protected `GET /api/v1/accounts` endpoint for `API-ACCOUNT-LIST` in the existing NestJS accounts module under `finalsource/be`.

- Protect the controller with the existing `JwtAuthGuard`.
- Obtain the authenticated `userId` from the validated JWT payload. Do not accept a user identifier from request-controlled query, path, or body data.
- Request body, query parameters, and path parameters: none.
- Implement the main logic in the existing `AccountService.findAllByUserId(userId)` flow using the existing TypeORM Account repository.
- Query only accounts whose persisted user identifier equals the authenticated `userId`.
- Select only the list fields needed by `AccountDto`: persisted account ID mapped to `id`, `bank_name`, `account_type`, nullable `branch_name`, stored `account_number_last_4`, and `balance`.
- Do not select or return `account_number_full`.
- Order the result by persisted account ID ascending.
- Keep this GET operation read-only; it must not create, update, or delete Account or Transaction records.
- Use the existing Account entity and mappings. The supplied schema already contains every required field, so do not edit entities or migrations and do not enable TypeORM `synchronize`.

For HTTP 200, produce the domain payload:

```json
{
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
```

Wrap it through the existing normalized success handling as:

```json
{
  "success": true,
  "message": "Account list retrieved successfully.",
  "data": {
    "user_id": 1,
    "accounts": []
  }
}
```

An authenticated user with no linked accounts still receives HTTP 200 with the same message and an empty `data.accounts` array.

Error handling:

- Missing, invalid, or expired JWT: preserve HTTP 401 and the safe authentication message through `{ "success": false, "statusCode": 401, "message": "<safe message>", "timestamp": "<ISO-8601>", "path": "/api/v1/accounts" }`.
- Account retrieval failure: preserve HTTP 500 and `"system error occurred. Please try again later."` through the same normalized error envelope.
- Other failures: preserve their source HTTP status and safe message through `{ "success": false, "statusCode": <status>, "message": "<safe message>", "timestamp": "<ISO-8601>", "path": "/api/v1/accounts" }`.

Follow the existing project architecture and dependencies. Do not log JWTs, full account numbers, account payloads, or sensitive request/response data. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the account-list interface according to the frozen Figma evidence and UC-05 functional scope.

Create the `/accounts` route, `AccountListPage`, and reusable `AccountCard` components in `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project’s existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-003`, grouped frame `105. View Bank Accounts` at node `2883:1676`, snapshot `resource/figma-design-dataset/2026-08-29-003/nodes/2883-1676`, and manifest SHA-256 `36f7e6b4876ad0ddd97352f89f9e77365ed52ae51e64758b241588e27248e623`.

The exact active target identified for UC-05 is:

- `105. Balances` — node `66:5320`, 1440×1024.

The grouped dataset also contains `105.1 Add account` (`2798:2163`), `105.2 Input Validation for Adding an Account` (`2798:2264`), and `105.3 Account Added — Success Toast Notification` (`2798:2372`). Those frames belong to account-creation behavior and are outside this view-only use case; do not implement their forms, validation, submission, or toast flows for UC-05.

### Required UI

Reconstruct the target as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Preserve the 1440×1024 desktop composition: 280 px dark navigation sidebar, top header, `#F4F5F7` content background, Balances heading, and the account-card grid.
- Use the Figma account-card treatment: white 352×288 desktop cards, 8 px radius, subtle shadow, 24 px padding, separated header, account details, and teal `#299D91` accents.
- Each populated card must display the source account’s bank name, account type, stored last four account digits rendered as exactly `**** 0123`, and balance. Use the actual last-four value from the API regardless of the original account-number length.
- Preserve nullable branch data in the typed model but do not invent a new visible branch field where the target card does not define one.
- Use the frozen local image/SVG assets where the target design requires them.
- Include loading, retrieval-error, and empty-account states using the smallest design-consistent elements.
- When `accounts` is empty, show a clear no-account message and an Add Account action that navigates to `/accounts/add`.
- The target includes Add Account, Edit Accounts, Remove, and Details affordances. Only the empty-state Add Account navigation is defined by UC-05. Keep other design-only affordances non-mutating and visual unless another authoritative use case is implemented separately; do not invent deletion, editing, or detail-navigation behavior.
- Preserve the natural desktop layout and use existing project responsive conventions to prevent overflow on narrower viewports without inventing new content or interactions.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Load the authenticated user’s accounts and implement the successful and empty flows.

Continue in `AccountListPage` and the existing frontend API layer.

- Add typed `AccountDto` and account-list data shapes matching Prompt A.
- Manage `accounts`, `isLoading`, and `error` using the project’s existing state approach.
- Implement `fetchAccounts` to send `GET /api/v1/accounts` through the existing Axios client. The request has no body, query parameters, or path parameters.
- Rely on the existing request interceptor to attach the bearer token.
- Read the domain data from Axios `response.data.data`, where `response.data` is the normalized success envelope.
- On success, retain `data.user_id`, set `accounts` from `data.accounts`, and render the array in the order returned by the API.
- For each account, display `bank_name`, `account_type`, `**** ${account_number_last_4}`, and the balance using the project’s existing monetary-display convention. Do not invent a currency when the API supplies none.
- When the returned array is empty, render the no-account state and wire its Add Account action to `/accounts/add`.
- Do not store full account numbers, reconstruct them, or request them from another endpoint.
- Do not implement mutations or the grouped add-account forms as part of this flow.

For HTTP 401, allow the existing Axios response interceptor to clear local authentication data and redirect to `/login`. Do not duplicate that session-reset logic inside `AccountListPage`.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete loading-state, response validation, and API error handling for account retrieval.

Refine `fetchAccounts` and `AccountListPage`.

### Loading State

- Show a design-consistent loading indicator or card skeletons while the initial GET is pending.
- Prevent duplicate concurrent account-list requests from the same page lifecycle.
- Keep stale error content hidden while a new authorized retrieval is pending.
- Always settle the loading state after success or failure.

### API and Response Errors

- HTTP 401: let the existing interceptor clear local authentication data and redirect to `/login`; do not render protected account data afterward.
- HTTP 500 or another normalized API error: display the returned safe `message` when present; otherwise display a general account-loading error in the page content area.
- Network failure: display the same general account-loading error.
- A malformed success payload without numeric `user_id` or an `accounts` array is a retrieval failure; do not render partial account data.
- Ensure the page can perform a later authorized retrieval after a failure without issuing overlapping requests.

### Client-Side Validation

This GET operation has no client-entered request fields, request body, query parameters, or path parameters, so no field-level client validation applies. Authentication remains authoritative in `JwtAuthGuard`, and account retrieval remains authoritative in the backend.

Do not log JWTs, full account numbers, account payloads, or sensitive errors. Do not create or run tests.

