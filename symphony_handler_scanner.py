#!/usr/bin/env python3
"""
Symphony Handler Scanner
========================

Scans JSON sequence/symphony files and traces handlers to their implementation code.
Maps declarative beat/movement definitions to actual TypeScript/JavaScript handlers.

Features:
- Discovers all JSON sequences in packages
- Extracts beat metadata (event, title, dynamics, timing, kind, handler)
- Traces handler functions to implementation files
- Detects handler patterns (async, Promise, class methods, arrow functions)
- Maps movements to their handler directories
- Generates cross-reference reports (JSON → Code)

Usage:
    python symphony_handler_scanner.py <directory> [options]

Options:
    --output FILE           Save report to file
    --json FILE            Export as JSON
    --group-by MODE        Group by: sequence, package, handler, event
    --show-orphans         Show handlers defined in JSON but not found in code
    --show-unused          Show handler files without JSON references
    --stats                Show statistics summary
    --min-beats N          Only show sequences with N+ beats
    --trace-depth LEVEL    Handler trace depth: basic, detailed, full

Examples:
    python symphony_handler_scanner.py packages
    python symphony_handler_scanner.py packages --group-by package --stats
    python symphony_handler_scanner.py packages --show-orphans --show-unused
    python symphony_handler_scanner.py packages/canvas-component --trace-depth full
"""

import os
import re
import json
import argparse
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional
from dataclasses import dataclass, field, asdict
from collections import defaultdict

@dataclass
class BeatMetadata:
    """Metadata for a single beat in a symphony movement."""
    beat: int
    event: str
    title: str
    handler: str
    dynamics: Optional[str] = None
    timing: Optional[str] = None
    kind: Optional[str] = None
    transition: Optional[str] = None
    description: Optional[str] = None
    file_path: str = ""
    line_number: int = 0

@dataclass
class HandlerImplementation:
    """Implementation details of a handler function."""
    handler_name: str
    file_path: str
    line_number: int
    function_type: str  # async-function, sync-function, arrow-function, class-method
    signature: str
    is_exported: bool
    parameters: List[str] = field(default_factory=list)
    return_type: Optional[str] = None
    doc_comment: Optional[str] = None

@dataclass
class Movement:
    """A movement within a symphony sequence."""
    movement: int
    name: str
    description: Optional[str]
    beats: List[BeatMetadata] = field(default_factory=list)
    handler_dir: Optional[str] = None

@dataclass
class Sequence:
    """A complete symphony sequence."""
    sequence_id: str
    package_name: str
    json_file: str
    title: Optional[str]
    description: Optional[str]
    trigger: Optional[Dict] = None
    movements: List[Movement] = field(default_factory=list)
    total_beats: int = 0

# Handler detection patterns
HANDLER_PATTERNS = [
    # Exported async function
    r'export\s+async\s+function\s+(\w+)\s*\((.*?)\)',
    # Exported sync function
    r'export\s+function\s+(\w+)\s*\((.*?)\)',
    # Exported const with arrow function
    r'export\s+const\s+(\w+)\s*=\s*async\s*\((.*?)\)\s*=>',
    r'export\s+const\s+(\w+)\s*=\s*\((.*?)\)\s*=>',
    # Named exports
    r'const\s+(\w+)\s*=\s*async\s*\((.*?)\)\s*=>',
    r'const\s+(\w+)\s*=\s*\((.*?)\)\s*=>',
    r'async\s+function\s+(\w+)\s*\((.*?)\)',
    r'function\s+(\w+)\s*\((.*?)\)',
    # Class methods
    r'async\s+(\w+)\s*\((.*?)\)\s*\{',
    r'(\w+)\s*\((.*?)\)\s*:\s*Promise<',
    r'(\w+)\s*\((.*?)\)\s*:\s*\w+\s*\{',
]

