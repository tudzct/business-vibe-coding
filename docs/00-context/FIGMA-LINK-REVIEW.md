# Figma Link Review for 16 Use Cases

## Purpose and usage

This file is a **downstream review/mapping input**. Do not edit the 16 immutable use case files in `docs/01-inception/use-cases/`.

The researcher has confirmed the standard URLs in the **Replacement URL** column and the occurrence section below. This is the authoritative mapping source for Codex; do not read the old file keys from the immutable UCs to replace these values. `NOT_APPLICABLE` means the source UC does not provide a Figma design.

On 2026-08-27, the researcher replaced the UC-01 mapping with the `VibeTesting` Figma file. The Figma connector confirmed that node `66:4728` in the original URL is the `Design` canvas, not the registration frame; the correct frame is `137:8071`, named `102. Signup`, in the same file. The mapping has been corrected according to the connector evidence and applied to the current frozen UC `docs/01-inception/use-cases/uc-01-register-account.md`, which has its source specification at `Use cases!A5:B25`. On the same day, the previously confirmed Login mapping was reassigned to the current frozen UC `docs/01-inception/use-cases/uc-02-login.md`, which has its source specification at `Use cases!A26:B44`.

After the review is complete, Codex will:

1. Test each replacement URL using the Figma plugin.
2. Confirm the file key, node ID, frame name, and accessibility.
3. Create a frozen design dataset with provenance and checksum.
4. Create a skill to map the immutable source UC to the dataset; do not edit the original UC.

## Summary list

| UC | Use case | Source UC | Current file key | Current node ID | Occurrence count | Replacement URL | Review status / note |
|---|---|---|---|---|---:|---|---|
| UC-001 | Register an Account | `docs/01-inception/use-cases/uc-01-register-account.md` | `BTSOvEnU2X3CNrNvSxX9Ry` | `137:8071` | 0 (external mapping) | `https://www.figma.com/design/BTSOvEnU2X3CNrNvSxX9Ry/Finebank---Financial-Management-Dashboard-UI-Kits--Community---VibeTesting-?node-id=137-8071&p=f&t=LTofk7XE4yZcHPBU-0` | Researcher-authorized correction for current UC-01; connector-verified frame `102. Signup`. |
| UC-002 | Log In | `docs/01-inception/use-cases/uc-02-login.md` | `BTSOvEnU2X3CNrNvSxX9Ry` | `137:7477` | 0 (external mapping) | `https://www.figma.com/design/BTSOvEnU2X3CNrNvSxX9Ry/Finebank---Financial-Management-Dashboard-UI-Kits--Community---VibeTesting-?node-id=137-7477&t=LaQ5xK7Lt3sAWQLV-0` | Previously researcher-confirmed Login mapping, retargeted to current UC-02; capture the node into a new frozen dataset before frontend generation or UI audit. |
| UC-003 | View the list of transactions | `docs/01-inception/use-cases/uc-03-view-transaction-list.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5474` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5474&t=JIvgR8yO5kRKVT0b-0` | Standard URL has been confirmed by the researcher. |
| UC-004 | Add a new transaction | `docs/01-inception/use-cases/uc-04-create-new-transaction.md` | — | — | 0 | `NOT_APPLICABLE` | Source UC does not contain a Figma URL. |
| UC-005 | View list of bank accounts | `docs/01-inception/use-cases/uc-05-view-user-account-list.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5320` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5320&t=JIvgR8yO5kRKVT0b-0` | Standard URL has been confirmed by the researcher. |
| UC-006 | Add a new account | `docs/01-inception/use-cases/uc-06-add-new-account.md` | — | — | 0 | `NOT_APPLICABLE` | Source UC does not contain a Figma URL. |
| UC-007 | Edit account | `docs/01-inception/use-cases/uc-07-edit-account-information.md` | — | — | 0 | `NOT_APPLICABLE` | Source UC does not contain a Figma URL. |
| UC-008 | Delete bank account | `docs/01-inception/use-cases/uc-08-delete-account-and-related-transactions.md` | — | — | 0 | `NOT_APPLICABLE` | Source UC does not contain a Figma URL. |
| UC-009 | View Bank Account Details | `docs/01-inception/use-cases/uc-09-view-account-details.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `416:7878` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-7878&t=JIvgR8yO5kRKVT0b-0` | Standard URL has been confirmed by the researcher. |
| UC-010 | View Monthly Expenses | `docs/01-inception/use-cases/uc-10-view-monthly-expenses.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5698` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0` | Standard URL confirmed to share a node with UC-011. |
| UC-011 | View Expenditure Details by Category | `docs/01-inception/use-cases/uc-11-view-expense-details-by-category.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5698` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0` | Standard URL confirmed to share a node with UC-010. |
| UC-012 | View Upcoming Invoices List | `docs/01-inception/use-cases/uc-12-view-upcoming-bills-list.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5609` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5609&t=JIvgR8yO5kRKVT0b-0` | Standard URL has been confirmed by the researcher. |
| UC-013 | View the list of Goals | `docs/01-inception/use-cases/uc-13-view-goals-list.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5829` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0` | Standard URL confirmed to share a node with UC-016. |
| UC-014 | Create a New Goal | `docs/01-inception/use-cases/uc-14-create-new-goal.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `416:6052` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-6052&t=JIvgR8yO5kRKVT0b-0` | Standard URL has been confirmed by the researcher. |
| UC-015 | Adjust Monthly Goals | `docs/01-inception/use-cases/uc-15-adjust-goal.md` | — | — | 0 | `NOT_APPLICABLE` | Source UC does not contain a Figma URL. |
| UC-016 | View Savings Summary Chart | `docs/01-inception/use-cases/uc-16-view-savings-summary-chart.md` | `7lyW3RmfX2jUM2VI6XdHK9` | `66:5829` | 2 | `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0` | Standard URL confirmed to share a node with UC-013. |

