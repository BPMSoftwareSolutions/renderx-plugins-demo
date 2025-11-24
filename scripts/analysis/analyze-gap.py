#!/usr/bin/env python3
import sys
import json
import re
from datetime import datetime

log_file = sys.argv[1] if len(sys.argv) > 1 else ".logs/localhost-1763233859151.log"

lines = []
try:
    with open(log_file, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
except Exception as e:
    print(f"Error reading file: {e}")
    sys.exit(1)

# Find the library drop routing
drop_line_idx = None
for i, line in enumerate(lines):
    if "Routing 'library.component.drop.requested'" in line:
        drop_line_idx = i
        break

if drop_line_idx is None:
    print("library.component.drop.requested not found")
    sys.exit(1)

print(f"Found library drop routing at line {drop_line_idx}")
print(f"Content: {lines[drop_line_idx][:200]}")

# Extract timestamp
drop_match = re.search(r'(\d{4}-\d{2}-\d{2}T[\d:\.Z]+)', lines[drop_line_idx])
if not drop_match:
    print("Could not extract timestamp from drop line")
    sys.exit(1)

drop_time_str = drop_match.group(1)
print(f"\nDrop time: {drop_time_str}")

# Find the deselect-all play
deselect_line_idx = None
for i in range(drop_line_idx, len(lines)):
    if "CanvasComponentDeselectionPlugin" in lines[i] and "canvas-component-deselect-all" in lines[i]:
        deselect_line_idx = i
        break

if deselect_line_idx is None:
    print("\nDeselect-all play not found after drop")
    sys.exit(1)

print(f"\nFound deselect-all at line {deselect_line_idx}")
deselect_match = re.search(r'(\d{4}-\d{2}-\d{2}T[\d:\.Z]+)', lines[deselect_line_idx])
if deselect_match:
    deselect_time_str = deselect_match.group(1)
    print(f"Deselect time: {deselect_time_str}")

# Print all lines between drop and deselect
print(f"\n\n=== LINES BETWEEN DROP ({drop_line_idx}) AND DESELECT ({deselect_line_idx}) ===\n")
for i in range(drop_line_idx, min(deselect_line_idx + 1, len(lines))):
    # Extract just the log message, removing timestamp
    msg = lines[i]
    print(f"{i}: {msg.rstrip()}")

print(f"\n\nTotal lines between: {deselect_line_idx - drop_line_idx}")