class SymphonyScanner:
    """Scans directories for JSON sequences and traces handlers to code."""
    
    def __init__(self, root_dir: str, trace_depth: str = "detailed"):
        self.root_dir = Path(root_dir)
        self.trace_depth = trace_depth
        self.sequences: List[Sequence] = []
        self.handler_implementations: Dict[str, List[HandlerImplementation]] = defaultdict(list)
        self.orphaned_handlers: Set[str] = set()
        self.unused_handlers: Set[str] = set()
        
    def scan(self):
        """Scan directory for sequences and handlers."""
        print(f"Scanning directory: {self.root_dir}")
        
        # Phase 1: Find all JSON sequence files
        json_files = self._find_sequence_files()
        print(f"Found {len(json_files)} sequence files")
        
        # Phase 2: Parse JSON sequences
        for json_file in json_files:
            sequence = self._parse_sequence_file(json_file)
            if sequence:
                self.sequences.append(sequence)
        
        print(f"Parsed {len(self.sequences)} sequences with {sum(s.total_beats for s in self.sequences)} total beats")
        
        # Phase 3: Find handler implementations
        all_handlers = self._collect_all_handlers()
        print(f"Searching for {len(all_handlers)} unique handlers")
        
        for handler_name in all_handlers:
            implementations = self._find_handler_implementation(handler_name)
            if implementations:
                self.handler_implementations[handler_name].extend(implementations)
            else:
                self.orphaned_handlers.add(handler_name)
        
        print(f"Found {len(self.handler_implementations)} implemented handlers")
        print(f"Orphaned handlers (not found in code): {len(self.orphaned_handlers)}")
        
        # Phase 4: Find unused handler files
        if self.trace_depth == "full":
            self._find_unused_handlers(all_handlers)
    
    def _find_sequence_files(self) -> List[Path]:
        """Find all JSON sequence files in json-sequences directories."""
        json_files = []
        
        for root, dirs, files in os.walk(self.root_dir):
            # Look for json-sequences directories
            if 'json-sequences' in root:
                for file in files:
                    if file.endswith('.json'):
                        json_files.append(Path(root) / file)
        
        return json_files
    
    def _parse_sequence_file(self, json_file: Path) -> Optional[Sequence]:
        """Parse a JSON sequence file."""
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extract package name from path
            parts = json_file.parts
            package_name = "unknown"
            if 'packages' in parts:
                pkg_idx = parts.index('packages')
                if pkg_idx + 1 < len(parts):
                    package_name = parts[pkg_idx + 1]
            
            sequence_id = data.get('id', json_file.stem)
            
            sequence = Sequence(
                sequence_id=sequence_id,
                package_name=package_name,
                json_file=str(json_file),
                title=data.get('title'),
                description=data.get('description'),
                trigger=data.get('trigger')
            )
            
            # Parse movements
            movements_data = data.get('movements', [])
            for mov_data in movements_data:
                movement = Movement(
                    movement=mov_data.get('movement', 0),
                    name=mov_data.get('name', ''),
                    description=mov_data.get('description')
                )
                
                # Parse beats
                beats_data = mov_data.get('beats', [])
                for beat_data in beats_data:
                    beat = BeatMetadata(
                        beat=beat_data.get('beat', 0),
                        event=beat_data.get('event', ''),
                        title=beat_data.get('title', ''),
                        handler=beat_data.get('handler', ''),
                        dynamics=beat_data.get('dynamics'),
                        timing=beat_data.get('timing'),
                        kind=beat_data.get('kind'),
                        transition=beat_data.get('transition'),
                        description=beat_data.get('description'),
                        file_path=str(json_file),
                        line_number=0  # JSON doesn't have line numbers easily
                    )
                    movement.beats.append(beat)
                    sequence.total_beats += 1
                
                sequence.movements.append(movement)
            
            return sequence
            
        except Exception as e:
            print(f"Error parsing {json_file}: {e}")
            return None
    
    def _collect_all_handlers(self) -> Set[str]:
        """Collect all unique handler names from sequences."""
        handlers = set()
        for sequence in self.sequences:
            for movement in sequence.movements:
                for beat in movement.beats:
                    if beat.handler:
                        handlers.add(beat.handler)
        return handlers
    
    def _find_handler_implementation(self, handler_name: str) -> List[HandlerImplementation]:
        """Find implementation of a handler in source files."""
        implementations = []
        
        # Search in src directories
        for root, dirs, files in os.walk(self.root_dir):
            if 'src' in root or 'symphonies' in root:
                for file in files:
                    if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                        file_path = Path(root) / file
                        impls = self._scan_file_for_handler(file_path, handler_name)
                        implementations.extend(impls)
        
        return implementations
    
    def _scan_file_for_handler(self, file_path: Path, handler_name: str) -> List[HandlerImplementation]:
        """Scan a single file for handler implementation."""
        implementations = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            for i, line in enumerate(lines, 1):
                for pattern in HANDLER_PATTERNS:
                    match = re.search(pattern, line)
                    if match:
                        found_name = match.group(1)
                        if found_name == handler_name:
                            params_str = match.group(2) if len(match.groups()) > 1 else ""
                            
                            # Determine function type
                            func_type = "sync-function"
                            if 'async' in line:
                                func_type = "async-function"
                            if '=>' in line:
                                func_type = "arrow-function"
                            if 'class' in content[:content.find(line)]:
                                func_type = "class-method"
                            
                            # Check if exported
                            is_exported = 'export' in line or self._is_in_export_block(content, line)
                            
                            # Extract parameters
                            parameters = [p.strip().split(':')[0].strip() for p in params_str.split(',') if p.strip()]
                            
                            # Extract return type
                            return_type = None
                            return_match = re.search(r':\s*(Promise<\w+>|\w+)\s*[{=]', line)
                            if return_match:
                                return_type = return_match.group(1)
                            
                            # Get doc comment if available
                            doc_comment = self._extract_doc_comment(lines, i - 1)
                            
                            impl = HandlerImplementation(
                                handler_name=handler_name,
                                file_path=str(file_path),
                                line_number=i,
                                function_type=func_type,
                                signature=line.strip(),
                                is_exported=is_exported,
                                parameters=parameters,
                                return_type=return_type,
                                doc_comment=doc_comment
                            )
                            implementations.append(impl)
                            break
        
        except Exception as e:
            pass  # Skip files with encoding issues
        
        return implementations
    
    def _is_in_export_block(self, content: str, line: str) -> bool:
        """Check if a line is within an export block."""
        # Look for export { ... } patterns
        export_blocks = re.findall(r'export\s*\{[^}]+\}', content, re.DOTALL)
        return any(line in block for block in export_blocks)
    
    def _extract_doc_comment(self, lines: List[str], line_idx: int) -> Optional[str]:
        """Extract JSDoc/TSDoc comment above a function."""
        if line_idx <= 0:
            return None
        
        comments = []
        idx = line_idx - 1
        
        # Look backwards for comments
        while idx >= 0:
            line = lines[idx].strip()
            if line.startswith('*/'):
                # Found end of block comment
                while idx >= 0 and not lines[idx].strip().startswith('/*'):
                    comment_line = lines[idx].strip()
                    if comment_line and comment_line != '*/' and comment_line != '/**':
                        comments.insert(0, comment_line.lstrip('* '))
                    idx -= 1
                break
            elif line.startswith('//'):
                comments.insert(0, line.lstrip('/ '))
                idx -= 1
            elif not line:
                idx -= 1
            else:
                break
        
        return ' '.join(comments) if comments else None
    
    def _find_unused_handlers(self, referenced_handlers: Set[str]):
        """Find handler files that aren't referenced in any sequence."""
        for root, dirs, files in os.walk(self.root_dir):
            if 'symphonies' in root or 'handlers' in root:
                for file in files:
                    if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                        file_path = Path(root) / file
                        # Extract function names from file
                        functions = self._extract_function_names(file_path)
                        for func in functions:
                            if func not in referenced_handlers:
                                self.unused_handlers.add(f"{func} ({file_path})")
    
    def _extract_function_names(self, file_path: Path) -> Set[str]:
        """Extract all exported function names from a file."""
        functions = set()
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find all function declarations
            for pattern in HANDLER_PATTERNS:
                matches = re.finditer(pattern, content)
                for match in matches:
                    if 'export' in content[max(0, match.start() - 50):match.start()]:
                        functions.add(match.group(1))
        except:
            pass
        
        return functions


