---
artifact_type: business-coding-prompt
prompt_variant: full-a-f
status: Draft
uc_id: UC-06
uc_name: Add a Bank Account
source_use_case: docs/01-inception/use-cases/uc-06-add-bank-account.md
source_use_case_sha256: sha256:f55e4b9b0e131a8b7d214b7184b1e742044001482a59507b57c7fc43249eee9f
source_checksum_normalization: docs/02-construction/implementation/UC-06/source-checksum-normalization.json
source_api_contract: docs/01-inception/api-contracts/API-ACCOUNT-CREATE.md
source_api_contract_sha256: sha256:9602b221d01d2a685c52beca261bc413fd7358cadc0e7a74f858b032399b760c
business_rule_resource: docs/02-construction/business-rules/UC-06-business-rules.json
business_rule_resource_sha256: sha256:18816714cee5c6e29b69321bd52f4b9a1808577a10d46ba2650c20b5478a2ea1
business_rule_baseline: docs/02-construction/implementation/UC-06/business-rule-baseline.json
figma_dataset_id: 2026-08-29-005
figma_node_id: "4795:3"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-04T12:04:31.0903845Z
---

# UC-06 Business Coding Prompt - Add a Bank Account

## Prompt A: Backend API

### Objective: Build the protected account-creation endpoint, business logic, validation, persistence, and server-side error handling.

Create the protected `POST /api/v1/accounts` endpoint for `API-ACCOUNT-CREATE` in the NestJS backend under `finalsource/be`.

- Protect the endpoint with the existing bearer-JWT authentication mechanism and `JwtAuthGuard`.
- Read `userId` only from the authenticated JWT principal. Do not accept an owner identifier from the request body, query, or path.
- Accept `Authorization: Bearer <JWT>` and `Content-Type: application/json`.
- Define `CreateAccountDto` with `bank_name`, `account_type`, optional nullable `branch_name`, `account_number_full`, and numeric `balance`.
- Preserve the account-type literals `Checking`, `Credit Card`, `Savings`, `Investment`, and `Loan` and the existing `AccountType` mapping.
- Implement the main flow in `AccountController` and `AccountService.create`, using the existing TypeORM `Account` repository and entity mappings.
- Enforce BR-ACC-07 through BR-ACC-16 exactly as specified in Prompt E. Backend/database enforcement is authoritative; frontend validation cannot substitute for it.
- Derive `account_number_last_4` on the backend and never accept it from request-controlled input.
- Persist `user_id` from the JWT, all source-defined account fields, and the derived last four characters. Return only the allowlisted response fields; never return or log `account_number_full`.
- Preserve atomic failure behavior: if validation, conflict, capacity, or storage handling rejects the request, the request must not add an account.
- Use the researcher-approved schema contract at `docs/02-construction/implementation/UC-06/schema.json` for the owner-scoped composite unique constraint required by BR-ACC-10. Do not make any schema change beyond that approved proposal.

### Request Format

```json
{
  "bank_name": "Vietcombank",
  "account_type": "Checking",
  "branch_name": "Hanoi Branch",
  "account_number_full": "<8-to-34-digit-account-number>",
  "balance": 4500000
}
```

Omit `branch_name` or send it as `null` only where BR-ACC-14 permits. The request body must not contain `user_id`, `account_number_last_4`, or other undeclared fields.

### Success Response

For HTTP 201, preserve the source message and wrap the domain payload in the standard envelope:

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

### Error Handling

- Malformed payload, missing required fields, or a failed account-creation precondition represented by the API contract's validation category: preserve HTTP 400 and the validation message or message array.
- Missing, invalid, or expired JWT: preserve HTTP 401 and its source message.
- Authenticated user denied the operation: preserve HTTP 403 and its source message.
- Existing `account_number_full` for the same authenticated owner, including a concurrent database uniqueness violation: preserve HTTP 409 and a safe conflict message without exposing the full number.
- Unexpected storage failure: preserve HTTP 500 and the safe create-account failure message.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/v1/accounts" }`.

