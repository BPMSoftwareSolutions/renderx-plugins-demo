#!/usr/bin/env python3
"""
CSS Class Scanner

A Python script that scans source code and CSS files to extract and visualize all CSS classes
in an ASCII tree format, organized by file, usage patterns, and statistics.

Usage:
    python css_class_scanner.py [path] [options]

Options:
    --include-ext EXT    : File extensions to scan (default: .css,.scss,.less,.ts,.tsx,.js,.jsx)
    --output FILE        : Save output to file instead of printing to console
    --group-by TYPE      : Group by 'file', 'class', or 'package' (default: file)
    --show-usage         : Show where each class is used
    --stats              : Show statistics summary
    --format FORMAT      : Output format: 'tree', 'flat', or 'json' (default: tree)
    --min-usage N        : Only show classes used at least N times (default: 1)

Examples:
    python css_class_scanner.py packages
    python css_class_scanner.py packages --group-by class --stats
    python css_class_scanner.py packages --output css_classes.txt --show-usage
    python css_class_scanner.py packages --min-usage 3 --stats
"""

import os
import re
import json
import argparse
from pathlib import Path
from typing import List, Dict, Set, Tuple
from collections import defaultdict
from dataclasses import dataclass, field, asdict


@dataclass
class CSSClass:
    """Represents a CSS class found in code."""
    class_name: str
    file_path: str
    line_number: int
    context: str  # 'definition' or 'usage'
    usage_type: str  # 'css-file', 'className-prop', 'classList', 'querySelector', etc.
    package: str = ""
    
    def __post_init__(self):
        # Extract package name from file path
        if 'packages' in self.file_path:
            parts = self.file_path.split(os.sep)
            if 'packages' in parts:
                idx = parts.index('packages')
                if idx + 1 < len(parts):
                    self.package = parts[idx + 1]


