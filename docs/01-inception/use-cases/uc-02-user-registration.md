# UC-02: Register

## Functional Use-Case Specification

USE CASE SPECIFICATION

Use Case Name:
Register

Description:
- Allow new users to provide information (Full name, Email, Password) to create a new account in the system.

Primary Actor:
User

Preconditions:
- The user is currently accessing the Registration screen.
- The user does not yet have an account in the system.

Postconditions:
- Success: Account created, login session established, and redirected to Homepage (/).
- Failure: An error is displayed and the user remains on the Registration screen.

Main Flow:
1. Users access the Homepage and click the Register/Login button.
2. The system redirects you to the Registration page.
3. The user enters their full name, email address, password, and confirm password.
4. Press the "Sign Up" button.
5. The system checks the validity of the input data.
6. Does the email verification system already exist?.
7. Password verification and confirmation system.
8. If valid: create a new account.
9. Set up a login session for new users.
10. Redirect to Homepage (/).

Alternative Flow:
A.1 — Email already exists
- After step 6, the main flow.
- If the email address is already registered: the error message "This email is already registered" will be displayed.
- The user remains on the Registration screen.

A.2 — Password does not match
- After step 7, the main flow.
- If they don't match: display the error "Passwords do not match.".
- The user remains on the Registration screen.

Exception Flow:
E.1 — Invalid data
- If the email is incorrectly formatted or a field is left blank.
- The system displays the error message directly below the input field.
- The user remains on the Registration screen.

UI Integration:
The Registration interface must closely follow Figma MCP at the following link:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=137-8071&t=cxgXQfkGoLMfxW48-4

API Endpoint:
POST /api/auth/register

Request Body:
{
  "fullName": "Nguyen Van A",
  "email": "example@email.com",
  "password": "123456",
  "confirm Password": "123456"
}

Successful Response:
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "fullName": "Nguyen Van A",
    "email": "example@email.com"
  },
  "token": "JWT_TOKEN"
}

Error Response:
{ "error": "This email is already registered." }
{ "error": "Passwords do not match." }


## Project-Specific Implementation Context

### Backend Implementation Context

Implementation objective:
To build an API service, business logic, and server error handling for the account registration function.

Required project behavior:

- Create a POST endpoint api/auth/register in NestJS's AuthController.
- This endpoint is a public route and does not require Guard.

REQUEST FORMAT:
{
  "fullName": "Nguyen Van A",
  "email": "example@email.com",
  "password": "123456",
  "confirm Password": "123456"
}

Processing Logic:
- Use DTOs and class-validators to check the following fields: fullName, email, password.
- Check if the password matches confirm Password.
- Check if the email address already exists in the database.
- If valid, hash the password and create a new user.
- Generate JWT tokens for new users.
- Returns user information and token.

SUCCESS RESPONSE FORMAT:
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "fullName": "Nguyen Van A",
    "email": "example@email.com"
  },
  "token": "JWT_TOKEN"
}

Error Handling:
- { "error": "This email is already registered." }
- {"error": "Passwords do not match." }

### Frontend UI Context

Implementation objective:
To build a registration interface that matches the Figma design.

Required project behavior:

The component must display:
- Create a SignUpForm component using React TypeScript and Tailwind CSS.
- The form should include: Email, Full Name, Password, Confirm Password, a Sign Up button, and a link to the login page.

Strictly follow the Figma MCP design at the following reference:
https://www.figma.com/design/iE0nfper0rck0R1b0MQBzo/Finebank---Financial-Management-Dashboard-UI-Kits--Community-?node-id=137-8071&t=cxgXQfkGoLMfxW48-4

Ensure that the layout, visual structure, typography, spacing, and colors match the referenced design.

### Frontend Logic and API Context

Implementation objective:
Connect the UI form to the API and handle successful registration.

Required project behavior:

Add the required state variables:
- Add the following states: fullName, email, password, confirm Password.

REQUEST CONTENT:
- Implement the handleSignUp function to send a POST request to api/auth/register.
- Payload uploaded: {"fullName": "...", "email": "...", "password": "...", "confirm Password": "..." }.

After a successful response:
- Save the token to LocalStorage or Context.
- Save user information to global state.
- Redirect users to the homepage /.

### Validation and Error-Handling Context

Implementation objective:
To complete client-side error handling, loading, and validation.

Required project behavior:

Loading State:
- Add the state 'isLoading'.
- While processing, disable the Sign Up button and display the spinner.

API Error Handling:
- Display the error from the response, such as: "This email is already registered." "Passwords do not match.".

Client-side Validation:
- Check that all fields are not left blank.
- Check the password and confirm that it matches.
- If an error occurs, display a message directly below the input.
