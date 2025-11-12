#!/usr/bin/env python3
"""
Telemetry Filter Audit

Loads a diagnostics JSON (3-stage) and reproduces OperationFilter strategies and smart presets
against stage3_timelineData.events, printing metrics to help validate correctness.

Usage:
    python scripts/telemetry_filter_audit.py ./.logs/telemetry-diagnostics-XXXXXXXXXXXX.json [--out outputs/audit.md]

Outputs:
  - Global stats (counts, durations)
  - Strategy results: all, category, search, timewindow, performance
  - Preset results: critical-path, plugin-health, user-interactions, render-operations, initialization, dead-time

Matches the definitions in src/ui/telemetry/OperationFilter.tsx
"""

import json
import re
import sys
from pathlib import Path
from datetime import datetime, UTC
import datetime as dt
from collections import Counter, defaultdict

# ----- Filter logic mirrors applyEventFilter -----

def apply_event_filter(events, filter_obj):
    strategy = filter_obj.get('strategyId', 'all')
    if not filter_obj or strategy == 'all':
        return events

    if strategy == 'category':
        event_types = filter_obj.get('eventTypes') or []
        query = (filter_obj.get('query') or '').lower()
        if event_types:
            return [e for e in events if e.get('type') in event_types]
        if query:
            return [e for e in events if query in (e.get('name','').lower())]
        return events

    if strategy == 'search':
        query = filter_obj.get('query') or ''
        try:
            rx = re.compile(query, re.IGNORECASE)
            return [e for e in events if rx.search(e.get('name',''))]
        except re.error:
            q = query.lower()
            return [e for e in events if q in (e.get('name','').lower())]

    if strategy == 'timewindow':
        query = filter_obj.get('query') or ''
        parts = query.split('-')
        if len(parts) == 2:
            try:
                min_time = int(parts[0])
                max_time = int(parts[1])
                return [e for e in events if int(e.get('time',0)) >= min_time and int(e.get('time',0)) <= max_time]
            except ValueError:
                return events
        return events

    if strategy == 'performance':
        min_dur = filter_obj.get('minDuration', 1000)
        max_dur = filter_obj.get('maxDuration', float('inf'))
        return [e for e in events if float(e.get('duration',0)) >= min_dur and float(e.get('duration',0)) <= max_dur]

    return events

# ----- Presets (mirror SMART_PRESETS) -----
SMART_PRESETS = {
    'critical-path': {
        'strategyId': 'performance',
        'query': '',
        'minDuration': 2000,
    },
    'plugin-health': {
        'strategyId': 'category',
        'query': 'plugin',
        'eventTypes': ['plugin'],
    },
    'user-interactions': {
        'strategyId': 'category',
        'query': 'interaction',
        'eventTypes': ['interaction', 'ui'],
    },
    'render-operations': {
        'strategyId': 'category',
        'query': 'render',
        'eventTypes': ['render', 'blocked'],
    },
    'initialization': {
        'strategyId': 'timewindow',
        'query': '0-3000',
    },
    'dead-time': {
        'strategyId': 'category',
        'query': 'gap',
        'eventTypes': ['gap', 'blocked'],
    },
}


def stats_for(events):
    """Compute useful stats for a list of events."""
    counts = Counter([e.get('type') for e in events])
    total_dur = sum(float(e.get('duration',0)) for e in events)
    gaps = [e for e in events if e.get('type') == 'gap']
    blocked = [e for e in events if e.get('type') == 'blocked']
    gap_time = sum(float(e.get('duration',0)) for e in gaps)
    blocked_time = sum(float(e.get('duration',0)) for e in blocked)
    return {
        'count': len(events),
        'type_counts': dict(counts),
        'total_duration_ms': total_dur,
        'gap_time_ms': gap_time,
        'blocked_time_ms': blocked_time,
    }


def print_section(title):
    print('\n' + '='*80)
    print(title)
    print('='*80)


def fmt_ms(ms: float) -> str:
    return f"{int(ms):,} ms"


