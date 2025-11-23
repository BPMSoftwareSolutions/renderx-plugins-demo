import { ComplianceEntry } from '../types/slo.types';

/**
 * Compliance Tracker Service
 * Monitors SLO adherence and provides alerts
 */

export class ComplianceTracker {
  /**
   * Determine overall compliance status
   */
  getOverallCompliance(entries: ComplianceEntry[]): boolean {
    return entries.every(entry => entry.compliant);
  }

  /**
   * Get count of compliant components
   */
  getCompliantCount(entries: ComplianceEntry[]): number {
    return entries.filter(entry => entry.compliant).length;
  }

  /**
   * Get count of breached components
   */
  getBreachedCount(entries: ComplianceEntry[]): number {
    return entries.filter(entry => !entry.compliant).length;
  }

  /**
   * Get breached component names
   */
  getBreachedComponents(entries: ComplianceEntry[]): string[] {
    return entries
      .filter(entry => !entry.compliant)
      .map(entry => entry.component);
  }

  /**
   * Get status color for compliance indicator
   */
  getComplianceColor(compliant: boolean): string {
    return compliant ? '#10B981' : '#EF4444'; // green or red
  }

  /**
   * Get trend indicator
   */
  getTrendIndicator(trend: string): string {
    const indicators: Record<string, string> = {
      'IMPROVING': '📈',
      'STABLE': '➡️',
      'DEGRADING': '📉',
    };
    return indicators[trend] || '❓';
  }

  /**
   * Sort entries by compliance status and trend
   */
  sortByPriority(entries: ComplianceEntry[]): ComplianceEntry[] {
    return [...entries].sort((a, b) => {
      // Breached first
      if (a.compliant !== b.compliant) {
        return a.compliant ? 1 : -1;
      }
      
      // Within same compliance, degrading first
      const trendPriority: Record<string, number> = {
        'DEGRADING': 0,
        'STABLE': 1,
        'IMPROVING': 2,
      };
      
      const aTrend = trendPriority[a.trend] || 3;
      const bTrend = trendPriority[b.trend] || 3;
      
      return aTrend - bTrend;
    });
  }

  /**
   * Check if compliance is degrading
   */
  isDegrading(entry: ComplianceEntry): boolean {
    return entry.trend === 'DEGRADING';
  }

  /**
   * Get days since last breach
   */
  getDaysSinceLastBreach(entry: ComplianceEntry): number | null {
    if (!entry.last_breach) return null;
    
    const lastBreach = new Date(entry.last_breach);
    const now = new Date();
    const diffMs = now.getTime() - lastBreach.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Generate alert message for breached component
   */
  generateAlertMessage(entry: ComplianceEntry): string {
    if (entry.compliant) {
      return `${entry.component} is compliant (${entry.compliance_percentage.toFixed(2)}%)`;
    }
    
    const daysSinceLastBreach = this.getDaysSinceLastBreach(entry);
    const breachInfo = daysSinceLastBreach !== null 
      ? ` Last breach ${daysSinceLastBreach} days ago`
      : '';
    
    return `⚠️ ${entry.component} is NON-COMPLIANT (${entry.compliance_percentage.toFixed(2)}%)${breachInfo}`;
  }

  /**
   * Get high-risk components
   */
  getHighRiskComponents(entries: ComplianceEntry[]): ComplianceEntry[] {
    return entries.filter(entry => 
      entry.trend === 'DEGRADING' || 
      entry.compliance_percentage < entry.sla_target * 0.95
    );
  }

  /**
   * Recommend actions based on compliance status
   */
  recommendActions(entries: ComplianceEntry[]): string[] {
    const actions: string[] = [];
    
    const degrading = entries.filter(e => e.trend === 'DEGRADING');
    const breached = entries.filter(e => !e.compliant);
    
    if (degrading.length > 0) {
      actions.push(`🔍 Investigate degradation in ${degrading.map(e => e.component).join(', ')}`);
    }
    
    if (breached.length > 0) {
      actions.push(`🚨 Immediate action required: ${breached.map(e => e.component).join(', ')} are breached`);
    }
    
    if (actions.length === 0) {
      actions.push('✅ All components compliant - no action needed');
    }
    
    return actions;
  }
}

export default ComplianceTracker;
