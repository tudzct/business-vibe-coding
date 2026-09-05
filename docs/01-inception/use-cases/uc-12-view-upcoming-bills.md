---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-12
uc_name: "View Upcoming Bills"
source_type: google-sheets
source_spreadsheet_id: 1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM
source_sheet: "Use cases"
source_range: "A258:B275"
retrieved_at: 2026-09-04T12:21:28Z
---

# UC-12: View Upcoming Bills

> Canonical source: [Financial Management Specification](https://docs.google.com/spreadsheets/d/1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM/edit?gid=0#gid=0), tab Use cases, range A258:B275. This frozen repository projection is read-only; source corrections must be made in the spreadsheet and imported as a new revision.

## Functional Use-Case Specification

### Use Case ID

UC-12

### Use Case Name

View Upcoming Bills

### Description

As an authenticated user, I want to view upcoming bills so that I can review bills that require attention in the near term.

### Actor(s)

Authenticated User

### Priority

Not Specified

### Trigger

The user opens the Bills page.

### Pre-Condition(s)

PRE-1: The user is authenticated.

### Post-Condition(s)

POST-1: After processing, the applicable upcoming-bill information is displayed on /bills.
POST-2: If no applicable bill data is available, the page displays its empty state.
POST-3: The operation does not modify stored bill data.

### Basic Flow

1. The user opens the Bills page.
2. The frontend requests the user's upcoming-bill data.
3. The backend authenticates the request.
4. The backend retrieves and processes the relevant bill data according to the applicable business rules.
5. The backend returns the resulting bill list.
6. The frontend prepares the returned bill data for display.
7. The frontend displays the resulting upcoming-bill view on the Bills page.

### Alternative Flow

AF-1: No applicable upcoming bills
5a. The backend returns an empty bill list.
6a. The frontend does not prepare bill cards.
7a. The frontend displays its no-upcoming-bills state.

AF-2: Retry loading
7b. After a loading error, the user selects the retry action.
2b. The frontend sends the upcoming-bill request again and the flow continues from Step 3.

### Exception Flow

EF-1: Authentication failure
3a. The backend cannot authenticate the request.
3b. The backend returns HTTP 401.
3c. The frontend applies the application's authentication-error handling.

EF-2: Retrieval or processing failure
4a. An unexpected error occurs while retrieving or processing bill data.
4b. The backend returns HTTP 500.
4c. The frontend displays its bill-loading error state.

### Related UI

BillsPage; UpcomingBills; route /bills

### Related API IDs

API-BILL-LIST

### Notes

Experiment isolation:
- BR-BILL-UP-01 through BR-BILL-UP-06 are the treatment-sensitive Business Rules for UC-12.
- Description, pre/post-conditions, flows, UML, and non-BR API fields intentionally avoid restating the eligibility window, charged-cycle exclusion, tie-break ordering, normalization, and exact-coverage semantics.
- Read-only behavior is redundantly constrained by the GET operation and is not a core treatment-sensitive Business Rule.
- Authentication failure, retrieval failure, and the project-standard response envelope are API/project concerns rather than core Business Rules.
- Figma layout/styling requirements remain UI evidence and are not part of the core Business Rule score.
- "Pay Now" behavior remains outside the scope of UC-12.

## UML Model

~~~plantuml
@startuml

class AuthenticatedRequest <<SecurityContext>> {
  userId: Integer [1]
}

class Bill <<Entity>> {
  billId: Integer [1]
  userId: Integer [1]
  dueDate: Date [1]
  logoUrl: String [0..1]
  itemDescription: String [1]
  lastChargeDate: Date [0..1]
  amount: Decimal [1]
}

class BillDto <<DTO>> {
  billId: Integer [1]
  userId: Integer [1]
  itemDescription: String [1]
  logoUrl: String [0..1]
  dueDate: String [1]
  lastChargeDate: String [0..1]
  amount: Decimal [1]
}

class BillsResponseDto <<DTO>> {
  success: Boolean [1]
  message: String [1]
  data: BillDto [*]
}

class BillController <<Controller>> {
  getBills(request: AuthenticatedRequest): BillsResponseDto
}

class BillService <<Service>> {
  findUpcomingBillsByUserId(userId: Integer): Sequence(BillDto)
}

class BillsPage <<UI>>
class UpcomingBills <<UI>>

BillController ..> AuthenticatedRequest
BillController ..> BillsResponseDto
BillController ..> BillService
BillService ..> Bill
BillService ..> BillDto
BillsResponseDto --> BillDto
BillDto ..> Bill
BillsPage --> UpcomingBills
UpcomingBills ..> BillsResponseDto

@enduml
~~~

## Business Rules

The following rules are authoritative for Prompt E. OCL is preserved where supplied; technical or non-OCL constraints remain authoritative natural-language requirements.

~~~text
BR-BILL-UP-01: Authenticated ownership scope

context BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)

