/**
 * TemplateSynthesisEngine
 *
 * Responsible for synthesizing new component templates from library patterns and similar components.
 * Part of Phase 7: Template Discovery & Synthesis (RAG System)
 *
 * Enhanced to work with full component JSON structures including:
 * - UI templates (Handlebars)
 * - CSS and variables
 * - Integration properties and events
 * - Canvas integration settings
 */

// Types from technical specifications
export interface ComponentMetadata {
  type: string;
  name: string;
  [key: string]: any;
}

export interface ComponentTemplate {
  template: string;
  styles?: { css?: string; variables?: Record<string, any>; library?: any };
  icon?: any;
  tools?: any;
}

export interface FullComponent {
  metadata: ComponentMetadata;
  ui: ComponentTemplate;
  integration?: any;
  interactions?: any;
}

export interface SynthesizedComponent {
  metadata: ComponentMetadata;
  ui: ComponentTemplate;
  integration?: any;
  interactions?: any;
  sourceComponents: string[];
  synthesisStrategy: 'combine' | 'extend' | 'adapt';
  confidence: number;
}

export class TemplateSynthesisEngine {
  constructor() {}

  /**
   * Synthesize a new component by combining patterns from similar components
   * @param _prompt User request
   * @param similarComponents Full component objects with ui, integration, etc.
   * @returns Synthesized component with merged templates, CSS, and properties
   */
  async synthesizeComponent(
    _prompt: string,
    similarComponents: FullComponent[]
  ): Promise<SynthesizedComponent> {
    if (!similarComponents || similarComponents.length === 0) {
      return {
        metadata: { type: '', name: '' },
        ui: { template: '<div></div>' },
        sourceComponents: [],
        synthesisStrategy: 'combine',
        confidence: 0
      };
    }

    // Select base template from most relevant component
    const base = this.selectBaseTemplate(similarComponents, {});

    // Combine patterns from all similar components
    const ui = this.combinePatterns(base, similarComponents, {});

    // Merge integration settings (properties, events, canvas config)
    const integration = this.mergeIntegration(similarComponents);

    // Merge interactions (plugin/sequence mappings)
    const interactions = this.mergeInteractions(similarComponents);

    return {
      metadata: base.metadata,
      ui,
      integration,
      interactions,
      sourceComponents: similarComponents.map(c => c.metadata?.name || 'Unknown'),
      synthesisStrategy: 'combine',
      confidence: 0.85
    };
  }

  /**
   * Select the best base template from similar components
   * Prefers the first component as it's already ranked by relevance
   */
  selectBaseTemplate(
    components: FullComponent[],
    _requirements: any
  ): FullComponent {
    return components[0] || {
      metadata: { type: '', name: '' },
      ui: { template: '<div></div>' }
    };
  }

  /**
   * Combine UI patterns (templates and CSS) from multiple components
   * Merges Handlebars templates and CSS variables intelligently
   */
  combinePatterns(
    base: FullComponent,
    sources: FullComponent[],
    _requirements: any
  ): ComponentTemplate {
    if (!base.ui) {
      return { template: '<div></div>' };
    }

    // Start with base template
    const template = base.ui.template || '<div></div>';

    // Merge CSS variables from all sources
    const mergedVariables = this.mergeVariables(sources);

    // Merge CSS rules from all sources
    const mergedCss = this.mergeCss(sources);

    // Merge library-specific styles
    const mergedLibrary = this.mergeLibraryStyles(sources);

    // Merge icon settings
    const icon = base.ui.icon || undefined;

    // Merge tools (drag, resize, etc.)
    const tools = base.ui.tools || undefined;

    return {
      template,
      styles: {
        css: mergedCss,
        variables: mergedVariables,
        library: mergedLibrary
      },
      icon,
      tools
    };
  }

  /**
   * Merge CSS variables from all source components
   * Later sources override earlier ones
   */
  private mergeVariables(components: FullComponent[]): Record<string, any> {
    const merged: Record<string, any> = {};

    for (const comp of components) {
      if (comp.ui?.styles?.variables) {
        Object.assign(merged, comp.ui.styles.variables);
      }
    }

    return merged;
  }

  /**
   * Merge CSS rules from all source components
   * Concatenates CSS with deduplication
   */
  private mergeCss(components: FullComponent[]): string {
    const cssSet = new Set<string>();

    for (const comp of components) {
      if (comp.ui?.styles?.css) {
        // Split by closing brace to get individual rules
        const rules = comp.ui.styles.css.split('}').filter(r => r.trim());
        rules.forEach(rule => {
          if (rule.trim()) {
            cssSet.add(rule.trim() + '}');
          }
        });
      }
    }

    return Array.from(cssSet).join('\n');
  }

  /**
   * Merge library-specific styles
   * Combines variables and CSS from library sections
   */
  private mergeLibraryStyles(components: FullComponent[]): any {
    const mergedVars: Record<string, any> = {};
    const cssParts: string[] = [];

    for (const comp of components) {
      if (comp.ui?.styles?.library) {
        const lib = comp.ui.styles.library;
        if (lib.variables) {
          Object.assign(mergedVars, lib.variables);
        }
        if (lib.css) {
          cssParts.push(lib.css);
        }
      }
    }

    return {
      variables: mergedVars,
      css: cssParts.join('\n')
    };
  }

  /**
   * Merge integration settings (properties, events, canvas config)
   * Combines property schemas and event definitions
   */
  private mergeIntegration(components: FullComponent[]): any {
    const mergedProperties: Record<string, any> = {};
    const mergedEvents: Record<string, any> = {};
    let canvasIntegration = {};

    for (const comp of components) {
      if (comp.integration) {
        // Merge property schemas
        if (comp.integration.properties?.schema) {
          Object.assign(mergedProperties, comp.integration.properties.schema);
        }

        // Merge event definitions
        if (comp.integration.events) {
          Object.assign(mergedEvents, comp.integration.events);
        }

        // Use canvas integration from first component
        if (!Object.keys(canvasIntegration).length && comp.integration.canvasIntegration) {
          canvasIntegration = comp.integration.canvasIntegration;
        }
      }
    }

    return {
      properties: {
        schema: mergedProperties,
        defaultValues: this.extractDefaultValues(mergedProperties)
      },
      events: mergedEvents,
      canvasIntegration
    };
  }

  /**
   * Extract default values from property schema
   */
  private extractDefaultValues(schema: Record<string, any>): Record<string, any> {
    const defaults: Record<string, any> = {};

    for (const [key, prop] of Object.entries(schema)) {
      if (prop && typeof prop === 'object' && 'default' in prop) {
        defaults[key] = prop.default;
      }
    }

    return defaults;
  }

  /**
   * Merge interactions (plugin/sequence mappings)
   * Combines event-to-plugin mappings from all sources
   */
  private mergeInteractions(components: FullComponent[]): any {
    const merged: Record<string, any> = {};

    for (const comp of components) {
      if (comp.interactions) {
        Object.assign(merged, comp.interactions);
      }
    }

    return merged;
  }

  // Legacy: for backward compatibility with old tests
  synthesizeTemplate(baseComponent: any, patterns: any[]): any {
    if (!patterns || patterns.length === 0) {
      return baseComponent;
    }
    // Merge all pattern properties into a new object
    const mergedProps = patterns.reduce((acc, pattern) => {
      if (pattern.properties) {
        Object.assign(acc, pattern.properties);
      }
      return acc;
    }, {} as any);
    return { ...baseComponent, ...mergedProps };
  }
}
