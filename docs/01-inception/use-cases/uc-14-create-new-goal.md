# UC-14: Create a New Goal

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
Set new goals

Description:
- Allows users to set a new financial goal, such as an overall savings goal or a category-specific spending limit, by entering parameters such as goal type, amount, and timeframe.

Primary Actor: 
User

Preconditions:
- Users must log in.
- Categories must be available if you want to create spending goals.

Postconditions:
- Success: The new goal has been saved to the Goals table, and the system has updated the list of goals.
- Failure: Displays an invalid data error message, user remains on the Create New Goal form.

Main Flow:
1. Users access the Goals page from the navigation bar and click the "Add new goal" button.
2. The system displays an input form with the following information: Goal_type, Category (if needed), Target_amount, Start_date, and End_date.
3. The user enters the information and clicks the "Save" button.
4. The front-end sends requests with data to the back-end API.
5. The backend verifies the access_token and extracts the user_id.
6. The backend checks the validity of the input data: amount > 0, start_date < end_date, and category validity if required.
7. If valid, the backend saves the new goal to the Goals table, linked to user_id.
8. The backend returns a success response.
9. The front-end receives feedback, displays a "Goal created successfully" message, and updates the list of goals.

Alternative Flow:

A.1 — Invalid input data (Validation Error)
- If any data field violates the rule, the backend returns a Bad Request error (HTTP 400).
- The front-end displays the corresponding error message below the faulty field, and the user edits it.

A.2 — Spending objectives without selecting a category
- If goal_type is Expense Limit but the Category field is empty, display the error message: "Please select an expense category."

Exception Flow:
(Exception flows are addressed in Alternative Flow A.1 above)

UI Integration:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=416-6052

API Endpoint:
POST /api/v1/goals

Request Body:
Header: Authorization: Bearer <access_token>
Request Body sample:
{ 
  "goal_type": "Saving", 
  "category_id": null, 
  "start_date": "2025-05-01", 
  "end_date": "2025-12-31", 
  "target_amount": 80000000
}

Successful Response:
{
  "message": "Goal created successfully", 
  "goal_id": 9
}

Error Response:
{
  "statusCode": 400, 
  "message": "End date must be < start date."
}
{
  "statusCode": 500, 
  "message": "Cannot add Goals right now. Try again."
}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server error handling.

Required project behavior:

- The POST endpoint /api/v1/goals is located in GoalsController and protected by JwtAuthGuard.

REQUEST FORMAT:
Header: Authorization: Bearer <access_token>
{ 
  "goal_type": "Saving", 
  "category_id": null, 
  "start_date": "2025-05-01", 
  "end_date": "2025-12-31", 
  "target_amount": 80000000
}

Processing Logic:
- Get the DTO containing the target data; user_id is obtained from the access_token.
- Validation: target_amount > 0, end_date after start_date, if goal_type = "Expense", category_id must not be null and must be valid.
- If valid, create a new record in the Goals table associated with user_id and save it to the database.

SUCCESS RESPONSE FORMAT:
{
  "message": "Goal created successfully", 
  "goal_id": 9
}

Error Handling:
- Validation failed: BadRequestException (HTTP 400)
- System error: InternalServerErrorException (HTTP 500)

### Frontend UI Context

Implementation objective:
To build the user interface accurately according to Figma's design.

Required project behavior:

The component must display:
- Component: CreateGoalModal (React TypeScript + Tailwind CSS)
- Forms in modals: Title: "Add a new goal"
- Select Goal Type (Radio/Dropdown: "Overall Savings", "Expense Limit")
- Select a Category (shown if the goal is "Spending Limit")
- Enter the target amount (currency input)
- Select the Start Date and End Date (Date Picker)
- Action buttons: "Save", "Cancel"

Strictly follow the Figma MCP design at the following reference:
STRICTLY according to Figma MCP:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=416-6052

Ensure that the layout, visual structure, typography, spacing, and colors match the referenced design.

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and successfully handle the workflow.

Required project behavior:

Add the required state variables:
- States: goalType, categoryId, targetAmount, startDate, endDate, isLoading, error

REQUEST CONTENT:
- The handleSubmit function: Send a POST request to /api/v1/goals with the payload retrieved from the state.

After a successful response:
- If successful: Display toast: "Setting successful goals."
- Close modal
- Call the callback to refresh the target list.

### Validation and Error-Handling Context

Implementation objective:
To finalize error handling, loading status, and final validation.

Required project behavior:

Loading State:
- The state variable isLoading
- When starting the API call: isLoading = true, disable the "Save" button, display the spinner.
- When API terminates: isLoading = false

API Error Handling:
- Wrapped in try...catch
- Display the error message from error.response.data.message if available. If not, display: "Could not create target at this time. Please try again later."

Client-side Validation:
- Before calling the API: target_amount must be greater than 0. start_date and end_date must be selected. end_date must come after start_date. If the target is "Expense", category_id must be selected.
- If validation fails, display an error message under the corresponding field and do not call the API.
