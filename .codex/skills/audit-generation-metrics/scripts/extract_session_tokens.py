#!/usr/bin/env python3
"""
Extract, analyze, and compute token usage metrics from Codex CLI session logs.
Based on the token rate and turn calculation logic in D:/ccusage/analyze-tokens.js.
Integrates directly with the audit-generation-metrics workflow.
"""

import argparse
import glob
import hashlib
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

MODEL_RATES = {
    "gpt-5.6-sol": {"input": 5.0, "output": 30.0, "cache": 0.5},
    "gpt-5.6-terra": {"input": 2.0, "output": 12.0, "cache": 0.2},
    "gpt-4o": {"input": 5.0, "output": 15.0, "cache": 2.5},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60, "cache": 0.075},
    "gemini-1.5-pro": {"input": 3.5, "output": 10.5, "cache": 1.75},
    "claude-3-5-sonnet": {"input": 3.0, "output": 15.0, "cache": 0.3},
    "default": {"input": 5.0, "output": 15.0, "cache": 2.5},
}

TOKEN_FIELDS = (
    "input_tokens",
    "cached_input_tokens",
    "output_tokens",
    "reasoning_output_tokens",
    "total_tokens",
)


def normalize_usage(value):
    value = value if isinstance(value, dict) else {}
    usage = {}
    for field in TOKEN_FIELDS:
        candidate = value.get(field, 0)
        usage[field] = candidate if isinstance(candidate, (int, float)) and candidate >= 0 else 0
    if not usage["total_tokens"]:
        usage["total_tokens"] = usage["input_tokens"] + usage["output_tokens"]
    return usage


def usage_increment(previous, current, fallback):
    if previous is None:
        return current
    if all(current[field] >= previous[field] for field in TOKEN_FIELDS):
        return {field: current[field] - previous[field] for field in TOKEN_FIELDS}
    return fallback


def calculate_cost(model_name, total_input, output, cache):
    rates = MODEL_RATES.get(model_name) or MODEL_RATES["default"]
    fresh_input = max(0, total_input - cache)
    return ((fresh_input * rates["input"]) + (output * rates["output"]) + (cache * rates["cache"])) / 1_000_000


def find_latest_session_file(base_dir=None):
    if base_dir is None:
        user_home = Path.home()
        base_dir = user_home / ".codex" / "sessions"
    else:
        base_dir = Path(base_dir)

    if not base_dir.exists():
        return None

    jsonl_files = list(base_dir.glob("*/*/*/*.jsonl")) + list(base_dir.glob("*.jsonl"))
    if not jsonl_files:
        return None

    # Return the most recently modified file
    jsonl_files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return jsonl_files[0]


