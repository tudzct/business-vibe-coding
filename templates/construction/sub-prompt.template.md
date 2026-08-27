# Bug-fixing Sub-prompt Template

## Run context

- Use case: `[UC ID - NAME]`
- Parent coding prompt: `[PATH / REVISION]`
- Repair iteration: `[N]`
- Repair ID and sub-prompt path: `[repair-NNN / PATH]`
- Category / trigger: `[TECHNICAL | SECURITY | UI | FLOW] / [SYNTAX | COMPILE | LINT | RUNTIME | SCA | SECURITY_REVIEW | UI_REVIEW | FLOW_REVIEW]`
- Repair model requested/effective ID, snapshot, reasoning effort/mode: `[MODEL TELEMETRY]`
- Error source: `[SYNTAX / COMPILE / LINT / RUNTIME / SCA / SECURITY REVIEW / UI REVIEW / FLOW REVIEW]`
- Error evidence: `[EXACT ERROR, OBSERVED BEHAVIOR, FILE/LINE OR SCREEN]`
- Error fingerprint: `[STABLE NORMALIZED IDENTIFIER]`
- Expected behavior / unmet requirement IDs: `[AC / BR / SR IDs]`
- Source revision before repair: `[REVISION / HASH]`
- Dedicated timing method: `system_timestamp_delta`
- Automatic start ISO / epoch milliseconds: `[ISO-8601] / [EPOCH_MS]`

## Objective

Fix only the evidenced error above and restore compliance with the referenced approved requirements.

## Mandatory boundaries

- Inspect the current implementation and identify the root cause before editing.
- Make the smallest coherent change necessary for this error.
- MUST NOT change approved business rules, API contracts, database schema, authentication/authorization policy, public behavior, architecture or unrelated UI unless the parent prompt explicitly requires it.
- MUST NOT invent a new business rule, workflow, screen, endpoint, entity, dependency or security requirement.
- MUST NOT delete, bypass or weaken Prompt E controls or validation to hide the error.
- Preserve already-correct functionality and unrelated user changes.
- If the repair requires a prohibited change or the evidence is insufficient, stop and report the required decision instead of guessing.
- Generate source-code corrections only. Do not create or run tests or test cases.

## Required completion

Report root cause, files changed, precise correction, source revision after repair, unresolved items and whether referenced SRs are now satisfied based on available code/configuration/lockfile/build/runtime/SCA evidence. Capture this repair's automatic end ISO/epoch timestamp after correction/evidence and before audit append, then derive the timestamp delta. Invoke `$audit-generation-metrics` and append raw start/end pairs, duration, model, tokens, before/after evidence and status. Increment the total sub-prompt count for every invocation; increment the security-repair subset only when the category is `security` and at least one frozen SR is directly repaired.
