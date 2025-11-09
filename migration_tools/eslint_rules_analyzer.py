#!/usr/bin/env python3
"""
ESLint Rules Analyzer

A Python script that analyzes ESLint custom rules and generates an ASCII visualization
of their structure, dependencies, and characteristics.

Usage:
    python eslint_rules_analyzer.py [eslint-rules-directory] [options]

Options:
    --output FILE         : Save output to file instead of printing to console
    --detailed           : Show detailed rule analysis
    --categories         : Group rules by categories
    --dependencies       : Show import dependencies
    --format FORMAT      : Output format (tree, table, summary) - default: tree

Examples:
    python eslint_rules_analyzer.py ./eslint-rules
    python eslint_rules_analyzer.py ./eslint-rules --detailed --categories
    python eslint_rules_analyzer.py ./eslint-rules --format table --output rules_analysis.txt
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


class ESLintRule:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.name = file_path.stem
        self.content = ""
        self.description = ""
        self.rule_type = ""
        self.messages = []
        self.imports = []
        self.exports = []
        self.has_tests = False
        self.line_count = 0
        self.category = ""
        self.severity = ""
        self.schema_complexity = 0
        self.is_fixable = False
        
        self._analyze()
    
    def _analyze(self):
        """Analyze the ESLint rule file for various characteristics."""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                self.content = f.read()
            
            self.line_count = len(self.content.splitlines())
            self._extract_description()
            self._extract_rule_type()
            self._extract_messages()
            self._extract_imports()
            self._extract_exports()
            self._determine_category()
            self._check_fixable()
            self._analyze_schema()
            self._check_for_tests()
            
        except Exception as e:
            print(f"Warning: Could not analyze {self.file_path}: {e}")
    
    def _extract_description(self):
        """Extract rule description from comments or meta.docs."""
        # Look for description in comments
        comment_match = re.search(r'/\*\*\s*\n\s*\*\s*(.+?)(?:\n|\*\/)', self.content)
        if comment_match:
            self.description = comment_match.group(1).strip()
        
        # Look for description in meta.docs
        docs_match = re.search(r'docs:\s*{\s*description:\s*["\']([^"\']+)["\']', self.content)
        if docs_match and not self.description:
            self.description = docs_match.group(1).strip()
    
    def _extract_rule_type(self):
        """Extract rule type (problem, suggestion, layout)."""
        type_match = re.search(r'type:\s*["\'](\w+)["\']', self.content)
        if type_match:
            self.rule_type = type_match.group(1)
    
    def _extract_messages(self):
        """Extract error messages from the rule."""
        # Find messages object
        messages_match = re.search(r'messages:\s*{([^}]+)}', self.content, re.DOTALL)
        if messages_match:
            messages_content = messages_match.group(1)
            # Extract individual message keys and values
            message_patterns = re.findall(r'(\w+):\s*["\']([^"\']+)["\']', messages_content)
            self.messages = [(key, msg) for key, msg in message_patterns]
    
    def _extract_imports(self):
        """Extract import statements."""
        # ES6 imports
        import_matches = re.findall(r'import\s+.*?\s+from\s+["\']([^"\']+)["\']', self.content)
        self.imports.extend(import_matches)
        
        # CommonJS requires
        require_matches = re.findall(r'require\(["\']([^"\']+)["\']\)', self.content)
        self.imports.extend(require_matches)
    
    def _extract_exports(self):
        """Extract export statements."""
        # ES6 exports
        if 'export default' in self.content:
            self.exports.append('default')
        
        # Named exports
        named_exports = re.findall(r'export\s+{\s*([^}]+)\s*}', self.content)
        for exports_list in named_exports:
            exports = [e.strip() for e in exports_list.split(',')]
            self.exports.extend(exports)
    
    def _determine_category(self):
        """Categorize the rule based on its name and content."""
        name_lower = self.name.lower()
        
        if any(word in name_lower for word in ['no-console', 'no-cross', 'no-hardcoded', 'no-host', 'no-layout']):
            self.category = "Prohibition Rules"
        elif any(word in name_lower for word in ['require-', 'validate-']):
            self.category = "Validation Rules"
        elif any(word in name_lower for word in ['feature-flags', 'handler-export', 'interaction', 'topics']):
            self.category = "Architecture Rules"
        elif any(word in name_lower for word in ['import', 'export']):
            self.category = "Import/Export Rules"
        elif any(word in name_lower for word in ['manifest', 'routing', 'slot']):
            self.category = "Configuration Rules"
        else:
            self.category = "General Rules"
    
    def _check_fixable(self):
        """Check if the rule has auto-fix capability."""
        self.is_fixable = 'fixable' in self.content or 'fixer' in self.content
    
    def _analyze_schema(self):
        """Analyze schema complexity."""
        schema_matches = re.findall(r'schema:\s*\[([^\]]*)\]', self.content, re.DOTALL)
        if schema_matches:
            schema_content = schema_matches[0]
            # Simple complexity measure based on schema content
            self.schema_complexity = len(re.findall(r'type:|properties:|items:', schema_content))
    
    def _check_for_tests(self):
        """Check if there are tests for this rule."""
        test_file = self.file_path.parent / '__tests__' / f"{self.name}.test.js"
        self.has_tests = test_file.exists()


class ESLintRulesAnalyzer:
    def __init__(self, rules_directory: str):
        self.rules_directory = Path(rules_directory)
        self.rules: List[ESLintRule] = []
        self.categories: Dict[str, List[ESLintRule]] = defaultdict(list)
        self.dependencies: Dict[str, Set[str]] = defaultdict(set)
        
        if not self.rules_directory.exists():
            raise ValueError(f"Rules directory does not exist: {rules_directory}")
        
        self._load_rules()
        self._categorize_rules()
        self._analyze_dependencies()
    
    def _load_rules(self):
        """Load all ESLint rule files."""
        for file_path in self.rules_directory.glob("*.js"):
            if file_path.name.startswith('__') or file_path.name.endswith('.test.js'):
                continue
            
            rule = ESLintRule(file_path)
            self.rules.append(rule)
    
    def _categorize_rules(self):
        """Group rules by categories."""
        for rule in self.rules:
            self.categories[rule.category].append(rule)
    
    def _analyze_dependencies(self):
        """Analyze dependencies between rules and external modules."""
        for rule in self.rules:
            for imp in rule.imports:
                if imp.startswith('.'):
                    # Local dependency
                    self.dependencies[rule.name].add(f"local: {imp}")
                elif imp.startswith('node:'):
                    # Node.js built-in
                    self.dependencies[rule.name].add(f"node: {imp}")
                else:
                    # External package
                    self.dependencies[rule.name].add(f"external: {imp}")
    
    def generate_tree_visualization(self, detailed: bool = False) -> str:
        """Generate ASCII tree visualization of the rules."""
        lines = []
        lines.append("📋 ESLint Custom Rules Analysis")
        lines.append("=" * 50)
        lines.append(f"📁 Directory: {self.rules_directory}")
        lines.append(f"📊 Total Rules: {len(self.rules)}")
        lines.append(f"🏷️  Categories: {len(self.categories)}")
        lines.append("")
        
        # Overall statistics
        tested_rules = sum(1 for rule in self.rules if rule.has_tests)
        fixable_rules = sum(1 for rule in self.rules if rule.is_fixable)
        
        lines.append("📈 Statistics:")
        lines.append(f"├── Rules with tests: {tested_rules}/{len(self.rules)} ({tested_rules/len(self.rules)*100:.1f}%)")
        lines.append(f"├── Fixable rules: {fixable_rules}/{len(self.rules)} ({fixable_rules/len(self.rules)*100:.1f}%)")
        lines.append(f"└── Average lines per rule: {sum(rule.line_count for rule in self.rules)/len(self.rules):.1f}")
        lines.append("")
        
        # Rules by category
        lines.append("🗂️  Rules by Category:")
        for i, (category, rules) in enumerate(sorted(self.categories.items())):
            is_last_category = i == len(self.categories) - 1
            category_prefix = "└──" if is_last_category else "├──"
            lines.append(f"{category_prefix} {category} ({len(rules)} rules)")
            
            for j, rule in enumerate(sorted(rules, key=lambda r: r.name)):
                is_last_rule = j == len(rules) - 1
                rule_prefix = "    └──" if is_last_category else "│   └──" if is_last_rule else "│   ├──"
                if not is_last_category and not is_last_rule:
                    rule_prefix = "│   ├──"
                elif not is_last_category and is_last_rule:
                    rule_prefix = "│   └──"
                elif is_last_category and not is_last_rule:
                    rule_prefix = "    ├──"
                else:  # is_last_category and is_last_rule
                    rule_prefix = "    └──"
                
                # Rule info
                rule_info = f"{rule.name}"
                if rule.rule_type:
                    rule_info += f" ({rule.rule_type})"
                if rule.has_tests:
                    rule_info += " ✅"
                if rule.is_fixable:
                    rule_info += " 🔧"
                
                lines.append(f"{rule_prefix} {rule_info}")
                
                if detailed:
                    indent = "    " if is_last_category else "│   "
                    indent += "    "
                    
                    if rule.description:
                        lines.append(f"{indent}📝 {rule.description}")
                    
                    if rule.messages:
                        lines.append(f"{indent}💬 Messages: {len(rule.messages)}")
                        for msg_key, msg_text in rule.messages[:2]:  # Show first 2 messages
                            lines.append(f"{indent}   • {msg_key}: {msg_text[:50]}...")
                    
                    if rule.line_count:
                        lines.append(f"{indent}📏 Lines: {rule.line_count}")
                    
                    lines.append("")
        
        return "\n".join(lines)
    
    def generate_table_visualization(self) -> str:
        """Generate table visualization of the rules."""
        lines = []
        lines.append("📋 ESLint Custom Rules Table")
        lines.append("=" * 80)
        lines.append("")
        
        # Header
        lines.append("| Rule Name                     | Type    | Category          | Tests | Fix | Lines |")
        lines.append("|-------------------------------|---------|-------------------|-------|-----|-------|")
        
        for rule in sorted(self.rules, key=lambda r: r.name):
            name = rule.name[:28] + "..." if len(rule.name) > 28 else rule.name
            rule_type = rule.rule_type[:7] if rule.rule_type else "unknown"
            category = rule.category[:17] if rule.category else "General"
            tests = "✅" if rule.has_tests else "❌"
            fixable = "🔧" if rule.is_fixable else "❌"
            
            lines.append(f"| {name:<29} | {rule_type:<7} | {category:<17} | {tests:<5} | {fixable:<3} | {rule.line_count:>5} |")
        
        return "\n".join(lines)
    
    def generate_summary_visualization(self) -> str:
        """Generate summary visualization."""
        lines = []
        lines.append("📋 ESLint Custom Rules Summary")
        lines.append("=" * 40)
        lines.append("")
        
        # Rule counts by category
        lines.append("🏷️  Rules by Category:")
        for category, rules in sorted(self.categories.items(), key=lambda x: len(x[1]), reverse=True):
            count = len(rules)
            bar = "█" * min(count, 20)
            lines.append(f"  {category:<20} {count:>3} {bar}")
        lines.append("")
        
        # Rule types
        type_counts = defaultdict(int)
        for rule in self.rules:
            type_counts[rule.rule_type or "unknown"] += 1
        
        lines.append("🔧 Rules by Type:")
        for rule_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
            bar = "█" * min(count, 20)
            lines.append(f"  {rule_type:<15} {count:>3} {bar}")
        lines.append("")
        
        # Dependencies
        if self.dependencies:
            lines.append("📦 Dependencies Overview:")
            node_deps = set()
            external_deps = set()
            local_deps = set()
            
            for rule_deps in self.dependencies.values():
                for dep in rule_deps:
                    if dep.startswith("node:"):
                        node_deps.add(dep[5:])
                    elif dep.startswith("external:"):
                        external_deps.add(dep[9:])
                    elif dep.startswith("local:"):
                        local_deps.add(dep[6:])
            
            lines.append(f"  Node.js modules: {len(node_deps)}")
            lines.append(f"  External packages: {len(external_deps)}")
            lines.append(f"  Local dependencies: {len(local_deps)}")
        
        return "\n".join(lines)
    
    def generate_visualization(self, format_type: str = "tree", detailed: bool = False) -> str:
        """Generate visualization based on format type."""
        if format_type == "table":
            return self.generate_table_visualization()
        elif format_type == "summary":
            return self.generate_summary_visualization()
        else:
            return self.generate_tree_visualization(detailed)


def main():
    parser = argparse.ArgumentParser(
        description="Analyze ESLint custom rules and generate ASCII visualizations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s ./eslint-rules                              # Basic tree view
  %(prog)s ./eslint-rules --detailed                   # Detailed tree view
  %(prog)s ./eslint-rules --format table               # Table format
  %(prog)s ./eslint-rules --format summary             # Summary format
  %(prog)s ./eslint-rules --output analysis.txt        # Save to file
        """
    )
    
    parser.add_argument('rules_directory', nargs='?', default='./eslint-rules',
                       help='Path to ESLint rules directory (default: ./eslint-rules)')
    parser.add_argument('--output', metavar='FILE',
                       help='Save output to file instead of printing')
    parser.add_argument('--detailed', action='store_true',
                       help='Show detailed rule analysis in tree view')
    parser.add_argument('--format', choices=['tree', 'table', 'summary'], default='tree',
                       help='Output format (default: tree)')
    
    args = parser.parse_args()
    
    try:
        analyzer = ESLintRulesAnalyzer(args.rules_directory)
        result = analyzer.generate_visualization(args.format, args.detailed)
        
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