def parse_session(file_path):
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"Session file not found: {file_path}")

    user_turns = []
    current_turn = {
        "id": 1,
        "input": 0,
        "output": 0,
        "reasoning": 0,
        "cache_read": 0,
        "total_input": 0,
        "total_tokens": 0,
        "cost": 0.0,
        "start_time": None,
        "end_time": None,
        "model_name": "Unknown",
        "user_prompt": "",
        "closed": False,
    }
    has_accumulated = False
    turn_count = 1
    session_total = None
    previous_session_total = None
    previous_session_signature = None
    unique_models = set()
    latest_model = "Unknown"

    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue

            model_match = re.search(r'"model"\s*:\s*"([^"]+)"', line)
            if model_match:
                latest_model = model_match.group(1)
                unique_models.add(latest_model)
                if not has_accumulated:
                    current_turn["model_name"] = latest_model

            try:
                parsed = json.loads(line)
            except Exception:
                continue

            msg_type = parsed.get("type")
            payload = parsed.get("payload", {})

            if msg_type == "response_item" and payload.get("role") == "user":
                if has_accumulated:
                    duration = 0.0
                    if current_turn["start_time"] and current_turn["end_time"]:
                        try:
                            t_start = datetime.fromisoformat(current_turn["start_time"].replace("Z", "+00:00"))
                            t_end = datetime.fromisoformat(current_turn["end_time"].replace("Z", "+00:00"))
                            duration = max(0.0, (t_end - t_start).total_seconds())
                        except Exception:
                            duration = 0.0
                    current_turn["duration"] = round(duration, 3)
                    current_turn["closed"] = True
                    user_turns.append(dict(current_turn))
                    turn_count += 1
                    current_turn = {
                        "id": turn_count,
                        "input": 0,
                        "output": 0,
                        "reasoning": 0,
                        "cache_read": 0,
                        "total_input": 0,
                        "total_tokens": 0,
                        "cost": 0.0,
                        "start_time": None,
                        "end_time": None,
                        "model_name": latest_model,
                        "user_prompt": "",
                        "closed": False,
                    }
                    has_accumulated = False

                content_items = payload.get("content", [])
                text_content = " ".join(item.get("text", "") for item in content_items if isinstance(item, dict))
                current_turn["user_prompt"] = text_content.strip()
                if not current_turn["start_time"] and parsed.get("timestamp"):
                    current_turn["start_time"] = parsed["timestamp"]

            elif msg_type == "event_msg" and payload.get("type") == "task_complete":
                current_turn["closed"] = True

            elif msg_type == "event_msg" and payload.get("type") == "token_count":
                info = payload.get("info", {})
                last = normalize_usage(info.get("last_token_usage"))
                raw_session_total = info.get("total_token_usage")
                if isinstance(raw_session_total, dict):
                    normalized_total = normalize_usage(raw_session_total)
                    signature = tuple(normalized_total[field] for field in TOKEN_FIELDS)
                    if signature == previous_session_signature:
                        increment = {field: 0 for field in TOKEN_FIELDS}
                    else:
                        increment = usage_increment(previous_session_total, normalized_total, last)
                    previous_session_total = normalized_total
                    previous_session_signature = signature
                    session_total = normalized_total
                else:
                    increment = last

                input_tokens = increment["input_tokens"]
                cached_tokens = increment["cached_input_tokens"]
                output_tokens = increment["output_tokens"]
                reasoning_tokens = increment["reasoning_output_tokens"]
                total_tokens = increment["total_tokens"]

                cost = calculate_cost(latest_model, input_tokens, output_tokens, cached_tokens)
                fresh_input = max(0, input_tokens - cached_tokens)

                current_turn["input"] += fresh_input
                current_turn["cache_read"] += cached_tokens
                current_turn["total_input"] += input_tokens
                current_turn["output"] += output_tokens
                current_turn["reasoning"] += reasoning_tokens
                current_turn["total_tokens"] += total_tokens
                current_turn["cost"] += cost

                if parsed.get("timestamp"):
                    current_turn["end_time"] = parsed["timestamp"]

                has_accumulated = has_accumulated or total_tokens > 0

    if has_accumulated:
        duration = 0.0
        if current_turn["start_time"] and current_turn["end_time"]:
            try:
                t_start = datetime.fromisoformat(current_turn["start_time"].replace("Z", "+00:00"))
                t_end = datetime.fromisoformat(current_turn["end_time"].replace("Z", "+00:00"))
                duration = max(0.0, (t_end - t_start).total_seconds())
            except Exception:
                duration = 0.0
        current_turn["duration"] = round(duration, 3)
        # A task_complete event closes the final turn even before another user
        # prompt is written. During an active tool call this remains false.
        user_turns.append(dict(current_turn))

    return {
        "file_path": str(path),
        "models": list(unique_models) if unique_models else [latest_model],
        "turns": user_turns,
        "session_total": session_total,
    }


