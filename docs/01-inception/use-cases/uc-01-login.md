# UC-01: Login

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name: 
Login

Description:
- Allows the user to authenticate their identity using email and password to access the system.
- Supports the "Save login information" option.

Primary Actor: 
User

Preconditions:
- The user is on the Homepage.
- A valid account is already present.

Postconditions:
- Success: Login and redirects to the Homepage.
- Failure: An error is displayed.

Main Flow:
1. The user accesses the Login button on the Homepage.
2. The system redirects to the Login page.
3. The user enters their email and password.
4. Clicks the "Login" button.
5. The system checks for validity.
6. If valid: establish a login session.
7. Redirects to the Homepage and displays "Logout".

Alternative Flow:
- The user selects "Save login information".
- If successful, the system remembers the login session.

Exception Flow:
- If the email or password is incorrect: displays the error "Incorrect email or password.".
- The user remains on the Login screen.

UI Integration:
The Login interface must strictly follow the Figma MCP design at the following link:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=137-7477&t=cxgXQfkGoLMfxW48-4

API Endpoint:
POST /api/auth/login

Request Body:
{
  "email": "johndoe@email.com",
  "password": "mypassword"
}

Successful Response:
{
  "accessToken": "JWT_TOKEN",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "johndoe@email.com"
  }
}

Error Response:
{
  "error": "Incorrect email or password."
}


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build API services, business logic, and server error handling for the login functionality.

Required project behavior:

- Create a POST endpoint api/auth/login in NestJS's AuthController.
- This endpoint is a public route and does not require Guard authentication.

REQUEST FORMAT:
{
  "email": "string",
  "password": "string"
}

Processing Logic:
- Receive email and password from the request body.
- Find the user in the database using the email.
- If not found or the password does not match, processing fails.
- If correct, create a JSON Web Token (JWT) containing the user's identifier.
- Return the token and the user's basic information.

SUCCESS RESPONSE FORMAT:
{
  "accessToken": "JWT_TOKEN",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "johndoe@email.com"
  }
}

Error Handling:
- If the email does not exist or the password is incorrect, the system throws an Unauthorized Exception with the following JSON error: { "error": "Incorrect email or password." }.

### Frontend UI Context

Implementation objective:
Build the login interface according to Figma's design.

Required project behavior:

The component must display:
- Create the LoginForm component using React TypeScript and Tailwind CSS.
- The form includes: Email input field, Password input field, "Save login information" checkbox, "Login" button, "Forgot password?" link.

Strictly follow the Figma MCP design at the following reference:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=137-7477&t=Jwl8SfgcguZ5Gicc-4

Ensure that the layout, visual structure, typography, spacing, and colors match the referenced design.

### Frontend Logic and API Context

Implementation objective:
Connect the UI form to the API and handle the successful login flow.

Required project behavior:

Add the required state variables:
- Add states: email: string, password: string, rememberMe: boolean.

REQUEST CONTENT:
- Implement the asynchronous handleSubmit function to send a POST request to api/auth/login.
- Payload sent: {"email": "johndoe@email.com", "password": "mypassword"}.

After a successful response:
- Save the accessToken to localStorage.
- Save user information to the global state (Context API / Redux / Zustand).
- Redirect the user to the homepage /.

### Validation and Error-Handling Context

Implementation objective:
To improve client-side error handling, loading, and validation.

Required project behavior:

Loading State:
- Add the state isLoading.
- While processing, disable the Login button and display a spinner.

API Error Handling:
- If the API returns a 401 error, display the message: "Incorrect email or password.".

Client-side Validation:
- Email cannot be blank and must be in the correct format.
- Password cannot be blank.
- If an error occurs, display a message directly below the input field.
