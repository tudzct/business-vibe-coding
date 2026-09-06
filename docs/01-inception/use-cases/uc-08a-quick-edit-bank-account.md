---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-08a
uc_name: "Quick edit a bank account"
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "Use cases"
source_range: "A180:B196"
retrieved_at: 2026-08-27T03:49:28.570Z
---

## UC-08a UI Variant: Quick Edit Bank Account

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab Use cases, columns A-B. This frozen repository projection is read-only; source corrections must be made in the spreadsheet and imported as a new revision.

This variant is part of UC-08, reuses its backend operation and Business Rules, and does not create a separate experiment run.

## Functional Use-Case Specification

### Use Case ID

UC-08a

### Use Case Name

Quick edit a Bank Account

### Description

As an authenticated account owner, I want to quickly enter an edit mode directly from the Accounts page to modify account details without navigating to the account detail page.

### Actor(s)

Authenticated User

### Priority

Medium

### Trigger

The user selects "Edit Accounts" on the Account List (Balances) page.

### Pre-Condition(s)

PRE-1: The user is authenticated.
PRE-2: The account exists and is owned by the authenticated user.
PRE-3: Account details have been loaded.
PRE-4: The Accounts page has been loaded and displays at least one account card.

### Post-Condition(s)

POST-1: On success, the account fields are overwritten with the submitted values.
POST-2: The final four characters of the account identifier are derived automatically by the system.
POST-3: On success, the system displays a success toast notification ("Update successful"), waits 1500 ms, closes the edit form, and reloads the account details to reflect the updated data.
POST-4: On failure, the stored account remains unchanged by the failed request.

### Basic Flow

1. The user opens /accounts and selects ""Edit Accounts"".
2. The frontend switches the Accounts page into Edit Mode, displaying a pencil icon on each account card.
3. The user selects the pencil icon for a specific account.
4. AccountEditForm is loaded and populated from the loaded account card data.
5. The user changes bank_name, account_type, optional branch_name, account_number_full, or balance.
6. The user selects Save Changes.
7. The frontend validates all required fields, including format structure and domain constraints.
8. The frontend sends PUT /api/v1/accounts/:id with all update fields (excluding account_number_last_4).
9. The controller validates that id parses to an integer.
10. AccountService verifies that the account exists and belongs to userId.
11. ValidationPipe and AccountService validate the submitted fields.
12. AccountService derives account_number_last_4, overwrites the account fields, and saves the row.
13. The frontend displays a success toast, waits 1500ms, and invokes its success callback; the Accounts page reloads account data and exits edit mode.

### Alternative Flow

AF-1: Cancel Edit Mode
2a. The user toggles ""Edit Accounts"" again to exit edit mode.
2b. The frontend hides the pencil icons and exits edit mode.

AF-2: Optional branch omitted
5a. The user clears branch_name.
12a. The backend stores branchName as undefined/null.

AF-3: Cancel Form
6a. The user selects Cancel on the AccountEditForm.
6b. The frontend closes the form without sending an update request, and the Accounts page remains in Edit Mode.

### Exception Flow

Identical to UC-08 (EF-1 through EF-4)

### Related UI

AccountDetailPage; AccountEditForm; route /accounts/:id

### Related API IDs

API-ACCOUNT-UPDATE

### Notes

Rationale: This is a UI-level quick-edit variant of UC-08. It reuses the UC-08 account-update API and renders AccountEditForm within AccountListPage; no separate backend operation is required.

## UML Model

Identical to UC-08

## Business Rules

The following rules are authoritative for Prompt E. OCL is preserved where supplied; technical or non-OCL constraints remain authoritative natural-language requirements.

Identical to UC-08 (BR-ACC-19 through BR-ACC-26).

## Source Discrepancy

The spreadsheet section heading identifies this record as UC-08, but the Use Case ID value cell contains the literal text "Use Case ID". The repository uses UC-08 from the section heading and records this discrepancy without modifying the source spreadsheet.

## UC-08.1 UI Variant: Quick Edit Account

This variant is part of UC-08, reuses its backend operation and Business Rules, and does not create a separate experiment run.

### Use Case ID

UC-08a

### Use Case Name

Quick Edit Account

### Description

As an authenticated account owner, I want to quickly enter an edit mode directly from the Accounts page to modify account details without navigating to the account detail page.

### Actor(s)

Authenticated User

### Priority

Medium

### Trigger

The user selects "Edit Accounts" on the Account List (Balances) page.

### Pre-Condition(s)

PRE-1: The user is authenticated.
PRE-2: The Accounts page has been loaded and displays at least one account card.

### Post-Condition(s)

POST-1: On success, the selected account's fields are overwritten with the submitted values.
POST-2: The final four characters of the account identifier are derived automatically by the system.
POST-3: On success, the system displays a success toast notification (""Update successful""), waits 1500 ms, closes the edit form, and reloads the account list to reflect the updated data.
POST-4: On failure or cancellation, the stored account remains unchanged.

### Basic Flow

1. The user opens /accounts and selects ""Edit Accounts"".
2. The frontend switches the Accounts page into Edit Mode, displaying a pencil icon on each account card.
3. The user selects the pencil icon for a specific account.
4. AccountEditForm is loaded and populated from the loaded account card data.
5. The user changes bank_name, account_type, optional branch_name, account_number_full, or balance.
6. The user selects Save Changes.
7. The frontend validates all required fields, including format structure and domain constraints.
8. The frontend submits the modification payload to the accounts resource.
9. The controller validates that id parses to an integer.
10. AccountService verifies that the account exists and belongs to userId.
11. ValidationPipe and AccountService validate the submitted fields.
12. The system processes the modification, deriving any necessary internal fields, and persists the changes to the ledger.
13. The frontend displays a success toast, waits 1500ms, and invokes its success callback; the Accounts page reloads account data and exits edit mode.

### Alternative Flow

AF-1: Cancel Edit Mode
2a. The user toggles ""Edit Accounts"" again to exit edit mode.
2b. The frontend hides the pencil icons and exits edit mode.

AF-2: Optional branch omitted
5a. The user clears branch_name.
12a. The backend stores branchName as undefined/null.

AF-3: Cancel Form
6a. The user selects Cancel on the AccountEditForm.
6b. The frontend closes the form without sending an update request, and the Accounts page remains in Edit Mode.

### Exception Flow

Identical to UC-08 (EF-1 through EF-4)

### UML Model

Identical to UC-08

### Business Rules

Identical to UC-08 (BR-ACC-19 through BR-ACC-26).

### Related UI

AccountListPage; AccountEditForm; route /accounts

### Related API IDs

API-ACCOUNT-UPDATE

### Notes

Rationale: This is a UI-level quick-edit variant of UC-08. It reuses the UC-08 account-update API and renders AccountEditForm within AccountListPage; no separate backend operation is required.


