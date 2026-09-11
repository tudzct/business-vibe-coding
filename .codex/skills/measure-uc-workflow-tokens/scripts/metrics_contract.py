"""Shared, deterministic contract for observed UC metrics (standard library only)."""

import hashlib
import json
import os
import tempfile
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path

CORE = ("prompt_generation", "source_generation", "repair")
AUX = ("configuration_and_approval", "dataset_resolution", "audit",
       "runtime_verification", "finalization", "uc_setup")
USAGE = ("input_tokens", "cached_input_tokens", "output_tokens",
         "reasoning_output_tokens", "total_tokens")
METHOD = "system_timestamp_delta"
ROOT = Path(__file__).resolve().parents[4]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(raw):
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def writable(path):
    path = Path(path).resolve()
    require(path.is_relative_to(ROOT), "output must stay inside Business repository")
    relative = path.relative_to(ROOT)
    require(not relative.parts or not relative.parts[0].lower().endswith("-master"),
            "external reference projects are read-only")
    return path


def atomic_write(path, value, raw=False):
    path = writable(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    content = value if raw else json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    fd, temp = tempfile.mkstemp(prefix=path.name + ".", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


def context(run_path):
    path = writable(run_path)
    run = read_json(path)
    for key in ("uc_id", "run_id"):
        value = run.get(key)
        require(isinstance(value, str) and value and
                all(c.isalnum() or c in "-_." for c in value) and value not in (".", ".."),
                f"invalid {key}")
    folder = writable(ROOT / "docs/02-construction/implementation" /
                      run["uc_id"] / "runs" / run["run_id"])
    return path, run, folder


@contextmanager
def run_lock(folder):
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / ".metrics.lock"
    try:
        fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError as exc:
        raise ValueError("metrics writer already active; inspect lock before retrying") from exc
    try:
        os.close(fd)
        yield
    finally:
        path.unlink()


def journal(run, folder):
    path = folder / "phase-ledger.json"
    value = read_json(path) if path.exists() else {
        "schema_version": 1, "uc_id": run["uc_id"], "run_id": run["run_id"],
        "session_id": None, "phases": {}, "segments": [], "observations": [],
        "workflow_status": "open"}
    require(all(value[k] == run[k] for k in ("uc_id", "run_id")), "ledger identity mismatch")
    committed = (run.get("metrics") or {}).get("phase_ledger")
    if committed and len(committed["observations"]) > len(value["observations"]):
        # Recovery after canonical commit succeeded but a mirror write was interrupted.
        value = json.loads(json.dumps(committed))
    return value


def save_journal(folder, value):
    atomic_write(folder / "phase-ledger.json", value)
    lines = ["# UC phase ledger", "", f"UC: `{value['uc_id']}`; run: `{value['run_id']}`",
             "", "Machine authority: phase-ledger.json. Each turn belongs to one phase.",
             "", "| Phase | Status | First turn | Measurement boundary (excluded) |",
             "|---|---|---|---|"]
    for phase in CORE:
        item = value["phases"].get(phase, {})
        lines.append(f"| {phase} | {item.get('status', 'not_started')} | "
                     f"{item.get('first_turn_id', '')} | {item.get('measurement_turn_id', '')} |")
    lines += ["", f"Workflow: {value['workflow_status']}", "",
              "## Measurements", "", "All measurement turns are excluded from phase and workflow metrics.", ""]
    for item in value["observations"]:
        lines.append(f"- `{item['measurement_turn_id']}`: {item['action']}; last selected turn "
                     f"`{item['last_turn_id']}`; evidence `{item['evidence_sha256']}`")
    atomic_write(folder / "phase-ledger.md", "\n".join(lines) + "\n", raw=True)


def epoch(at):
    require(isinstance(at, str), "missing ISO timestamp")
    parsed = datetime.fromisoformat(at.replace("Z", "+00:00"))
    require(parsed.tzinfo is not None, "timestamp requires timezone")
    return round(parsed.timestamp() * 1000)


def endpoint(value):
    ms = value.get("epoch_ms")
    require(type(ms) is int and abs(epoch(value.get("at")) - ms) <= 1000,
            "ISO and epoch must describe the same instant within one second")
    return ms


def duration(segment):
    start, end = segment["start"], segment["end"]
    for key in ("uc_id", "run_id", "session_id", "turn_id", "phase", "segment_id"):
        require(start.get(key) == end.get(key), f"timestamp {key} mismatch")
    require(start["event"] == "start" and end["event"] == "end", "invalid timestamp events")
    a, b = endpoint(start), endpoint(end)
    require(b >= a, "negative duration")
    return round((b - a) / 1000, 3)


def usage(raw):
    require(isinstance(raw, dict), "missing token counters")
    result = {}
    for key in USAGE:
        value = raw.get(key)
        require(value is None or (type(value) is int and value >= 0), f"invalid {key}")
        result[key] = value
    require(all(result[k] is not None for k in ("input_tokens", "output_tokens", "total_tokens")),
            "input/output/total token counters required")
    require(result["total_tokens"] == result["input_tokens"] + result["output_tokens"],
            "total_tokens must equal input_tokens + output_tokens")
    for child, parent in (("cached_input_tokens", "input_tokens"),
                          ("reasoning_output_tokens", "output_tokens")):
        require(result[child] is None or result[child] <= result[parent], f"{child} exceeds {parent}")
    return result


def aggregate(rows):
    result = {key: (None if any(r["tokens"][key] is None for r in rows)
                    else sum(r["tokens"][key] for r in rows)) for key in USAGE}
    reasons = {key: "Counter unavailable in at least one selected turn"
               for key in USAGE if result[key] is None}
    times = [r["duration_seconds"] for r in rows]
    return {"tokens": result, "token_unavailable_reasons": reasons,
            "duration_seconds": None if any(t is None for t in times) else round(sum(times), 3),
            "timing_unavailable_reason": "Missing captured endpoints; see turns" if None in times else None,
            "workflow_turn_count": len(rows),
            "tool_call_count": sum(r["tool_call_count"] for r in rows),
            "model_call_count": None,
            "model_call_count_unavailable_reason": "Rollout usage updates are not proven model request events"}


def validate_metrics(metrics):
    require(metrics.get("schema_version") == 1, "unsupported metrics schema")
    require(metrics.get("timing_method") == METHOD, "unsupported timing method")
    rows = metrics.get("turns", [])
    require(len({(r["session_id"], r["turn_id"]) for r in rows}) == len(rows), "duplicate turn")
    for row in rows:
        usage(row["tokens"])
        require(row["phase"] in CORE + AUX and row["completed"], "invalid selected turn")
        require(bool(row.get("reason")), "turn classification needs a reason")
        require(type(row.get("tool_call_count")) is int and row["tool_call_count"] >= 0, "invalid tool-call count")
        require(row["duration_seconds"] is None or row["duration_seconds"] >= 0, "negative time")
        if row["duration_seconds"] is None:
            require(bool(row.get("timing_unavailable_reason")), "missing time needs a reason")
        else:
            segments = row.get("timing_segments", [])
            require(bool(segments), "observed duration needs captured segments")
            require(round(sum(duration(s) for s in segments), 3) == row["duration_seconds"],
                    "duration differs from captured endpoints")
            for segment in segments:
                require(all(segment["start"].get(k) == metrics[k] for k in ("uc_id", "run_id")),
                        "segment UC/run mismatch")
                require(all(segment["start"].get(k) == row[k] for k in ("turn_id", "session_id", "phase")),
                        "segment turn identity mismatch")
    require(metrics["workflow"] == aggregate(rows), "workflow metrics differ from selected turns")
    require(not {r["turn_id"] for r in rows}.intersection(e["turn_id"] for e in metrics.get("excluded_turns", [])),
            "a selected turn cannot also be excluded")
    require(set(metrics["phases"]) == set(CORE), "exactly three metric phases required")
    for phase in CORE:
        item = metrics["phases"][phase]
        if item["status"] in ("closed", "skipped"):
            expected = aggregate([r for r in rows if r["phase"] == phase])
            require(item["values"] == expected, f"{phase} metrics mismatch")
            if item["status"] == "skipped":
                require(phase == "repair" and bool(item.get("reason")) and not any(r["phase"] == phase for r in rows),
                        "skipped repair must have a decision and no work turns")
        else:
            require(item["values"] is None, "unclosed phase cannot report final values")
    intervals = sorted((s["start"]["epoch_ms"], s["end"]["epoch_ms"])
                       for row in rows if row["duration_seconds"] is not None
                       for s in row["timing_segments"])
    require(all(a[1] <= b[0] for a, b in zip(intervals, intervals[1:])), "overlapping captured time")


def metrics_markdown(metrics):
    validate_metrics(metrics)
    lines = ["## Observed workflow metrics", "", f"Status: {metrics['status']}", "",
             "| Scope | Input | Cached input | Output | Reasoning output | Total | Seconds | Turns | Tool calls |",
             "|---|---:|---:|---:|---:|---:|---:|---:|---:|"]
    values = [(p, metrics["phases"][p]["values"]) for p in CORE] + [("workflow", metrics["workflow"])]
    for name, item in values:
        cells = ([item["tokens"][k] for k in USAGE] + [item["duration_seconds"],
                 item["workflow_turn_count"], item["tool_call_count"]]) if item else [None] * 8
        lines.append("| " + name + " | " + " | ".join("N/A" if c is None else str(c) for c in cells) + " |")
    lines += ["", "Cached input is included in input; reasoning output is included in output.",
              "Seconds sum captured work intervals. Waiting between turns and measurement/report turns are excluded.",
              "Model call count: unavailable (token usage updates are not model call evidence).", ""]
    if metrics["phases"]["repair"]["status"] == "skipped":
        lines += ["Repair skipped: " + metrics["phases"]["repair"]["reason"], ""]
    for row in metrics["turns"]:
        if row["duration_seconds"] is None:
            lines.append(f"- Timing unavailable for `{row['turn_id']}`: {row['timing_unavailable_reason']}")
    return "\n".join(lines)
