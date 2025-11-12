#!/usr/bin/env python3
"""
OgraphX TS — minimal TypeScript flow extractor (MVP+)
-----------------------------------------------------
Pure-Python, no external deps. Heuristic (not a full parser).
Scans .ts/.tsx files, finds function-like symbols, discovers call edges,
captures parameter "contracts", and emits a compact JSON IR + optional sequences.

Usage:
  python ographx_ts.py --root ./src --out ./.ographx/graph.json --emit-sequences ./.ographx/sequences.json

Enhancements (MVP+):
- Scope-aware resolution: Prioritizes same-file symbols, then imports, then global fallback
- Import graph awareness: Parses import statements to resolve cross-file targets
- Generics/union types: Handles T<U>, T<U,V>, T | U type annotations
- Enriched sequences: Uses DFS to build call chains (depth-limited to 3) instead of just direct calls

Notes:
- This is intentionally conservative. It favors correctness over completeness.
- Handles patterns:
    - function foo(a: T, b: U) { ... }
    - export function foo(...) { ... }
    - const foo = (...) => { ... }
    - const foo = function(...) { ... }
    - class C { method(a: T) { ... } }
- Detects calls within bodies via regex; filters out TS/JS keywords.
- Contracts are inferred from parameter lists as plain strings (names + raw type text when present).
- Entry points (for sequence emission) are exported functions and class methods whose class is exported.
- Sequences are enriched linearizations: each function becomes a movement; call chains become beats.
"""
import argparse
import json
import os
import re
from dataclasses import dataclass, asdict, field
from typing import List, Dict, Optional, Tuple

FUNC_DECL_RE = re.compile(r'^(?:export\s+)?function\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*{')
CONST_FUNC_RE = re.compile(r'^(?:export\s+)?const\s+([A-Za-z_]\w*)\s*=\s*(?:async\s*)?(?:function|\()')
ARROW_PARAMS_RE = re.compile(r'^(?:export\s+)?const\s+([A-Za-z_]\w*)\s*=\s*\((.*?)\)\s*=>\s*{')
NAMED_FUNC_RE = re.compile(r'^(?:export\s+)?(?:var|let|const)\s+([A-Za-z_]\w*)\s*=\s*function\s*\((.*?)\)\s*{')
CLASS_DECL_RE = re.compile(r'^(?:export\s+)?class\s+([A-Za-z_]\w*)\b')
METHOD_RE = re.compile(r'^\s*(?:public|private|protected|static|async\s+)*([A-Za-z_]\w*)\s*\((.*?)\)\s*{')
EXPORT_RE = re.compile(r'^\s*export\s+')
CALL_RE = re.compile(r'\b([A-Za-z_]\w*)\s*\(')
IMPORT_RE = re.compile(r'^\s*import\s+(?:{[^}]*}|[A-Za-z_]\w*)\s+from\s+[\'"]([^\'"]+)[\'"]')
GENERIC_RE = re.compile(r'<[^>]+>')  # Match generic type parameters
UNION_RE = re.compile(r'\s*\|\s*')  # Match union type separator

# Reserved identifiers to ignore as "calls"
RESERVED = {
    'if','for','while','switch','catch','return','typeof','new','delete','throw',
    'function','class','constructor','super','await','yield','case','of','in','instanceof',
    'setTimeout','setInterval'  # not reserved but common builtins to deprioritize
}

@dataclass
class ContractProp:
    name: str
    raw: str  # raw type text if present; else ""

@dataclass
class Contract:
    id: str
    kind: str = "params"
    props: List[ContractProp] = field(default_factory=list)

@dataclass
class Symbol:
    id: str
    file: str
    kind: str  # function|method
    name: str
    class_name: Optional[str] = None
    exported: bool = False
    params_contract: Optional[str] = None
    range: Tuple[int,int] = (0,0)

@dataclass
class CallEdge:
    frm: str
    to: str
    name: str  # called identifier
    line: int

@dataclass
class IR:
    files: List[str]
    symbols: List[Symbol]
    calls: List[CallEdge]
    contracts: List[Contract]

