#!/usr/bin/env python3
"""
Avalonia Musical Conductor Logging Scanner
===========================================
Scans the Avalonia.NET (C#) variant's MusicalConductor for all logging statements
and generates a comprehensive report with ASCII visualization.

This complements the web variant scanner to enable cross-platform parity analysis.

Usage:
    python avalonia_logging_scanner.py
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
    log_type: str  # LogInformation, LogWarning, LogError, etc.
    message: str
    context: str
    severity: str  # Information, Warning, Error, Debug, Trace
    category: str  # ExecutionQueue, SequenceExecutor, PluginManager, etc.
    has_structured_logging: bool  # Uses {ParameterName} syntax


class AvaloniaLoggingScanner:
    """Scans and analyzes logging in the Avalonia MusicalConductor"""

    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.musical_conductor_dir = self.root_dir / "src" / "MusicalConductor.Avalonia"
        self.log_entries: List[LogEntry] = []
        
        # C# logging patterns to match
        self.patterns = [
            # ILogger extension methods
            (r'_logger\.LogInformation\s*\((.*?)(?:\)|;)', 'LogInformation'),
            (r'_logger\.LogWarning\s*\((.*?)(?:\)|;)', 'LogWarning'),
            (r'_logger\.LogError\s*\((.*?)(?:\)|;)', 'LogError'),
            (r'_logger\.LogDebug\s*\((.*?)(?:\)|;)', 'LogDebug'),
            (r'_logger\.LogTrace\s*\((.*?)(?:\)|;)', 'LogTrace'),
            (r'_logger\.LogCritical\s*\((.*?)(?:\)|;)', 'LogCritical'),
            
            # Generic logger.Log calls
            (r'_logger\.Log\s*\((.*?)(?:\)|;)', 'Log'),
            
            # Logger variable (not _logger)
            (r'(?<!_)logger\.LogInformation\s*\((.*?)(?:\)|;)', 'LogInformation'),
            (r'(?<!_)logger\.LogWarning\s*\((.*?)(?:\)|;)', 'LogWarning'),
            (r'(?<!_)logger\.LogError\s*\((.*?)(?:\)|;)', 'LogError'),
            (r'(?<!_)logger\.LogDebug\s*\((.*?)(?:\)|;)', 'LogDebug'),
            (r'(?<!_)logger\.LogTrace\s*\((.*?)(?:\)|;)', 'LogTrace'),
            
            # Console logging (should be avoided but might exist)
            (r'Console\.WriteLine\s*\((.*?)(?:\)|;)', 'Console.WriteLine'),
            (r'Console\.Write\s*\((.*?)(?:\)|;)', 'Console.Write'),
            (r'Console\.Error\.WriteLine\s*\((.*?)(?:\)|;)', 'Console.Error.WriteLine'),
            
            # Debug/Trace logging
            (r'Debug\.WriteLine\s*\((.*?)(?:\)|;)', 'Debug.WriteLine'),
            (r'Trace\.WriteLine\s*\((.*?)(?:\)|;)', 'Trace.WriteLine'),
        ]

    def scan_directory(self) -> None:
        """Recursively scan all C# files in the MusicalConductor.Avalonia directory"""
        print(f"🔍 Scanning {self.musical_conductor_dir}...")
        
        if not self.musical_conductor_dir.exists():
            print(f"❌ Directory not found: {self.musical_conductor_dir}")
            return
        
        cs_files = list(self.musical_conductor_dir.rglob("*.cs"))
        print(f"📁 Found {len(cs_files)} C# files\n")
        
        for file_path in cs_files:
            # Skip obj and bin directories
            if "\\obj\\" in str(file_path) or "\\bin\\" in str(file_path):
                continue
            
            self._scan_file(file_path)
        
        print(f"\n✅ Scan complete! Found {len(self.log_entries)} logging statements\n")

    def _scan_file(self, file_path: Path) -> None:
        """Scan a single C# file for logging statements"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            for line_num, line in enumerate(lines, start=1):
                self._extract_logs_from_line(file_path, line_num, line)
        
        except Exception as e:
            print(f"⚠️ Error reading {file_path}: {e}")

    def _extract_logs_from_line(self, file_path: Path, line_num: int, line: str) -> None:
        """Extract logging statements from a single line"""
        # Skip comments
        stripped = line.strip()
        if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
            return
        
        for pattern, log_method in self.patterns:
            matches = re.finditer(pattern, line, re.IGNORECASE)
            
            for match in matches:
                # Extract message content
                message_content = match.group(1) if match.lastindex >= 1 else ''
                
                # Truncate long messages
                message_preview = message_content.strip()[:120]
                
                # Check for structured logging (uses {ParameterName} syntax)
                has_structured = bool(re.search(r'\{[A-Za-z_][A-Za-z0-9_]*\}', message_content))
                
                # Determine severity
                severity = self._determine_severity(log_method)
                
                # Determine category from file path
                category = self._determine_category(file_path)
                
                # Create log entry
                entry = LogEntry(
                    file_path=str(file_path.relative_to(self.root_dir)),
                    line_number=line_num,
                    log_type=log_method,
                    message=message_preview,
                    context=line.strip(),
                    severity=severity,
                    category=category,
                    has_structured_logging=has_structured
                )
                
                self.log_entries.append(entry)

    def _determine_severity(self, log_method: str) -> str:
        """Determine the severity level based on log method"""
        severity_map = {
            'LogInformation': 'Information',
            'LogWarning': 'Warning',
            'LogError': 'Error',
            'LogDebug': 'Debug',
            'LogTrace': 'Trace',
            'LogCritical': 'Critical',
            'Log': 'Information',
            'Console.WriteLine': 'Information',
            'Console.Write': 'Information',
            'Console.Error.WriteLine': 'Error',
            'Debug.WriteLine': 'Debug',
            'Trace.WriteLine': 'Trace',
        }
        return severity_map.get(log_method, 'Information')

    def _determine_category(self, file_path: Path) -> str:
        """Determine the category/module from file path"""
        parts = file_path.parts
        file_name = file_path.stem
        
        # Extract meaningful category from file name or path
        if 'ExecutionQueue' in file_name:
            return 'ExecutionQueue'
        elif 'SequenceExecutor' in file_name:
            return 'SequenceExecution'
        elif 'Conductor' in file_name and 'Logger' not in file_name:
            return 'Conductor'
        elif 'EventBus' in file_name:
            return 'EventBus'
        elif 'PluginManager' in file_name:
            return 'PluginManagement'
        elif 'SequenceRegistry' in file_name or 'Registry' in file_name:
            return 'SequenceRegistry'
        elif 'Logger' in file_name or 'Logging' in file_name:
            return 'Logging'
        elif 'Validator' in file_name or 'Validation' in file_name:
            return 'Validation'
        elif 'MainWindow' in file_name or 'Sample' in str(file_path):
            return 'Sample'
        elif 'Test' in str(file_path) or file_name.endswith('Tests'):
            return 'Tests'
        elif 'Engine' in str(file_path):
            return 'Engine'
        elif 'Client' in str(file_path):
            return 'Client'
        elif 'Extensions' in str(file_path):
            return 'Extensions'
        else:
            # Try to get from directory structure
            for part in reversed(parts):
                if part in ['Core', 'Interfaces', 'Resources', 'Logging', 'Engine', 
                           'Client', 'Extensions', 'Sample']:
                    return part
        
        return 'Other'

    def generate_report(self, output_file: str) -> None:
        """Generate a comprehensive markdown report"""
        print(f"📝 Generating report: {output_file}")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Avalonia Musical Conductor Logging Analysis Report\n\n")
            f.write(f"**Platform:** Avalonia.NET (C#)\n\n")
            f.write(f"**Generated:** {self._get_timestamp()}\n\n")
            f.write(f"**Total Logging Statements:** {len(self.log_entries)}\n\n")
            
            # Table of Contents
            f.write("## Table of Contents\n\n")
            f.write("1. [Executive Summary](#executive-summary)\n")
            f.write("2. [ASCII Visualization](#ascii-visualization)\n")
            f.write("3. [Statistics by Category](#statistics-by-category)\n")
            f.write("4. [Statistics by Severity](#statistics-by-severity)\n")
            f.write("5. [Statistics by Log Type](#statistics-by-log-type)\n")
            f.write("6. [Structured Logging Analysis](#structured-logging-analysis)\n")
            f.write("7. [Top Logging Files](#top-logging-files)\n")
            f.write("8. [Detailed Log Inventory](#detailed-log-inventory)\n")
            f.write("9. [Recommendations](#recommendations)\n")
            f.write("10. [Web Variant Comparison](#web-variant-comparison)\n\n")
            
            # Executive Summary
            self._write_executive_summary(f)
            
            # ASCII Visualization
            self._write_ascii_visualization(f)
            
            # Statistics
            self._write_statistics(f)
            
            # Structured logging analysis
            self._write_structured_logging_analysis(f)
            
            # Detailed inventory
            self._write_detailed_inventory(f)
            
            # Recommendations
            self._write_recommendations(f)
            
            # Web comparison
            self._write_web_comparison(f)
        
        print(f"✅ Report generated: {output_file}\n")

    def _write_executive_summary(self, f) -> None:
        """Write executive summary section"""
        f.write("## Executive Summary\n\n")
        
        # Count by severity
        severity_counts = Counter(entry.severity for entry in self.log_entries)
        category_counts = Counter(entry.category for entry in self.log_entries)
        structured_count = sum(1 for e in self.log_entries if e.has_structured_logging)
        
        f.write("### Overview\n\n")
        f.write(f"The Avalonia Musical Conductor contains **{len(self.log_entries)}** logging statements ")
        f.write(f"across **{len(set(e.file_path for e in self.log_entries))}** files.\n\n")
        
        f.write("### Severity Breakdown\n\n")
        for severity in ['Critical', 'Error', 'Warning', 'Information', 'Debug', 'Trace']:
            count = severity_counts.get(severity, 0)
            percentage = (count / len(self.log_entries) * 100) if self.log_entries else 0
            f.write(f"- **{severity}:** {count} ({percentage:.1f}%)\n")
        
        f.write("\n### Top Categories\n\n")
        for category, count in category_counts.most_common(5):
            percentage = (count / len(self.log_entries) * 100) if self.log_entries else 0
            f.write(f"- **{category}:** {count} ({percentage:.1f}%)\n")
        
        f.write(f"\n### Structured Logging\n\n")
        f.write(f"- **Statements using structured logging:** {structured_count} ({structured_count/len(self.log_entries)*100:.1f}%)\n")
        f.write(f"- **Statements using string interpolation:** {len(self.log_entries) - structured_count} ({(len(self.log_entries) - structured_count)/len(self.log_entries)*100:.1f}%)\n")
        
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
            'Critical': '🔥',
            'Error': '🔴',
            'Warning': '🟡',
            'Information': '🔵',
            'Debug': '🟢',
            'Trace': '⚪'
        }
        
        for severity in ['Critical', 'Error', 'Warning', 'Information', 'Debug', 'Trace']:
            count = severity_counts.get(severity, 0)
            bar_length = int((count / max_count) * 50) if count > 0 else 0
            bar = '█' * bar_length
            icon = severity_colors.get(severity, '⚪')
            f.write(f"{icon} {severity:11} │{bar} {count}\n")
        
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
            display_path = file_path.split('\\')[-1][:35]
            f.write(f"{display_path:37} │{bar} {count}\n")
        
        f.write("```\n\n")
        
        # Log type distribution
        f.write("### Logging Method Distribution\n\n")
        f.write("```\n")
        
        type_counts = Counter(entry.log_type for entry in self.log_entries)
        max_count = max(type_counts.values()) if type_counts else 1
        
        for log_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
            bar_length = int((count / max_count) * 40)
            bar = '░' * bar_length
            f.write(f"{log_type:30} │{bar} {count}\n")
        
        f.write("```\n\n")
        
        # Structured logging visualization
        f.write("### Structured vs Non-Structured Logging\n\n")
        f.write("```\n")
        
        structured_count = sum(1 for e in self.log_entries if e.has_structured_logging)
        non_structured_count = len(self.log_entries) - structured_count
        
        max_val = max(structured_count, non_structured_count)
        structured_bar = '█' * int((structured_count / max_val) * 50) if structured_count > 0 else ''
        non_structured_bar = '█' * int((non_structured_count / max_val) * 50) if non_structured_count > 0 else ''
        
        f.write(f"✅ Structured {{param}}   │{structured_bar} {structured_count}\n")
        f.write(f"⚠️  Non-structured       │{non_structured_bar} {non_structured_count}\n")
        
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
        
        for severity in ['Critical', 'Error', 'Warning', 'Information', 'Debug', 'Trace']:
            count = severity_counts.get(severity, 0)
            percentage = (count / len(self.log_entries) * 100) if self.log_entries else 0
            f.write(f"| {severity} | {count} | {percentage:.1f}% |\n")
        
        f.write("\n")
        
        # Statistics by Log Type
        f.write("## Statistics by Log Type\n\n")
        type_counts = Counter(entry.log_type for entry in self.log_entries)
        
        f.write("| Log Method | Count | Percentage |\n")
        f.write("|------------|-------|------------|\n")
        
        for log_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / len(self.log_entries) * 100) if self.log_entries else 0
            f.write(f"| `{log_type}` | {count} | {percentage:.1f}% |\n")
        
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

    def _write_structured_logging_analysis(self, f) -> None:
        """Write structured logging analysis"""
        f.write("## Structured Logging Analysis\n\n")
        
        structured_count = sum(1 for e in self.log_entries if e.has_structured_logging)
        non_structured_count = len(self.log_entries) - structured_count
        
        f.write("### Overview\n\n")
        f.write(f"Microsoft's ILogger supports **structured logging** using `{{ParameterName}}` syntax, ")
        f.write(f"which provides better performance and queryability compared to string interpolation.\n\n")
        
        f.write(f"- **Structured:** {structured_count} ({structured_count/len(self.log_entries)*100:.1f}%)\n")
        f.write(f"- **Non-structured:** {non_structured_count} ({non_structured_count/len(self.log_entries)*100:.1f}%)\n\n")
        
        if structured_count > non_structured_count:
            f.write("✅ **Good practice:** Majority of logging uses structured logging.\n\n")
        else:
            f.write("⚠️ **Recommendation:** Consider migrating to structured logging for better performance.\n\n")
        
        # Breakdown by category
        f.write("### Structured Logging by Category\n\n")
        f.write("| Category | Structured | Non-Structured | % Structured |\n")
        f.write("|----------|------------|----------------|-------------|\n")
        
        category_structured = defaultdict(int)
        category_total = defaultdict(int)
        
        for entry in self.log_entries:
            category_total[entry.category] += 1
            if entry.has_structured_logging:
                category_structured[entry.category] += 1
        
        for category in sorted(category_total.keys()):
            structured = category_structured[category]
            total = category_total[category]
            non_structured = total - structured
            pct = (structured / total * 100) if total > 0 else 0
            f.write(f"| {category} | {structured} | {non_structured} | {pct:.1f}% |\n")
        
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
                
                f.write("| Line | Severity | Method | Structured | Message Preview |\n")
                f.write("|------|----------|--------|------------|----------------|\n")
                
                for entry in file_entries:
                    message_preview = entry.message[:50].replace('|', '\\|')
                    structured_icon = "✅" if entry.has_structured_logging else "❌"
                    f.write(f"| {entry.line_number} | {entry.severity} | `{entry.log_type}` | {structured_icon} | {message_preview}... |\n")
                
                f.write("\n")

    def _write_recommendations(self, f) -> None:
        """Write recommendations based on analysis"""
        f.write("## Recommendations\n\n")
        
        f.write("### 1. Logging Standardization\n\n")
        
        # Analyze usage of Console.* or Debug.*
        console_count = sum(1 for e in self.log_entries if 'Console' in e.log_type or 'Debug' in e.log_type or 'Trace' in e.log_type)
        ilogger_count = len(self.log_entries) - console_count
        
        f.write(f"- **ILogger logging:** {ilogger_count} statements ({ilogger_count/len(self.log_entries)*100:.1f}%)\n")
        f.write(f"- **Console/Debug/Trace:** {console_count} statements ({console_count/len(self.log_entries)*100:.1f}%)\n\n")
        
        if console_count > 0:
            f.write("⚠️ **Recommendation:** Migrate all `Console.*`, `Debug.*`, and `Trace.*` calls to ILogger ")
            f.write("for consistent logging, better control, and production readiness.\n\n")
        else:
            f.write("✅ **Excellent:** All logging uses the standard ILogger interface.\n\n")
        
        f.write("### 2. Structured Logging\n\n")
        
        structured_count = sum(1 for e in self.log_entries if e.has_structured_logging)
        structured_pct = (structured_count / len(self.log_entries) * 100) if self.log_entries else 0
        
        if structured_pct < 80:
            f.write(f"⚠️ **Recommendation:** Increase structured logging adoption (currently {structured_pct:.1f}%). ")
            f.write("Use `_logger.LogInformation(\"Message {Param}\", value)` instead of string interpolation ")
            f.write("for better performance and queryability.\n\n")
        else:
            f.write(f"✅ **Good practice:** High adoption of structured logging ({structured_pct:.1f}%).\n\n")
        
        f.write("### 3. Severity Distribution\n\n")
        
        severity_counts = Counter(entry.severity for entry in self.log_entries)
        error_count = severity_counts.get('Error', 0)
        warning_count = severity_counts.get('Warning', 0)
        info_count = severity_counts.get('Information', 0)
        
        if info_count > (error_count + warning_count) * 3:
            f.write("⚠️ **Observation:** High volume of Information-level logging may impact performance. ")
            f.write("Consider using Debug level for verbose logging and adding log level filtering.\n\n")
        
        f.write("### 4. Category-Specific Recommendations\n\n")
        
        category_counts = Counter(entry.category for entry in self.log_entries)
        
        if category_counts:
            top_category, top_count = category_counts.most_common(1)[0]
            f.write(f"- **{top_category}** has the most logging ({top_count} statements). ")
            f.write("Verify this level of instrumentation is appropriate.\n\n")
        
        f.write("### 5. Production Considerations\n\n")
        f.write("- Configure log levels appropriately for different environments (Debug in dev, Warning+ in prod)\n")
        f.write("- Use dependency injection for ILogger<T> throughout the codebase\n")
        f.write("- Consider implementing log scopes for better context tracking\n")
        f.write("- Ensure structured logging parameters don't contain sensitive data\n\n")

    def _write_web_comparison(self, f) -> None:
        """Write comparison section with web variant"""
        f.write("## Web Variant Comparison\n\n")
        
        f.write("### Platform-Specific Differences\n\n")
        
        f.write("| Aspect | Avalonia (C#) | Web (TypeScript) |\n")
        f.write("|--------|---------------|------------------|\n")
        f.write("| Primary API | `ILogger<T>` | `console.*` / `ctx.logger.*` |\n")
        f.write("| Structured Logging | ✅ Native support | ⚠️ Limited |\n")
        f.write("| Log Levels | Trace, Debug, Information, Warning, Error, Critical | log, info, warn, error, debug |\n")
        f.write("| Async Logging | ✅ Yes | ✅ Yes |\n")
        f.write("| Dependency Injection | ✅ Yes | ⚠️ Manual |\n")
        f.write("| Production Ready | ✅ Yes | ⚠️ Needs abstraction |\n\n")
        
        f.write("### Parity Considerations\n\n")
        f.write("To achieve logging parity between variants:\n\n")
        f.write("1. **Message Content:** Ensure equivalent log messages exist in both platforms\n")
        f.write("2. **Severity Mapping:**\n")
        f.write("   - `LogInformation` ↔ `console.log` / `logger.info`\n")
        f.write("   - `LogWarning` ↔ `console.warn` / `logger.warn`\n")
        f.write("   - `LogError` ↔ `console.error` / `logger.error`\n")
        f.write("   - `LogDebug` ↔ `console.debug` / `logger.debug`\n")
        f.write("3. **Context:** Match structured logging parameters with web logging context\n")
        f.write("4. **Icons/Emojis:** Maintain consistent use of Unicode symbols (🎼, ✅, ❌, etc.)\n\n")
        
        f.write("### Next Steps\n\n")
        f.write("1. Run both scanners (web and Avalonia) to generate complete inventories\n")
        f.write("2. Use the JSON outputs to programmatically compare logging statements\n")
        f.write("3. Create a mapping document between equivalent log statements\n")
        f.write("4. Implement missing log statements in either variant\n")
        f.write("5. Standardize message formats and severity levels\n\n")

    def export_json(self, output_file: str) -> None:
        """Export log entries as JSON for programmatic analysis"""
        print(f"📤 Exporting JSON: {output_file}")
        
        data = {
            'metadata': {
                'platform': 'Avalonia.NET (C#)',
                'generated': self._get_timestamp(),
                'total_logs': len(self.log_entries),
                'scanned_directory': str(self.musical_conductor_dir),
                'structured_logging_count': sum(1 for e in self.log_entries if e.has_structured_logging),
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
    print("  Avalonia Musical Conductor Logging Scanner")
    print("=" * 70)
    print()
    
    # Initialize scanner
    scanner = AvaloniaLoggingScanner(str(script_dir))
    
    # Scan directory
    scanner.scan_directory()
    
    # Generate reports
    output_dir = script_dir / "migration_tools" / "output"
    output_dir.mkdir(exist_ok=True)
    
    report_file = output_dir / "avalonia_logging_report.md"
    json_file = output_dir / "avalonia_logging_data.json"
    
    scanner.generate_report(str(report_file))
    scanner.export_json(str(json_file))
    
    print("=" * 70)
    print("✅ Scan complete!")
    print(f"📄 Report: {report_file}")
    print(f"📊 Data: {json_file}")
    print("=" * 70)


if __name__ == "__main__":
    main()