class CSSScanner:
    """Scanner to extract CSS classes from source code and style files."""
    
    # Patterns for finding CSS classes
    PATTERNS = [
        # CSS/SCSS/LESS definitions: .className { ... }
        (r'\.([a-zA-Z_][\w-]*)\s*\{', 'css-definition'),
        
        # React/JSX className="..."
        (r'className\s*=\s*["\']([^"\']+)["\']', 'className-prop'),
        (r'className\s*=\s*\{["\']([^"\']+)["\']\}', 'className-prop-expr'),
        
        # classList.add/remove/toggle
        (r'classList\.(add|remove|toggle)\s*\(\s*["\']([^"\']+)["\']', 'classList-method'),
        
        # querySelector/querySelectorAll with class selector
        (r'querySelector(?:All)?\s*\(\s*["\']\.([a-zA-Z_][\w-]*)', 'querySelector'),
        
        # Template literals with classes
        (r'`[^`]*?\b([a-zA-Z_][\w-]*)\b[^`]*?`', 'template-literal'),
        
        # CSS Modules: styles.className or styles['className']
        (r'styles\.([a-zA-Z_][\w-]*)', 'css-module'),
        (r'styles\[["\']([^"\']+)["\']\]', 'css-module-bracket'),
        
        # Tailwind/utility classes in className
        (r'className\s*=\s*["\']([^"\']*\s+[^"\']*)["\']', 'utility-classes'),
        
        # Class attribute in HTML/JSX
        (r'class\s*=\s*["\']([^"\']+)["\']', 'class-attr'),
        
        # data-* attributes that might reference classes
        (r'data-[\w-]+\s*=\s*["\']([a-zA-Z_][\w-]*)["\']', 'data-attr'),
    ]
    
    def __init__(self,
                 extensions: List[str] = None,
                 show_usage: bool = False,
                 group_by: str = 'file',
                 output_format: str = 'tree',
                 min_usage: int = 1):
        self.extensions = extensions or ['.css', '.scss', '.less', '.ts', '.tsx', '.js', '.jsx', '.html']
        self.show_usage = show_usage
        self.group_by = group_by
        self.output_format = output_format
        self.min_usage = min_usage
        self.css_classes: List[CSSClass] = []
        self.class_usage_count: Dict[str, int] = defaultdict(int)
        
    def should_scan_file(self, file_path: Path) -> bool:
        """Check if file should be scanned based on extension."""
        return file_path.suffix in self.extensions
    
    def extract_classes_from_line(self, line: str, file_path: str, line_number: int) -> List[CSSClass]:
        """Extract CSS classes from a single line."""
        classes = []
        
        for pattern, usage_type in self.PATTERNS:
            matches = re.finditer(pattern, line)
            for match in matches:
                # Get the class name(s) from the appropriate capture group
                if usage_type == 'classList-method':
                    class_name = match.group(2)
                elif usage_type in ['className-prop', 'className-prop-expr', 'class-attr', 'utility-classes']:
                    # These might contain multiple space-separated classes
                    class_names = match.group(1).split()
                    for cn in class_names:
                        cn = cn.strip()
                        if cn and self._is_valid_class_name(cn):
                            css_class = CSSClass(
                                class_name=cn,
                                file_path=file_path,
                                line_number=line_number,
                                context='usage',
                                usage_type=usage_type
                            )
                            classes.append(css_class)
                            self.class_usage_count[cn] += 1
                    continue
                else:
                    class_name = match.group(1)
                
                # Validate class name
                if not self._is_valid_class_name(class_name):
                    continue
                
                # Determine if this is a definition or usage
                context = 'definition' if usage_type == 'css-definition' else 'usage'
                
                css_class = CSSClass(
                    class_name=class_name,
                    file_path=file_path,
                    line_number=line_number,
                    context=context,
                    usage_type=usage_type
                )
                classes.append(css_class)
                self.class_usage_count[class_name] += 1
        
        return classes
    
    def _is_valid_class_name(self, name: str) -> bool:
        """Check if the class name is valid and not a false positive."""
        if not name:
            return False
        
        # Filter out common false positives
        false_positives = {
            'return', 'const', 'let', 'var', 'function', 'class', 'import', 'export',
            'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
            'true', 'false', 'null', 'undefined', 'this', 'super', 'new', 'typeof',
            'string', 'number', 'boolean', 'object', 'any', 'void', 'never',
            'styles', 'className', 'classList', 'querySelector', 'querySelectorAll',
        }
        
        if name.lower() in false_positives:
            return False
        
        # Must start with letter or underscore
        if not re.match(r'^[a-zA-Z_]', name):
            return False
        
        # Filter out very long names (likely not CSS classes)
        if len(name) > 100:
            return False
        
        return True
    
    def scan_file(self, file_path: Path) -> List[CSSClass]:
        """Scan a single file for CSS classes."""
        classes = []
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                for line_num, line in enumerate(f, 1):
                    found_classes = self.extract_classes_from_line(
                        line,
                        str(file_path),
                        line_num
                    )
                    classes.extend(found_classes)
        except Exception as e:
            print(f"Warning: Could not scan {file_path}: {e}")
        
        return classes
    
    def scan_directory(self, directory: Path) -> List[CSSClass]:
        """Recursively scan a directory for CSS classes."""
        all_classes = []
        
        for root, dirs, files in os.walk(directory):
            # Skip common directories
            dirs[:] = [d for d in dirs if d not in {
                'node_modules', '.git', 'dist', 'build', 'coverage',
                '__pycache__', '.pytest_cache', '.vscode'
            }]
            
            for file in files:
                file_path = Path(root) / file
                if self.should_scan_file(file_path):
                    classes = self.scan_file(file_path)
                    all_classes.extend(classes)
        
        return all_classes
    
    def scan(self, path: str) -> List[CSSClass]:
        """Scan a file or directory for CSS classes."""
        scan_path = Path(path)
        
        if not scan_path.exists():
            raise FileNotFoundError(f"Path not found: {path}")
        
        if scan_path.is_file():
            self.css_classes = self.scan_file(scan_path)
        else:
            self.css_classes = self.scan_directory(scan_path)
        
        # Filter by minimum usage
        if self.min_usage > 1:
            self.css_classes = [
                c for c in self.css_classes
                if self.class_usage_count[c.class_name] >= self.min_usage
            ]
        
        return self.css_classes
    
    def get_statistics(self) -> Dict:
        """Calculate statistics about CSS classes."""
        if not self.css_classes:
            return {}
        
        unique_classes = set(c.class_name for c in self.css_classes)
        definitions = [c for c in self.css_classes if c.context == 'definition']
        usages = [c for c in self.css_classes if c.context == 'usage']
        
        # Count by usage type
        usage_type_counts = defaultdict(int)
        for cls in self.css_classes:
            usage_type_counts[cls.usage_type] += 1
        
        # Count by package
        package_counts = defaultdict(int)
        for cls in self.css_classes:
            if cls.package:
                package_counts[cls.package] += 1
        
        # Find most used classes
        most_used = sorted(
            self.class_usage_count.items(),
            key=lambda x: x[1],
            reverse=True
        )[:20]
        
        # Find orphaned classes (defined but never used)
        defined_classes = set(c.class_name for c in definitions)
        used_classes = set(c.class_name for c in usages)
        orphaned = defined_classes - used_classes
        
        return {
            'total_classes': len(self.css_classes),
            'unique_classes': len(unique_classes),
            'definitions': len(definitions),
            'usages': len(usages),
            'usage_types': dict(usage_type_counts),
            'packages': dict(package_counts),
            'most_used': most_used,
            'orphaned_classes': list(orphaned)[:20],
            'files_scanned': len(set(c.file_path for c in self.css_classes))
        }


