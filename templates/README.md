# Artifact templates

- `inception/`: Sheet-derived use-case projection shape.
- `construction/`: Business Rule resources, Prompt A-F (full), Prompt A-D (RQ3 ablation), repair sub-prompts.
- `research/`: experiment configuration, BR and flow baselines, run activation, audit input and rendered run view.

The database input is pinned in the schema-2.4 configuration; see `docs/00-context/engineering/DATABASE-SCHEMA.md`. Per-UC database schema proposal templates are retired.

Templates contain no test-generation or independent vulnerability-scan workflow.
