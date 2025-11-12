/**
 * RAG Enrichment Service with Telemetry Support
 *
 * Extends RAG enrichment to use conductor telemetry logs to extract realistic
 * component behavior patterns and interactions.
 */

import { ComponentJSON } from './openai.types';
import { RAGEnrichmentService, EnrichmentResult } from './rag-enrichment.service';
import { ComponentBehaviorExtractor, ComponentBehaviorPattern, LogChunk } from '../telemetry/component-behavior-extractor';

export interface TelemetryEnrichmentResult extends EnrichmentResult {
  telemetryUsed: boolean;
  extractedPatterns?: ComponentBehaviorPattern;
  interactionCount: number;
}

export class RAGEnrichmentTelemetryService extends RAGEnrichmentService {
  private behaviorExtractor: ComponentBehaviorExtractor;

  constructor() {
    super();
    this.behaviorExtractor = new ComponentBehaviorExtractor();
  }

  /**
   * Enrich AI-generated component using both library and telemetry data
   */
  async enrichComponentWithTelemetry(
    aiComponent: ComponentJSON,
    libraryComponents: ComponentJSON[],
    telemetryChunks: LogChunk[]
  ): Promise<TelemetryEnrichmentResult> {
    // First, get base enrichment from library
    const baseEnrichment = await this.enrichComponent(aiComponent, libraryComponents);

    // Extract behavior patterns from telemetry
    const patterns = await this.behaviorExtractor.extractPatterns(telemetryChunks);

    // Find patterns matching the component type
    const componentType = aiComponent.metadata.type.toLowerCase();
    const matchingPattern = this.findMatchingPattern(componentType, patterns);

    if (!matchingPattern) {
      // No telemetry patterns found, return base enrichment
      return {
        ...baseEnrichment,
        telemetryUsed: false,
        interactionCount: Object.keys(baseEnrichment.component.interactions || {}).length
      };
    }

    // Enrich with telemetry data
    const telemetryEnriched = this.enrichWithTelemetryPatterns(
      baseEnrichment.component,
      matchingPattern
    );

    return {
      component: telemetryEnriched,
      sourceComponents: baseEnrichment.sourceComponents,
      enrichmentStrategy: 'similar-merge',
      confidence: Math.min(0.99, baseEnrichment.confidence + 0.15),
      telemetryUsed: true,
      extractedPatterns: matchingPattern,
      interactionCount: Object.keys(telemetryEnriched.interactions || {}).length
    };
  }

  /**
   * Find pattern matching the component type
   */
  private findMatchingPattern(
    componentType: string,
    patterns: ComponentBehaviorPattern[]
  ): ComponentBehaviorPattern | null {
    // Try exact match first
    let match = patterns.find(p => p.componentType === componentType);
    if (match) return match;

    // Try partial match
    match = patterns.find(p =>
      p.componentType.includes(componentType) || componentType.includes(p.componentType)
    );
    if (match) return match;

    // Return first pattern as fallback
    return patterns.length > 0 ? patterns[0] : null;
  }

  /**
   * Enrich component with telemetry-extracted patterns
   */
  private enrichWithTelemetryPatterns(
    component: ComponentJSON,
    pattern: ComponentBehaviorPattern
  ): ComponentJSON {
    const enriched = { ...component };

    // Merge interactions from telemetry patterns
    const telemetryInteractions = this.extractInteractionsFromPattern(pattern);
    if (Object.keys(telemetryInteractions).length > 0) {
      enriched.interactions = {
        ...enriched.interactions,
        ...telemetryInteractions
      };
    }

    // Enhance integration with telemetry insights
    if (!enriched.integration) {
      enriched.integration = {};
    }

    // Add telemetry-based properties
    enriched.integration.telemetryInsights = {
      operationCount: Object.keys(pattern.operations).length,
      averageExecutionTime: this.calculateAverageExecutionTime(pattern),
      commonOperations: Object.keys(pattern.operations).slice(0, 5),
      dataFlowPatterns: this.extractDataFlowSummary(pattern)
    };

    return enriched;
  }

  /**
   * Extract interactions from behavior pattern
   */
  private extractInteractionsFromPattern(pattern: ComponentBehaviorPattern): Record<string, any> {
    const interactions: Record<string, any> = {};

    for (const [operation, opData] of Object.entries(pattern.operations)) {
      // Create interaction for each operation
      const topMapping = opData.pluginSequenceMappings[0];
      if (topMapping) {
        interactions[`canvas.component.${operation}`] = {
          pluginId: topMapping.pluginId,
          sequenceId: topMapping.sequenceId,
          topic: topMapping.topic,
          frequency: opData.frequency,
          averageDuration: Math.round(opData.averageDuration),
          eventSequences: opData.eventSequences.map(seq => ({
            sequenceId: seq.sequenceId,
            sequenceName: seq.sequenceName,
            eventCount: seq.eventCount,
            totalDuration: seq.totalDuration
          }))
        };
      }
    }

    return interactions;
  }

  /**
   * Calculate average execution time across all operations
   */
  private calculateAverageExecutionTime(pattern: ComponentBehaviorPattern): number {
    const durations = Object.values(pattern.operations)
      .filter(op => op.averageDuration > 0)
      .map(op => op.averageDuration);

    if (durations.length === 0) return 0;
    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  }

  /**
   * Extract data flow summary from pattern
   */
  private extractDataFlowSummary(pattern: ComponentBehaviorPattern): any {
    const summary: Record<string, any> = {};

    for (const [operation, opData] of Object.entries(pattern.operations)) {
      if (opData.dataFlowPatterns.length > 0) {
        const addedFields = opData.dataFlowPatterns
          .filter(df => df.changeType === 'added')
          .flatMap(df => df.changes);

        const removedFields = opData.dataFlowPatterns
          .filter(df => df.changeType === 'removed')
          .flatMap(df => df.changes);

        if (addedFields.length > 0 || removedFields.length > 0) {
          summary[operation] = {
            fieldsAdded: [...new Set(addedFields)],
            fieldsRemoved: [...new Set(removedFields)]
          };
        }
      }
    }

    return summary;
  }
}

