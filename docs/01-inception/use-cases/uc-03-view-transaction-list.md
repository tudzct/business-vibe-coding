# UC-03: View the list of transactions

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
View the list of transactions.

Description:
- Allows users to view a list of completed transactions (Income and Expenses).
- Display the following information: item name, store, transaction date, payment method, and amount.

Primary Actor: 
User

Preconditions:
- The user is logged in.
- The user has made at least one transaction.

Postconditions:
- Success: The list of transactions is displayed (can be filtered or paginated).
- Failure: Displays an error message or no data.

Main Flow:
1. Users access the Transactions page via the sidebar (/transactions).
2. The system displays the "All" tab by default.
3. The front-end calls the API.
4. The backend verifies the access_token and retrieves the user_id.
5. The backend queries transactions by user_id, sorts them in descending order by date, and applies pagination.
6. The backend returns a list of transactions.
7. The front-end displays a list with the following columns: Items, Shop Name, Date, Payment Method, and Amount.

Alternative Flow:

A.1 — Filter by Income/Expenses
- Users select Revenue or Expenses, and the system returns a filtered list.

A.2 — Loading more data
- Users scroll down or select "Load More", the system increases the offset and loads more transactions.

A.3 — No transactions recorded
- If the list is empty, display "You have no transactions recorded."

Exception Flow:

E.1 — Authentication or query error
- Backend returned error (401, 500).
- The front-end displays an error message and fails to load the list.

UI Integration:
The design must match the Figma MCP template 100%:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5474

API Endpoint:
GET /api/v1/transactions

Query Parameters:
- type: "All", "Revenue", or "Expense" (required)
- limit: Number of records to retrieve at each time (default 10)
- offset: Starting position (default 0, serving paging)

Successful Response:
{
  "data": [
    {
      "transactionId": 1,
      "accountId": 3,
      "transactionDate": "2023-05-17T00:00:00Z",
      "type": "Expense",
      "itemDescription": "GTR 5",
      "shopName": "Gadget & Gear",
      "amount": 160.00,
      "paymentMethod": "Credit Card",
      "status": "Complete",
      "receiptId": null,
      "createdAt": "2023-05-17T08:12:00Z"
    },
    {
      "transactionId": 2,
      "accountId": 3,
      "transactionDate": "2023-05-17T00:00:00Z",
      "type": "Expense",
      "itemDescription": "Polo Shirt",
      "shopName": "XL Fashions",
      "amount": 20.00,
      "paymentMethod": "Credit Card",
      "status": "Complete",
      "receiptId": null,
      "createdAt": "2023-05-17T08:12:00Z"
    }
  ],
  "total": 2,
  "hasMore": false
}

Error Response:
{ "message": "Invalid type parameter" }


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build an API service, business logic, and server error handling for the transaction list retrieval function.

Required project behavior:

- Create a GET endpoint at /api/v1/transactions in TransactionsController.
- This endpoint must be protected by JwtAuthGuard.

REQUEST FORMAT:
Query Parameters:
- type: "All", "Revenue", or "Expense" (required)
- limit: number (default: 10)
- offset: number (default: 0)

Processing Logic:
- Get the user_id from the authenticated request.
- Receive query parameters: type, limit, offset.
- Check that the type is one of: "All", "Revenue", "Expense".
- Build a query to retrieve transactions based on user_id.
- If the type is "Revenue" or "Expense", add a filtering condition.
- Sort by transactionDate in descending order.
- Apply paging: limit, offset.
- Returns a list of transactions, the total number of records, and the hasMore value.

SUCCESS RESPONSE FORMAT:
{
  "data": [
    {
      "transactionId": 1,
      "accountId": 3,
      "transactionDate": "2023-05-17T00:00:00Z",
      "type": "Expense",
      "itemDescription": "GTR 5",
      "shopName": "Gadget & Gear",
      "amount": 160.00,
      "paymentMethod": "Credit Card",
      "status": "Complete",
      "receiptId": null,
      "createdAt": "2023-05-17T08:12:00Z"
    }
  ],
  "total": 1,
  "hasMore": false
}

Error Handling:
- { "message": "Invalid type parameter" }

### Frontend UI Context

Implementation objective:
To build a transaction list interface that matches the Figma design.

Required project behavior:

The component must display:
- Create TransactionsPage component using React TypeScript and Tailwind CSS.
- Title of the Transactions page.
- Three tabs: All, Revenue, Expense (the selected tab must have a prominent style).
- The table or list displays transactions with the following columns: Items, Shop Name, Date, Payment Method, Amount.
- Icons illustrate each transaction.
- Load More button (displayed when there is still data).
- The message is empty: "You have no transactions yet."

Strictly follow the Figma MCP design at the following reference:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5474

Ensure that the layout, visual structure, typography, spacing, and colors match the referenced design.

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and handle the transaction data reception flow.

Required project behavior:

Add the required state variables:
- transactions: Transaction[]
- activeTab: 'All' | 'Revenue' | 'Expense'
- pagination: {offset, limit, hasMore }
- isLoading: boolean
- error: string | null

REQUEST CONTENT:
- Implement the fetchTransactions (loadMore = false) function to call the API.
- Call the API whenever the activeTab changes.

After a successful response:
- If loadMore = true: append the data to the old array.
- If false: replace the entire list.
- Update pagination.

### Validation and Error-Handling Context

Implementation objective:
To improve error handling, loading, and list status display.

Required project behavior:

Loading State:
- When calling the API, enable isLoading.
- While loading, display Spinner/Skeleton instead of a list.

API Error Handling:
- In the catch block, set error = "Could not load transaction list. Please try again."
- Display the error instead of the list.
- No data: If the transactions tab is empty and not loading, display: "You have no transactions for the active Tab".

Client-side Validation:
- Not applicable as there is no data entry form.
