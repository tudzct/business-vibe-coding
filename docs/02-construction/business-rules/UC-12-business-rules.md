---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-12
source_use_case: docs/01-inception/use-cases/uc-12-view-upcoming-bills.md
source_use_case_sha256: sha256:bb6be1ec8dcf33a8e823294766b0f15d765ef1c7ec57191b0a941a594249585b
---

# UC-12 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A258:B275`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-09-04T12:21:28Z`

## Ordered Business Rules

### BR-BILL-UP-01 - Authenticated ownership scope

- Representation: `ocl_precondition`
- Context: `BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)`
- Enforcement layers: `backend`, `database`
- Failure behavior: A missing, invalid, or expired JWT is rejected with HTTP 401; successful retrieval uses the validated authenticated userId and excludes bills owned by another user.
- Traceability: `Use cases!A258:B275`, UC-12 PRE-1, Basic Flow 2-5, EF-1, `API-BILL-LIST`

~~~text
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
~~~

### BR-BILL-UP-02 - Near-term eligibility window

- Representation: `ocl_postcondition`
- Context: `BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)`
- Enforcement layers: `backend`, `database`
- Failure behavior: Only bills due within the inclusive today-through-30-calendar-days window appear in a successful result; the source defines no separate error response for an eligibility violation.
- Traceability: `Use cases!A258:B275`, UC-12 Basic Flow 4-5, AF-1, UML `Bill.dueDate`

~~~text
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
~~~

### BR-BILL-UP-03 - Already-charged cycle exclusion

- Representation: `ocl_postcondition`
- Context: `BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)`
- Enforcement layers: `backend`, `database`
- Failure behavior: Bills already charged for their due cycle are excluded from a successful result; the source defines no separate error response for an eligibility violation.
- Traceability: `Use cases!A258:B275`, UC-12 Basic Flow 4-5, AF-1, UML `Bill.lastChargeDate`

~~~text
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
~~~

### BR-BILL-UP-04 - Deterministic urgency ordering

- Representation: `ocl_postcondition`
- Context: `BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)`
- Enforcement layers: `backend`, `database`
- Failure behavior: Successful results use the defined dueDate, amount, and billId ordering; the source defines no separate error response for an ordering violation.
- Traceability: `Use cases!A258:B275`, UC-12 Basic Flow 4-7, UML `BillDto`

~~~text
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
~~~

### BR-BILL-UP-05 - Response normalization

- Representation: `ocl_postcondition`
- Context: `BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)`
- Enforcement layer: `backend`
- Failure behavior: Successful bill DTOs use the defined trimming, rounding, date formatting, and null normalization; response-processing failures return HTTP 500 with the API's safe message.
- Traceability: `Use cases!A258:B275`, UC-12 Basic Flow 4-6, EF-2, UML `Bill` and `BillDto`, `API-BILL-LIST`

~~~text
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
~~~

### BR-BILL-UP-06 - Exact coverage, uniqueness, and empty result

- Representation: `ocl_postcondition`
- Context: `BillService::findUpcomingBillsByUserId(userId : Integer) : Sequence(BillDto)`
- Enforcement layers: `backend`, `database`, `frontend`
- Failure behavior: A successful response contains every eligible bill exactly once and no ineligible bill; when none exists, the backend returns an empty data array and the frontend displays the no-upcoming-bills state.
- Traceability: `Use cases!A258:B275`, UC-12 POST-2, Basic Flow 4-7, AF-1, `API-BILL-LIST` HTTP 200

~~~text
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

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
