# Experiment run UC03-RQ3-SOL-MEDIUM-R1

- UC: `UC-03`
- Prompt variant: `rq3`
- Canonical input: `docs\05-experiments\UC-03\UC03-RQ3-SOL-MEDIUM-R1.json`
- Input SHA-256: `54a467fa74f54f253777b35a53b15040e1c5a5971fcf0820923118d7418d84ad`

## Final Business Rule assessment

| BR ID | Status | Evidence |
|---|---|---|
| BR-TXN-01 | met | finalsource/be/src/modules/auth/jwt.strategy.ts queries users by the signed token subject and throws UnauthorizedException when no User exists; Bounded current-source observation returned HTTP 401 for a correctly signed JWT whose subject was absent from users; finalsource/be/src/modules/transaction/transaction.service.ts scopes rows through account.userId |
| BR-TXN-02 | met | Source evidence from the immutable initial assessment remains valid after repairs; Bounded current-source All, Revenue and Expense requests each returned HTTP 200; the empty database made the filtered row predicates vacuously true |
| BR-TXN-03 | met | Source evidence from the immutable initial assessment remains valid after repairs; Bounded current-source limit-1 pagination request returned HTTP 200 with page size and hasMore formula consistent with the empty result |
| BR-TXN-04 | met | Read-only INFORMATION_SCHEMA.KEY_COLUMN_USAGE inspection at 2026-08-31T15:29:20Z found accounts.user_id -> users.id, transactions.account_id -> accounts.account_id and transactions.category_id -> categories.category_id; Read-only aggregate integrity queries at 2026-08-31T15:29:20Z returned 0 orphan accounts, 0 transactions without an account and 0 non-null transaction categories without a category; docs/03-audit/docker-deployment/operations/20260831T152920Z-review.json |
| BR-TXN-05 | met | Bounded final current-source request returned HTTP 200 with data=[], total=0 and hasMore=false; Frontend /transactions route returned HTTP 200 and source renders the empty-state message |
| BR-TXN-06 | met | Source field-by-field mapping evidence from the immutable initial assessment remains valid after repairs; The final success envelope contains only the declared domain container; the database has no rows for a nonempty runtime mapping observation |
| BR-TXN-07 | met | Source read-only query evidence from the immutable initial assessment remains valid after repairs; Aggregate Transaction/Account count-and-ID snapshots were identical before and after bounded final list/filter/pagination requests |

Met: 7/7 (100.0%)
