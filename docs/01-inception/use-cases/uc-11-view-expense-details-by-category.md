# UC-11: View Expenditure Details by Category

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
View detailed spending by category.

Description:
- Allows users to analyze total spending over a specific period (usually the current month) by breaking down the amount spent into established categories (Housing, Food, Entertainment, etc.).

Primary Actor: 
User

Preconditions:
- Users must log in.
- The user has recorded spending transactions (type = 'Expense') and these transactions have been assigned a valid category_id.
- The system has spending data for at least the current month to calculate the comparison rate.

Postconditions:
- Success: Displayed the Expense Details page with a list of categories, total spending for each category, and a comparison to the previous month.
- Failure: Displays an error message or a message indicating no spending data.

Main Flow:
1. Users access the "Spending" page from the navigation bar.
2. The front-end calls the backend API to retrieve group spending details by category.
3. The backend verifies the access_token and extracts the user_id.
4. The backend queries the Transactions table (type = 'Expense') and combines it with the Categories table to group total spending by category_id for the current and previous months.
5. The backend returns a list of categories, current month's total spending, previous month's total spending, and individual transaction items for each category.
6. The front-end displays a detailed list of expenses by category: Category name and icon, total amount spent in the current month, and percentage increase/decrease compared to the previous month.
7. Under each category, display a list of smaller transaction items belonging to that category during the current month.

Alternative Flow:

A.1 — No expenses in the current month
- If the current month's total spending is zero, display the message: "You have no expenses recorded this month."

Exception Flow:

E.1 — System errors / access errors
- If an error occurs during querying or authentication: The backend returns an error (HTTP 500), the front-end displays a generic error message, and data cannot be parsed.

UI Integration:
STRICTLY according to Figma MCP design:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5698&t=cxgXQfkGoLMfxW48-4

API Endpoint:
GET /api/v1/expenses/breakdown?month=YYYY-MM

Request Body:
Header: Authorization: Bearer <access_token>
Query Parameters: month format 'YYYY-MM', e.g. '2025-11'

Successful Response:
{ 
  "data": [ 
    { 
      "category": "Housing", 
      "Total": 250.00, 
      "changePercent": 15, 
      "subCategories": [
        { "item_description": "House Rent", "amount": 230.00, "date": "2025-05-17" }, 
        { "item_description": "Parking", "amount": 20.00, "date": "2025-05-17" }
      ]
    },
    {
      "category": "Food", 
      "Total": 350.00, 
      "changePercent": -8, 
      "subCategories": [
        { "item_description": "Grocery", "amount": 230.00, "date": "2025-05-17" }, 
        { "item_description": "Restaurant Bill", "amount": 120.00, "date": "2025-05-17" }
      ]
    }
  ]
}

Error Response:
{ "error": "No input data for this month." }


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server error handling.

Required project behavior:

- Create endpoint GET /api/v1/expenses/breakdown.

REQUEST FORMAT:
Header: Authorization: Bearer <access_token>
Query Parameters: month=YYYY-MM

Processing Logic:
- Get userId from the JWT payload (@Request()) and month from the query parameters.
- The previous month is calculated based on the current month.
- Execute two queries in parallel on the Transactions table: Query transactions of type='Expense' in the current month. Query the transactions of type='Expense' in previous Month.
- Group the results by category_id and calculate the total for each category.
- Loop through the current month's categories: Calculate changePercent = currentTotal / previousTotal * 100. If previousTotal = 0, it could be 100 or null.
- Get a list of subcategories within a category.
- If there are no transactions in the current month, throw a NotFoundException.
- Returns JSON with the key data.

SUCCESS RESPONSE FORMAT:
{ 
  "data": [ 
    { 
      "category": "Housing", 
      "Total": 250.00, 
      "changePercent": 15, 
      "subCategories": [
        { "item_description": "House Rent", "amount": 230.00, "date": "2025-05-17" }
      ]
    }
  ]
}

Error Handling:
- If no transactions are found, throw a NotFoundException with: { "error": "No input data for this month." }

### Frontend UI Context

Implementation objective:
Build a user interface based on Figma's design.

Required project behavior:

The component must display:
- Create Expenses Breakdown component using React TypeScript + Tailwind CSS.
- Each card displays: Icon and category name, Total expenditure of the portfolio.
- The percentage change (changePercent) is shown in green if it increases and red if it decreases.
- A list of sub-transactions, each line containing: item_description, date, and amount.

Strictly follow the Figma MCP design at the following reference:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5698&t=cxgXQfkGoLMfxW48-4

Ensure that the layout, visual structure, typography, spacing, and colors match the referenced design.

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and successfully handle the workflow.

Required project behavior:

Add the required state variables:
- Add states: expensesData: breakdown data, isLoading: loading status, error: error message.

REQUEST CONTENT:
- Implement the asynchronous function fetch Expenses Breakdown (month: string).
- API call GET /api/v1/expenses/breakdown?month=YYYY-MM with the Authorization header.

After a successful response:
- If successful, set expensesData = response.data.
- Set isLoading = false and clear the old error (error=null).

### Validation and Error-Handling Context

Implementation objective:
To improve error handling and loading status.

Required project behavior:

Loading State:
- Before calling the API, set isLoading = true.
- While loading, display the Skeleton Loader like a real layout card.

API Error Handling:
- Wrap the request in a try...catch.
- If a 404 error occurs, set error = "No spending data for this month." and display a message in the interface.
- If no data is found, the message should be: "You have no expenses recorded this month."

Client-side Validation:
- Only call fetch Expenses Breakdown with a valid month string (YYYYMM) from Date Picker.