class CSSReportGenerator:
    """Generates reports from CSS class scan results."""
    
    def __init__(self, scanner: CSSScanner):
        self.scanner = scanner
        self.classes = scanner.css_classes
    
    def generate_tree_report(self) -> str:
        """Generate a tree-style report."""
        lines = []
        lines.append("=" * 80)
        lines.append("CSS Classes Report")
        lines.append("=" * 80)
        lines.append("")
        
        if self.scanner.group_by == 'file':
            lines.extend(self._generate_by_file())
        elif self.scanner.group_by == 'class':
            lines.extend(self._generate_by_class())
        elif self.scanner.group_by == 'package':
            lines.extend(self._generate_by_package())
        
        return "\n".join(lines)
    
    def _generate_by_file(self) -> List[str]:
        """Group classes by file."""
        lines = []
        
        by_file = defaultdict(list)
        for cls in self.classes:
            by_file[cls.file_path].append(cls)
        
        for file_path in sorted(by_file.keys()):
            classes = by_file[file_path]
            rel_path = os.path.relpath(file_path)
            
            lines.append(f"├── {rel_path} ({len(classes)} classes)")
            
            # Group by context
            definitions = [c for c in classes if c.context == 'definition']
            usages = [c for c in classes if c.context == 'usage']
            
            if definitions:
                lines.append("│   ├── 🎨 DEFINITIONS")
                for i, cls in enumerate(definitions[:10]):
                    prefix = "│   │   └──" if i == len(definitions) - 1 and not usages else "│   │   ├──"
                    line_info = f" (line {cls.line_number})" if self.scanner.show_usage else ""
                    lines.append(f"{prefix} .{cls.class_name}{line_info}")
                if len(definitions) > 10:
                    lines.append(f"│   │   └── ... and {len(definitions) - 10} more")
            
            if usages:
                lines.append("│   └── 🔧 USAGES")
                for i, cls in enumerate(usages[:10]):
                    prefix = "│       └──" if i == len(usages) - 1 else "│       ├──"
                    line_info = f" (line {cls.line_number}, {cls.usage_type})" if self.scanner.show_usage else f" ({cls.usage_type})"
                    lines.append(f"{prefix} .{cls.class_name}{line_info}")
                if len(usages) > 10:
                    lines.append(f"│       └── ... and {len(usages) - 10} more")
            
            lines.append("")
        
        return lines
    
    def _generate_by_class(self) -> List[str]:
        """Group by class name."""
        lines = []
        
        by_class = defaultdict(list)
        for cls in self.classes:
            by_class[cls.class_name].append(cls)
        
        # Sort by usage count
        sorted_classes = sorted(
            by_class.items(),
            key=lambda x: len(x[1]),
            reverse=True
        )
        
        for class_name, occurrences in sorted_classes:
            count = len(occurrences)
            lines.append(f"├── .{class_name} ({count} occurrence{'s' if count != 1 else ''})")
            
            definitions = [c for c in occurrences if c.context == 'definition']
            usages = [c for c in occurrences if c.context == 'usage']
            
            if definitions:
                lines.append("│   ├── 🎨 DEFINED IN:")
                for i, cls in enumerate(definitions):
                    prefix = "│   │   └──" if i == len(definitions) - 1 and not usages else "│   │   ├──"
                    rel_path = os.path.relpath(cls.file_path)
                    lines.append(f"{prefix} {rel_path}:{cls.line_number}")
            
            if usages and self.scanner.show_usage:
                lines.append("│   └── 🔧 USED IN:")
                for i, cls in enumerate(usages[:5]):
                    prefix = "│       └──" if i == len(usages) - 1 or i == 4 else "│       ├──"
                    rel_path = os.path.relpath(cls.file_path)
                    lines.append(f"{prefix} {rel_path}:{cls.line_number} ({cls.usage_type})")
                if len(usages) > 5:
                    lines.append(f"│       └── ... and {len(usages) - 5} more")
            
            lines.append("")
        
        return lines
    
    def _generate_by_package(self) -> List[str]:
        """Group by package."""
        lines = []
        
        by_package = defaultdict(list)
        for cls in self.classes:
            pkg = cls.package or 'other'
            by_package[pkg].append(cls)
        
        for package in sorted(by_package.keys()):
            classes = by_package[package]
            unique = len(set(c.class_name for c in classes))
            
            lines.append(f"├── 📦 {package} ({len(classes)} occurrences, {unique} unique)")
            
            # Count by usage type
            by_type = defaultdict(int)
            for cls in classes:
                by_type[cls.usage_type] += 1
            
            for i, (usage_type, count) in enumerate(sorted(by_type.items())):
                prefix = "│   └──" if i == len(by_type) - 1 else "│   ├──"
                lines.append(f"{prefix} {usage_type}: {count}")
            
            lines.append("")
        
        return lines
    
    def generate_statistics_report(self) -> str:
        """Generate a statistics summary."""
        stats = self.scanner.get_statistics()
        if not stats:
            return "No statistics available."
        
        lines = []
        lines.append("")
        lines.append("=" * 80)
        lines.append("STATISTICS SUMMARY")
        lines.append("=" * 80)
        lines.append("")
        
        # Overall stats
        lines.append(f"📊 Total Occurrences: {stats['total_classes']}")
        lines.append(f"🎨 Unique Classes: {stats['unique_classes']}")
        lines.append(f"📝 Definitions: {stats['definitions']}")
        lines.append(f"🔧 Usages: {stats['usages']}")
        lines.append(f"📁 Files Scanned: {stats['files_scanned']}")
        lines.append("")
        
        # Usage types
        if stats['usage_types']:
            lines.append("📈 By Usage Type:")
            total = sum(stats['usage_types'].values())
            sorted_types = sorted(stats['usage_types'].items(), key=lambda x: x[1], reverse=True)
            for usage_type, count in sorted_types:
                pct = (count / total) * 100
                bar_length = int(pct / 2)
                bar = "█" * bar_length
                lines.append(f"  {usage_type:<25} {count:>6} ({pct:>5.1f}%) {bar}")
            lines.append("")
        
        # Packages
        if stats['packages']:
            lines.append("📦 By Package (Top 10):")
            sorted_pkgs = sorted(stats['packages'].items(), key=lambda x: x[1], reverse=True)[:10]
            for package, count in sorted_pkgs:
                lines.append(f"  {package:<30} {count:>6}")
            lines.append("")
        
        # Most used classes
        if stats['most_used']:
            lines.append("🔥 Most Used Classes (Top 20):")
            for class_name, count in stats['most_used']:
                lines.append(f"  .{class_name:<35} {count:>6} occurrences")
            lines.append("")
        
        # Orphaned classes
        if stats['orphaned_classes']:
            lines.append("⚠️  Orphaned Classes (defined but not used):")
            for class_name in stats['orphaned_classes'][:20]:
                lines.append(f"  .{class_name}")
            if len(stats['orphaned_classes']) > 20:
                lines.append(f"  ... and {len(stats['orphaned_classes']) - 20} more")
            lines.append("")
        
        lines.append("=" * 80)
        
        return "\n".join(lines)
    
    def generate_json_report(self) -> str:
        """Generate a JSON report."""
        data = {
            'statistics': self.scanner.get_statistics(),
            'classes': [asdict(c) for c in self.classes]
        }
        return json.dumps(data, indent=2)
    
    def generate_flat_report(self) -> str:
        """Generate a flat list report."""
        lines = []
        lines.append("=" * 80)
        lines.append("CSS Classes Report (Flat List)")
        lines.append("=" * 80)
        lines.append("")
        
        for cls in self.classes:
            rel_path = os.path.relpath(cls.file_path)
            context_icon = "🎨" if cls.context == "definition" else "🔧"
            lines.append(
                f"{context_icon} .{cls.class_name:<30} | "
                f"{cls.usage_type:<20} | "
                f"{rel_path}:{cls.line_number}"
            )
        
        return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Scan source code for CSS classes and generate reports"
    )
    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="Path to scan (file or directory)"
    )
    parser.add_argument(
        "--include-ext",
        type=str,
        help="Comma-separated file extensions (default: .css,.scss,.less,.ts,.tsx,.js,.jsx)"
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Output file path (default: print to console)"
    )
    parser.add_argument(
        "--group-by",
        choices=["file", "class", "package"],
        default="file",
        help="Grouping method (default: file)"
    )
    parser.add_argument(
        "--show-usage",
        action="store_true",
        help="Show usage locations for each class"
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Show statistics summary"
    )
    parser.add_argument(
        "--format",
        choices=["tree", "flat", "json"],
        default="tree",
        help="Output format (default: tree)"
    )
    parser.add_argument(
        "--min-usage",
        type=int,
        default=1,
        help="Minimum usage count to include (default: 1)"
    )
    
    args = parser.parse_args()
    
    # Parse extensions
    extensions = None
    if args.include_ext:
        extensions = [f".{ext.strip().lstrip('.')}" for ext in args.include_ext.split(",")]
    
    # Create scanner
    scanner = CSSScanner(
        extensions=extensions,
        show_usage=args.show_usage,
        group_by=args.group_by,
        output_format=args.format,
        min_usage=args.min_usage
    )
    
    # Scan
    print(f"Scanning directory: {args.path}")
    try:
        classes = scanner.scan(args.path)
        print(f"Found {len(classes)} CSS class occurrences ({len(set(c.class_name for c in classes))} unique)")
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    # Generate report
    generator = CSSReportGenerator(scanner)
    
    if args.format == "json":
        output = generator.generate_json_report()
    elif args.format == "flat":
        output = generator.generate_flat_report()
    else:
        output = generator.generate_tree_report()
    
    if args.stats:
        output += "\n" + generator.generate_statistics_report()
    
    # Output
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"Report saved to '{args.output}'")
    else:
        print(output)
    
    return 0


if __name__ == "__main__":
    exit(main())
