#!/usr/bin/env python3
"""
RAG Search CLI
Runs semantic search queries against the OgraphX-RAG system from the command line.

Usage:
    python scripts/rag-search.py "canvas selection handler"
    python scripts/rag-search.py "vector store search" --limit 5
    python scripts/rag-search.py "indexing workflow" --type sequence
"""

import argparse
import json
import subprocess
import sys
import os
from pathlib import Path

# Ensure UTF-8 output on Windows terminals
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass


def run_rag_search(query: str, search_type: str = 'symbol', limit: int = 10, threshold: float = 0.3):
    """
    Run a RAG search query by executing a TypeScript test via Vitest.

    Args:
        query: The search query string
        search_type: Type of search ('symbol', 'sequence', 'handler', 'pattern')
        limit: Maximum number of results to return
        threshold: Minimum similarity threshold (0.0 to 1.0)

    Returns:
        dict: Search results
    """
    repo_root = Path(__file__).parent.parent

    # Escape special characters for TypeScript string
    escaped_query = query.replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"')

    # Create a temporary test file that runs the search
    test_script = f"""
import {{ describe, it, expect }} from 'vitest';
import {{ InMemoryVectorStore }} from '../store/in-memory-store';
import {{ EmbeddingServiceFactory }} from '../embeddings/embedding-service-factory';
import {{ OgraphXArtifactIndexer }} from '../indexing/ographx-artifact-indexer';
import {{ OgraphXArtifactRetriever }} from '../search/ographx-artifact-retriever';
import path from 'path';

describe('CLI RAG Search', () => {{
  it('should run search query', async () => {{
    // Initialize
    const vectorStore = new InMemoryVectorStore();
    await vectorStore.initialize(384);
    const embeddingService = EmbeddingServiceFactory.createLocal();

    // Index artifacts
    const indexer = new OgraphXArtifactIndexer(vectorStore, embeddingService);
    const artifactDir = path.resolve(process.cwd(), 'packages/ographx/.ographx/artifacts/rag-system');
    await indexer.indexCodebaseArtifacts(artifactDir, 'rag-system');

    // Search
    const retriever = new OgraphXArtifactRetriever(vectorStore, embeddingService);
    const options = {{ limit: {limit}, threshold: {threshold} }};

    let results;
    if ('{search_type}' === 'symbol') {{
      results = await retriever.searchSymbols('{escaped_query}', options);
    }} else if ('{search_type}' === 'sequence') {{
      results = await retriever.searchSequences('{escaped_query}', options);
    }} else if ('{search_type}' === 'handler') {{
      results = await retriever.searchHandlers('{escaped_query}', options);
    }} else if ('{search_type}' === 'pattern') {{
      results = await retriever.discoverPatterns('{escaped_query}', {threshold});
    }} else {{
      throw new Error('Unknown search type: {search_type}');
    }}

    // Output as JSON to stdout (Vitest will capture this)
    console.log('__RAG_RESULTS_START__');
    console.log(JSON.stringify(results, null, 2));
    console.log('__RAG_RESULTS_END__');

    expect(results).toBeDefined();
  }});
}});
"""

    # Write temporary test file
    test_dir = repo_root / 'src' / 'domain' / 'components' / 'vector-store' / '__tests__'
    test_dir.mkdir(parents=True, exist_ok=True)
    temp_test_path = test_dir / '.tmp-cli-search.spec.ts'
    temp_test_path.write_text(test_script, encoding='utf-8')

    try:
        # Run the test with Vitest (use shell=True on Windows to find npm)
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

        # Extract JSON results from output
        output = result.stdout + result.stderr

        # Look for the JSON between markers
        start_marker = '__RAG_RESULTS_START__'
        end_marker = '__RAG_RESULTS_END__'

        if start_marker in output and end_marker in output:
            start_idx = output.index(start_marker) + len(start_marker)
            end_idx = output.index(end_marker)
            json_str = output[start_idx:end_idx].strip()

            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse results: {{e}}", file=sys.stderr)
                print(f"Raw JSON: {{json_str[:500]}}", file=sys.stderr)
                return None
        else:
            print(f"❌ Search failed or produced no output", file=sys.stderr)
            if result.returncode != 0:
                print(f"Error output: {{result.stderr[:500]}}", file=sys.stderr)
            return None

    finally:
        # Clean up temporary test file
        if temp_test_path.exists():
            temp_test_path.unlink()


def format_results(results, search_type: str):
    """Format search results for display."""
    if not results:
        print("No results found.")
        return

    print(f"\n🔍 Found {len(results)} results:\n")

    for i, result in enumerate(results, 1):
        if search_type == 'pattern':
            # Pattern results have different structure
            name = result.get('name', 'Unknown')
            frequency = result.get('frequency', 0)
            print(f"{i}. {name}")
            print(f"   Frequency: {frequency}")
            if 'examples' in result and result['examples']:
                print(f"   Examples: {', '.join(result['examples'][:3])}")
        else:
            # Standard search results
            metadata = result.get('metadata', {})

            # Try multiple fields for the name
            name = metadata.get('name') or metadata.get('title') or result.get('title', 'Unknown')
            similarity = result.get('similarity', 0.0)
            doc_type = metadata.get('type', 'unknown')

            print(f"{i}. {name} ({doc_type})")
            print(f"   Similarity: {similarity * 100:.1f}%")

            # Show file path if available
            if 'file' in metadata:
                print(f"   File: {metadata['file']}")

            # Show tags if available
            if 'tags' in metadata and metadata['tags']:
                tags_str = ', '.join(str(t) for t in metadata['tags'][:5])
                print(f"   Tags: {tags_str}")

            # Show description if available
            if 'description' in metadata and metadata['description']:
                desc = metadata['description'][:100]
                if len(metadata['description']) > 100:
                    desc += '...'
                print(f"   Description: {desc}")

        print()


def main():
    parser = argparse.ArgumentParser(
        description='Search the OgraphX-RAG system from the command line',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/rag-search.py "canvas selection handler"
  python scripts/rag-search.py "vector store search" --limit 5
  python scripts/rag-search.py "indexing workflow" --type sequence
  python scripts/rag-search.py "drag event" --type handler --threshold 0.5
  python scripts/rag-search.py "indexing" --type pattern
        """
    )
    
    parser.add_argument(
        'query',
        type=str,
        help='The search query string'
    )
    
    parser.add_argument(
        '--type',
        type=str,
        choices=['symbol', 'sequence', 'handler', 'pattern'],
        default='symbol',
        help='Type of search to perform (default: symbol)'
    )
    
    parser.add_argument(
        '--limit',
        type=int,
        default=10,
        help='Maximum number of results to return (default: 10)'
    )
    
    parser.add_argument(
        '--threshold',
        type=float,
        default=0.3,
        help='Minimum similarity threshold 0.0-1.0 (default: 0.3)'
    )
    
    parser.add_argument(
        '--json',
        action='store_true',
        help='Output raw JSON instead of formatted results'
    )
    
    args = parser.parse_args()
    
    # Validate threshold
    if not 0.0 <= args.threshold <= 1.0:
        print("❌ Threshold must be between 0.0 and 1.0", file=sys.stderr)
        sys.exit(1)
    
    print(f"🎵 RAG Search")
    print(f"Query: \"{args.query}\"")
    print(f"Type: {args.type}")
    print(f"Limit: {args.limit}")
    print(f"Threshold: {args.threshold}")
    print()
    
    # Run the search
    results = run_rag_search(args.query, args.type, args.limit, args.threshold)
    
    if results is None:
        sys.exit(1)
    
    # Output results
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        format_results(results, args.type)


if __name__ == '__main__':
    main()

