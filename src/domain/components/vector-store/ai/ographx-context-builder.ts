/**
 * OgraphX Context Builder
 * Builds rich context for AI generation using retrieved OgraphX artifacts
 */

import { OgraphXArtifactRetriever } from '../search/ographx-artifact-retriever';
import { OgraphXSearchResult } from '../search/ographx-artifact-search.types';

/**
 * AI generation context enriched with OgraphX artifacts
 */
export interface AIGenerationContext {
  prompt: string;
  type: 'symbol' | 'sequence' | 'handler' | 'component';
  similarArtifacts: OgraphXSearchResult[];
  patterns: PatternContext[];
  codebase: string;
  metadata: {
    totalArtifactsFound: number;
    averageSimilarity: number;
    topTags: string[];
  };
}

/**
 * Pattern context for generation
 */
export interface PatternContext {
  name: string;
  description: string;
  examples: OgraphXSearchResult[];
  frequency: number;
  confidence: number;
}

/**
 * Handler context for generation
 */
export interface HandlerContext {
  handlerName: string;
  similarHandlers: OgraphXSearchResult[];
  commonPatterns: PatternContext[];
  relatedSequences: OgraphXSearchResult[];
  metadata: {
    handlerType: string;
    eventTypes: string[];
    dependencies: string[];
  };
}

/**
 * Sequence context for generation
 */
export interface SequenceContext {
  sequenceName: string;
  similarSequences: OgraphXSearchResult[];
  orchestrationPatterns: PatternContext[];
  relatedHandlers: OgraphXSearchResult[];
  metadata: {
    movementCount: number;
    beatCount: number;
    eventTypes: string[];
  };
}

export class OgraphXContextBuilder {
  constructor(private retriever: OgraphXArtifactRetriever) {}

  /**
   * Build rich context for AI generation
   */
  async buildGenerationContext(request: {
    prompt: string;
    type: 'symbol' | 'sequence' | 'handler' | 'component';
    codebase?: string;
  }): Promise<AIGenerationContext> {
    const codebase = request.codebase || 'renderx-web';

    // Search for similar artifacts
    let similarArtifacts: OgraphXSearchResult[] = [];

    switch (request.type) {
      case 'symbol':
        similarArtifacts = await this.retriever.searchSymbols(request.prompt, {
          limit: 10,
          filters: { codebaseName: [codebase] },
        });
        break;
      case 'sequence':
        similarArtifacts = await this.retriever.searchSequences(request.prompt, {
          limit: 10,
          filters: { codebaseName: [codebase] },
        });
        break;
      case 'handler':
        similarArtifacts = await this.retriever.searchHandlers(request.prompt, {
          limit: 10,
          filters: { codebaseName: [codebase] },
        });
        break;
      case 'component':
        // For components, search across all types
        similarArtifacts = await this.retriever.searchSymbols(request.prompt, {
          limit: 15,
          filters: { codebaseName: [codebase] },
        });
        break;
    }

    // Discover patterns
    const patterns = await this.retriever.discoverPatterns(request.prompt, 0.6);
    const patternContexts = patterns.map(p => ({
      name: p.name,
      description: p.description,
      examples: p.examples,
      frequency: p.frequency,
      confidence: p.similarity,
    }));

    // Calculate metadata
    const avgSimilarity = similarArtifacts.length > 0
      ? similarArtifacts.reduce((sum, a) => sum + a.similarity, 0) / similarArtifacts.length
      : 0;

    const allTags = similarArtifacts.flatMap(a => a.metadata.tags);
    const tagFrequency = new Map<string, number>();
    for (const tag of allTags) {
      tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
    }
    const topTags = Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    return {
      prompt: request.prompt,
      type: request.type,
      similarArtifacts,
      patterns: patternContexts,
      codebase,
      metadata: {
        totalArtifactsFound: similarArtifacts.length,
        averageSimilarity: avgSimilarity,
        topTags,
      },
    };
  }

