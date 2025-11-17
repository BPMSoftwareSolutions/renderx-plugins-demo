#!/usr/bin/env python3
"""
Analyze Graph - Extracts metrics and telemetry from IR
"""
import os
import sys
import json
import argparse
from pathlib import Path
from collections import defaultdict, Counter

def analyze_ir(ir_path: str) -> dict:
    """
    Analyze IR and extract metrics.
    """
    # Load IR
    with open(ir_path, 'r') as f:
        ir = json.load(f)

    files = ir.get("files", [])
    symbols = ir.get("symbols", [])
    calls = ir.get("calls", [])
    contracts = ir.get("contracts", [])

    # Calculate metrics
    analysis = {
        "version": "0.1.0",
        "generated_at": "",
        "statistics": {
            "files": len(files),
            "symbols": len(symbols),
            "calls": len(calls),
            "contracts": len(contracts)
        },
        "symbol_types": defaultdict(int),
        "call_distribution": defaultdict(int),
        "complexity": {
            "average_calls_per_symbol": 0,
            "max_calls_per_symbol": 0,
            "min_calls_per_symbol": 0
        },
        "coverage": {
            "symbols_with_calls": 0,
            "symbols_without_calls": 0
        }
    }

    # Analyze symbol types
    for symbol in symbols:
        sym_type = symbol.get("kind") or symbol.get("type") or "unknown"
        analysis["symbol_types"][sym_type] += 1

    # Analyze call distribution
    calls_per_symbol = defaultdict(int)
    for call in calls:
        caller = call.get("frm") or call.get("from") or call.get("caller") or "unknown"
        calls_per_symbol[caller] += 1
        analysis["call_distribution"][caller] += 1

    # Calculate complexity metrics
    if calls_per_symbol:
        call_counts = list(calls_per_symbol.values())
        analysis["complexity"]["average_calls_per_symbol"] = sum(call_counts) / len(call_counts)
        analysis["complexity"]["max_calls_per_symbol"] = max(call_counts)
        analysis["complexity"]["min_calls_per_symbol"] = min(call_counts)

    # Calculate coverage
    symbols_with_calls = len(calls_per_symbol)
    symbols_without_calls = len(symbols) - symbols_with_calls
    analysis["coverage"]["symbols_with_calls"] = symbols_with_calls
    analysis["coverage"]["symbols_without_calls"] = symbols_without_calls

    # Convert defaultdicts to regular dicts
    analysis["symbol_types"] = dict(analysis["symbol_types"])
    analysis["call_distribution"] = dict(analysis["call_distribution"])

    # Architecture-level analysis (coupling, anti-patterns, connascence)
    try:
        analysis["architecture"] = analyze_architecture_ir(ir)
    except Exception as e:
        analysis["architecture_error"] = str(e)

    return analysis


def _build_arch_graph(ir):
    # Deduplicate symbols by ID (IR may contain duplicate entries)
    seen_ids = set()
    nodes = []
    for s in ir.get("symbols", []):
        sid = s.get("id")
        if sid and sid not in seen_ids:
            nodes.append(sid)
            seen_ids.add(sid)
    idx = {n: i for i, n in enumerate(nodes)}
    out_edges = [[] for _ in nodes]
    in_edges = [[] for _ in nodes]
    call_names = defaultdict(list)
    for c in ir.get("calls", []):
        frm = c.get("frm") or c.get("from")
        if not frm or frm not in idx:
            continue
        to = c.get("to")
        name = c.get("name") or to
        call_names[frm].append(name)
        if to and to in idx:
            fi = idx[frm]
            ti = idx[to]
            out_edges[fi].append(ti)
            in_edges[ti].append(fi)
    return nodes, idx, out_edges, in_edges, call_names


