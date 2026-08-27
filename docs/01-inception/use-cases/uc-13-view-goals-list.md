# UC-13: View the list of Goals

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
View the list of goals.

Description:
- Allows logged-in users to view an overview of all financial goals they have set in the system, including overall savings goals and spending limits by category.

Primary Actor: 
User

Preconditions:
- Users must be logged in (with a valid access token).

Postconditions:
- Success: Display a list of the goals you have set on the Goals page.
- Failure: Displays an error message or a message indicating that no target has been set.

Main Flow:
1. The user is logged in and has a valid access token.
2. Users access the Goals page from the navigation bar (/goals).
3. Front-end calls Backend API: GET /api/v1/goals.
4. The backend verifies the access_token and extracts the user_id.
5. The backend queries the Goals and Transactions tables based on user_id, calculating the Target Achieved = (Total Income - Total Expenses) for the current month.
6. The backend returns a list of the user's goals (including savings goals and spending limits) for the current month.
7. The front-end receives data and displays a detailed list of objectives on the user interface.

Alternative Flow:

A.1 — No goals have been set
- If the target list is returned empty, display the following message: "You haven't set any goals yet. Let's create your first goal!"
- Provide a button or link for users to start creating new goals.

A.2 — Authentication/Access Errors
- If the access_token is invalid or has expired: The backend returns an Unauthorized (HTTP 401) error, and the frontend redirects the user to the login page.

Exception Flow:

E.1 — Backend system errors
- If a database query error or internal processing error occurs, display a friendly error message: "A system error occurred while loading the target, please try again later."

UI Integration:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5829&t=cxgXQfkGoLMfxW48-4
The Savings Goal section displays: Target Achieved, Target Amount, and an "Adjust Goal" button. The Expenses Goals by Category section displays category tags (Housing, Food, Transportation, etc.).

API Endpoint:
GET /api/v1/goals

Request Body:
Header: Authorization: Bearer <access_token>
Request Body: No

Successful Response:
{ 
  "savingGoal": { 
    "goal_id": 1, 
    "goal_type": "Saving", 
    "target_amount": 60000000, 
    "target_achieved": 10000000, 
    "start_date": "2025-01-01", 
    "end_date": "2025-12-31"
  }, 
  "expenseGoals": [ 
    {
      "goal_id": 2, 
      "category": "Food", 
      "target_amount": 3000000
    },
    {
      "goal_id": 3, 
      "category": "Transportation", 
      "target_amount": 2000000
    }
  ]
}

Error Response:
{
  "statusCode": 500, 
  "message": "500 Internal Server Error. Try again."
}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server error handling.

Required project behavior:

- The endpoint GET /api/v1/goals in GoalsController and is protected by JwtAuthGuard.

REQUEST FORMAT:
Header: Authorization: Bearer <access_token>

Processing Logic:
- Get user_id from the JWT payload.
- Query the database to retrieve: Savings Goal, Expense goals for user_id in the current month.
- Calculate target_achieved for savingGoal: target_achieved = Total Income (current month) - Total Expenses (current month)
- Return data in the response format.

SUCCESS RESPONSE FORMAT:
{ 
  "savingGoal": { 
    "goal_id": 1, 
    "goal_type": "Saving", 
    "target_amount": 60000000, 
    "target_achieved": 10000000, 
    "start_date": "2025-01-01", 
    "end_date": "2025-12-31"
  }, 
  "expenseGoals": [ 
    {
      "goal_id": 2, 
      "category": "Food", 
      "target_amount": 3000000
    }
  ]
}

Error Handling:
- If an error occurs during the database query or logic processing, throw an InternalServerErrorException with the JSON error.

### Frontend UI Context

Implementation objective:
To build the user interface accurately according to Figma's design.

Required project behavior:

The component must display:
- Component: GoalsPage (React TypeScript + Tailwind CSS)
- "Savings Goal" area: Target Achieved, Target Amount, "Adjust Goal" button
- The "Expenses Goals by Category" section: a list of spending goals categorized by category.

Strictly follow the Figma MCP design at the following reference:
STRICTLY according to Figma MCP:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=66-5829

Ensure that the layout, visual structure, typography, spacing, and colors match the referenced design.

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and successfully handle the workflow.

Required project behavior:

Add the required state variables:
- Add states: goalsData - target data, isLoading - load status, error - error message

REQUEST CONTENT:
- Asynchronous fetchGoals function: Call the GET API /api/v1/goals with the Authorization header.

After a successful response:
- If successful: set goalsData = response.data, set isLoading = false

### Validation and Error-Handling Context

Implementation objective:
To improve error handling and loading status.

Required project behavior:

Loading State:
- Before calling the API, set isLoading = true. While loading, display Spinner or Skeleton Loader.

API Error Handling:
- If you receive a 401 Unauthorized error, navigate to the Login page.
- If a system error occurs (e.g., 500), update the error and display: "A system error occurred while loading the target, please try again later."
- If both savingGoal and expenseGoals are empty, display the message: "You haven't set any goals yet. Please create your first goal!"

Client-side Validation:
- Not applicable, as this is a data viewing function.
