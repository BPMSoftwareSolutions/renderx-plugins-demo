#!/usr/bin/env python3
"""
Theme Resource Auditor & Fixer
Scans all AXAML files to find hardcoded colors and replaces them with theme-aware resources.
"""

import re
import os
from pathlib import Path
from typing import Dict, List, Tuple, Set
from collections import defaultdict

# Map hardcoded colors to theme-aware resource keys
COLOR_MAPPING = {
    # Light backgrounds
    '#ffffff': 'Color.Background.Primary',
    '#FFFFFF': 'Color.Background.Primary',
    'White': 'Color.Background.Primary',
    '#f9fafb': 'Color.Background.Secondary',
    '#F9F9F9': 'Color.Background.Secondary',
    '#f9f9f9': 'Color.Background.Secondary',
    '#F5F5F5': 'Color.Background.Tertiary',
    '#f5f5f5': 'Color.Background.Tertiary',
    '#f3f4f6': 'Color.Background.Tertiary',
    '#E8E8E8': 'Color.Background.Hover',
    '#e8e8e8': 'Color.Background.Hover',
    '#e5e7eb': 'Color.Background.Hover',
    '#E0E0E0': 'Color.Border.Primary',
    '#e0e0e0': 'Color.Border.Primary',
    '#D0D0D0': 'Color.Border.Secondary',
    '#d0d0d0': 'Color.Border.Secondary',
    '#d1d5db': 'Color.Border.Secondary',
    '#CCCCCC': 'Color.Border.Secondary',
    '#cccccc': 'Color.Border.Secondary',
    '#B0B0B0': 'Color.Border.Strong',
    '#b0b0b0': 'Color.Border.Strong',
    
    # Dark backgrounds
    '#1e1e1e': 'Color.Background.Primary',
    '#1E1E1E': 'Color.Background.Primary',
    '#1f2937': 'Color.Background.Primary',
    '#252526': 'Color.Background.Secondary',
    '#111827': 'Color.Background.Secondary',
    '#0f172a': 'Color.Background.Tertiary',
    '#374151': 'Color.Border.Primary',
    '#333': 'Color.Border.Primary',
    '#333333': 'Color.Border.Primary',
    
    # Text colors
    '#333333': 'Color.Text.Primary',
    '#666666': 'Color.Text.Secondary',
    '#999999': 'Color.Text.Tertiary',
    '#1f2937': 'Color.Text.Primary',
    '#6b7280': 'Color.Text.Secondary',
    '#6B7280': 'Color.Text.Secondary',
    '#9ca3af': 'Color.Text.Tertiary',
    '#111827': 'Color.Text.Primary',
    '#f8fafc': 'Color.Text.Primary',
    '#e2e8f0': 'Color.Text.Secondary',
    
    # Borders
    '#e5e7eb': 'Color.Border.Primary',
    '#d1d5db': 'Color.Border.Secondary',
    '#9ca3af': 'Color.Border.Strong',
    
    # Accents
    '#007ACC': 'Color.Accent.Primary',
    '#007acc': 'Color.Accent.Primary',
    '#3b82f6': 'Color.Accent.Primary',
    '#2563eb': 'Color.Accent.Dark',
    '#1d4ed8': 'Color.Accent.Darker',
    '#dbeafe': 'Color.Accent.Light',
    '#eff6ff': 'Color.Accent.Weak',
    
    # Status colors
    '#10b981': 'Color.Success',
    '#10B981': 'Color.Success',
    '#4CAF50': 'Color.Success',
    '#4caf50': 'Color.Success',
    '#EF5350': 'Color.Error',
    '#ef5350': 'Color.Error',
    '#D32F2F': 'Color.Error',
    '#d32f2f': 'Color.Error',
    '#C62828': 'Color.Error',
    '#c62828': 'Color.Error',
}

# Patterns to detect hardcoded colors
COLOR_PATTERNS = [
    re.compile(r'Color="(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{8}|[A-Z][a-z]+)"'),
    re.compile(r'Background="(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{8})"'),
    re.compile(r'Foreground="(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{8})"'),
    re.compile(r'BorderBrush="(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{8})"'),
]

