"""Resolve and stream the active Codex rollout for deterministic telemetry."""

import hashlib
import json
import os
from pathlib import Path

from metrics_contract import USAGE, digest, require, usage


START = {"turn_started", "task_started"}
END = {"turn_complete", "turn_completed", "task_complete", "task_completed"}
ABORT = {"turn_aborted", "task_aborted"}


def resolve_current_rollout():
    """Prefer the environment-bound rollout, then the newest rollout.

    The fallback is valid for this workflow because the operator runs only one
    active Codex chat at a time. A repository path supplied by the model is
    deliberately not accepted.
    """
    sessions_root = Path.home() / ".codex" / "sessions"
    require(sessions_root.is_dir(), f"Codex sessions directory not found: {sessions_root}")

    session_id = os.environ.get("CODEX_SESSION_ID")
    thread_id = os.environ.get("CODEX_THREAD_ID")
    for identity in (session_id, thread_id):
        if not identity:
            continue
        matches = list(sessions_root.rglob(f"*{identity}*.jsonl"))
        if matches:
            return max(matches, key=lambda item: item.stat().st_mtime_ns), session_id

    rollouts = list(sessions_root.rglob("rollout-*.jsonl"))
    require(rollouts, f"no Codex rollout found in {sessions_root}")
    return max(rollouts, key=lambda item: item.stat().st_mtime_ns), None


def analyze_session():
    """Parse the rollout once with incremental hashing and bounded memory."""
    path, expected_session_id = resolve_current_rollout()
    turns, current, previous, session_id = [], None, None, None
    offset = 0
    full_hasher = hashlib.sha256()
    prefix_hasher = hashlib.sha256()
    diagnostics = {"token_updates": 0, "duplicate_updates": 0, "counter_resets": 0}
    file_size = path.stat().st_size

    with path.open("rb") as stream:
        remaining = file_size
        while remaining > 0:
            line = stream.readline(remaining)
            require(bool(line), "rollout ended before its captured snapshot size")
            remaining -= len(line)
            offset += len(line)
            full_hasher.update(line)
            prefix_hasher.update(line)
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                require(offset == file_size and not line.endswith(b"\n"), "malformed JSONL record")
                break
            top, payload = record.get("type"), record.get("payload") or {}
            kind, at = payload.get("type"), record.get("timestamp")
            if top == "session_meta":
                session_id = payload.get("id") or session_id
            if top == "event_msg" and kind in START:
                if current:
                    turns.append(current)
                current = {"turn_id": payload.get("turn_id"), "turn_number": len(turns) + 1,
                           "started_at": at, "ended_at": None, "completed": False,
                           "message": "", "model": None, "tokens": None,
                           "turn_context_seen": False, "user_message_seen": False,
                           "usage_updates": 0, "tool_call_count": 0, "call_ids": set(),
                           "prefix_bytes": None, "prefix_sha256": None}
            elif top == "turn_context" and current:
                current["turn_context_seen"] = True
                current["turn_id"] = current["turn_id"] or payload.get("turn_id")
                current["model"] = payload.get("model") or current["model"]
            elif top == "event_msg" and kind == "user_message" and current:
                message = payload.get("message")
                if isinstance(message, str):
                    current["message"] = message.strip()
                    current["user_message_seen"] = True
            elif top == "response_item" and current:
                if payload.get("role") == "user" and current["turn_context_seen"] and not current["user_message_seen"]:
                    current["message"] = "\n".join(
                        item.get("text", "") for item in payload.get("content", [])
                        if isinstance(item, dict) and item.get("type") in ("input_text", "text"))
                    current["user_message_seen"] = bool(current["message"].strip())
                if isinstance(kind, str) and kind.endswith("_call"):
                    call_id = payload.get("call_id") or payload.get("id")
                    if not call_id or call_id not in current["call_ids"]:
                        current["tool_call_count"] += 1
                        if call_id:
                            current["call_ids"].add(call_id)
            elif top == "event_msg" and kind in END | ABORT and current:
                require(not payload.get("turn_id") or payload["turn_id"] == current["turn_id"],
                        "completion turn identity mismatch")
                current.update(ended_at=at, completed=True, terminal_event=kind,
                               prefix_bytes=offset,
                               prefix_sha256="sha256:" + prefix_hasher.copy().hexdigest())
                turns.append(current)
                current = None

            if top != "event_msg" or kind != "token_count":
                continue
            info = payload.get("info") or {}
            if not isinstance(info.get("total_token_usage"), dict):
                continue
            counters = usage(info["total_token_usage"])
            if counters == previous:
                diagnostics["duplicate_updates"] += 1
                continue
            backwards = previous is not None and any(
                counters[key] is not None and previous[key] is not None and counters[key] < previous[key]
                for key in USAGE)
            if backwards:
                diagnostics["counter_resets"] += 1
                delta = usage(info.get("last_token_usage"))
            elif previous is None:
                delta = counters.copy()
                if current and isinstance(info.get("last_token_usage"), dict):
                    first_usage = usage(info["last_token_usage"])
                    require(all(counters[key] == first_usage[key]
                                for key in ("input_tokens", "output_tokens", "total_tokens")),
                            "first cumulative event contains prior usage without a baseline; supply complete rollout")
            else:
                delta = {key: None if counters[key] is None or previous[key] is None
                         else counters[key] - previous[key] for key in USAGE}
            previous = counters
            diagnostics["token_updates"] += 1
            if current:
                old = current["tokens"]
                current["tokens"] = delta if old is None else {
                    key: None if old[key] is None or delta[key] is None else old[key] + delta[key]
                    for key in USAGE}
                current["usage_updates"] += 1

    if current:
        turns.append(current)
    require(session_id, "session_meta.id required; do not infer identity from file recency")
    if expected_session_id:
        require(session_id == expected_session_id, "resolved rollout session identity mismatch")
    require(all(turn["turn_id"] for turn in turns), "explicit turn IDs required")
    require(len({turn["turn_id"] for turn in turns}) == len(turns), "duplicate turn IDs")
    return {"session_id": session_id, "file_name": path.name,
            "sha256": "sha256:" + full_hasher.hexdigest(),
            "turns": turns, "diagnostics": diagnostics}


def public_turn(turn):
    return {key: value for key, value in turn.items() if key not in (
        "message", "call_ids", "usage_updates", "turn_context_seen", "user_message_seen")} | {
        "message_sha256": digest(turn["message"].encode("utf-8"))}


def find_turn(session, turn_id):
    values = [turn for turn in session["turns"] if turn["turn_id"] == turn_id]
    require(len(values) == 1, f"turn not uniquely found: {turn_id}")
    return values[0]


def classified_phase(state, turn, session):
    """Return the live timing/control bucket, never a semantic token label."""
    number = turn["turn_number"]
    for phase, value in state["phases"].items():
        if value["status"] == "skipped":
            continue
        start = find_turn(session, value["first_turn_id"])["turn_number"]
        end = (find_turn(session, value["measurement_turn_id"])["turn_number"]
               if value.get("measurement_turn_id") else float("inf"))
        if start <= number < end:
            return phase
    return None
