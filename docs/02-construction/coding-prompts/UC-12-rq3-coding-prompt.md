---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-12
uc_name: View Upcoming Bills
source_use_case: docs/01-inception/use-cases/uc-12-view-upcoming-bills.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "66:5609"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-04T13:06:44Z
---

# UC-12 Business Coding Prompt (RQ3) - View Upcoming Bills

## Prompt A: Backend API

### Objective: Build the upcoming-bills endpoint, retrieval and processing flow, and server-side error handling.

Create the protected `GET /api/v1/bills` endpoint for `API-BILL-LIST` in the existing NestJS backend under `finalsource/be`.

- Protect the endpoint with the existing Bearer JWT authentication mechanism and `JwtAuthGuard`.
- Obtain the authenticated `userId` from the validated request identity represented by `AuthenticatedRequest`. The request has no body, query parameters, or path parameters.
- Implement the controller entry point as `BillController.getBills(request)` and the main retrieval and processing flow as `BillService.findUpcomingBillsByUserId(userId)` using the existing `Bill` persistence mapping.
- Retrieve and process the authenticated user's relevant bill data for the Upcoming Bills view according to the use-case functional flow and existing persistence conventions. Do not invent unsupported request inputs, response fields, filters, calculations, mutations, or fallback data.
- Keep this GET operation read-only. It must not intentionally create, update, or delete stored bill data.
- Use the existing entity and schema. Do not edit entities or migrations and do not enable TypeORM `synchronize` without a separate researcher-approved schema proposal.

For HTTP 200, return the domain payload as an array of bill DTOs with this interface:

```json
[
  {
    "billId": 7,
    "userId": 1,
    "itemDescription": "Netflix",
    "logoUrl": "https://example.com/netflix.png",
    "dueDate": "2025-11-15",
    "lastChargeDate": "2025-10-15",
    "amount": 260000
  }
]
```

`logoUrl` and `lastChargeDate` are nullable. Wrap the domain payload through the normalized success handling:

```json
{
  "success": true,
  "message": "Bills retrieved successfully",
  "data": [
    {
      "billId": 7,
      "userId": 1,
      "itemDescription": "Netflix",
      "logoUrl": "https://example.com/netflix.png",
      "dueDate": "2025-11-15",
      "lastChargeDate": "2025-10-15",
      "amount": 260000
    }
  ]
}
```

When no applicable bill data is available, return HTTP 200 with the same success message and an empty `data` array.

Error handling:

- Missing, invalid, or expired JWT: preserve HTTP 401 and the safe authentication message through the normalized error envelope.
- Unexpected bill retrieval or response-processing failure: preserve HTTP 500 and `"Failed to fetch bills"` through the normalized error envelope.
- Preserve every error as `{ "success": false, "statusCode": <status>, "message": "<safe message>", "timestamp": "<ISO-8601>", "path": "/api/v1/bills" }`.

Follow the existing project architecture and dependencies. Do not log JWTs or sensitive financial payloads. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the Upcoming Bills interface according to the frozen Figma evidence and UC-12 functional scope.

Create or refine the protected `/bills` route, `BillsPage`, and reusable `UpcomingBills` component in `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `108. Bills` at node `66:5609`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/66-5609`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact active target identified for UC-12 is:

- `108. Bills` — node `66:5609`, 1440×1024.

### Required UI

Reconstruct the target as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Preserve the desktop composition shown in the frozen target: 280 px dark navigation sidebar, top date/notification/search header, `#F4F5F7` content background, `Upcoming Bills` heading, and the large white rounded bill-list panel with a subtle shadow.
- Render the list under the visible columns `Due Date`, `Logo`, `Item Description`, `Last Charge`, and `Amount`.
- For each returned bill, display a compact month/day due-date tile, the logo when available, prominent item description, last-charge date when available, and amount in the corresponding columns. Keep the supporting description text shown in the design as visual-only content unless it is backed by returned API data; do not fabricate per-bill descriptions.
- Follow the target's typography, spacing, row dividers, gray surfaces, dark text, teal `#299D91` navigation accent, and bordered amount badge.
- Keep navigation, header, search, notification, logout, profile, and overflow controls consistent with existing application behavior. Design-only controls remain visual unless another authoritative use case defines their behavior.
- Include design-consistent loading, empty-list, and bill-loading error states within the main list panel.
- The empty state must clearly communicate that there are no upcoming bills and must not render bill rows.
- Preserve the natural desktop table layout and use the project's existing responsive conventions to prevent overflow and keep bill information readable on narrower viewports without inventing new content or interactions.
- Do not implement payment or `Pay Now` behavior as part of UC-12.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Load and display the authenticated user's Upcoming Bills data.

Continue in `BillsPage`, `UpcomingBills`, and the existing frontend API layer.

- Add typed bill DTO and normalized response shapes matching the interface from Prompt A, using the API field names `billId`, `userId`, `itemDescription`, `logoUrl`, `dueDate`, `lastChargeDate`, and `amount`.
- Manage bill data, loading state, empty state, and error state using the project's existing state approach.
- Implement `fetchUpcomingBills()` to send `GET /api/v1/bills` through the existing Axios client when the authenticated user opens `/bills`.
- The request has no body, query parameters, or path parameters. Rely on the existing request interceptor to attach the Bearer JWT.
- Read the domain array from Axios `response.data.data`, where `response.data` is the normalized success envelope.
- On a non-empty HTTP 200 response, store the returned bill array without reordering it and render one row per returned bill.
- Render dates and monetary values using the project's existing display conventions while preserving the source values and without inventing a currency when the API supplies none.
- On HTTP 200 with an empty array, clear populated bill data and display the no-upcoming-bills state.
- Keep the flow read-only and do not add bill mutations or payment actions to this page.

For HTTP 401, allow the existing Axios authentication-error handling to clear invalid session state and redirect or otherwise apply the application's established authentication flow. Do not duplicate that global session-reset behavior inside the page.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete loading, empty-list, response-validation, retry, and API-error handling.

Refine `fetchUpcomingBills`, `BillsPage`, and `UpcomingBills`.

### Loading State

- Show design-consistent table-row skeletons or a loading indicator while the initial or retried GET is pending.
- Disable the retry action while a request is pending and prevent duplicate concurrent retrievals.
- Hide stale error and empty-state content while a new authorized retrieval is pending.
- Do not allow a stale response from an earlier request to replace a later request's result.
- Always settle the loading state after success or failure.

### API and Response Errors

- HTTP 401: use the application's established authentication-error handling and do not render protected bill data afterward.
- HTTP 500 or another normalized API error: clear protected bill data and display the returned safe `message` when present; otherwise display a general bill-loading error inside the main list panel.
- Network failure: clear protected bill data and display the same general bill-loading error state.
- Treat a malformed success payload that is not an array, or an item missing finite numeric `billId`, finite numeric `userId`, string `itemDescription`, string `dueDate`, finite numeric `amount`, nullable string `logoUrl`, or nullable string `lastChargeDate`, as a retrieval failure. Do not render partial malformed data.
- Provide an accessible retry action in the loading-error state. Selecting it calls `fetchUpcomingBills()` again and permits a later authorized retrieval without overlapping requests.

### Client-Side Validation

The list request has no user-entered body, query, or path values, so no additional client-side field validation is required. Backend authentication remains authoritative.

Do not log JWTs, financial payloads, or sensitive errors. Do not create or run tests.
