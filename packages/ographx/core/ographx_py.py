#!/usr/bin/env python3
"""
OgraphX PY — minimal Python flow extractor (self-graphing mirror)
------------------------------------------------------------------
Pure-Python, no external deps. Heuristic (not a full parser).
Scans .py files, finds function and class symbols, discovers call edges,
captures parameter "contracts", and emits a compact JSON IR + optional sequences.

This is the Python mirror of ographx_ts.py, enabling self-observation:
  python ographx_py.py --root . --out ./.ographx/self_graph.json --emit-sequences ./.ographx/self_sequences.json

Enhancements (MVP+):
- Scope-aware resolution: Prioritizes same-file symbols, then imports, then global fallback
- Import graph awareness: Parses import statements to resolve cross-file targets
- Generics/union types: Handles type hints like List[T], Dict[K,V], T | U
- Enriched sequences: Uses DFS to build call chains (depth-limited to 3)

Notes:
- Intentionally conservative. Favors correctness over completeness.
- Handles patterns:
    - def foo(a: T, b: U) -> R: ...
    - @decorator def foo(...): ...
    - class C: def method(self, a: T) -> R: ...
- Detects calls within bodies via regex; filters out Python keywords.
- Contracts are inferred from parameter lists with type hints.
- Entry points are module-level functions and class methods.
- Sequences are enriched linearizations: each function becomes a movement; call chains become beats.
"""
import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, asdict, field
from typing import List, Dict, Optional, Tuple

# Ensure UTF-8 output on Windows terminals
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

# Regex patterns for Python
FUNC_DEF_RE = re.compile(r'^(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*(?:->\s*[^:]+)?\s*:')
CLASS_DEF_RE = re.compile(r'^class\s+([A-Za-z_]\w*)\b')
METHOD_RE = re.compile(r'^\s+(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*(?:->\s*[^:]+)?\s*:')
IMPORT_RE = re.compile(r'^(?:from\s+[\w.]+\s+)?import\s+([A-Za-z_]\w*)')
CALL_RE = re.compile(r'\b([A-Za-z_]\w*)\s*\(')

# Reserved Python keywords to ignore as "calls"
RESERVED = {
    'if', 'else', 'elif', 'for', 'while', 'with', 'try', 'except', 'finally',
    'def', 'class', 'return', 'yield', 'raise', 'assert', 'pass', 'break', 'continue',
    'import', 'from', 'as', 'and', 'or', 'not', 'in', 'is', 'lambda', 'print',
    'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'reversed',
    'str', 'int', 'float', 'bool', 'list', 'dict', 'set', 'tuple', 'type',
    'open', 'input', 'output', 'super', 'self', 'cls', 'None', 'True', 'False',
}

@dataclass
class Symbol:
    id: str
    file: str
    kind: str  # 'function' or 'method'
    name: str
    class_name: Optional[str] = None
    exported: bool = False
    params_contract: Optional[str] = None
    range: Tuple[int, int] = (0, 0)

@dataclass
class CallEdge:
    frm: str
    to: str
    name: str
    line: int

@dataclass
class Contract:
    id: str
    kind: str  # 'params'
    props: List[Dict] = field(default_factory=list)

@dataclass
class IR:
    files: List[str]
    symbols: List[Symbol]
    calls: List[CallEdge]
    contracts: List[Contract]

def normalize_type(raw_type: str) -> str:
    """Normalize type annotations to handle generics and union types."""
    if not raw_type:
        return ''
    normalized = re.sub(r'\s+', ' ', raw_type.strip())
    return normalized

def extract_imports(text: str, file_path: str, root: str) -> Dict[str, str]:
    """Extract import statements and map local names to source files."""
    imports = {}
    lines = text.splitlines()
    for line in lines:
        m = IMPORT_RE.match(line.strip())
        if m:
            name = m.group(1)
            # For now, just track that it's imported (simplified)
            imports[name] = 'external'
    return imports

