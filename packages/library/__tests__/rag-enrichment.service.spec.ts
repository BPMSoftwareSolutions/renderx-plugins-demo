import { describe, it, expect } from 'vitest';
import { RAGEnrichmentService } from '../src/services/rag-enrichment.service';
import { ComponentJSON } from '../src/services/openai.types';

describe('RAGEnrichmentService', () => {
  let _ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  const enrichmentService = new RAGEnrichmentService();

  // Sample AI-generated component (basic UI only)
  const aiGeneratedButton: ComponentJSON = {
    metadata: {
      type: 'purple-button',
      name: 'Purple Button',
      category: 'custom',
      description: 'A stylish purple button',
      version: '1.0.0',
      author: 'AI Generated',
      tags: ['button', 'interactive', 'purple']
    },
    ui: {
      template: '<button class="purple-btn {{size}}" {{#if disabled}}disabled{{/if}}>{{text}}</button>',
      styles: {
        css: '.purple-btn { background: #8a4baf; }',
        variables: { text: 'Click me', size: 'medium', disabled: false },
        library: { css: '.purple-btn { background: #8a4baf; }', variables: { text: 'Purple Button', size: 'medium' } }
      },
      icon: { mode: 'emoji', value: '💜' }
    }
  };

  // Sample library button component (with full integration and interactions)
  const libraryButton: ComponentJSON = {
    metadata: {
      type: 'button',
      name: 'Button',
      category: 'component',
      description: 'Standard button component',
      version: '1.0.0',
      author: 'Library',
      tags: ['button', 'interactive']
    },
    ui: {
      template: '<button class="btn {{variant}} {{size}}" {{#if disabled}}disabled{{/if}}>{{text}}</button>',
      styles: {
        css: '.btn { padding: 8px 16px; }',
        variables: { text: 'Button', variant: 'primary', size: 'medium', disabled: false },
        library: { css: '.btn { padding: 8px 16px; }', variables: { text: 'Button', size: 'medium' } }
      },
      icon: { mode: 'emoji', value: '🔘' },
      tools: {
        drag: { enabled: true },
        resize: { enabled: true, handles: ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] }
      }
    },
    integration: {
      properties: {
        schema: {
          text: { type: 'string', default: 'Click me', description: 'Button text' },
          variant: { type: 'string', default: 'primary', enum: ['primary', 'secondary', 'danger'], description: 'Button style' },
          size: { type: 'string', default: 'medium', enum: ['small', 'medium', 'large'], description: 'Button size' },
          disabled: { type: 'boolean', default: false, description: 'Disabled state' }
        },
        defaultValues: { text: 'Click me', variant: 'primary', size: 'medium', disabled: false }
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
    },
    interactions: {
      'canvas.component.create': { pluginId: 'CanvasComponentPlugin', sequenceId: 'canvas-component-create-symphony' },
      'canvas.component.select': { pluginId: 'CanvasComponentSelectionPlugin', sequenceId: 'canvas-component-select-symphony' },
      'canvas.component.drag.move': { pluginId: 'CanvasComponentDragPlugin', sequenceId: 'canvas-component-drag-symphony' },
      'canvas.component.resize.start': { pluginId: 'CanvasComponentResizeStartPlugin', sequenceId: 'canvas-component-resize-start-symphony' },
      'canvas.component.resize.move': { pluginId: 'CanvasComponentResizeMovePlugin', sequenceId: 'canvas-component-resize-move-symphony' },
      'canvas.component.resize.end': { pluginId: 'CanvasComponentResizeEndPlugin', sequenceId: 'canvas-component-resize-end-symphony' }
    }
  };

  describe('enrichComponent', () => {
    it('should enrich AI component with library data when similar component found', async () => {
      const result = await enrichmentService.enrichComponent(aiGeneratedButton, [libraryButton]);

      expect(result.component.integration).toBeDefined();
      expect(result.component.integration?.properties).toBeDefined();
      expect(result.component.integration?.events).toBeDefined();
      expect(result.component.integration?.canvasIntegration).toBeDefined();
      expect(result.component.interactions).toBeDefined();
      expect(Object.keys(result.component.interactions!).length).toBeGreaterThan(0);
      expect(result.component.ui.tools).toBeDefined();
      expect(result.enrichmentStrategy).toBe('similar-merge');
      expect(result.sourceComponents).toContain('Button');
    });

    it('should use default enrichment when no library components provided', async () => {
      const result = await enrichmentService.enrichComponent(aiGeneratedButton, []);

      expect(result.component.integration).toBeDefined();
      expect(result.component.interactions).toBeDefined();
      expect(result.component.ui.tools).toBeDefined();
      expect(result.enrichmentStrategy).toBe('default');
      expect(result.sourceComponents.length).toBe(0);
      expect(result.confidence).toBe(0.5);
    });

    it('should preserve AI-generated UI when enriching', async () => {
      const result = await enrichmentService.enrichComponent(aiGeneratedButton, [libraryButton]);

      expect(result.component.metadata.type).toBe('purple-button');
      expect(result.component.metadata.name).toBe('Purple Button');
      expect(result.component.ui.template).toBe(aiGeneratedButton.ui.template);
      expect(result.component.ui.styles).toEqual(aiGeneratedButton.ui.styles);
      expect(result.component.ui.icon).toEqual(aiGeneratedButton.ui.icon);
    });

    it('should merge properties from multiple library components', async () => {
      const inputComponent: ComponentJSON = {
        ...libraryButton,
        metadata: { ...libraryButton.metadata, type: 'input' }
      };

      const result = await enrichmentService.enrichComponent(aiGeneratedButton, [libraryButton, inputComponent]);

      expect(result.component.integration?.properties?.schema).toBeDefined();
      expect(Object.keys(result.component.integration?.properties?.schema || {}).length).toBeGreaterThan(0);
    });

    it('should include all standard canvas interactions in default enrichment', async () => {
      const result = await enrichmentService.enrichComponent(aiGeneratedButton, []);

      const interactions = result.component.interactions || {};
      expect(interactions['canvas.component.create']).toBeDefined();
      expect(interactions['canvas.component.select']).toBeDefined();
      expect(interactions['canvas.component.drag.move']).toBeDefined();
      expect(interactions['canvas.component.resize.start']).toBeDefined();
      expect(interactions['canvas.component.resize.move']).toBeDefined();
      expect(interactions['canvas.component.resize.end']).toBeDefined();
    });

    it('should set high confidence for exact type matches', async () => {
      const exactMatchButton: ComponentJSON = {
        ...libraryButton,
        metadata: { ...libraryButton.metadata, type: 'purple-button' }
      };

      const result = await enrichmentService.enrichComponent(aiGeneratedButton, [exactMatchButton]);

      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should include ui.tools in enriched component', async () => {
      const result = await enrichmentService.enrichComponent(aiGeneratedButton, [libraryButton]);

      expect(result.component.ui.tools).toBeDefined();
      expect(result.component.ui.tools?.drag).toBeDefined();
      expect(result.component.ui.tools?.resize).toBeDefined();
      expect(result.component.ui.tools?.resize?.handles).toBeDefined();
    });

    it('should preserve existing integration if already present', async () => {
      const componentWithIntegration: ComponentJSON = {
        ...aiGeneratedButton,
        integration: {
          properties: { schema: { custom: { type: 'string' } }, defaultValues: {} },
          events: { custom: { description: 'Custom event' } }
        }
      };

      const result = await enrichmentService.enrichComponent(componentWithIntegration, [libraryButton]);

      // Should merge, not replace
      expect(result.component.integration?.properties?.schema?.custom).toBeDefined();
    });
  });
});

