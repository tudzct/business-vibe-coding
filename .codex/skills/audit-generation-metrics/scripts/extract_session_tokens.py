#!/usr/bin/env python3
"""
Extract, analyze, and compute token usage metrics from Codex CLI session logs.
Based on the token rate and turn calculation logic in D:/ccusage/analyze-tokens.js.
Integrates directly with the audit-generation-metrics workflow.
"""

import argparse
import glob
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
    }
    has_accumulated = False
    turn_count = 1
    session_total = None
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
                    }
                    has_accumulated = False

                content_items = payload.get("content", [])
                text_content = " ".join(item.get("text", "") for item in content_items if isinstance(item, dict))
                current_turn["user_prompt"] = text_content.strip()
                if not current_turn["start_time"] and parsed.get("timestamp"):
                    current_turn["start_time"] = parsed["timestamp"]

            elif msg_type == "event_msg" and payload.get("type") == "token_count":
                info = payload.get("info", {})
                last = info.get("last_token_usage", {})
                input_tokens = last.get("input_tokens", 0)
                cached_tokens = last.get("cached_input_tokens", 0)
                output_tokens = last.get("output_tokens", 0)
                reasoning_tokens = last.get("reasoning_output_tokens", 0)
                total_tokens = last.get("total_tokens", 0)

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

                has_accumulated = True
                session_total = info.get("total_token_usage")

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
        user_turns.append(dict(current_turn))

    return {
        "file_path": str(path),
        "models": list(unique_models) if unique_models else [latest_model],
        "turns": user_turns,
        "session_total": session_total,
    }


def classify_experiment_turns(turns, explicit_first_gen=None, explicit_repairs=None):
    if explicit_first_gen is not None:
        first_gen_turn = next((t for t in turns if t["id"] == explicit_first_gen), None)
    else:
        first_gen_turn = None

    if explicit_repairs is not None:
        repair_turns = [t for t in turns if t["id"] in explicit_repairs]
    else:
        repair_turns = []

    prompt_gen_turns = []

    if first_gen_turn is None or not repair_turns:
        for t in turns:
            prompt_lower = t["user_prompt"].lower()

            if "gen-coding-prompt" in prompt_lower or "prompt a-f" in prompt_lower or "prompt a-d" in prompt_lower:
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
        "first_gen": first_gen_turn,
        "repairs": repair_turns,
    }


def update_run_json(run_json_path, session_data, classified):
    path = Path(run_json_path)
    if not path.is_file():
        raise FileNotFoundError(f"Run JSON not found: {run_json_path}")

    data = json.loads(path.read_text(encoding="utf-8"))

    first_gen = classified["first_gen"]
    repairs = classified["repairs"]

    initial_tokens = first_gen["total_tokens"] if first_gen else None
    repair_tokens = sum(r["total_tokens"] for r in repairs) if repairs else 0
    total_tokens = (initial_tokens or 0) + repair_tokens

    data["tokens"] = {
        "initial_total": initial_tokens,
        "repair_total": repair_tokens,
        "total": total_tokens,
        "telemetry_source": session_data["file_path"],
        "details": {
            "initial": {
                "turn_id": first_gen["id"] if first_gen else None,
                "input": first_gen["input"] if first_gen else None,
                "cache_read": first_gen["cache_read"] if first_gen else None,
                "total_input": first_gen["total_input"] if first_gen else None,
                "output": first_gen["output"] if first_gen else None,
                "reasoning": first_gen["reasoning"] if first_gen else None,
                "cost_usd": round(first_gen["cost"], 4) if first_gen else None,
                "duration_seconds": first_gen["duration"] if first_gen else None,
            } if first_gen else None,
            "repairs": {
                "count": len(repairs),
                "total_tokens": repair_tokens,
                "cost_usd": round(sum(r["cost"] for r in repairs), 4),
            },
        },
    }

    if "repairs" in data and isinstance(data["repairs"], list):
        for idx, rep_data in enumerate(data["repairs"]):
            if idx < len(repairs):
                rep_turn = repairs[idx]
                rep_data["tokens"] = {
                    "total": rep_turn["total_tokens"],
                    "input": rep_turn["input"],
                    "cache_read": rep_turn["cache_read"],
                    "output": rep_turn["output"],
                    "cost_usd": round(rep_turn["cost"], 4),
                }

    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return data


def main():
    parser = argparse.ArgumentParser(description="Extract token usage from Codex session logs")
    parser.add_argument("--session-path", "-s", type=str, help="Path to .jsonl session log")
    parser.add_argument("--run-json", "-r", type=str, help="Path to canonical experiment run JSON")
    parser.add_argument("--first-gen-turn", type=int, help="Explicit turn ID for First Gen")
    parser.add_argument("--repair-turns", type=str, help="Comma-separated turn IDs for sub-prompt repairs")
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

    explicit_repairs = [int(x.strip()) for x in args.repair_turns.split(",")] if args.repair_turns else None
    classified = classify_experiment_turns(session_data["turns"], args.first_gen_turn, explicit_repairs)

    first_gen = classified["first_gen"]
    repairs = classified["repairs"]

    initial_tokens = first_gen["total_tokens"] if first_gen else 0
    repair_tokens = sum(r["total_tokens"] for r in repairs)
    total_tokens = initial_tokens + repair_tokens

    summary = {
        "session_file": str(session_file),
        "models": session_data["models"],
        "tokens": {
            "first_gen_tokens": initial_tokens,
            "sub_prompts_tokens": repair_tokens,
            "total_uc_tokens": total_tokens,
            "first_gen_cost_usd": round(first_gen["cost"], 4) if first_gen else 0.0,
            "repair_cost_usd": round(sum(r["cost"] for r in repairs), 4),
            "total_cost_usd": round((first_gen["cost"] if first_gen else 0.0) + sum(r["cost"] for r in repairs), 4),
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
            }
            for t in session_data["turns"]
        ],
    }

    if args.update and args.run_json:
        update_run_json(args.run_json, session_data, classified)
        summary["updated_run_json"] = args.run_json

    if args.json:
        print(json.dumps(summary, indent=2, ensure_ascii=False))
    else:
        print("\n=== EXPERIMENT TOKEN TELEMETRY REPORT ===")
        print(f"Session: {Path(session_file).name}")
        print(f"Models:  {', '.join(session_data['models'])}")
        print("-" * 65)
        print(f"First Gen Turn ID:            {first_gen['id'] if first_gen else 'N/A'}")
        print(f"First Gen Tokens (Col L):     {initial_tokens:,}".replace(",", "."))
        print(f"Sub-prompts Tokens (Col M):   {repair_tokens:,}".replace(",", "."))
        print(f"Total UC Tokens (Col N):      {total_tokens:,}".replace(",", "."))
        print(f"Estimated Cost:               ${summary['tokens']['total_cost_usd']:.4f}")
        print("-" * 65)
        if args.update and args.run_json:
            print(f"Updated canonical run: {args.run_json}")


if __name__ == "__main__":
    main()