def build_markdown_report(source_path: Path, events, global_stats, strategy_results, preset_results, consistency, base_epoch: int | None):
    name = source_path.name
    # Use timezone-aware UTC per deprecation guidance
    ts = datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%SZ')
    lines = []
    lines.append(f"# Telemetry Filter Audit Report\n")
    lines.append(f"Generated: {ts} UTC  ")
    lines.append(f"Source: `{name}`\n")

    lines.append("\n## Global Summary\n")
    lines.append(f"- Total events: **{global_stats['count']}**")
    types_str = ', '.join(sorted(set(e.get('type') for e in events)))
    lines.append(f"- Types: {types_str}")
    lines.append(f"- Type counts: {global_stats['type_counts']}")
    lines.append(f"- Total duration (sum of durations): {fmt_ms(global_stats['total_duration_ms'])}")
    lines.append(f"- Gap time: {fmt_ms(global_stats['gap_time_ms'])}  |  Blocked time: {fmt_ms(global_stats['blocked_time_ms'])}")

    lines.append("\n## Strategy Checks\n")
    for label, filt, stats in strategy_results:
        lines.append(f"- {label}: count={stats['count']} typeCounts={stats['type_counts']}")

    lines.append("\n## Smart Presets\n")
    for label, filt, stats in preset_results:
        lines.append(f"- {label}: count={stats['count']} typeCounts={stats['type_counts']}")

    lines.append("\n## Consistency Checks\n")
    lines.append(f"- dead-time preset count={consistency['dead_count']} vs gap+blocked raw count={consistency['gap_like_count']}")
    lines.append(f"- critical-path below-threshold events: {consistency['below_threshold']} (should be 0)")

    # ---- Drill-down Details Section ----
    def ascii_bar(dur: float, max_d: float, width: int = 32) -> str:
        if max_d <= 0:
            max_d = 1.0
        n = int((dur / max_d) * width)
        n = max(1, min(width, n))
        return '#' * n

    lines.append("\n## Drill-down Details\n")

    # Interactions & UI chronological
    interactions = [e for e in events if e.get('type') in ('interaction','ui')]
    max_i_dur = max([float(e.get('duration',0)) for e in interactions], default=1.0)
    lines.append("### Interactions & UI (chronological)\n")
    if interactions:
        # Attempt to derive an absolute base timestamp if sourceTimestamp present
        # Prefer explicit per-event sourceTimestamp; fall back to provided base_epoch (earliest session absolute)
        source_times = [e.get('sourceTimestamp') for e in events if e.get('sourceTimestamp') is not None]
        source_times_valid = [t for t in source_times if isinstance(t,(int,float))]
        base_source = (min(source_times_valid) if source_times_valid else base_epoch)
        for e in sorted(interactions, key=lambda x: float(x.get('time',0))):
            dur = float(e.get('duration',0))
            bar = ascii_bar(dur, max_i_dur)
            rel = int(e.get('time',0))
            if base_source is not None:
                abs_ms = base_source + rel
                # ISO timestamp
                abs_iso = dt.datetime.fromtimestamp(abs_ms/1000.0, dt.timezone.utc).isoformat().replace('+00:00','Z')
                lines.append(f"- t={rel:>5}ms dur={int(dur):>4}ms [{bar:<32}] {e.get('type')} :: {e.get('name','')} | abs={abs_iso}")
            else:
                lines.append(f"- t={rel:>5}ms dur={int(dur):>4}ms [{bar:<32}] {e.get('type')} :: {e.get('name','')}")
    else:
        lines.append("(none)")

    # Critical path (gap + blocked) sorted by duration desc
    crit_events = [e for e in events if e.get('type') in ('gap','blocked')]
    max_c_dur = max([float(e.get('duration',0)) for e in crit_events], default=1.0)
    lines.append("\n### Critical Path (gap + blocked)\n")
    if crit_events:
        for e in sorted(crit_events, key=lambda x: float(x.get('duration',0)), reverse=True):
            dur = float(e.get('duration',0))
            bar = ascii_bar(dur, max_c_dur, width=40)
            lines.append(f"- dur={int(dur):>5}ms [{bar:<40}] {e.get('type')} at t={int(e.get('time',0))}ms name={e.get('name','')}")
    else:
        lines.append("(none)")

    # Top sequences aggregation
    seq_events = [e for e in events if e.get('type') == 'sequence']
    seq_agg = {}
    for e in seq_events:
        nm = e.get('name') or 'unknown-sequence'
        d = float(e.get('duration',0))
        rec = seq_agg.setdefault(nm, {'count':0,'total_dur':0.0})
        rec['count'] += 1
        rec['total_dur'] += d
    top_seq = sorted(seq_agg.items(), key=lambda kv: (kv[1]['count'], kv[1]['total_dur']), reverse=True)[:15]
    max_seq_dur = max([v['total_dur'] for _, v in top_seq], default=1.0)
    lines.append("\n### Top Sequences (by count then duration)\n")
    if top_seq:
        for name, info in top_seq:
            bar = ascii_bar(info['total_dur'], max_seq_dur, width=28)
            lines.append(f"- {name} count={info['count']} totalDur={int(info['total_dur'])}ms [{bar:<28}]")
    else:
        lines.append("(none)")

    # Search strategy sample detail (pattern 'Header')
    search_strategy = next((s for s in strategy_results if s[0] == 'search'), None)
    lines.append("\n### Search Strategy Sample (pattern: 'Header')\n")
    if search_strategy:
        _, filt, _stats = search_strategy
        search_subset = apply_event_filter(events, filt)
        if search_subset:
            max_s_dur = max([float(e.get('duration',0)) for e in search_subset], default=1.0)
            for e in search_subset:
                dur = float(e.get('duration',0))
                bar = ascii_bar(dur, max_s_dur, width=24)
                lines.append(f"- {e.get('name','')} dur={int(dur)}ms [{bar:<24}] type={e.get('type')}")
        else:
            lines.append("(no matches found)")
    else:
        lines.append("(search strategy not executed)")

    return '\n'.join(lines) + '\n'


