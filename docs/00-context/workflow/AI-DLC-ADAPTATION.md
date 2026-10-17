# Technical execution boundaries

This repository uses file-pinned inputs and operation-owned skills. This document contains no command roadmap.

## Input handling

- Resolve one exact active run.
- Validate required project inputs and checksums read-only.
- Never create or repair prepared inputs as a side effect of another operation.
- Preserve immutable source and evidence revisions.

## Source handling

- Mutate source only when the active operation explicitly authorizes it.
- Keep changes within `finalsource/` and the declared scope.
- Map persistence code to the existing configured database structure.
- Preserve actual timing endpoints and source provenance.

## Artifact handling

- Write only artifacts owned by the active operation.
- Consume another operation's output only through its validated handoff contract.
- Never read the producer operation's private prompt, template or instructions merely because its artifact exists.
- Never overwrite an earlier observation with a later one.

## Runtime handling

Use Docker Compose v2 and sanitized evidence. Do not execute schema setup inside an active run. Do not create or run tests unless the active skill explicitly authorizes them.
