/**
 * RAG Enrichment Service
 * 
 * Takes AI-generated component (basic UI structure) and enriches it with:
 * - integration (properties schema, events, canvas integration)
 * - interactions (plugin/sequence mappings)
 * 
 * By finding similar components in the library and merging their metadata.
 */

import { ComponentJSON } from './openai.types';

export interface EnrichmentResult {
  component: ComponentJSON;
  sourceComponents: string[];
  enrichmentStrategy: 'exact-match' | 'similar-merge' | 'default';
  confidence: number;
}

export class RAGEnrichmentService {
  /**
   * Enrich AI-generated component with integration and interactions from library
   */
  async enrichComponent(
    aiComponent: ComponentJSON,
    libraryComponents: ComponentJSON[]
  ): Promise<EnrichmentResult> {
    if (!libraryComponents || libraryComponents.length === 0) {
      // No library components available, return with defaults
      return this.enrichWithDefaults(aiComponent);
    }

    // Find similar components based on type
    const similarComponents = this.findSimilarComponents(aiComponent, libraryComponents);

    if (similarComponents.length === 0) {
      // No similar components found, use defaults
      return this.enrichWithDefaults(aiComponent);
    }

    // Merge integration and interactions from similar components
    const enrichedComponent = this.mergeComponentData(aiComponent, similarComponents);

    return {
      component: enrichedComponent,
      sourceComponents: similarComponents.map(c => c.metadata.name),
      enrichmentStrategy: similarComponents.length > 0 ? 'similar-merge' : 'default',
      confidence: Math.min(0.95, 0.7 + (similarComponents.length * 0.1))
    };
  }

  /**
   * Find similar components based on type and category
   */
  private findSimilarComponents(
    aiComponent: ComponentJSON,
    libraryComponents: ComponentJSON[]
  ): ComponentJSON[] {
    const componentType = aiComponent.metadata.type.toLowerCase();
    
    // First, try exact type match
    const exactMatches = libraryComponents.filter(
      c => c.metadata.type.toLowerCase() === componentType
    );

    if (exactMatches.length > 0) {
      return exactMatches.slice(0, 3); // Return up to 3 exact matches
    }

    // If no exact match, try partial matches (e.g., "button" in "primary-button")
    const partialMatches = libraryComponents.filter(c => {
      const libType = c.metadata.type.toLowerCase();
      return libType.includes(componentType) || componentType.includes(libType);
    });

    if (partialMatches.length > 0) {
      return partialMatches.slice(0, 3);
    }

    // If still no match, return first component as fallback
    return libraryComponents.slice(0, 1);
  }

  /**
   * Merge AI component with data from similar library components
   */
  private mergeComponentData(
    aiComponent: ComponentJSON,
    similarComponents: ComponentJSON[]
  ): ComponentJSON {
    const merged = { ...aiComponent };

    // Merge integration from all similar components with existing integration
    const allComponentsForIntegration = aiComponent.integration
      ? [aiComponent, ...similarComponents]
      : similarComponents;
    const mergedIntegration = this.mergeIntegration(allComponentsForIntegration);
    if (mergedIntegration) {
      merged.integration = mergedIntegration;
    }

    // Merge interactions from all similar components
    const mergedInteractions = this.mergeInteractions(similarComponents);
    if (mergedInteractions && Object.keys(mergedInteractions).length > 0) {
      merged.interactions = mergedInteractions;
    }

    // Merge ui.tools if not present
    if (!merged.ui.tools && similarComponents[0]?.ui?.tools) {
      merged.ui.tools = similarComponents[0].ui.tools;
    }

    return merged;
  }