def select_turns(turns, ids, stage_name):
    if ids is None:
        return []
    by_id = {turn["id"]: turn for turn in turns}
    missing = [turn_id for turn_id in ids if turn_id not in by_id]
    if missing:
        raise ValueError(f"{stage_name} turn(s) not found or have no token event: {missing}")
    selected = [by_id[turn_id] for turn_id in ids]
    open_ids = [turn["id"] for turn in selected if not turn.get("closed")]
    if open_ids:
        raise ValueError(
            f"{stage_name} turn(s) are still active/open: {open_ids}; "
            "extract them only after the researcher starts the next turn"
        )
    return selected


def classify_experiment_turns(
    turns,
    explicit_prompt=None,
    explicit_code=None,
    explicit_repairs=None,
):
    prompt_gen_turns = select_turns(turns, explicit_prompt, "prompt generation")
    code_gen_turns = select_turns(turns, explicit_code, "code generation")
    repair_turns = select_turns(turns, explicit_repairs, "repair")

    assigned = {
        "prompt generation": {turn["id"] for turn in prompt_gen_turns},
        "code generation": {turn["id"] for turn in code_gen_turns},
        "repair": {turn["id"] for turn in repair_turns},
    }
    labels = list(assigned)
    for index, left in enumerate(labels):
        for right in labels[index + 1:]:
            overlap = sorted(assigned[left] & assigned[right])
            if overlap:
                raise ValueError(f"turn(s) {overlap} overlap {left} and {right} stages")

    if explicit_code is not None:
        return {"prompt_gen": prompt_gen_turns, "code_gen": code_gen_turns, "repairs": repair_turns}

    first_gen_turn = None

    if not prompt_gen_turns or not repair_turns:
        for t in turns:
            if not t.get("closed"):
                continue
            prompt_lower = t["user_prompt"].lower()

            if not prompt_gen_turns and ("gen-coding-prompt" in prompt_lower or "prompt a-f" in prompt_lower or "prompt a-d" in prompt_lower):
                prompt_gen_turns.append(t)
            elif first_gen_turn is None and ("xác nhận cấu hình" in prompt_lower or "gen-source-code" in prompt_lower):
                first_gen_turn = t
            elif any(k in prompt_lower for k in ["sửa lỗi", "quy trình lặp", "repair", "sub-prompt", "bug-fixing"]):
                if t not in repair_turns:
                    repair_turns.append(t)

    # If first_gen_turn still not found or mistargeted to a short confirmation
    if first_gen_turn is None or (first_gen_turn["total_tokens"] < 100000 and len(turns) >= 5):
        # Pick the largest turn in the second half of the workflow as First Gen
        eligible = [t for t in turns if t not in repair_turns and t["id"] > 1]
        if eligible:
            first_gen_turn = max(eligible, key=lambda x: x["total_tokens"])

    return {
        "prompt_gen": prompt_gen_turns,
        "code_gen": [first_gen_turn] if first_gen_turn else [],
        "repairs": repair_turns,
    }


def aggregate_turns(turns):
    if not turns:
        return None
    return {
        "turn_ids": [turn["id"] for turn in turns],
        "input": sum(turn["input"] for turn in turns),
        "cache_read": sum(turn["cache_read"] for turn in turns),
        "total_input": sum(turn["total_input"] for turn in turns),
        "output": sum(turn["output"] for turn in turns),
        "reasoning": sum(turn["reasoning"] for turn in turns),
        "total_tokens": sum(turn["total_tokens"] for turn in turns),
        "cost_usd": round(sum(turn["cost"] for turn in turns), 4),
        "duration_seconds": round(sum(turn["duration"] for turn in turns), 3),
        "closed": all(turn.get("closed") for turn in turns),
    }