@dataclass
class ImportInfo:
    """Track imports from a file for scope-aware resolution."""
    file: str
    imports: Dict[str, str]  # local_name -> source_file (relative path)
    exports: List[str]  # exported symbol names from this file

def normalize_contract_id(sym_name: str, params_sig: str) -> str:
    sig = re.sub(r'\s+', ' ', params_sig.strip())
    compact = sig.replace(':', '').replace(',', '-').replace('[]','arr').replace('|','or')
    compact = re.sub(r'[^A-Za-z0-9_\-]', '', compact)[:40] or 'none'
    return f"{sym_name}Params@0.1.0::{compact}"

def normalize_type(raw_type: str) -> str:
    """Normalize type annotations to handle generics and union types."""
    if not raw_type:
        return ''
    # Preserve structure but normalize whitespace
    normalized = re.sub(r'\s+', ' ', raw_type.strip())
    # Keep generics and unions readable
    return normalized

def parse_params(params_text: str) -> List[ContractProp]:
    if params_text.strip() == '':
        return []
    props = []
    # Split by commas not inside <> or () or {}
    depth = 0
    token = ''
    for ch in params_text:
        if ch in '<({[':
            depth += 1
        elif ch in '>)}]':
            depth = max(0, depth-1)
        if ch == ',' and depth == 0:
            token = token.strip()
            if token:
                props.append(token)
            token = ''
        else:
            token += ch
    token = token.strip()
    if token:
        props.append(token)

    out: List[ContractProp] = []
    for p in props:
        # match "name: type = default" or "name?: type"
        m = re.match(r'^\s*([A-Za-z_]\w*)\s*\??\s*:\s*(.*?)(?:=\s*.*)?$', p)
        if m:
            raw_type = m.group(2).strip()
            # Normalize type (handles generics T<U>, unions T | U, etc.)
            normalized = normalize_type(raw_type)
            out.append(ContractProp(name=m.group(1), raw=normalized))
        else:
            # fallback: just a name (untyped or destructured) – keep raw
            name = p.split(':',1)[0].split('=',1)[0].strip()
            out.append(ContractProp(name=name, raw=''))
    return out

def extract_imports(text: str, file_path: str, root: str) -> Dict[str, str]:
    """Extract import statements and map local names to source files.

    Returns a dict: local_name -> relative_source_file
    """
    imports = {}
    lines = text.splitlines()
    for line in lines:
        m = IMPORT_RE.match(line.strip())
        if m:
            source = m.group(1)
            # Normalize path: remove .ts/.tsx, resolve relative to root
            if not source.startswith('.'):
                continue  # Skip node_modules imports
            # Resolve relative path
            file_dir = os.path.dirname(file_path)
            resolved = os.path.normpath(os.path.join(file_dir, source))
            # Make relative to root
            try:
                rel_path = os.path.relpath(resolved, root)
            except ValueError:
                rel_path = resolved
            # Add .ts if not present
            if not rel_path.endswith(('.ts', '.tsx')):
                rel_path += '.ts'
            # Extract imported names (simplified: just get first identifier after 'import')
            import_part = line.split('from')[0].replace('import', '').strip()
            if import_part.startswith('{'):
                # Named imports: { foo, bar }
                names = import_part.strip('{}').split(',')
                for name in names:
                    clean = name.strip().split(' as ')[-1].strip()
                    if clean:
                        imports[clean] = rel_path
            else:
                # Default import: import foo from ...
                clean = import_part.strip()
                if clean:
                    imports[clean] = rel_path
    return imports

def find_blocks(lines: List[str], start_idx: int) -> int:
    """Find matching closing brace for a block starting with '{' on or after start_idx."""
    # locate first { at/after start line
    i = start_idx
    # find first { on the same line or subsequent
    while i < len(lines) and '{' not in lines[i]:
        i += 1
    if i >= len(lines):
        return min(start_idx, len(lines)-1)
    depth = 0
    for j in range(i, len(lines)):
        depth += lines[j].count('{')
        depth -= lines[j].count('}')
        if depth == 0:
            return j
    return len(lines)-1

