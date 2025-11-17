#!/usr/bin/env python3
"""
OgraphX Architecture Analyzer (MVP)
-----------------------------------
Reads an IR graph JSON (from ographx_ts.py) and computes:
- Coupling metrics
- Anti-pattern heuristics
- Connascence signals
Emits a JSON report and console summary.
"""
import argparse
import json
from collections import defaultdict, Counter

def load_ir(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def build_graph(ir):
    nodes = [s['id'] for s in ir.get('symbols', [])]
    idx = {n:i for i,n in enumerate(nodes)}
    out_edges = [[] for _ in nodes]
    in_edges = [[] for _ in nodes]
    call_names = defaultdict(list)

    for c in ir.get('calls', []):
        frm = c['frm']
        to = c.get('to') or None
        if frm not in idx:
            continue
        fi = idx[frm]
        call_names[frm].append(c.get('name'))
        if to and to in idx:
            ti = idx[to]
            out_edges[fi].append(ti)
            in_edges[ti].append(fi)

    return nodes, idx, out_edges, in_edges, call_names

def tarjan_scc(out_edges):
    n = len(out_edges)
    index = 0
    stack = []
    onstack = [False]*n
    indices = [-1]*n
    low = [0]*n
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

def compute_coupling(nodes, out_edges, in_edges):
    Ca = [len(in_edges[i]) for i in range(len(nodes))]
    Ce = [len(out_edges[i]) for i in range(len(nodes))]
    I  = []
    for i in range(len(nodes)):
        denom = Ca[i] + Ce[i]
        I.append((Ce[i] / denom) if denom else 0.0)
    return Ca, Ce, I

def detect_god_functions(nodes, call_names, threshold_calls=10, threshold_unique=8):
    suspects = []
    for n in nodes:
        total_calls = len(call_names.get(n, []))
        uniq_calls = len(set(call_names.get(n, [])))
        if total_calls >= threshold_calls and uniq_calls >= threshold_unique:
            suspects.append({
                "symbol": n,
                "total_calls": total_calls,
                "unique_called": uniq_calls
            })
    return suspects

def detect_long_parameter_list(ir, threshold_params=6):
    suspects = []
    contracts = {c['id']: c for c in ir.get('contracts', [])}
    for s in ir.get('symbols', []):
        pc = s.get('params_contract')
        if pc and pc in contracts:
            props = contracts[pc].get('props', [])
            if len(props) >= threshold_params:
                suspects.append({
                    "symbol": s['id'],
                    "param_count": len(props),
                    "contract": pc
                })
    return suspects

def detect_shotgun_surgery(nodes, in_edges, threshold=8):
    suspects = []
    for i, n in enumerate(nodes):
        fan_in = len(in_edges[i])
        if fan_in >= threshold:
            suspects.append({
                "symbol": n,
                "fan_in": fan_in
            })
    return suspects

def detect_cycles(nodes, out_edges):
    sccs = tarjan_scc(out_edges)
    cyc = []
    for comp in sccs:
        if len(comp) > 1:
            cyc.append({
                "members": [nodes[i] for i in comp],
                "size": len(comp)
            })
    return cyc

def connascence_signals(ir, nodes, call_names, in_edges):
    signals = {"name": [], "value": [], "position": [], "algorithm": [], "timing": []}

    # Name connascence
    all_calls = []
    for _, names in call_names.items():
        all_calls.extend(names)
    counts = Counter(all_calls)
    for name, cnt in counts.items():
        if cnt >= 12:
            signals["name"].append({"identifier": name, "count": cnt})

    # Value connascence
    for c in ir.get('contracts', []):
        for p in c.get('props', []):
            raw = (p.get('raw') or "").strip()
            if raw.startswith("'") or raw.startswith('"') or raw.isdigit():
                signals["value"].append({
                    "contract": c['id'],
                    "prop": p.get('name'),
                    "raw": raw
                })
                break

    # Position connascence
    for item in detect_long_parameter_list(ir, threshold_params=6):
        signals["position"].append({
            "symbol": item["symbol"],
            "param_count": item["param_count"],
            "contract": item["contract"]
        })

    # Algorithm connascence
    for i, n in enumerate(nodes):
        fan_in = len(in_edges[i])
        if fan_in >= 10:
            signals["algorithm"].append({
                "symbol": n,
                "fan_in": fan_in
            })

    # Timing connascence (if timeout APIs appear)
    for frm, names in call_names.items():
        if any(x in ('setTimeout','setInterval') for x in names):
            signals["timing"].append({"symbol": frm})

    return signals

def main():
    ap = argparse.ArgumentParser(description="OgraphX Architecture Analyzer (MVP)")
    ap.add_argument("--ir", required=True, help="Path to IR graph JSON")
    ap.add_argument("--out", required=True, help="Path to write analyzer JSON report")
    args = ap.parse_args()

    ir = load_ir(args.ir)
    nodes, idx, out_edges, in_edges, call_names = build_graph(ir)
    Ca, Ce, I = compute_coupling(nodes, out_edges, in_edges)

    report = {
        "summary": {
            "symbols": len(nodes),
            "calls": sum(len(v) for v in call_names.values())
        },
        "coupling": { n: m for n, m in zip(nodes, [
            {"afferent": Ca[i], "efferent": Ce[i], "instability": round(I[i],3)}
            for i in range(len(nodes))
        ])},
        "anti_patterns": {
            "god_functions": detect_god_functions(nodes, call_names),
            "long_parameter_list": detect_long_parameter_list(ir),
            "shotgun_surgery_risk": detect_shotgun_surgery(nodes, in_edges),
            "cycles": detect_cycles(nodes, out_edges)
        },
        "connascence": connascence_signals(ir, nodes, call_names, in_edges)
    }

    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    print("# OgraphX Analyzer Report")
    print(f"Symbols: {len(nodes)}  Calls: {report['summary']['calls']}")
    print(f"Cycles: {len(report['anti_patterns']['cycles'])}")

if __name__ == "__main__":
    main()