Follow the existing NestJS 11, TypeScript, TypeORM/MySQL, class-validator, Swagger, exception-filter, and module conventions. Do not introduce unrelated layers or dependencies. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the Add Bank Account page according to the frozen Figma evidence and UC-06 functional scope.

Create `AddAccountPage` and `AddAccountForm` for the protected `/accounts/add` route in `finalsource/fe`, using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, dedicated frame `UC-06 • Add Bank Account` at node `4795:3`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/4795-3`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact identified target frame is:

- `UC-06 • Add Bank Account` — node `4795:3`, 1440×900.

Reconstruct the page as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Preserve the desktop dashboard composition: 244 px dark sidebar, 72 px white top bar, light `#F5F6F7` content background, Inter typography, and teal `#2FA79D` active and primary controls.
- Keep `Balances` active in the sidebar. Show the breadcrumb `Accounts › Add Account`, heading `Add Bank Account`, and subtitle `Connect a bank account manually and enter its current balance.`
- Render the white `Account information` form card with the design's rounded corners, restrained shadow, spacing, and responsive behavior.
- Display labeled controls for Bank name, Account type, Branch name, Account number, and Current balance.
- Default Account type to `Checking`. Provide only the five source-defined account types.
- Present Branch name as conditionally required for `Loan` and `Investment`, while keeping it optional for the other account types.
- Display the design hint: `Account number must contain 8–34 digits. The last 4 digits are derived automatically.`
- Display `Cancel` and `Add Account` actions in the design's order and visual hierarchy.
- Keep the layout usable on narrower screens by stacking fields/actions without losing labels, validation messages, or navigation.
- Reuse or adapt the project's authenticated dashboard patterns when they can represent the frozen frame; avoid duplicating unrelated shell behavior.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the add-account form to the API and implement the successful, cancel, and navigation flows.

Continue in `AddAccountPage`, `AddAccountForm`, `finalsource/fe/src/api/account.service.ts`, the shared API types, and `finalsource/fe/src/router/AppRouter.tsx`.

- Register `/accounts/add` as a protected route using the existing authentication guard pattern.
- Manage controlled form state for `bank_name`, `account_type`, `branch_name`, `account_number_full`, and `balance`, plus field errors, submission error, and `isSubmitting`.
- Initialize `account_type` to `Checking`.
- Implement `handleSubmit` to send `POST /api/v1/accounts` through the existing Axios instance. Because its base URL already includes `/api`, call relative path `/v1/accounts`.
- Send exactly the source request fields. Convert the balance input to a number before constructing the payload; do not send a numeric string.
- Omit `branch_name` when it is empty and optional. Include a non-empty branch name when BR-ACC-14 requires it.
- Let the existing Axios interceptor attach the bearer token. Never send `user_id` from client state.
- Read the normalized envelope from Axios `response.data` and the created account from `response.data.data.account`.
- On HTTP 201, show a success toast using `Account created successfully`, keep duplicate submission disabled, and navigate to `/accounts` after 1.5 seconds.
- Cancel any pending success-navigation timer when the page unmounts.
- On `Cancel`, navigate immediately to `/accounts` without calling the API.
- Preserve the submitted form on a recoverable API failure so the application user can correct or retry it.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, field-error mapping, and safe API error handling.

Refine `handleSubmit` in `AddAccountForm`.

### Loading State

- Set `isSubmitting` immediately before the request and settle it after failure; retain the disabled state through the scheduled success navigation.
- While submitting, disable `Add Account`, show design-consistent loading text or a spinner, and prevent duplicate submissions.
- Disable or guard Cancel while a submission outcome would otherwise race navigation.

### Client-Side Validation

Before calling the API, enforce the frontend-applicable portions of Prompt E:

- BR-ACC-07: accept only the five source-defined account types.
- BR-ACC-08: require non-blank `bank_name` and `account_number_full` after trimming for validation.
- BR-ACC-09: require `balance` to convert to a valid numeric value and be at least zero; the payload value must be a number.
- BR-ACC-13: require `account_number_full` to contain only digits and be 8–34 characters long.
- BR-ACC-14: require a non-blank `branch_name` for `Loan` and `Investment`; allow it to be omitted for all other types.
- BR-ACC-15: require at least 50,000 for `Savings` and `Investment`; otherwise require at least zero.

