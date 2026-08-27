# UC-04: Add a new transaction

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
Add a new transaction

Description:
- Allows users to record a new financial transaction (income or expenses) by providing necessary information such as transaction details, amount, transaction type, and category.

Primary Actor: 
User

Preconditions:
- Users must be logged in.
- Categories must be available for users to choose from.

Postconditions:
- Success: The new transaction is saved to the Transactions table, a success message is displayed, and the transaction list is updated.
- Failure: The system displays an error message corresponding to invalid data, and the user remains on the Add Transaction form.

Main Flow:
1. Users access the Transactions page and click the "Add transaction" button.
2. The system displays an input form with the following fields: Transaction Name, Item Name, Category, Amount, Transaction Type (Revenue / Expense), Payment Account, Transaction Date, and other options (Payment Method / Related Account).
3. Users fill in all the required information on the form.
4. The user clicks the "Save" button.
5. The front-end system sends a request with data to the backend API.
6. The backend system verifies the access_token and extracts the user_id.
7. The backend system checks the validity of the input data. (Transaction name must not be blank, Amount > 0, Transaction type is valid, Category exists, Account belongs to user_id).
8. If valid, save the new transaction to the Transactions table and update the related account balance.
9. The backend returns a success response.
10. The front-end receives the response and displays the message "Transaction added successfully."
11. The front-end refreshes the transaction list or redirects back to the /transactions page.

Alternative Flow:

A.1 — Invalid data
- After step 7, the main flow.
- If data is missing or incorrectly formatted, display the corresponding error next to the input field.
- The user remains on the Add Transaction form.

A.2 — Invalid account
- If the payment account does not belong to user_id or the balance is insufficient: display an error message.
- The user remains on the Add Transaction form.

Exception Flow:
(Exception flows are managed via Alternative Flows above)

UI Integration:
The add transaction form has a layout similar to the overall style of the Transactions page (using rounded corners, input fields with faint borders, and a blue Save button). The fields are arranged vertically and have clear labels. The Cancel button returns to the /transactions page.

API Endpoint:
POST /api/v1/transactions

Request Body:
{
  "accountId": 3, 
  "transaction Date": "2023-05-17T00:00:00Z", 
  "type": "Expense", 
  "itemDescription": "Movie Ticket", 
  "category_id": 3, 
  "shopName": "Inox", 
  "amount": 150000, 
  "paymentMethod": "Credit Card", 
  "status": "Complete"
}

Successful Response:
{
  "message": "Transaction created successfully", 
  "data": {
    "transactionId": 8, 
    "accountId": 3, 
    "transactionDate": "2023-05-17T00:00:00Z", 
    "type": "Expense", 
    "itemDescription": "Movie Ticket", 
    "shopName": "Inox", 
    "amount": 150000, 
    "paymentMethod": "Credit Card", 
    "status": "Complete", 
    "receiptId": null, 
    "createdAt": "2023-05-17T08:12:00Z", 
    "category_id": 3
  }
}

Error Response:
{"message": "Invalid or missing transaction data"}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server error handling for the transaction adding functionality.

Required project behavior:

- Create a POST endpoint /api/v1/transactions in the NestJS Transactions Controller.
- This endpoint must be protected by JwtAuthGuard.

REQUEST FORMAT:
{
  "accountId": 3, 
  "transaction Date": "2023-05-17T00:00:00Z", 
  "type": "Expense", 
  "itemDescription": "Movie Ticket", 
  "category_id": 3, 
  "shopName": "Inox", 
  "amount": 150000, 
  "paymentMethod": "Credit Card", 
  "status": "Complete"
}

Processing Logic:
- Receive transaction data (DTO) and user_id from JwtAuthGuard.
- Check the validity of the data: item Description cannot be empty, The amount must be greater than 0, The type must be 'Revenue' or 'Expense', The category_id must exist and be owned by the user.
- Check if accountId belongs to user_id.
- Check your account balance if the transaction type is 'Expense'.
- Perform transactions in the database: Save the new transaction to the Transactions table. Update the balances in the Accounts table by transaction type. Commit the transaction if successful.

SUCCESS RESPONSE FORMAT:
{
  "message": "Transaction created successfully", 
  "data": {
    "transactionId": 8, 
    "accountId": 3, 
    "transactionDate": "2023-05-17T00:00:00Z", 
    "type": "Expense", 
    "itemDescription": "Movie Ticket", 
    "shopName": "Inox", 
    "amount": 150000, 
    "paymentMethod": "Credit Card", 
    "status": "Complete", 
    "receiptId": null, 
    "createdAt": "2023-05-17T08:12:00Z", 
    "category_id": 3
  }
}

Error Handling:
- If the data is invalid (e.g., amount <= 0, accountId does not exist), throw a BadRequestException with JSON: {"message": "Invalid or missing transaction data", "statusCode": 400}

### Frontend UI Context

Implementation objective:
To build a user interface for adding new transactions based on the Figma design.

Required project behavior:

The component must display:
- Create AddTransactionForm component using React TypeScript and Tailwind CSS.
- Input for 'Transaction Name' (Transaction Name / Item Description)
- Dropdown/Select options for 'Category'
- Input a number for the 'Amount'
- Radio button or Select for 'Transaction Type' (Type: Revenue / Expense)
- Dropdown/Select for 'Payment Account'
- Input date type for 'Transaction Date'
- The blue 'Save' button
- The 'Cancel' button will take you back to the previous page.

Strictly follow the Figma MCP design at the following reference:
Strict design according to UI Notes: rounded card corners, faint input border, vertical field layout, clear labels.

Ensure that the layout, visual structure, typography, spacing, and colors match the referenced design.

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and successfully handle the workflow.

Required project behavior:

Add the required state variables:
- In AddTransaction Form, add state for the fields: item Description, amount, categoryId, type, accountId, transaction Date, payment Method.

REQUEST CONTENT:
- Implement the asynchronous handleSubmit function to send requests to the POST address in /api/v1/transactions.
- Payload request: {"accountId": 3, "transactionDate": "2023-05-17T00:00:00Z", "type": "Expense", "itemDescription": "Movie Ticket", "category_id": 3, "amount": 150000}

After a successful response:
- Display toast: "Transaction added successfully."
- Reset form
- Navigate to the /transactions page.

### Validation and Error-Handling Context

Implementation objective:
To improve error handling, loading, and client-side validation.

Required project behavior:

Loading State:
- Before calling the API, set isLoading = true.
- While loading, disable the 'Save' button and display the spinner.
- Set isLoading = false after the API is complete.

API Error Handling:
- Use try...catch to catch API errors.
- If it returns 400/422/500, display the toast: "Cannot add transaction at this time. Please try again later."

Client-side Validation:
- Before calling the API, check: 'Transaction Name' must not be empty, 'Amount' > 0, 'Category' and 'Payment Account' must be selected.
- If validation fails, display an error message directly below the input and do not call the API.
