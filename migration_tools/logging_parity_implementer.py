#!/usr/bin/env python3
"""
Logging Parity Implementer

This script reads the gap analysis JSON and automatically implements missing
logging statements in the desktop C# codebase. It generates properly formatted
ILogger calls with structured logging.

Features:
- Smart file location matching (web paths → desktop equivalents)
- Severity mapping (INFO → LogInformation, etc.)
- Structured logging parameter extraction
- Safe insertion with backup creation
- Dry-run mode for preview
- Implementation summary report

Usage:
    python logging_parity_implementer.py [--dry-run] [--category CATEGORY] [--priority high|medium|low]
"""

import json
import re
import os
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from collections import defaultdict
import shutil


@dataclass
class LogStatement:
    """Represents a C# logging statement to be added"""
    file_path: str
    line_number: Optional[int]
    method_name: Optional[str]
    severity: str
    message: str
    parameters: List[str]
    original_web_message: str
    gap_type: str
    category: str
    recommendation: str


@dataclass
class ImplementationResult:
    """Result of attempting to implement a log statement"""
    success: bool
    log_statement: LogStatement
    inserted_code: Optional[str] = None
    error_message: Optional[str] = None
    file_created: bool = False
    skipped_reason: Optional[str] = None


class LoggingParityImplementer:
    """Automatically implements missing logging statements in desktop C# code"""
    
    def __init__(self, workspace_root: str, dry_run: bool = False):
        self.workspace_root = Path(workspace_root)
        self.desktop_root = self.workspace_root / "src" / "MusicalConductor.Avalonia"
        self.gaps_file = self.workspace_root / "migration_tools" / "output" / "logging_parity_gaps.json"
        self.dry_run = dry_run
        self.results: List[ImplementationResult] = []
        
        # Severity mapping
        self.severity_map = {
            "INFO": "LogInformation",
            "WARN": "LogWarning",
            "ERROR": "LogError",
            "DEBUG": "LogDebug",
            "TRACE": "LogTrace"
        }
        
        # File path mapping (web → desktop)
        self.file_map = {
            "MusicalConductor.ts": "MusicalConductor.Core/Conductor.cs",
            "EventBus.ts": "MusicalConductor.Core/EventBus.cs",
            "SequenceExecutor.ts": "MusicalConductor.Core/SequenceExecutor.cs",
            "ExecutionQueue.ts": "MusicalConductor.Core/ExecutionQueue.cs",
            "PluginManager.ts": "MusicalConductor.Core/PluginManager.cs",
            "DataBaton.ts": "MusicalConductor.Core/DataBaton.cs",
            "BeatMetadata.ts": "MusicalConductor.Core/BeatMetadata.cs",
            "SequenceRegistry.ts": "MusicalConductor.Core/SequenceRegistry.cs",
        }
        
        # Categories we should skip (CLI/tooling)
        self.skip_categories = {"CLILogger", "knowledge-cli", "test"}
        
    def load_gaps(self) -> List[Dict]:
        """Load gap analysis JSON"""
        print(f"📖 Loading gap analysis from: {self.gaps_file}")
        
        if not self.gaps_file.exists():
            raise FileNotFoundError(f"Gap analysis file not found: {self.gaps_file}")
        
        with open(self.gaps_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        gaps = data.get('gaps', [])
        print(f"✅ Loaded {len(gaps)} gaps")
        return gaps
    
    def filter_gaps(self, gaps: List[Dict], category: Optional[str] = None, 
                    priority: Optional[str] = None) -> List[Dict]:
        """Filter gaps by category and priority"""
        filtered = gaps
        
        # Filter by category
        if category:
            filtered = [g for g in filtered if g['category'].lower() == category.lower()]
            print(f"🔍 Filtered to category '{category}': {len(filtered)} gaps")
        
        # Filter by priority
        if priority:
            priority_categories = self._get_priority_categories(priority)
            filtered = [g for g in filtered if g['category'] in priority_categories]
            print(f"🔍 Filtered to {priority} priority: {len(filtered)} gaps")
        
        # Skip CLI/test categories
        filtered = [g for g in filtered 
                   if not any(skip in g.get('web_location', '') for skip in self.skip_categories)]
        
        print(f"✅ Processing {len(filtered)} gaps after filters")
        return filtered
    
    def _get_priority_categories(self, priority: str) -> List[str]:
        """Get categories for a given priority level"""
        if priority.lower() == "high":
            return ["Conductor", "EventBus", "SequenceExecution", "ExecutionQueue"]
        elif priority.lower() == "medium":
            return ["PluginManagement", "Monitoring", "Resources"]
        elif priority.lower() == "low":
            return ["Logging", "Validation", "Strictmode"]
        return []
    
    def parse_gap_to_log_statement(self, gap: Dict) -> Optional[LogStatement]:
        """Convert gap JSON to LogStatement object"""
        
        # Skip if not actionable
        if gap['gap_type'] == 'missing_category':
            # These need new files/classes created
            return None
        
        # Extract from nested 'web' object
        web_data = gap.get('web', {})
        web_location = web_data.get('file', '') + ':' + str(web_data.get('line', 0))
        message = web_data.get('message', '')
        severity = web_data.get('severity', 'INFO')
        category = gap.get('category', 'Other')
        recommendation = gap.get('recommendation', '')
        
        # Extract file name from web location
        match = re.search(r'([^/]+\.ts):\d+', web_location)
        if not match:
            return None
        
        web_file = match.group(1)
        
        # Map to desktop file
        desktop_file = self.file_map.get(web_file)
        if not desktop_file:
            # Try to infer from recommendation
            rec_match = re.search(r'to ([\w./]+\.cs)', recommendation)
            if rec_match:
                desktop_file = rec_match.group(1)
            else:
                return None
        
        # Clean message and extract parameters
        cleaned_message, parameters = self._parse_message(message)
        
        return LogStatement(
            file_path=desktop_file,
            line_number=None,  # Will determine insertion point
            method_name=None,  # Will infer from context
            severity=severity,
            message=cleaned_message,
            parameters=parameters,
            original_web_message=message,
            gap_type=gap['gap_type'],
            category=category,
            recommendation=recommendation
        )
    
    def _parse_message(self, message: str) -> Tuple[str, List[str]]:
        """
        Parse message and extract structured logging parameters
        
        Examples:
            "Processing sequence: mySeq" → ("Processing sequence: {SequenceName}", ["sequenceName"])
            "Beat 5 completed" → ("Beat {BeatNumber} completed", ["beatNumber"])
        """
        # Remove emojis
        message = re.sub(r'[^\w\s:.,!?()\[\]{}\-_=+<>/\\|@#$%^&*`~"\']', '', message)
        message = message.strip()
        
        # Remove quotes and normalize
        message = message.replace('`', '').replace('"', '').replace("'", '')
        
        parameters = []
        
        # Extract template literals: ${variableName} or ${expression}
        # Handle both simple variables and complex expressions
        template_pattern = r'\$\{([^}]+)\}'
        
        def replace_template(match):
            expr = match.group(1)
            
            # Handle ternary: ${enabled ? "enabled" : "disabled"}
            if '?' in expr:
                # Extract variable name before ?
                var_match = re.match(r'(\w+)\s*\?', expr)
                if var_match:
                    var_name = var_match.group(1)
                    param_name = self._to_pascal_case(var_name)
                    parameters.append(var_name)
                    return f'{{{param_name}}}'
                return '{Value}'
            
            # Handle property access: ${request.sequenceName}
            if '.' in expr:
                parts = expr.split('.')
                if len(parts) >= 2:
                    prop_name = parts[-1]  # Get last part (property)
                    param_name = self._to_pascal_case(prop_name)
                    parameters.append(prop_name)
                    return f'{{{param_name}}}'
            
            # Simple variable
            if re.match(r'^\w+$', expr):
                var_name = expr
                param_name = self._to_pascal_case(var_name)
                parameters.append(var_name)
                return f'{{{param_name}}}'
            
            # Fallback for complex expressions
            return '{Value}'
        
        message = re.sub(template_pattern, replace_template, message)
        
        # Detect numeric values that might be parameters
        # e.g., "Beat 5 started" could be "Beat {BeatNumber} started"
        if not parameters:
            # Look for patterns like: "word number" or "word: value"
            patterns = [
                (r'\b(\w+)\s+(\d+)\b', r'\1 {NumberValue}'),
                (r'\b(\w+):\s*(\d+)\b', r'\1: {Value}'),
            ]
            for pattern, replacement in patterns:
                if re.search(pattern, message):
                    # Extract potential parameter name
                    match = re.search(pattern, message)
                    if match:
                        context_word = match.group(1)
                        param = self._to_camel_case(context_word) + "Value"
                        parameters.append(param)
                        message = re.sub(pattern, replacement, message, count=1)
                        break
        
        return message, parameters
    
    def _to_pascal_case(self, snake_str: str) -> str:
        """Convert snake_case or camelCase to PascalCase"""
        if '_' in snake_str:
            return ''.join(word.capitalize() for word in snake_str.split('_'))
        # Already camelCase, just capitalize first letter
        return snake_str[0].upper() + snake_str[1:] if snake_str else ''
    
    def _to_camel_case(self, text: str) -> str:
        """Convert text to camelCase"""
        words = re.findall(r'\w+', text)
        if not words:
            return text
        return words[0].lower() + ''.join(w.capitalize() for w in words[1:])
    
    def generate_csharp_code(self, stmt: LogStatement, indent: str = "            ") -> str:
        """Generate C# ILogger statement"""
        
        log_method = self.severity_map.get(stmt.severity, "LogInformation")
        
        # Build parameter list
        if stmt.parameters:
            # Use placeholder syntax for now (implementer will need to map to actual variables)
            param_list = ", ".join(f"/* TODO: map to actual variable */ {p}" for p in stmt.parameters)
            code = f'{indent}_logger.{log_method}("{stmt.message}", {param_list});'
        else:
            code = f'{indent}_logger.{log_method}("{stmt.message}");'
        
        # Add comment with original web message for reference
        if stmt.original_web_message != stmt.message:
            comment = f"{indent}// Original web: {stmt.original_web_message[:80]}"
            code = f"{comment}\n{code}"
        
        return code
    
    def find_insertion_point(self, file_path: Path, stmt: LogStatement) -> Optional[Tuple[int, str]]:
        """
        Find appropriate insertion point in C# file
        Returns: (line_number, indent_string) or None
        """
        
        if not file_path.exists():
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Strategy: Look for existing logging statements in similar context
        # For now, find the end of the first public method as insertion point
        
        in_method = False
        method_indent = ""
        last_method_line = 0
        
        for i, line in enumerate(lines):
            # Detect method start
            if re.match(r'\s+(public|private|protected|internal).+\(.*\)', line):
                in_method = True
                method_indent = re.match(r'(\s+)', line).group(1) if re.match(r'(\s+)', line) else "        "
                continue
            
            # Detect method end (closing brace at same indent as method)
            if in_method and re.match(rf'^{method_indent}\}}', line):
                last_method_line = i
                in_method = False
                # Insert before the closing brace
                return (i, method_indent + "    ")
        
        # Fallback: end of class (before last closing brace)
        for i in range(len(lines) - 1, -1, -1):
            if '}' in lines[i]:
                return (i, "        ")
        
        return None
    
    def implement_log_statement(self, stmt: LogStatement) -> ImplementationResult:
        """Implement a single log statement in the desktop codebase"""
        
        desktop_file = self.desktop_root / stmt.file_path
        
        # Check if file exists
        if not desktop_file.exists():
            return ImplementationResult(
                success=False,
                log_statement=stmt,
                error_message=f"File not found: {desktop_file}",
                skipped_reason="file_not_found"
            )
        
        # Create backup
        if not self.dry_run:
            backup_file = desktop_file.with_suffix('.cs.backup')
            shutil.copy2(desktop_file, backup_file)
        
        # Find insertion point
        insertion = self.find_insertion_point(desktop_file, stmt)
        if not insertion:
            return ImplementationResult(
                success=False,
                log_statement=stmt,
                error_message="Could not determine insertion point",
                skipped_reason="no_insertion_point"
            )
        
        line_num, indent = insertion
        
        # Generate code
        code = self.generate_csharp_code(stmt, indent)
        
        if self.dry_run:
            return ImplementationResult(
                success=True,
                log_statement=stmt,
                inserted_code=code
            )
        
        # Insert code
        try:
            with open(desktop_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Insert new log statement
            lines.insert(line_num, code + '\n\n')
            
            with open(desktop_file, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            
            return ImplementationResult(
                success=True,
                log_statement=stmt,
                inserted_code=code
            )
        
        except Exception as e:
            return ImplementationResult(
                success=False,
                log_statement=stmt,
                error_message=str(e)
            )
    
    def run(self, category: Optional[str] = None, priority: Optional[str] = None):
        """Run the implementation process"""
        
        print("=" * 80)
        print("🎼 Logging Parity Implementer")
        print("=" * 80)
        print(f"Mode: {'DRY RUN' if self.dry_run else 'LIVE IMPLEMENTATION'}")
        print(f"Desktop root: {self.desktop_root}")
        print()
        
        # Load and filter gaps
        gaps = self.load_gaps()
        filtered_gaps = self.filter_gaps(gaps, category, priority)
        
        print()
        print("=" * 80)
        print("🔧 Processing Gaps")
        print("=" * 80)
        
        # Parse gaps into log statements
        log_statements = []
        for gap in filtered_gaps:
            stmt = self.parse_gap_to_log_statement(gap)
            if stmt:
                log_statements.append(stmt)
        
        print(f"✅ Parsed {len(log_statements)} actionable log statements")
        print()
        
        # Group by file
        by_file = defaultdict(list)
        for stmt in log_statements:
            by_file[stmt.file_path].append(stmt)
        
        print(f"📁 Will modify {len(by_file)} files:")
        for file_path, stmts in sorted(by_file.items()):
            print(f"   - {file_path}: {len(stmts)} statement(s)")
        print()
        
        # Implement each statement
        for i, stmt in enumerate(log_statements, 1):
            print(f"[{i}/{len(log_statements)}] Processing: {stmt.file_path}")
            result = self.implement_log_statement(stmt)
            self.results.append(result)
            
            if result.success:
                print(f"   ✅ {'Would add' if self.dry_run else 'Added'}: {stmt.severity} log")
                if self.dry_run:
                    print(f"   📝 Code preview:")
                    for line in result.inserted_code.split('\n'):
                        print(f"      {line}")
            else:
                print(f"   ⚠️  Skipped: {result.error_message or result.skipped_reason}")
            print()
        
        # Generate summary
        self._print_summary()
        self._save_implementation_report()
    
    def _print_summary(self):
        """Print implementation summary"""
        
        print()
        print("=" * 80)
        print("📊 Implementation Summary")
        print("=" * 80)
        
        total = len(self.results)
        successful = sum(1 for r in self.results if r.success)
        failed = sum(1 for r in self.results if not r.success)
        
        print(f"Total statements processed: {total}")
        print(f"✅ Successfully {'would be added' if self.dry_run else 'added'}: {successful}")
        print(f"⚠️  Skipped/Failed: {failed}")
        print()
        
        if failed > 0:
            print("Failed/Skipped breakdown:")
            skip_reasons = defaultdict(int)
            for r in self.results:
                if not r.success:
                    reason = r.skipped_reason or r.error_message
                    skip_reasons[reason] += 1
            
            for reason, count in sorted(skip_reasons.items(), key=lambda x: -x[1]):
                print(f"   - {reason}: {count}")
            print()
        
        # By file summary
        by_file = defaultdict(int)
        for r in self.results:
            if r.success:
                by_file[r.log_statement.file_path] += 1
        
        if by_file:
            print("Statements added by file:")
            for file_path, count in sorted(by_file.items(), key=lambda x: -x[1]):
                print(f"   - {file_path}: {count}")
            print()
        
        if not self.dry_run:
            print("💾 Backup files created with .backup extension")
            print("🔧 Next steps:")
            print("   1. Review generated code in modified files")
            print("   2. Map TODO comments to actual variables")
            print("   3. Build the project: dotnet build")
            print("   4. Fix any compilation errors")
            print("   5. Test logging output")
    
    def _save_implementation_report(self):
        """Save detailed implementation report"""
        
        output_dir = self.workspace_root / "migration_tools" / "output"
        report_file = output_dir / "logging_implementation_report.md"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("# Logging Parity Implementation Report\n\n")
            f.write(f"**Mode:** {'DRY RUN' if self.dry_run else 'LIVE IMPLEMENTATION'}\n\n")
            f.write(f"**Date:** {self._get_timestamp()}\n\n")
            
            # Summary
            total = len(self.results)
            successful = sum(1 for r in self.results if r.success)
            failed = total - successful
            
            f.write("## Summary\n\n")
            f.write(f"- **Total Statements:** {total}\n")
            f.write(f"- **Successfully Added:** {successful}\n")
            f.write(f"- **Skipped/Failed:** {failed}\n\n")
            
            # By file
            by_file = defaultdict(list)
            for r in self.results:
                by_file[r.log_statement.file_path].append(r)
            
            f.write("## Changes by File\n\n")
            for file_path in sorted(by_file.keys()):
                results = by_file[file_path]
                successful_count = sum(1 for r in results if r.success)
                f.write(f"### {file_path}\n\n")
                f.write(f"**Statements Added:** {successful_count}/{len(results)}\n\n")
                
                for r in results:
                    if r.success:
                        f.write(f"✅ **{r.log_statement.severity}** - {r.log_statement.category}\n")
                        f.write(f"```csharp\n{r.inserted_code}\n```\n\n")
                    else:
                        f.write(f"⚠️ **Skipped:** {r.error_message or r.skipped_reason}\n")
                        f.write(f"   - Message: {r.log_statement.message}\n\n")
            
            # Next steps
            if not self.dry_run:
                f.write("## Next Steps\n\n")
                f.write("1. Review generated code in modified files\n")
                f.write("2. Search for `TODO: map to actual variable` comments\n")
                f.write("3. Replace placeholders with actual variable references\n")
                f.write("4. Build the project: `dotnet build`\n")
                f.write("5. Fix any compilation errors\n")
                f.write("6. Test logging output in runtime\n")
                f.write("7. Re-run parity analyzer to verify gap reduction\n\n")
        
        print(f"📄 Detailed report saved to: {report_file}")
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Automatically implement missing logging statements in desktop C# code"
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without modifying files'
    )
    parser.add_argument(
        '--category',
        type=str,
        help='Filter to specific category (e.g., Conductor, EventBus)'
    )
    parser.add_argument(
        '--priority',
        type=str,
        choices=['high', 'medium', 'low'],
        help='Filter by priority level'
    )
    
    args = parser.parse_args()
    
    # Get workspace root (parent of migration_tools)
    script_dir = Path(__file__).parent
    workspace_root = script_dir.parent
    
    # Run implementer
    implementer = LoggingParityImplementer(
        workspace_root=str(workspace_root),
        dry_run=args.dry_run
    )
    
    implementer.run(
        category=args.category,
        priority=args.priority
    )


if __name__ == '__main__':
    main()
