# UC-15: Adjust Monthly Goals

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
Adjust Goal

Description:
- Allows users to update the target amount or the achieved amount of an existing goal (savings or spending) to reflect changes in their financial plan.

Primary Actor: 
User

Preconditions:
- Users must log in.
- The target that needs adjustment exists and is owned by the user.

Postconditions:
- Success: The Target Amount or Archived Amount information is updated in the Goals table, and the Goals interface is updated.
- Failure: An error message is displayed, and the user remains in the target adjustment popup.

Main Flow:
1. Users access the Goals page from the navigation bar and select the goal they want to adjust.
2. Users click the "Adjust Goal" button on the corresponding category tab.
3. The system displays a popup form with pre-filled information, including editable fields (e.g., Target Amount).
4. The user changes the values of the necessary fields.
5. The user clicks the "Save" button.
6. The front-end sends new data to the backend API.
7. The backend verifies the access_token and extracts the user_id.
8. The backend checks ownership and validity of the new data (Target Amount > 0).
9. If valid, the backend updates the goal in the Goals table.
10. The backend returns a success response.
11. The front-end displays the message "Target adjustment successful".
12. The popup closes and the target interface is updated with the new value.

Alternative Flow:

A.1 — Invalid input data (Validation Error)
- If any data field violates the rules (e.g., entering a negative value), the backend returns a Bad Request error (HTTP 400).
- The front-end displays an error message in a popup, and the user edits it.

A.2 — Authorization error (No editing rights)
- If the target is not owned by the current user_id, the backend returns a Forbidden error (HTTP 403).
- The front-end displays the error message: "You do not have permission to edit this target."

Exception Flow:

E.1 — Backend system errors
- If an error occurs during the data update process, the system displays the general message: "Could not save changes at this time. Please try again later."

UI Integration:
Matches the design of the Objectives page interface.

API Endpoint:
PUT /api/v1/goals/{goalId}

Request Body:
Header: Authorization: Bearer <access_token>
Request Body sample:
{"target_amount": 70000000 }

Successful Response:
{
  "message": "Goal updated successfully", 
  "updated_goal": {
    "goal_id": 1, 
    "target_amount": 70000000
  }
}

Error Response:
{"statusCode": 400,"message": ["target_amount must be a positive number"], "error": "Bad Request"}
{"statusCode": 403, "message": "You do not have permission."}
{"statusCode": 500,"message": "Cannot update now. Try again."}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server error handling.

Required project behavior:

- The endpoint PUT /api/v1/goals/{goalId} in GoalsController is protected by JwtAuthGuard.

REQUEST FORMAT:
{"target_amount": 70000000 }

Processing Logic:
- Get goalId from params, user_id from JWT, and DTO containing target_amount.
- Search for the target in the database by goalId. If not found, throw a NotFoundException.
- Check ownership: goal.userId must match user_id. Otherwise, throw a ForbiddenException.
- Validation: target_amount > 0 (use class-validator in DTO).
- If valid, update target_amount in the database.
- Returns a success response.

SUCCESS RESPONSE FORMAT:
{
  "message": "Goal updated successfully", 
  "updated_goal": {
    "goal_id": 1, 
    "target_amount": 70000000
  }
}

Error Handling:
- DTO validation failed: BadRequestException (HTTP 400)
- Not owned by: Forbidden Exception (HTTP 403)
- DB Error: InternalServerErrorException (HTTP 500)

### Frontend UI Context

Implementation objective:
To build the user interface accurately according to Figma's design.

Required project behavior:

The component must display:
- Component: AdjustGoalModal (React TypeScript + Tailwind CSS)
- Modal contains: Title: "Adjusting Goals"
- The input field for "Target Amount" is a numeric field; the current value should be pre-filled.
- Primary button: "Save"
- Use the secondary button or the 'X' icon to close the modal button.

### Frontend Logic and API Context

Implementation objective:
Connect the UI to the API and successfully handle the workflow.

Required project behavior:

Add the required state variables:
- State: targetAmount, isLoading, error

REQUEST CONTENT:
- The handleSave function: Send a request to PUT /api/v1/goals/{goalId} with the payload: { target_amount: targetAmount }

After a successful response:
- Displayed toast: "Target adjustment successful."
- Call onClose() to close the modal.
- Call the onSuccess() callback to refresh the list of targets.

### Validation and Error-Handling Context

Implementation objective:
Complete error handling, loading status, and final validation.

Required project behavior:

Loading State:
- State variable: isLoading
- When starting the API call: 'isLoading = true', disable the "Save" button, display the spinner.
- When API terminates: isLoading = false

API Error Handling:
- Wrapped in try...catch
- Status 400: Displays the error "Target amount must be greater than 0." under input.
- Status 403: Displays the error "You do not have permission to edit this target" in the general area.
- Other errors (500): display "Cannot save changes at this time. Please try again later."

Client-side Validation:
- Before calling the API: targetAmount must be greater than 0
- Otherwise, display an error message under the input and do not call the API.
