# REPAIR-001: UC-01 generated-source lint failure

- Run: `UC01-GPT56SOL-MEDIUM-FULL-R1`; trigger: `lint`; category: `technical`.
- First-pass source: `sha256:147a1cac5801f7e08ba74af17c5fd454e2c145bad00884b5e9497571f10069ab`.
- Evidence: `audit/initial/checks.json` (`sha256:b52900de14abc803df668659229e82fe73b0f49ab3d4e9571edd54605446ba15`). Targeted ESLint confirmed five `no-useless-escape` errors in each registration regex pair and one `require-await` error in the UC-01 migration rollback.
- Fingerprint: `UC01:lint:no-useless-escape:auth.service.ts+SignUpForm.tsx;require-await:CreateUsersForUc01.ts`.
- Affected BR IDs: `BR-REG-04`, `BR-REG-05` (password character validation); the migration lint correction changes no schema or BR behavior.
- Allowed source files: `finalsource/be/src/modules/auth/auth.service.ts`, `finalsource/fe/src/pages/Register/SignUpForm.tsx`, `finalsource/be/src/database/migrations/1789310000000-CreateUsersForUc01.ts`.
- Correction: remove only unnecessary regex escapes without changing the accepted character sets; remove the unnecessary `async` modifier from the rollback method while preserving its rejection behavior. Do not change the migration's DDL, registration API, credentials or business rules.
- Permitted checks: targeted ESLint on these three files, FE/BE production builds, full lint for remaining diagnostics, source/hash inspection and bounded Docker Compose health/reachability. No tests.
- After execution: reassess all frozen BRs and four flows against the final source revision; preserve first-pass evidence and researcher-attributed flow results on the first-pass revision.
