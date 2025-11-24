#!/usr/bin/env python
"""
Context Integrity & Drift Prevention Tool
=========================================

Senior-level orchestration for JSON source-of-truth governance.
Provides uniform CRUD + integrity operations for managed JSON artifacts
(e.g., orchestration-domains.json, context tree files) without manual edits.

Key Goals:
- Single authoritative write pathway (prevent ad-hoc mutation)
- Hash-based integrity tracking (SHA256 + size + domain count metrics)
- Schema validation (optional jsonschema if installed; graceful fallback)
- Deterministic formatting (stable key ordering)
- JSON Pointer style path mutation (RFC 6901 subset)
- Diff visibility (line + structural summary)
- Lock annotation embedding (integrity metadata section)
- Audit trail (appends to .generated/context-integrity-log.json)

Pipeline Placement:
Add to pre:manifests (before docs generation) to re-lock artifacts and
emit diff report if anything changed outside sanctioned generators.

CLI Subcommands:
  list                List managed JSON artifacts
  show <name>         Print sanitized content (or selected path)
  hash <name>         Compute integrity hash & metrics
  diff <name>         Diff working file vs stored hash snapshot
  set <name> <ptr> <value-json>   Set a value via JSON Pointer
  add <name> <ptr> <value-json>   Insert into array/object
  remove <name> <ptr>             Remove value at pointer
  validate <name>     Run schema validation if available
  lock <name>         Embed integrity metadata (hash, timestamp) in file
  unlock <name>       Remove integrity metadata section
  snapshot <name>     Write current hash snapshot file
  audit               Summarize drift across all managed artifacts

JSON Pointer (subset): /a/b/0 -> root['a']['b'][0]
Escape sequences: ~0 => ~, ~1 => /

Managed registry file (auto-created if missing):
  .generated/context-managed.json
Structure:
{
  "artifacts": {
    "orchestration-domains": {
      "file": "orchestration-domains.json",
      "kind": "registry",
      "primaryKey": "domains",
      "lockField": "integrity"
    },
    "context-tree": {
      "file": ".generated/context-tree-orchestration-audit-session.json",
      "kind": "context",
      "lockField": "integrity"
    },
    "context-index": {
      "file": ".generated/CONTEXT_TREE_INDEX.json",
      "kind": "index",
      "lockField": "integrity"
    }
  }
}

Lock Field Format (embedded):
"integrity": {
  "hash": "<sha256>",
  "size": 12345,
  "generatedAt": "ISO timestamp",
  "domains": 59,
  "schemaValidated": true|false,
  "toolVersion": "1.0.0"
}

NOTE: Avoid editing large JSON manually; use this tool for deterministic mutation.
"""
from __future__ import annotations
import argparse
import json
import hashlib
import os
import sys
import datetime
from typing import Any, Dict, Tuple

TOOL_VERSION = "1.0.0"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MANAGED_REGISTRY = os.path.join(ROOT, '.generated', 'context-managed.json')
AUDIT_LOG = os.path.join(ROOT, '.generated', 'context-integrity-log.json')

# Attempt optional jsonschema
try:
    import jsonschema  # type: ignore
    HAS_JSONSCHEMA = True
except Exception:
    HAS_JSONSCHEMA = False

DEFAULT_REGISTRY = {
    "artifacts": {
        "orchestration-domains": {
            "file": "orchestration-domains.json",
            "kind": "registry",
            "primaryKey": "domains",
            "lockField": "integrity"
        },
        "context-tree": {
            "file": ".generated/context-tree-orchestration-audit-session.json",
            "kind": "context",
            "lockField": "integrity"
        },
        "context-index": {
            "file": ".generated/CONTEXT_TREE_INDEX.json",
            "kind": "index",
            "lockField": "integrity"
        }
    }
}

