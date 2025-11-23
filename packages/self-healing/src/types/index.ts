/**
 * Self-Healing System Type Definitions
 */

export interface TelemetryEvent {
  timestamp: string;
  handler: string;
  event: string;
  duration?: number;
  error?: string;
  context?: Record<string, any>;
}

export interface TelemetryMetrics {
  handlers: {
    [name: string]: {
      count: number;
      avgTime: number;
      p95Time: number;
      p99Time: number;
      errorRate: number;
      lastSeen: string;
    };
  };
  sequences: {
    [id: string]: {
      count: number;
      avgTime: number;
      beats: string[];
      errorRate: number;
    };
  };
  timestamp: string;
  totalEvents: number;
}

export type AnomalyType = 'performance' | 'behavioral' | 'coverage' | 'error' | 'state' | 'dependency';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: SeverityLevel;
  handler?: string;
  sequence?: string;
  description: string;
  metrics: Record<string, any>;
  detectedAt: string;
  confidence: number;
}

// Minimal structures used in early diagnosis slice
export interface PerformanceIssue {
  anomalyId: string;
  handler?: string;
  latencyRatio?: number;
  severity: SeverityLevel;
  description: string;
}

export interface DiagnosisSlice {
  performanceIssues: PerformanceIssue[];
  generatedAt: string;
  sequenceId: string;
}

export interface Diagnosis {
  anomalyId: string;
  rootCauses: string[];
  affectedHandlers: string[];
  affectedSequences: string[];
  impact: {
    severity: SeverityLevel;
    estimatedUsers: number;
    estimatedImpact: string;
  };
  suggestedFixes: FixRecommendation[];
}

export interface FixRecommendation {
  id: string;
  type: 'code' | 'test' | 'documentation' | 'sequence';
  description: string;
  priority: number;
  estimatedEffort: number;
  expectedBenefit: string;
  implementation: string;
}

export interface Patch {
  id: string;
  anomalyId: string;
  diagnosisId: string;
  changes: {
    code?: string;
    tests?: string;
    documentation?: string;
    sequences?: string;
  };
  createdAt: string;
  syntax: {
    valid: boolean;
    errors?: string[];
  };
}

export interface ValidationResult {
  patchId: string;
  testsPass: boolean;
  testResults?: {
    passed: number;
    failed: number;
    skipped: number;
  };
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  performance: {
    improved: boolean;
    improvement: number;
    baseline: number;
    current: number;
  };
  documentation: {
    valid: boolean;
    errors?: string[];
  };
  timestamp: string;
}

export interface Deployment {
  id: string;
  patchId: string;
  validationId: string;
  prNumber?: number;
  branch?: string;
  status: 'pending' | 'approved' | 'deployed' | 'failed';
  deployedAt?: string;
  verificationStatus?: 'pending' | 'success' | 'failed';
}

export interface EffectivenessData {
  deploymentId: string;
  beforeMetrics: TelemetryMetrics;
  afterMetrics: TelemetryMetrics;
  improvement: {
    performance: number;
    errors: number;
    coverage: number;
  };
  successful: boolean;
  insights: string[];
  timestamp: string;
}