def update_run_json(run_json_path, session_data, classified):
    path = Path(run_json_path)
    if not path.is_file():
        raise FileNotFoundError(f"Run JSON not found: {run_json_path}")

    data = json.loads(path.read_text(encoding="utf-8"))

    prompt = aggregate_turns(classified["prompt_gen"])
    code = aggregate_turns(classified["code_gen"])
    repairs = aggregate_turns(classified["repairs"])

    prompt_tokens = prompt["total_tokens"] if prompt else None
    code_tokens = code["total_tokens"] if code else None
    repair_tokens = repairs["total_tokens"] if repairs else 0
    implementation_tokens = code_tokens + repair_tokens if code_tokens is not None else None
    overall_tokens = prompt_tokens + implementation_tokens if prompt_tokens is not None and implementation_tokens is not None else None

    data["tokens"] = {
        "prompt_generation_total": prompt_tokens,
        "code_generation_total": code_tokens,
        "repair_total": repair_tokens,
        "implementation_total": implementation_tokens,
        "overall_total": overall_tokens,
        "initial_total": code_tokens,
        "total": implementation_tokens,
        "telemetry_source": session_data["file_path"],
        "details": {
            "prompt_generation": prompt,
            "code_generation": code,
            "initial": code,
            "repairs": repairs or {"turn_ids": [], "total_tokens": 0, "cost_usd": 0.0, "closed": True},
        },
    }

    if "repairs" in data and isinstance(data["repairs"], list):
        for idx, rep_data in enumerate(data["repairs"]):
            repair_turns = classified["repairs"]
            if len(repair_turns) == len(data["repairs"]) and idx < len(repair_turns):
                rep_turn = repair_turns[idx]
                rep_data["tokens"] = {
                    "total": rep_turn["total_tokens"],
                    "input": rep_turn["input"],
                    "cache_read": rep_turn["cache_read"],
                    "output": rep_turn["output"],
                    "cost_usd": round(rep_turn["cost"], 4),
                }

    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return data


