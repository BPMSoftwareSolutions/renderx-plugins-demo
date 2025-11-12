#!/usr/bin/env python3
"""
Convert Mermaid diagrams to SVG format.

Supports two methods:
1. Mermaid CLI (mmdc) - if installed
2. Mermaid Live Editor API - online conversion

Usage:
    python convert_to_svg.py                    # Convert all .md files
    python convert_to_svg.py summary_diagram    # Convert specific diagram
    python convert_to_svg.py --method cli       # Use CLI method
    python convert_to_svg.py --method api       # Use API method
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from typing import Optional, List
import urllib.request
import urllib.parse
import base64

def extract_mermaid_from_md(md_file: str) -> Optional[str]:
    """Extract Mermaid diagram code from markdown file."""
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Look for mermaid code block
    if '```mermaid' in content:
        start = content.find('```mermaid') + len('```mermaid')
        end = content.find('```', start)
        if end > start:
            return content[start:end].strip()
    
    # If no mermaid block, assume entire content is diagram
    if content.strip().startswith('graph') or content.strip().startswith('sequenceDiagram'):
        return content.strip()
    
    return None

def convert_via_cli(mermaid_code: str, output_file: str) -> bool:
    """Convert using Mermaid CLI (mmdc)."""
    try:
        # Create temporary mermaid file
        temp_file = output_file.replace('.svg', '.mmd')
        with open(temp_file, 'w', encoding='utf-8') as f:
            f.write(mermaid_code)
        
        # Run mmdc
        result = subprocess.run(
            ['mmdc', '-i', temp_file, '-o', output_file],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        # Clean up temp file
        if os.path.exists(temp_file):
            os.remove(temp_file)
        
        if result.returncode == 0:
            print(f"✅ Converted via CLI: {output_file}")
            return True
        else:
            print(f"❌ CLI conversion failed: {result.stderr}")
            return False
    
    except FileNotFoundError:
        print("⚠️  Mermaid CLI (mmdc) not found. Install with: npm install -g @mermaid-js/mermaid-cli")
        return False
    except Exception as e:
        print(f"❌ CLI conversion error: {e}")
        return False

def convert_via_api(mermaid_code: str, output_file: str) -> bool:
    """Convert using Mermaid Live Editor API."""
    try:
        # Encode diagram for API
        encoded = base64.urlsafe_b64encode(mermaid_code.encode()).decode()
        
        # Use Mermaid Live Editor API
        url = f"https://mermaid.ink/svg/{encoded}"
        
        print(f"📡 Converting via API: {output_file}")
        
        # Download SVG
        with urllib.request.urlopen(url, timeout=30) as response:
            svg_content = response.read().decode('utf-8')
        
        # Write SVG file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        print(f"✅ Converted via API: {output_file}")
        return True
    
    except Exception as e:
        print(f"❌ API conversion error: {e}")
        return False

def convert_diagram(md_file: str, output_file: Optional[str] = None, method: str = 'auto') -> bool:
    """Convert a single Mermaid diagram."""
    
    # Extract mermaid code
    mermaid_code = extract_mermaid_from_md(md_file)
    if not mermaid_code:
        print(f"❌ No Mermaid diagram found in {md_file}")
        return False
    
    # Determine output file
    if not output_file:
        output_file = md_file.replace('.md', '.svg')
    
    print(f"📊 Converting: {md_file} → {output_file}")
    
    # Try conversion methods
    if method == 'auto':
        # Try CLI first, fall back to API
        if not convert_via_cli(mermaid_code, output_file):
            return convert_via_api(mermaid_code, output_file)
        return True
    elif method == 'cli':
        return convert_via_cli(mermaid_code, output_file)
    elif method == 'api':
        return convert_via_api(mermaid_code, output_file)
    else:
        print(f"❌ Unknown method: {method}")
        return False

def convert_all_diagrams(method: str = 'auto', diag_dir: str = None) -> int:
    """Convert all Mermaid diagrams in specified directory."""

    if diag_dir is None:
        # Default to .ographx/visualization/diagrams/
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        diag_dir = os.path.join(base_dir, '.ographx', 'visualization', 'diagrams')

    md_files = [
        'summary_diagram.md',
        'orchestration_diagram.md',
        'call_graph_diagram.md',
        'sequence_flow_diagram.md',
        'beat_timeline.md'
    ]

    success_count = 0

    for md_file in md_files:
        full_path = os.path.join(diag_dir, md_file)
        if os.path.exists(full_path):
            if convert_diagram(full_path, method=method):
                success_count += 1
        else:
            print(f"⚠️  File not found: {full_path}")

    print()
    print(f"✅ Converted {success_count}/{len(md_files)} diagrams")
    return success_count

def main():
    parser = argparse.ArgumentParser(
        description='Convert Mermaid diagrams to SVG',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python convert_to_svg.py                    # Convert all diagrams
  python convert_to_svg.py summary_diagram    # Convert specific diagram
  python convert_to_svg.py --method cli       # Use CLI method
  python convert_to_svg.py --method api       # Use API method
  python convert_to_svg.py --all --method api # Convert all via API
        '''
    )
    
    parser.add_argument(
        'diagram',
        nargs='?',
        help='Diagram name (without .md extension) or path to .md file'
    )
    parser.add_argument(
        '--method',
        choices=['auto', 'cli', 'api'],
        default='auto',
        help='Conversion method (default: auto)'
    )
    parser.add_argument(
        '--output', '-o',
        help='Output SVG file path'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Convert all diagrams'
    )
    
    args = parser.parse_args()

    # Determine diagram directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    diag_dir = os.path.join(base_dir, '.ographx', 'visualization', 'diagrams')

    if args.all or not args.diagram:
        # Convert all diagrams
        convert_all_diagrams(method=args.method, diag_dir=diag_dir)
    else:
        # Convert specific diagram
        diagram_name = args.diagram

        # Add .md extension if not present
        if not diagram_name.endswith('.md'):
            diagram_name += '.md'

        full_path = os.path.join(diag_dir, diagram_name)
        if not os.path.exists(full_path):
            print(f"❌ File not found: {full_path}")
            sys.exit(1)

        output_file = args.output
        if not output_file:
            output_file = full_path.replace('.md', '.svg')

        if convert_diagram(full_path, output_file, method=args.method):
            sys.exit(0)
        else:
            sys.exit(1)

if __name__ == '__main__':
    main()