Display each validation message adjacent to its field and do not call the API when client-side validation fails. Backend/database enforcement remains authoritative for every rule, including BR-ACC-10, BR-ACC-11, BR-ACC-12, and BR-ACC-16.

### API Error

- HTTP 400: map returned validation messages to the matching fields when possible; otherwise display the returned message in a form-level alert.
- HTTP 401: rely on the existing Axios interceptor to clear local authentication state and redirect to `/login`; do not retain protected response data.
- HTTP 403: display the returned safe denial message in the form-level alert.
- HTTP 409: display the returned safe conflict message near the account-number field when it identifies that field, otherwise in the form-level alert.
- HTTP 500: display the returned create-account failure message in the form-level alert.
- Network, timeout, malformed-envelope, or unavailable-service failure: display a general create-account error and keep the form stable for retry.
- Do not render or log raw server objects, stack traces, bearer tokens, or full account numbers in errors.

Do not create or run tests.

## Prompt E: Business Rules Compliance

### Objective: Implement the complete frozen Business Rule set for this use case without changing its meaning.

The ordered Rule IDs below MUST exactly match the frozen Business Rule baseline. Every rule appears exactly once in this projection; one implementation control may enforce multiple rules when appropriate.

### Business Rule: BR-ACC-07

- **Name:** Allowed account type
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_07_ValidType:
  Set{'Checking', 'Credit Card', 'Savings', 'Investment', 'Loan'}->includes(dto.account_type)
- **Context:** AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Invalid account types fail client-side validation before submission when possible; backend DTO/service validation remains authoritative and returns HTTP 400 for an invalid request.
- **Traceability:** Use cases!A106:B130, UC-06 Basic Flow 3, 5, 7-8, UC-06 EF-1 and EF-3, API-ACCOUNT-CREATE

### Business Rule: BR-ACC-08

- **Name:** Required account text fields
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_08_RequiredText:
  not dto.bank_name.oclIsUndefined() and dto.bank_name.trim().size() > 0 and
  not dto.account_number_full.oclIsUndefined() and dto.account_number_full.trim().size() > 0
- **Context:** AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Missing or blank required text fields display field errors and prevent submission on the frontend; backend validation returns HTTP 400 when such a request reaches the API.
- **Traceability:** Use cases!A106:B130, UC-06 Basic Flow 3, 5, 7-8, UC-06 EF-1 and EF-3, API-ACCOUNT-CREATE

### Business Rule: BR-ACC-09

- **Name:** Numeric non-negative account balance
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_09_IsNumeric:
  dto.balance.oclIsTypeOf(Real) or dto.balance.oclIsTypeOf(Integer)

pre BR_ACC_09_NonNegativeBalance:
  not dto.balance.oclIsUndefined() and dto.balance >= 0
Technical constraint:
- The balance must be a valid numeric type (not a string), and must be greater than or equal to zero.
- **Context:** AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto
- **Enforcement layer:** frontend, backend
- **Failure behavior:** A non-numeric, missing, or negative balance displays a field error and prevents frontend submission; backend validation returns HTTP 400 if an invalid balance reaches the API.
- **Traceability:** Use cases!A106:B130, UC-06 Basic Flow 3, 5, 7-8, UC-06 EF-1 and EF-3, API-ACCOUNT-CREATE

### Business Rule: BR-ACC-10

- **Name:** Unique account number per owner
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_10_UniqueAccount:
  not Account.allInstances()->exists(a | 
    a.user_id = userId and 
    a.account_number_full = dto.account_number_full
  )
- **Context:** AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto
- **Enforcement layer:** backend, database
- **Failure behavior:** When the authenticated owner already has the submitted full account number, creation is rejected with HTTP 409 and no account is added.
- **Traceability:** Use cases!A106:B130, UC-06 POST-3, UC-06 EF-2, API-ACCOUNT-CREATE

