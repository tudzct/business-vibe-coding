"""Enforce the SR-blind boundary for independent evaluator artifacts."""

import re


FORBIDDEN_KEYS = {
    "sr_id",
    "sr_ids",
    "security_requirement",
    "security_requirements",
    "security_resource",
    "security_resources",
    "prompt_e",
    "coding_prompt",
    "coding_prompts",
    "generation_audit",
    "generation_audits",
    "repair_prompt",
    "repair_prompts",
    "experiment_run",
    "experiment_runs",
}
SR_ID = re.compile(r"\bSR-UC-[0-9]{3}-A0[12]-[0-9]{2}\b", re.IGNORECASE)
GENERATION_ARTIFACT_PATH = re.compile(
    r"(?:docs/02-construction/(?:security-resources|coding-prompts|implementation)/|"
    r"docs/05-experiments/|docs/03-audit/(?!security-tools/))",
    re.IGNORECASE,
)


def assert_sr_blind(value, path: str = "$") -> None:
    """Reject SR identities and generation-artifact references at any depth."""
    if isinstance(value, dict):
        for key, item in value.items():
            normalized_key = str(key).strip().lower().replace("-", "_")
            if normalized_key in FORBIDDEN_KEYS:
                raise ValueError(f"{path}.{key} violates the SR-blind evaluator boundary")
            assert_sr_blind(item, f"{path}.{key}")
        return
    if isinstance(value, list):
        for index, item in enumerate(value):
            assert_sr_blind(item, f"{path}[{index}]")
        return
    if isinstance(value, str):
        if SR_ID.search(value):
            raise ValueError(f"{path} contains an SR identifier forbidden in evaluator artifacts")
        if GENERATION_ARTIFACT_PATH.search(value):
            raise ValueError(f"{path} references a generation artifact forbidden in evaluator artifacts")
