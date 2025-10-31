/**
 * Component Indexer Types and Interfaces
 */

/**
 * Result of indexing operation
 */
export interface IndexResult {
  total: number;
  indexed: number;
  failed: number;
  errors: IndexError[];
}

/**
 * Error during indexing
 */
export interface IndexError {
  componentId: string;
  error: string;
  timestamp: Date;
}

/**
 * Progress of indexing operation
 */
export interface IndexProgress {
  total: number;
  processed: number;
  percentage: number;
  currentComponent?: string;
  startTime: Date;
  estimatedTimeRemaining?: number;
}

/**
 * Component indexer interface
 */
export interface ComponentIndexer {
  /**
   * Index all components from directory
   */
  indexDirectory(path: string): Promise<IndexResult>;

  /**
   * Index single component
   */
  indexComponent(componentId: string, componentData: Record<string, unknown>): Promise<void>;

  /**
   * Get indexing progress
   */
  getProgress(): IndexProgress;

  /**
   * Clear all indexed components
   */
  clear(): Promise<void>;
}

