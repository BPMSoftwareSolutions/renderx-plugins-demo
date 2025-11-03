import { ComponentJSON } from './openai.types';
import { RAGEnrichmentService, EnrichmentResult } from './rag-enrichment.service';

export interface TelemetryChunk {
  lines: string[];
  metadata: { timestamp: string };
}

export interface TelemetryEnrichmentResult extends EnrichmentResult {
  telemetryUsed: boolean;
  interactionCount: number;
  extractedPatterns?: {
    componentType: string;
    operations: Record<string, any>;
  };
}

export interface InteractionWithTelemetry {
  pluginId: string;
  sequenceId: string;
  frequency?: number;
  averageDuration?: number;
  eventSequences?: Array<{
    sequenceId: string;
    sequenceName: string;
    eventCount: number;
    totalDuration: number;
  }>;
}

export class RAGEnrichmentTelemetryService extends RAGEnrichmentService {
  /**
   * Enrich AI-generated component with telemetry data
   */
  async enrichComponentWithTelemetry(
    aiComponent: ComponentJSON,
    libraryComponents: ComponentJSON[],
    telemetryChunks: TelemetryChunk[]
  ): Promise<TelemetryEnrichmentResult> {
    // First, get base enrichment
    const baseResult = await this.enrichComponent(aiComponent, libraryComponents);

    if (!telemetryChunks || telemetryChunks.length === 0) {
      return {
        ...baseResult,
        telemetryUsed: false,
        interactionCount: Object.keys(baseResult.component.interactions || {}).length
      };
    }

    // Extract patterns from telemetry
    const extractedPatterns = this.extractPatternsFromTelemetry(telemetryChunks, aiComponent);

    // Enrich interactions with telemetry data
    const enrichedInteractions = this.enrichInteractionsWithTelemetry(
      baseResult.component.interactions || {},
      telemetryChunks
    );

    // Update component with enriched interactions
    const enrichedComponent: ComponentJSON = {
      ...baseResult.component,
      interactions: enrichedInteractions
    };

    const interactionCount = Object.keys(enrichedInteractions).length;

    return {
      component: enrichedComponent,
      sourceComponents: baseResult.sourceComponents,
      enrichmentStrategy: baseResult.enrichmentStrategy,
      confidence: Math.min(1.0, baseResult.confidence + 0.1), // Boost confidence with telemetry
      telemetryUsed: true,
      interactionCount,
      extractedPatterns
    };
  }

  private extractPatternsFromTelemetry(
    chunks: TelemetryChunk[],
    component: ComponentJSON
  ): { componentType: string; operations: Record<string, any> } {
    const operations: Record<string, any> = {};

    // Simple pattern extraction - count occurrences of operations in telemetry
    for (const chunk of chunks) {
      for (const line of chunk.lines) {
        // Extract operation patterns from event logs
        if (line.includes('create')) operations.create = (operations.create || 0) + 1;
        if (line.includes('update')) operations.update = (operations.update || 0) + 1;
        if (line.includes('delete')) operations.delete = (operations.delete || 0) + 1;
        if (line.includes('click')) operations.click = (operations.click || 0) + 1;
        if (line.includes('drag')) operations.drag = (operations.drag || 0) + 1;
        if (line.includes('resize')) operations.resize = (operations.resize || 0) + 1;
      }
    }

    return {
      componentType: component.metadata.type,
      operations
    };
  }

  private enrichInteractionsWithTelemetry(
    baseInteractions: Record<string, any>,
    chunks: TelemetryChunk[]
  ): Record<string, InteractionWithTelemetry> {
    const enriched: Record<string, InteractionWithTelemetry> = { ...baseInteractions };

    // Analyze telemetry for interaction patterns
    const interactionStats: Record<string, {
      frequency: number;
      totalDuration: number;
      eventSequences: Array<{
        sequenceId: string;
        sequenceName: string;
        eventCount: number;
        totalDuration: number;
      }>;
    }> = {};

    for (const chunk of chunks) {
      for (const line of chunk.lines) {
        // Look for interaction patterns in logs
        const interactionMatch = line.match(/interaction:(\w+\.\w+\.\w+)/);
        if (interactionMatch) {
          const interactionKey = interactionMatch[1];
          if (!interactionStats[interactionKey]) {
            interactionStats[interactionKey] = {
              frequency: 0,
              totalDuration: 0,
              eventSequences: []
            };
          }
          interactionStats[interactionKey].frequency++;

          // Extract duration if present
          const durationMatch = line.match(/duration:(\d+)/);
          if (durationMatch) {
            interactionStats[interactionKey].totalDuration += parseInt(durationMatch[1]);
          }
        }
      }
    }

    // Merge telemetry data into interactions
    for (const [key, stats] of Object.entries(interactionStats)) {
      if (enriched[key]) {
        enriched[key] = {
          ...enriched[key],
          frequency: stats.frequency,
          averageDuration: stats.totalDuration / stats.frequency,
          eventSequences: stats.eventSequences
        };
      } else {
        // Add new interaction from telemetry
        enriched[key] = {
          pluginId: 'TelemetryDerivedPlugin',
          sequenceId: `${key}-sequence`,
          frequency: stats.frequency,
          averageDuration: stats.totalDuration / stats.frequency,
          eventSequences: stats.eventSequences
        };
      }
    }

    return enriched;
  }
}