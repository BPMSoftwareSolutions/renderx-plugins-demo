/**
 * OgraphX Artifact Types and Interfaces
 * Defines types for indexing OgraphX self-observation artifacts
 */

/**
 * OgraphX document for vector store indexing
 */
export interface OgraphXDocument {
  id: string;                    // Unique identifier
  type: 'symbol' | 'call' | 'sequence' | 'movement' | 'beat' | 'test' | 'metric';
  title: string;                 // Human-readable title
  content: string;               // Full text for embedding
  metadata: {
    artifactType: string;        // 'ir' | 'sequence' | 'test' | 'analysis'
    codebaseName: string;        // e.g., 'renderx-web', 'ographx', 'rag-system'
    filePath: string;            // Source file path
    lineRange?: [number, number]; // For code references
    tags: string[];              // Searchable tags
    relationships: {
      calls?: string[];          // IDs of called symbols
      calledBy?: string[];       // IDs of calling symbols
      inSequence?: string;       // Parent sequence ID
      inMovement?: string;       // Parent movement ID
      inBeat?: string;           // Parent beat ID
    };
  };
}

/**
 * IR Graph Symbol from OgraphX
 */
export interface IRSymbol {
  id: string;
  file: string;
  kind: string;                  // 'class', 'function', 'method', 'interface', etc.
  name: string;
  class_name?: string | null;
  exported: boolean;
  params_contract?: string | null;
  range: [number, number];
}

/**
 * IR Graph Call from OgraphX
 */
export interface IRCall {
  id: string;
  from: string;                  // Caller symbol ID
  to: string;                    // Callee symbol ID
  range: [number, number];
}

/**
 * IR Graph structure from OgraphX
 */
export interface IRGraph {
  files: string[];
  symbols: IRSymbol[];
  calls: IRCall[];
}

/**
 * Sequence structure from OgraphX
 */
export interface OgraphXSequence {
  id: string;
  name: string;
  type: string;
  movements: OgraphXMovement[];
}

/**
 * Movement within a sequence
 */
export interface OgraphXMovement {
  id: string;
  name: string;
  beats: OgraphXBeat[];
}

/**
 * Beat within a movement
 */
export interface OgraphXBeat {
  id: string;
  event: string;
  timing: string;
}

/**
 * Test structure from OgraphX
 */
export interface TestStructure {
  unit?: Record<string, TestCategory[]>;
  integration?: Record<string, TestCategory[]>;
  e2e?: Record<string, TestCategory[]>;
}

/**
 * Test category
 */
export interface TestCategory {
  name: string;
  description: string;
  methods: TestMethod[];
  count: number;
}

/**
 * Test method
 */
export interface TestMethod {
  name: string;
  description: string;
}

/**
 * Analysis data from OgraphX
 */
export interface AnalysisData {
  version: string;
  generated_at: string;
  statistics: {
    files: number;
    symbols: number;
    calls: number;
    contracts: number;
  };
  symbol_types: Record<string, number>;
  call_distribution: Record<string, number>;
  complexity: {
    average_calls_per_symbol: number;
    max_calls_per_symbol: number;
    min_calls_per_symbol: number;
  };
  coverage: {
    symbols_with_calls: number;
    symbols_without_calls: number;
  };
}

/**
 * Result of OgraphX artifact indexing
 */
export interface OgraphXIndexResult {
  total: number;
  indexed: number;
  failed: number;
  errors: OgraphXIndexError[];
  documentsByType: Record<string, number>;
}

/**
 * Error during OgraphX artifact indexing
 */
export interface OgraphXIndexError {
  artifactId: string;
  error: string;
  timestamp: Date;
}

