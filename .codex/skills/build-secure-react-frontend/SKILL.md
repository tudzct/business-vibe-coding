---
name: build-secure-react-frontend
description: Build or review secure React 18, TypeScript, Vite 8, Tailwind, React Router 7, Axios and Context/Zustand frontend source for Prompts B-E. Use for pages, components, API services, routing, forms, state and code review; do not generate tests or test cases.
---

# Build Secure React Frontend

Read `PROJECT_CONTEXT.md`, `docs/00-context/sources/CONNECTED-SOURCES.md`, the approved prompt and `references/react-rules.md`. Then read only the references needed for the change: `references/typescript-vite.md`, `references/routing-data-state.md`, or `references/tailwind-charts.md`. Inspect neighboring features and use `resolve-figma-design-dataset` to obtain the exact checksum-valid frozen frame/node before editing and again for the post-implementation UI audit. Use the installed Figma plugin only to create or refresh a missing dataset version.

For Figma-backed work, do not require a researcher-approved UI mapping. Before editing:

1. Read the complete local `design-context.md`, `metadata.json`, `asset-map.json` and reference screenshot/export; read any reconstruction record as traceability, not permission.
2. Build an autonomous node checklist mapping every visible component group to React ownership, exact text, local assets, hierarchy, dimensions, spacing, typography, colors and interaction state.
3. Resolve visual choices from the dataset without asking for per-node approval. Treat UC-backed controls as functional and Figma-only controls as visual-only. Stop only when required visual evidence/assets are missing or the UC introduces a material behavioral conflict.

During implementation, use the captured component tree as the reconstruction reference, reuse/copy local dataset assets into the frontend asset pipeline, preserve node hierarchy and exact visible text, and do not replace designed elements with generic approximations or invented headings. Render every visible Figma node. Implement UC-defined behavior on the matching controls; render Figma-only controls accessibly without inventing navigation/API effects. When UC-required UI is absent from the frame, add only the smallest required control using the nearest captured hierarchy, typography, spacing and color tokens, and record that inference.

After implementation and Docker rebuild, render at the natural reference viewport and every UC-required state. Capture screenshots for comparison, but retain only images referenced by canonical run or repair evidence; remove unreferenced intermediates. Compare with the frozen reference using 100% structural coverage and perceptual similarity `>= 0.90` when deterministic. Persist scores, limitations and retained paths in canonical run JSON. A miss requires a separately counted repair.

Extend the baseline documented in `finalsource/BASELINE.md`; do not recreate the Vite app. Implement typed functional components under `finalsource/fe`. Reuse `httpClient`, `AppRouter` and `AppShell`; keep feature calls in `src/api`, reusable UI in components, views in pages and shared state in context/Zustand only when needed. Cover specified loading, empty, success and safe error states. Apply accessible labels, keyboard/focus behavior and responsive Tailwind.

Treat client data as untrusted. Never use frontend checks as authorization, log/store secrets casually, use unsafe HTML/eval, invent UI/business behavior, or modify unrelated files. Do not create or run tests/test cases. Run only allowed non-test build/lint checks and then invoke `$audit-generation-metrics` through the parent workflow.

The immutable UC defines behavior while the frozen Figma dataset defines the complete visual target. AI owns their visual mapping without a researcher UI gate. Never invent business behavior; stop for researcher QA only when ambiguity changes behavior, authorization, API, schema or accepted risk. Visual omissions and similarity misses are repaired through distinct, counted `$bug-fixing-sub-prompt` invocations.

Before completion, enforce the existing ESLint/TypeScript configuration rather than bypassing it. Do not replace package/config/bootstrap files, add `eslint-disable`, `@ts-ignore`, `any`, a new dependency or a framework-major migration merely to make generated code compile.
