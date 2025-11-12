#!/usr/bin/env python3
"""
Musical Conductor Logging Scanner
==================================
Scans the web variant's musical-conductor package for all logging statements
and generates a comprehensive report with ASCII visualization.

Usage:
    python musical_conductor_logging_scanner.py
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict, Counter
from typing import List, Dict, Tuple, Set
from dataclasses import dataclass, asdict


@dataclass
class LogEntry:
    """Represents a single logging statement"""
    file_path: str
    line_number: int
    log_type: str  # console.log, console.warn, console.error, logger.log, etc.
    message: str
    context: str
    severity: str  # INFO, WARN, ERROR, DEBUG
    category: str  # EventBus, MusicalConductor, PluginManager, etc.


class MusicalConductorLoggingScanner:
    """Scans and analyzes logging in the musical-conductor package"""

    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.packages_dir = self.root_dir / "packages" / "musical-conductor"
        self.log_entries: List[LogEntry] = []
        
        # Logging patterns to match
        self.patterns = [
            # console.log, console.warn, console.error, console.info, console.debug
            (r'console\.(log|warn|error|info|debug)\s*\((.*?)\)', 'console'),
            # logger.log, logger.warn, logger.error, logger.info, logger.debug
            (r'logger\.(log|warn|error|info|debug)\s*\((.*?)\)', 'logger'),
            # this._logger, ctx.logger, DataBaton.log
            (r'this\._logger\.(log|warn|error|info|debug)\s*\((.*?)\)', 'instance_logger'),
            (r'ctx\.logger\.(log|warn|error|info|debug)\s*\((.*?)\)', 'context_logger'),
            (r'DataBaton\.log\s*\((.*?)\)', 'databaton'),
            (r'EventLogger\.(log|warn|error|info|debug)\s*\((.*?)\)', 'event_logger'),
            # this.eventLogger
            (r'this\.eventLogger\.(log|warn|error|info|debug|handle.*?|setup.*?)\s*\((.*?)\)', 'event_logger_instance'),
        ]

    def scan_directory(self) -> None:
        """Recursively scan all TypeScript files in the musical-conductor package"""
        print(f"🔍 Scanning {self.packages_dir}...")
        
        if not self.packages_dir.exists():
            print(f"❌ Directory not found: {self.packages_dir}")
            return
        
        ts_files = list(self.packages_dir.rglob("*.ts"))
        print(f"📁 Found {len(ts_files)} TypeScript files\n")
        
        for file_path in ts_files:
            # Skip test files for now (can be included if needed)
            if "test" in file_path.name.lower() or "/tests/" in str(file_path):
                continue
            
            self._scan_file(file_path)
        
        print(f"\n✅ Scan complete! Found {len(self.log_entries)} logging statements\n")

    def _scan_file(self, file_path: Path) -> None:
        """Scan a single file for logging statements"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for line_num, line in enumerate(lines, start=1):
                self._extract_logs_from_line(file_path, line_num, line)
        
        except Exception as e:
            print(f"⚠️ Error reading {file_path}: {e}")

    def _extract_logs_from_line(self, file_path: Path, line_num: int, line: str) -> None:
        """Extract logging statements from a single line"""
        # Skip comments
        if line.strip().startswith('//') or line.strip().startswith('*'):
            return
        
        for pattern, log_source in self.patterns:
            matches = re.finditer(pattern, line)
            
            for match in matches:
                log_type = match.group(1) if len(match.groups()) > 0 else 'log'
                
                # Extract message (may span multiple lines, but we'll capture what we can)
                if log_source == 'databaton':
                    message_content = match.group(1) if match.lastindex >= 1 else ''
                else:
                    message_content = match.group(2) if match.lastindex >= 2 else ''
                
                # Truncate long messages
                message_preview = message_content.strip()[:100]
                
                # Determine severity
                severity = self._determine_severity(log_type, log_source)
                
                # Determine category from file path
                category = self._determine_category(file_path)
                
                # Create log entry
                entry = LogEntry(
                    file_path=str(file_path.relative_to(self.root_dir)),
                    line_number=line_num,
                    log_type=f"{log_source}.{log_type}",
                    message=message_preview,
                    context=line.strip(),
                    severity=severity,
                    category=category
                )
                
                self.log_entries.append(entry)

    def _determine_severity(self, log_type: str, log_source: str) -> str:
        """Determine the severity level based on log type"""
        severity_map = {
            'error': 'ERROR',
            'warn': 'WARN',
            'info': 'INFO',
            'debug': 'DEBUG',
            'log': 'INFO',
        }
        return severity_map.get(log_type.lower(), 'INFO')

    def _determine_category(self, file_path: Path) -> str:
        """Determine the category/module from file path"""
        parts = file_path.parts
        
        # Extract meaningful category from path
        if 'EventBus' in file_path.name:
            return 'EventBus'
        elif 'MusicalConductor' in file_path.name:
            return 'MusicalConductor'
        elif 'PluginManager' in file_path.name:
            return 'PluginManager'
        elif 'PluginLoader' in file_path.name:
            return 'PluginLoader'
        elif 'ExecutionQueue' in file_path.name:
            return 'ExecutionQueue'
        elif 'Resource' in file_path.name:
            return 'ResourceManagement'
        elif 'Sequence' in file_path.name:
            return 'SequenceManagement'
        elif 'Beat' in file_path.name:
            return 'BeatExecution'
        elif 'Movement' in file_path.name:
            return 'MovementExecution'
        elif 'Plugin' in file_path.name:
            return 'PluginSystem'
        elif 'Logger' in file_path.name or 'logging' in file_path.name.lower():
            return 'Logging'
        elif 'Validator' in file_path.name or 'validation' in file_path.name.lower():
            return 'Validation'
        elif 'Stage' in file_path.name:
            return 'StageManagement'
        else:
            # Try to get from directory structure
            for part in reversed(parts):
                if part in ['plugins', 'execution', 'resources', 'monitoring', 
                           'validation', 'orchestration', 'stage', 'strictmode']:
                    return part.capitalize()
        
        return 'Other'

    def generate_report(self, output_file: str) -> None:
        """Generate a comprehensive markdown report"""
        print(f"📝 Generating report: {output_file}")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Musical Conductor Logging Analysis Report\n\n")
            f.write(f"**Generated:** {self._get_timestamp()}\n\n")
            f.write(f"**Total Logging Statements:** {len(self.log_entries)}\n\n")
            
            # Table of Contents
            f.write("## Table of Contents\n\n")
            f.write("1. [Executive Summary](#executive-summary)\n")
            f.write("2. [ASCII Visualization](#ascii-visualization)\n")
            f.write("3. [Statistics by Category](#statistics-by-category)\n")
            f.write("4. [Statistics by Severity](#statistics-by-severity)\n")
            f.write("5. [Statistics by Log Type](#statistics-by-log-type)\n")
            f.write("6. [Top Logging Files](#top-logging-files)\n")
            f.write("7. [Detailed Log Inventory](#detailed-log-inventory)\n")
            f.write("8. [Recommendations](#recommendations)\n\n")
            
            # Executive Summary
            self._write_executive_summary(f)
            
            # ASCII Visualization
            self._write_ascii_visualization(f)
            
            # Statistics
            self._write_statistics(f)
            
            # Detailed inventory
            self._write_detailed_inventory(f)
            
            # Recommendations
            self._write_recommendations(f)
        
        print(f"✅ Report generated: {output_file}\n")

    def _write_executive_summary(self, f) -> None:
        """Write executive summary section"""
        f.write("## Executive Summary\n\n")
        
        # Count by severity
        severity_counts = Counter(entry.severity for entry in self.log_entries)
        category_counts = Counter(entry.category for entry in self.log_entries)
        
        f.write("### Overview\n\n")
        f.write(f"The Musical Conductor package contains **{len(self.log_entries)}** logging statements ")
        f.write(f"across **{len(set(e.file_path for e in self.log_entries))}** files.\n\n")
        
        f.write("### Severity Breakdown\n\n")
        for severity in ['ERROR', 'WARN', 'INFO', 'DEBUG']:
            count = severity_counts.get(severity, 0)
            percentage = (count / len(self.log_entries) * 100) if self.log_entries else 0
            f.write(f"- **{severity}:** {count} ({percentage:.1f}%)\n")
        
        f.write("\n### Top Categories\n\n")
        for category, count in category_counts.most_common(5):
            percentage = (count / len(self.log_entries) * 100) if self.log_entries else 0
            f.write(f"- **{category}:** {count} ({percentage:.1f}%)\n")
        
        f.write("\n")

    def _write_ascii_visualization(self, f) -> None:
        """Write ASCII visualization of logging distribution"""
        f.write("## ASCII Visualization\n\n")
        
        # Visualization by category
        f.write("### Logging Distribution by Category\n\n")
        f.write("```\n")
        
        category_counts = Counter(entry.category for entry in self.log_entries)
        max_count = max(category_counts.values()) if category_counts else 1
        
        for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
            bar_length = int((count / max_count) * 50)
            bar = '█' * bar_length
            f.write(f"{category:25} │{bar} {count}\n")
        
        f.write("```\n\n")
        
        # Visualization by severity
        f.write("### Logging Distribution by Severity\n\n")
        f.write("```\n")
        
        severity_counts = Counter(entry.severity for entry in self.log_entries)
        max_count = max(severity_counts.values()) if severity_counts else 1
        
        severity_colors = {
            'ERROR': '🔴',
            'WARN': '🟡',
            'INFO': '🔵',
            'DEBUG': '⚪'
        }
        
        for severity in ['ERROR', 'WARN', 'INFO', 'DEBUG']:
            count = severity_counts.get(severity, 0)
            bar_length = int((count / max_count) * 50) if count > 0 else 0
            bar = '█' * bar_length
            icon = severity_colors.get(severity, '⚪')
            f.write(f"{icon} {severity:6} │{bar} {count}\n")
        
        f.write("```\n\n")
        
        # File heat map
        f.write("### File Logging Heat Map (Top 20)\n\n")
        f.write("```\n")
        
        file_counts = Counter(entry.file_path for entry in self.log_entries)
        max_count = max(file_counts.values()) if file_counts else 1
        
        for file_path, count in file_counts.most_common(20):
            bar_length = int((count / max_count) * 40)
            bar = '▓' * bar_length
            # Truncate long file names
            display_path = file_path.split('/')[-1][:30]
            f.write(f"{display_path:32} │{bar} {count}\n")
        
        f.write("```\n\n")
        
        # Log type distribution
        f.write("### Logging Type Distribution\n\n")
        f.write("```\n")
        
        type_counts = Counter(entry.log_type for entry in self.log_entries)
        max_count = max(type_counts.values()) if type_counts else 1
        
        for log_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True)[:15]:
            bar_length = int((count / max_count) * 40)
            bar = '░' * bar_length
            f.write(f"{log_type:30} │{bar} {count}\n")
        
        f.write("```\n\n")

    def _write_statistics(self, f) -> None:
        """Write detailed statistics sections"""
        
        # Statistics by Category
        f.write("## Statistics by Category\n\n")
        category_counts = Counter(entry.category for entry in self.log_entries)
        
        f.write("| Category | Count | Percentage |\n")
        f.write("|----------|-------|------------|\n")
        
        for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / len(self.log_entries) * 100) if self.log_entries else 0
            f.write(f"| {category} | {count} | {percentage:.1f}% |\n")
        
        f.write("\n")
        
        # Statistics by Severity
        f.write("## Statistics by Severity\n\n")
        severity_counts = Counter(entry.severity for entry in self.log_entries)
        
        f.write("| Severity | Count | Percentage |\n")
        f.write("|----------|-------|------------|\n")
        
        for severity in ['ERROR', 'WARN', 'INFO', 'DEBUG']:
            count = severity_counts.get(severity, 0)
            percentage = (count / len(self.log_entries) * 100) if self.log_entries else 0
            f.write(f"| {severity} | {count} | {percentage:.1f}% |\n")
        
        f.write("\n")
        
        # Statistics by Log Type
        f.write("## Statistics by Log Type\n\n")
        type_counts = Counter(entry.log_type for entry in self.log_entries)
        
        f.write("| Log Type | Count | Percentage |\n")
        f.write("|----------|-------|------------|\n")
        
        for log_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / len(self.log_entries) * 100) if self.log_entries else 0
            f.write(f"| {log_type} | {count} | {percentage:.1f}% |\n")
        
        f.write("\n")
        
        # Top Logging Files
        f.write("## Top Logging Files\n\n")
        file_counts = Counter(entry.file_path for entry in self.log_entries)
        
        f.write("| File | Count | Percentage |\n")
        f.write("|------|-------|------------|\n")
        
        for file_path, count in file_counts.most_common(20):
            percentage = (count / len(self.log_entries) * 100) if self.log_entries else 0
            f.write(f"| `{file_path}` | {count} | {percentage:.1f}% |\n")
        
        f.write("\n")

    def _write_detailed_inventory(self, f) -> None:
        """Write detailed inventory of all logging statements"""
        f.write("## Detailed Log Inventory\n\n")
        
        # Group by category
        logs_by_category = defaultdict(list)
        for entry in self.log_entries:
            logs_by_category[entry.category].append(entry)
        
        for category in sorted(logs_by_category.keys()):
            entries = logs_by_category[category]
            f.write(f"### {category} ({len(entries)} statements)\n\n")
            
            # Group by file within category
            logs_by_file = defaultdict(list)
            for entry in entries:
                logs_by_file[entry.file_path].append(entry)
            
            for file_path in sorted(logs_by_file.keys()):
                file_entries = sorted(logs_by_file[file_path], key=lambda e: e.line_number)
                f.write(f"#### `{file_path}`\n\n")
                
                f.write("| Line | Severity | Type | Message Preview |\n")
                f.write("|------|----------|------|----------------|\n")
                
                for entry in file_entries:
                    message_preview = entry.message[:60].replace('|', '\\|')
                    f.write(f"| {entry.line_number} | {entry.severity} | `{entry.log_type}` | {message_preview}... |\n")
                
                f.write("\n")

    def _write_recommendations(self, f) -> None:
        """Write recommendations based on analysis"""
        f.write("## Recommendations\n\n")
        
        f.write("### 1. Logging Standardization\n\n")
        
        # Analyze log type diversity
        type_counts = Counter(entry.log_type for entry in self.log_entries)
        console_count = sum(count for log_type, count in type_counts.items() if 'console' in log_type)
        logger_count = sum(count for log_type, count in type_counts.items() if 'logger' in log_type)
        
        f.write(f"- **Console logging:** {console_count} statements ({console_count/len(self.log_entries)*100:.1f}%)\n")
        f.write(f"- **Logger API:** {logger_count} statements ({logger_count/len(self.log_entries)*100:.1f}%)\n\n")
        
        if console_count > logger_count:
            f.write("⚠️ **Recommendation:** Migrate from `console.*` to a structured logger API (e.g., `ctx.logger.*`) ")
            f.write("for better control, filtering, and production deployment.\n\n")
        
        f.write("### 2. Severity Distribution\n\n")
        
        severity_counts = Counter(entry.severity for entry in self.log_entries)
        error_count = severity_counts.get('ERROR', 0)
        warn_count = severity_counts.get('WARN', 0)
        info_count = severity_counts.get('INFO', 0)
        
        if info_count > (error_count + warn_count) * 3:
            f.write("⚠️ **Observation:** High volume of INFO-level logging may impact performance in production. ")
            f.write("Consider adding log level controls or reducing verbose logging.\n\n")
        
        if error_count < warn_count * 0.5:
            f.write("✅ **Good practice:** Error logging is appropriately used for exceptional cases.\n\n")
        
        f.write("### 3. Category-Specific Recommendations\n\n")
        
        category_counts = Counter(entry.category for entry in self.log_entries)
        top_category, top_count = category_counts.most_common(1)[0] if category_counts else ('N/A', 0)
        
        f.write(f"- **{top_category}** has the most logging ({top_count} statements). ")
        f.write("Consider if this level of instrumentation is necessary for production.\n\n")
        
        f.write("### 4. Alignment with Desktop Variant\n\n")
        f.write("To achieve parity with the Avalonia desktop variant:\n\n")
        f.write("1. Map each web logging statement to its C# equivalent\n")
        f.write("2. Ensure log levels match (INFO ↔ LogLevel.Information, etc.)\n")
        f.write("3. Verify message content and context are equivalent\n")
        f.write("4. Check that structured logging patterns are consistent\n\n")
        
        f.write("### 5. Performance Considerations\n\n")
        f.write("- Avoid logging in hot paths (e.g., per-frame or per-beat execution)\n")
        f.write("- Use conditional logging based on environment (dev vs. prod)\n")
        f.write("- Consider lazy evaluation of log messages to avoid unnecessary string concatenation\n\n")

    def export_json(self, output_file: str) -> None:
        """Export log entries as JSON for programmatic analysis"""
        print(f"📤 Exporting JSON: {output_file}")
        
        data = {
            'metadata': {
                'generated': self._get_timestamp(),
                'total_logs': len(self.log_entries),
                'scanned_directory': str(self.packages_dir),
            },
            'log_entries': [asdict(entry) for entry in self.log_entries]
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        print(f"✅ JSON exported: {output_file}\n")

    def _get_timestamp(self) -> str:
        """Get current timestamp as string"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def main():
    """Main entry point"""
    # Get script directory
    script_dir = Path(__file__).parent.parent
    
    print("=" * 70)
    print("  Musical Conductor Logging Scanner")
    print("=" * 70)
    print()
    
    # Initialize scanner
    scanner = MusicalConductorLoggingScanner(str(script_dir))
    
    # Scan directory
    scanner.scan_directory()
    
    # Generate reports
    output_dir = script_dir / "migration_tools" / "output"
    output_dir.mkdir(exist_ok=True)
    
    report_file = output_dir / "musical_conductor_logging_report.md"
    json_file = output_dir / "musical_conductor_logging_data.json"
    
    scanner.generate_report(str(report_file))
    scanner.export_json(str(json_file))
    
    print("=" * 70)
    print("✅ Scan complete!")
    print(f"📄 Report: {report_file}")
    print(f"📊 Data: {json_file}")
    print("=" * 70)


if __name__ == "__main__":
    main()
