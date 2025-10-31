import { TemplateDiscoveryService } from '../ai/template-discovery';
import { PatternExtractor } from '../ai/pattern-extractor';
import { TemplateSynthesisEngine, FullComponent } from '../ai/template-synthesis';

describe('Integration: Template Discovery & Synthesis', () => {
  const componentLibrary = [
    { type: 'Button', name: 'PrimaryButton', tags: ['primary', 'action'] },
    { type: 'Button', name: 'DangerButton', tags: ['danger'] },
    { type: 'Input', name: 'TextInput', tags: ['form', 'text'] },
  ];

  const fullComponents: FullComponent[] = [
    {
      metadata: { type: 'Button', name: 'PrimaryButton', tags: ['primary', 'action'] },
      ui: { template: '<button class="primary">{{content}}</button>' }
    },
    {
      metadata: { type: 'Button', name: 'DangerButton', tags: ['danger'] },
      ui: { template: '<button class="danger">{{content}}</button>' }
    },
    {
      metadata: { type: 'Input', name: 'TextInput', tags: ['form', 'text'] },
      ui: { template: '<input type="text" />' }
    },
  ];

  it('should discover, extract patterns, and synthesize a new button template', async () => {
    const discovery = new TemplateDiscoveryService();
    discovery.componentLibrary = componentLibrary;
    // 1. Find similar components
    const ranked = discovery.rankSimilarComponents('button');
    expect(ranked.length).toBeGreaterThan(0);
    // 2. Extract patterns from similar components
    const extractor = new PatternExtractor();
    const patterns = await extractor.extractPatterns(ranked.map(r => r.component));
    expect(patterns.some(p => p.name === 'Button Variant')).toBe(true);
    // 3. Synthesize a new template from base and patterns
    const engine = new TemplateSynthesisEngine();
    // Get full components for synthesis
    const rankedFullComponents = ranked
      .map(r => fullComponents.find(fc => fc.metadata.name === r.component.name))
      .filter((c): c is FullComponent => c !== undefined);

    const result = await engine.synthesizeComponent('button with custom variant', rankedFullComponents);
    expect(result.metadata.type).toBe('Button');
    expect(result.metadata.name).toBe('PrimaryButton');
    expect(result.ui.template).toContain('button');
    expect(result.sourceComponents).toContain('PrimaryButton');
  });
});
