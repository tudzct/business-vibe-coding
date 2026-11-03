# File-driven implementation workflow

Input: one [approved `*-coding-prompt.md`](../../../../docs/02-construction/coding-prompts/%3CUC-ID%3E-coding-prompt.md), matching the pinned configuration and the optional activation when present.

Resolved bundle: checksum-pinned prompt, current application source, technical controls, source provenance and active run. Follow the [active-run contract](../../../../docs/00-context/workflow/WORKFLOW-CONTRACT.md) and the explicit read boundaries in the owning skill.

Outputs are source under `finalsource/` plus the source evidence explicitly owned by this operation.