def extract_symbols_and_calls(path: str, text: str, root: str = "", imports: Optional[Dict[str, str]] = None) -> Tuple[List[Symbol], List[CallEdge], List[Contract]]:
    lines = text.splitlines()
    symbols: List[Symbol] = []
    calls: List[CallEdge] = []
    contracts: List[Contract] = []

    # Track imports for scope-aware resolution
    if imports is None:
        imports = extract_imports(text, path, root or os.path.dirname(path))

    exported_classes: set = set()

    # First pass: detect class declarations for export status
    for idx, line in enumerate(lines, start=1):
        mcls = CLASS_DECL_RE.match(line.strip())
        if mcls:
            cls = mcls.group(1)
            # crude export detection: look back to line start
            exported = line.strip().startswith('export')
            if exported:
                exported_classes.add(cls)

    # Second pass: functions and methods
    idx = 0
    while idx < len(lines):
        line = lines[idx]
        stripped = line.strip()

        # function foo(...) { ... }
        m = FUNC_DECL_RE.match(stripped)
        if m:
            name = m.group(1)
            params_text = m.group(2) or ""
            end = find_blocks(lines, idx)
            is_export = stripped.startswith('export')
            cprops = parse_params(params_text)
            cid = normalize_contract_id(name, params_text)
            contracts.append(Contract(id=cid, props=cprops))
            sym = Symbol(
                id=f"{os.path.basename(path)}::{name}",
                file=path, kind="function", name=name, exported=is_export,
                params_contract=cid, range=(idx+1, end+1)
            )
            symbols.append(sym)
            # scan body for calls
            for j in range(idx, end+1):
                for cm in CALL_RE.finditer(lines[j]):
                    callee = cm.group(1)
                    if callee not in RESERVED:
                        calls.append(CallEdge(frm=sym.id, to="", name=callee, line=j+1))
            idx = end + 1
            continue

        # const foo = (...) => { ... }
        m = ARROW_PARAMS_RE.match(stripped)
        if m:
            name = m.group(1)
            params_text = m.group(2) or ""
            end = find_blocks(lines, idx)
            is_export = stripped.startswith('export')
            cprops = parse_params(params_text)
            cid = normalize_contract_id(name, params_text)
            contracts.append(Contract(id=cid, props=cprops))
            sym = Symbol(
                id=f"{os.path.basename(path)}::{name}",
                file=path, kind="function", name=name, exported=is_export,
                params_contract=cid, range=(idx+1, end+1)
            )
            symbols.append(sym)
            for j in range(idx, end+1):
                for cm in CALL_RE.finditer(lines[j]):
                    callee = cm.group(1)
                    if callee not in RESERVED:
                        calls.append(CallEdge(frm=sym.id, to="", name=callee, line=j+1))
            idx = end + 1
            continue

        # const foo = function(...) { ... }
        m = NAMED_FUNC_RE.match(stripped)
        if m:
            name = m.group(1)
            params_text = m.group(2) or ""
            end = find_blocks(lines, idx)
            is_export = stripped.startswith('export')
            cprops = parse_params(params_text)
            cid = normalize_contract_id(name, params_text)
            contracts.append(Contract(id=cid, props=cprops))
            sym = Symbol(
                id=f"{os.path.basename(path)}::{name}",
                file=path, kind="function", name=name, exported=is_export,
                params_contract=cid, range=(idx+1, end+1)
            )
            symbols.append(sym)
            for j in range(idx, end+1):
                for cm in CALL_RE.finditer(lines[j]):
                    callee = cm.group(1)
                    if callee not in RESERVED:
                        calls.append(CallEdge(frm=sym.id, to="", name=callee, line=j+1))
            idx = end + 1
            continue

        # class methods
        m = CLASS_DECL_RE.match(stripped)
        if m:
            cls = m.group(1)
            end = find_blocks(lines, idx)
            # walk inside class for methods
            k = idx + 1
            while k <= end:
                mm = METHOD_RE.match(lines[k])
                if mm:
                    mname = mm.group(1)
                    params_text = mm.group(2) or ""
                    mend = find_blocks(lines, k)
                    cprops = parse_params(params_text)
                    cid = normalize_contract_id(f"{cls}.{mname}", params_text)
                    contracts.append(Contract(id=cid, props=cprops))
                    sym = Symbol(
                        id=f"{os.path.basename(path)}::{cls}.{mname}",
                        file=path, kind="method", name=mname, class_name=cls,
                        exported=(cls in exported_classes), params_contract=cid,
                        range=(k+1, mend+1)
                    )
                    symbols.append(sym)
                    for j in range(k, mend+1):
                        for cm in CALL_RE.finditer(lines[j]):
                            callee = cm.group(1)
                            if callee not in RESERVED:
                                calls.append(CallEdge(frm=sym.id, to="", name=callee, line=j+1))
                    k = mend + 1
                else:
                    k += 1
            idx = end + 1
            continue

        idx += 1

    # Resolve call "to" fields with scope-aware resolution
    # Build symbol index by file and name
    symbols_by_file: Dict[str, Dict[str, List[Symbol]]] = {}
    for s in symbols:
        file_key = os.path.basename(s.file)
        if file_key not in symbols_by_file:
            symbols_by_file[file_key] = {}
        symbols_by_file[file_key].setdefault(s.name, []).append(s)

    # Also build global name index for fallback
    name_to_ids: Dict[str, List[str]] = {}
    for s in symbols:
        name_to_ids.setdefault(s.name, []).append(s.id)

    resolved_calls: List[CallEdge] = []
    for c in calls:
        to_id = ""
        # Try to resolve within same file first (scope-aware)
        caller_file = os.path.basename(path)
        if caller_file in symbols_by_file and c.name in symbols_by_file[caller_file]:
            candidates = symbols_by_file[caller_file][c.name]
            to_id = candidates[0].id
        # Try imports (cross-file resolution)
        elif c.name in imports:
            imported_file = imports[c.name]
            imported_basename = os.path.basename(imported_file)
            if imported_basename in symbols_by_file and c.name in symbols_by_file[imported_basename]:
                candidates = symbols_by_file[imported_basename][c.name]
                to_id = candidates[0].id
        # Fallback to global name resolution
        else:
            cand = name_to_ids.get(c.name, [])
            to_id = cand[0] if cand else ""

        resolved_calls.append(CallEdge(frm=c.frm, to=to_id, name=c.name, line=c.line))

    # Deduplicate contracts by id
    uniq_contracts: Dict[str, Contract] = {}
    for ct in contracts:
        if ct.id not in uniq_contracts:
            uniq_contracts[ct.id] = ct

    return symbols, resolved_calls, list(uniq_contracts.values())