def write_prompt_receipt(receipt_path, prompt_path, session_data, classified):
    prompt = aggregate_turns(classified["prompt_gen"])
    if prompt is None:
        raise ValueError("--prompt-receipt requires at least one --prompt-turns ID")
    source = Path(prompt_path)
    if not source.is_file():
        raise FileNotFoundError(f"Prompt artifact not found: {prompt_path}")
    receipt = {
        "stage": "prompt_generation",
        "prompt_artifact": str(source),
        "prompt_sha256": "sha256:" + hashlib.sha256(source.read_bytes()).hexdigest(),
        "telemetry_source": session_data["file_path"],
        "turn_ids": prompt["turn_ids"],
        "tokens": prompt,
        "status": "captured",
    }
    target = Path(receipt_path)
    if target.exists():
        existing = json.loads(target.read_text(encoding="utf-8"))
        if existing != receipt:
            raise ValueError(f"Refusing to overwrite different prompt telemetry receipt: {target}")
        return receipt
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(receipt, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return receipt


def main():
    parser = argparse.ArgumentParser(description="Extract token usage from Codex session logs")
    parser.add_argument("--session-path", "-s", type=str, help="Path to .jsonl session log")
    parser.add_argument("--run-json", "-r", type=str, help="Path to canonical experiment run JSON")
    parser.add_argument("--prompt-turns", type=str, help="Comma-separated closed turn IDs for prompt generation")
    parser.add_argument("--code-turns", type=str, help="Comma-separated closed turn IDs for first-pass code generation")
    parser.add_argument("--first-gen-turn", type=int, help="Deprecated alias for one --code-turns ID")
    parser.add_argument("--repair-turns", type=str, help="Comma-separated turn IDs for sub-prompt repairs")
    parser.add_argument("--prompt-receipt", type=str, help="Write immutable prompt-generation telemetry receipt")
    parser.add_argument("--prompt-path", type=str, help="Prompt artifact used with --prompt-receipt")
    parser.add_argument("--update", "-u", action="store_true", help="Update the canonical run JSON with tokens")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")

    args = parser.parse_args()

    session_file = args.session_path
    if not session_file:
        session_file = find_latest_session_file()
        if not session_file:
            print("Error: Could not locate latest session file.", file=sys.stderr)
            sys.exit(1)

    session_data = parse_session(session_file)

    parse_ids = lambda value: [int(x.strip()) for x in value.split(",")] if value else None
    explicit_prompt = parse_ids(args.prompt_turns)
    explicit_code = parse_ids(args.code_turns)
    if explicit_code is None and args.first_gen_turn is not None:
        explicit_code = [args.first_gen_turn]
    explicit_repairs = parse_ids(args.repair_turns)
    classified = classify_experiment_turns(session_data["turns"], explicit_prompt, explicit_code, explicit_repairs)

    prompt = aggregate_turns(classified["prompt_gen"])
    code = aggregate_turns(classified["code_gen"])
    repairs = aggregate_turns(classified["repairs"])

    prompt_tokens = prompt["total_tokens"] if prompt else None
    code_tokens = code["total_tokens"] if code else None
    repair_tokens = repairs["total_tokens"] if repairs else 0
    implementation_tokens = code_tokens + repair_tokens if code_tokens is not None else None
    overall_tokens = prompt_tokens + implementation_tokens if prompt_tokens is not None and implementation_tokens is not None else None

    summary = {
        "session_file": str(session_file),
        "models": session_data["models"],
        "tokens": {
            "prompt_generation_tokens": prompt_tokens,
            "code_generation_tokens": code_tokens,
            "repair_tokens": repair_tokens,
            "implementation_tokens": implementation_tokens,
            "overall_tokens": overall_tokens,
            "prompt_generation_cost_usd": prompt["cost_usd"] if prompt else None,
            "code_generation_cost_usd": code["cost_usd"] if code else None,
            "repair_cost_usd": repairs["cost_usd"] if repairs else 0.0,
        },
        "turns_summary": [
            {
                "turn": t["id"],
                "total_tokens": t["total_tokens"],
                "input": t["input"],
                "cache_read": t["cache_read"],
                "output": t["output"],
                "cost_usd": round(t["cost"], 4),
                "duration_s": t["duration"],
                "prompt": t["user_prompt"][:60],
                "closed": t.get("closed", False),
            }
            for t in session_data["turns"]
        ],
    }

    if args.update and args.run_json:
        update_run_json(args.run_json, session_data, classified)
        summary["updated_run_json"] = args.run_json

    if args.prompt_receipt:
        if not args.prompt_path:
            parser.error("--prompt-receipt requires --prompt-path")
        write_prompt_receipt(args.prompt_receipt, args.prompt_path, session_data, classified)
        summary["prompt_receipt"] = args.prompt_receipt

    if args.json:
        print(json.dumps(summary, indent=2, ensure_ascii=False))
    else:
        print("\n=== EXPERIMENT TOKEN TELEMETRY REPORT ===")
        print(f"Session: {Path(session_file).name}")
        print(f"Models:  {', '.join(session_data['models'])}")
        print("-" * 65)
        print(f"Prompt generation turns:      {prompt['turn_ids'] if prompt else 'N/A'}")
        print(f"Prompt generation tokens:     {prompt_tokens if prompt_tokens is not None else 'N/A'}")
        print(f"Code generation turns:        {code['turn_ids'] if code else 'N/A'}")
        print(f"Code generation tokens:       {code_tokens if code_tokens is not None else 'N/A'}")
        print(f"Repair turns:                 {repairs['turn_ids'] if repairs else []}")
        print(f"Repair tokens:                {repair_tokens:,}".replace(",", "."))
        print(f"Implementation tokens:        {implementation_tokens if implementation_tokens is not None else 'N/A'}")
        print(f"Overall tokens:               {overall_tokens if overall_tokens is not None else 'N/A'}")
        print("-" * 65)
        if args.update and args.run_json:
            print(f"Updated canonical run: {args.run_json}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise SystemExit(f"telemetry error: {exc}")
