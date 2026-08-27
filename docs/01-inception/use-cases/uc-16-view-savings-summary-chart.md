# UC-16: View Savings Summary Chart

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
View the Savings Overview chart.

Description:
- Allows users to visualize their net savings (Total Income - Total Expenses) for each month of a selected year, and compare it with savings results from the same period of the previous year.

Primary Actor: 
User

Preconditions:
- Users must log in.
- The user recorded Revenue and Expense transactions during the months of the selected year.

Postconditions:
- Success: The line graph shows the total net savings by month on the Savings Overview page.
- Failure: Displays an error message or a message indicating there is no data to display.

Main Flow:
1. Users access the Goals page from the navigation bar.
2. Users select the year they want to view data for in the Savings Overview section (if not selected, the default is the current year).
3. The front-end sends requests to the backend API.
4. The backend verifies the access_token and extracts the user_id.
5. Backend computation: Current month savings: For each month of the selected year, calculate (Total Income - Total Expenses) from the table Transactions. Comparative savings: similarity calculation for the same months of the previous year.
6. The backend groups data by month and returns chart results (including monthly savings for the current year and the previous year).
7. The front-end receives data and displays a line graph.
8. Chart): X-axis: months (1 to 12). Y-axis: Net savings.
9. The chart displays at least two lines: the selected year and the previous year.
10. The interface displays complete charts for the user.

Alternative Flow:

A.1 — No transaction data is available for the selected year
- If there are no Revenue or Expense transactions in the selected year, the front-end displays the message: "There is no transaction data available for this year to calculate savings."

Exception Flow:
(Exception flows are managed within error handling contexts)

UI Integration:
Figma UI integration: https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5829&t=cxgXQfkGoLMfxW48-4
Dropdown for selecting a year (e.g., "2024", "2025")
Line chart: X-axis: January → December. Y-axis: Total savings. Bold line (blue): "This Year". Faint (gray) line: "Same period last year"

API Endpoint:
GET /api/v1/savings/summary

Request Body:
GET /api/v1/savings/summary?year=2025
Query Params: year (optional): The year you want to view the savings overview for. If not specified, the default is the current year.

Successful Response:
{ 
  "user_id": 1, 
  "year": 2025, 
  "summary": {
    "this_year": [
      {"month": "01", "amount": 1500000}, 
      {"month": "02", "amount": 2000000}, 
      {"month": "03", "amount": 2500000}
    ], 
    "last_year": [ 
      {"month": "01", "amount": 1200000}, 
      {"month": "02", "amount": 1800000}, 
      {"month": "03", "amount": 2000000}
    ]
  } 
}

Error Response:
{"statusCode": 500,"message": "An internal server error occurred while processing the Savings highlighting."}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server error handling.

Required project behavior:

- Create a GET endpoint /api/v1/savings/summary in SavingsController, protected by JwtAuthGuard.

REQUEST FORMAT:
Query Params: year (optional)

Processing Logic:
- Get user_id from JWT via @Request() req.
- Get the year parameter from the query. If it's not included, the default is the current year.
- Query the Transactions table to retrieve all Revenue and Expense transactions for the months of the year.
- Calculate net savings each month: saving = total_revenue - total_expense. If there are no transactions, the value is 0.
- Repeat the above steps for the previous year (year - 1) and create the last_year array.
- Return the response in the requested format.

SUCCESS RESPONSE FORMAT:
{ 
  "user_id": 1, 
  "year": 2025, 
  "summary": {
    "this_year": [{"month": "01", "amount": 1500000}], 
    "last_year": [{"month": "01", "amount": 1200000}]
  } 
}

Error Handling:
- If an error occurs, throw InternalServerErrorException.

### Frontend UI Context

Implementation objective:
To build a user interface that displays the Savings Overview chart according to Figma's design.

Required project behavior:

The component must display:
- Component: SavingsSummaryChart (React + TypeScript + Tailwind CSS)
- Component layout: Title: "Saving Summary", Dropdown menu for selecting years (e.g., 2023, 2024, 2025) - Line chart using the Recharts library.
- Interface requirements: The X-axis displays the 12 months (January-December). Line 1: Current year, dark blue, label "This Year". Route 2: Last year, light gray, label "Same period last year"

Strictly follow the Figma MCP design at the following reference:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5829

Ensure that the layout, visual structure, typography, spacing, and colors match the referenced design.

### Frontend Logic and API Context

Implementation objective:
Connect the component to the API and manage data state.

Required project behavior:

Add the required state variables:
- State: Selected Year: the selected year (default: current year), chartData: contains this_year and last_year, isLoading: loading status, error: error message

REQUEST CONTENT:
- The fetchSavingsSummary(year) function: Send request GET /api/v1/savings/summary?year=...
- Use 'useEffect' to call the API whenever 'selected Year' changes.

After a successful response:
- If successful, update the chartData state with the data from the API.

### Validation and Error-Handling Context

Implementation objective:
Improve UX when calling APIs and when data is missing.

Required project behavior:

Loading State:
- Before calling the API: isLoading = true
- After completion: isLoading = false
- During loading: display Spinner instead of chart

API Error Handling:
- Catch errors with try...catch
- If the API fails, display the message: "Unable to load data. Please try again later."
- No data available: If both this_year and last_year are empty → display: "There is no transaction data for this year to calculate savings."

Client-side Validation:
- Not applicable