def walk_ts_files(root: str) -> List[str]:
    files = []
    for dirpath, _, filenames in os.walk(root):
        for fn in filenames:
            if fn.endswith(('.ts', '.tsx')) and not fn.endswith('.d.ts'):
                files.append(os.path.join(dirpath, fn))
    return files

def build_ir(root: str) -> IR:
    files = walk_ts_files(root)
    symbols: List[Symbol] = []
    calls: List[CallEdge] = []
    contracts: List[Contract] = []

    for f in files:
        try:
            with open(f, 'r', encoding='utf-8', errors='ignore') as fh:
                text = fh.read()
            syms, cs, cts = extract_symbols_and_calls(f, text, root=root)
            symbols.extend(syms)
            calls.extend(cs)
            contracts.extend(cts)
        except Exception as e:
            # keep going; log minimal context
            print(f"[WARN] failed to parse {f}: {e}")

    # finalize IR
    return IR(files=files, symbols=symbols, calls=calls, contracts=contracts)

def emit_ir(ir: IR, out_path: str):
    def enc(o):
        if isinstance(o, (Symbol, CallEdge, Contract, ContractProp)):
            d = asdict(o)
            return d
        raise TypeError(type(o).__name__)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump({
            "files": ir.files,
            "symbols": [asdict(s) for s in ir.symbols],
            "calls": [asdict(c) for c in ir.calls],
            "contracts": [{
                "id": ct.id,
                "kind": ct.kind,
                "props": [asdict(p) for p in ct.props]
            } for ct in ir.contracts]
        }, f, indent=2)

