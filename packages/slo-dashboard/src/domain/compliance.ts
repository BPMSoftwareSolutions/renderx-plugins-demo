/**
 * Domain utilities for SLO dashboard compliance calculations.
 * These isolate business logic from handler wiring to allow progressive enrichment
 * without destabilizing handler signatures.
 */
export interface WeightedSLO { id: string; weight: number; compliance: number; }
export interface BudgetEntry { id: string; remainingBudgetPercent: number; burnRate: number; }

/**
 * Computes weighted mean compliance. Ignores invalid weights (<0) and compliance outside [0,1].
 */
export function computeWeightedCompliance(slos: WeightedSLO[]): number {
  const filtered = slos.filter(s => s.weight > 0 && s.compliance >= 0 && s.compliance <= 1);
  const totalWeight = filtered.reduce((a,s)=>a+s.weight,0);
  if(totalWeight === 0) return 0;
  const sum = filtered.reduce((a,s)=>a + (s.compliance * s.weight),0);
  return sum / totalWeight;
}

/**
 * Sorts SLO budget entries by remainingBudgetPercent (descending). Ties broken by higher burnRate (riskier first).
 */
export function sortByRemainingBudget(entries: BudgetEntry[]): BudgetEntry[] {
  return [...entries].sort((a,b) => {
    if(b.remainingBudgetPercent === a.remainingBudgetPercent) {
      return b.burnRate - a.burnRate; // riskier (higher burn) first when equal remaining budget
    }
    return b.remainingBudgetPercent - a.remainingBudgetPercent;
  });
}

/**
 * Detects spike condition: short-term burn > 2x long-term average.
 */
export function isBurnRateSpike(shortTerm: number, longTerm: number): boolean {
  if(longTerm <= 0) return false;
  return shortTerm > (2 * longTerm);
}

/**
 * Maps compliance percentage (0-1) to color tier + accessible label.
 */
export function getProgressColor(compliance: number): { color: string; label: string } {
  if(compliance >= 0.995) return { color: 'green', label: 'Healthy' };
  if(compliance >= 0.98) return { color: 'yellow', label: 'Needs Attention' };
  if(compliance >= 0.95) return { color: 'orange', label: 'Degraded' };
  return { color: 'red', label: 'Critical' };
}

/**
 * Calculates projection status based on remaining error budget percent and burn rate (% budget consumed per hour).
 * Returns breach-now if remaining <=0, breach-soon if projected breach < horizonHours, else ok.
 */
export function calculateProjectionStatus(remainingBudgetPercent: number, burnRatePercentPerHour: number, horizonHours = 24) {
  if(remainingBudgetPercent <= 0) return { status: 'breach-now', hoursToBreach: 0 };
  if(burnRatePercentPerHour <= 0) return { status: 'stable', hoursToBreach: Infinity };
  const hoursToBreach = remainingBudgetPercent / burnRatePercentPerHour;
  const status = hoursToBreach < horizonHours ? 'breach-soon' : 'stable';
  return { status, hoursToBreach };
}
