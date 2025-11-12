import re
import json
import sys
import argparse
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Tuple

# Simple classifier regexes (extend over time)
PATTERNS = [
    ("sequence_registry_pass", re.compile(r"^✅\s+SequenceRegistry: Sequence \"(?P<sequence>.+?)\" validation passed")),
    ("sequence_registry_registered", re.compile(r"^🎼\s+SequenceRegistry: Registered sequence \"(?P<sequence>.+?)\" \(id: (?P<id>[^\)]+)\)")),
    ("sequence_registered", re.compile(r"^🎼\s+Sequence registered: (?P<sequence>.+)$")),
    ("execution_enqueued", re.compile(r"^🎼\s+ExecutionQueue: Enqueued \"(?P<sequence>.+?)\".*")),
    ("execution_dequeued", re.compile(r"^🎼\s+ExecutionQueue: Dequeued \"(?P<sequence>.+?)\"")),
    ("execution_now", re.compile(r"^🎼\s+ExecutionQueue: Now executing \"(?P<sequence>.+?)\"")),
    ("sequence_orchestrator_queued", re.compile(r"^🎼\s+SequenceOrchestrator: Sequence \"(?P<sequence>.+?)\" \(id: (?P<id>[^\)]+)\) queued successfully")),
    ("perf_movement_started", re.compile(r"^⏱️\s+PerformanceTracker: Started timing movement (?P<movement>.+?) for (?P<sequence>.+)$")),
    ("perf_beat_started", re.compile(r"^⏱️\s+PerformanceTracker: Started timing beat (?P<beat>\d+) for (?P<sequence>.+)$")),
    ("databaton_started", re.compile(r"^🎽\s+DataBaton: \+started \| seq=(?P<sequence>.+?) .*event=(?P<event>[\w\.\-]+).* plugin=(?P<plugin>\w+).* req=(?P<req>\S+).*")),
    ("databaton_no_changes", re.compile(r"^🎽\s+DataBaton: No changes \| seq=(?P<sequence>.+?) .*event=(?P<event>[\w\.\-]+).*")),
    ("perf_movement_cleaned", re.compile(r"^⏱️\s+PerformanceTracker: Cleaned up failed movement (?P<movement>.+?) for (?P<sequence>.+)$")),
    ("execution_marked_completed", re.compile(r"^🎼\s+ExecutionQueue: Marked \"(?P<sequence>.+?)\" as completed.*$")),
    ("sequence_executor_completed", re.compile(r"^✅\s+SequenceExecutor: Sequence \"(?P<sequence>.+?)\" completed in (?P<ms>[0-9.]+)ms$")),
]

# The log lines often have a file prefix before the ISO timestamp, e.g.:
# EventBus.ts:56 2025-11-10T21:56:16.932Z 🎼 EventBus: Using internal conductor
# Make the prefix optional and capture the ISO timestamp plus the rest of message.
TS_RE = re.compile(r"^\s*(?:[^ ]+?:\d+\s+)?(?P<ts>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\s+(?P<msg>.*)$")


def parse_line(line: str) -> Tuple[str, Dict[str, Any]]:
    m = TS_RE.match(line.rstrip("\n"))
    if not m:
        return None, None
    ts_iso = m.group("ts")
    msg = m.group("msg")
    event = {"raw": msg}
    # try classify
    for etype, rx in PATTERNS:
        mm = rx.match(msg)
        if mm:
            event["type"] = etype
            event.update({k: v for k, v in mm.groupdict().items() if v is not None})
            break
    if "type" not in event:
        event["type"] = "other"
    return ts_iso, event


def iso_to_epoch_ms(iso: str) -> int:
    dt = datetime.strptime(iso, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=timezone.utc)
    return int(dt.timestamp() * 1000)


def build_frames(log_path: Path) -> Dict[str, Any]:
    frames_map: Dict[str, Dict[str, Any]] = {}
    with log_path.open("r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            ts, evt = parse_line(line)
            if not ts:
                continue
            fr = frames_map.get(ts)
            if not fr:
                fr = {"ts": ts, "epochMs": iso_to_epoch_ms(ts), "events": []}
                frames_map[ts] = fr
            fr["events"].append(evt)
    # sort frames
    frames: List[Dict[str, Any]] = sorted(frames_map.values(), key=lambda x: x["epochMs"]) 
    summary = {
        "totalFrames": len(frames),
        "totalEvents": sum(len(fr["events"]) for fr in frames),
        "firstTs": frames[0]["ts"] if frames else None,
        "lastTs": frames[-1]["ts"] if frames else None,
    }
    return {"summary": summary, "frames": frames}


def main():
    ap = argparse.ArgumentParser(description="Build timestamp-keyed frames JSON from raw log")
    ap.add_argument("log", help="Path to raw log file (e.g., .logs/web-variant-localhost-*.log)")
    ap.add_argument("--out", help="Output JSON path", default=None)
    args = ap.parse_args()

    log_path = Path(args.log)
    if not log_path.exists():
        print(f"Log not found: {log_path}", file=sys.stderr)
        sys.exit(1)

    frames = build_frames(log_path)

    out_path = Path(args.out) if args.out else (log_path.parent.parent / "outputs" / f"frames-{log_path.name.replace('.log', '')}.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(frames, f, indent=2)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
