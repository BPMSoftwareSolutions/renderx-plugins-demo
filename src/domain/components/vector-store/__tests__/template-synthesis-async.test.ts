import { TemplateSynthesisEngine, FullComponent, SynthesizedComponent } from '../ai/template-synthesis';

describe('TemplateSynthesisEngine (async, spec-compliant)', () => {
  const similarComponents: FullComponent[] = [
    {
      metadata: { type: 'Button', name: 'PrimaryButton' },
      ui: { template: '<button class="primary">{{content}}</button>' }
    },
    {
      metadata: { type: 'Button', name: 'DangerButton' },
      ui: { template: '<button class="danger">{{content}}</button>' }
    },
  ];

  it('should synthesize a component from similar components', async () => {
    const engine = new TemplateSynthesisEngine();
    const result: SynthesizedComponent = await engine.synthesizeComponent('button with variants', similarComponents);
    expect(result.metadata.type).toBe('Button');
    expect(result.metadata.name).toBe('PrimaryButton');
    expect(result.ui.template).toContain('button');
    expect(result.sourceComponents).toContain('PrimaryButton');
    expect(result.synthesisStrategy).toBe('combine');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should select the first component as base if available', async () => {
    const engine = new TemplateSynthesisEngine();
    const result: SynthesizedComponent = await engine.synthesizeComponent('button', similarComponents);
    expect(result.metadata.name).toBe('PrimaryButton');
  });

  it('should handle empty similarComponents gracefully', async () => {
    const engine = new TemplateSynthesisEngine();
    const result: SynthesizedComponent = await engine.synthesizeComponent('unknown', []);
    expect(result.metadata.type).toBe('');
    expect(result.metadata.name).toBe('');
    expect(result.ui.template).toMatch(/div/);
    expect(result.sourceComponents).toEqual([]);
  });
});