class SymphonyReportGenerator:
    """Generates reports from scanned symphony data."""
    
    def __init__(self, scanner: SymphonyScanner):
        self.scanner = scanner
    
    def generate_report(self, group_by: str = "sequence", show_orphans: bool = False,
                       show_unused: bool = False, show_stats: bool = False,
                       min_beats: int = 0) -> str:
        """Generate formatted report."""
        lines = []
        lines.append("=" * 80)
        lines.append("Symphony Handler Tracing Report")
        lines.append("=" * 80)
        lines.append("")
        
        if group_by == "sequence":
            lines.extend(self._generate_by_sequence(min_beats))
        elif group_by == "package":
            lines.extend(self._generate_by_package(min_beats))
        elif group_by == "handler":
            lines.extend(self._generate_by_handler())
        elif group_by == "event":
            lines.extend(self._generate_by_event())
        
        if show_orphans and self.scanner.orphaned_handlers:
            lines.append("")
            lines.extend(self._generate_orphans())
        
        if show_unused and self.scanner.unused_handlers:
            lines.append("")
            lines.extend(self._generate_unused())
        
        if show_stats:
            lines.append("")
            lines.extend(self._generate_statistics())
        
        return '\n'.join(lines)
    
    def _generate_by_sequence(self, min_beats: int = 0) -> List[str]:
        """Generate report grouped by sequence."""
        lines = []
        
        filtered_sequences = [s for s in self.scanner.sequences if s.total_beats >= min_beats]
        
        for seq in filtered_sequences:
            lines.append(f"├── {seq.sequence_id} ({seq.package_name})")
            lines.append(f"│   ├── 📄 JSON: {seq.json_file}")
            if seq.title:
                lines.append(f"│   ├── 📌 Title: {seq.title}")
            if seq.description:
                lines.append(f"│   ├── 📝 Description: {seq.description}")
            lines.append(f"│   ├── 🎵 Movements: {len(seq.movements)}")
            lines.append(f"│   ├── 🥁 Total Beats: {seq.total_beats}")
            
            if seq.trigger:
                lines.append(f"│   ├── 🎯 Trigger:")
                lines.append(f"│   │   ├── Event: {seq.trigger.get('event', 'N/A')}")
                if 'topic' in seq.trigger:
                    lines.append(f"│   │   └── Topic: {seq.trigger.get('topic')}")
            
            lines.append("│   └── 🎼 MOVEMENTS:")
            
            for mov in seq.movements:
                lines.append(f"│       ├── Movement {mov.movement}: {mov.name}")
                if mov.description:
                    lines.append(f"│       │   └── {mov.description}")
                lines.append(f"│       └── 🥁 BEATS ({len(mov.beats)}):")
                
                for beat in mov.beats:
                    lines.append(f"│           ├── Beat {beat.beat}: {beat.title}")
                    lines.append(f"│           │   ├── 📡 Event: {beat.event}")
                    lines.append(f"│           │   ├── 🎯 Handler: {beat.handler}")
                    
                    if beat.dynamics:
                        lines.append(f"│           │   ├── 🎚️  Dynamics: {beat.dynamics}")
                    if beat.timing:
                        lines.append(f"│           │   ├── ⏱️  Timing: {beat.timing}")
                    if beat.kind:
                        lines.append(f"│           │   ├── 🏷️  Kind: {beat.kind}")
                    if beat.transition:
                        lines.append(f"│           │   ├── 🔄 Transition: {beat.transition}")
                    
                    # Show implementation
                    impls = self.scanner.handler_implementations.get(beat.handler, [])
                    if impls:
                        lines.append(f"│           │   └── 💻 IMPLEMENTATION:")
                        for impl in impls:
                            rel_path = self._relative_path(impl.file_path)
                            lines.append(f"│           │       ├── 📁 File: {rel_path}:{impl.line_number}")
                            lines.append(f"│           │       ├── 🔧 Type: {impl.function_type}")
                            if impl.is_exported:
                                lines.append(f"│           │       ├── ✅ Exported: Yes")
                            if impl.parameters:
                                lines.append(f"│           │       ├── 📋 Params: {', '.join(impl.parameters)}")
                            if impl.return_type:
                                lines.append(f"│           │       ├── 🔙 Returns: {impl.return_type}")
                            if impl.doc_comment:
                                lines.append(f"│           │       └── 📖 Doc: {impl.doc_comment[:80]}...")
                    else:
                        lines.append(f"│           │   └── ⚠️  IMPLEMENTATION NOT FOUND")
                    
                    lines.append("│           │")
            
            lines.append("")
        
        return lines
    
    def _generate_by_package(self, min_beats: int = 0) -> List[str]:
        """Generate report grouped by package."""
        lines = []
        
        by_package = defaultdict(list)
        for seq in self.scanner.sequences:
            if seq.total_beats >= min_beats:
                by_package[seq.package_name].append(seq)
        
        for package_name, sequences in sorted(by_package.items()):
            total_beats = sum(s.total_beats for s in sequences)
            lines.append(f"├── 📦 {package_name} ({len(sequences)} sequences, {total_beats} beats)")
            
            for seq in sequences:
                lines.append(f"│   ├── {seq.sequence_id}")
                lines.append(f"│   │   ├── Movements: {len(seq.movements)}")
                lines.append(f"│   │   └── Beats: {seq.total_beats}")
                
                # List handlers
                handlers = set()
                for mov in seq.movements:
                    for beat in mov.beats:
                        if beat.handler:
                            handlers.add(beat.handler)
                
                if handlers:
                    lines.append(f"│   │   └── Handlers: {', '.join(sorted(handlers))}")
            
            lines.append("│")
        
        return lines
    
    def _generate_by_handler(self) -> List[str]:
        """Generate report grouped by handler."""
        lines = []
        
        # Collect handler usage
        handler_usage = defaultdict(list)
        for seq in self.scanner.sequences:
            for mov in seq.movements:
                for beat in mov.beats:
                    if beat.handler:
                        handler_usage[beat.handler].append({
                            'sequence': seq.sequence_id,
                            'package': seq.package_name,
                            'movement': mov.movement,
                            'beat': beat.beat,
                            'event': beat.event
                        })
        
        for handler_name, usages in sorted(handler_usage.items()):
            lines.append(f"├── 🎯 {handler_name} (used {len(usages)} times)")
            
            # Show implementation
            impls = self.scanner.handler_implementations.get(handler_name, [])
            if impls:
                lines.append(f"│   ├── 💻 IMPLEMENTATION:")
                for impl in impls:
                    rel_path = self._relative_path(impl.file_path)
                    lines.append(f"│   │   ├── {rel_path}:{impl.line_number} ({impl.function_type})")
                    if impl.parameters:
                        lines.append(f"│   │   └── Params: {', '.join(impl.parameters)}")
            else:
                lines.append(f"│   ├── ⚠️  NOT FOUND IN CODE")
            
            lines.append(f"│   └── 📍 USED IN:")
            for usage in usages:
                lines.append(f"│       ├── {usage['sequence']} ({usage['package']})")
                lines.append(f"│       │   └── Movement {usage['movement']}, Beat {usage['beat']}: {usage['event']}")
            
            lines.append("│")
        
        return lines
    
    def _generate_by_event(self) -> List[str]:
        """Generate report grouped by event."""
        lines = []
        
        event_mapping = defaultdict(list)
        for seq in self.scanner.sequences:
            for mov in seq.movements:
                for beat in mov.beats:
                    event_mapping[beat.event].append({
                        'sequence': seq.sequence_id,
                        'handler': beat.handler,
                        'beat': beat.beat,
                        'title': beat.title
                    })
        
        for event, beats in sorted(event_mapping.items()):
            lines.append(f"├── 📡 {event} ({len(beats)} beats)")
            
            for beat_info in beats:
                lines.append(f"│   ├── {beat_info['sequence']}: {beat_info['title']}")
                lines.append(f"│   │   └── Handler: {beat_info['handler']}")
            
            lines.append("│")
        
        return lines
    
    def _generate_orphans(self) -> List[str]:
        """Generate report of orphaned handlers."""
        lines = []
        lines.append("⚠️  ORPHANED HANDLERS (defined in JSON but not found in code):")
        lines.append("")
        
        for handler in sorted(self.scanner.orphaned_handlers):
            lines.append(f"  ├── {handler}")
            
            # Show where it's used
            for seq in self.scanner.sequences:
                for mov in seq.movements:
                    for beat in mov.beats:
                        if beat.handler == handler:
                            lines.append(f"  │   └── Used in: {seq.sequence_id} (Beat {beat.beat})")
        
        return lines
    
    def _generate_unused(self) -> List[str]:
        """Generate report of unused handlers."""
        lines = []
        lines.append("ℹ️  UNUSED HANDLERS (exist in code but not referenced in sequences):")
        lines.append("")
        
        for handler in sorted(self.scanner.unused_handlers):
            lines.append(f"  ├── {handler}")
        
        return lines
    
    def _generate_statistics(self) -> List[str]:
        """Generate statistics summary."""
        lines = []
        lines.append("=" * 80)
        lines.append("STATISTICS SUMMARY")
        lines.append("=" * 80)
        lines.append("")
        
        total_sequences = len(self.scanner.sequences)
        total_movements = sum(len(s.movements) for s in self.scanner.sequences)
        total_beats = sum(s.total_beats for s in self.scanner.sequences)
        total_handlers = len(set(
            beat.handler
            for seq in self.scanner.sequences
            for mov in seq.movements
            for beat in mov.beats
            if beat.handler
        ))
        implemented_handlers = len(self.scanner.handler_implementations)
        orphaned_handlers = len(self.scanner.orphaned_handlers)
        
        lines.append(f"📊 Total Sequences: {total_sequences}")
        lines.append(f"🎵 Total Movements: {total_movements}")
        lines.append(f"🥁 Total Beats: {total_beats}")
        lines.append(f"🎯 Unique Handlers: {total_handlers}")
        lines.append(f"✅ Implemented: {implemented_handlers}")
        lines.append(f"⚠️  Orphaned: {orphaned_handlers}")
        
        if total_handlers > 0:
            impl_rate = (implemented_handlers / total_handlers) * 100
            lines.append(f"📈 Implementation Rate: {impl_rate:.1f}%")
        
        # Package breakdown
        lines.append("")
        lines.append("📦 By Package:")
        by_package = defaultdict(int)
        for seq in self.scanner.sequences:
            by_package[seq.package_name] += seq.total_beats
        
        for package, beats in sorted(by_package.items(), key=lambda x: -x[1]):
            lines.append(f"  {package:30s} {beats:4d} beats")
        
        # Event breakdown
        lines.append("")
        lines.append("📡 By Event (Top 10):")
        event_counts = defaultdict(int)
        for seq in self.scanner.sequences:
            for mov in seq.movements:
                for beat in mov.beats:
                    event_counts[beat.event] += 1
        
        for event, count in sorted(event_counts.items(), key=lambda x: -x[1])[:10]:
            lines.append(f"  {event:50s} {count:3d}×")
        
        # Handler types
        lines.append("")
        lines.append("🔧 Handler Types:")
        type_counts = defaultdict(int)
        for impls in self.scanner.handler_implementations.values():
            for impl in impls:
                type_counts[impl.function_type] += 1
        
        for func_type, count in sorted(type_counts.items(), key=lambda x: -x[1]):
            lines.append(f"  {func_type:20s} {count:3d}")
        
        return lines
    
    def _relative_path(self, path: str) -> str:
        """Get path relative to root directory."""
        try:
            return str(Path(path).relative_to(self.scanner.root_dir))
        except ValueError:
            return path
    
    def export_json(self) -> dict:
        """Export scan results as JSON."""
        return {
            'sequences': [
                {
                    'id': seq.sequence_id,
                    'package': seq.package_name,
                    'file': seq.json_file,
                    'title': seq.title,
                    'description': seq.description,
                    'trigger': seq.trigger,
                    'movements': [
                        {
                            'movement': mov.movement,
                            'name': mov.name,
                            'description': mov.description,
                            'beats': [
                                asdict(beat) for beat in mov.beats
                            ]
                        }
                        for mov in seq.movements
                    ]
                }
                for seq in self.scanner.sequences
            ],
            'handler_implementations': {
                handler: [asdict(impl) for impl in impls]
                for handler, impls in self.scanner.handler_implementations.items()
            },
            'orphaned_handlers': list(self.scanner.orphaned_handlers),
            'unused_handlers': list(self.scanner.unused_handlers)
        }


