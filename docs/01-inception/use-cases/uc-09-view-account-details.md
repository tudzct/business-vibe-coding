# UC-09: View Bank Account Details

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
View bank account details

Description:
- Allows users to view all the details of a specific bank account or e-wallet, including basic account information and a list of the most recent transactions.

Primary Actor: 
User

Preconditions:
- Users must log in.
- The account whose details need to be viewed must exist and be owned by the current user.

Postconditions:
- Success: Displays the account details page, including basic information and a list of recent transactions.
- Failure: An error message is displayed, the user remains on the previous page, or is redirected to the account list.

Main Flow:
1. Users access the "Bank Accounts" page (list of accounts).
2. Users select an account and press the "Details" button.
3. Front-end calls backend API.
4. The backend verifies the access_token and extracts the user_id.
5. The backend checks account ownership.
6. The backend queries account details and the 5 most recent transactions.
7. The backend returns account details and a list of transactions.
8. The front-end displays the account details page on the interface.

Alternative Flow:

A.1 — Account not found (invalid ID)
- The backend returns a Not Found (HTTP 404) error.
- The front-end displays the message "This account was not found" and redirects the user to the account list page.

A.2 — Accounts with no transactions
- If the transaction list is empty, display the normal details and the message "No transactions have been recorded for this account."

A.3 — Authorization error (no viewing permission)
- If the account is not owned by user_id: The backend returns a Forbidden (HTTP 403) error.
- The front-end displays the message "You do not have permission to view this account information."

Exception Flow:
(Exception flows are managed via Alternative Flows above)

UI Integration:
Strict design based on Figma MCP:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=416-7878&t=cxgXQfkGoLMfxW48-4

API Endpoint:
GET /api/v1/accounts/:id

Request Body:
Header: Authorization: Bearer <access_token>

Successful Response:
{
  "id": 1, 
  "bank_name": "Vietcombank", 
  "account_type": "Checking", 
  "branch_name": "District 1", 
  "account_number_full": "9704221234567890123", 
  "Balance": 5200000, 
  "recent_transactions": [
    {
      "date": "2025-10-31", 
      "amount": -500000, 
      "description": "Transfer from Momo", 
      "status": "Complete", 
      "receipt_id": "RCP001", 
      "type": "Expense"
    }, 
    {
      "date": "2025-10-30", 
      "amount": 1000000, 
      "description": "Transfer from Momo", 
      "status": "Complete", 
      "receipt_id": "RCP002", 
      "type": "Expense"
    }
  ]
}

Error Response:
{
  "statusCode": 404, 
  "message": "This account was not found.", 
  "error": "Not Found"
}
{
  "statusCode": 403, 
  "message": "You do not have permission to view this account information.", 
  "error": "Forbidden"
}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server error handling.

Required project behavior:

- Endpoint GET /api/v1/accounts/:id protected by JwtAuthGuard.

REQUEST FORMAT:
Header: Authorization: Bearer <access_token>

Processing Logic:
- Get accountId from path param and userId from req.user (JwtAuthGuard).
- Query the database to find the account by accountId.
- If the account is not found, throw a NotFoundException.
- Check ownership: if account.userId !== userId, throw ForbiddenException.
- If verification is successful, query the 5 most recent transactions related to accountId.
- Combine account information and transaction list into a single object and return it.

SUCCESS RESPONSE FORMAT:
{
  "id": 1, 
  "bank_name": "Vietcombank", 
  "account_type": "Checking", 
  "branch_name": "District 1", 
  "account_number_full": "9704221234567890123", 
  "Balance": 5200000, 
  "recent_transactions": [
    {
      "date": "2025-10-31", 
      "amount": -500000, 
      "description": "Transfer from Momo", 
      "status": "Complete", 
      "receipt_id": "RCP001", 
      "type": "Expense"
    }
  ]
}

Error Handling:
- Account not found: NotFoundException (404) {"statusCode": 404, "message": "This account was not found.", "error": "Not Found"}
- The account is not owned by the user: ForbiddenException (403) {"statusCode": 403, "message": "You do not have permission to view this account information.", "error": "Forbidden"}

### Frontend UI Context

Implementation objective:
To build the user interface accurately according to Figma's design.

Required project behavior:

The component must display:
- Create the AccountDetail Component using React TypeScript and Tailwind CSS, including:
- The card section displays detailed account information: bank name, balance, account type, branch, and full account number.
- The table or list area displays the 5 most recent transactions with the following columns: Date, Description, Amount, Status.

Strictly follow the Figma MCP design at the following reference:
STRICTLY designed according to Figma MCP:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=416-7878&t=cxgXQfkGoLMfxW48-4

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and successfully handle the workflow.

Required project behavior:

Add the required state variables:
- In AccountDetailComponent: Add state: accountData, isLoading, error.

REQUEST CONTENT:
- Implement the asynchronous function fetchAccountDetails (accountId) to send a GET request /api/v1/accounts/:id with the Authorization header.

After a successful response:
- When the API returns a success message: Call setAccountData(responseData), Set setIsLoading(false), Clear the old error message: setError(null)

### Validation and Error-Handling Context

Implementation objective:
To improve error handling, loading status, and information display.

Required project behavior:

Loading State:
- Before calling the API, setIsLoading(true).
- When isLoading = true, display a Spinner or Skeleton instead of content.

API Error Handling:
- Wrap the API in a try...catch block.
- Display the error message based on the status code.
- 404: "This account was not found."
- 403: "You do not have permission to view this account information."
- Other errors: "An error occurred, data could not be loaded."
- If the transaction array is empty, display: "No transactions have been recorded for this account."

Client-side Validation:
- No input validation required.
