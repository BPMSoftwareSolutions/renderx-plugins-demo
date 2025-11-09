#!/usr/bin/env python3
"""
Log Message Scanner

A Python script that scans source code files to extract and visualize all log messages
in an ASCII tree format, organized by file, log level, and message content.

Usage:
    python log_message_scanner.py [path] [options]

Options:
    --include-ext EXT    : File extensions to scan (default: .ts,.tsx,.js,.jsx)
    --output FILE        : Save output to file instead of printing to console
    --group-by TYPE      : Group by 'file', 'level', or 'package' (default: file)
    --show-line-numbers  : Include line numbers in the output
    --stats              : Show statistics summary
    --format FORMAT      : Output format: 'tree', 'flat', or 'json' (default: tree)

Examples:
    python log_message_scanner.py packages
    python log_message_scanner.py packages --group-by level --stats
    python log_message_scanner.py packages --output log_messages.txt --show-line-numbers
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
class LogMessage:
    """Represents a single log message found in code."""
    file_path: str
    line_number: int
    log_level: str
    message: str
    full_line: str
    package: str = ""
    
    def __post_init__(self):
        # Extract package name from file path
        if 'packages' in self.file_path:
            parts = self.file_path.split(os.sep)
            if 'packages' in parts:
                idx = parts.index('packages')
                if idx + 1 < len(parts):
                    self.package = parts[idx + 1]


class LogScanner:
    """Scanner to extract log messages from source code files."""
    
    # Comprehensive log patterns for different logging styles
    LOG_PATTERNS = [
        # console.log, console.error, console.warn, console.info, console.debug
        (r'console\.(log|error|warn|info|debug)\s*\((.*?)\)', 'console'),
        # logger.log, logger.error, logger.warn, logger.info, logger.debug
        (r'(?:this\.)?logger\.(log|error|warn|info|debug|success)\s*\((.*?)\)', 'logger'),
        # context.logger or ctx.logger methods (with optional chaining: ctx.logger?.error?.(...))
        (r'(?:context|ctx)\.logger\?\.\s*(log|error|warn|info|debug|success)\?\.\s*\((.*?)\)', 'ctx.logger'),
        # context.logger without optional chaining
        (r'(?:context|ctx)\.logger\.(log|error|warn|info|debug|success)\s*\((.*?)\)', 'context.logger'),
        # DataBaton.log
        (r'DataBaton\.log\s*\((.*?)\)', 'DataBaton'),
        # Generic .log() method calls
        (r'\.log\s*\((.*?)\)', 'generic.log'),
    ]
    
    def __init__(self,
                 extensions: List[str] = None,
                 show_line_numbers: bool = False,
                 group_by: str = 'file',
                 output_format: str = 'tree'):
        self.extensions = extensions or ['.ts', '.tsx', '.js', '.jsx']
        self.show_line_numbers = show_line_numbers
        self.group_by = group_by
        self.output_format = output_format
        self.log_messages: List[LogMessage] = []
        
    def should_scan_file(self, file_path: Path) -> bool:
        """Check if file should be scanned based on extension."""
        return file_path.suffix in self.extensions
    
    def extract_message_text(self, message_expr: str) -> str:
        """Extract the actual message text from the expression."""
        # Remove leading/trailing whitespace
        message_expr = message_expr.strip()
        
        # Try to extract string literals
        # Handle template literals
        template_match = re.search(r'`([^`]*)`', message_expr)
        if template_match:
            return template_match.group(1)
        
        # Handle single quotes
        single_quote_match = re.search(r"'([^']*)'", message_expr)
        if single_quote_match:
            return single_quote_match.group(1)
        
        # Handle double quotes
        double_quote_match = re.search(r'"([^"]*)"', message_expr)
        if double_quote_match:
            return double_quote_match.group(1)
        
        # If no quotes found, return the expression itself (truncated)
        return message_expr[:100] + ('...' if len(message_expr) > 100 else '')
    
    def scan_file(self, file_path: Path) -> List[LogMessage]:
        """Scan a single file for log messages."""
        messages = []
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                
            for line_num, line in enumerate(lines, start=1):
                # Skip commented lines
                stripped = line.strip()
                if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                    continue
                
                # Check each log pattern
                for pattern, log_type in self.LOG_PATTERNS:
                    matches = re.finditer(pattern, line)
                    for match in matches:
                        if log_type == 'console':
                            level = match.group(1)
                            message_expr = match.group(2) if len(match.groups()) > 1 else ''
                        elif log_type in ['logger', 'context.logger']:
                            level = match.group(1)
                            message_expr = match.group(2) if len(match.groups()) > 1 else ''
                        elif log_type == 'DataBaton':
                            level = 'log'
                            message_expr = match.group(1)
                        else:
                            level = 'log'
                            message_expr = match.group(1) if len(match.groups()) > 0 else ''
                        
                        message_text = self.extract_message_text(message_expr)
                        
                        # Normalize log level
                        level = level.lower()
                        
                        messages.append(LogMessage(
                            file_path=str(file_path),
                            line_number=line_num,
                            log_level=level,
                            message=message_text,
                            full_line=line.strip()
                        ))
                        
        except Exception as e:
            print(f"Warning: Error scanning {file_path}: {e}")
        
        return messages
    
    def scan_directory(self, root_path: Path) -> List[LogMessage]:
        """Recursively scan directory for log messages."""
        all_messages = []
        
        print(f"Scanning directory: {root_path}")
        
        for file_path in root_path.rglob('*'):
            if file_path.is_file() and self.should_scan_file(file_path):
                # Skip node_modules and dist folders
                if 'node_modules' in str(file_path) or '/dist/' in str(file_path) or '\\dist\\' in str(file_path):
                    continue
                
                messages = self.scan_file(file_path)
                all_messages.extend(messages)
        
        print(f"Found {len(all_messages)} log messages in {len(set(msg.file_path for msg in all_messages))} files")
        
        return all_messages
    
    def group_messages(self, messages: List[LogMessage]) -> Dict:
        """Group messages according to the grouping strategy."""
        grouped = defaultdict(list)
        
        if self.group_by == 'level':
            for msg in messages:
                grouped[msg.log_level].append(msg)
        elif self.group_by == 'package':
            for msg in messages:
                grouped[msg.package or 'unknown'].append(msg)
        else:  # group by file (default)
            for msg in messages:
                grouped[msg.file_path].append(msg)
        
        return dict(grouped)
    
    def generate_tree_output(self, grouped_messages: Dict) -> str:
        """Generate ASCII tree output."""
        lines = []
        
        # Header
        lines.append("=" * 80)
        lines.append(f"Log Messages Report - Grouped by {self.group_by.upper()}")
        lines.append("=" * 80)
        lines.append("")
        
        sorted_keys = sorted(grouped_messages.keys())
        
        for key_idx, key in enumerate(sorted_keys):
            messages = grouped_messages[key]
            is_last_key = key_idx == len(sorted_keys) - 1
            
            # Key header
            key_prefix = "└──" if is_last_key else "├──"
            lines.append(f"{key_prefix} {key} ({len(messages)} messages)")
            
            # Group messages by level within each key
            level_groups = defaultdict(list)
            for msg in messages:
                level_groups[msg.log_level].append(msg)
            
            sorted_levels = sorted(level_groups.keys())
            
            for level_idx, level in enumerate(sorted_levels):
                level_messages = level_groups[level]
                is_last_level = level_idx == len(sorted_levels) - 1
                
                continuation = "    " if is_last_key else "│   "
                level_prefix = "└──" if is_last_level else "├──"
                
                # Level emoji mapping
                level_emoji = {
                    'log': '📝',
                    'info': 'ℹ️',
                    'warn': '⚠️',
                    'error': '❌',
                    'debug': '🐛',
                    'success': '✅'
                }
                
                emoji = level_emoji.get(level, '📋')
                lines.append(f"{continuation}{level_prefix} {emoji} {level.upper()} ({len(level_messages)} occurrences)")
                
                # Show individual messages
                for msg_idx, msg in enumerate(level_messages[:10]):  # Limit to first 10 per level
                    is_last_msg = msg_idx == min(9, len(level_messages) - 1)
                    
                    msg_continuation = continuation + ("    " if is_last_level else "│   ")
                    msg_prefix = "└──" if is_last_msg and len(level_messages) <= 10 else "├──"
                    
                    # Format the message
                    msg_text = msg.message[:70] + "..." if len(msg.message) > 70 else msg.message
                    
                    if self.show_line_numbers:
                        lines.append(f"{msg_continuation}{msg_prefix} Line {msg.line_number}: {msg_text}")
                    else:
                        lines.append(f"{msg_continuation}{msg_prefix} {msg_text}")
                
                # Show count if more messages exist
                if len(level_messages) > 10:
                    msg_continuation = continuation + ("    " if is_last_level else "│   ")
                    lines.append(f"{msg_continuation}└── ... and {len(level_messages) - 10} more")
                
            lines.append("")
        
        return "\n".join(lines)
    
    def generate_flat_output(self, grouped_messages: Dict) -> str:
        """Generate flat list output."""
        lines = []
        
        lines.append("=" * 80)
        lines.append(f"Log Messages Report - Grouped by {self.group_by.upper()}")
        lines.append("=" * 80)
        lines.append("")
        
        for key in sorted(grouped_messages.keys()):
            messages = grouped_messages[key]
            lines.append(f"\n{key}")
            lines.append("-" * len(key))
            
            for msg in messages:
                if self.show_line_numbers:
                    lines.append(f"  [{msg.log_level.upper():7}] Line {msg.line_number:4}: {msg.message}")
                else:
                    lines.append(f"  [{msg.log_level.upper():7}] {msg.message}")
        
        return "\n".join(lines)
    
    def generate_json_output(self, messages: List[LogMessage]) -> str:
        """Generate JSON output."""
        data = {
            'total_messages': len(messages),
            'group_by': self.group_by,
            'messages': [asdict(msg) for msg in messages]
        }
        return json.dumps(data, indent=2)
    
    def generate_stats(self, messages: List[LogMessage]) -> str:
        """Generate statistics summary."""
        lines = []
        
        lines.append("\n" + "=" * 80)
        lines.append("STATISTICS SUMMARY")
        lines.append("=" * 80)
        
        # Total messages
        lines.append(f"\n📊 Total Log Messages: {len(messages)}")
        
        # By log level
        level_counts = defaultdict(int)
        for msg in messages:
            level_counts[msg.log_level] += 1
        
        lines.append(f"\n📈 By Log Level:")
        for level, count in sorted(level_counts.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / len(messages) * 100) if messages else 0
            bar = "█" * int(percentage / 2)
            lines.append(f"  {level.upper():10} {count:4} ({percentage:5.1f}%) {bar}")
        
        # By package
        package_counts = defaultdict(int)
        for msg in messages:
            package_counts[msg.package or 'unknown'] += 1
        
        lines.append(f"\n📦 By Package (Top 10):")
        sorted_packages = sorted(package_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        for package, count in sorted_packages:
            percentage = (count / len(messages) * 100) if messages else 0
            lines.append(f"  {package:30} {count:4} ({percentage:5.1f}%)")
        
        # Files with most logs
        file_counts = defaultdict(int)
        for msg in messages:
            file_counts[msg.file_path] += 1
        
        lines.append(f"\n📁 Files with Most Logs (Top 10):")
        sorted_files = sorted(file_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        for file_path, count in sorted_files:
            # Show relative path
            rel_path = Path(file_path).name
            lines.append(f"  {rel_path:50} {count:4}")
        
        lines.append("\n" + "=" * 80)
        
        return "\n".join(lines)
    
    def scan_and_generate_report(self, root_path: str) -> str:
        """Main method to scan and generate report."""
        path = Path(root_path)
        
        if not path.exists():
            return f"Error: Path '{root_path}' does not exist."
        
        # Scan for log messages
        self.log_messages = self.scan_directory(path)
        
        if not self.log_messages:
            return "No log messages found."
        
        # Group messages
        grouped = self.group_messages(self.log_messages)
        
        # Generate output based on format
        if self.output_format == 'json':
            output = self.generate_json_output(self.log_messages)
        elif self.output_format == 'flat':
            output = self.generate_flat_output(grouped)
        else:  # tree
            output = self.generate_tree_output(grouped)
        
        return output


def main():
    parser = argparse.ArgumentParser(
        description="Scan source code for log messages and generate ASCII visualization",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s packages                                    # Scan packages directory
  %(prog)s packages --group-by level                   # Group by log level
  %(prog)s packages --group-by package --stats         # Group by package with stats
  %(prog)s packages --output logs.txt --show-line-numbers  # Save with line numbers
  %(prog)s packages --format json --output logs.json   # Export as JSON
        """
    )
    
    parser.add_argument('path', nargs='?', default='.',
                       help='Path to scan (default: current directory)')
    parser.add_argument('--include-ext', action='append', metavar='EXT',
                       help='File extensions to scan (e.g., .ts, .js)')
    parser.add_argument('--output', metavar='FILE',
                       help='Save output to file instead of printing')
    parser.add_argument('--group-by', choices=['file', 'level', 'package'],
                       default='file',
                       help='How to group log messages (default: file)')
    parser.add_argument('--show-line-numbers', action='store_true',
                       help='Include line numbers in output')
    parser.add_argument('--stats', action='store_true',
                       help='Show statistics summary')
    parser.add_argument('--format', choices=['tree', 'flat', 'json'],
                       default='tree',
                       help='Output format (default: tree)')
    
    args = parser.parse_args()
    
    # Create scanner
    extensions = args.include_ext if args.include_ext else ['.ts', '.tsx', '.js', '.jsx']
    scanner = LogScanner(
        extensions=extensions,
        show_line_numbers=args.show_line_numbers,
        group_by=args.group_by,
        output_format=args.format
    )
    
    # Generate report
    report = scanner.scan_and_generate_report(args.path)
    
    # Add stats if requested
    if args.stats and scanner.log_messages:
        report += "\n" + scanner.generate_stats(scanner.log_messages)
    
    # Output result
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"Log message report saved to '{args.output}'")
        
        # Also print stats to console if requested
        if args.stats:
            print(scanner.generate_stats(scanner.log_messages))
    else:
        print(report)


if __name__ == "__main__":
    main()
