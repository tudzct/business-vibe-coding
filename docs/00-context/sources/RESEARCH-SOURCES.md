# Research sources and design basis

## Local materials

- `resource/Draft paper_VibeCoding-security.docx`: research questions, focus on OWASP A01/A02/A03, Prompt E, repair sub-prompts and experiment metrics.
- `resource/BUSINESS_PROMPT_TEMPLATE.docx`: external business-focused prompt-template reference. Only its general A-D/F structure is adapted; its Business Rules Compliance prompt is excluded and replaced by the study's Security Requirements Prompt E.
- `resource/TrucDTT_21020414-4889_baoveee.pdf`: two-phase pipeline from use case/design/API/templates to coding prompt, then code generation and self-correction.
- `resource/TechnicalReport.pdf`: reference use cases and Prompts A-D for the personal-finance system.
- `resource/VC-AWG-Demo_FinalCode-main`: React/Vite and NestJS/TypeORM architecture and project rules.

## Web references (accessed 2026-08-13)

- OWASP, [A01:2025 Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/): server-side default deny, function/object authorization and related access-control risks.
- OWASP, [A02:2025 Security Misconfiguration](https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/): hardening, minimal surface, safe errors, headers and externalized short-lived credentials.
- OWASP, [A03:2025 Software Supply Chain Failures](https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/): dependency inventory, trusted sources, vulnerability monitoring and supply-chain change control.
- AWS, [Open-Sourcing Adaptive Workflows for AI-DLC](https://aws.amazon.com/blogs/devops/open-sourcing-adaptive-workflows-for-ai-driven-development-life-cycle-ai-dlc/): adaptive workflow, human-centric decisions and open workflow implementation.
- AWS, [Building with AI-DLC using Amazon Q Developer](https://aws.amazon.com/blogs/devops/building-with-ai-dlc-using-amazon-q-developer/): AI-led lifecycle with human oversight and project rules.
- AWS Labs, [AI-DLC workflows](https://github.com/awslabs/aidlc-workflows): current upstream workflow repository referenced by AWS samples.
- AWS Samples, [AI-DLC Lite](https://github.com/aws-samples/sample-aidlc-lite): three phases, approval gates, audit logging and state tracking; useful for proportional ceremony.

AI-DLC web references provide background only. For this research product, the executable workflow intentionally retains: use case → security coding prompt → source code → audit/repair. Enterprise role separation, PRD/TAR documents, extensive guard gates and a standalone Operations phase are not runtime requirements. No company-internal AI-DLC material is included in this repository.

## Official technical-stack references

- React rules: https://react.dev/reference/rules
- TypeScript handbook and strictness: https://www.typescriptlang.org/docs/handbook/2/basic-types.html
- Vite environment variables: https://vite.dev/guide/env-and-mode
- Tailwind responsive design: https://tailwindcss.com/docs/responsive-design
- React Router v6 overview: https://reactrouter.com/docs/en/v6/start/overview
- Axios interceptors/cancellation: https://axios-http.com/docs/interceptors and https://axios-http.com/docs/cancellation
- Zustand TypeScript guide: https://zustand.docs.pmnd.rs/guides/typescript
- Recharts API: https://recharts.github.io/en-US/api/ResponsiveContainer/
- NestJS controllers/providers/validation/security/OpenAPI: https://docs.nestjs.com/
- TypeORM entities, relations, repositories and transactions: https://typeorm.io/docs/
- MySQL 8.4 reference: https://dev.mysql.com/doc/refman/8.4/en/
- class-validator: https://github.com/typestack/class-validator
- ESLint configuration/rules: https://eslint.org/docs/latest/use/core-concepts/

Sources were reviewed on 2026-08-13. Apply them with the dependency versions pinned by the project, not as authorization for silent major-version upgrades.
