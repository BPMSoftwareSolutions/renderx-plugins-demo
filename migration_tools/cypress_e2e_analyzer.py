#!/usr/bin/env python3
"""
Cypress E2E Tests Analyzer

A Python script that analyzes Cypress E2E test files and generates an ASCII visualization
of their structure, test scenarios, assertions, and characteristics.

Usage:
    python cypress_e2e_analyzer.py [cypress-directory] [options]

Options:
    --output FILE         : Save output to file instead of printing to console
    --detailed           : Show detailed test analysis
    --categories         : Group tests by categories
    --scenarios          : Show test scenarios and assertions
    --format FORMAT      : Output format (tree, table, summary) - default: tree

Examples:
    python cypress_e2e_analyzer.py ./cypress
    python cypress_e2e_analyzer.py ./cypress --detailed --scenarios
    python cypress_e2e_analyzer.py ./cypress --format table --output e2e_analysis.txt
"""

import os
import sys
import argparse
import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple
from collections import defaultdict
import fnmatch


class CypressTest:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.name = file_path.stem.replace('.cy', '')
        self.content = ""
        self.description = ""
        self.test_suites = []
        self.test_cases = []
        self.imports = []
        self.selectors = []
        self.assertions = []
        self.commands = []
        self.hooks = []
        self.line_count = 0
        self.category = ""
        self.complexity_score = 0
        self.has_api_calls = False
        self.has_db_operations = False
        self.has_file_operations = False
        self.custom_commands = []
        
        self._analyze()
    
    def _analyze(self):
        """Analyze the Cypress test file for various characteristics."""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                self.content = f.read()
            
            self.line_count = len(self.content.splitlines())
            self._extract_description()
            self._extract_test_structure()
            self._extract_imports()
            self._extract_selectors()
            self._extract_assertions()
            self._extract_commands()
            self._extract_hooks()
            self._determine_category()
            self._calculate_complexity()
            self._check_api_operations()
            self._extract_custom_commands()
            
        except Exception as e:
            print(f"Warning: Could not analyze {self.file_path}: {e}")
    
    def _extract_description(self):
        """Extract test description from comments."""
        # Look for description in top-level comments
        comment_match = re.search(r'//\s*(.+?)(?:\n|$)', self.content)
        if comment_match:
            self.description = comment_match.group(1).strip()
        
        # Look for multiline comment descriptions
        multiline_match = re.search(r'/\*\*(.*?)\*/', self.content, re.DOTALL)
        if multiline_match and not self.description:
            desc_lines = multiline_match.group(1).strip().split('\n')
            clean_lines = [line.strip().lstrip('*').strip() for line in desc_lines]
            self.description = ' '.join(clean_lines)[:100] + '...' if len(' '.join(clean_lines)) > 100 else ' '.join(clean_lines)
    
    def _extract_test_structure(self):
        """Extract test suites and test cases."""
        # Find describe blocks
        describe_matches = re.findall(r'describe\(\s*[\'"`]([^\'"`]+)[\'"`]\s*,\s*\(\)\s*=>\s*{', self.content)
        self.test_suites = describe_matches
        
        # Find it/test blocks
        it_matches = re.findall(r'it\(\s*[\'"`]([^\'"`]+)[\'"`]\s*,\s*\(\)\s*=>\s*{', self.content)
        test_matches = re.findall(r'test\(\s*[\'"`]([^\'"`]+)[\'"`]\s*,\s*\(\)\s*=>\s*{', self.content)
        self.test_cases = it_matches + test_matches
    
    def _extract_imports(self):
        """Extract import statements and references."""
        # ES6 imports
        import_matches = re.findall(r'import\s+.*?\s+from\s+[\'"`]([^\'"`]+)[\'"`]', self.content)
        self.imports.extend(import_matches)
        
        # Triple slash references
        reference_matches = re.findall(r'///\s*<reference\s+types\s*=\s*[\'"`]([^\'"`]+)[\'"`]', self.content)
        self.imports.extend(reference_matches)
    
    def _extract_selectors(self):
        """Extract CSS selectors and data attributes used in tests."""
        # CSS selectors in cy.get(), cy.contains(), etc.
        selector_patterns = [
            r'cy\.get\(\s*[\'"`]([^\'"`]+)[\'"`]',
            r'cy\.contains\(\s*[\'"`]([^\'"`]+)[\'"`]',
            r'data-slot\s*=\s*[\'"`]([^\'"`]+)[\'"`]',
            r'data-testid\s*=\s*[\'"`]([^\'"`]+)[\'"`]',
            r'data-cy\s*=\s*[\'"`]([^\'"`]+)[\'"`]',
        ]
        
        for pattern in selector_patterns:
            matches = re.findall(pattern, self.content)
            self.selectors.extend(matches)
        
        # Remove duplicates
        self.selectors = list(set(self.selectors))
    
    def _extract_assertions(self):
        """Extract assertions and expectations."""
        assertion_patterns = [
            r'expect\([^)]+\)\.to\.([^(]+)',
            r'\.should\(\s*[\'"`]([^\'"`]+)[\'"`]',
            r'assert\.(\w+)',
        ]
        
        for pattern in assertion_patterns:
            matches = re.findall(pattern, self.content)
            self.assertions.extend(matches)
    
    def _extract_commands(self):
        """Extract Cypress commands used."""
        command_patterns = [
            r'cy\.(\w+)\(',
        ]
        
        for pattern in command_patterns:
            matches = re.findall(pattern, self.content)
            self.commands.extend(matches)
        
        # Remove duplicates and sort
        self.commands = sorted(list(set(self.commands)))
    
    def _extract_hooks(self):
        """Extract test hooks (before, after, beforeEach, afterEach)."""
        hook_patterns = [
            r'(before|after|beforeEach|afterEach)\s*\(',
        ]
        
        for pattern in hook_patterns:
            matches = re.findall(pattern, self.content)
            self.hooks.extend(matches)
    
    def _determine_category(self):
        """Categorize the test based on its name and content."""
        name_lower = self.name.lower()
        content_lower = self.content.lower()
        
        if any(word in name_lower for word in ['startup', 'load', 'init', '00-']):
            self.category = "Startup/Initialization"
        elif any(word in name_lower for word in ['config', 'setting', 'configuration']):
            self.category = "Configuration"
        elif any(word in name_lower for word in ['component', 'canvas', 'resize', 'drag']):
            self.category = "Component Interaction"
        elif any(word in name_lower for word in ['library', 'drop', 'catalog']):
            self.category = "Library/Catalog"
        elif any(word in name_lower for word in ['theme', 'style', 'ui']):
            self.category = "UI/Styling"
        elif any(word in name_lower for word in ['plugin', 'runner']):
            self.category = "Plugin System"
        elif any(word in content_lower for word in ['api', 'request', 'response']):
            self.category = "API Testing"
        elif any(word in content_lower for word in ['database', 'db', 'sql']):
            self.category = "Database"
        else:
            self.category = "General E2E"
    
    def _calculate_complexity(self):
        """Calculate complexity score based on various factors."""
        score = 0
        
        # Base complexity from test cases
        score += len(self.test_cases) * 2
        
        # Complexity from nested describes
        score += len(self.test_suites) * 1
        
        # Complexity from unique commands
        score += len(self.commands)
        
        # Complexity from assertions
        score += len(self.assertions)
        
        # Complexity from selectors (indicates DOM interaction)
        score += len(self.selectors)
        
        # Complexity from file size
        score += self.line_count // 50
        
        self.complexity_score = score
    
    def _check_api_operations(self):
        """Check for API calls, database operations, and file operations."""
        content_lower = self.content.lower()
        
        # API operations
        api_indicators = ['cy.request', 'cy.intercept', 'fetch(', 'axios', '.api.', 'http']
        self.has_api_calls = any(indicator in content_lower for indicator in api_indicators)
        
        # Database operations
        db_indicators = ['cy.task', 'database', 'db.', 'sql', 'query', 'mongodb']
        self.has_db_operations = any(indicator in content_lower for indicator in db_indicators)
        
        # File operations
        file_indicators = ['cy.readfile', 'cy.writefile', 'cy.fixture', 'file', 'upload']
        self.has_file_operations = any(indicator in content_lower for indicator in file_indicators)
    
    def _extract_custom_commands(self):
        """Extract custom Cypress commands."""
        custom_cmd_matches = re.findall(r'Cypress\.Commands\.add\(\s*[\'"`](\w+)[\'"`]', self.content)
        self.custom_commands = custom_cmd_matches


