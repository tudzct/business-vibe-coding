# UC-10: View Monthly Expenses

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
View monthly expenses

Description:
- Allows users to visualize and compare total spending for the current month with previous months of the year through charts, helping them understand financial trends and habits.

Primary Actor: 
User

Preconditions:
- Users must log in.
- The user has recorded spending transactions (type = 'Expense') for the current month and previous months.

Postconditions:
- Success: Displayed a monthly spending comparison chart on the "Spending" page.
- Failure: Displays an error message or a message indicating no spending data.

Main Flow:
1. On the Home page, users access the "Spending" page through the navigation bar.
2. The front-end calls the backend API to retrieve total monthly spending data.
3. The backend verifies the access_token and extracts the user_id.
4. The backend queries the Transactions table to retrieve the total spending amount (SUM(Amount)) for each month with type = 'Expense' and the current user_id within a 12-month range.
5. The backend returns total spending data in the format Month - Total Amount.
6. The front-end receives the data and draws a bar chart comparing expenses.
7. The X-axis displays the months of the year, and the Y-axis displays the amount of money spent.
8. Chart column: current month in green, previous months in gray.
9. The interface displays complete charts.

Alternative Flow:

A.1 — No spending data available
- If the query does not return data: display the message "No spending data has been recorded for analysis."

A.2 — Data is only available for the current month
- The chart only displays the green column for the current month, and may display a message encouraging transaction recording.

Exception Flow:

E.1 — System error / access error
- If an error occurs during querying or validation: The backend returns an error (HTTP 500), the front-end displays a generic error message, and the graph cannot be plotted.

UI Integration:
STRICTLY according to Figma MCP design:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5698&t=cxgXQfkGoLMfxW48-4

API Endpoint:
GET /api/v1/expenses/summary?userId={user_id}

Request Body:
Header: Authorization: Bearer <access_token>

Successful Response:
{
  "data": [
    { "month": "January", "totalExpense": 1250.00 },
    { "month": "Feb", "totalExpense": 2100.50 },
    { "month": "Mar", "totalExpense": 1900.00 }
  ]
}

Error Response:
{
  "error": "Cannot load data for Expense."
}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server error handling.

Required project behavior:

- Create endpoint GET /api/v1/expenses/summary.
- This endpoint must be protected by JwtAuthGuard.

REQUEST FORMAT:
Header: Authorization: Bearer <access_token>
Query Params: userId={user_id}

Processing Logic:
- Get user_id from the JWT payload (@Request()).
- Query the Transactions table in the database.
- Filter transactions by: type = 'Expense', user_id = current user, Transaction year = current year.
- Group by month and sum (SUM(amount)).
- Convert the result into an array of objects: { month: string, totalExpense: number } with the abbreviated month name.
- Returns JSON with the key data.

SUCCESS RESPONSE FORMAT:
{
  "data": [
    { "month": "January", "totalExpense": 1250.00 }
  ]
}

Error Handling:
- If the DB query fails, throw an InternalServerErrorException with: { "error": "Cannot load data for Expense" }

### Frontend UI Context

Implementation objective:
Build a user interface based on Figma's design.

Required project behavior:

The component must display:
- Create the ExpenseSummaryChart component (React TypeScript + Tailwind CSS) which includes: Chart area title. X-axis: Month of the year. Y-axis: Total expenditure.
- Chart columns with a tooltip that displays the amount when hovered over.
- Column colors: Current month is green. Previous months are gray.

Strictly follow the Figma MCP design at the following reference:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5698&t=cxgXQfkGoLMfxW48-4

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and process the data.

Required project behavior:

Add the required state variables:
- Add state: summaryData: chart data, isLoading: loading status, error: error message.

REQUEST CONTENT:
- The asynchronous fetchExpenseSummary function inside useEffect:
- Call API GET /api/v1/expenses/summary with Authorization: Bearer <access_token>

After a successful response:
- If successful, update summaryData with response.data.
- The chart is rendered based on summaryData; the current month column is green, and other months are gray.

### Validation and Error-Handling Context

Implementation objective:
To improve error handling and loading status.

Required project behavior:

Loading State:
- Before calling the API, set isLoading = true.
- In the finally block, set isLoading = false.
- When isLoading = true, display ChartSkeletonLoader or Spinner.

API Error Handling:
- Wrap requests in try...catch.
- If error (500) occurs, set error = error.response.data.error and display it in the chart area.
- In the case of an empty array: If data.length === 0, display: "No spending data has been recorded for analysis."
- If there is only one element (the current month), the chart will still be displayed with a single green column.

Client-side Validation:
- Not applicable as there is no input form.
