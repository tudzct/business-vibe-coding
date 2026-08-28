---
name: build-react-frontend
description: Build or review React 18, TypeScript, Vite, Tailwind frontend code for Prompts B-E and Sheet-derived Business Rules using frozen Figma evidence; never generate tests.
---

# Build React Frontend

Read the approved prompt, project context, connected sources and `docs/00-context/engineering/TECHNICAL-STACK-RULES.md`. Inspect `finalsource/fe/package.json` and its lockfile, then extend the existing app under `finalsource/fe`.

Load only the references required by the active change areas:

- React components or hooks: [references/react-rules.md](references/react-rules.md)
- TypeScript, Vite configuration or client environment: [references/typescript-vite.md](references/typescript-vite.md)
- Routes, API client, Context or Zustand: [references/routing-data-state.md](references/routing-data-state.md)
- Tailwind or Recharts: [references/tailwind-charts.md](references/tailwind-charts.md)

- For Figma-backed work, require a checksum-valid frozen dataset and map every visible node/state. Use Figma only to create or refresh a missing dataset through the repository resolver.
- UC-backed controls are functional; design-only controls remain visual. Add only the smallest design-consistent control when the UC requires one that the frame omits, and record it.
- Reuse the HTTP client, router, shell and established state patterns. Implement typed loading, empty, success, validation and error states.
- Enforce frontend-applicable BRs for UX, while backend enforcement remains authoritative where required.
- Do not invent navigation, API calls or business behavior; stop for material business/API/schema/ownership ambiguity.
- Run only permitted non-test lint/typecheck/build and visual/runtime observations.

Do not create or run tests.
