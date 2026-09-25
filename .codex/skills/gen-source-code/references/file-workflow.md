# File-driven implementation workflow

Input: one approved `*-business-coding-prompt.md` generated from [the configured coding-prompt template](../../../../templates/construction/coding-prompt.template.md), matching configuration and activation.

Resolved bundle: checksum-pinned prompt, functional UC/UML/UI/API inputs, technical baseline, source provenance and active run. Audits subsequently use every frozen BR and flow. Follow [workflow contract](../../../../docs/00-context/workflow/WORKFLOW-CONTRACT.md).

Outputs are source under `finalsource/`, implementation/repair artifacts under `docs/02-construction/implementation/<UC-ID>/`, and canonical run JSON under `docs/05-experiments/<UC-ID>/`.