### Business Rule: BR-ACC-11

- **Name:** Derive final four account characters
- **Representation:** ocl_postcondition
- **Expression / authoritative text:** context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

post BR_ACC_11_DeriveLast4:
  let newAcc = Account.allInstances()->any(a | a.account_id = result.id) in
  newAcc.account_number_last_4 = dto.account_number_full.substring(dto.account_number_full.size() - 3, dto.account_number_full.size())

Technical constraint:
- The backend derives account_number_last_4 by taking the exact last 4 characters of the submitted account_number_full (e.g., via .slice(-4)).
- **Context:** AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto
- **Enforcement layer:** backend, database
- **Failure behavior:** A successfully created account stores account_number_last_4 as the exact final four characters of the submitted account_number_full.
- **Traceability:** Use cases!A106:B130, UC-06 POST-1, UC-06 Basic Flow 8-9, API-ACCOUNT-CREATE

### Business Rule: BR-ACC-12

- **Name:** Account creation persistence mapping
- **Representation:** ocl_postcondition
- **Expression / authoritative text:** context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

post BR_ACC_12_StorageMapping:
  Account.allInstances()->exists(a |
    a.account_id = result.id and
    a.user_id = userId and
    a.bank_name = dto.bank_name and
    a.account_type = dto.account_type and
    a.branch_name = dto.branch_name and
    a.account_number_full = dto.account_number_full and
    a.balance = dto.balance
  )

post BR_ACC_12_ResponseMapping:
  result.id = Account.allInstances()->any(a | a.account_number_full = dto.account_number_full).account_id
- **Context:** AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto
- **Enforcement layer:** backend, database
- **Failure behavior:** A successful response maps to the persisted account created for the authenticated user; a storage failure returns HTTP 500 and the account is not added by the request.
- **Traceability:** Use cases!A106:B130, UC-06 POST-1 and POST-3, UC-06 Basic Flow 8-9, UC-06 EF-4, API-ACCOUNT-CREATE

### Business Rule: BR-ACC-13

- **Name:** Account number format and length
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_13_NumericCharactersOnly:
  not dto.account_number_full.oclIsUndefined() and 
  matches(dto.account_number_full, '^[0-9]+$')
pre BR_ACC_13_LengthConstraints:
  dto.account_number_full.size() >= 8 and dto.account_number_full.size() <= 34

Technical constraint:
- account_number_full must contain only numeric digits.
- The length must be between 8 and 34 characters (to safely derive the last 4 digits and reflect real-world bank account numbers).
- **Context:** AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto
- **Enforcement layer:** frontend, backend
- **Failure behavior:** An account number containing non-digits or fewer than 8 or more than 34 characters displays a field error and prevents frontend submission; backend validation returns HTTP 400 if it reaches the API.
- **Traceability:** Use cases!A106:B130, UC-06 Basic Flow 3, 5, 7-8, UC-06 EF-1 and EF-3, API-ACCOUNT-CREATE

### Business Rule: BR-ACC-14

- **Name:** Conditional branch name requirement
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_14_BranchNameConditional:
  if Set{'Loan', 'Investment'}->includes(dto.account_type) then
    not dto.branch_name.oclIsUndefined() and dto.branch_name.trim().size() > 0
  else
    dto.branch_name.oclIsUndefined() or dto.branch_name.oclIsTypeOf(String)
  endif

Technical constraint:
- This rule overrides the base optional branch rule. If the account_type is 'Loan' or 'Investment', the branch_name field is strictly required and cannot be empty.
- For all other account types, branch_name is optional. If omitted, it shall be processed and stored as null or undefined.
- **Context:** AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto
- **Enforcement layer:** frontend, backend, database
- **Failure behavior:** Loan and Investment submissions without a non-empty branch name are rejected; other account types may omit branch_name, which is stored as null or undefined.
- **Traceability:** Use cases!A106:B130, UC-06 AF-1, UC-06 EF-1 and EF-3, API-ACCOUNT-CREATE

