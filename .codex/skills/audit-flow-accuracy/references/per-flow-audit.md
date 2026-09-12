# Per-flow audit procedure

Read this before each audit. This procedure governs `completion-critical-flow-runtime-v2`; legacy assessments retain `completion-critical-flow-v1`. It changes evidence requirements, not frozen behavior, weights, BR acceptance, phases or gates. Audit/runtime time is excluded from generation execution time.

## Establish the subject and bounds

1. Resolve UC/run/stage, activation and its configuration checksum. Check `flow_audit_rubric`, baseline path/checksum, frozen UC checksum and source revision against the stage's preserved source evidence. Initial uses first-pass source; final uses final source. Do not use a moving worktree as the sole initial source reference.
2. Read every frozen flow in order: entry, preconditions, necessary shared main steps, branch condition, all steps and terminal outcome. Preserve IDs/text/order/criticality/branch points. A multi-clause step may have several evidence checks within one observation; never split the baseline or change the denominator. Record precise Sheet provenance/cell if ambiguous behavior affects evaluation and stop for researcher resolution; never repair the frozen UC.
3. Trace UI -> event handler -> API client -> controller/service -> storage -> response -> UI consumption. Save source findings separately with original path/lines, claim, limits and a sanitized immutable snapshot/excerpt checksum. A handler's existence does not show invocation; a `catch` does not show exception handling occurred.
4. Before operating, declare each attempt's scope, allowed data/actions, `planned_at` and time limit. Use only authorized runtime operations. Choose the limit from the flow's expected latency and available observation tools, then stop at completion, blocker or the limit. Preserve every attempt, including failures; explain divergent results rather than selecting only a lucky success.

## Verify the integrated runtime

Record Compose v2 project, relevant FE/BE/MySQL service/container/image IDs and state. Preserve sanitized deployment evidence linking those exact images/containers (and any bind mounts) to the audited source hash, using build provenance/source manifest and runtime inspection. Merely copying a source hash into the assessment or observing `healthy` is not deployment proof. Verify UI/API reachability through the run's actual integration configuration.

| Situation | Evidence and decision |
|---|---|
| Daemon unavailable | `runtime.status: BLOCKED`; record blocker, leave unobserved behavior `not_evaluable`; no native Node/MySQL fallback. |
| Source/image/container mapping unverified | `unverified`; retain diagnostic observations but no runtime `met`/`unmet` claims for that revision. |
| FE wrong route, envelope parsing or integration setting owned by run | Record application/integration failure when evidence identifies it; a critical failure makes the flow `incorrect`. |
| Data prerequisites or observation tool missing | Record affected targets, specific missing capability and impact; use `not_evaluable`. |
| Application versus environment cause unclear | Record `ambiguous_cause`; do not invent an application defect. |

Source may establish a clear missing implementation as static `unmet` even when runtime is blocked. Label it as static evidence, never as an observed runtime failure.

## Execute one connected attempt

Assign a unique `observation_id`. Record actual preconditions, entry kind/location, start/end timestamps and ordered actions with actual results and baseline target IDs. Start at the specified entry. UI-entry flows must be operated through the UI; direct API calls supplement the API segment only. Do not stitch a request, database row and screenshot from different attempts into one completion.

For Alternative/Exception Flows, traverse the required main-flow prefix to the frozen branch. Record the branch condition actually occurring, the branch response and its terminal outcome. Shared prefix steps retain their original IDs and create no new flow. An Exception Flow succeeds when the specified failure handling finishes; the primary operation need not succeed.

Choose evidence from the frozen requirement, not a universal layer checklist:

| Required behavior | Appropriate evidence |
|---|---|
| UI entry/action/result | Sanitized UI capture or observation transcript, showing actual interaction and end state. |
| Request/response | Actual route/method, response status and relevant sanitized envelope fields, correlated to this action/request. Redact credentials and sensitive payloads before saving. |
| Internal backend behavior | Correlated processing trace when needed; source explains internal implementation but does not replace completion observation. |
| Persistence or mandatory stored state | Read-only observation or suitable independent readback correlated to the same operation. A success toast alone is insufficient. |
| No registration API call | Network observation started before submission and ending after validation settles, with target/filter scope and capture method. Missing logs alone prove nothing. |
| Whole terminal outcome | Evidence for every frozen terminal clause, including UI consumption/session/navigation when required. |

A client-only validation branch can require UI and network-absence evidence without database evidence unless the frozen outcome requires storage verification. `runtime_trace` is a behavioral transcript with actual actions/results; never relabel source, build or health output as runtime evidence. Record required evidence kinds and their baseline-derived rationale on each critical/outcome `met` decision.

Do not change source, install mocks or add audit-only endpoints to force a branch. Do not stop shared services or change infrastructure beyond existing authorization. If the exception condition cannot be reached within authorized scope, record the limitation and `not_evaluable`; a source `catch` cannot make it `correct`.

## Decide and preserve

For every step and terminal outcome record evidence, rationale, separate source findings and a decision: `met` for proved behavior; `unmet` for evidenced failure; `not_evaluable` for insufficient/unreached observation. Every critical/outcome `met` references a verified runtime attempt and target-specific evidence. Unsupported `met` is invalid input, not an automatic fallback.

Apply precedence: critical/outcome `unmet` -> `incorrect`; otherwise missing critical/outcome proof or a complete connected attempt -> `not_evaluable`; otherwise `correct`. Noncritical deviations remain visible without failing the flow. If an early critical step fails, later unreached steps remain `not_evaluable`, while the flow is `incorrect`. All critical/outcome completion claims for `correct` must resolve to the same completed `completion_observation_id`.

Save artifacts under `runs/<RUN-ID>/flow-accuracy/evidence/<assessment-id>/<observation-id>/`; use an assessment-local directory such as `_source` or `_runtime` for static/deployment evidence. Sanitize before hashing: never save passwords, JWTs, session cookies, full account numbers or sensitive payloads, including screenshots, HAR headers and query output. Preserve source excerpts with original path/locator and audited revision. Validate with scorer `--dry-run`, then persist immutable JSON/Markdown. Reviewers must inspect the evidence content; structural validation cannot prove that an image or transcript supports a claim.

Final Audit Gate creates a fresh assessment, revision/deployment check and observations for every flow under the original rubric, even if repair was skipped. New observation IDs/timestamps and assessment-local evidence prevent initial-to-final reuse. An inaccessible final flow is recorded as unknown, not copied from initial. Audit never repairs defects: return them to Repair Decision Gate.

## UC-01 illustrations (not assessments or test cases)

Read the frozen UC-01 specification, provenance `Use cases!A5:B25`, and its frozen baseline for actual IDs/criticality. These illustrations do not rescore any existing run or add behavior:

- Basic: operate `/register`, submit through the form, observe `POST /api/auth/register`, correlate persistence and response to that submission, then observe authenticated session establishment and navigation to `/`. If the API succeeds and creates the account but the frontend demonstrably fails to establish the required session, the terminal outcome is `unmet` and the flow is `incorrect`. If session behavior cannot be observed, that clause remains `not_evaluable`.
- AF-1: traverse the form prefix to preliminary validation, observe field errors and the scoped absence of the registration request. A screenshot of errors alone does not establish absence of API activity.
- AF-2: reach the conflict branch through the UI with an authorized existing-data prerequisite; correlate backend rejection with the returned message rendered by the frontend. A standalone API rejection does not prove the UI branch completes.
- EF-1: observe an actual unexpected request failure within authorized scope, followed by failure notification and remaining on the registration form. If the condition cannot be produced without unapproved infrastructure changes, retain source findings but record the unobserved branch as `not_evaluable`.