def _tarjan_scc(out_edges):
    n = len(out_edges)
    index = 0
    stack = []
    onstack = [False] * n
    indices = [-1] * n
    low = [0] * n
    sccs = []

    def strongconnect(v):
        nonlocal index
        indices[v] = index
        low[v] = index
        index += 1
        stack.append(v)
        onstack[v] = True
        for w in out_edges[v]:
            if indices[w] == -1:
                strongconnect(w)
                low[v] = min(low[v], low[w])
            elif onstack[w]:
                low[v] = min(low[v], indices[w])
        if low[v] == indices[v]:
            comp = []
            while True:
                w = stack.pop()
                onstack[w] = False
                comp.append(w)
                if w == v:
                    break
            sccs.append(comp)

    for v in range(n):
        if indices[v] == -1:
            strongconnect(v)
    return sccs


def _compute_coupling(nodes, out_edges, in_edges):
    Ca = [len(in_edges[i]) for i in range(len(nodes))]
    Ce = [len(out_edges[i]) for i in range(len(nodes))]
    I = []
    for i in range(len(nodes)):
        denom = Ca[i] + Ce[i]
        I.append((Ce[i] / denom) if denom else 0.0)
    return Ca, Ce, I


def _detect_god_functions(nodes, call_names, symbol_map, threshold_calls=10, threshold_unique=8):
    suspects = []
    for n in nodes:
        names = call_names.get(n, [])
        total_calls = len(names)
        uniq_calls = len(set(names))
        if total_calls >= threshold_calls and uniq_calls >= threshold_unique:
            sym_info = symbol_map.get(n, {})

            # Count frequency of each callee
            callee_freq = Counter(names)
            top_callees = callee_freq.most_common(10)

            suspects.append(
                {
                    "symbol": n,
                    "file": sym_info.get("file"),
                    "line_range": sym_info.get("range"),
                    "total_calls": total_calls,
                    "unique_called": uniq_calls,
                    "top_callees": [
                        {"name": callee, "count": count}
                        for callee, count in top_callees
                    ]
                }
            )
    return suspects


def _detect_long_parameter_list(ir, threshold_params=6):
    suspects = []
    contracts = {c.get("id"): c for c in ir.get("contracts", []) if c.get("id")}
    for s in ir.get("symbols", []):
        pc = s.get("params_contract")
        if pc and pc in contracts:
            props = contracts[pc].get("props", [])
            if len(props) >= threshold_params:
                suspects.append(
                    {
                        "symbol": s.get("id"),
                        "file": s.get("file"),
                        "line_range": s.get("range"),
                        "param_count": len(props),
                        "contract": pc
                    }
                )
    return suspects


def _detect_shotgun_surgery(nodes, in_edges, symbol_map, threshold=8):
    suspects = []
    for i, n in enumerate(nodes):
        fan_in = len(in_edges[i])
        if fan_in >= threshold:
            sym_info = symbol_map.get(n, {})
            suspects.append({
                "symbol": n,
                "file": sym_info.get("file"),
                "line_range": sym_info.get("range"),
                "fan_in": fan_in
            })
    return suspects


def _detect_cycles(nodes, out_edges, symbol_map):
    cyc = []
    for comp in _tarjan_scc(out_edges):
        if len(comp) > 1:
            cycle_nodes = [nodes[i] for i in comp]
            cycle_with_paths = []
            for node in cycle_nodes:
                sym_info = symbol_map.get(node, {})
                cycle_with_paths.append({
                    "symbol": node,
                    "file": sym_info.get("file"),
                    "line_range": sym_info.get("range")
                })
            cyc.append({"members": cycle_with_paths, "size": len(comp)})
    return cyc


