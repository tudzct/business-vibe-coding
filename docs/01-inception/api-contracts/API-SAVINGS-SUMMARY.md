---
artifact_type: api-contract
status: Frozen
api_id: API-SAVINGS-SUMMARY
related_uc_id: UC-16
---

# API-SAVINGS-SUMMARY: Get Savings Summary

## General Information

### API ID

API-SAVINGS-SUMMARY

### API Name

Get Savings Summary

### Related Use Case IDs

UC-16

### Method

GET

### Path

/api/v1/savings/summary

### Description

Return monthly net savings for a selected year and the preceding year.

### Authentication

Bearer JWT

### Authorization

Authenticated user

## Business Rules / Validation Constraints

- BR-SAV-01: Authenticated User Data Scope The savings summary shall be calculated only from transactions belonging to accounts owned by the authenticated user. The user identity shall be obtained from the validated JWT and not from client-supplied data.
- BR-SAV-02: Savings Summary Year Resolution The requested year shall be parsed as an integer. If the year is missing, cannot be parsed, is less than 1900, or is greater than 2100, the current year shall be used. Because the current implementation uses JavaScript parseInt, a value beginning with a valid numeric prefix, such as 2025abc, is resolved as 2025.
- BR-SAV-03: Complete Monthly Summary The response shall contain exactly 12 monthly entries for the resolved year and exactly 12 monthly entries for the preceding year. Months shall represent January through December in ascending order using two-digit values from 01 to 12.
- BR-SAV-04: Monthly Net Savings Calculation For each month, the savings amount shall equal the total Revenue minus the total Expense for that month across all accounts owned by the authenticated user.
- BR-SAV-05: Previous-Year Comparison The this_year series shall represent the resolved requested year, while the last_year series shall represent exactly the preceding year, calculated as resolvedYear - 1.
- BR-SAV-06: Missing Transaction Data If the authenticated user has no accounts, or if a month contains no matching transactions, the savings amount for that month shall be 0. Missing data shall not cause monthly entries to be omitted.
- BR-SAV-07: Savings Amount Rounding Each calculated monthly savings amount shall be rounded to two decimal places before being included in the API response.
- BR-SAV-08: Savings Summary Response and Failure Handling A successful response shall contain the authenticated user_id, the resolved year, and both 12-month savings series. If the savings calculation fails unexpectedly, the backend shall return HTTP 500. Retrieving the savings summary shall not create, update, or delete Account or Transaction records.
- BR-SAV-09: Savings Chart Point Value Tooltip When the savings chart is displayed, hovering the pointer over a data point in either the selected-year or previous-year series shall display a tooltip showing the savings amount represented by that point. The displayed value shall correspond exactly to the monthly savings amount returned for that month and series. The tooltip shall disappear when the pointer is no longer hovering over the data point.

## Request Header(s)

### headers.Authorization

Type: string; Format: Bearer <JWT>; Required: Yes; Nullable: No
Validation: Must contain a valid, unexpired JWT access token.
Trigger: Every protected request.
Description: Authenticates the current user.
Example: Bearer eyJhbGciOiJIUzI1NiIs...
Note: Added by the frontend Axios interceptor.

## Query Parameter(s)

### query.year

Type: integer; Format: YYYY; Required: No; Nullable: No
Default: Current year
Validation: The controller applies parseInt(year, 10). Missing, NaN, <1900, or >2100 values use the current year. A leading numeric prefix is accepted by parseInt.
Trigger: Savings summary request.
Description: Optional target year resolved by the controller.
Example: 2025

## Request Body

None

## Success Response — HTTP 200

### user_id

Type: integer; Required: Yes; Nullable: No
Trigger: The summary is calculated; missing data produces zero-valued months.
Description: Authenticated user identifier.
Example: 1


### year

Type: integer; Required: Yes; Nullable: No
Trigger: The summary is calculated; missing data produces zero-valued months.
Description: Resolved target year.
Example: 2025


### summary.this_year

Type: array<object>; Required: Yes; Nullable: No
Trigger: The summary is calculated; missing data produces zero-valued months.
Description: Twelve monthly savings values for the selected year.
Example: []


### summary.this_year[].month

Type: string; Required: Yes; Nullable: No
Trigger: The summary is calculated; missing data produces zero-valued months.
Description: Two-digit month number.
Example: 01


### summary.this_year[].amount

Type: number; Required: Yes; Nullable: No
Trigger: The summary is calculated; missing data produces zero-valued months.
Description: Revenue minus expense for the month.
Example: 1500000


### summary.last_year

Type: array<object>; Required: Yes; Nullable: No
Trigger: The summary is calculated; missing data produces zero-valued months.
Description: Twelve monthly savings values for the previous year.
Example: []


### summary.last_year[].month

Type: string; Required: Yes; Nullable: No
Trigger: The summary is calculated; missing data produces zero-valued months.
Description: Two-digit month number.
Example: 01


### summary.last_year[].amount

Type: number; Required: Yes; Nullable: No
Trigger: The summary is calculated; missing data produces zero-valued months.
Description: Revenue minus expense for the month.
Example: 1200000

## Error Response — HTTP 401

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The JWT is missing, invalid, or expired.
Description: Error description returned by the global HTTP exception filter.
Example: Không thể xác thực người dùng. Vui lòng đăng nhập lại.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 500

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: Savings calculation fails.
Description: Error description returned by the global HTTP exception filter.
Example: An internal server error occurred while processing the savings summary.
Note: The error envelope also contains success=false and may contain an error field.
