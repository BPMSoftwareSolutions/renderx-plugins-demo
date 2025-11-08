#!/usr/bin/env python3
"""
Folder Tree Scanner

A Python script that scans a directory and its subdirectories to create
an ASCII tree representation of the folder/file structure.

Usage:
    python folder_tree_scanner.py [path] [options]

Options:
    --max-depth N     : Limit scanning to N levels deep (default: unlimited)
    --show-hidden     : Include hidden files and folders (starting with .)
    --files-only      : Show only files, not folders
    --folders-only    : Show only folders, not files
    --ignore PATTERN  : Ignore files/folders matching pattern (can be used multiple times)
    --output FILE     : Save output to file instead of printing to console
    --size            : Show file sizes
    --sort            : Sort entries alphabetically

Examples:
    python folder_tree_scanner.py
    python folder_tree_scanner.py /path/to/folder
    python folder_tree_scanner.py . --max-depth 3 --show-hidden
    python folder_tree_scanner.py . --ignore "*.pyc" --ignore "__pycache__" --size
"""

import os
import sys
import argparse
import fnmatch
from pathlib import Path
from typing import List, Optional, Set


class TreeScanner:
    def __init__(self, 
                 show_hidden: bool = False,
                 files_only: bool = False,
                 folders_only: bool = False,
                 ignore_patterns: List[str] = None,
                 show_size: bool = False,
                 sort_entries: bool = False,
                 max_depth: Optional[int] = None):
        self.show_hidden = show_hidden
        self.files_only = files_only
        self.folders_only = folders_only
        self.ignore_patterns = ignore_patterns or []
        self.show_size = show_size
        self.sort_entries = sort_entries
        self.max_depth = max_depth
        
    def should_ignore(self, name: str) -> bool:
        """Check if a file/folder should be ignored based on patterns."""
        for pattern in self.ignore_patterns:
            if fnmatch.fnmatch(name, pattern):
                return True
        return False
    
    def format_size(self, size_bytes: int) -> str:
        """Convert bytes to human readable format."""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:3.1f}{unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f}PB"
    
    def get_file_size(self, path: Path) -> str:
        """Get formatted file size."""
        try:
            size = path.stat().st_size
            return f" ({self.format_size(size)})"
        except (OSError, PermissionError):
            return " (size unknown)"
    
    def scan_directory(self, root_path: Path, prefix: str = "", depth: int = 0) -> List[str]:
        """
        Recursively scan directory and return list of formatted lines.
        
        Args:
            root_path: Path to scan
            prefix: Current line prefix for tree formatting
            depth: Current depth level
            
        Returns:
            List of formatted strings representing the tree structure
        """
        lines = []
        
        # Check depth limit
        if self.max_depth is not None and depth > self.max_depth:
            return lines
        
        try:
            # Get all entries in the directory
            entries = list(root_path.iterdir())
            
            # Filter entries based on options
            filtered_entries = []
            for entry in entries:
                # Skip hidden files if not requested
                if not self.show_hidden and entry.name.startswith('.'):
                    continue
                    
                # Skip ignored patterns
                if self.should_ignore(entry.name):
                    continue
                    
                # Filter by type if requested
                if self.files_only and entry.is_dir():
                    continue
                if self.folders_only and entry.is_file():
                    continue
                    
                filtered_entries.append(entry)
            
            # Sort if requested
            if self.sort_entries:
                filtered_entries.sort(key=lambda x: (x.is_file(), x.name.lower()))
            
            # Process each entry
            for i, entry in enumerate(filtered_entries):
                is_last = i == len(filtered_entries) - 1
                
                # Determine tree characters
                if is_last:
                    tree_char = "└── "
                    next_prefix = prefix + "    "
                else:
                    tree_char = "├── "
                    next_prefix = prefix + "│   "
                
                # Format entry name with optional size
                entry_name = entry.name
                if self.show_size and entry.is_file():
                    entry_name += self.get_file_size(entry)
                
                # Add folder indicator
                if entry.is_dir():
                    entry_name += "/"
                
                # Add the line
                lines.append(f"{prefix}{tree_char}{entry_name}")
                
                # Recursively process subdirectories
                if entry.is_dir():
                    lines.extend(self.scan_directory(entry, next_prefix, depth + 1))
                    
        except PermissionError:
            lines.append(f"{prefix}├── [Permission Denied]")
        except Exception as e:
            lines.append(f"{prefix}├── [Error: {str(e)}]")
            
        return lines
    
    def scan(self, path: str) -> str:
        """
        Scan the given path and return ASCII tree representation.
        
        Args:
            path: Path to scan
            
        Returns:
            String containing the ASCII tree
        """
        root_path = Path(path).resolve()
        
        if not root_path.exists():
            return f"Error: Path '{path}' does not exist."
            
        if not root_path.is_dir():
            return f"Error: Path '{path}' is not a directory."
        
        # Start with root directory
        result_lines = [str(root_path) + "/"]
        
        # Add tree structure
        result_lines.extend(self.scan_directory(root_path))
        
        return "\n".join(result_lines)


def main():
    parser = argparse.ArgumentParser(
        description="Generate ASCII tree representation of folder structure",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                                    # Scan current directory
  %(prog)s /path/to/folder                    # Scan specific directory
  %(prog)s . --max-depth 3                   # Limit depth to 3 levels
  %(prog)s . --show-hidden --size            # Show hidden files with sizes
  %(prog)s . --ignore "*.pyc" --ignore "node_modules"  # Ignore patterns
  %(prog)s . --output tree.txt               # Save to file
        """
    )
    
    parser.add_argument('path', nargs='?', default='.', 
                       help='Path to scan (default: current directory)')
    parser.add_argument('--max-depth', type=int, metavar='N',
                       help='Maximum depth to scan')
    parser.add_argument('--show-hidden', action='store_true',
                       help='Include hidden files and folders')
    parser.add_argument('--files-only', action='store_true',
                       help='Show only files, not folders')
    parser.add_argument('--folders-only', action='store_true',
                       help='Show only folders, not files')
    parser.add_argument('--ignore', action='append', metavar='PATTERN',
                       help='Ignore files/folders matching pattern (can be used multiple times)')
    parser.add_argument('--output', metavar='FILE',
                       help='Save output to file instead of printing')
    parser.add_argument('--size', action='store_true',
                       help='Show file sizes')
    parser.add_argument('--sort', action='store_true',
                       help='Sort entries alphabetically')
    
    args = parser.parse_args()
    
    # Validate conflicting options
    if args.files_only and args.folders_only:
        print("Error: --files-only and --folders-only cannot be used together")
        sys.exit(1)
    
    # Create scanner with options
    scanner = TreeScanner(
        show_hidden=args.show_hidden,
        files_only=args.files_only,
        folders_only=args.folders_only,
        ignore_patterns=args.ignore or [],
        show_size=args.size,
        sort_entries=args.sort,
        max_depth=args.max_depth
    )
    
    # Scan the directory
    try:
        result = scanner.scan(args.path)
        
        # Output result
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(result)
            print(f"Tree structure saved to '{args.output}'")
        else:
            print(result)
            
    except KeyboardInterrupt:
        print("\nScan interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()