def _connascence_signals(ir, nodes, call_names, in_edges):
    signals = {"name": [], "value": [], "position": [], "algorithm": [], "timing": []}

    # Name connascence
    all_calls = []
    for names in call_names.values():
        all_calls.extend(names)
    counts = Counter(all_calls)
    for name, cnt in counts.items():
        if cnt >= 12:
            signals["name"].append({"identifier": name, "count": cnt})

    # Value connascence
    for c in ir.get("contracts", []):
        cid = c.get("id")
        if not cid:
            continue
        for p in c.get("props", []):
            raw = (p.get("raw") or "").strip()
            if raw.startswith(("'", '"')) or raw.isdigit():
                signals["value"].append(
                    {"contract": cid, "prop": p.get("name"), "raw": raw}
                )
                break

    # Position connascence
    for item in _detect_long_parameter_list(ir, threshold_params=6):
        signals["position"].append(
            {
                "symbol": item["symbol"],
                "param_count": item["param_count"],
                "contract": item["contract"],
            }
        )

    # Algorithm connascence
    for i, n in enumerate(nodes):
        fan_in = len(in_edges[i])
        if fan_in >= 10:
            signals["algorithm"].append({"symbol": n, "fan_in": fan_in})

    # Timing connascence
    for frm, names in call_names.items():
        if any(x in ("setTimeout", "setInterval") for x in names):
            signals["timing"].append({"symbol": frm})

    return signals


def analyze_architecture_ir(ir: dict) -> dict:
    nodes, idx, out_edges, in_edges, call_names = _build_arch_graph(ir)

    # Build symbol map for file path lookups (use first occurrence of each symbol ID)
    symbol_map = {}
    for s in ir.get("symbols", []):
        sid = s.get("id")
        if sid and sid not in symbol_map:  # Only use first occurrence
            # Normalize file paths to use forward slashes
            file_path = s.get("file")
            if file_path:
                file_path = file_path.replace("\\", "/")
            symbol_map[sid] = {
                "file": file_path,
                "range": s.get("range"),
                "kind": s.get("kind"),
                "name": s.get("name")
            }

    Ca, Ce, I = _compute_coupling(nodes, out_edges, in_edges)
    coupling = {}
    for i, n in enumerate(nodes):
        sym_info = symbol_map.get(n, {})
        coupling[n] = {
            "file": sym_info.get("file"),
            "line_range": sym_info.get("range"),
            "afferent": Ca[i],
            "efferent": Ce[i],
            "instability": round(I[i], 3),
        }
    summary_calls = sum(len(v) for v in call_names.values())
    return {
        "summary": {"symbols": len(nodes), "calls": summary_calls},
        "coupling": coupling,
        "anti_patterns": {
            "god_functions": _detect_god_functions(nodes, call_names, symbol_map),
            "long_parameter_list": _detect_long_parameter_list(ir),
            "shotgun_surgery_risk": _detect_shotgun_surgery(nodes, in_edges, symbol_map),
            "cycles": _detect_cycles(nodes, out_edges, symbol_map),
        },
        "connascence": _connascence_signals(ir, nodes, call_names, in_edges),
    }



def main():
    parser = argparse.ArgumentParser(description="Analyze IR and extract metrics")
    parser.add_argument("--input", required=True, help="Input IR file path")
    parser.add_argument("--output", required=True, help="Output analysis file path")

    args = parser.parse_args()

    print("")
    print("=" * 70)
    print("MOVEMENT 5: ANALYSIS & TELEMETRY")
    print("=" * 70)
    print("")

    # Analyze IR
    print(f"[*] Analyzing IR from {args.input}")
    analysis = analyze_ir(args.input)

    print(f"[*] Analysis Results:")
    print(f"    - Files: {analysis['statistics']['files']}")
    print(f"    - Symbols: {analysis['statistics']['symbols']}")
    print(f"    - Calls: {analysis['statistics']['calls']}")
    print(f"    - Contracts: {analysis['statistics']['contracts']}")
    print("")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    # Write analysis
    print(f"[*] Writing analysis to {args.output}")
    with open(args.output, 'w') as f:
        json.dump(analysis, f, indent=2)

    print("")
    print("[OK] Movement 5 Complete: Analysis & Telemetry")
    print(f"   Output: {args.output}")
    print("")

if __name__ == "__main__":
    main()