### Business Rule: BR-ACC-15

- **Name:** Minimum initial deposit for specific types
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_15_MinInitialDeposit:
  if Set{'Savings', 'Investment'}->includes(dto.account_type) then
    not dto.balance.oclIsUndefined() and dto.balance >= 50000
  else
    not dto.balance.oclIsUndefined() and dto.balance >= 0
  endif

Technical constraint:
- If the user creates a 'Savings' or 'Investment' account, the initial balance must be at least 50,000.
- For other account types, the balance can be 0 or more.
- **Context:** AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Savings or Investment creation with balance below 50,000 is rejected; other account types require a balance of zero or more.
- **Traceability:** Use cases!A106:B130, UC-06 Basic Flow 3, 5, 7-8, UC-06 EF-1 and EF-3

### Business Rule: BR-ACC-16

- **Name:** Financial capacity proof for Investment accounts
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AccountService::create(
  userId : Integer,
  dto : CreateAccountDto
) : AccountResponseDto

pre BR_ACC_16_InvestmentCapacity:
  dto.account_type = 'Investment' implies
    Account.allInstances()
      ->select(a | a.user_id = userId and (a.account_type = 'Checking' or a.account_type = 'Savings'))
      ->collect(balance)
      ->sum() >= 100000
      
Technical constraint:
- If a user attempts to create an 'Investment' account, the backend must query the user's existing accounts.
- The creation is only allowed if the sum of the balances of all the user's existing 'Checking' and 'Savings' accounts is greater than or equal to 100,000.
- If the user does not meet this financial capacity requirement, the request must be rejected.
- **Context:** AccountService::create(userId : Integer, dto : CreateAccountDto) : AccountResponseDto
- **Enforcement layer:** backend, database
- **Failure behavior:** Investment account creation is rejected unless the authenticated user's existing Checking and Savings account balances total at least 100,000.
- **Traceability:** Use cases!A106:B130, UC-06 Basic Flow 8, UC-06 POST-3

Preserve every Rule ID, OCL expression and authoritative natural-language constraint exactly.

Prompts A and D must reference applicable Rule IDs without redefining them. Backend/database enforcement remains authoritative across trust boundaries; frontend enforcement is an additional user-experience control.

Do not invent missing thresholds, statuses, ownership, schema, enforcement layers or failure behavior. Record unresolved source information and stop for the researcher when it changes implementation.

## Prompt F: Implementation Context

Use every prompt present in this approved artifact together with:

- `PROJECT_CONTEXT.md`, repository instructions, target manifests, and lockfiles;
- frozen UC `docs/01-inception/use-cases/uc-06-add-bank-account.md` and API contract `docs/01-inception/api-contracts/API-ACCOUNT-CREATE.md`;
- frozen Business Rule resource `docs/02-construction/business-rules/UC-06-business-rules.json` and baseline `docs/02-construction/implementation/UC-06/business-rule-baseline.json`;
- researcher-approved database contract `docs/02-construction/implementation/UC-06/schema.json`;
- checksum-valid Figma dataset `2026-08-29-005`, node `4795:3`, under `resource/figma-design-dataset/2026-08-29-005/nodes/4795-3`;
- existing React/Tailwind, Axios, React Router, NestJS, TypeORM, JWT, validation, Swagger, and normalized-response conventions in `finalsource/fe` and `finalsource/be`.

Priority:

1. Requirements explicitly present in this approved prompt
2. Approved API and database/project contracts
3. Frozen Figma evidence
4. Existing source-code conventions

If an existing implementation conflicts with a higher-priority source, apply the smallest source-backed correction. Preserve JWT-derived ownership, safe error envelopes, `account_number_full` non-disclosure, transaction/concurrency behavior, and the approved owner-scoped uniqueness constraint. Treat the Figma example values as visual evidence only, not hardcoded defaults except for the UC-required `Checking` account-type default.

Generate source only. Modify only files required by UC-06. Do not create or run tests or test cases. Do not introduce unapproved schema, public API, ownership, dependency, or destructive changes.
