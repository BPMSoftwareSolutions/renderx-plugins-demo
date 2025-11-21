/**
 * Real Estate Analyzer Plugin
 * Main entry point for the plugin
 */

import { ZillowService, type PropertyData } from './services/zillow.service';
import { AnalysisEngine, type FlippingOpportunity } from './services/analysis.engine';

// Sequence type helpers (lightweight contract)
interface AnalyzerResultPayload {
  propertyData?: PropertyData;
  analysis?: FlippingOpportunity;
  result?: { opportunities: FlippingOpportunity[]; timestamp: string };
  error?: string;
}

interface SequenceContext {
  payload: AnalyzerResultPayload;
}

interface SequenceBeat {
  beat: number;
  event: string;
  title: string;
  dynamics: string;
  handler: keyof typeof handlers;
  timing: string;
  kind: string;
}

interface SequenceMovement {
  id: string;
  name: string;
  beats: SequenceBeat[];
}

interface SequenceDefinition {
  pluginId: string;
  id: string;
  name: string;
  movements: SequenceMovement[];
}

interface ConductorLike {
  mount(seq: SequenceDefinition, h: typeof handlers, pluginId: string): Promise<void>;
}

// Orchestrated sequence handlers (beats)
export const handlers = {
  async fetchPropertyData(data: { propertyUrl: string }, ctx: SequenceContext) {
    try {
      const raw = await ZillowService.getProperty3DTour(data.propertyUrl);
      const property: PropertyData = {
        zpid: raw?.zpid || 'unknown-zpid',
        address: raw?.address || data.propertyUrl,
        price: raw?.price || 250000,
        bedrooms: raw?.bedrooms || 3,
        bathrooms: raw?.bathrooms || 2,
        sqft: raw?.sqft || 1800,
        yearBuilt: raw?.yearBuilt || 1995,
        propertyType: raw?.propertyType || 'single_family',
        zestimate: raw?.zestimate,
        priceHistory: raw?.priceHistory || [],
        taxHistory: raw?.taxHistory || [],
        url: data.propertyUrl,
      };
      ctx.payload.propertyData = property;
      return { ok: true };
    } catch (error) {
      ctx.payload.error = error instanceof Error ? error.message : 'Failed to fetch property data';
      return { ok: false };
    }
  },
  async analyze(_data: Record<string, never>, ctx: SequenceContext) {
    if (!ctx.payload.propertyData) return { skipped: true };
    try {
      ctx.payload.analysis = AnalysisEngine.analyzeProperty(ctx.payload.propertyData);
      return { ok: true };
    } catch (error) {
      ctx.payload.error = error instanceof Error ? error.message : 'Failed to analyze property';
      return { ok: false };
    }
  },
  async format(_data: Record<string, never>, ctx: SequenceContext) {
    if (!ctx.payload.analysis) return { opportunities: [], empty: true };
    ctx.payload.result = {
      opportunities: [ctx.payload.analysis],
      timestamp: new Date().toISOString(),
    };
    return { count: 1 };
  },
};

export { OpportunityAnalyzer } from './ui/OpportunityAnalyzer';

export async function register(conductor: ConductorLike & { _runtimeMountedSeqIds?: Set<string> }) {
  if (!conductor?.mount) return;
  const searchSeq: SequenceDefinition = {
    pluginId: 'RealEstateAnalyzerPlugin',
    id: 'real-estate-analyzer-search-symphony',
    name: 'Real Estate Analyzer Search',
    movements: [
      {
        id: 'search',
        name: 'Search',
        beats: [
          { beat: 1, event: 'real.estate.analyzer:fetch', title: 'Fetch Property Data', dynamics: 'mf', handler: 'fetchPropertyData', timing: 'immediate', kind: 'pure' },
          { beat: 2, event: 'real.estate.analyzer:analyze', title: 'Analyze Property', dynamics: 'mf', handler: 'analyze', timing: 'immediate', kind: 'pure' },
          { beat: 3, event: 'real.estate.analyzer:format', title: 'Format Results', dynamics: 'mf', handler: 'format', timing: 'immediate', kind: 'pure' },
        ],
      },
    ],
  };
  const mark = (id: string) => {
    const set = conductor._runtimeMountedSeqIds || new Set<string>();
    set.add(id);
    conductor._runtimeMountedSeqIds = set;
  };
  await conductor.mount(searchSeq, handlers, searchSeq.pluginId);
  mark(searchSeq.id);
}

