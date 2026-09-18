# Automatic experiment configuration preflight

A comparison group uses a researcher-prepared Confirmed configuration before prompt generation. The researcher prepares the JSON outside the generation workflow and sets `status: Confirmed`; this is the configuration authorization. There is no Configuration Gate summary or additional confirmation turn. The JSON is canonical; root `.env` is optional preparation convenience only and its absence never blocks a valid configuration. The configuration fixes:

- configuration/comparison-group/researcher identifiers;
- UC IDs and expected ordered BR IDs;
- generation and audit model assignments;
- replicate indexes and unique run order;
- audit protocol and timing method.
- the activated Figma dataset version and manifest checksum;
- per-UC frozen BR and flow baseline paths;
- `database_baseline`: DBML path/hash and runtime MySQL schema fingerprint, governed by the configuration's existing status.

Configurations fix `timing_method` to `system_timestamp_delta`, pin the active Figma dataset, and freeze `flow_audit_rubric: completion-critical-flow-runtime-v2` before generation. The validator rejects missing/mismatched values and mixed flow rubrics within one comparison group, including Full/RQ3 and model conditions. `audit_design.protocol` still assigns auditors; it never stores the rubric.

On `$gen-coding-prompt`, resolve exactly one configuration and UC/run assignment from explicit arguments, the checksum-pinned canonical run, or a unique matching configuration. Never select the newest file or guess between matching runs. Run `gen-coding-prompt/scripts/preflight_configuration.py` before creating artifacts. Missing/invalid/ambiguous configuration, non-Confirmed status, conflicting identities, checksum drift or unresolved input semantics stops generation with the exact blocker. Never repair or confirm a configuration automatically; the researcher supplies a corrected configuration, with a new ID if already frozen by evidence.

Four research JSON inputs must exist before `$gen-coding-prompt`: the Confirmed configuration, frozen `business-rule-baseline.json`, frozen `flow-baseline.json` and Draft Canonical Run JSON (`run_status: draft`). Their referenced UC/resource/API/Figma evidence must also be valid. The researcher chooses their preparation method: manual editing, another model, external Python or optional repository helpers. Validate file existence, content, schema, identity and checksum, never the creator or whether a particular skill/command ran. A missing, malformed or conflicting input immediately blocks generation. Preflight is read-only: never create, fill, initialize, repair or normalize any of these four files, or invoke a creation skill to fill gaps. A valid input set proceeds directly to prompt START and Draft generation without an administrative confirmation.

Preparation must already have set canonical `gates` to `{"current": "prompt", "history": []}` and pinned the actual configuration path, ID and SHA-256 in `experiment_configuration`. Before first measurement, `metrics` is null; before prompt closure, `coding_prompt` is null. Missing future approval/audit results are not missing preparation fields and must not be fabricated. Canonical Run JSON is distinct from `phase-ledger.json`, the live timestamp journal. After preflight passes, the deterministic capture helper appends actual timing evidence; later approval/audit/measurement may update the existing canonical run normally. These writes do not authorize initialization of missing core inputs. Whole-turn token usage still includes real validation and measurement overhead; never claim zero overhead or deduct estimated tokens.

Verification runs inside explicitly requested repair work. Follow [the command sequence](../FILE-DRIVEN-WORKFLOW.md). Prompt close approves the Draft and pins its checksum; source close ends first-pass telemetry; audit is directly requested; the repair command records authorization; finalize closes Repair and workflow telemetry.

Generation additionally requires the fifth database input. Configuration requires exactly `database_baseline.dbml_path`, `dbml_sha256` and `schema_fingerprint_sha256`. Offline configuration validation checks the file/pins; Prompt/Source preflight calls the runtime helper internally in the same invocation before START. Missing database pins block generation. Activation/Measure do not query MySQL. See [database policy](../../engineering/DATABASE-SCHEMA.md). Never initialize missing DB inputs, change pins or request schema approval within generation.

The four JSON inputs and the database input are mandatory for generation. `run-activation.json` is validated when present and created by prompt close when missing, as described below; it is never bootstrapped by source/audit/repair. Model/replicate/order, Figma pin and rubric come from the Confirmed configuration. Preserve immutable existing receipts/configurations.

Prompt telemetry close (Turn 2) automatically creates a missing `run-activation.json` from the pinned configuration and approved prompt, or validates an existing receipt without replacing it. The receipt records the actual prompt-close turn/time, before source generation. No standalone activation turn is required.