## Current URLs by exact occurrence

The URLs below are the standard replacement URLs for each exact occurrence confirmed by the researcher. They do not assert that the immutable UC file content has been edited. The summary table and this list must have the same file key/node ID; when the `t` token is different, the file key and node ID are the mapping identifiers.

### UC-001

- The current Frozen UC does not contain a Figma URL occurrence. The researcher has provided a replacement mapping outside the UC:
  `https://www.figma.com/design/BTSOvEnU2X3CNrNvSxX9Ry/Finebank---Financial-Management-Dashboard-UI-Kits--Community---VibeTesting-?node-id=137-8071&p=f&t=LTofk7XE4yZcHPBU-0`

### UC-002

- The current Frozen UC does not contain a Figma URL occurrence. The previously confirmed Login mapping was reassigned outside the UC:
  `https://www.figma.com/design/BTSOvEnU2X3CNrNvSxX9Ry/Finebank---Financial-Management-Dashboard-UI-Kits--Community---VibeTesting-?node-id=137-7477&t=LaQ5xK7Lt3sAWQLV-0`

### UC-003

- Line 53: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5474&t=JIvgR8yO5kRKVT0b-0`
- Line 170: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5474&t=JIvgR8yO5kRKVT0b-0`

### UC-004

- No Figma URL in the source UC.

### UC-005

- Line 48: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5320&t=JIvgR8yO5kRKVT0b-0`
- Line 139: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5320&t=JIvgR8yO5kRKVT0b-0`

### UC-006

- No Figma URL in the source UC.

### UC-007

- No Figma URL in the source UC.

### UC-008

- No Figma URL in the source UC.

### UC-009

- Line 52: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-7878&t=JIvgR8yO5kRKVT0b-0`
- Line 161: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-7878&t=JIvgR8yO5kRKVT0b-0`

### UC-010

- Line 50: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0`
- Line 120: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0`

### UC-011

- Line 46: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0`
- Line 139: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5698&t=JIvgR8yO5kRKVT0b-0`

### UC-012

- Line 45: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5609&t=JIvgR8yO5kRKVT0b-0`
- Line 133: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5609&t=JIvgR8yO5kRKVT0b-0`

### UC-013

- Line 47: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0`
- Line 144: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0`

### UC-014

- Line 48: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-6052&t=JIvgR8yO5kRKVT0b-0`
- Line 135: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=416-6052&t=JIvgR8yO5kRKVT0b-0`

### UC-015

- No Figma URL in the source UC.

### UC-016

- Line 45: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0`
- Line 126: `https://www.figma.com/design/7lyW3RmfX2jUM2VI6XdHK9/Finebank---Financial-Management-Dashboard-UI-Kits--Community---Copy-?node-id=66-5829&t=JIvgR8yO5kRKVT0b-0`

## Conditions to begin dataset creation

- All 16 UCs already have a valid replacement URL or an intentional `NOT_APPLICABLE`.
- Each replacement URL must contain an exact `fileKey` and `node-id`; do not use file-only URLs.
- The shared node pairs (`UC-010/011`, `UC-013/016`) have been confirmed according to the standard URLs.
- The dataset is only created from the checked replacement URLs, do not auto-fallback to an inaccessible URL in the UC.
- Do not store cookies, OAuth tokens, or Figma credentials in the repository.
