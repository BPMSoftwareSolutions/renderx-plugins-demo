#!/usr/bin/env python3
"""
Event & Sequence Scanner

A Python script that scans source code to find EventRouter.publish() calls
and conductor.play() calls, visualizing the event flow and sequence orchestration.

Usage:
    python event_sequence_scanner.py [path] [options]

Options:
    --include-ext EXT    : File extensions to scan (default: .ts,.tsx,.js,.jsx)
    --output FILE        : Save output to file instead of printing to console
    --group-by TYPE      : Group by 'file', 'type', or 'package' (default: type)
    --show-line-numbers  : Include line numbers in the output
    --show-context       : Show surrounding code context
    --stats              : Show statistics summary
    --format FORMAT      : Output format: 'tree', 'flat', or 'json' (default: tree)

Examples:
    python event_sequence_scanner.py packages
    python event_sequence_scanner.py packages --group-by package --stats
    python event_sequence_scanner.py packages --output events.txt --show-context
"""

import os
import re
import json
import argparse
from pathlib import Path
from typing import List, Dict, Set, Tuple
from collections import defaultdict
from dataclasses import dataclass, asdict


@dataclass
class EventCall:
    """Represents a single event/sequence call found in code."""
    file_path: str
    line_number: int
    call_type: str  # 'publish' or 'play'
    event_name: str
    full_line: str
    context_before: List[str] = None
    context_after: List[str] = None
    package: str = ""
    
    def __post_init__(self):
        # Extract package name from file path
        if 'packages' in self.file_path:
            parts = self.file_path.split(os.sep)
            if 'packages' in parts:
                idx = parts.index('packages')
                if idx + 1 < len(parts):
                    self.package = parts[idx + 1]
        
        # Initialize context lists if None
        if self.context_before is None:
            self.context_before = []
        if self.context_after is None:
            self.context_after = []


