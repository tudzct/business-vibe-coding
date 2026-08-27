# UC-06: Add a new account

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
Add a new bank account

Description:
- Allows logged-in users to link and add information about a new bank account or e-wallet to the system for financial tracking and management.

Primary Actor: 
User

Preconditions:
- Users must log in.
- The user is currently accessing the "Account" page.

Postconditions:
- Success: The new account is saved to the system, and the user is redirected to the account list page or confirmation page.
- Failure: An error message about invalid data or a system error is displayed, and the user remains on the Add Account screen.

Main Flow:
1. Users access the "Account" page and click "Add account".
2. The user enters the new account information: Bank/Wallet Name, Account Type, Account Number, Branch (optional), Initial Balance.
3. Press the "Add account" or "Save" button.
4. The front-end sends data to the backend API.
5. The backend verifies the access_token and extracts the user_id.
6. The backend validates the input data.
7. If valid, the backend saves the new account information to the Accounts table, associated with user_id.
8. The backend returns the details of the newly created account.
9. The front-end displays a success message and redirects the user to the View Account List page.

Alternative Flow:

A.1 — Invalid input data
- If any data field violates the verification rule (e.g., negative balance, blank bank name): display a detailed error message next to the faulty field and keep the user on the Add Account screen.

A.2 — Duplicate Account Number Error
- If the account number already exists with the user: display the message "This account already exists in your list."

Exception Flow:

E.1 — Backend system errors
- If an error occurs during the data saving process: display the message "Unable to add account at this time. Please try again later."

UI Integration:
The design is compatible with the Bank Account page interface, with a new add form including: Bank_name, Account_type, Branch_name, Full account number, and Initial balance.

API Endpoint:
POST /api/v1/accounts

Request Body:
{
  "bank_name": "TPBank", 
  "account_type": "Checking", 
  "branch_name": "District 4", 
  "account_number_full": "9704221122334455667", 
  "balance": 2500000
}

Successful Response:
{
  "message": "Account created successfully", 
  "account": { 
    "id": 9, 
    "user_id": 1, 
    "bank_name": "TPBank", 
    "account_type": "Checking", 
    "branch_name": "District 4", 
    "account_number_last_4": "5667", 
    "balance": 2500000
  }
}

Error Response:
{
  "statusCode": 409,
  "message": "This account already exists in your list."
}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server error handling for the account adding functionality.

Required project behavior:

- Create a POST endpoint /api/v1/accounts in NestJS AccountsController.
- This endpoint must be protected by JwtAuthGuard.

REQUEST FORMAT:
{
  "bank_name": "TPBank", 
  "account_type": "Checking", 
  "branch_name": "District 4", 
  "account_number_full": "9704221122334455667", 
  "balance": 2500000
}

Processing Logic:
- Get the DTO containing account data and user_id from request.user (JwtAuthGuard).
- Use ValidationPipe to validate DTOs: bank_name cannot be empty, account_number_full cannot be empty, balance must be a number and >= 0.
- Check if account_number_full already exists for this user.
- If valid and not a duplicate, save the new account information to the Accounts table associated with user_id.
- Returns the newly created account object.

SUCCESS RESPONSE FORMAT:
{
  "message": "Account created successfully", 
  "account": { 
    "id": 9, 
    "user_id": 1, 
    "bank_name": "TPBank", 
    "account_type": "Checking", 
    "branch_name": "District 4", 
    "account_number_last_4": "5667", 
    "balance": 2500000
  }
}

Error Handling:
- Invalid data: ValidationPipe automatically throws BadRequestException (400).
- Duplicate account number: throw ConflictException (409) with {"statusCode": 409, "message": "This account already exists in your list."}
- Error saving to database: throw InternalServerErrorException(500) with {"statusCode": 500, "message": "Unable to add account at this time. Please try again later."}

### Frontend UI Context

Implementation objective:
To build an account addition interface that accurately matches the design.

Required project behavior:

The component must display:
- Create the AddAccountForm component using React TypeScript and Tailwind CSS.
- This component should display a form with the following fields: Bank (bank_name), Account Type (account_type), Branch (branch_name, optional), Full Account Number, Initial Balance (balance, number), and an Add Account button.

Strictly follow the Figma MCP design at the following reference:
Strict design according to Figma MCP: layout, font, and colors match the design 100%.

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and successfully handle the workflow.

Required project behavior:

Add the required state variables:
- In the AddAccountForm component: Create state for the form fields: bank_name, account_type, branch_name, account_number_full, balance.

REQUEST CONTENT:
- Implement the asynchronous handleSubmit function to send a request to POST /api/v1/accounts with a payload from the state.

After a successful response:
- Display the toast message: "Account added successfully".
- Redirect the user to the account list page (/accounts).
- (Optional) Update the global state to add new accounts without reloading the page.

### Validation and Error-Handling Context

Implementation objective:
To improve error handling, Loading status, and FE validation.

Required project behavior:

Loading State:
- Add the state 'isLoading'.
- When submitting, set isLoading = true and disable the 'Add Account' button.
- After the API is complete, set isLoading = false again.

API Error Handling:
- 409 Conflict: "This account already exists in your list."
- 500 Internal Server Error: "Unable to add account at this time. Please try again later."
- 400 Validation Error: Displays a detailed message below the faulty input field.

Client-side Validation:
- Before calling the API: The 'Bank' and 'Account Number' fields cannot be left blank.
- 'Initial balance' must be a number and >= 0.
