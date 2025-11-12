#!/usr/bin/env python3
"""
Logging Parity Analyzer
=======================
Analyzes logging gaps between the web (production) and Avalonia (desktop) variants
of MusicalConductor to identify where desktop needs to achieve parity.

Since the web variant is the production system, this analysis focuses on:
1. What logging exists in web that's missing in desktop
2. Message content alignment
3. Severity level consistency
4. Coverage gaps in desktop implementation

Usage:
    python logging_parity_analyzer.py
"""

import json
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Set
from dataclasses import dataclass
import re


@dataclass
class ParityGap:
    """Represents a logging gap between web and desktop"""
    gap_type: str  # 'missing_in_desktop', 'severity_mismatch', 'message_mismatch'
    category: str
    web_file: str
    web_line: int
    web_message: str
    web_severity: str
    desktop_file: str = None
    desktop_line: int = None
    desktop_message: str = None
    desktop_severity: str = None
    similarity_score: float = 0.0
    recommendation: str = ""


class LoggingParityAnalyzer:
    """Analyzes parity between web and desktop logging"""

    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.web_logs: List[Dict] = []
        self.desktop_logs: List[Dict] = []
        self.gaps: List[ParityGap] = []
        
        # Severity mapping between platforms
        self.severity_map = {
            'INFO': 'Information',
            'WARN': 'Warning',
            'ERROR': 'Error',
            'DEBUG': 'Debug',
        }
        
        # Category mapping between platforms
        self.category_map = {
            'EventBus': 'EventBus',
            'MusicalConductor': 'Conductor',
            'PluginManager': 'PluginManagement',
            'PluginLoader': 'PluginManagement',
            'PluginSystem': 'PluginManagement',
            'ExecutionQueue': 'ExecutionQueue',
            'BeatExecution': 'SequenceExecution',
            'MovementExecution': 'SequenceExecution',
            'SequenceManagement': 'SequenceExecution',
            'ResourceManagement': 'Resources',
            'Validation': 'Validation',
            'Logging': 'Logging',
        }

    def load_data(self) -> bool:
        """Load JSON data from both scanners"""
        web_file = self.output_dir / "musical_conductor_logging_data.json"
        desktop_file = self.output_dir / "avalonia_logging_data.json"
        
        print(f"📂 Loading data files...")
        
        try:
            with open(web_file, 'r', encoding='utf-8') as f:
                web_data = json.load(f)
                self.web_logs = web_data['log_entries']
                print(f"✅ Loaded {len(self.web_logs)} web log entries")
        except Exception as e:
            print(f"❌ Error loading web data: {e}")
            return False
        
        try:
            with open(desktop_file, 'r', encoding='utf-8') as f:
                desktop_data = json.load(f)
                self.desktop_logs = desktop_data['log_entries']
                print(f"✅ Loaded {len(self.desktop_logs)} desktop log entries")
        except Exception as e:
            print(f"❌ Error loading desktop data: {e}")
            return False
        
        return True

    def analyze_parity(self) -> None:
        """Perform comprehensive parity analysis"""
        print(f"\n🔍 Analyzing logging parity...")
        
        # Group logs by category for analysis
        web_by_category = self._group_by_category(self.web_logs, is_web=True)
        desktop_by_category = self._group_by_category(self.desktop_logs, is_web=False)
        
        # Analyze each category
        all_categories = set(web_by_category.keys()) | set(desktop_by_category.keys())
        
        for category in sorted(all_categories):
            web_entries = web_by_category.get(category, [])
            desktop_entries = desktop_by_category.get(category, [])
            
            self._analyze_category(category, web_entries, desktop_entries)
        
        print(f"✅ Found {len(self.gaps)} parity gaps\n")

    def _group_by_category(self, logs: List[Dict], is_web: bool) -> Dict[str, List[Dict]]:
        """Group log entries by normalized category"""
        grouped = defaultdict(list)
        
        for log in logs:
            # Skip test files
            if 'test' in log['file_path'].lower():
                continue
            
            # Skip CLI/tools for web (not part of core)
            if is_web and ('tools/cli' in log['file_path'] or 'demo.ts' in log['file_path']):
                continue
            
            category = log['category']
            
            # Normalize category using mapping
            if is_web and category in self.category_map:
                category = self.category_map[category]
            
            grouped[category].append(log)
        
        return grouped

    def _analyze_category(self, category: str, web_entries: List[Dict], 
                         desktop_entries: List[Dict]) -> None:
        """Analyze parity for a specific category"""
        
        # Check for completely missing categories
        if web_entries and not desktop_entries:
            for web_entry in web_entries:
                gap = ParityGap(
                    gap_type='missing_category',
                    category=category,
                    web_file=web_entry['file_path'],
                    web_line=web_entry['line_number'],
                    web_message=web_entry['message'],
                    web_severity=web_entry['severity'],
                    recommendation=f"Implement {category} logging in desktop variant"
                )
                self.gaps.append(gap)
            return
        
        # Match web logs to desktop logs
        for web_entry in web_entries:
            best_match, similarity = self._find_best_match(web_entry, desktop_entries)
            
            if similarity < 0.3:
                # No match found - missing in desktop
                gap = ParityGap(
                    gap_type='missing_in_desktop',
                    category=category,
                    web_file=web_entry['file_path'],
                    web_line=web_entry['line_number'],
                    web_message=web_entry['message'],
                    web_severity=web_entry['severity'],
                    similarity_score=similarity,
                    recommendation=self._generate_recommendation(web_entry, None)
                )
                self.gaps.append(gap)
            
            elif best_match:
                # Check for severity mismatch
                web_severity_normalized = self.severity_map.get(web_entry['severity'], web_entry['severity'])
                desktop_severity = best_match['severity']
                
                if web_severity_normalized != desktop_severity:
                    gap = ParityGap(
                        gap_type='severity_mismatch',
                        category=category,
                        web_file=web_entry['file_path'],
                        web_line=web_entry['line_number'],
                        web_message=web_entry['message'],
                        web_severity=web_entry['severity'],
                        desktop_file=best_match['file_path'],
                        desktop_line=best_match['line_number'],
                        desktop_message=best_match['message'],
                        desktop_severity=desktop_severity,
                        similarity_score=similarity,
                        recommendation=f"Change desktop severity from {desktop_severity} to {web_severity_normalized}"
                    )
                    self.gaps.append(gap)

    def _find_best_match(self, web_entry: Dict, desktop_entries: List[Dict]) -> Tuple[Dict, float]:
        """Find the best matching desktop log entry for a web entry"""
        best_match = None
        best_similarity = 0.0
        
        web_message = self._normalize_message(web_entry['message'])
        
        for desktop_entry in desktop_entries:
            desktop_message = self._normalize_message(desktop_entry['message'])
            similarity = self._calculate_similarity(web_message, desktop_message)
            
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = desktop_entry
        
        return best_match, best_similarity

    def _normalize_message(self, message: str) -> str:
        """Normalize a log message for comparison"""
        # Remove common prefixes/emojis
        message = re.sub(r'^[🎼🎵🥁📡✅❌⚠️🔴🟡🔵▶️📊📈📝🔄🧹🎭]+\s*', '', message)
        
        # Remove quotes
        message = message.replace('"', '').replace("'", '')
        
        # Remove template parameters {xxx} and ${}
        message = re.sub(r'\{[^}]+\}', '{param}', message)
        message = re.sub(r'\$\{[^}]+\}', '{param}', message)
        
        # Normalize whitespace
        message = ' '.join(message.split())
        
        # Convert to lowercase
        message = message.lower()
        
        return message

    def _calculate_similarity(self, msg1: str, msg2: str) -> float:
        """Calculate similarity score between two messages"""
        if not msg1 or not msg2:
            return 0.0
        
        # Exact match after normalization
        if msg1 == msg2:
            return 1.0
        
        # Check if one contains the other
        if msg1 in msg2 or msg2 in msg1:
            shorter = min(len(msg1), len(msg2))
            longer = max(len(msg1), len(msg2))
            return shorter / longer
        
        # Simple word overlap
        words1 = set(msg1.split())
        words2 = set(msg2.split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1 & words2
        union = words1 | words2
        
        return len(intersection) / len(union)

    def _generate_recommendation(self, web_entry: Dict, desktop_entry: Dict) -> str:
        """Generate a specific recommendation for addressing the gap"""
        category = web_entry['category']
        severity = web_entry['severity']
        
        # Find likely file location in desktop
        file_hint = self._suggest_desktop_file(web_entry['file_path'])
        
        recommendation = f"Add logging to {file_hint}: "
        
        # Map to C# ILogger method
        severity_normalized = self.severity_map.get(severity, 'Information')
        method = f"_logger.Log{severity_normalized}"
        
        # Extract message template
        message = web_entry['message'][:80]
        
        recommendation += f"`{method}(\"{message}...\")`"
        
        return recommendation

    def _suggest_desktop_file(self, web_file: str) -> str:
        """Suggest the likely desktop file location based on web file"""
        # Extract component name from web path
        if 'EventBus.ts' in web_file:
            return 'MusicalConductor.Core/EventBus.cs'
        elif 'MusicalConductor.ts' in web_file:
            return 'MusicalConductor.Core/Conductor.cs'
        elif 'ExecutionQueue.ts' in web_file:
            return 'MusicalConductor.Core/ExecutionQueue.cs'
        elif 'SequenceExecutor.ts' in web_file:
            return 'MusicalConductor.Core/SequenceExecutor.cs'
        elif 'PluginManager.ts' in web_file:
            return 'MusicalConductor.Core/PluginManager.cs'
        elif 'BeatExecutor.ts' in web_file:
            return 'MusicalConductor.Core/SequenceExecutor.cs'
        else:
            return 'appropriate desktop file'

    def generate_report(self, output_file: str) -> None:
        """Generate comprehensive parity gap report"""
        print(f"📝 Generating parity report: {output_file}")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Logging Parity Gap Analysis: Web → Desktop\n\n")
            f.write("**Purpose:** Identify logging gaps where desktop needs to achieve parity with web (production)\n\n")
            f.write(f"**Generated:** {self._get_timestamp()}\n\n")
            
            # Executive Summary
            self._write_executive_summary(f)
            
            # ASCII Visualization
            self._write_visualization(f)
            
            # Gap Analysis by Type
            self._write_gap_by_type(f)
            
            # Gap Analysis by Category
            self._write_gap_by_category(f)
            
            # Priority Recommendations
            self._write_priority_recommendations(f)
            
            # Detailed Gap Inventory
            self._write_detailed_gaps(f)
            
            # Implementation Guide
            self._write_implementation_guide(f)
        
        print(f"✅ Report generated: {output_file}\n")

    def _write_executive_summary(self, f) -> None:
        """Write executive summary"""
        f.write("## Executive Summary\n\n")
        
        # Filter out test and CLI logs
        web_core_logs = [log for log in self.web_logs 
                        if 'test' not in log['file_path'].lower() 
                        and 'tools/cli' not in log['file_path']
                        and 'demo.ts' not in log['file_path']]
        desktop_core_logs = [log for log in self.desktop_logs 
                            if 'test' not in log['file_path'].lower()]
        
        f.write(f"**Web (Production) Core Logging:** {len(web_core_logs)} statements\n")
        f.write(f"**Desktop Core Logging:** {len(desktop_core_logs)} statements\n")
        f.write(f"**Gap:** {len(web_core_logs) - len(desktop_core_logs)} statements ({((len(web_core_logs) - len(desktop_core_logs)) / len(web_core_logs) * 100):.1f}%)\n\n")
        
        f.write(f"**Total Parity Gaps Identified:** {len(self.gaps)}\n\n")
        
        # Count by gap type
        gap_types = Counter(gap.gap_type for gap in self.gaps)
        
        f.write("### Gap Breakdown\n\n")
        for gap_type, count in gap_types.most_common():
            percentage = (count / len(self.gaps) * 100) if self.gaps else 0
            f.write(f"- **{gap_type.replace('_', ' ').title()}:** {count} ({percentage:.1f}%)\n")
        
        f.write("\n")
        
        # Critical categories missing
        missing_categories = set()
        for gap in self.gaps:
            if gap.gap_type in ['missing_category', 'missing_in_desktop']:
                missing_categories.add(gap.category)
        
        if missing_categories:
            f.write("### Categories Needing Attention\n\n")
            for category in sorted(missing_categories):
                category_gaps = [g for g in self.gaps if g.category == category 
                               and g.gap_type in ['missing_category', 'missing_in_desktop']]
                f.write(f"- **{category}:** {len(category_gaps)} missing log statements\n")
            f.write("\n")

    def _write_visualization(self, f) -> None:
        """Write ASCII visualization"""
        f.write("## ASCII Visualization\n\n")
        
        # Gaps by category
        f.write("### Missing Log Statements by Category\n\n")
        f.write("```\n")
        
        category_gaps = defaultdict(int)
        for gap in self.gaps:
            if gap.gap_type in ['missing_category', 'missing_in_desktop']:
                category_gaps[gap.category] += 1
        
        if category_gaps:
            max_count = max(category_gaps.values())
            
            for category, count in sorted(category_gaps.items(), key=lambda x: x[1], reverse=True):
                bar_length = int((count / max_count) * 50)
                bar = '█' * bar_length
                f.write(f"{category:25} │{bar} {count}\n")
        else:
            f.write("(No missing statements found)\n")
        
        f.write("```\n\n")
        
        # Gap types distribution
        f.write("### Gap Type Distribution\n\n")
        f.write("```\n")
        
        gap_types = Counter(gap.gap_type for gap in self.gaps)
        
        if gap_types:
            max_count = max(gap_types.values())
            
            for gap_type, count in sorted(gap_types.items(), key=lambda x: x[1], reverse=True):
                bar_length = int((count / max_count) * 50)
                bar = '▓' * bar_length
                display_name = gap_type.replace('_', ' ').title()
                f.write(f"{display_name:30} │{bar} {count}\n")
        
        f.write("```\n\n")

    def _write_gap_by_type(self, f) -> None:
        """Write gap analysis by type"""
        f.write("## Gap Analysis by Type\n\n")
        
        gap_by_type = defaultdict(list)
        for gap in self.gaps:
            gap_by_type[gap.gap_type].append(gap)
        
        for gap_type in sorted(gap_by_type.keys()):
            gaps = gap_by_type[gap_type]
            display_name = gap_type.replace('_', ' ').title()
            
            f.write(f"### {display_name} ({len(gaps)} gaps)\n\n")
            
            if gap_type == 'missing_in_desktop':
                f.write("These log statements exist in the web variant but are missing in desktop.\n\n")
            elif gap_type == 'missing_category':
                f.write("These entire categories have logging in web but none in desktop.\n\n")
            elif gap_type == 'severity_mismatch':
                f.write("These log statements exist in both but have different severity levels.\n\n")
            
            # Show top 10 examples
            f.write(f"**Top {min(10, len(gaps))} Examples:**\n\n")
            
            for i, gap in enumerate(gaps[:10], 1):
                f.write(f"{i}. **{gap.category}**: {gap.web_message[:80]}...\n")
                f.write(f"   - Web: `{gap.web_file}:{gap.web_line}` ({gap.web_severity})\n")
                if gap.desktop_file:
                    f.write(f"   - Desktop: `{gap.desktop_file}:{gap.desktop_line}` ({gap.desktop_severity})\n")
                else:
                    f.write(f"   - Desktop: Missing\n")
                f.write(f"   - Action: {gap.recommendation}\n\n")

    def _write_gap_by_category(self, f) -> None:
        """Write gap analysis by category"""
        f.write("## Gap Analysis by Category\n\n")
        
        gap_by_category = defaultdict(list)
        for gap in self.gaps:
            gap_by_category[gap.category].append(gap)
        
        f.write("| Category | Missing | Severity Mismatch | Total Gaps |\n")
        f.write("|----------|---------|-------------------|------------|\n")
        
        for category in sorted(gap_by_category.keys()):
            gaps = gap_by_category[category]
            missing = sum(1 for g in gaps if g.gap_type in ['missing_category', 'missing_in_desktop'])
            severity = sum(1 for g in gaps if g.gap_type == 'severity_mismatch')
            f.write(f"| {category} | {missing} | {severity} | {len(gaps)} |\n")
        
        f.write("\n")

    def _write_priority_recommendations(self, f) -> None:
        """Write priority recommendations"""
        f.write("## Priority Recommendations\n\n")
        
        # Prioritize by category importance and gap count
        category_priority = {
            'Conductor': 1,
            'EventBus': 2,
            'SequenceExecution': 3,
            'ExecutionQueue': 4,
            'PluginManagement': 5,
        }
        
        gap_by_category = defaultdict(list)
        for gap in self.gaps:
            if gap.gap_type in ['missing_category', 'missing_in_desktop']:
                gap_by_category[gap.category].append(gap)
        
        # Sort by priority and count
        sorted_categories = sorted(
            gap_by_category.items(),
            key=lambda x: (category_priority.get(x[0], 99), -len(x[1]))
        )
        
        f.write("### Implementation Priority\n\n")
        
        for i, (category, gaps) in enumerate(sorted_categories[:5], 1):
            f.write(f"#### Priority {i}: {category} ({len(gaps)} gaps)\n\n")
            f.write(f"**Impact:** {'Critical' if i <= 2 else 'High' if i <= 4 else 'Medium'}\n\n")
            f.write(f"**Actions Required:**\n")
            
            # Group by file
            gaps_by_file = defaultdict(list)
            for gap in gaps:
                suggested_file = self._suggest_desktop_file(gap.web_file)
                gaps_by_file[suggested_file].append(gap)
            
            for file, file_gaps in sorted(gaps_by_file.items()):
                f.write(f"- `{file}`: Add {len(file_gaps)} log statement(s)\n")
            
            f.write("\n")

    def _write_detailed_gaps(self, f) -> None:
        """Write detailed gap inventory"""
        f.write("## Detailed Gap Inventory\n\n")
        
        gap_by_category = defaultdict(list)
        for gap in self.gaps:
            gap_by_category[gap.category].append(gap)
        
        for category in sorted(gap_by_category.keys()):
            gaps = gap_by_category[category]
            f.write(f"### {category} ({len(gaps)} gaps)\n\n")
            
            f.write("| # | Gap Type | Web Location | Message | Severity | Recommendation |\n")
            f.write("|---|----------|--------------|---------|----------|----------------|\n")
            
            for i, gap in enumerate(gaps, 1):
                gap_type_short = gap.gap_type.replace('_', ' ')
                web_loc = f"`{Path(gap.web_file).name}:{gap.web_line}`"
                message = gap.web_message[:50].replace('|', '\\|')
                f.write(f"| {i} | {gap_type_short} | {web_loc} | {message}... | {gap.web_severity} | {gap.recommendation[:50]}... |\n")
            
            f.write("\n")

    def _write_implementation_guide(self, f) -> None:
        """Write implementation guide"""
        f.write("## Implementation Guide\n\n")
        
        f.write("### Step-by-Step Process\n\n")
        
        f.write("1. **Review Priority Categories**\n")
        f.write("   - Start with Conductor, EventBus, and SequenceExecution\n")
        f.write("   - These are core to the system's operation\n\n")
        
        f.write("2. **For Each Missing Log Statement**\n")
        f.write("   ```csharp\n")
        f.write("   // Find equivalent location in desktop C# code\n")
        f.write("   // Add ILogger call with structured logging\n")
        f.write("   _logger.LogInformation(\"Message {Param1} {Param2}\", value1, value2);\n")
        f.write("   ```\n\n")
        
        f.write("3. **Severity Mapping**\n")
        f.write("   - Web `INFO` → Desktop `LogInformation`\n")
        f.write("   - Web `WARN` → Desktop `LogWarning`\n")
        f.write("   - Web `ERROR` → Desktop `LogError`\n")
        f.write("   - Web `DEBUG` → Desktop `LogDebug`\n\n")
        
        f.write("4. **Message Template Conversion**\n")
        f.write("   ```typescript\n")
        f.write("   // Web (TypeScript)\n")
        f.write("   console.log(`Processing ${sequenceName} with ${beatCount} beats`);\n")
        f.write("   ```\n")
        f.write("   ```csharp\n")
        f.write("   // Desktop (C#) - Use structured logging\n")
        f.write("   _logger.LogInformation(\"Processing {SequenceName} with {BeatCount} beats\", \n")
        f.write("       sequenceName, beatCount);\n")
        f.write("   ```\n\n")
        
        f.write("5. **Verification**\n")
        f.write("   - Re-run both scanners after implementation\n")
        f.write("   - Check that gap count decreases\n")
        f.write("   - Verify messages appear in desktop logs during testing\n\n")
        
        f.write("### Code Review Checklist\n\n")
        f.write("- [ ] All critical categories have equivalent logging\n")
        f.write("- [ ] Severity levels match between web and desktop\n")
        f.write("- [ ] Structured logging is used (not string interpolation)\n")
        f.write("- [ ] Icon/emoji prefixes are consistent (🎼, ✅, ❌, etc.)\n")
        f.write("- [ ] Log messages provide sufficient context\n")
        f.write("- [ ] No sensitive data in log parameters\n\n")

    def export_gap_json(self, output_file: str) -> None:
        """Export gaps as JSON for programmatic processing"""
        print(f"📤 Exporting gap data: {output_file}")
        
        gaps_data = []
        for gap in self.gaps:
            gaps_data.append({
                'gap_type': gap.gap_type,
                'category': gap.category,
                'web': {
                    'file': gap.web_file,
                    'line': gap.web_line,
                    'message': gap.web_message,
                    'severity': gap.web_severity,
                },
                'desktop': {
                    'file': gap.desktop_file,
                    'line': gap.desktop_line,
                    'message': gap.desktop_message,
                    'severity': gap.desktop_severity,
                } if gap.desktop_file else None,
                'similarity_score': gap.similarity_score,
                'recommendation': gap.recommendation,
            })
        
        data = {
            'metadata': {
                'generated': self._get_timestamp(),
                'total_gaps': len(self.gaps),
                'web_logs_analyzed': len(self.web_logs),
                'desktop_logs_analyzed': len(self.desktop_logs),
            },
            'gaps': gaps_data
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        print(f"✅ Gap data exported: {output_file}\n")

    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def main():
    """Main entry point"""
    script_dir = Path(__file__).parent
    output_dir = script_dir / "output"
    
    print("=" * 70)
    print("  Logging Parity Gap Analysis: Web → Desktop")
    print("=" * 70)
    print()
    
    analyzer = LoggingParityAnalyzer(str(output_dir))
    
    # Load data
    if not analyzer.load_data():
        print("❌ Failed to load data. Please run both scanners first.")
        return
    
    # Analyze parity
    analyzer.analyze_parity()
    
    # Generate reports
    report_file = output_dir / "logging_parity_gap_analysis.md"
    json_file = output_dir / "logging_parity_gaps.json"
    
    analyzer.generate_report(str(report_file))
    analyzer.export_gap_json(str(json_file))
    
    print("=" * 70)
    print("✅ Analysis complete!")
    print(f"📄 Report: {report_file}")
    print(f"📊 Data: {json_file}")
    print("=" * 70)


if __name__ == "__main__":
    main()
