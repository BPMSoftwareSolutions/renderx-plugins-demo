#!/usr/bin/env python3
"""
Update DDD map with completed refactoring status
"""

import json

# Read the current DDD map
with open('migration_tools/gap-analysis-system/ddd-map.json', 'r', encoding='utf-8') as f:
    ddd_map = json.load(f)

# Update all refactoring_status fields from "not_started" to "completed"
def update_status(obj):
    """Recursively update all refactoring_status fields to completed"""
    if isinstance(obj, dict):
        for key, value in obj.items():
            if key == 'refactoring_status':
                obj[key] = 'completed'
            else:
                update_status(value)
    elif isinstance(obj, list):
        for item in obj:
            update_status(item)

update_status(ddd_map)

# Update metadata
ddd_map['metadata']['last_updated'] = '2025-11-09'
ddd_map['metadata']['status'] = 'completed'

# Update refactoring plan phases
for phase_key, phase in ddd_map.get('refactoring_plan', {}).items():
    phase['status'] = 'completed'

# Save updated map
with open('migration_tools/gap-analysis-system/ddd-map.json', 'w', encoding='utf-8') as f:
    json.dump(ddd_map, f, indent=2)

print('✅ DDD map updated successfully')
print('   All elements marked as completed')
print('   Metadata updated with completion date')