class EventSequenceScanner:
    """Scanner to extract EventRouter.publish and conductor.play calls."""
    
    # Patterns for event publishing and sequence playing
    PATTERNS = {
        'publish': [
            # EventRouter.publish('event', payload)
            r'EventRouter\.publish\s*\(\s*[\'"`]([^\'"`]+)[\'"`]',
            # this.eventRouter.publish('event', payload)
            r'(?:this\.)?eventRouter\.publish\s*\(\s*[\'"`]([^\'"`]+)[\'"`]',
            # router.publish('event', payload)
            r'router\.publish\s*\(\s*[\'"`]([^\'"`]+)[\'"`]',
        ],
        'play': [
            # conductor.play('sequence')
            r'conductor\.play\s*\(\s*[\'"`]([^\'"`]+)[\'"`]',
            # this.conductor.play('sequence')
            r'(?:this\.)?conductor\.play\s*\(\s*[\'"`]([^\'"`]+)[\'"`]',
            # context.conductor.play('sequence')
            r'context\.conductor\.play\s*\(\s*[\'"`]([^\'"`]+)[\'"`]',
        ]
    }
    
    def __init__(self,
                 extensions: List[str] = None,
                 show_line_numbers: bool = False,
                 show_context: bool = False,
                 group_by: str = 'type',
                 output_format: str = 'tree'):
        self.extensions = extensions or ['.ts', '.tsx', '.js', '.jsx']
        self.show_line_numbers = show_line_numbers
        self.show_context = show_context
        self.group_by = group_by
        self.output_format = output_format
        self.event_calls: List[EventCall] = []
        
    def should_scan_file(self, file_path: Path) -> bool:
        """Check if file should be scanned based on extension."""
        return file_path.suffix in self.extensions
    
    def extract_event_name(self, match_text: str, call_type: str) -> str:
        """Extract the event or sequence name from the matched text."""
        # The regex already captures the name in group 1
        return match_text
    
    def scan_file(self, file_path: Path) -> List[EventCall]:
        """Scan a single file for event/sequence calls."""
        calls = []
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            for line_num, line in enumerate(lines, start=1):
                # Skip commented lines
                stripped = line.strip()
                if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                    continue
                
                # Check for multi-line patterns (look ahead up to 5 lines)
                combined_line = line
                for i in range(1, min(6, len(lines) - line_num + 1)):
                    next_line = lines[line_num + i - 1]
                    if next_line.strip().startswith('//'):
                        break
                    combined_line += " " + next_line
                    # Stop if we find a semicolon or closing brace
                    if ';' in next_line or (')' in next_line and '{' not in next_line):
                        break
                
                # Check for publish patterns
                for pattern in self.PATTERNS['publish']:
                    matches = re.finditer(pattern, combined_line)
                    for match in matches:
                        event_name = match.group(1)
                        
                        # Get context if requested
                        context_before = []
                        context_after = []
                        if self.show_context:
                            # Get 2 lines before
                            for i in range(max(0, line_num - 3), line_num - 1):
                                if i < len(lines):
                                    context_before.append(lines[i].rstrip())
                            # Get 2 lines after
                            for i in range(line_num, min(len(lines), line_num + 2)):
                                if i < len(lines):
                                    context_after.append(lines[i].rstrip())
                        
                        calls.append(EventCall(
                            file_path=str(file_path),
                            line_number=line_num,
                            call_type='publish',
                            event_name=event_name,
                            full_line=line.strip(),
                            context_before=context_before,
                            context_after=context_after
                        ))
                
                # Check for play patterns
                for pattern in self.PATTERNS['play']:
                    matches = re.finditer(pattern, combined_line)
                    for match in matches:
                        sequence_name = match.group(1)
                        
                        # Get context if requested
                        context_before = []
                        context_after = []
                        if self.show_context:
                            # Get 2 lines before
                            for i in range(max(0, line_num - 3), line_num - 1):
                                if i < len(lines):
                                    context_before.append(lines[i].rstrip())
                            # Get 2 lines after
                            for i in range(line_num, min(len(lines), line_num + 2)):
                                if i < len(lines):
                                    context_after.append(lines[i].rstrip())
                        
                        calls.append(EventCall(
                            file_path=str(file_path),
                            line_number=line_num,
                            call_type='play',
                            event_name=sequence_name,
                            full_line=line.strip(),
                            context_before=context_before,
                            context_after=context_after
                        ))
                        
        except Exception as e:
            print(f"Warning: Error scanning {file_path}: {e}")
        
        return calls
    
    def scan_directory(self, root_path: Path) -> List[EventCall]:
        """Recursively scan directory for event/sequence calls."""
        all_calls = []
        
        print(f"Scanning directory: {root_path}")
        
        for file_path in root_path.rglob('*'):
            if file_path.is_file() and self.should_scan_file(file_path):
                # Skip node_modules, dist, and test files for cleaner results
                path_str = str(file_path)
                if 'node_modules' in path_str or '/dist/' in path_str or '\\dist\\' in path_str:
                    continue
                
                calls = self.scan_file(file_path)
                all_calls.extend(calls)
        
        print(f"Found {len(all_calls)} event/sequence calls in {len(set(call.file_path for call in all_calls))} files")
        
        return all_calls
    
    def group_calls(self, calls: List[EventCall]) -> Dict:
        """Group calls according to the grouping strategy."""
        grouped = defaultdict(list)
        
        if self.group_by == 'type':
            for call in calls:
                grouped[call.call_type].append(call)
        elif self.group_by == 'package':
            for call in calls:
                grouped[call.package or 'unknown'].append(call)
        else:  # group by file (default)
            for call in calls:
                grouped[call.file_path].append(call)
        
        return dict(grouped)
    
    def generate_tree_output(self, grouped_calls: Dict) -> str:
        """Generate ASCII tree output."""
        lines = []
        
        # Header
        lines.append("=" * 80)
        lines.append(f"Event & Sequence Calls Report - Grouped by {self.group_by.upper()}")
        lines.append("=" * 80)
        lines.append("")
        
        sorted_keys = sorted(grouped_calls.keys())
        
        for key_idx, key in enumerate(sorted_keys):
            calls = grouped_calls[key]
            is_last_key = key_idx == len(sorted_keys) - 1
            
            # Key header
            key_prefix = "└──" if is_last_key else "├──"
            lines.append(f"{key_prefix} {key} ({len(calls)} calls)")
            
            # Group calls by type within each key
            type_groups = defaultdict(list)
            for call in calls:
                type_groups[call.call_type].append(call)
            
            sorted_types = sorted(type_groups.keys())
            
            for type_idx, call_type in enumerate(sorted_types):
                type_calls = type_groups[call_type]
                is_last_type = type_idx == len(sorted_types) - 1
                
                continuation = "    " if is_last_key else "│   "
                type_prefix = "└──" if is_last_type else "├──"
                
                # Type emoji mapping
                type_emoji = {
                    'publish': '📡',
                    'play': '🎼'
                }
                
                emoji = type_emoji.get(call_type, '📋')
                type_label = "EventRouter.publish()" if call_type == 'publish' else "conductor.play()"
                lines.append(f"{continuation}{type_prefix} {emoji} {type_label} ({len(type_calls)} calls)")
                
                # Group by event/sequence name
                name_groups = defaultdict(list)
                for call in type_calls:
                    name_groups[call.event_name].append(call)
                
                sorted_names = sorted(name_groups.keys())
                
                for name_idx, event_name in enumerate(sorted_names[:15]):  # Limit to first 15 names
                    name_calls = name_groups[event_name]
                    is_last_name = name_idx == min(14, len(sorted_names) - 1)
                    
                    name_continuation = continuation + ("    " if is_last_type else "│   ")
                    name_prefix = "└──" if is_last_name and len(sorted_names) <= 15 else "├──"
                    
                    # Show event/sequence name with count
                    lines.append(f"{name_continuation}{name_prefix} '{event_name}' ({len(name_calls)} occurrence{'s' if len(name_calls) > 1 else ''})")
                    
                    # Show file locations (always show full paths)
                    for call_idx, call in enumerate(name_calls[:10]):  # Show first 10 occurrences
                        is_last_call = call_idx == min(9, len(name_calls) - 1)
                        call_continuation = name_continuation + ("    " if is_last_name and len(sorted_names) <= 15 else "│   ")
                        call_prefix = "└──" if is_last_call and len(name_calls) <= 10 else "├──"
                        
                        # Always show full path
                        if self.show_line_numbers:
                            lines.append(f"{call_continuation}{call_prefix} {call.file_path}:{call.line_number}")
                        else:
                            lines.append(f"{call_continuation}{call_prefix} {call.file_path}")
                        
                        # Show context if requested
                        if self.show_context:
                            ctx_cont = call_continuation + ("    " if is_last_call and len(name_calls) <= 10 else "│   ")
                            if call.context_before:
                                lines.append(f"{ctx_cont}    Context:")
                                for ctx_line in call.context_before[-2:]:  # Show last 2 lines before
                                    lines.append(f"{ctx_cont}      {ctx_line}")
                            lines.append(f"{ctx_cont}    ▶ {call.full_line}")
                            if call.context_after:
                                for ctx_line in call.context_after[:1]:  # Show first line after
                                    lines.append(f"{ctx_cont}      {ctx_line}")
                    
                    if len(name_calls) > 10:
                        call_continuation = name_continuation + ("    " if is_last_name and len(sorted_names) <= 15 else "│   ")
                        lines.append(f"{call_continuation}└── ... and {len(name_calls) - 10} more occurrences")
                
                if len(sorted_names) > 15:
                    name_continuation = continuation + ("    " if is_last_type else "│   ")
                    lines.append(f"{name_continuation}└── ... and {len(sorted_names) - 15} more events/sequences")
            
            lines.append("")
        
        return "\n".join(lines)
    
    def generate_flat_output(self, grouped_calls: Dict) -> str:
        """Generate flat list output."""
        lines = []
        
        lines.append("=" * 80)
        lines.append(f"Event & Sequence Calls Report - Grouped by {self.group_by.upper()}")
        lines.append("=" * 80)
        lines.append("")
        
        for key in sorted(grouped_calls.keys()):
            calls = grouped_calls[key]
            lines.append(f"\n{key}")
            lines.append("-" * len(key))
            
            for call in calls:
                call_label = "PUBLISH" if call.call_type == 'publish' else "PLAY   "
                
                # Always show full path
                lines.append(f"  [{call_label}] {call.event_name}")
                if self.show_line_numbers:
                    lines.append(f"             File: {call.file_path}:{call.line_number}")
                else:
                    lines.append(f"             File: {call.file_path}")
                
                if self.show_context:
                    for ctx_line in call.context_before:
                        lines.append(f"        {ctx_line}")
                    lines.append(f"      ▶ {call.full_line}")
                    for ctx_line in call.context_after[:1]:
                        lines.append(f"        {ctx_line}")
                    lines.append("")
        
        return "\n".join(lines)
    
    def generate_json_output(self, calls: List[EventCall]) -> str:
        """Generate JSON output."""
        # Convert calls to dict format
        calls_data = []
        for call in calls:
            call_dict = asdict(call)
            calls_data.append(call_dict)
        
        data = {
            'total_calls': len(calls),
            'group_by': self.group_by,
            'calls': calls_data
        }
        return json.dumps(data, indent=2)
    
    def generate_stats(self, calls: List[EventCall]) -> str:
        """Generate statistics summary."""
        lines = []
        
        lines.append("\n" + "=" * 80)
        lines.append("STATISTICS SUMMARY")
        lines.append("=" * 80)
        
        # Total calls
        lines.append(f"\n📊 Total Event/Sequence Calls: {len(calls)}")
        
        # By call type
        type_counts = defaultdict(int)
        for call in calls:
            type_counts[call.call_type] += 1
        
        lines.append(f"\n📈 By Call Type:")
        for call_type, count in sorted(type_counts.items()):
            percentage = (count / len(calls) * 100) if calls else 0
            bar = "█" * int(percentage / 2)
            type_label = "EventRouter.publish()" if call_type == 'publish' else "conductor.play()    "
            lines.append(f"  {type_label} {count:4} ({percentage:5.1f}%) {bar}")
        
        # Most published events
        publish_calls = [c for c in calls if c.call_type == 'publish']
        if publish_calls:
            event_counts = defaultdict(int)
            for call in publish_calls:
                event_counts[call.event_name] += 1
            
            lines.append(f"\n📡 Most Published Events (Top 15):")
            sorted_events = sorted(event_counts.items(), key=lambda x: x[1], reverse=True)[:15]
            for event_name, count in sorted_events:
                lines.append(f"  {event_name:40} {count:4}")
        
        # Most played sequences
        play_calls = [c for c in calls if c.call_type == 'play']
        if play_calls:
            sequence_counts = defaultdict(int)
            for call in play_calls:
                sequence_counts[call.event_name] += 1
            
            lines.append(f"\n🎼 Most Played Sequences (Top 15):")
            sorted_sequences = sorted(sequence_counts.items(), key=lambda x: x[1], reverse=True)[:15]
            for sequence_name, count in sorted_sequences:
                lines.append(f"  {sequence_name:40} {count:4}")
        
        # By package
        package_counts = defaultdict(lambda: {'publish': 0, 'play': 0})
        for call in calls:
            package_counts[call.package or 'unknown'][call.call_type] += 1
        
        lines.append(f"\n📦 By Package:")
        sorted_packages = sorted(package_counts.items(), key=lambda x: x[1]['publish'] + x[1]['play'], reverse=True)
        for package, counts in sorted_packages:
            total = counts['publish'] + counts['play']
            lines.append(f"  {package:30} Total: {total:3} (Publish: {counts['publish']:3}, Play: {counts['play']:3})")
        
        # Files with most calls
        file_counts = defaultdict(int)
        for call in calls:
            file_counts[call.file_path] += 1
        
        lines.append(f"\n📁 Files with Most Calls (Top 10):")
        sorted_files = sorted(file_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        for file_path, count in sorted_files:
            rel_path = Path(file_path).name
            lines.append(f"  {rel_path:50} {count:4}")
        
        lines.append("\n" + "=" * 80)
        
        return "\n".join(lines)
    
    def scan_and_generate_report(self, root_path: str) -> str:
        """Main method to scan and generate report."""
        path = Path(root_path)
        
        if not path.exists():
            return f"Error: Path '{root_path}' does not exist."
        
        # Scan for event/sequence calls
        self.event_calls = self.scan_directory(path)
        
        if not self.event_calls:
            return "No event or sequence calls found."
        
        # Group calls
        grouped = self.group_calls(self.event_calls)
        
        # Generate output based on format
        if self.output_format == 'json':
            output = self.generate_json_output(self.event_calls)
        elif self.output_format == 'flat':
            output = self.generate_flat_output(grouped)
        else:  # tree
            output = self.generate_tree_output(grouped)
        
        return output


def main():
    parser = argparse.ArgumentParser(
        description="Scan source code for EventRouter.publish() and conductor.play() calls",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s packages                                    # Scan packages directory
  %(prog)s packages --group-by type                    # Group by call type (default)
  %(prog)s packages --group-by package --stats         # Group by package with stats
  %(prog)s packages --output events.txt --show-line-numbers  # Save with line numbers
  %(prog)s packages --show-context --output events.txt # Include code context
  %(prog)s packages --format json --output events.json # Export as JSON
        """
    )
    
    parser.add_argument('path', nargs='?', default='.',
                       help='Path to scan (default: current directory)')
    parser.add_argument('--include-ext', action='append', metavar='EXT',
                       help='File extensions to scan (e.g., .ts, .js)')
    parser.add_argument('--output', metavar='FILE',
                       help='Save output to file instead of printing')
    parser.add_argument('--group-by', choices=['file', 'type', 'package'],
                       default='type',
                       help='How to group calls (default: type)')
    parser.add_argument('--show-line-numbers', action='store_true',
                       help='Include line numbers in output')
    parser.add_argument('--show-context', action='store_true',
                       help='Show surrounding code context')
    parser.add_argument('--stats', action='store_true',
                       help='Show statistics summary')
    parser.add_argument('--format', choices=['tree', 'flat', 'json'],
                       default='tree',
                       help='Output format (default: tree)')
    
    args = parser.parse_args()
    
    # Create scanner
    extensions = args.include_ext if args.include_ext else ['.ts', '.tsx', '.js', '.jsx']
    scanner = EventSequenceScanner(
        extensions=extensions,
        show_line_numbers=args.show_line_numbers,
        show_context=args.show_context,
        group_by=args.group_by,
        output_format=args.format
    )
    
    # Generate report
    report = scanner.scan_and_generate_report(args.path)
    
    # Add stats if requested
    if args.stats and scanner.event_calls:
        report += "\n" + scanner.generate_stats(scanner.event_calls)
    
    # Output result
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"Event & sequence calls report saved to '{args.output}'")
        
        # Also print stats to console if requested
        if args.stats:
            print(scanner.generate_stats(scanner.event_calls))
    else:
        print(report)


if __name__ == "__main__":
    main()
