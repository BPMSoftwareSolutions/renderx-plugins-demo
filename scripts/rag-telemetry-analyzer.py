#!/usr/bin/env python3
"""
RAG-Powered Telemetry Analyzer
Analyzes telemetry logs and uses the OgraphX-RAG system to find relevant code and solutions.

Usage:
    python scripts/rag-telemetry-analyzer.py .logs/telemetry-diagnostics-1762904455548.json
    python scripts/rag-telemetry-analyzer.py .logs/telemetry-diagnostics-1762904455548.json --detailed
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Any
from collections import defaultdict

# Ensure UTF-8 output on Windows terminals
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass


def load_telemetry_log(log_path: Path) -> Dict[str, Any]:
    """Load and parse telemetry log file."""
    with open(log_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def extract_issues(telemetry_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract errors, warnings, and issues from telemetry data."""
    issues = []
    
    # Check for error/failure topics
    error_keywords = ['error', 'fail', 'warning', 'issue', 'problem']
    
    # Extract from stage1_rawLog topics
    if 'stage1_rawLog' in telemetry_data and 'topics' in telemetry_data['stage1_rawLog']:
        topics = telemetry_data['stage1_rawLog']['topics']
        for topic_name, topic_data in topics.items():
            topic_lower = topic_name.lower()
            if any(keyword in topic_lower for keyword in error_keywords):
                issues.append({
                    'type': 'topic',
                    'name': topic_name,
                    'count': topic_data.get('count', 0),
                    'firstSeen': topic_data.get('firstSeen'),
                    'lastSeen': topic_data.get('lastSeen'),
                    'severity': 'high' if 'error' in topic_lower else 'medium'
                })
    
    # Extract from sequences that might have failed
    if 'stage1_rawLog' in telemetry_data and 'sequences' in telemetry_data['stage1_rawLog']:
        sequences = telemetry_data['stage1_rawLog']['sequences']
        for seq_id, seq_data in sequences.items():
            seq_lower = seq_id.lower()
            if any(keyword in seq_lower for keyword in error_keywords):
                issues.append({
                    'type': 'sequence',
                    'name': seq_data.get('name', seq_id),
                    'id': seq_id,
                    'count': seq_data.get('count', 0),
                    'timestamps': seq_data.get('timestamps', []),
                    'severity': 'high'
                })
    
    return issues


def search_rag_for_issue(issue: Dict[str, Any], limit: int = 5) -> List[Dict[str, Any]]:
    """Use RAG system to search for relevant code related to the issue."""
    repo_root = Path(__file__).parent.parent
    
    # Build search query from issue
    if issue['type'] == 'topic':
        query = issue['name'].replace(':', ' ').replace('-', ' ')
    else:
        query = issue['name']
    
    # Escape special characters
    escaped_query = query.replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"')
    
    # Create temporary test file
    test_script = f"""
import {{ describe, it, expect }} from 'vitest';
import {{ InMemoryVectorStore }} from '../store/in-memory-store';
import {{ EmbeddingServiceFactory }} from '../embeddings/embedding-service-factory';
import {{ OgraphXArtifactIndexer }} from '../indexing/ographx-artifact-indexer';
import {{ OgraphXArtifactRetriever }} from '../search/ographx-artifact-retriever';
import path from 'path';

describe('RAG Telemetry Analysis', () => {{
  it('should search for issue-related code', async () => {{
    const vectorStore = new InMemoryVectorStore();
    await vectorStore.initialize(384);
    const embeddingService = EmbeddingServiceFactory.createLocal();
    
    const indexer = new OgraphXArtifactIndexer(vectorStore, embeddingService);
    const artifactDir = path.resolve(process.cwd(), 'packages/ographx/.ographx/artifacts/renderx-web');
    await indexer.indexCodebaseArtifacts(artifactDir, 'renderx-web');
    
    const retriever = new OgraphXArtifactRetriever(vectorStore, embeddingService);
    
    // Search for symbols
    const symbolResults = await retriever.searchSymbols('{escaped_query}', {{ limit: {limit}, threshold: 0.3 }});
    
    // Search for sequences
    const sequenceResults = await retriever.searchSequences('{escaped_query}', {{ limit: {limit}, threshold: 0.3 }});
    
    console.log('__RAG_RESULTS_START__');
    console.log(JSON.stringify({{ symbols: symbolResults, sequences: sequenceResults }}, null, 2));
    console.log('__RAG_RESULTS_END__');
    
    expect(symbolResults).toBeDefined();
  }});
}});
"""
    
    test_dir = repo_root / 'src' / 'domain' / 'components' / 'vector-store' / '__tests__'
    test_dir.mkdir(parents=True, exist_ok=True)
    temp_test_path = test_dir / '.tmp-telemetry-analysis.spec.ts'
    temp_test_path.write_text(test_script, encoding='utf-8')
    
    try:
        cmd = f'npm test -- {temp_test_path} --run --reporter=verbose'
        result = subprocess.run(
            cmd,
            cwd=str(repo_root),
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=120,
            shell=True
        )
        
        output = result.stdout + result.stderr
        start_marker = '__RAG_RESULTS_START__'
        end_marker = '__RAG_RESULTS_END__'
        
        if start_marker in output and end_marker in output:
            start_idx = output.index(start_marker) + len(start_marker)
            end_idx = output.index(end_marker)
            json_str = output[start_idx:end_idx].strip()
            return json.loads(json_str)
        
        return {'symbols': [], 'sequences': []}
    
    finally:
        if temp_test_path.exists():
            temp_test_path.unlink()


