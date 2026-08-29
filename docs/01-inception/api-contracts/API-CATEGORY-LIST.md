---
artifact_type: api-contract
status: Frozen
api_id: API-CATEGORY-LIST
related_uc_ids: [UC-04, UC-11, UC-14]
---

# API-CATEGORY-LIST: List Categories

## General Information

### API ID

API-CATEGORY-LIST

### API Name

List Categories

### Related Use Case IDs

UC-04; UC-11; UC-14

### Method

GET

### Path

/api/categories

### Description

Return all available transaction and goal categories.

### Authentication

Public

### Authorization

None

## Business Rules / Validation Constraints

- BR-CAT-01 — Alphabetical category list: Categories shall be returned ordered by categoryName ascending.

## Request Body

None

## Success Response — HTTP 200

### success

Type: boolean; Required: Yes; Nullable: No
Trigger: Categories are retrieved.
Description: Indicates successful retrieval.
Example: true


### message

Type: string; Required: Yes; Nullable: No
Trigger: Categories are retrieved.
Description: Human-readable success message.
Example: Lấy danh sách danh mục thành công


### data

Type: array<object>; Required: Yes; Nullable: No
Trigger: Categories are retrieved.
Description: Category array. May be empty.
Example: []


### data[].category_id

Type: integer; Required: Yes; Nullable: No
Trigger: Categories are retrieved.
Description: Category identifier.
Example: 3


### data[].category_name

Type: string; Required: Yes; Nullable: No
Trigger: Categories are retrieved.
Description: Category name.
Example: Entertainment

## Error Response — HTTP 500

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: Category retrieval fails.
Description: Error description returned by the global HTTP exception filter.
Example: Đã xảy ra lỗi hệ thống khi lấy danh sách danh mục. Vui lòng thử lại sau.
Note: The error envelope also contains success=false and may contain an error field.