def main(path, out_path=None):
    p = Path(path)
    data = json.loads(p.read_text(encoding='utf-8'))
    stage3 = data.get('stage3_timelineData') or {}
    events = stage3.get('events') or []

    # Global summary
    print_section('GLOBAL SUMMARY (stage3_timelineData)')
    base = stats_for(events)
    print(f"Total events: {base['count']}")
    print(f"Types: {sorted(set(e.get('type') for e in events))}")
    print(f"Type counts: {base['type_counts']}")
    print(f"Total duration (sum of durations): {base['total_duration_ms']:.0f} ms")
    print(f"Gap time: {base['gap_time_ms']:.0f} ms | Blocked time: {base['blocked_time_ms']:.0f} ms")

    # Strategy checks
    print_section('STRATEGY CHECKS')
    strategies = [
        {'strategyId': 'all', 'query': ''},
        {'strategyId': 'category', 'query': '', 'eventTypes': []},
        {'strategyId': 'search', 'query': 'Header'},
        {'strategyId': 'timewindow', 'query': '0-5000'},
        {'strategyId': 'performance', 'query': '', 'minDuration': 2000},
    ]
    strategy_results = []
    for f in strategies:
        subset = apply_event_filter(events, f)
        s = stats_for(subset)
        strategy_results.append((f['strategyId'], f, s))
        print(f"- {f['strategyId']} -> count={s['count']}, typeCounts={s['type_counts']}")

    # Preset checks
    print_section('SMART PRESETS CHECKS')
    preset_results = []
    for preset_id, f in SMART_PRESETS.items():
        subset = apply_event_filter(events, f)
        s = stats_for(subset)
        preset_results.append((preset_id, f, s))
        print(f"- {preset_id}: count={s['count']}, typeCounts={s['type_counts']}")

    # Sanity: ensure that dead-time equals all gaps+blocked
    dead_f = SMART_PRESETS['dead-time']
    dead_subset = apply_event_filter(events, dead_f)
    gap_like = [e for e in events if e.get('type') in ('gap','blocked')]
    print_section('CONSISTENCY CHECKS')
    print(f"dead-time preset count={len(dead_subset)} should equal raw gap-like count={len(gap_like)}")

    # Edge: ensure performance preset duration threshold is applied
    perf_f = SMART_PRESETS['critical-path']
    perf_subset = apply_event_filter(events, perf_f)
    too_short = [e for e in perf_subset if float(e.get('duration',0)) < perf_f['minDuration']]
    print(f"critical-path below-threshold events found: {len(too_short)} (should be 0)")

    # Optional markdown report
    if out_path:
        out_p = Path(out_path)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        # Determine base epoch ms from diagnostics (prefer top-level earliest, then stage1_rawLog.earliest, then sessionStart)
        base_epoch = None
        if data.get('earliest'):
            base_epoch = int(datetime.fromisoformat(data['earliest'].replace('Z','+00:00')).timestamp()*1000)
        elif isinstance(data.get('stage1_rawLog'), dict) and data['stage1_rawLog'].get('earliest'):
            base_epoch = int(datetime.fromisoformat(data['stage1_rawLog']['earliest'].replace('Z','+00:00')).timestamp()*1000)
        elif stage3.get('sessionStart'):
            base_epoch = int(datetime.fromisoformat(stage3['sessionStart'].replace('Z','+00:00')).timestamp()*1000)
        report = build_markdown_report(
            p,
            events,
            base,
            strategy_results,
            preset_results,
            {
                'dead_count': len(dead_subset),
                'gap_like_count': len(gap_like),
                'below_threshold': len(too_short),
            },
            base_epoch=base_epoch,
        )
        out_p.write_text(report, encoding='utf-8')
        print(f"\nReport written to: {out_p}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python scripts/telemetry_filter_audit.py <path-to-diagnostics.json> [--out outputs/audit.md]')
        sys.exit(1)
    json_arg = None
    out_arg = None
    args = sys.argv[1:]
    if '--out' in args:
        idx = args.index('--out')
        if idx+1 < len(args):
            out_arg = args[idx+1]
            del args[idx:idx+2]
    if args:
        json_arg = args[0]
    else:
        print('Missing diagnostics JSON path')
        sys.exit(1)
    main(json_arg, out_arg)
