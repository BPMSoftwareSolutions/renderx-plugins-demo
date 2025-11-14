/**
 * OgraphX Artifact Search Types
 * Defines types for semantic search over OgraphX artifacts
 */

/**
 * Search result for OgraphX artifacts
 */
export interface OgraphXSearchResult {
  id: string;
  type: 'symbol' | 'call' | 'sequence' | 'movement' | 'beat' | 'test' | 'metric';
  title: string;
  content: string;
  similarity: number;                // 0-1 score
  metadata: {
    artifactType: string;
    codebaseName: string;
    filePath: string;
    tags: string[];
    relationships: {
      calls?: string[];
      calledBy?: string[];
      inSequence?: string;
      inMovement?: string;
      inBeat?: string;
    };
  };
}

/**
 * Search options for OgraphX artifacts
 */
export interface OgraphXSearchOptions {
  limit?: number;                    // Max results (default: 10)
  threshold?: number;                // Min similarity score (0-1)
  filters?: {
    artifactType?: string[];         // 'ir', 'sequence', 'test', 'analysis'
    codebaseName?: string[];         // Filter by codebase
    type?: string[];                 // 'symbol', 'call', 'sequence', etc.
    tags?: string[];                 // Filter by tags
  };
  semanticWeight?: number;           // Weight for semantic search (0-1, default: 0.7)
  lexicalWeight?: number;            // Weight for lexical search (0-1, default: 0.3)
}

/**
 * Call chain result
 */
export interface CallChainResult {
  startSymbol: string;
  chain: CallChainNode[];
  depth: number;
  totalCalls: number;
}

/**
 * Node in a call chain
 */
export interface CallChainNode {
  symbolId: string;
  symbolName: string;
  depth: number;
  calledBy: string[];
  calls: string[];
}

/**
 * Pattern discovery result
 */
export interface PatternResult {
  patternId: string;
  name: string;
  description: string;
  examples: OgraphXSearchResult[];
  similarity: number;                // Average similarity of examples
  frequency: number;                 // How many times this pattern appears
  tags: string[];
}

/**
 * Hybrid search configuration
 */
export interface HybridSearchConfig {
  semanticWeight: number;            // 0-1
  lexicalWeight: number;             // 0-1
  normalize: boolean;                // Normalize scores before combining
}

/**
 * Search statistics
 */
export interface SearchStats {
  query: string;
  resultsCount: number;
  averageSimilarity: number;
  searchTimeMs: number;
  filters: Record<string, unknown>;
}

