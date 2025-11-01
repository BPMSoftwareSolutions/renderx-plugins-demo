import { TemplateSynthesisEngine, FullComponent } from '../ai/template-synthesis';

describe('TemplateSynthesisEngine', () => {
  it('should synthesize a new template from base and patterns', () => {
    const engine = new TemplateSynthesisEngine();
    const baseComponent = { type: 'Button', name: 'BaseButton' };
    const patterns = [
      { category: 'Button Variant', properties: { color: 'blue' } },
      { category: 'Accessibility', properties: { role: 'button' } }
    ];
    const result = engine.synthesizeTemplate(baseComponent, patterns);
    // Should include merged properties from patterns
    expect(result).toHaveProperty('type', 'Button');
    expect(result).toHaveProperty('name', 'BaseButton');
    expect(result).toHaveProperty('color', 'blue');
    expect(result).toHaveProperty('role', 'button');
  });

  it('should return the base component unchanged if no patterns are provided', () => {
    const engine = new TemplateSynthesisEngine();
    const baseComponent = { type: 'Input', name: 'TextInput' };
    const result = engine.synthesizeTemplate(baseComponent, []);
    expect(result).toEqual(baseComponent);
  });

  it('should synthesize component with full data including interactions', async () => {
    const engine = new TemplateSynthesisEngine();

    const buttonComponent: FullComponent = {
      metadata: {
        type: 'button',
        name: 'Button'
      },
      ui: {
        template: '<button>{{content}}</button>',
        styles: {
          css: '.rx-button { color: blue; }',
          variables: { 'bg-color': '#007bff' },
          library: {
            css: '.rx-lib .rx-button { display: flex; }',
            variables: { 'font-size': '14px' }
          }
        },
        icon: {
          mode: 'emoji' as const,
          value: '🔘'
        },
        tools: {
          drag: { enabled: true },
          resize: { enabled: true }
        }
      },
      integration: {
        properties: {
          schema: {
            content: { type: 'string', default: 'Click me' }
          },
          defaultValues: { content: 'Click me' }
        },
        events: {
          click: { description: 'Button clicked' }
        },
        canvasIntegration: {
          resizable: true,
          draggable: true,
          minWidth: 80,
          minHeight: 30
        }
      },
      interactions: {
        'canvas.component.create': {
          pluginId: 'CanvasComponentPlugin',
          sequenceId: 'canvas-component-create-symphony'
        },
        'canvas.component.select': {
          pluginId: 'CanvasComponentSelectionPlugin',
          sequenceId: 'canvas-component-select-symphony'
        }
      }
    };

    const result = await engine.synthesizeComponent('Create a button', [buttonComponent]);

    // Verify metadata
    expect(result.metadata).toEqual({
      type: 'button',
      name: 'Button'
    });

    // Verify UI template
    expect(result.ui.template).toBe('<button>{{content}}</button>');

    // Verify integration fields
    expect(result.integration).toBeDefined();
    expect(result.integration?.properties?.schema).toBeDefined();
    expect(result.integration?.properties?.schema?.content).toEqual({
      type: 'string',
      default: 'Click me'
    });
    expect(result.integration?.events?.click).toBeDefined();
    expect(result.integration?.canvasIntegration?.resizable).toBe(true);

    // Verify interactions are preserved
    expect(result.interactions).toBeDefined();
    expect(result.interactions?.['canvas.component.create']).toEqual({
      pluginId: 'CanvasComponentPlugin',
      sequenceId: 'canvas-component-create-symphony'
    });
    expect(result.interactions?.['canvas.component.select']).toEqual({
      pluginId: 'CanvasComponentSelectionPlugin',
      sequenceId: 'canvas-component-select-symphony'
    });

    // Verify synthesis metadata
    expect(result.sourceComponents).toContain('Button');
    expect(result.synthesisStrategy).toBe('combine');
    expect(result.confidence).toBe(0.85);
  });

  it('should merge interactions from multiple components', async () => {
    const engine = new TemplateSynthesisEngine();

    const component1: FullComponent = {
      metadata: { type: 'button', name: 'Button' },
      ui: { template: '<button></button>' },
      interactions: {
        'canvas.component.create': {
          pluginId: 'CanvasComponentPlugin',
          sequenceId: 'canvas-component-create-symphony'
        }
      }
    };

    const component2: FullComponent = {
      metadata: { type: 'button', name: 'Button' },
      ui: { template: '<button></button>' },
      interactions: {
        'canvas.component.select': {
          pluginId: 'CanvasComponentSelectionPlugin',
          sequenceId: 'canvas-component-select-symphony'
        }
      }
    };

    const result = await engine.synthesizeComponent('Create a button', [component1, component2]);

    // Verify both interactions are merged
    expect(result.interactions).toBeDefined();
    expect(Object.keys(result.interactions || {})).toHaveLength(2);
    expect(result.interactions?.['canvas.component.create']).toBeDefined();
    expect(result.interactions?.['canvas.component.select']).toBeDefined();
  });
});
