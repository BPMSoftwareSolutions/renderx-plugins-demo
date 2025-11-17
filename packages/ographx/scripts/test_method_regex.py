#!/usr/bin/env python3
"""
Test the METHOD_RE regex to confirm it's matching 'if' statements
"""
import re

# Current regex (BROKEN)
METHOD_RE_BROKEN = re.compile(r'^\s*(?:(?:public|private|protected|static|async)\s+)*([A-Za-z_]\w*)\s*\((.*?)\)\s*(?::\s*[^({]+)?\s*{')

# Fixed regex (should exclude keywords)
# Use word boundary to ensure we're matching whole words only
METHOD_RE_FIXED = re.compile(r'^\s*(?:(?:public|private|protected|static|async)\s+)*(?!(?:if|for|while|switch|catch|return|typeof|new|delete|throw|function|class|constructor|super|await|yield|case|of|in|instanceof|else|do|try|finally|with|debugger|break|continue)\s*\()([A-Za-z_]\w*)\s*\((.*?)\)\s*(?::\s*[^({]+)?\s*{')

test_cases = [
    ("      if (options.compress) {", "if", True),  # Should NOT match
    ("      for (let i = 0; i < 10; i++) {", "for", True),  # Should NOT match
    ("      while (true) {", "while", True),  # Should NOT match
    ("      private handleExport(options: any) {", "handleExport", False),  # Should match
    ("      public async doSomething(x: number) {", "doSomething", False),  # Should match
    ("      constructor(name: string) {", "constructor", True),  # Should NOT match
    ("      private setupCommands(): void {", "setupCommands", False),  # Should match
]

print("=" * 80)
print("TESTING METHOD_RE REGEX")
print("=" * 80)

print("\nBROKEN REGEX (current):")
print("-" * 80)
for line, expected_name, should_not_match in test_cases:
    m = METHOD_RE_BROKEN.match(line)
    if m:
        matched_name = m.group(1)
        status = "✗ WRONG" if should_not_match else "✓ OK"
        print(f"{status}: '{line.strip()}' -> matched '{matched_name}'")
    else:
        status = "✓ OK" if should_not_match else "✗ WRONG"
        print(f"{status}: '{line.strip()}' -> no match")

print("\n\nFIXED REGEX (with negative lookahead):")
print("-" * 80)
for line, expected_name, should_not_match in test_cases:
    m = METHOD_RE_FIXED.match(line)
    if m:
        matched_name = m.group(1)
        status = "✗ WRONG" if should_not_match else "✓ OK"
        print(f"{status}: '{line.strip()}' -> matched '{matched_name}'")
    else:
        status = "✓ OK" if should_not_match else "✗ WRONG"
        print(f"{status}: '{line.strip()}' -> no match")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print("The BROKEN regex matches 'if', 'for', 'while', 'constructor' as methods!")
print("The FIXED regex uses negative lookahead to exclude keywords.")

