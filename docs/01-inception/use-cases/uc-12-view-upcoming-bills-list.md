# UC-12: View Upcoming Invoices List

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
View the list of upcoming bills.

Description:
- Allows users to track and manage upcoming recurring bills, helping them proactively prepare their finances and avoid late payments.

Primary Actor: 
User

Preconditions:
- Users must log in.
- The user has set up at least one recurring invoice that is due soon.

Postconditions:
- Success: Displaying a list of upcoming invoices on the Invoices page.
- Failure: Displays an error message or a message indicating no upcoming invoice.

Main Flow:
1. Users access the Bills page through the navigation menu.
2. The front-end calls the backend API to retrieve a list of upcoming invoices (GET /api/v1/bills).
3. The backend verifies the access_token and extracts the user_id.
4. The backend queries a list of recurring invoices belonging to user_id with due dates in the near future.
5. The list of invoices is sorted by due date in ascending order (due date ASC).
6. The backend returns a list of invoices, including: Package name, Provider logo, Description, Due date, Final payment date, and Amount.
7. The front-end receives the data and displays a list of invoices with full details and corresponding logos.

Alternative Flow:

A.1 — No bills due soon
- If the returned invoice list is empty: display a message "You don't have any bills due soon."
- Provide a link for the user to set up a new invoice.

Exception Flow:

E.1 — System error / access error
- If authentication or data query errors occur: The backend returns an error (HTTP 401, HTTP 500), the frontend displays a general error message and does not show the invoice list.

UI Integration:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5609

API Endpoint:
GET /api/v1/bills

Request Body:
Header: Authorization: Bearer <access_token>
Request Body: None (GET request)

Successful Response:
{
  "data": [
    {
      "billId": 1, 
      "userId": 1, 
      "itemDescription": "Figma Yearly Plan", 
      "logoUrl": "https://cdn.figma.com/logo.png", 
      "dueDate": "2025-05-15", 
      "lastChargeDate": "2024-05-14", 
      "Amount": 150.00
    },
    { 
      "billId": 2, 
      "userId": 1, 
      "itemDescription": "Adobe Creative Cloud", 
      "logoUrl": "https://cdn.adobe.com/logo.png", 
      "dueDate": "2025-06-10", 
      "lastChargeDate": "2024-06-10", 
      "Amount": 559.00
    }
  ]
}

Error Response:
{"message": "Failed to fetch bills"}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server error handling.

Required project behavior:

- Create endpoint GET /api/v1/bills.

REQUEST FORMAT:
Header: Authorization: Bearer <access_token>

Processing Logic:
- Get user_id from the JWT payload (@Request()).
- Query the database to retrieve all invoices belonging to user_id.
- Filter invoices with a due date in the near future.
- Sort the results by dueDate ASC.
- Returns JSON with the key data.

SUCCESS RESPONSE FORMAT:
{
  "data": [
    {
      "billId": 1, 
      "userId": 1, 
      "itemDescription": "Figma Yearly Plan", 
      "logoUrl": "https://cdn.figma.com/logo.png", 
      "dueDate": "2025-05-15", 
      "lastChargeDate": "2024-05-14", 
      "Amount": 150.00
    }
  ]
}

Error Handling:
- If an error occurs during the database query, throw an InternalServerErrorException with: {"message": "Failed to fetch bills"}

### Frontend UI Context

Implementation objective:
To build the user interface accurately according to Figma's design.

Required project behavior:

The component must display:
- Component: Upcoming Bills (React TypeScript + Tailwind CSS)
- Display a list of upcoming invoices: Supplier logo, Invoice description (itemDescription), Due date, Amount, Pay Now button

Strictly follow the Figma MCP design at the following reference:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5609

Ensure that the layout, visual structure, typography, spacing, and colors match the referenced design.

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and successfully handle the workflow.

Required project behavior:

Add the required state variables:
- Add the following states: bills: list of invoices, isLoading: loading status, error: error message

REQUEST CONTENT:
- Asynchronous function fetchUpcoming Bills: Call the GET API /api/v1/bills with the Authorization header.

After a successful response:
- If successful: set bills = response.data.
- If data.length === 0, display the message: "You do not have an invoice. Which one is due for payment soon?"
- set isLoading = false and error = null.

### Validation and Error-Handling Context

Implementation objective:
To improve error handling and loading status.

Required project behavior:

Loading State:
- Before calling the API, set isLoading = true.
- When the request ends, set isLoading = false.
- Display a spinner or skeleton loader during the loading process.

API Error Handling:
- If the API returns an error (e.g., 500), update the error state with the following message: "Unable to load invoice list. Please try again."
- This message will be displayed at the invoice list location.

Client-side Validation:
- Not required, as this is a read-only function.
