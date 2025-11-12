#!/usr/bin/env python3
"""
Generate test structure graph from actual test files

This script analyzes the test suite and generates:
1. Mermaid diagram of test hierarchy
2. JSON representation of test structure
3. Test statistics and coverage mapping
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any


def extract_test_classes(file_path: Path) -> List[Dict[str, Any]]:
    """Extract test classes and methods from a test file"""
    content = file_path.read_text()
    classes = []
    
    # Find all test classes
    class_pattern = r'class\s+(Test\w+):\s*"""([^"]*)'
    for match in re.finditer(class_pattern, content):
        class_name = match.group(1)
        docstring = match.group(2).strip()
        
        # Find test methods in this class
        methods = []
        class_start = match.start()
        # Find next class or end of file
        next_class = re.search(r'\nclass\s+Test', content[class_start + 1:])
        class_end = next_class.start() + class_start + 1 if next_class else len(content)
        
        class_content = content[class_start:class_end]
        method_pattern = r'def\s+(test_\w+)\(self[^)]*\):\s*"""([^"]*)'
        
        for method_match in re.finditer(method_pattern, class_content):
            method_name = method_match.group(1)
            method_doc = method_match.group(2).strip()
            methods.append({
                'name': method_name,
                'description': method_doc
            })
        
        classes.append({
            'name': class_name,
            'description': docstring,
            'methods': methods,
            'count': len(methods)
        })
    
    return classes


def generate_mermaid_graph(test_structure: Dict[str, Any]) -> str:
    """Generate Mermaid diagram from test structure"""
    lines = ['graph TD']
    lines.append('    A["🧪 OgraphX Test Suite<br/>47 Tests Total"]')
    
    node_id = 1
    node_map = {}
    
    # Add main categories
    lines.append('    A --> B["📊 Unit Tests<br/>32 Tests"]')
    lines.append('    A --> C["🔗 Integration Tests<br/>15 Tests"]')
    
    # Unit tests
    unit_id = 10
    for category, classes in test_structure['unit'].items():
        total_tests = sum(c['count'] for c in classes)
        cat_node = f'B{unit_id}'
        lines.append(f'    B --> {cat_node}["{category}<br/>{total_tests} Tests"]')
        
        for cls in classes:
            cls_node = f'B{unit_id}{len(node_map)}'
            lines.append(f'    {cat_node} --> {cls_node}["{cls["name"]}<br/>{cls["count"]} tests"]')
            node_map[cls['name']] = cls_node
        
        unit_id += 1
    
    # Integration tests
    int_id = 20
    for category, classes in test_structure['integration'].items():
        total_tests = sum(c['count'] for c in classes)
        cat_node = f'C{int_id}'
        lines.append(f'    C --> {cat_node}["{category}<br/>{total_tests} Tests"]')
        
        for cls in classes:
            cls_node = f'C{int_id}{len(node_map)}'
            lines.append(f'    {cat_node} --> {cls_node}["{cls["name"]}<br/>{cls["count"]} tests"]')
            node_map[cls['name']] = cls_node
        
        int_id += 1
    
    # Add styling
    lines.append('    style A fill:#4a90e2,stroke:#2c5aa0,color:#fff,stroke-width:3px')
    lines.append('    style B fill:#7cb342,stroke:#558b2f,color:#fff,stroke-width:2px')
    lines.append('    style C fill:#ff7043,stroke:#d84315,color:#fff,stroke-width:2px')
    
    return '\n'.join(lines)


def analyze_test_files() -> Dict[str, Any]:
    """Analyze all test files and extract structure"""
    test_dir = Path(__file__).parent.parent / 'tests'
    
    structure = {
        'unit': {},
        'integration': {},
        'total_tests': 0,
        'files': []
    }
    
    # Analyze unit tests
    unit_dir = test_dir / 'unit'
    if unit_dir.exists():
        for test_file in unit_dir.glob('test_*.py'):
            classes = extract_test_classes(test_file)
            
            # Categorize by test type
            if 'core' in test_file.name:
                category = 'Core Extraction'
            elif 'generator' in test_file.name:
                category = 'Generators'
            elif 'analysis' in test_file.name:
                category = 'Analysis'
            else:
                category = 'Other'
            
            if category not in structure['unit']:
                structure['unit'][category] = []
            
            structure['unit'][category].extend(classes)
            
            for cls in classes:
                structure['total_tests'] += cls['count']
            
            structure['files'].append({
                'path': str(test_file.relative_to(test_dir)),
                'type': 'unit',
                'category': category,
                'classes': classes,
                'total': sum(c['count'] for c in classes)
            })
    
    # Analyze integration tests
    int_dir = test_dir / 'integration'
    if int_dir.exists():
        for test_file in int_dir.glob('test_*.py'):
            classes = extract_test_classes(test_file)
            
            category = 'Pipeline'
            if category not in structure['integration']:
                structure['integration'][category] = []
            
            structure['integration'][category].extend(classes)
            
            for cls in classes:
                structure['total_tests'] += cls['count']
            
            structure['files'].append({
                'path': str(test_file.relative_to(test_dir)),
                'type': 'integration',
                'category': category,
                'classes': classes,
                'total': sum(c['count'] for c in classes)
            })
    
    return structure


def main():
    """Generate test graph and save outputs"""
    print("[*] Analyzing test files...")
    structure = analyze_test_files()

    # Generate outputs
    output_dir = Path(__file__).parent.parent / '.ographx' / 'test-graphs'
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save JSON structure
    json_file = output_dir / 'test_structure.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(structure, f, indent=2)
    print(f"[OK] Saved test structure: {json_file}")
    
    # Generate and save Mermaid diagram
    mermaid_graph = generate_mermaid_graph(structure)
    mermaid_file = output_dir / 'test_graph.mmd'
    with open(mermaid_file, 'w', encoding='utf-8') as f:
        f.write(mermaid_graph)
    print(f"Saved Mermaid diagram: {mermaid_file}")
    
    # Print summary
    print(f"\n[SUMMARY] TEST STATISTICS")
    print(f"=" * 70)
    print(f"Total Tests: {structure['total_tests']}")
    print(f"Test Files: {len(structure['files'])}")
    print(f"\nUnit Tests:")
    for category, classes in structure['unit'].items():
        total = sum(c['count'] for c in classes)
        print(f"  {category}: {total} tests")
    print(f"\nIntegration Tests:")
    for category, classes in structure['integration'].items():
        total = sum(c['count'] for c in classes)
        print(f"  {category}: {total} tests")
    
    return structure


if __name__ == '__main__':
    main()

