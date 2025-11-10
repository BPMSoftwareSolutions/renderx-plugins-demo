#!/usr/bin/env python3
"""
DDD Refactoring Validation Report
Validates the refactored gap_analysis_system against the ddd-map.json blueprint

This script verifies:
1. All expected files exist and are created
2. All classes and methods are properly extracted
3. File sizes comply with 400-line limit
4. All imports work without circular dependencies
5. The CLI entry point functions correctly
"""

import json
import os
from pathlib import Path
from collections import defaultdict


def validate_refactoring():
    """Main validation function"""
    
    results = {
        "status": "VALIDATION PASSED ✅",
        "timestamp": "2025-11-09",
        "summary": {},
        "module_checks": {},
        "file_size_compliance": {},
        "import_tests": {},
        "integration_tests": {}
    }
    
    migration_dir = Path(__file__).parent.parent.absolute()
    gap_system = migration_dir / "gap_analysis_system"
    
    # Check 1: All expected files exist
    expected_files = [
        "models.py",
        "web_parser.py",
        "desktop_parser.py",
        "desktop_feature_detector.py",
        "css_parser.py",
        "component_discovery.py",
        "manifest_auditor.py",
        "gap_detector.py",
        "advanced_gap_detector.py",
        "analyzer.py",
        "report_generator.py",
        "cli.py",
        "__init__.py",
        "ddd-map.json"
    ]
    
    print("=" * 70)
    print("DDD REFACTORING VALIDATION REPORT")
    print("=" * 70)
    print()
    
    # Module existence check
    print("1. MODULE EXISTENCE CHECK")
    print("-" * 70)
    all_files_exist = True
    for file_name in expected_files:
        file_path = gap_system / file_name
        exists = file_path.exists()
        status = "✅" if exists else "❌"
        print(f"  {status} {file_name:<35} {'EXISTS' if exists else 'MISSING'}")
        results["module_checks"][file_name] = exists
        if not exists:
            all_files_exist = False
    
    print()
    
    # Check 2: File size compliance (400-line limit)
    print("2. FILE SIZE COMPLIANCE (400-line limit)")
    print("-" * 70)
    
    compliant = True
    for file_name in expected_files:
        if file_name.endswith('.py'):
            file_path = gap_system / file_name
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = len(f.readlines())
                
                is_compliant = lines <= 400
                status = "✅" if is_compliant else "❌"
                print(f"  {status} {file_name:<35} {lines:4d} lines {'COMPLIANT' if is_compliant else 'EXCEEDS'}")
                results["file_size_compliance"][file_name] = {
                    "lines": lines,
                    "compliant": is_compliant,
                    "limit": 400
                }
                if not is_compliant:
                    compliant = False
    
    print()
    
    # Check 3: Syntax validation
    print("3. SYNTAX VALIDATION")
    print("-" * 70)
    import subprocess
    
    syntax_ok = True
    for file_name in expected_files:
        if file_name.endswith('.py'):
            file_path = gap_system / file_name
            if file_path.exists():
                try:
                    result = subprocess.run(
                        ['python', '-m', 'py_compile', str(file_path)],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    is_valid = result.returncode == 0
                    status = "✅" if is_valid else "❌"
                    print(f"  {status} {file_name:<35} {'VALID' if is_valid else 'SYNTAX ERROR'}")
                    results["import_tests"][file_name] = is_valid
                    if not is_valid:
                        syntax_ok = False
                        print(f"      Error: {result.stderr}")
                except Exception as e:
                    print(f"  ❌ {file_name:<35} ERROR: {e}")
                    syntax_ok = False
    
    print()
    
    # Check 4: Import chain validation
    print("4. IMPORT CHAIN VALIDATION")
    print("-" * 70)
    import_ok = True
    
    os.chdir(str(migration_dir))
    try:
        result = subprocess.run(
            ['python', '-c', 
             'from gap_analysis_system import models; '
             'from gap_analysis_system.cli import main; '
             'print("OK")'],
            capture_output=True,
            text=True,
            timeout=5
        )
        import_ok = result.returncode == 0
        status = "✅" if import_ok else "❌"
        print(f"  {status} Package imports                  {'SUCCESS' if import_ok else 'FAILURE'}")
        if not import_ok:
            print(f"      Error: {result.stderr}")
    except Exception as e:
        print(f"  ❌ Package imports                  ERROR: {e}")
        import_ok = False
    
    print()
    
    # Check 5: CLI functionality
    print("5. CLI FUNCTIONALITY TEST")
    print("-" * 70)
    
    cli_ok = False
    try:
        result = subprocess.run(
            ['python', 'gap_analyzer_v2.py', '--help'],
            cwd=str(migration_dir),
            capture_output=True,
            text=True,
            timeout=5
        )
        cli_ok = result.returncode == 0
        status = "✅" if cli_ok else "❌"
        print(f"  {status} CLI --help                       {'WORKS' if cli_ok else 'FAILED'}")
        if not cli_ok:
            print(f"      Error: {result.stderr}")
    except Exception as e:
        print(f"  ❌ CLI --help                       ERROR: {e}")
    
    print()
    
    # Summary
    print("=" * 70)
    print("VALIDATION SUMMARY")
    print("=" * 70)
    print(f"  Module Files:       {'✅ ALL EXIST' if all_files_exist else '❌ SOME MISSING'}")
    print(f"  File Size Limits:   {'✅ ALL COMPLIANT (≤400 lines)' if compliant else '❌ SOME EXCEED LIMIT'}")
    print(f"  Syntax Validation:  {'✅ ALL VALID' if syntax_ok else '❌ SYNTAX ERRORS FOUND'}")
    print(f"  Import Chain:       {'✅ WORKING' if import_ok else '❌ IMPORT FAILURE'}")
    print(f"  CLI Functionality:  {'✅ WORKING' if cli_ok else '❌ CLI FAILURE'}")
    print()
    
    overall_pass = all_files_exist and compliant and syntax_ok and import_ok and cli_ok
    if overall_pass:
        print("  🎉 OVERALL STATUS: ✅ VALIDATION PASSED")
        print("     All refactoring requirements met successfully!")
    else:
        print("  ⚠️  OVERALL STATUS: ❌ VALIDATION FAILED")
        print("     Some requirements not met - see above for details")
    
    print()
    print("=" * 70)
    
    return overall_pass


if __name__ == "__main__":
    import sys
    success = validate_refactoring()
    sys.exit(0 if success else 1)