def analyze_telemetry_with_rag(log_path: Path, detailed: bool = False, quiet: bool = False) -> Dict[str, Any]:
    """Analyze telemetry log and use RAG to find relevant code."""
    if not quiet:
        print(f"🔍 Analyzing telemetry log: {log_path.name}\n")

    # Load telemetry data
    telemetry_data = load_telemetry_log(log_path)

    # Extract basic stats
    stage1 = telemetry_data.get('stage1_rawLog', {})
    if not quiet:
        print(f"📊 Log Statistics:")
        print(f"   Total Lines: {stage1.get('totalLines', 0)}")
        print(f"   Duration: {stage1.get('durationMs', 0)}ms")
        print(f"   Time Range: {stage1.get('earliest', 'N/A')} to {stage1.get('latest', 'N/A')}")
        print()

    # Extract issues
    issues = extract_issues(telemetry_data)

    if not issues:
        if not quiet:
            print("✅ No errors or warnings found in telemetry log!")
        return {'issues': [], 'analysis': []}

    if not quiet:
        print(f"⚠️  Found {len(issues)} issues:\n")
    
    # Analyze each issue with RAG
    analysis_results = []

    for i, issue in enumerate(issues, 1):
        if not quiet:
            print(f"{'='*80}")
            print(f"Issue #{i}: {issue['name']}")
            print(f"{'='*80}")
            print(f"Type: {issue['type']}")
            print(f"Severity: {issue['severity'].upper()}")
            print(f"Occurrences: {issue['count']}")

            if issue['type'] == 'topic':
                print(f"First Seen: {issue.get('firstSeen', 'N/A')}")
                print(f"Last Seen: {issue.get('lastSeen', 'N/A')}")

            print()
            print("🔎 Searching RAG system for relevant code...")

        # Search RAG for related code
        rag_results = search_rag_for_issue(issue, limit=3 if not detailed else 5)

        symbols = rag_results.get('symbols', [])
        sequences = rag_results.get('sequences', [])

        if not quiet:
            print(f"\n📦 Found {len(symbols)} related symbols:")
            for j, symbol in enumerate(symbols[:3], 1):
                metadata = symbol.get('metadata', {})
                name = metadata.get('name') or metadata.get('title') or symbol.get('title', 'Unknown')
                similarity = symbol.get('similarity', 0.0)
                tags = metadata.get('tags', [])

                print(f"   {j}. {name} ({similarity * 100:.1f}% match)")
                if tags and detailed:
                    print(f"      Tags: {', '.join(str(t) for t in tags[:3])}")

            print(f"\n🎵 Found {len(sequences)} related sequences:")
            for j, sequence in enumerate(sequences[:3], 1):
                metadata = sequence.get('metadata', {})
                name = metadata.get('name') or metadata.get('title') or sequence.get('title', 'Unknown')
                similarity = sequence.get('similarity', 0.0)

                print(f"   {j}. {name} ({similarity * 100:.1f}% match)")

            print()

        analysis_results.append({
            'issue': issue,
            'rag_results': {
                'symbols': symbols,
                'sequences': sequences
            }
        })
    
    return {
        'issues': issues,
        'analysis': analysis_results,
        'stats': {
            'total_issues': len(issues),
            'high_severity': sum(1 for i in issues if i['severity'] == 'high'),
            'medium_severity': sum(1 for i in issues if i['severity'] == 'medium')
        }
    }


def generate_summary(analysis: Dict[str, Any]):
    """Generate a summary of the analysis."""
    print(f"\n{'='*80}")
    print("📋 ANALYSIS SUMMARY")
    print(f"{'='*80}\n")
    
    stats = analysis.get('stats', {})
    print(f"Total Issues: {stats.get('total_issues', 0)}")
    print(f"High Severity: {stats.get('high_severity', 0)}")
    print(f"Medium Severity: {stats.get('medium_severity', 0)}")
    print()
    
    print("💡 Recommendations:")
    print("   1. Review the related symbols and sequences found by RAG")
    print("   2. Check if error handling is properly implemented")
    print("   3. Verify that failed sequences have proper retry logic")
    print("   4. Consider adding more detailed error messages")
    print()


def main():
    parser = argparse.ArgumentParser(
        description='Analyze telemetry logs using the OgraphX-RAG system',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        'log_file',
        type=str,
        help='Path to telemetry diagnostics JSON file'
    )
    
    parser.add_argument(
        '--detailed',
        action='store_true',
        help='Show detailed analysis with more results'
    )
    
    parser.add_argument(
        '--json',
        action='store_true',
        help='Output results as JSON'
    )
    
    args = parser.parse_args()
    
    log_path = Path(args.log_file)
    
    if not log_path.exists():
        print(f"❌ Log file not found: {log_path}", file=sys.stderr)
        sys.exit(1)
    
    # Run analysis
    analysis = analyze_telemetry_with_rag(log_path, args.detailed, quiet=args.json)

    if args.json:
        print(json.dumps(analysis, indent=2))
    else:
        generate_summary(analysis)


if __name__ == '__main__':
    main()

