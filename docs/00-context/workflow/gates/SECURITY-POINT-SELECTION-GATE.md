# Security point selection gate

Run this logical gate before generating a security resource or security coding prompt. Read the researcher decision from a Confirmed unified configuration; never infer or default it.

## Modes

- `researcher_selected`: require at least one valid unique A01–A10 SEC ID and preserve the exact list. Unselected items are excluded by researcher selection.
- `all_catalog`: require all 50 active SEC IDs and totals A01=5, A02=5, A03=5, A04=5, A05=5, A06=5, A07=5, A08=5, A09=5, A10=5, overall=50. Do not omit an item because it appears inapplicable or invent behavior to make it applicable.

Reject IDs outside A01–A10 for new runs, missing researcher identity/time/mode/IDs, duplicates and inconsistent totals. Never aggregate different selection modes as one group unless selection mode is an explicit independent variable.

## Persistent receipt

Create `docs/02-construction/implementation/<UC-ID>/security-scope-activation.json` from `templates/research/security-scope-activation.template.json`. It contains only UC identity, configuration path/checksum, activation timestamp and status. Resolve the mode, SEC IDs, totals, researcher decision and catalog revision directly from the Confirmed configuration; do not duplicate them in the receipt.

Historical `security-point-selection.md` files remain read-only evidence.
