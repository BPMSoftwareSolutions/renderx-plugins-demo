/**
 * Real Estate Analyzer Plugin
 * Main entry point for the plugin
 */

import { ZillowService, type PropertyData } from './services/zillow.service';
import { AnalysisEngine, type FlippingOpportunity } from './services/analysis.engine';

export { OpportunityAnalyzer } from './ui/OpportunityAnalyzer';

/**
 * Plugin handlers for sequences
 */
export const handlers = {
  /**
   * Fetch property 3D tour data from Zillow
   */
  async fetchProperty3DTour(input: { propertyUrl: string }) {
    try {
      const tourData = await ZillowService.getProperty3DTour(input.propertyUrl);
      return {
        success: true,
        propertyData: tourData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch property data',
      };
    }
  },

  /**
   * Analyze property for flipping opportunity
   */
  async analyzeProperty(input: { propertyData: PropertyData }) {
    try {
      const opportunity = AnalysisEngine.analyzeProperty(input.propertyData);
      return {
        success: true,
        analysis: opportunity,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze property',
      };
    }
  },

  /**
   * Format results for UI display
   */
  async formatResults(input: { analysis: FlippingOpportunity }) {
    return {
      opportunities: [input.analysis],
      timestamp: new Date().toISOString(),
    };
  },
};

/**
 * Plugin registration function
 * Called by the conductor to register sequences and handlers
 */
export async function register(conductor: any) {
  console.log('🏠 Real Estate Analyzer Plugin registered');

  // Register handlers with conductor
  Object.entries(handlers).forEach(([name, handler]) => {
    conductor.registerHandler(`RealEstateAnalyzerPlugin:${name}`, handler);
  });
}

