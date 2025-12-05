/**
 * CDP Handler Registry
 * 
 * Manages registration and execution of CDP handlers.
 * Provides methods to run capabilities across all registered handlers.
 */

import type { 
  CDPHandler, 
  CDPHandlerContext, 
  CDPHandlerResult, 
  CDPAuditResult, 
  CDPMetricResult 
} from './types';

export class CDPHandlerRegistry {
  private handlers: Map<string, CDPHandler> = new Map();

  /**
   * Register a handler
   */
  register(handler: CDPHandler): void {
    this.handlers.set(handler.name, handler);
  }

  /**
   * Get a handler by name
   */
  get(name: string): CDPHandler | undefined {
    return this.handlers.get(name);
  }

  /**
   * Get all registered handlers
   */
  getAll(): CDPHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Run audit across all handlers that support it
   */
  async runAuditAll(context: CDPHandlerContext): Promise<Map<string, CDPAuditResult>> {
    const results = new Map<string, CDPAuditResult>();
    
    for (const [name, handler] of this.handlers) {
      if (handler.audit) {
        try {
          results.set(name, await handler.audit(context));
        } catch (error) {
          results.set(name, {
            success: false,
            compliant: false,
            findings: [{
              severity: 'error',
              message: `Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            timestamp: new Date()
          });
        }
      }
    }
    
    return results;
  }

  /**
   * Run report across all handlers that support it
   */
  async runReportAll(context: CDPHandlerContext): Promise<Map<string, CDPMetricResult>> {
    const results = new Map<string, CDPMetricResult>();
    
    for (const [name, handler] of this.handlers) {
      if (handler.report) {
        try {
          results.set(name, await handler.report(context));
        } catch (error) {
          results.set(name, {
            success: false,
            metricName: 'error',
            value: 0,
            unit: 'error',
            timestamp: new Date()
          });
        }
      }
    }
    
    return results;
  }

  /**
   * Execute a specific capability on a handler
   */
  async execute(
    handlerName: string, 
    capability: keyof CDPHandler, 
    context: CDPHandlerContext
  ): Promise<CDPHandlerResult | CDPAuditResult | CDPMetricResult | null> {
    const handler = this.handlers.get(handlerName);
    if (!handler) {
      throw new Error(`Handler not found: ${handlerName}`);
    }

    const method = handler[capability];
    if (typeof method !== 'function') {
      throw new Error(`Handler ${handlerName} does not support capability: ${String(capability)}`);
    }

    return method.call(handler, context);
  }

  /**
   * Get compliance summary across all handlers
   */
  async getComplianceSummary(context: CDPHandlerContext): Promise<{
    totalHandlers: number;
    auditableHandlers: number;
    compliantHandlers: number;
    complianceRate: number;
    findings: Array<{ handler: string; finding: string; severity: string }>;
  }> {
    const auditResults = await this.runAuditAll(context);
    const findings: Array<{ handler: string; finding: string; severity: string }> = [];
    
    let compliantCount = 0;
    for (const [name, result] of auditResults) {
      if (result.compliant) {
        compliantCount++;
      }
      for (const finding of result.findings) {
        findings.push({
          handler: name,
          finding: finding.message,
          severity: finding.severity
        });
      }
    }

    return {
      totalHandlers: this.handlers.size,
      auditableHandlers: auditResults.size,
      compliantHandlers: compliantCount,
      complianceRate: auditResults.size > 0 ? (compliantCount / auditResults.size) * 100 : 0,
      findings
    };
  }
}

/**
 * Create a new handler registry with optional initial handlers
 */
export function createHandlerRegistry(handlers?: CDPHandler[]): CDPHandlerRegistry {
  const registry = new CDPHandlerRegistry();
  if (handlers) {
    handlers.forEach(h => registry.register(h));
  }
  return registry;
}

