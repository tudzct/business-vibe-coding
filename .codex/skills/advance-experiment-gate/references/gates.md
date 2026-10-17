# Internal command records

Canonical `gates` stores append-only receipts for actions explicitly supplied by an authorized caller. This reference documents persistence integrity, not a user-facing sequence or a recommendation about what operation follows.

Use `record_command.py` and actual turn IDs; no fabricated confirmation times. Apply the script's validation for the supplied action, preserve recorded receipts and their hashes/times, and validate optional activation when present. A successful write authorizes no unsupplied action. Initial/final evidence, frozen rubric and source provenance remain required; UI scoring is optional.
