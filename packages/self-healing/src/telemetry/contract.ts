export interface BddTelemetryRecord {
  timestamp: string;
  feature: string;            // logical feature or capability ("login", "detect-slo-breaches")
  event: string;              // specific lifecycle event ("login:completed")
  beats: number;              // count of internal beats/steps observed
  status: 'ok' | 'warn' | 'error';
  correlationId: string;      // ties this record to a test run / sequence
  durationMs?: number;        // optional total duration
  sequenceSignature?: string; // optional signature (hash) of the execution path
  batonDiffCount?: number;    // count of state/baton mutations
  payload?: Record<string, any>; // opaque result or contextual data
  shapeHash?: string;         // stable hash representing normalized shape (added in Sprint 1)
  coverageId?: string;        // coverage segment identifier (Sprint 2 scaffold)
  budgetStatus?: 'within' | 'breach'; // budget evaluation result (beats/duration/batonDiff)
  domainMutations?: Record<string, number>; // domain mutation counts (mutation localization)
  compositeChainId?: string; // correlation chain identifier for composite aggregation
}

export interface BddTelemetryContractPartial {
  feature?: string;
  event?: string;
  beats?: number | ((v: number) => boolean);
  status?: 'ok' | 'warn' | 'error';
  correlationId?: string | ((v: string) => boolean);
  sequenceSignature?: string;
  batonDiffCount?: number | ((v: number) => boolean);
}

export function matchesContract(rec: BddTelemetryRecord, partial: BddTelemetryContractPartial): boolean {
  for (const [k, expected] of Object.entries(partial)) {
    // @ts-ignore
    const actual = rec[k];
    if (typeof expected === 'function') {
      if (!(expected as any)(actual)) return false;
    } else if (expected !== undefined) {
      if (actual !== expected) return false;
    }
  }
  return true;
}