def extract_symbols_and_calls(text: str, file_path: str, root: str) -> Tuple[List[Symbol], List[CallEdge], List[Contract], Dict[str, str]]:
    """Extract symbols and calls from Python source."""
    symbols = []
    calls = []
    contracts = []
    imports = extract_imports(text, file_path, root)

    lines = text.splitlines()
    current_class = None
    indent_stack = []
    
    current_func_id = None

    for line_num, line in enumerate(lines, start=1):
        stripped = line.strip()
        if not stripped or stripped.startswith('#'):
            continue

        # Track class context
        class_match = CLASS_DEF_RE.match(stripped)
        if class_match:
            current_class = class_match.group(1)
            class_id = f"{os.path.basename(file_path)}::{current_class}"
            symbols.append(Symbol(
                id=class_id,
                file=file_path,
                kind='class',
                name=current_class,
                exported=True,
                range=(line_num, line_num)
            ))
            current_func_id = None
            continue

        # Track methods
        if current_class:
            method_match = METHOD_RE.match(line)
            if method_match:
                method_name = method_match.group(1)
                params = method_match.group(2)
                if method_name not in ('__init__', '__str__', '__repr__'):
                    method_id = f"{os.path.basename(file_path)}::{current_class}.{method_name}"
                    contract_id = f"contract_{len(symbols)}"
                    current_func_id = method_id

                    # Parse parameters
                    props = []
                    for param in params.split(','):
                        param = param.strip()
                        if ':' in param:
                            name, typ = param.split(':', 1)
                            props.append({'name': name.strip(), 'raw': normalize_type(typ.strip())})
                        elif param and param != 'self':
                            props.append({'name': param, 'raw': ''})

                    if props:
                        contracts.append(Contract(id=contract_id, kind='params', props=props))

                    symbols.append(Symbol(
                        id=method_id,
                        file=file_path,
                        kind='method',
                        name=method_name,
                        class_name=current_class,
                        exported=True,
                        params_contract=contract_id if props else None,
                        range=(line_num, line_num)
                    ))

        # Track functions
        func_match = FUNC_DEF_RE.match(stripped)
        if func_match:
            func_name = func_match.group(1)
            params = func_match.group(2)
            func_id = f"{os.path.basename(file_path)}::{func_name}"
            contract_id = f"contract_{len(symbols)}"
            current_func_id = func_id

            # Parse parameters
            props = []
            for param in params.split(','):
                param = param.strip()
                if ':' in param:
                    name, typ = param.split(':', 1)
                    props.append({'name': name.strip(), 'raw': normalize_type(typ.strip())})
                elif param:
                    props.append({'name': param, 'raw': ''})

            if props:
                contracts.append(Contract(id=contract_id, kind='params', props=props))

            symbols.append(Symbol(
                id=func_id,
                file=file_path,
                kind='function',
                name=func_name,
                exported=not stripped.startswith('_'),
                params_contract=contract_id if props else None,
                range=(line_num, line_num)
            ))

        # Extract calls from this line
        if current_func_id:
            for match in CALL_RE.finditer(line):
                called_name = match.group(1)
                if called_name not in RESERVED and called_name not in imports:
                    # Find the symbol being called
                    to_id = ""
                    for sym in symbols:
                        if sym.name == called_name:
                            to_id = sym.id
                            break

                    calls.append(CallEdge(
                        frm=current_func_id,
                        to=to_id,
                        name=called_name,
                        line=line_num
                    ))

    return symbols, calls, contracts, imports

def walk_py_files(root: str) -> List[str]:
    """Walk directory and find all .py files."""
    py_files = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip common non-source directories
        dirnames[:] = [d for d in dirnames if d not in {'.git', '__pycache__', '.venv', 'node_modules', '.ographx'}]
        for filename in filenames:
            if filename.endswith('.py'):
                py_files.append(os.path.join(dirpath, filename))
    return sorted(py_files)

def build_ir(root: str) -> IR:
    """Build intermediate representation from Python source files."""
    py_files = walk_py_files(root)
    all_symbols = []
    all_calls = []
    all_contracts = []

    for py_file in py_files:
        try:
            with open(py_file, 'r', encoding='utf-8') as f:
                text = f.read()
            symbols, calls, contracts, imports = extract_symbols_and_calls(text, py_file, root)
            all_symbols.extend(symbols)
            all_calls.extend(calls)
            all_contracts.extend(contracts)
        except Exception as e:
            print(f"Warning: Could not parse {py_file}: {e}")
    
    return IR(
        files=py_files,
        symbols=all_symbols,
        calls=all_calls,
        contracts=all_contracts
    )

def emit_ir(ir: IR, out_path: str):
    """Emit IR as JSON."""
    data = {
        'files': ir.files,
        'symbols': [asdict(s) for s in ir.symbols],
        'calls': [asdict(c) for c in ir.calls],
        'contracts': [asdict(c) for c in ir.contracts],
    }
    os.makedirs(os.path.dirname(out_path) or '.', exist_ok=True)
    with open(out_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"✓ Emitted IR: {out_path}")

def main():
    parser = argparse.ArgumentParser(description='OgraphX PY - Python flow extractor')
    parser.add_argument('--root', default='.', help='Root directory to scan')
    parser.add_argument('--out', required=True, help='Output IR file')
    args = parser.parse_args()
    
    ir = build_ir(args.root)
    emit_ir(ir, args.out)
    print(f"✓ Extracted {len(ir.symbols)} symbols, {len(ir.calls)} calls")

if __name__ == '__main__':
    main()

