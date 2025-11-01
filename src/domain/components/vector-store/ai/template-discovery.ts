/**
 * TemplateDiscoveryService
 *
 * Responsible for detecting exact matches and ranking similar components in the component library.
 * Part of Phase 7: Template Discovery & Synthesis (RAG System)
 */


// Types from technical specifications
export interface JsonComponent {
  type: string;
  name: string;
  tags?: string[];
  [key: string]: any;
}

export interface ExactMatchResult {
  found: boolean;
  component: JsonComponent | null;
  confidence: number;
  reason: string;
}

export class TemplateDiscoveryService {
  public componentLibrary: JsonComponent[] = [];

  constructor() {}

  async extractComponentType(prompt: string): Promise<string> {
    // Naive implementation: extract first word matching a known type
    const lowerPrompt = prompt.toLowerCase();
    for (const c of this.componentLibrary) {
      if (lowerPrompt.includes(c.type.toLowerCase())) {
        return c.type;
      }
    }
    // Fallback: extract last word (e.g., "button" from "Create a button")
    const match = lowerPrompt.match(/(button|input|card|widget|label|image|icon)/);
    return match ? match[1][0].toUpperCase() + match[1].slice(1) : '';
  }

  async findByType(type: string): Promise<JsonComponent | null> {
    return this.componentLibrary.find(c => c.type.toLowerCase() === type.toLowerCase()) || null;
  }

  async detectExactMatch(prompt: string): Promise<ExactMatchResult> {
    const type = await this.extractComponentType(prompt);
    if (!type) {
      return { found: false, component: null, confidence: 0, reason: 'No type detected in prompt' };
    }
    const component = await this.findByType(type);
    if (component) {
      return {
        found: true,
        component,
        confidence: 0.95,
        reason: `Exact match found for type '${type}'`
      };
    }
    return {
      found: false,
      component: null,
      confidence: 0,
      reason: `No exact match for type '${type}'`
    };
  }

  // Legacy: for backward compatibility with old tests
  findExactMatch(componentType: string): { component: any; confidence: number } | null {
    const match = this.componentLibrary.find(c => c.type === componentType);
    if (match) {
      return { component: match, confidence: 1.0 };
    }
    return null;
  }

  // Legacy: for backward compatibility with old tests
  rankSimilarComponents(query: string, constraints?: any): Array<{ component: any; score: number; explanation: string }> {
    const q = query.toLowerCase();
    const results = this.componentLibrary
      .map(component => {
        let score = 0;
        if (q.includes(component.type?.toLowerCase())) score += 0.7;
        if (q.includes(component.name?.toLowerCase())) score += 0.2;
        if (component.tags && component.tags.some((t: string) => q.includes(t.toLowerCase()))) score += 0.1;
        return {
          component,
          score,
          explanation: `Matched on ${score >= 0.7 ? 'type' : score >= 0.2 ? 'name' : 'tags'}`
        };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return results;
  }
}