class CypressE2EAnalyzer:
    def __init__(self, cypress_directory: str):
        self.cypress_directory = Path(cypress_directory)
        self.tests: List[CypressTest] = []
        self.categories: Dict[str, List[CypressTest]] = defaultdict(list)
        self.command_usage: Dict[str, int] = defaultdict(int)
        self.support_files: List[Path] = []
        
        if not self.cypress_directory.exists():
            raise ValueError(f"Cypress directory does not exist: {cypress_directory}")
        
        self._load_tests()
        self._categorize_tests()
        self._analyze_command_usage()
        self._find_support_files()
    
    def _load_tests(self):
        """Load all Cypress test files."""
        e2e_dir = self.cypress_directory / 'e2e'
        if e2e_dir.exists():
            for file_path in e2e_dir.glob("*.cy.ts"):
                test = CypressTest(file_path)
                self.tests.append(test)
            
            for file_path in e2e_dir.glob("*.cy.js"):
                test = CypressTest(file_path)
                self.tests.append(test)
    
    def _categorize_tests(self):
        """Group tests by categories."""
        for test in self.tests:
            self.categories[test.category].append(test)
    
    def _analyze_command_usage(self):
        """Analyze Cypress command usage across all tests."""
        for test in self.tests:
            for command in test.commands:
                self.command_usage[command] += 1
    
    def _find_support_files(self):
        """Find support files and custom commands."""
        support_dir = self.cypress_directory / 'support'
        if support_dir.exists():
            for file_path in support_dir.glob("*.ts"):
                self.support_files.append(file_path)
            for file_path in support_dir.glob("*.js"):
                self.support_files.append(file_path)
    
    def generate_tree_visualization(self, detailed: bool = False, scenarios: bool = False) -> str:
        """Generate ASCII tree visualization of the tests."""
        lines = []
        lines.append("🧪 Cypress E2E Tests Analysis")
        lines.append("=" * 50)
        lines.append(f"📁 Directory: {self.cypress_directory}")
        lines.append(f"🧪 Total Tests: {len(self.tests)}")
        lines.append(f"🏷️  Categories: {len(self.categories)}")
        lines.append(f"📁 Support Files: {len(self.support_files)}")
        lines.append("")
        
        # Overall statistics
        total_test_cases = sum(len(test.test_cases) for test in self.tests)
        total_assertions = sum(len(test.assertions) for test in self.tests)
        avg_complexity = sum(test.complexity_score for test in self.tests) / len(self.tests) if self.tests else 0
        
        lines.append("📈 Statistics:")
        lines.append(f"├── Total test cases: {total_test_cases}")
        lines.append(f"├── Total assertions: {total_assertions}")
        lines.append(f"├── Average complexity: {avg_complexity:.1f}")
        lines.append(f"├── Tests with API calls: {sum(1 for test in self.tests if test.has_api_calls)}")
        lines.append(f"├── Tests with file ops: {sum(1 for test in self.tests if test.has_file_operations)}")
        lines.append(f"└── Average lines per test: {sum(test.line_count for test in self.tests)/len(self.tests):.1f}")
        lines.append("")
        
        # Most used commands
        top_commands = sorted(self.command_usage.items(), key=lambda x: x[1], reverse=True)[:5]
        lines.append("🔧 Most Used Commands:")
        for i, (command, count) in enumerate(top_commands):
            is_last = i == len(top_commands) - 1
            prefix = "└──" if is_last else "├──"
            lines.append(f"{prefix} cy.{command}(): {count} uses")
        lines.append("")
        
        # Tests by category
        lines.append("🗂️  Tests by Category:")
        for i, (category, tests) in enumerate(sorted(self.categories.items())):
            is_last_category = i == len(self.categories) - 1
            category_prefix = "└──" if is_last_category else "├──"
            lines.append(f"{category_prefix} {category} ({len(tests)} tests)")
            
            for j, test in enumerate(sorted(tests, key=lambda t: t.name)):
                is_last_test = j == len(tests) - 1
                
                if not is_last_category and not is_last_test:
                    test_prefix = "│   ├──"
                elif not is_last_category and is_last_test:
                    test_prefix = "│   └──"
                elif is_last_category and not is_last_test:
                    test_prefix = "    ├──"
                else:  # is_last_category and is_last_test
                    test_prefix = "    └──"
                
                # Test info
                test_info = f"{test.name}"
                if test.has_api_calls:
                    test_info += " 🌐"
                if test.has_file_operations:
                    test_info += " 📁"
                if test.complexity_score > 20:
                    test_info += " ⚡"
                
                lines.append(f"{test_prefix} {test_info}")
                
                if detailed:
                    indent = "    " if is_last_category else "│   "
                    indent += "    "
                    
                    if test.description:
                        lines.append(f"{indent}📝 {test.description[:80]}...")
                    
                    if test.test_cases:
                        lines.append(f"{indent}🧪 Test cases: {len(test.test_cases)}")
                        if scenarios:
                            for case in test.test_cases[:3]:  # Show first 3 test cases
                                lines.append(f"{indent}   • {case[:60]}...")
                    
                    if test.commands:
                        top_cmds = sorted(set(test.commands))[:5]
                        lines.append(f"{indent}🔧 Commands: {', '.join(f'cy.{cmd}()' for cmd in top_cmds)}")
                    
                    if test.assertions:
                        lines.append(f"{indent}✅ Assertions: {len(test.assertions)}")
                    
                    lines.append(f"{indent}📏 Lines: {test.line_count} | Complexity: {test.complexity_score}")
                    lines.append("")
        
        return "\n".join(lines)
    
    def generate_table_visualization(self) -> str:
        """Generate table visualization of the tests."""
        lines = []
        lines.append("🧪 Cypress E2E Tests Table")
        lines.append("=" * 100)
        lines.append("")
        
        # Header
        lines.append("| Test Name                  | Category              | Cases | Assertions | API | Files | Complexity |")
        lines.append("|----------------------------|-----------------------|-------|------------|-----|-------|------------|")
        
        for test in sorted(self.tests, key=lambda t: t.name):
            name = test.name[:25] + "..." if len(test.name) > 25 else test.name
            category = test.category[:20] + "..." if len(test.category) > 20 else test.category
            cases = len(test.test_cases)
            assertions = len(test.assertions)
            api = "🌐" if test.has_api_calls else "❌"
            files = "📁" if test.has_file_operations else "❌"
            complexity = test.complexity_score
            
            lines.append(f"| {name:<26} | {category:<21} | {cases:>5} | {assertions:>10} | {api:<3} | {files:<5} | {complexity:>10} |")
        
        return "\n".join(lines)
    
    def generate_summary_visualization(self) -> str:
        """Generate summary visualization."""
        lines = []
        lines.append("🧪 Cypress E2E Tests Summary")
        lines.append("=" * 40)
        lines.append("")
        
        # Test counts by category
        lines.append("🏷️  Tests by Category:")
        for category, tests in sorted(self.categories.items(), key=lambda x: len(x[1]), reverse=True):
            count = len(tests)
            bar = "█" * min(count, 20)
            lines.append(f"  {category:<25} {count:>2} {bar}")
        lines.append("")
        
        # Complexity distribution
        complexity_ranges = {
            "Low (0-10)": len([t for t in self.tests if t.complexity_score <= 10]),
            "Medium (11-25)": len([t for t in self.tests if 11 <= t.complexity_score <= 25]),
            "High (26-50)": len([t for t in self.tests if 26 <= t.complexity_score <= 50]),
            "Very High (51+)": len([t for t in self.tests if t.complexity_score > 50])
        }
        
        lines.append("⚡ Complexity Distribution:")
        for range_name, count in complexity_ranges.items():
            if count > 0:
                bar = "█" * min(count, 20)
                lines.append(f"  {range_name:<15} {count:>2} {bar}")
        lines.append("")
        
        # Command usage
        lines.append("🔧 Top Commands:")
        top_commands = sorted(self.command_usage.items(), key=lambda x: x[1], reverse=True)[:8]
        for command, count in top_commands:
            bar = "█" * min(count, 20)
            lines.append(f"  cy.{command}()<{' ' * (15-len(command))} {count:>2} {bar}")
        lines.append("")
        
        # Feature usage
        lines.append("🌟 Feature Usage:")
        api_tests = sum(1 for test in self.tests if test.has_api_calls)
        file_tests = sum(1 for test in self.tests if test.has_file_operations)
        db_tests = sum(1 for test in self.tests if test.has_db_operations)
        
        lines.append(f"  API Testing:      {api_tests}/{len(self.tests)} tests")
        lines.append(f"  File Operations:  {file_tests}/{len(self.tests)} tests")
        lines.append(f"  Database Ops:     {db_tests}/{len(self.tests)} tests")
        
        return "\n".join(lines)
    
    def generate_visualization(self, format_type: str = "tree", detailed: bool = False, scenarios: bool = False) -> str:
        """Generate visualization based on format type."""
        if format_type == "table":
            return self.generate_table_visualization()
        elif format_type == "summary":
            return self.generate_summary_visualization()
        else:
            return self.generate_tree_visualization(detailed, scenarios)