  /**
   * Build context for handler generation
   */
  async buildHandlerContext(handlerName: string): Promise<HandlerContext> {
    const similarHandlers = await this.retriever.searchHandlers(handlerName, {
      limit: 5,
    });

    const patterns = await this.retriever.discoverPatterns(`handler pattern ${handlerName}`, 0.65);
    const patternContexts = patterns.map(p => ({
      name: p.name,
      description: p.description,
      examples: p.examples,
      frequency: p.frequency,
      confidence: p.similarity,
    }));

    const relatedSequences = await this.retriever.searchSequences(handlerName, {
      limit: 5,
    });

    // Extract metadata from similar handlers
    const eventTypes = new Set<string>();
    const dependencies = new Set<string>();

    for (const handler of similarHandlers) {
      handler.metadata.tags.forEach(tag => {
        if (tag.includes('event') || tag.includes('handler')) {
          eventTypes.add(tag);
        }
      });
    }

    return {
      handlerName,
      similarHandlers,
      commonPatterns: patternContexts,
      relatedSequences,
      metadata: {
        handlerType: similarHandlers[0]?.metadata.artifactType || 'unknown',
        eventTypes: Array.from(eventTypes),
        dependencies: Array.from(dependencies),
      },
    };
  }

  /**
   * Build context for sequence generation
   */
  async buildSequenceContext(sequenceName: string): Promise<SequenceContext> {
    const similarSequences = await this.retriever.searchSequences(sequenceName, {
      limit: 5,
    });

    const patterns = await this.retriever.discoverPatterns(`sequence pattern ${sequenceName}`, 0.65);
    const patternContexts = patterns.map(p => ({
      name: p.name,
      description: p.description,
      examples: p.examples,
      frequency: p.frequency,
      confidence: p.similarity,
    }));

    const relatedHandlers = await this.retriever.searchHandlers(sequenceName, {
      limit: 5,
    });

    // Extract metadata from similar sequences
    const eventTypes = new Set<string>();
    let movementCount = 0;
    let beatCount = 0;

    for (const seq of similarSequences) {
      seq.metadata.tags.forEach(tag => {
        if (tag.includes('event') || tag.includes('movement')) {
          eventTypes.add(tag);
        }
      });
      // Count movements and beats from content
      const movementMatches = seq.content.match(/movement/gi) || [];
      const beatMatches = seq.content.match(/beat/gi) || [];
      movementCount += movementMatches.length;
      beatCount += beatMatches.length;
    }

    return {
      sequenceName,
      similarSequences,
      orchestrationPatterns: patternContexts,
      relatedHandlers,
      metadata: {
        movementCount: Math.ceil(movementCount / Math.max(similarSequences.length, 1)),
        beatCount: Math.ceil(beatCount / Math.max(similarSequences.length, 1)),
        eventTypes: Array.from(eventTypes),
      },
    };
  }

  /**
   * Format context for LLM prompt
   */
  formatContextForPrompt(context: AIGenerationContext): string {
    const lines: string[] = [
      `## Generation Context for ${context.type}`,
      `Codebase: ${context.codebase}`,
      `Prompt: ${context.prompt}`,
      '',
      `### Similar Artifacts (${context.metadata.totalArtifactsFound} found)`,
      `Average Similarity: ${(context.metadata.averageSimilarity * 100).toFixed(1)}%`,
      `Top Tags: ${context.metadata.topTags.join(', ')}`,
      '',
    ];

    if (context.similarArtifacts.length > 0) {
      lines.push('#### Examples:');
      for (const artifact of context.similarArtifacts.slice(0, 3)) {
        lines.push(`- **${artifact.title}** (${artifact.type}, ${(artifact.similarity * 100).toFixed(1)}%)`);
        lines.push(`  ${artifact.content.substring(0, 100)}...`);
      }
      lines.push('');
    }

    if (context.patterns.length > 0) {
      lines.push('### Discovered Patterns');
      for (const pattern of context.patterns.slice(0, 3)) {
        lines.push(`- **${pattern.name}** (frequency: ${pattern.frequency}, confidence: ${(pattern.confidence * 100).toFixed(1)}%)`);
        lines.push(`  ${pattern.description}`);
      }
    }

    return lines.join('\n');
  }
}

