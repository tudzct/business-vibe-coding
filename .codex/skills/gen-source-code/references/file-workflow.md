# File-driven implementation workflow

Input: one approved `*-business-coding-prompt.md` (Full A-F) or `*-rq3-coding-prompt.md` (RQ3 A-D), matching configuration and activation.

Resolved bundle: checksum-pinned prompt, functional UC/UML/UI/API inputs, technical baseline, source provenance and active run. Full includes the approved BR projection. RQ3 resolves evaluation BR baseline identity without loading its expressions as generation inputs. Both audits subsequently use every frozen BR and flow. Follow [shared Full/RQ3 contract](../../../../docs/00-context/workflow/FULL-RQ3-CONTRACT.md).

Outputs are source under `finalsource/`, implementation/repair artifacts under `docs/02-construction/implementation/<UC-ID>/`, and canonical run JSON under `docs/05-experiments/<UC-ID>/`.
