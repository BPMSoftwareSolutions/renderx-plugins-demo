/**
 * OgraphX Integration Module
 * Exports all OgraphX artifact indexing, retrieval, and context building functionality
 */

// Artifact Indexer
export { OgraphXArtifactIndexer } from '../indexing/ographx-artifact-indexer';
export {
  OgraphXDocument,
  IRSymbol,
  IRCall,
  IRGraph,
  OgraphXSequence,
  OgraphXMovement,
  OgraphXBeat,
  TestStructure,
  TestCategory,
  TestMethod,
  AnalysisData,
  OgraphXIndexResult,
  OgraphXIndexError,
} from '../indexing/ographx-artifact.types';

// Artifact Retriever
export { OgraphXArtifactRetriever } from '../search/ographx-artifact-retriever';
export {
  OgraphXSearchResult,
  OgraphXSearchOptions,
  CallChainResult,
  CallChainNode,
  PatternResult,
  HybridSearchConfig,
  SearchStats,
} from '../search/ographx-artifact-search.types';

// Context Builder
export { OgraphXContextBuilder } from '../ai/ographx-context-builder';
export {
  AIGenerationContext,
  PatternContext,
  HandlerContext,
  SequenceContext,
} from '../ai/ographx-context-builder';

// Enhanced AI Component Generator
export { AIComponentGenerator } from '../ai/ai-component-generator';
export { AIGenerationRequest, AIGenerationContext as EnhancedAIGenerationContext } from '../ai/ai-component-generator';