def main():
    parser = argparse.ArgumentParser(
        description='Scan JSON sequences and trace handlers to implementation code',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument('directory', help='Directory to scan')
    parser.add_argument('--output', help='Output file for report')
    parser.add_argument('--json', dest='json_output', help='Export as JSON')
    parser.add_argument('--group-by', choices=['sequence', 'package', 'handler', 'event'],
                       default='sequence', help='Grouping mode')
    parser.add_argument('--show-orphans', action='store_true',
                       help='Show handlers not found in code')
    parser.add_argument('--show-unused', action='store_true',
                       help='Show handler files without JSON references')
    parser.add_argument('--stats', action='store_true',
                       help='Show statistics summary')
    parser.add_argument('--min-beats', type=int, default=0,
                       help='Minimum beats per sequence')
    parser.add_argument('--trace-depth', choices=['basic', 'detailed', 'full'],
                       default='detailed', help='Handler trace depth')
    
    args = parser.parse_args()
    
    # Scan
    scanner = SymphonyScanner(args.directory, args.trace_depth)
    scanner.scan()
    
    # Generate report
    report_gen = SymphonyReportGenerator(scanner)
    report = report_gen.generate_report(
        group_by=args.group_by,
        show_orphans=args.show_orphans,
        show_unused=args.show_unused,
        show_stats=args.stats,
        min_beats=args.min_beats
    )
    
    # Output
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"Report saved to '{args.output}'")
    else:
        print(report)
    
    # JSON export
    if args.json_output:
        with open(args.json_output, 'w', encoding='utf-8') as f:
            json.dump(report_gen.export_json(), f, indent=2)
        print(f"JSON data exported to '{args.json_output}'")


if __name__ == '__main__':
    main()
