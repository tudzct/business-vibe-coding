# UC-05: View list of bank accounts

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
View a list of bank accounts.

Description:
- Allows logged-in users to access and view a list of all bank accounts or e-wallets they have linked to the system, including details such as balances and account types.

Primary Actor: 
User

Preconditions:
- Users must be logged in (possessing a valid access token).
- The user has linked at least one bank account/e-wallet.

Postconditions:
- Success: The system displays a complete list of the user's accounts on the "Bank Accounts" page.
- Failure: The system displays an error message (e.g., access error, no data) and the user remains on the "Bank Account" page or is redirected to the error message page.

Main Flow:
1. The user is logged in and has a valid access token.
2. Users access the "Bank Account" page.
3. The front-end system calls the back-end API.
4. The backend verifies the access_token and extracts the user_id.
5. The backend queries the Accounts table based on user_id.
6. The backend returns a list of accounts (Bank, Account Type, Branch, Account Number, Balance).
7. The front-end receives the data and displays a detailed list of accounts.

Alternative Flow:

A.1 — No linked account
- If the returned list is empty: display the message "You haven't linked any accounts. Please add an account," and provide a button to add a new account.

Exception Flow:

E.1 — Authentication Error / Access Error
- If the access_token is invalid or expired: return an HTTP 401 error, redirect the user to the Login page, and display a message requesting them to log in again.

E.2 — Backend System Errors
- If a database query or internal processing error occurs: display a friendly error message "A system error has occurred, please try again later."

UI Integration:
Strict design based on Figma MCP: layout, colors, and fonts match 100%.
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5320&t=cxgXQfkGoLMfxW48-4

API Endpoint:
GET /api/v1/accounts

Request Body:
Authorization: Bearer <access_token>

Successful Response:
{
  "user_id": 1,
  "accounts": [
    {
      "id": 1,
      "bank_name": "Vietcombank",
      "account_type": "Checking",
      "branch_name": "District 1",
      "account_number_last_4": "0123",
      "balance": 4000000
    },
    {
      "id": 2,
      "bank_name": "Techcombank",
      "account_type": "Savings",
      "branch_name": "District 3",
      "account_number_last_4": "0987",
      "balance": 4000000
    }
  ]
}

Error Response:
{
  "statusCode": 500,
  "message": "A system error has occurred, please try again later."
}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build an API service, business logic, and server error handling for the function of retrieving a list of accounts.

Required project behavior:

- Create a GET endpoint /api/v1/accounts in NestJS AccountsController.
- This endpoint must be protected by JwtAuthGuard.

REQUEST FORMAT:
- No request body.
- User information is retrieved from access_token.

Processing Logic:
- Get user_id from JWT payload.
- Query the database to find all accounts with the corresponding user_id.
- Returns a list of accounts.
- If no account is found, returns an empty array.

SUCCESS RESPONSE FORMAT:
{
  "user_id": 1,
  "accounts": [
    {
      "id": 1,
      "bank_name": "Vietcombank",
      "account_type": "Checking",
      "branch_name": "District 1",
      "account_number_last_4": "0123",
      "balance": 4000000
    }
  ]
}

Error Handling:
- Query error or other server error: throw InternalServerErrorException with { "statusCode": 500, "message": "A system error has occurred, please try again later." }.
- If the access_token is invalid or expired, JwtAuthGuard will automatically throw an Unauthorized Exception (HTTP 401).

### Frontend UI Context

Implementation objective:
To build an account list interface based on Figma's design.

Required project behavior:

The component must display:
- Create the AccountListPage component using React TypeScript and Tailwind CSS.
- The interface displays a list of cards, each card showing the following information: Bank name, Account type, Balance, and the last four digits of the account number.

Strictly follow the Figma MCP design at the following reference:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5320&t=cxgXQfkGoLMfxW48-4

Ensure that the layout, visual structure, typography, spacing, and colors match the referenced design.

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and successfully handle the workflow.

Required project behavior:

Add the required state variables:
- In AccountListPage, add state: accounts to save the list of accounts, isLoading for the loading status, and error to save the error message.

REQUEST CONTENT:
- Implement the asynchronous fetchAccounts function.
- Send request: GET /api/v1/accounts with header: Authorization: Bearer <access_token>.

After a successful response:
- If successful, update the state: accounts = response.accounts, isLoading = false, Delete the old error message.
- If the accounts array is empty, display a message to the user.

### Validation and Error-Handling Context

Implementation objective:
To improve error handling, loading status, and FE validation.

Required project behavior:

Loading State:
- When isLoading = true, display Spinner or Skeleton Loader instead of the account list.

API Error Handling:
- 401 Unauthorized: redirects the user to the Login page.
- Server error (500): displays the message: "A system error has occurred, please try again later."
- Successful but empty list: displays the message "You haven't linked any accounts. Please add an account," along with a button/link to the add account page.

Client-side Validation:
- Not applicable, as this is a data viewing use case, not a user input form.
