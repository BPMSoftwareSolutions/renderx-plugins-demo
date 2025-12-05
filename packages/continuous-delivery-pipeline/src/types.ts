/**
 * CDP Handler Types
 * Defines the interface for all CDP practice handlers
 */

export interface CDPHandlerContext {
  /** The beat event that triggered this handler */
  event: string;
  /** Current environment (development, staging, production) */
  environment: string;
  /** Timestamp of execution */
  timestamp: Date;
  /** Previous execution results if any */
  previousResults?: CDPHandlerResult;
  /** Configuration passed from the sequence */
  config?: Record<string, unknown>;
}

export interface CDPHandlerResult {
  /** Whether the handler execution was successful */
  success: boolean;
  /** Handler-specific metrics */
  metrics?: Record<string, number | string>;
  /** Any warnings or issues found */
  warnings?: string[];
  /** Detailed output data */
  data?: Record<string, unknown>;
  /** Timestamp of result */
  timestamp: Date;
}

export interface CDPMetricResult extends CDPHandlerResult {
  /** Metric name (e.g., 'lead-time', 'deployment-frequency') */
  metricName: string;
  /** Metric value */
  value: number;
  /** Unit of measurement */
  unit: string;
}

export interface CDPAuditResult extends CDPHandlerResult {
  /** Compliance status */
  compliant: boolean;
  /** List of findings */
  findings: CDPAuditFinding[];
}

export interface CDPAuditFinding {
  /** Severity: info, warning, error, critical */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** Finding message */
  message: string;
  /** Recommendation to fix */
  recommendation?: string;
}

/**
 * Base interface for all CDP handlers
 * Each handler implements the capabilities it supports
 */
export interface CDPHandler {
  /** Handler name matching the sequence definition */
  name: string;
  
  /** Audit the current state against CDP practice requirements */
  audit?(context: CDPHandlerContext): Promise<CDPAuditResult>;
  
  /** Execute build-related operations */
  build?(context: CDPHandlerContext): Promise<CDPHandlerResult>;
  
  /** Execute deployment operations */
  deploy?(context: CDPHandlerContext): Promise<CDPHandlerResult>;
  
  /** Generate reports and emit metrics */
  report?(context: CDPHandlerContext): Promise<CDPMetricResult>;
  
  /** Validate preconditions or gate checks */
  validate?(context: CDPHandlerContext): Promise<CDPHandlerResult>;
  
  /** Measure and collect metrics */
  measure?(context: CDPHandlerContext): Promise<CDPMetricResult>;
  
  /** Process learnings and feed back to backlog */
  learn?(context: CDPHandlerContext): Promise<CDPHandlerResult>;
  
  /** Execute rollback procedures */
  rollback?(context: CDPHandlerContext): Promise<CDPHandlerResult>;
}

