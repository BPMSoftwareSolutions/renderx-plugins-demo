/**
 * OgraphX Artifact Retriever
 * Enables semantic search over indexed OgraphX artifacts
 */

import { VectorStore, EmbeddingService, SearchOptions } from '../store/store.types';
import {
  OgraphXSearchResult,
  OgraphXSearchOptions,
  CallChainResult,
  CallChainNode,
  PatternResult,
  SearchStats,
} from './ographx-artifact-search.types';

export class OgraphXArtifactRetriever {
  constructor(
    private vectorStore: VectorStore,
    private embeddingService: EmbeddingService
  ) {}

  /**
   * Search for symbols by semantic similarity
   * Example: "Find handlers that deal with canvas selection"
   */
  async searchSymbols(query: string, options?: OgraphXSearchOptions): Promise<OgraphXSearchResult[]> {
    // startTime is prepared for future telemetry but not currently used
    // const startTime = Date.now();
    const embedding = await this.embeddingService.embed(query);

    const searchOptions: SearchOptions = {
      limit: options?.limit || 10,
      threshold: options?.threshold || 0.3,
      filters: {
        type: 'symbol',
        ...(options?.filters?.tags ? { tags: options.filters.tags } : {}),
      },
    };

    const results = await this.vectorStore.search(embedding, searchOptions);
    const searchResults = this.convertResults(results);

    return this.applyFilters(searchResults, options?.filters);
  }

  /**
   * Search for sequences by semantic similarity
   * Example: "Find sequences that orchestrate component creation"
   */
  async searchSequences(query: string, options?: OgraphXSearchOptions): Promise<OgraphXSearchResult[]> {
    const embedding = await this.embeddingService.embed(query);

    const searchOptions: SearchOptions = {
      limit: options?.limit || 10,
      threshold: options?.threshold || 0.3,
      filters: {
        type: 'sequence',
        ...(options?.filters?.tags ? { tags: options.filters.tags } : {}),
      },
    };

    const results = await this.vectorStore.search(embedding, searchOptions);
    return this.convertResults(results);
  }

  /**
   * Search for handlers by pattern
   * Example: "Find handlers similar to onDragStart"
   */
  async searchHandlers(query: string, options?: OgraphXSearchOptions): Promise<OgraphXSearchResult[]> {
    const embedding = await this.embeddingService.embed(query);

    const searchOptions: SearchOptions = {
      limit: options?.limit || 10,
      threshold: options?.threshold || 0.3,
      filters: {
        tags: ['function', 'method', ...(options?.filters?.tags || [])],
      },
    };

    const results = await this.vectorStore.search(embedding, searchOptions);
    return this.convertResults(results);
  }

  /**
   * Find call chains
   * Example: "Show me the call chain for component creation"
   */
  async findCallChain(startSymbol: string, depth: number = 5): Promise<CallChainResult> {
    const chain: CallChainNode[] = [];
    const visited = new Set<string>();

    await this.buildCallChain(startSymbol, 0, depth, chain, visited);

    return {
      startSymbol,
      chain,
      depth,
      totalCalls: chain.length,
    };
  }

  /**
   * Find dependents of a symbol
   * Example: "What components depend on this utility?"
   */
  async findDependents(symbolId: string): Promise<OgraphXSearchResult[]> {
    // Search for calls where this symbol is the callee
    const query = `calls to ${symbolId}`;
    const embedding = await this.embeddingService.embed(query);

    const searchOptions: SearchOptions = {
      limit: 20,
      threshold: 0.2,
      filters: {
        type: 'call',
      },
    };

    const results = await this.vectorStore.search(embedding, searchOptions);
    return this.convertResults(results);
  }

  /**
   * Discover patterns
   * Example: "Find all similar orchestration patterns"
   */
  async discoverPatterns(query: string, threshold: number = 0.7): Promise<PatternResult[]> {
    const embedding = await this.embeddingService.embed(query);

    const searchOptions: SearchOptions = {
      limit: 50,
      threshold: threshold,
    };

    const results = await this.vectorStore.search(embedding, searchOptions);
    const searchResults = this.convertResults(results);

    // Group by pattern type
    const patterns = this.groupByPattern(searchResults);

    return patterns;
  }

  /**
   * Get search statistics
   */
  getSearchStats(query: string, results: OgraphXSearchResult[]): SearchStats {
    const avgSimilarity = results.length > 0
      ? results.reduce((sum, r) => sum + r.similarity, 0) / results.length
      : 0;

    return {
      query,
      resultsCount: results.length,
      averageSimilarity: avgSimilarity,
      searchTimeMs: 0, // Would be set by caller
      filters: {},
    };
  }

  // Private helper methods

  private convertResults(results: any[]): OgraphXSearchResult[] {
    return results.map(r => ({
      id: r.id,
      type: r.metadata.type || 'symbol',
      title: r.metadata.name,
      content: r.metadata.description,
      similarity: r.similarity,
      metadata: {
        artifactType: r.metadata.category || 'unknown',
        codebaseName: r.metadata.codebaseName || 'unknown',
        filePath: r.metadata.filePath || '',
        tags: r.metadata.tags || [],
        relationships: {},
      },
    }));
  }

  private applyFilters(results: OgraphXSearchResult[], filters?: any): OgraphXSearchResult[] {
    if (!filters) return results;

    return results.filter(r => {
      if (filters.artifactType && !filters.artifactType.includes(r.metadata.artifactType)) {
        return false;
      }
      if (filters.codebaseName && !filters.codebaseName.includes(r.metadata.codebaseName)) {
        return false;
      }
      if (filters.type && !filters.type.includes(r.type)) {
        return false;
      }
      if (filters.tags && !filters.tags.some((t: string) => r.metadata.tags.includes(t))) {
        return false;
      }
      return true;
    });
  }

  private async buildCallChain(
    symbolId: string,
    currentDepth: number,
    maxDepth: number,
    chain: CallChainNode[],
    visited: Set<string>
  ): Promise<void> {
    if (currentDepth >= maxDepth || visited.has(symbolId)) {
      return;
    }

    visited.add(symbolId);

    const node: CallChainNode = {
      symbolId,
      symbolName: symbolId.split('::').pop() || symbolId,
      depth: currentDepth,
      calledBy: [],
      calls: [],
    };

    chain.push(node);

    // In a real implementation, would query the vector store for related calls
    // For now, this is a placeholder
  }

  private groupByPattern(results: OgraphXSearchResult[]): PatternResult[] {
    const patterns: Map<string, OgraphXSearchResult[]> = new Map();

    for (const result of results) {
      const patternKey = result.metadata.artifactType;
      if (!patterns.has(patternKey)) {
        patterns.set(patternKey, []);
      }
      patterns.get(patternKey)!.push(result);
    }

    return Array.from(patterns.entries()).map(([key, examples]) => ({
      patternId: key,
      name: key,
      description: `Pattern: ${key}`,
      examples: examples.slice(0, 5),
      similarity: examples.reduce((sum, e) => sum + e.similarity, 0) / examples.length,
      frequency: examples.length,
      tags: [...new Set(examples.flatMap(e => e.metadata.tags))],
    }));
  }
}

