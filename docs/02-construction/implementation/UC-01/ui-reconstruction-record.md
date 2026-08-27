---
artifact_type: ui-reconstruction-record
status: Recorded
uc_id: UC-01
source_use_case: docs/01-inception/use-cases/uc-01-register-account.md
figma_dataset_id: 2026-08-27-001
figma_node_id: "137:8071"
figma_snapshot_dir: resource/figma-design-dataset/2026-08-27-001/nodes/137-8071
figma_manifest_checksum: sha256:9b5512c7a99f4e79020dd8e47f7453daaf1fd581889684a3a9f06b349cd29768
generated_by: Codex Phase 1 (no run activated)
generated_at: 2026-08-27T11:20:46.7892574Z
---

# UC-01 Autonomous UI Reconstruction Record

## Immutable source boundaries

- UC behavior source: `docs/01-inception/use-cases/uc-01-register-account.md`, SHA-256 `bbdfcf7d3d1dd36d17b0e133368b52d7d11ee9267d911454396a0bfc609450fe`.
- Frozen Figma visual source: dataset `2026-08-27-001`, frame `137:8071` (`102. Signup`), 1440×1024, integrity verified.
- Neither source was edited during this decision.

## Functional-flow checkpoints

| UC checkpoint | Required behavior | Mapped Figma node/frame | Coverage | Autonomous visual inference |
|---|---|---|---|---|
| Open `/register` | Render registration page and SignUpForm | `137:8071`, `102. Signup` | covered | Implement the centered form composition against `#F4F5F7`. |
| Enter `fullName`, `email`, `password` | Labeled inputs | Visible Name, Email Address and Password controls | covered | Preserve spacing, borders, typography and password visibility control. |
| Enter `confirmPassword` | Required by UC and BR-REG-06 | No visible design control | missing | Add one password-style `Confirm password` field immediately after Password, matching its dimensions and styling. |
| Submit | Functional Sign up button | Visible `Sign up` control | covered | Connect only this control to email/password registration. |
| Success/failure | Loading, field errors, API error and navigation | No explicit state frames in snapshot | missing | Add minimal design-consistent inline errors, disabled/loading submit state, and form-level API error without changing the base composition. |

## Figma node disposition

The frozen context exposes the frame plus one flattened visual asset, so the inventory uses visible component groups from the checksum-verified screenshot.

| Node ID | Component/text | Dataset asset(s) | Rendering mode | Behavior | Rationale |
|---|---|---|---|---|---|
| `137:8071` | Signup page/frame | `screenshot.png`, `export.png` | `render-functional` | Registration page container | Frozen visual contract. |
| `611:2614` | Flattened signup composition reference | `assets/sha256-d3ccc74a3d7abcf6e9ef3045b3b94a6f7009d39a002e990788e001df58784c1a.png` | `render-functional` | Reconstruct accessible controls rather than using the raster as the UI | UC controls must be functional. |
| unavailable in flattened capture | FINEbank.IO logo and `Create an account` heading | Screenshot evidence | `render-visual-only` | No interaction | Visual identity and heading. |
| unavailable in flattened capture | Name, Email Address, Password and added Confirm password inputs | Screenshot plus UC | `render-functional` | Capture/validate registration input | Three controls are designed; confirmPassword is the minimum UC-required addition. |
| unavailable in flattened capture | Password visibility icon | Screenshot evidence | `render-functional` | Toggle only password visibility without changing value | The eye affordance visually indicates this behavior. |
| unavailable in flattened capture | Terms sentence/link | Screenshot evidence | `render-visual-only` | No invented navigation | No terms destination is supplied by the UC. |
| unavailable in flattened capture | Sign up button | Screenshot evidence | `render-functional` | Submit once, with loading/duplicate prevention | UC Basic Flow step 4. |
| unavailable in flattened capture | Divider and Continue with Google | Screenshot and Google asset | `render-visual-only` | Must not initiate Google authentication | UC notes explicitly place Google sign-up outside scope. |
| unavailable in flattened capture | Already have an account / Sign in here | Screenshot evidence | `render-visual-only` | No invented destination | Login-link behavior is not defined by UC-01. |

## Visual fidelity contract

- Natural reference viewport: `1440×1024`.
- Required fonts and availability decision: use the project’s existing sans-serif stack; no font asset is supplied by the dataset.
- Structural coverage target: `100%` of non-omitted nodes/groups.
- Perceptual screenshot-similarity target: `>= 0.90` when the comparison environment is deterministic.
- Recorded rendering tolerances/limitations: the design context is flattened, so exact child-node measurements are derived from the checksum-verified screenshot; the UC-required Confirm password and error/loading states necessarily extend the form vertically.
- Required runtime screenshots/states: default, field-validation failure, submitting/disabled, duplicate-email error, generic API error, and successful navigation observation.

## Non-gating status

This record is optional traceability, not a researcher approval artifact or a source-generation gate. Dataset `2026-08-27-001` is the visual contract and the frozen UC is the behavioral contract.
