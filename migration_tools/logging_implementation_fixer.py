#!/usr/bin/env python3
"""
Logging Implementation Fixer

This script intelligently fixes the TODO placeholders in auto-generated logging
statements by analyzing the code context and mapping parameters to actual variables.

Features:
- Analyzes method signatures and local variables
- Maps placeholder parameters to actual variable names
- Moves misplaced log statements to appropriate methods
- Removes log statements that don't have proper context
- Smart context-aware variable detection

Usage:
    python logging_implementation_fixer.py [--dry-run]
"""

import re
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass


@dataclass
class LogStatementFix:
    """Represents a fix for a logging statement"""
    file_path: Path
    line_number: int
    original_line: str
    fixed_line: Optional[str]
    action: str  # "fix", "move", "remove"
    reason: str


class LoggingImplementationFixer:
    """Fixes auto-generated logging statements"""
    
    def __init__(self, workspace_root: str, dry_run: bool = False):
        self.workspace_root = Path(workspace_root)
        self.desktop_root = self.workspace_root / "src" / "MusicalConductor.Avalonia" / "MusicalConductor.Core"
        self.dry_run = dry_run
        self.fixes: List[LogStatementFix] = []
    
    def find_files_with_todos(self) -> List[Path]:
        """Find all .cs files with TODO comments"""
        files = []
        for cs_file in self.desktop_root.rglob("*.cs"):
            with open(cs_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if "TODO: map to actual variable" in content:
                    files.append(cs_file)
        return files
    
    def analyze_file(self, file_path: Path) -> List[LogStatementFix]:
        """Analyze a file and determine fixes for all TODO statements"""
        fixes = []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        for i, line in enumerate(lines, 1):
            if "TODO: map to actual variable" in line:
                fix = self._determine_fix(file_path, i, line, lines)
                if fix:
                    fixes.append(fix)
        
        return fixes
    
    def _determine_fix(self, file_path: Path, line_num: int, line: str, all_lines: List[str]) -> Optional[LogStatementFix]:
        """Determine the appropriate fix for a TODO line"""
        
        # Check if it's in a constructor or method with wrong context
        context = self._get_method_context(line_num, all_lines)
        
        # If in constructor, likely misplaced - remove it
        if context and context['method_name'] in ['EventBus', 'ExecutionQueue', 'Conductor', 'SequenceExecutor']:
            return LogStatementFix(
                file_path=file_path,
                line_number=line_num,
                original_line=line,
                fixed_line=None,
                action="remove",
                reason=f"Misplaced in {context['method_name']} constructor - no context for variables"
            )
        
        # Extract parameter names from TODO comments
        todo_params = re.findall(r'/\* TODO: map to actual variable \*/ (\w+)', line)
        if not todo_params:
            return None
        
        # Get available variables in scope
        available_vars = self._get_available_variables(line_num, all_lines, context)
        
        # Try to map each TODO parameter
        fixed_line = line
        all_mapped = True
        
        for param in todo_params:
            mapped_var = self._find_matching_variable(param, available_vars)
            if mapped_var:
                # Replace the TODO comment with the actual variable
                pattern = rf'/\* TODO: map to actual variable \*/ {param}'
                fixed_line = re.sub(pattern, mapped_var, fixed_line)
            else:
                all_mapped = False
        
        if all_mapped:
            return LogStatementFix(
                file_path=file_path,
                line_number=line_num,
                original_line=line,
                fixed_line=fixed_line,
                action="fix",
                reason=f"Mapped {len(todo_params)} parameter(s)"
            )
        else:
            # Can't map all variables - remove the statement
            return LogStatementFix(
                file_path=file_path,
                line_number=line_num,
                original_line=line,
                fixed_line=None,
                action="remove",
                reason="Could not map all variables to available scope"
            )
    
    def _get_method_context(self, line_num: int, lines: List[str]) -> Optional[Dict]:
        """Get the enclosing method/constructor context"""
        # Search backwards for method signature
        for i in range(line_num - 2, max(0, line_num - 50), -1):
            line = lines[i]
            
            # Match method signatures
            match = re.search(r'(public|private|protected|internal)\s+(\w+)\s+(\w+)\s*\((.*?)\)', line)
            if match:
                return {
                    'method_name': match.group(3),
                    'return_type': match.group(2),
                    'parameters': match.group(4),
                    'line': i + 1
                }
            
            # Match constructor
            match = re.search(r'(public|private|protected|internal)\s+(\w+)\s*\((.*?)\)', line)
            if match and not any(keyword in line for keyword in ['class', 'interface', 'struct']):
                return {
                    'method_name': match.group(2),
                    'return_type': 'void',
                    'parameters': match.group(3),
                    'line': i + 1
                }
        
        return None
    
    def _get_available_variables(self, line_num: int, lines: List[str], context: Optional[Dict]) -> List[str]:
        """Get list of available variable names in scope"""
        variables = []
        
        # Get parameters from method signature
        if context and context.get('parameters'):
            params = context['parameters']
            # Extract parameter names
            param_matches = re.findall(r'(\w+)\s+(\w+)(?:,|\))', params + ')')
            variables.extend([m[1] for m in param_matches])
        
        # Get local variables declared before this line
        if context:
            start_line = context['line']
            for i in range(start_line, line_num - 1):
                line = lines[i]
                # Match variable declarations: var x = ..., string y = ..., etc.
                var_matches = re.findall(r'(?:var|string|int|bool|double|object|\w+)\s+(\w+)\s*=', line)
                variables.extend(var_matches)
                
                # Match foreach: foreach (var item in ...)
                foreach_match = re.search(r'foreach\s*\(\s*(?:var|\w+)\s+(\w+)\s+in', line)
                if foreach_match:
                    variables.append(foreach_match.group(1))
        
        # Also check class fields (search for private/public fields in class)
        # Look backwards to find class-level fields
        for i in range(0, min(line_num, len(lines))):
            line = lines[i]
            # Match field declarations
            field_match = re.search(r'private\s+(?:readonly\s+)?(\w+)\s+_(\w+)', line)
            if field_match:
                variables.append(f'_{field_match.group(2)}')
        
        return list(set(variables))
    
    def _find_matching_variable(self, param_name: str, available_vars: List[str]) -> Optional[str]:
        """Find a matching variable name from available variables"""
        param_lower = param_name.lower()
        
        # Direct match (case-insensitive)
        for var in available_vars:
            if var.lower() == param_lower:
                return var
        
        # Partial match (parameter name contained in variable)
        for var in available_vars:
            if param_lower in var.lower() or var.lower() in param_lower:
                return var
        
        # Special mappings
        mappings = {
            'sequencename': ['request.SequenceName', 'request.sequenceName', 'name', 'sequenceName'],
            'eventname': ['name', 'eventName'],
            'signal': ['signal', 'signalName'],
            'enabled': ['enabled', 'isEnabled', 'debug'],
        }
        
        for var in available_vars:
            if param_lower in mappings:
                for candidate in mappings[param_lower]:
                    if candidate.lower() in var.lower():
                        return var
        
        return None
    
    def apply_fixes(self, fixes: List[LogStatementFix]):
        """Apply fixes to files"""
        # Group by file
        by_file = {}
        for fix in fixes:
            if fix.file_path not in by_file:
                by_file[fix.file_path] = []
            by_file[fix.file_path].append(fix)
        
        for file_path, file_fixes in by_file.items():
            self._apply_fixes_to_file(file_path, file_fixes)
    
    def _apply_fixes_to_file(self, file_path: Path, fixes: List[LogStatementFix]):
        """Apply fixes to a single file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Sort fixes by line number in reverse (to avoid line number shifts)
        fixes_sorted = sorted(fixes, key=lambda f: f.line_number, reverse=True)
        
        for fix in fixes_sorted:
            idx = fix.line_number - 1
            
            if fix.action == "fix":
                lines[idx] = fix.fixed_line
                print(f"✅ Fixed line {fix.line_number} in {file_path.name}")
            
            elif fix.action == "remove":
                # Also remove the comment line above if present
                comment_idx = idx - 1
                if comment_idx >= 0 and "// Original web:" in lines[comment_idx]:
                    del lines[comment_idx]
                    del lines[comment_idx]  # Now idx is at comment_idx
                    print(f"🗑️  Removed lines {fix.line_number-1}-{fix.line_number} from {file_path.name}: {fix.reason}")
                else:
                    del lines[idx]
                    print(f"🗑️  Removed line {fix.line_number} from {file_path.name}: {fix.reason}")
                
                # Remove blank line if it creates double blank lines
                if idx < len(lines) and idx > 0 and lines[idx].strip() == "" and lines[idx-1].strip() == "":
                    del lines[idx]
        
        # Write back
        if not self.dry_run:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
    
    def run(self):
        """Run the fixer"""
        print("=" * 80)
        print("🔧 Logging Implementation Fixer")
        print("=" * 80)
        print(f"Mode: {'DRY RUN' if self.dry_run else 'LIVE FIX'}")
        print()
        
        # Find files with TODOs
        files = self.find_files_with_todos()
        print(f"📁 Found {len(files)} file(s) with TODO comments:")
        for f in files:
            print(f"   - {f.relative_to(self.workspace_root)}")
        print()
        
        # Analyze each file
        all_fixes = []
        for file_path in files:
            print(f"🔍 Analyzing {file_path.name}...")
            fixes = self.analyze_file(file_path)
            all_fixes.extend(fixes)
            print(f"   Found {len(fixes)} fix(es)")
        
        print()
        print(f"📊 Total fixes to apply: {len(all_fixes)}")
        print()
        
        # Apply fixes
        if not self.dry_run:
            self.apply_fixes(all_fixes)
            print()
            print("✅ All fixes applied!")
            print("🔨 Next step: Run 'dotnet build' to verify")
        else:
            print("📋 Fix Summary:")
            for fix in all_fixes:
                print(f"\n{fix.file_path.name}:{fix.line_number}")
                print(f"  Action: {fix.action}")
                print(f"  Reason: {fix.reason}")
                if fix.action == "fix":
                    print(f"  Original: {fix.original_line.strip()}")
                    print(f"  Fixed:    {fix.fixed_line.strip()}")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Fix auto-generated logging TODOs")
    parser.add_argument('--dry-run', action='store_true', help='Preview fixes without applying')
    args = parser.parse_args()
    
    script_dir = Path(__file__).parent
    workspace_root = script_dir.parent
    
    fixer = LoggingImplementationFixer(str(workspace_root), dry_run=args.dry_run)
    fixer.run()


if __name__ == '__main__':
    main()
