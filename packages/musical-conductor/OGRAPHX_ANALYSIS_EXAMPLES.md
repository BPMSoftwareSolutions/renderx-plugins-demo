# OgraphX Analysis Examples

## Example 1: Find All Entry Points

**Goal:** Identify all exported functions that can be called from outside the module.

```python
import json

data = json.load(open('.ographx/graph.json'))

# Filter for exported symbols
entry_points = [s for s in data['symbols'] if s['exported']]

print(f"Found {len(entry_points)} entry points:\n")
for symbol in entry_points[:20]:
    print(f"  {symbol['name']} ({symbol['kind']})")
    if symbol['params_contract']:
        contract = next((c for c in data['contracts'] 
                        if c['id'] == symbol['params_contract']), None)
        if contract and contract['props']:
            for prop in contract['props']:
                print(f"    - {prop['name']}: {prop['raw']}")
```

## Example 2: Trace Call Chain

**Goal:** Find all functions called by a specific function.

```python
import json

def trace_calls(symbol_id, depth=0, visited=None):
    if visited is None:
        visited = set()
    if symbol_id in visited or depth > 3:
        return
    visited.add(symbol_id)
    
    data = json.load(open('.ographx/graph.json'))
    calls = [c for c in data['calls'] if c['frm'] == symbol_id]
    
    indent = "  " * depth
    for call in calls:
        print(f"{indent}→ {call['name']} (line {call['line']})")
        if call['to']:
            trace_calls(call['to'], depth + 1, visited)

# Trace from a specific function
trace_calls("DomainEventSystem.ts::DomainEventSystem.emit")
```

## Example 3: Find Unused Exports

**Goal:** Identify exported functions that are never called internally.

```python
import json

data = json.load(open('.ographx/graph.json'))

# Get all exported symbols
exported = {s['id']: s for s in data['symbols'] if s['exported']}

# Get all called symbols
called = set(c['to'] for c in data['calls'] if c['to'])

# Find unused
unused = [s for sid, s in exported.items() if sid not in called]

print(f"Potentially unused exports ({len(unused)}):\n")
for symbol in unused[:10]:
    print(f"  {symbol['name']} in {symbol['file']}")
```

## Example 4: Analyze Parameter Types

**Goal:** Extract and summarize all parameter types used in the codebase.

```python
import json
from collections import Counter

data = json.load(open('.ographx/graph.json'))

# Collect all parameter types
types = []
for contract in data['contracts']:
    for prop in contract['props']:
        if prop['raw']:
            types.append(prop['raw'])

# Count occurrences
type_counts = Counter(types)

print("Most common parameter types:\n")
for type_name, count in type_counts.most_common(15):
    print(f"  {type_name}: {count} occurrences")
```

## Example 5: Find Circular Dependencies

**Goal:** Detect if function A calls B and B calls A.

```python
import json

def find_circular_deps():
    data = json.load(open('.ographx/graph.json'))
    
    # Build adjacency list
    graph = {}
    for call in data['calls']:
        if call['to']:
            if call['frm'] not in graph:
                graph[call['frm']] = []
            graph[call['frm']].append(call['to'])
    
    # Find cycles
    cycles = []
    for node in graph:
        visited = set()
        stack = [node]
        while stack:
            current = stack.pop()
            if current in visited:
                if current == node:
                    cycles.append(node)
                continue
            visited.add(current)
            for neighbor in graph.get(current, []):
                stack.append(neighbor)
    
    print(f"Found {len(set(cycles))} nodes in cycles")
    for node in set(cycles)[:10]:
        print(f"  {node}")

find_circular_deps()
```

## Example 6: Generate Call Statistics

**Goal:** Analyze call patterns and statistics.

```python
import json
from collections import defaultdict

data = json.load(open('.ographx/graph.json'))

# Statistics
stats = {
    'total_symbols': len(data['symbols']),
    'exported_symbols': len([s for s in data['symbols'] if s['exported']]),
    'total_calls': len(data['calls']),
    'total_contracts': len(data['contracts']),
}

# Call frequency
call_freq = defaultdict(int)
for call in data['calls']:
    call_freq[call['name']] += 1

print("=== Call Statistics ===\n")
print(f"Total Symbols: {stats['total_symbols']}")
print(f"Exported: {stats['exported_symbols']}")
print(f"Total Calls: {stats['total_calls']}")
print(f"Total Contracts: {stats['total_contracts']}")

print("\nMost Called Functions:\n")
for func, count in sorted(call_freq.items(), key=lambda x: -x[1])[:10]:
    print(f"  {func}: {count} calls")
```

## Example 7: Export Sequences for Visualization

**Goal:** Filter sequences for specific functions and export for visualization.

```python
import json

data = json.load(open('.ographx/sequences.json'))

# Find sequences for specific class
target_class = "DomainEventSystem"
filtered = [s for s in data['sequences'] 
            if target_class in s['id']]

print(f"Found {len(filtered)} sequences for {target_class}:\n")
for seq in filtered[:5]:
    print(f"  {seq['name']}")
    print(f"    Movements: {len(seq['movements'])}")
    for mov in seq['movements']:
        print(f"      - {mov['id']}: {len(mov['beats'])} beats")

# Export filtered sequences
output = {
    'version': data['version'],
    'contracts': data['contracts'],
    'sequences': filtered
}

with open(f'.ographx/sequences_{target_class}.json', 'w') as f:
    json.dump(output, f, indent=2)
```

## Example 8: Validate Contract Consistency

**Goal:** Check if all calls match their function's contract.

```python
import json

data = json.load(open('.ographx/graph.json'))

# Build symbol lookup
symbols = {s['id']: s for s in data['symbols']}
contracts = {c['id']: c for c in data['contracts']}

# Check consistency
issues = []
for call in data['calls']:
    if call['to'] and call['to'] in symbols:
        target = symbols[call['to']]
        if target['params_contract']:
            contract = contracts.get(target['params_contract'])
            if contract and not contract['props']:
                # Function expects no params but is being called
                issues.append({
                    'type': 'param_mismatch',
                    'call': call['name'],
                    'line': call['line']
                })

print(f"Found {len(issues)} potential issues:\n")
for issue in issues[:10]:
    print(f"  {issue['type']}: {issue['call']} at line {issue['line']}")
```

## Running These Examples

Save any example as a `.py` file and run:

```bash
cd packages/musical-conductor
python example_script.py
```

Or run inline:

```bash
python -c "
import json
data = json.load(open('.ographx/graph.json'))
print(f'Total symbols: {len(data[\"symbols\"])}')
"
```

## Tips

1. **Always check if 'to' field exists** - Some calls may not resolve to local symbols
2. **Use visited sets** - Prevent infinite loops when traversing graphs
3. **Filter by file** - Analyze specific modules by filtering on `symbol['file']`
4. **Combine queries** - Chain multiple filters for complex analysis
5. **Export results** - Save filtered data for further processing

## Integration Ideas

- Feed sequences into Conductor playground
- Generate architecture diagrams from call graph
- Create dependency reports for documentation
- Validate against architectural rules
- Track metrics over time with git history

