# Artifact templates

- `inception/`: Sheet-derived use-case projection shape.
- `construction/`: Business Rule resources, [the configured coding-prompt template](construction/coding-prompt.template.md), repair sub-prompts.
- `research/`: experiment configuration, BR and flow baselines, run activation, audit input and rendered run view.

The database input is pinned in configuration; see `docs/00-context/engineering/DATABASE-SCHEMA.md`.

Templates contain no test-generation or independent vulnerability-scan workflow.
