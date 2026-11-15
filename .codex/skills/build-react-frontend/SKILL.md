---
name: build-react-frontend
description: Implement or review authorized React 18, TypeScript, Vite and Tailwind frontend changes.
---

# Build React Frontend

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Read [the approved prompt](../../../docs/02-construction/coding-prompts/%3CUC-ID%3E-coding-prompt.md), the existing application codebase and `docs/00-context/engineering/TECHNICAL-STACK-RULES.md`. Honor every explicit read boundary declared by the owning operation. Inspect `finalsource/fe/package.json` and its lockfile. Treat `finalsource/fe` as the current cumulative frontend codebase: reuse compatible existing code, and add, modify, replace, move or delete code only when required by the approved prompt, while preserving unrelated working behavior.

Load only the references required by the active change areas:

- React components or hooks: [references/react-rules.md](references/react-rules.md)
- TypeScript, Vite configuration or client environment: [references/typescript-vite.md](references/typescript-vite.md)
- Routes, API client, Context or Zustand: [references/routing-data-state.md](references/routing-data-state.md)
- Tailwind or Recharts: [references/tailwind-charts.md](references/tailwind-charts.md)

- Reuse compatible HTTP client, router, shell and established state patterns when they remain applicable to the approved prompt. For UI required by the prompt, apply accessible labels, keyboard/focus behavior and responsive Tailwind.
- Do not invent navigation, API calls or product behavior beyond the approved prompt.
- Run only permitted non-test lint/typecheck/build and visual/runtime observations.