class ThemeAuditor:
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.issues: Dict[str, List[Tuple[int, str, str]]] = defaultdict(list)
        self.stats = {
            'files_scanned': 0,
            'files_with_issues': 0,
            'total_hardcoded_colors': 0,
            'files_fixed': 0,
            'replacements_made': 0,
        }
        
    def scan_file(self, file_path: Path) -> List[Tuple[int, str, str]]:
        """Scan a single AXAML file for hardcoded colors."""
        issues = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                
            for line_num, line in enumerate(lines, 1):
                # Skip comments and resource definitions
                if '<!--' in line or 'x:Key=' in line:
                    continue
                    
                for pattern in COLOR_PATTERNS:
                    matches = pattern.findall(line)
                    for color in matches:
                        # Skip if already using DynamicResource or StaticResource
                        if '{DynamicResource' in line or '{StaticResource' in line:
                            continue
                        issues.append((line_num, color, line.strip()))
                        
        except Exception as e:
            print(f"Error scanning {file_path}: {e}")
            
        return issues
    
    def scan_directory(self, pattern: str = '**/*.axaml'):
        """Scan all AXAML files in directory."""
        print(f"🔍 Scanning {self.root_dir} for hardcoded colors...")
        print("=" * 80)
        
        for axaml_file in self.root_dir.glob(pattern):
            # Skip certain directories
            if any(skip in str(axaml_file) for skip in ['bin', 'obj', 'node_modules']):
                continue
                
            self.stats['files_scanned'] += 1
            issues = self.scan_file(axaml_file)
            
            if issues:
                rel_path = axaml_file.relative_to(self.root_dir)
                self.issues[str(rel_path)] = issues
                self.stats['files_with_issues'] += 1
                self.stats['total_hardcoded_colors'] += len(issues)
    
    def report(self):
        """Generate audit report."""
        print(f"\n📊 AUDIT REPORT")
        print("=" * 80)
        print(f"Files scanned: {self.stats['files_scanned']}")
        print(f"Files with hardcoded colors: {self.stats['files_with_issues']}")
        print(f"Total hardcoded colors found: {self.stats['total_hardcoded_colors']}")
        print()
        
        if not self.issues:
            print("✅ No hardcoded colors found! All components are theme-aware.")
            return
            
        print("⚠️  FILES WITH HARDCODED COLORS:")
        print("-" * 80)
        
        for file_path, issues in sorted(self.issues.items()):
            print(f"\n📄 {file_path} ({len(issues)} issues)")
            for line_num, color, line_text in issues[:5]:  # Show first 5
                print(f"   Line {line_num}: {color}")
                print(f"      {line_text[:100]}")
            if len(issues) > 5:
                print(f"   ... and {len(issues) - 5} more")
    
    def fix_file(self, file_path: Path, dry_run: bool = False) -> int:
        """Fix hardcoded colors in a file by replacing with DynamicResource."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            replacements = 0
            
            # Replace Color="#..." with Color="{DynamicResource ...}"
            for hardcoded, resource_key in COLOR_MAPPING.items():
                # Background
                pattern = f'Background="{hardcoded}"'
                replacement = f'Background="{{DynamicResource {resource_key}}}"'
                if pattern in content:
                    content = content.replace(pattern, replacement)
                    replacements += 1
                
                # Foreground
                pattern = f'Foreground="{hardcoded}"'
                replacement = f'Foreground="{{DynamicResource {resource_key}}}"'
                if pattern in content:
                    content = content.replace(pattern, replacement)
                    replacements += 1
                
                # Color attribute
                pattern = f'Color="{hardcoded}"'
                replacement = f'Color="{{DynamicResource {resource_key}}}"'
                if pattern in content:
                    content = content.replace(pattern, replacement)
                    replacements += 1
                
                # BorderBrush
                pattern = f'BorderBrush="{hardcoded}"'
                replacement = f'BorderBrush="{{DynamicResource {resource_key}}}"'
                if pattern in content:
                    content = content.replace(pattern, replacement)
                    replacements += 1
            
            if replacements > 0 and not dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                    
            return replacements
            
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")
            return 0
    
    def fix_all(self, dry_run: bool = False):
        """Fix all files with hardcoded colors."""
        print(f"\n🔧 {'DRY RUN - ' if dry_run else ''}FIXING HARDCODED COLORS")
        print("=" * 80)
        
        for file_path_str in self.issues.keys():
            file_path = self.root_dir / file_path_str
            replacements = self.fix_file(file_path, dry_run=dry_run)
            
            if replacements > 0:
                self.stats['files_fixed'] += 1
                self.stats['replacements_made'] += replacements
                status = "Would fix" if dry_run else "Fixed"
                print(f"✅ {status} {file_path_str}: {replacements} replacements")
        
        print()
        print(f"Summary: {self.stats['files_fixed']} files, {self.stats['replacements_made']} replacements")


class ComponentStyleChecker:
    """Check if components are properly using theme resources."""
    
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.component_dirs = [
            'src/RenderX.Plugins.Header',
            'src/RenderX.Plugins.Canvas',
            'src/RenderX.Plugins.CanvasComponent',
            'src/RenderX.Plugins.ControlPanel',
            'src/RenderX.Plugins.Library',
            'src/RenderX.Plugins.LibraryComponent',
            'src/RenderX.Plugins.Components',
            'src/RenderX.Shell.Avalonia',
        ]
        
    def check_component_styles(self):
        """Check if component AXAML files use DynamicResource for colors."""
        print(f"\n🎨 COMPONENT STYLE CHECK")
        print("=" * 80)
        
        total_components = 0
        using_dynamic_resources = 0
        not_using_resources = []
        
        for comp_dir in self.component_dirs:
            full_path = self.root_dir / comp_dir
            if not full_path.exists():
                continue
                
            for axaml_file in full_path.glob('**/*.axaml'):
                if any(skip in str(axaml_file) for skip in ['bin', 'obj']):
                    continue
                    
                total_components += 1
                
                try:
                    with open(axaml_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Check if using DynamicResource for colors
                    has_dynamic = '{DynamicResource Color.' in content
                    has_hardcoded = re.search(r'(Background|Foreground|Color|BorderBrush)="#[0-9A-Fa-f]{6}"', content)
                    
                    if has_dynamic:
                        using_dynamic_resources += 1
                    elif has_hardcoded:
                        rel_path = axaml_file.relative_to(self.root_dir)
                        not_using_resources.append(str(rel_path))
                        
                except Exception as e:
                    print(f"Error checking {axaml_file}: {e}")
        
        print(f"Total components checked: {total_components}")
        print(f"Using DynamicResource: {using_dynamic_resources} ({using_dynamic_resources/total_components*100:.1f}%)")
        print(f"Not using theme resources: {len(not_using_resources)}")
        
        if not_using_resources:
            print("\n⚠️  Components not using theme resources:")
            for comp in not_using_resources[:20]:
                print(f"   - {comp}")
            if len(not_using_resources) > 20:
                print(f"   ... and {len(not_using_resources) - 20} more")


def main():
    import sys
    
    root_dir = Path(__file__).parent
    
    print("🎨 RenderX Theme Resource Auditor")
    print("=" * 80)
    
    # Parse arguments
    dry_run = '--dry-run' in sys.argv
    fix_mode = '--fix' in sys.argv
    check_only = '--check-only' in sys.argv
    
    if check_only:
        checker = ComponentStyleChecker(root_dir)
        checker.check_component_styles()
        return
    
    # Run audit
    auditor = ThemeAuditor(root_dir)
    auditor.scan_directory('src/**/*.axaml')
    auditor.report()
    
    # Fix if requested
    if fix_mode or dry_run:
        auditor.fix_all(dry_run=dry_run)
        
        if not dry_run:
            print("\n✅ All files have been updated to use theme-aware resources!")
            print("Run 'dotnet build' to verify the changes.")
    else:
        print("\n💡 Run with --fix to automatically replace hardcoded colors")
        print("   Run with --dry-run to preview changes without modifying files")
        print("   Run with --check-only to check component theme resource usage")


if __name__ == '__main__':
    main()