pre BR_BILL_UP_01_AuthenticatedIdentity:
  not userId.oclIsUndefined()

post BR_BILL_UP_01_OwnedBillsOnly:
  result->forAll(dto |
    Bill.allInstances()->exists(bill |
      bill.billId = dto.billId and
      bill.userId = userId
    )
  )

Technical constraints:
- The userId used for bill retrieval shall come from the validated authenticated request context.
- A client-supplied user identifier shall not override the authenticated userId.
- Bills owned by another user shall never contribute to the result.

BR-BILL-UP-02: Near-term eligibility window

context BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)

post BR_BILL_UP_02_WithinWindow:
  result->forAll(dto |
    Bill.allInstances()->exists(bill |
      bill.billId = dto.billId and
      bill.userId = userId and
      bill.dueDate >= currentDateAtMidnight() and
      bill.dueDate <= addDays(currentDateAtMidnight(), 30)
    )
  )

Technical constraints:
- Upcoming eligibility is evaluated against an inclusive 31-day calendar window: today through 30 calendar days after today.
- currentDateAtMidnight() represents the backend system's current calendar date with hour, minute, second, and millisecond set to zero.
- Bills due before today are overdue and shall be excluded.
- Bills due more than 30 calendar days after today shall not appear in the Upcoming Bills result.

BR-BILL-UP-03: Already-charged cycle exclusion

context BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)

post BR_BILL_UP_03_NotAlreadyChargedForDueCycle:
  result->forAll(dto |
    Bill.allInstances()->exists(bill |
      bill.billId = dto.billId and
      (
        bill.lastChargeDate.oclIsUndefined() or
        bill.lastChargeDate < bill.dueDate
      )
    )
  )

Technical constraint:
- A bill whose lastChargeDate is equal to or later than its dueDate is treated as already charged for that due cycle and shall be excluded from the Upcoming Bills result.

BR-BILL-UP-04: Deterministic urgency ordering

context BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)

post BR_BILL_UP_04_Ordered:
  result->size() <= 1 or
  Sequence{1..result->size() - 1}->forAll(i |
    let a : BillDto = result->at(i),
        b : BillDto = result->at(i + 1)
    in
      a.dueDate < b.dueDate or
      (
        a.dueDate = b.dueDate and
        (
          a.amount > b.amount or
          (a.amount = b.amount and a.billId < b.billId)
        )
      )
  )

Technical constraints:
- Bills shall be ordered by dueDate ascending.
- Bills sharing the same dueDate shall be ordered by amount descending.
- Bills sharing both dueDate and amount shall be ordered by billId ascending.

BR-BILL-UP-05: Response normalization

context BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)

post BR_BILL_UP_05_NormalizedMapping:
  result->forAll(dto |
    Bill.allInstances()->exists(bill |
      bill.billId = dto.billId and
      dto.userId = bill.userId and
      dto.itemDescription = trim(bill.itemDescription) and
      dto.amount = round2(bill.amount) and
      dto.dueDate = formatDate(bill.dueDate) and
      (
        bill.lastChargeDate.oclIsUndefined()
        implies dto.lastChargeDate.oclIsUndefined()
      ) and
      (
        not bill.lastChargeDate.oclIsUndefined()
        implies dto.lastChargeDate = formatDate(bill.lastChargeDate)
      ) and
      (
        (bill.logoUrl.oclIsUndefined() or trim(bill.logoUrl).size() = 0)
        implies dto.logoUrl.oclIsUndefined()
      ) and
      (
        (not bill.logoUrl.oclIsUndefined() and trim(bill.logoUrl).size() > 0)
        implies dto.logoUrl = trim(bill.logoUrl)
      )
    )
  )

Technical constraints:
- itemDescription shall be trimmed before it is returned.
- amount shall be rounded to two decimal places.
- dueDate shall be formatted as YYYY-MM-DD.
- lastChargeDate shall be formatted as YYYY-MM-DD when present and returned as null when absent.
- logoUrl shall be trimmed; a missing or blank value shall be returned as null.

BR-BILL-UP-06: Exact coverage, uniqueness, and empty result

context BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)

post BR_BILL_UP_06_UniqueBills:
  result->isUnique(dto | dto.billId)

post BR_BILL_UP_06_AllAndOnlyEligibleBills:
  let eligible : Set(Bill) =
    Bill.allInstances()
      ->select(bill |
        bill.userId = userId and
        bill.dueDate >= currentDateAtMidnight() and
        bill.dueDate <= addDays(currentDateAtMidnight(), 30) and
        (
          bill.lastChargeDate.oclIsUndefined() or
          bill.lastChargeDate < bill.dueDate
        )
      )
      ->asSet()
  in
    result->size() = eligible->size() and
    result->forAll(dto |
      eligible->exists(bill | bill.billId = dto.billId)
    )

Technical constraint:
- If no eligible bill exists after all business rules are applied, the successful result shall contain an empty data array.
~~~
