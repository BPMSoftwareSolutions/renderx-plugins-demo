import { RAGEnrichmentTelemetryService } from '../rag-enrichment-telemetry.service';
import { promises as fs } from 'fs';
import { ComponentJSON } from '../openai.types';
import * as path from 'path';

// Minimal local helper to avoid cross-package import for LogLoader
async function loadAndChunk(filePath: string, { chunkSize }: { chunkSize: number }) {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const chunks: Array<{ lines: string[]; metadata: { timestamp: string } }> = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push({ lines: lines.slice(i, i + chunkSize), metadata: { timestamp: '' } });
  }
  return chunks;
}


describe('RAGEnrichmentTelemetryService', () => {
  let service: RAGEnrichmentTelemetryService;
  let sampleAiComponent: ComponentJSON;
  let sampleLibraryComponents: ComponentJSON[];

  beforeAll(async () => {
    service = new RAGEnrichmentTelemetryService();

    // Create sample AI-generated component
    sampleAiComponent = {
      metadata: {
        name: 'CustomButton',
        type: 'button',
        description: 'A custom button component',
        version: '1.0.0'
      },
      ui: {
        markup: '<button>Click me</button>',
        styles: 'button { padding: 8px 16px; }'
      }
    };

    // Create sample library components
    sampleLibraryComponents = [
      {
        metadata: {
          name: 'PrimaryButton',
          type: 'button',
          description: 'Primary button',
          version: '1.0.0'
        },
        ui: {
          markup: '<button class="primary">Click</button>',
          styles: 'button.primary { background: blue; }',
          tools: {
            drag: { enabled: true },
            resize: { enabled: true, handles: ['e', 'w'] }
          }
        },
        integration: {
          properties: {
            schema: {
              label: { type: 'string' },
              disabled: { type: 'boolean' }
            },
            defaultValues: {
              label: 'Click me',
              disabled: false
            }
          },
          events: {
            click: { description: 'Button clicked', parameters: ['event'] },
            focus: { description: 'Button focused', parameters: ['event'] }
          },
          canvasIntegration: {
            resizable: true,
            draggable: true,
            selectable: true,
            minWidth: 60,
            minHeight: 30,
            defaultWidth: 100,
            defaultHeight: 40
          }
        },
        interactions: {
          'canvas.component.create': {
            pluginId: 'CanvasComponentPlugin',
            sequenceId: 'canvas-component-create-symphony'
          }
        }
      }
    ];
  });

  describe('enrichComponentWithTelemetry', () => {
    it('should enrich component with telemetry data', async () => {

      const sampleLogPath = path.join(__dirname, '../../../../../.logs/drag-drop-ai-generated-component.log');
      const chunks = await loadAndChunk(sampleLogPath, { chunkSize: 10 });

      const result = await service.enrichComponentWithTelemetry(
        sampleAiComponent,
        sampleLibraryComponents,
        chunks
      );

      expect(result).toBeDefined();
      expect(result.component).toBeDefined();
      expect(result.telemetryUsed).toBe(true);
      expect(result.interactionCount).toBeGreaterThan(0);
    });

    it('should extract patterns from telemetry', async () => {

      const sampleLogPath = path.join(__dirname, '../../../../../.logs/drag-drop-ai-generated-component.log');
      const chunks = await loadAndChunk(sampleLogPath, { chunkSize: 10 });

      const result = await service.enrichComponentWithTelemetry(
        sampleAiComponent,
        sampleLibraryComponents,
        chunks
      );

      expect(result.extractedPatterns).toBeDefined();
      if (result.extractedPatterns) {
        expect(result.extractedPatterns.componentType).toBeDefined();
        expect(Object.keys(result.extractedPatterns.operations).length).toBeGreaterThan(0);
      }
    });

    it('should add telemetry insights to integration', async () => {

      const sampleLogPath = path.join(__dirname, '../../../../../.logs/drag-drop-ai-generated-component.log');
      const chunks = await loadAndChunk(sampleLogPath, { chunkSize: 10 });

      const result = await service.enrichComponentWithTelemetry(
        sampleAiComponent,
        sampleLibraryComponents,
        chunks
      );

      expect(result.component.integration).toBeDefined();
      expect(result.component.integration?.telemetryInsights).toBeDefined();

      const insights = result.component.integration?.telemetryInsights;
      if (insights) {
        expect(insights.operationCount).toBeGreaterThanOrEqual(0);
        expect(insights.averageExecutionTime).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(insights.commonOperations)).toBe(true);
        expect(typeof insights.dataFlowPatterns).toBe('object');
      }
    });

    it('should merge library and telemetry interactions', async () => {

      const sampleLogPath = path.join(__dirname, '../../../../../.logs/drag-drop-ai-generated-component.log');
      const chunks = await loadAndChunk(sampleLogPath, { chunkSize: 10 });

      const result = await service.enrichComponentWithTelemetry(
        sampleAiComponent,
        sampleLibraryComponents,
        chunks
      );

      expect(result.component.interactions).toBeDefined();

      // Should have interactions from both library and telemetry
      const interactions = result.component.interactions || {};
      expect(Object.keys(interactions).length).toBeGreaterThan(0);

      // Check structure of interactions
      for (const [key, interaction] of Object.entries(interactions)) {
        expect(typeof key).toBe('string');
        expect(typeof interaction).toBe('object');
        if (typeof interaction === 'object' && interaction !== null) {
          expect((interaction as any).pluginId).toBeDefined();
          expect((interaction as any).sequenceId).toBeDefined();
        }
      }
    });

    it('should handle missing telemetry gracefully', async () => {
      const result = await service.enrichComponentWithTelemetry(
        sampleAiComponent,
        sampleLibraryComponents,
        []
      );

      expect(result).toBeDefined();
      expect(result.component).toBeDefined();
      expect(result.telemetryUsed).toBe(false);
    });

    it('should increase confidence with telemetry', async () => {

      const sampleLogPath = path.join(__dirname, '../../../../../.logs/drag-drop-ai-generated-component.log');
      const chunks = await loadAndChunk(sampleLogPath, { chunkSize: 10 });

      // Get base enrichment
      const baseResult = await service.enrichComponent(
        sampleAiComponent,
        sampleLibraryComponents
      );

      // Get telemetry enrichment
      const telemetryResult = await service.enrichComponentWithTelemetry(
        sampleAiComponent,
        sampleLibraryComponents,
        chunks
      );

      if (telemetryResult.telemetryUsed) {
        expect(telemetryResult.confidence).toBeGreaterThan(baseResult.confidence);
      }
    });
  });

  describe('interaction extraction', () => {
    it('should extract interactions with frequency and duration', async () => {

      const sampleLogPath = path.join(__dirname, '../../../../../.logs/drag-drop-ai-generated-component.log');
      const chunks = await loadAndChunk(sampleLogPath, { chunkSize: 10 });

      const result = await service.enrichComponentWithTelemetry(
        sampleAiComponent,
        sampleLibraryComponents,
        chunks
      );

      const interactions = result.component.interactions || {};

      for (const [key, interaction] of Object.entries(interactions)) {
        if (key.startsWith('canvas.component.')) {
          const inter = interaction as any;
          if (inter.frequency !== undefined) {
            expect(typeof inter.frequency).toBe('number');
            expect(inter.frequency).toBeGreaterThanOrEqual(0);
          }
          if (inter.averageDuration !== undefined) {
            expect(typeof inter.averageDuration).toBe('number');
            expect(inter.averageDuration).toBeGreaterThanOrEqual(0);
          }
        }
      }
    });

    it('should include event sequences in interactions', async () => {

      const sampleLogPath = path.join(__dirname, '../../../../../.logs/drag-drop-ai-generated-component.log');
      const chunks = await loadAndChunk(sampleLogPath, { chunkSize: 10 });

      const result = await service.enrichComponentWithTelemetry(
        sampleAiComponent,
        sampleLibraryComponents,
        chunks
      );

      const interactions = result.component.interactions || {};

      for (const [key, interaction] of Object.entries(interactions)) {
        if (key.startsWith('canvas.component.')) {
          const inter = interaction as any;
          if (inter.eventSequences) {
            expect(Array.isArray(inter.eventSequences)).toBe(true);
            for (const seq of inter.eventSequences) {
              expect(seq.sequenceId).toBeDefined();
              expect(seq.sequenceName).toBeDefined();
              expect(typeof seq.eventCount).toBe('number');
              expect(typeof seq.totalDuration).toBe('number');
            }
          }
        }
      }
    });
  });

  describe('data flow extraction', () => {
    it('should extract data flow patterns from telemetry', async () => {

      const sampleLogPath = path.join(__dirname, '../../../../../.logs/drag-drop-ai-generated-component.log');
      const chunks = await loadAndChunk(sampleLogPath, { chunkSize: 10 });

      const result = await service.enrichComponentWithTelemetry(
        sampleAiComponent,
        sampleLibraryComponents,
        chunks
      );

      const insights = result.component.integration?.telemetryInsights;
      expect(insights?.dataFlowPatterns).toBeDefined();
      expect(typeof insights?.dataFlowPatterns).toBe('object');
    });
  });
});