def main():
    parser = argparse.ArgumentParser(
        description="Analyze Cypress E2E tests and generate ASCII visualizations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s ./cypress                                   # Basic tree view
  %(prog)s ./cypress --detailed                        # Detailed tree view
  %(prog)s ./cypress --detailed --scenarios            # Include test scenarios
  %(prog)s ./cypress --format table                    # Table format
  %(prog)s ./cypress --format summary                  # Summary format
  %(prog)s ./cypress --output e2e_analysis.txt         # Save to file
        """
    )
    
    parser.add_argument('cypress_directory', nargs='?', default='./cypress',
                       help='Path to Cypress directory (default: ./cypress)')
    parser.add_argument('--output', metavar='FILE',
                       help='Save output to file instead of printing')
    parser.add_argument('--detailed', action='store_true',
                       help='Show detailed test analysis in tree view')
    parser.add_argument('--scenarios', action='store_true',
                       help='Show test scenarios and test cases')
    parser.add_argument('--format', choices=['tree', 'table', 'summary'], default='tree',
                       help='Output format (default: tree)')
    
    args = parser.parse_args()
    
    try:
        analyzer = CypressE2EAnalyzer(args.cypress_directory)
        result = analyzer.generate_visualization(args.format, args.detailed, args.scenarios)
        
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(result)
            print(f"Analysis saved to '{args.output}'")
        else:
            print(result)
            
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()