SCHEMAS: Dict[str, Dict[str, Any]] = {
    # Minimal placeholder schemas; expand as needed
    "orchestration-domains": {
        "type": "object",
        "required": ["domains"],
        "properties": {
            "domains": {"type": "array"},
            "metadata": {"type": "object"}
        }
    }
}


def ensure_registry() -> Dict[str, Any]:
    os.makedirs(os.path.dirname(MANAGED_REGISTRY), exist_ok=True)
    if not os.path.exists(MANAGED_REGISTRY):
        with open(MANAGED_REGISTRY, 'w', encoding='utf-8') as f:
            json.dump(DEFAULT_REGISTRY, f, indent=2)
    with open(MANAGED_REGISTRY, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_artifact(reg: Dict[str, Any], name: str) -> Tuple[str, Dict[str, Any]]:
    if name not in reg['artifacts']:
        raise SystemExit(f"Unknown artifact name '{name}'")
    rel = reg['artifacts'][name]['file']
    path = os.path.join(ROOT, rel)
    if not os.path.exists(path):
        raise SystemExit(f"Artifact file not found: {path}")
    with open(path, 'r', encoding='utf-8') as f:
        return path, json.load(f)


def compute_hash(data: Any) -> Tuple[str, int]:
    serialized = json.dumps(data, sort_keys=True, separators=(',', ':')).encode('utf-8')
    return hashlib.sha256(serialized).hexdigest(), len(serialized)


def pointer_tokens(ptr: str) -> list[str]:
    if not ptr or ptr == '/':
        return []
    if not ptr.startswith('/'):
        raise ValueError("JSON Pointer must start with '/'")
    tokens = ptr.split('/')[1:]
    return [t.replace('~1', '/').replace('~0', '~') for t in tokens]


def resolve_pointer(doc: Any, ptr: str) -> Any:
    cur = doc
    for tok in pointer_tokens(ptr):
        if isinstance(cur, list):
            idx = int(tok)
            cur = cur[idx]
        elif isinstance(cur, dict):
            cur = cur[tok]
        else:
            raise KeyError(f"Cannot descend into non-container at token '{tok}'")
    return cur


def set_pointer(doc: Any, ptr: str, value: Any) -> None:
    tokens = pointer_tokens(ptr)
    if not tokens:
        raise ValueError("Refusing to overwrite root; use add/remove operations specifically")
    cur = doc
    for i, tok in enumerate(tokens[:-1]):
        if isinstance(cur, list):
            cur = cur[int(tok)]
        else:
            if tok not in cur:
                cur[tok] = {}
            cur = cur[tok]
    last = tokens[-1]
    if isinstance(cur, list):
        cur[int(last)] = value
    else:
        cur[last] = value


def add_pointer(doc: Any, ptr: str, value: Any) -> None:
    tokens = pointer_tokens(ptr)
    if not tokens:
        raise ValueError("Add requires non-root pointer")
    cur = doc
    for i, tok in enumerate(tokens[:-1]):
        if isinstance(cur, list):
            cur = cur[int(tok)]
        else:
            if tok not in cur:
                cur[tok] = {}
            cur = cur[tok]
    last = tokens[-1]
    if isinstance(cur, list):
        if last == '-':
            cur.append(value)
        else:
            cur.insert(int(last), value)
    else:
        if last in cur:
            raise KeyError(f"Key '{last}' already exists; use set instead")
        cur[last] = value


def remove_pointer(doc: Any, ptr: str) -> None:
    tokens = pointer_tokens(ptr)
    if not tokens:
        raise ValueError("Remove requires non-root pointer")
    cur = doc
    for tok in tokens[:-1]:
        if isinstance(cur, list):
            cur = cur[int(tok)]
        else:
            cur = cur[tok]
    last = tokens[-1]
    if isinstance(cur, list):
        del cur[int(last)]
    else:
        del cur[last]


def write_artifact(path: str, data: Any) -> None:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        f.write('\n')


def log_event(action: str, name: str, details: Dict[str, Any]):
    entry = {
        'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
        'toolVersion': TOOL_VERSION,
        'action': action,
        'artifact': name,
        'details': details
    }
    existing = []
    if os.path.exists(AUDIT_LOG):
        try:
            with open(AUDIT_LOG, 'r', encoding='utf-8') as f:
                existing = json.load(f)
        except Exception:
            existing = []
    existing.append(entry)
    with open(AUDIT_LOG, 'w', encoding='utf-8') as f:
        json.dump(existing, f, indent=2)


def validate_schema(name: str, data: Any) -> bool:
    if not HAS_JSONSCHEMA:
        return False
    if name not in SCHEMAS:
        return False
    jsonschema.validate(instance=data, schema=SCHEMAS[name])
    return True


def embed_integrity(name: str, data: Dict[str, Any], hash_val: str, size: int, schema_ok: bool):
    # domain count heuristic
    domains = None
    if 'domains' in data and isinstance(data['domains'], list):
        domains = len(data['domains'])
    integrity_block = {
        'hash': hash_val,
        'size': size,
        'generatedAt': datetime.datetime.utcnow().isoformat() + 'Z',
        'domains': domains,
        'schemaValidated': schema_ok,
        'toolVersion': TOOL_VERSION
    }
    data['integrity'] = integrity_block


def command_list(reg):
    print("Managed artifacts:\n")
    for k, v in reg['artifacts'].items():
        print(f"- {k}: {v['file']} ({v['kind']})")


def command_show(reg, name: str, ptr: str|None):
    path, data = load_artifact(reg, name)
    if ptr:
        try:
            value = resolve_pointer(data, ptr)
        except Exception as e:
            raise SystemExit(f"Pointer error: {e}")
        print(json.dumps(value, indent=2))
    else:
        print(json.dumps(data, indent=2))


def command_hash(reg, name: str):
    path, data = load_artifact(reg, name)
    h, size = compute_hash(data)
    meta = {
        'hash': h,
        'size': size,
        'path': path
    }
    if 'domains' in data and isinstance(data['domains'], list):
        meta['domains'] = len(data['domains'])
    print(json.dumps(meta, indent=2))


def command_diff(reg, name: str):
    path, data = load_artifact(reg, name)
    # Compare against last integrity hash if present
    prior = data.get('integrity', {}).get('hash')
    current_hash, size = compute_hash(data)
    if prior == current_hash:
        print("No drift detected (hash match).")
        return
    print("Drift detected or integrity missing.")
    print(json.dumps({'previous': prior, 'current': current_hash, 'size': size}, indent=2))


def command_set(reg, name: str, ptr: str, value: str):
    path, data = load_artifact(reg, name)
    parsed = json.loads(value)
    set_pointer(data, ptr, parsed)
    write_artifact(path, data)
    log_event('set', name, {'pointer': ptr})
    print("Updated.")


def command_add(reg, name: str, ptr: str, value: str):
    path, data = load_artifact(reg, name)
    parsed = json.loads(value)
    add_pointer(data, ptr, parsed)
    write_artifact(path, data)
    log_event('add', name, {'pointer': ptr})
    print("Added.")


def command_remove(reg, name: str, ptr: str):
    path, data = load_artifact(reg, name)
    remove_pointer(data, ptr)
    write_artifact(path, data)
    log_event('remove', name, {'pointer': ptr})
    print("Removed.")


def command_validate(reg, name: str):
    path, data = load_artifact(reg, name)
    try:
        ok = validate_schema(name, data)
    except Exception as e:
        raise SystemExit(f"Schema validation failed: {e}")
    print(json.dumps({'schemaValidated': ok, 'hasJsonSchema': HAS_JSONSCHEMA}, indent=2))


def command_lock(reg, name: str):
    path, data = load_artifact(reg, name)
    h, size = compute_hash(data)
    schema_ok = False
    try:
        schema_ok = validate_schema(name, data)
    except Exception:
        schema_ok = False
    embed_integrity(name, data, h, size, schema_ok)
    write_artifact(path, data)
    log_event('lock', name, {'hash': h})
    print("Locked with integrity block.")


def command_unlock(reg, name: str):
    path, data = load_artifact(reg, name)
    if 'integrity' in data:
        del data['integrity']
        write_artifact(path, data)
        log_event('unlock', name, {})
        print("Integrity block removed.")
    else:
        print("No integrity block present.")


def command_snapshot(reg, name: str):
    path, data = load_artifact(reg, name)
    h, size = compute_hash(data)
    snap_file = path + '.hash.json'
    with open(snap_file, 'w', encoding='utf-8') as f:
        json.dump({'hash': h, 'size': size, 'timestamp': datetime.datetime.utcnow().isoformat() + 'Z'}, f, indent=2)
    log_event('snapshot', name, {'hash': h})
    print(f"Snapshot written: {snap_file}")


def command_audit(reg):
    summary = {}
    for name in reg['artifacts']:
        try:
            path, data = load_artifact(reg, name)
            h, size = compute_hash(data)
            prior = data.get('integrity', {}).get('hash')
            drift = prior != h
            summary[name] = {
                'file': path,
                'currentHash': h,
                'lockedHash': prior,
                'drift': drift,
                'size': size
            }
            if 'domains' in data and isinstance(data['domains'], list):
                summary[name]['domains'] = len(data['domains'])
        except Exception as e:
            summary[name] = {'error': str(e)}
    print(json.dumps(summary, indent=2))


def build_parser():
    p = argparse.ArgumentParser(description='Context Integrity & Drift Prevention Tool')
    sub = p.add_subparsers(dest='cmd')

    sub.add_parser('list')
    sh = sub.add_parser('show')
    sh.add_argument('name')
    sh.add_argument('--pointer')

    hs = sub.add_parser('hash')
    hs.add_argument('name')

    df = sub.add_parser('diff')
    df.add_argument('name')

    st = sub.add_parser('set')
    st.add_argument('name'); st.add_argument('pointer'); st.add_argument('value')

    ad = sub.add_parser('add')
    ad.add_argument('name'); ad.add_argument('pointer'); ad.add_argument('value')

    rm = sub.add_parser('remove')
    rm.add_argument('name'); rm.add_argument('pointer')

    vl = sub.add_parser('validate')
    vl.add_argument('name')

    lk = sub.add_parser('lock'); lk.add_argument('name')
    ul = sub.add_parser('unlock'); ul.add_argument('name')
    sn = sub.add_parser('snapshot'); sn.add_argument('name')
    au = sub.add_parser('audit')

    return p


def main(argv=None):
    reg = ensure_registry()
    parser = build_parser()
    args = parser.parse_args(argv)
    if not args.cmd:
        parser.print_help(); return

    try:
        if args.cmd == 'list':
            command_list(reg)
        elif args.cmd == 'show':
            command_show(reg, args.name, args.pointer)
        elif args.cmd == 'hash':
            command_hash(reg, args.name)
        elif args.cmd == 'diff':
            command_diff(reg, args.name)
        elif args.cmd == 'set':
            command_set(reg, args.name, args.pointer, args.value)
        elif args.cmd == 'add':
            command_add(reg, args.name, args.pointer, args.value)
        elif args.cmd == 'remove':
            command_remove(reg, args.name, args.pointer)
        elif args.cmd == 'validate':
            command_validate(reg, args.name)
        elif args.cmd == 'lock':
            command_lock(reg, args.name)
        elif args.cmd == 'unlock':
            command_unlock(reg, args.name)
        elif args.cmd == 'snapshot':
            command_snapshot(reg, args.name)
        elif args.cmd == 'audit':
            command_audit(reg)
        else:
            raise SystemExit(f"Unknown command {args.cmd}")
    except SystemExit:
        raise
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
