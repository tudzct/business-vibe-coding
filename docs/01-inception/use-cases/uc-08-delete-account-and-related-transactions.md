# UC-08: Delete bank account

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
Delete the account information.

Description:
- Allows users to completely remove an unused bank account or e-wallet. This action will permanently delete the account and all transactions recorded through it.

Primary Actor: 
User

Preconditions:
- Users must log in.
- The user is currently on the "My Account" page.
- The account to be deleted must exist and be owned by the user.

Postconditions:
- Success: The account and all related transactions are deleted, and the front-end updates the account list.
- Failure: An error message is displayed; the account and transaction remain unchanged.

Main Flow:
1. Users access the "My Account" page (list of all accounts).
2. Users can click the "Delete" button on a specific account or go to "Account Details" and click "Delete".
3. The system displays a confirmation dialog warning about the permanent deletion of the account and all related transactions.
4. The user confirms they want to delete it.
5. Front-end calls Backend API: DELETE api/v1/accounts/:id.
6. The backend verifies the access_token and extracts the user_id.
7. The backend checks account ownership.
8. If valid, the backend deletes all related transactions from the Transactions table and removes the account from the Accounts table.
9. The backend returns a success response (HTTP 200 OK).
10. The front-end updates the list of displayed accounts (accounts that have just been deleted will disappear).

Alternative Flow:

A.1 — The user cancels the operation
- After the confirmation dialog, if the user clicks "Cancel" or closes the dialog, the deletion operation is canceled and the user remains on the account list page.

A.2 — Authorization error (no delete permission)
- If the account does not belong to user_id: The backend returns a Forbidden (HTTP 403) error, and the frontend displays the error message "You do not have permission to perform this operation."

Exception Flow:

E.1 — Backend System Errors
- If a database error or processing error occurs during deletion, the system rolls back any changes and displays the message "A system error occurred; the account and related transactions could not be deleted."

UI Integration:
Matches the interface of the My Account page.

API Endpoint:
DELETE /api/v1/accounts/:id

Request Body:
None

Successful Response:
{
  "message": "Account deleted successfully", 
  "deleted_account_id": 1
}

Error Response:
{
  "statusCode": 404, 
  "message": "Account not found or not owned by current user"
}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build an API service, business logic, and server error handling for the account deletion function.

Required project behavior:

- Create endpoint DELETE /api/v1/accounts/:id in AccountsController NestJS.
- This endpoint must be protected by JwtAuthGuard.

REQUEST FORMAT:
None

Processing Logic:
- Get accountId from path parameter and userId from request.user (JwtAuthGuard).
- Find an account in the database by accountId.
- Check ownership: if the account exists but account.userId !== userId, throw an error.
- Perform a deletion within a transaction: Delete all related records in the Transactions table with accountId. Next, delete the account record in the Accounts table.
- Returns a successful result.

SUCCESS RESPONSE FORMAT:
{
  "message": "Account deleted successfully", 
  "deleted_account_id": 1
}

Error Handling:
- The account does not exist or is not owned by the user: NotFoundException (404) with JSON: {"statusCode": 404, "message": "Account not found or not owned by current user"}.
- Database error when deleting: InternalServerErrorException (500) with message: "A system error occurred; it was not possible to delete the account and related transactions.".

### Frontend UI Context

Implementation objective:
To build an accurate account deletion confirmation interface based on Figma MCP.

Required project behavior:

The component must display:
- Create a DeleteAccountModal component using React TypeScript and Tailwind CSS.
- Title: "Account Deletion Confirmation"
- Warning icon
- Animated warning message: "WARNING: Are you sure you want to delete account [Bank Name] - [**** Last Digit]? This action will PERMANENTLY delete the account and ALL related transactions."
- Two action buttons: "Cancel" to close the modal, "Confirm Delete" (red) performs the action.

Strictly follow the Figma MCP design at the following reference:
The design adheres strictly to Figma MCP standards, ensuring 100% accuracy in layout, font, color, and spacing.

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and successfully handle the workflow.

Required project behavior:

Add the required state variables:
- In the DeleteAccountModal component: Create management states: isLoading, error.

REQUEST CONTENT:
- Implement the asynchronous handleDeleteAccount(accountId) function to send a DELETE request /api/v1/accounts/:id.

After a successful response:
- Close the DeleteAccountModal modal.
- Display toast/notification: "Account successfully deleted."
- Update the global state or call the 'fetch account list' function again to remove the deleted account from the interface.

### Validation and Error-Handling Context

Implementation objective:
Complete error handling, Loading status, and FE Validation.

Required project behavior:

Loading State:
- Before calling the API, set isLoading = true.
- After the API is complete, set isLoading = false.
- When isLoading = true, disable both buttons and display the spinner on the "Confirm Delete" button.

API Error Handling:
- Catch errors using try...catch and display the exact error message returned from the backend (e.g., 403, 404, 500) directly inside the modal, above the buttons.

Client-side Validation:
- No client input validation is required in this use case.
