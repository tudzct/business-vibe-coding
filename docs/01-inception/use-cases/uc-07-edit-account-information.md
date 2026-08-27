# UC-07: Edit account

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
Edit account information

Description:
- Allows users to update information fields of an existing bank account or e-wallet, including bank name, account type, branch, or balance, in order to maintain data accuracy within the system.

Primary Actor: 
User

Preconditions:
- Users must log in.
- The account to be edited must exist and be owned by the user.
- The user is currently on the "Account Details" page for that account.

Postconditions:
- Success: Account information has been updated, and a success message has been displayed.
- Failure: An error message about invalid data or a system error is displayed, and the user remains on the editing screen.

Main Flow:
1. Users access the "Bank Account" page.
2. Users select the account they want to edit and click "Details".
3. On the "Account Details" page, click the "Edit" button.
4. The system displays the edit form with the current data.
5. The user modifies the necessary fields (branch_name, account_type, balance, etc.).
6. Press the "Save changes" button.
7. The front-end calls the backend API: PUT /v1/accounts/:id with the modified data.
8. The backend verifies the access_token and extracts the user_id.
9. The backend checks account ownership.
10. The backend checks the validity of the new data (balance >= 0, valid account number).
11. If valid, the backend updates the information in the Accounts table.
12. The backend returns the information that the account has been successfully updated (HTTP 200 OK).
13. The front-end displays a "Update successful" message and updates the account details interface.

Alternative Flow:

A.1 — Invalid input data
- The backend returns a Bad Request (HTTP 400) error with details.
- The front-end displays an error message below the faulty field.
- The user remains on the editing screen to make corrections.

A.2 — Authorization error (no editing permission)
- If the account is not owned by user_id: The backend returns a Forbidden (HTTP 403) error.
- The front-end displays the message "You do not have permission to edit this account information."

Exception Flow:

E.1 — Backend system error
- If an error occurs while updating the database: display the message "An error occurred while saving data. Please try again later."

UI Integration:
Suitable for the Account Details page interface, the form design includes fields for filling in information to be edited: Bank, Account Type, Branch, Full Account Number, Current Balance (VND), [Cancel] [Save Changes].

API Endpoint:
PUT /api/v1/accounts/:id

Request Body:
{
  "bank_name": "Vietcombank", 
  "account_type": "Checking", 
  "branch_name": "District 3", 
  "account_number_full": "9704221234567890123", 
  "account_number_last_4": "0123", 
  "balance": 4500000
}

Successful Response:
{
  "message": "Account updated successfully", 
  "account": { 
    "account_id": 1, 
    "user_id": 1, 
    "bank_name": "Vietcombank", 
    "account_type": "Checking", 
    "branch_name": "District 3", 
    "account_number_full": "9704221234567890123", 
    "account_number_last_4": "0123", 
    "balance": 4500000, 
    "updated_at": "2025-11-01T15:25:00.000Z"
  }
}

Error Response:
{
  "statusCode": 400,
  "message": ["balance must not be less than 0"],
  "error": "Bad Request"
}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server-side error handling for account editing functionality.

Required project behavior:

- Create endpoint PUT /api/v1/accounts/:id in AccountsController NestJS.
- This endpoint must be protected by JwtAuthGuard.

REQUEST FORMAT:
{
  "bank_name": "Vietcombank", 
  "account_type": "Checking", 
  "branch_name": "District 3", 
  "account_number_full": "9704221234567890123", 
  "account_number_last_4": "0123", 
  "balance": 4500000
}

Processing Logic:
- Extract user_id from request.user (JwtAuthGuard).
- Search for the bank account by :id. If not found, throw a NotFoundException.
- Verify ownership: check account.user_id === user_id.
- Data Input Validation (DTO): Required fields must not be empty, balance >= 0.
- Update account information in the database.
- Returns the updated account object.

SUCCESS RESPONSE FORMAT:
{
  "message": "Account updated successfully", 
  "account": { 
    "account_id": 1, 
    "user_id": 1, 
    "bank_name": "Vietcombank", 
    "account_type": "Checking", 
    "branch_name": "District 3", 
    "account_number_full": "9704221234567890123", 
    "account_number_last_4": "0123", 
    "balance": 4500000, 
    "updated_at": "2025-11-01T15:25:00.000Z"
  }
}

Error Handling:
- Invalid data: BadRequestException (400) with { "statusCode": 400, "message": ["balance must not be less than 0"], "error": "Bad Request" }.
- User does not own the account: ForbiddenException (403) with {"statusCode": 403, "message": "You do not have permission to edit this account information.", "error": "Forbidden" }.
- Database update error: InternalServerErrorException (500) with {"statusCode": 500, "message": "An error occurred while saving the data. Please try again later.", "error": "Internal Server Error" }.

### Frontend UI Context

Implementation objective:
To build an account editing interface that accurately matches the design.

Required project behavior:

The component must display:
- Create the AccountEditForm component using React TypeScript and Tailwind CSS.
- Title: Edit [Bank Name] Account.
- The form includes the following fields: Bank, Account Type, Branch, Full Account Number, Current Balance.
- Two buttons: Cancel and Save Changes.

Strictly follow the Figma MCP design at the following reference:
Strict design according to Figma MCP, ensuring 100% accuracy in layout, spacing, and color.

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and successfully handle the workflow.

Required project behavior:

Add the required state variables:
- In the AccountEditForm component: Create state to manage form data: formData, isLoading, error.

REQUEST CONTENT:
- Implement the asynchronous handleSaveChanges function to send a PUT request /api/v1/accounts/:id with a payload from the state.

After a successful response:
- Display the toast message: "Update successful".
- Update the account details state with the newly received data.
- Close the edit form/modal.

### Validation and Error-Handling Context

Implementation objective:
To improve error handling, Loading status, and FE validation.

Required project behavior:

Loading State:
- When isLoading = true, disable the 'Save changes' button and display the spinner.

API Error Handling:
- 400 (Bad Request): Displays an API error message directly below the input field.
- 403 (Forbidden): toast "You do not have permission to edit this account information."
- 500 (Server Error): toast "An error occurred while saving data. Please try again later."

Client-side Validation:
- The 'Bank' and 'Account Type' fields cannot be left blank.
- 'Current balance' must be a number and >= 0.
