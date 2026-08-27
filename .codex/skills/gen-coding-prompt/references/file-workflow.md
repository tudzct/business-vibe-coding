# File-driven prompt workflow

Input: one readable use-case Markdown file.

Outputs:

- conditional detailed UI mapping only for inference, mismatch, omission dispute or reviewer request
- `docs/02-construction/implementation/<UC-ID>/security-scope-activation.json`
- `docs/02-construction/security-resources/<UC-ID>-security.json`
- `docs/02-construction/coding-prompts/<UC-ID>-security-coding-prompt.md`

The prompt artifact must carry enough provenance for `$gen-source-code` to locate the original use case, exact frozen Figma dataset, optional autonomous UI reconstruction record, security-point selection decision and security resource without chat history. Never depend on conversation-only requirements.