  /**
   * Merge integration settings from multiple components
   */
  private mergeIntegration(components: ComponentJSON[]): any {
    const merged: any = {};

    // Merge properties - start with empty, then add from all components
    const mergedProperties: Record<string, any> = {};
    const mergedDefaults: Record<string, any> = {};

    for (const comp of components) {
      if (comp.integration?.properties?.schema) {
        // Merge schema properties, don't overwrite existing ones
        for (const [key, value] of Object.entries(comp.integration.properties.schema)) {
          if (!mergedProperties[key]) {
            mergedProperties[key] = value;
          }
        }
      }
      if (comp.integration?.properties?.defaultValues) {
        // Merge defaults, don't overwrite existing ones
        for (const [key, value] of Object.entries(comp.integration.properties.defaultValues)) {
          if (!(key in mergedDefaults)) {
            mergedDefaults[key] = value;
          }
        }
      }
    }

    if (Object.keys(mergedProperties).length > 0) {
      merged.properties = {
        schema: mergedProperties,
        defaultValues: mergedDefaults
      };
    }

    // Merge events - don't overwrite existing ones
    const mergedEvents: Record<string, any> = {};
    for (const comp of components) {
      if (comp.integration?.events) {
        for (const [key, value] of Object.entries(comp.integration.events)) {
          if (!mergedEvents[key]) {
            mergedEvents[key] = value;
          }
        }
      }
    }

    if (Object.keys(mergedEvents).length > 0) {
      merged.events = mergedEvents;
    }

    // Use canvas integration from first component
    if (components[0]?.integration?.canvasIntegration) {
      merged.canvasIntegration = components[0].integration.canvasIntegration;
    }

    return Object.keys(merged).length > 0 ? merged : null;
  }

  /**
   * Merge interactions from multiple components
   */
  private mergeInteractions(components: ComponentJSON[]): Record<string, any> {
    const merged: Record<string, any> = {};

    for (const comp of components) {
      if (comp.interactions) {
        Object.assign(merged, comp.interactions);
      }
    }

    return merged;
  }

  /**
   * Enrich component with default integration and interactions
   */
  private enrichWithDefaults(aiComponent: ComponentJSON): EnrichmentResult {
    const enriched = { ...aiComponent };

    // Add default integration if not present
    if (!enriched.integration) {
      enriched.integration = {
        properties: {
          schema: {},
          defaultValues: {}
        },
        events: {
          click: { description: 'Triggered when clicked', parameters: ['event', 'elementData'] },
          focus: { description: 'Triggered on focus', parameters: ['event', 'elementData'] },
          blur: { description: 'Triggered on blur', parameters: ['event', 'elementData'] }
        },
        canvasIntegration: {
          resizable: true,
          draggable: true,
          selectable: true,
          minWidth: 80,
          minHeight: 30,
          defaultWidth: 120,
          defaultHeight: 40,
          snapToGrid: true,
          allowChildElements: false
        }
      };
    }

    // Add default interactions if not present
    if (!enriched.interactions) {
      enriched.interactions = {
        'canvas.component.create': {
          pluginId: 'CanvasComponentPlugin',
          sequenceId: 'canvas-component-create-symphony'
        },
        'canvas.component.select': {
          pluginId: 'CanvasComponentSelectionPlugin',
          sequenceId: 'canvas-component-select-symphony'
        },
        'canvas.component.drag.move': {
          pluginId: 'CanvasComponentDragPlugin',
          sequenceId: 'canvas-component-drag-symphony'
        },
        'canvas.component.resize.start': {
          pluginId: 'CanvasComponentResizeStartPlugin',
          sequenceId: 'canvas-component-resize-start-symphony'
        },
        'canvas.component.resize.move': {
          pluginId: 'CanvasComponentResizeMovePlugin',
          sequenceId: 'canvas-component-resize-move-symphony'
        },
        'canvas.component.resize.end': {
          pluginId: 'CanvasComponentResizeEndPlugin',
          sequenceId: 'canvas-component-resize-end-symphony'
        }
      };
    }

    // Add default tools if not present
    if (!enriched.ui.tools) {
      enriched.ui.tools = {
        drag: { enabled: true },
        resize: {
          enabled: true,
          handles: ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
        }
      };
    }

    return {
      component: enriched,
      sourceComponents: [],
      enrichmentStrategy: 'default',
      confidence: 0.5
    };
  }
}