def build_call_graph(ir: IR) -> Dict[str, List[CallEdge]]:
    """Build a call graph indexed by source symbol."""
    by_src: Dict[str, List[CallEdge]] = {}
    for c in ir.calls:
        by_src.setdefault(c.frm, []).append(c)
    return by_src

def dfs_call_chain(start_id: str, call_graph: Dict[str, List[CallEdge]],
                   visited: Optional[set] = None, depth: int = 0, max_depth: int = 3) -> List[CallEdge]:
    """Perform DFS to build enriched call chain from an entry point.

    Returns a list of CallEdge objects representing the call chain.
    Limits depth to avoid infinite recursion and keep sequences manageable.
    """
    if visited is None:
        visited = set()

    if depth > max_depth or start_id in visited:
        return []

    visited.add(start_id)
    chain = []

    for call in call_graph.get(start_id, []):
        chain.append(call)
        # Recursively add calls from the target
        if call.to:
            chain.extend(dfs_call_chain(call.to, call_graph, visited, depth + 1, max_depth))

    return chain

def emit_sequences(ir: IR, out_path: str, enrich_with_dfs: bool = True):
    # Build sequence bundle: each exported symbol becomes an entry sequence.
    # Beats are enriched with DFS call chains (if enabled) or just direct calls.
    sequences = []
    call_graph = build_call_graph(ir)

    for s in ir.symbols:
        if not s.exported:
            continue

        beats = []

        if enrich_with_dfs:
            # Use DFS to build enriched call chain
            call_chain = dfs_call_chain(s.id, call_graph, max_depth=3)
        else:
            # Use only direct calls
            call_chain = call_graph.get(s.id, [])

        # Deduplicate calls while preserving order
        seen = set()
        unique_calls = []
        for c in call_chain:
            key = (c.frm, c.name, c.line)
            if key not in seen:
                seen.add(key)
                unique_calls.append(c)

        for i, c in enumerate(unique_calls, start=1):
            beats.append({
                "beat": i,
                "event": f"call:{c.name}",
                "handler": c.name,
                "timing": "immediate",
                "dynamics": "mf",
                "in": [s.params_contract] if s.params_contract else []
            })

        sequences.append({
            "id": re.sub(r'[^A-Za-z0-9_\-\.]', '_', s.id),
            "name": f"{s.name} Flow",
            "category": "analysis",
            "key": "C Major",
            "tempo": 100,
            "movements": [{
                "id": "calls",
                "beats": beats or [{
                    "beat": 1, "event": "noop", "handler": "noop",
                    "timing": "immediate", "dynamics": "pp"
                }]
            }]
        })

    bundle = {
        "version": "0.1.0",
        "contracts": [{
            "id": ct.id,
            "kind": ct.kind,
            "props": [{"name": p.name, "raw": p.raw} for p in ct.props]
        } for ct in ir.contracts],
        "sequences": sequences
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(bundle, f, indent=2)

def main():
    ap = argparse.ArgumentParser(description="OgraphX TypeScript flow extractor (MVP).")
    ap.add_argument("--root", required=True, help="Root directory of the TS codebase")
    ap.add_argument("--out", required=True, help="Path to write IR graph JSON")
    ap.add_argument("--emit-sequences", help="Optional: write a naive sequences bundle JSON")
    args = ap.parse_args()

    ir = build_ir(args.root)
    emit_ir(ir, args.out)
    if args.emit_sequences:
        emit_sequences(ir, args.emit_sequences)
    print(f"[OK] IR written to {args.out}")
    if args.emit_sequences:
        print(f"[OK] Sequences written to {args.emit_sequences}")

if __name__ == "__main__":
    main()
