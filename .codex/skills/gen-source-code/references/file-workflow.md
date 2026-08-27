# File-driven implementation workflow

Input: one approved `*-security-coding-prompt.md` artifact.

Resolved bundle: prompt -> use case + security-point selection artifact + security resource + connected-source provenance + project context.

Outputs:

- Source code under `finalsource/fe` and/or `finalsource/be`.
- Implementation state/sub-prompts under `docs/02-construction/implementation/<UC-ID>/`.
- Audit JSON/Markdown under `docs/05-experiments/<UC-ID>/`.

Never require the user to reconstruct this bundle through chat messages.
