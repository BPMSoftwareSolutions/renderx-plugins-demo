import { TemplateDiscoveryService } from './ai/template-discovery';
import { PatternExtractor } from './ai/pattern-extractor';
import { TemplateSynthesisEngine, FullComponent } from './ai/template-synthesis';
import { ComponentLoader } from './loaders/component-loader';

async function main() {
  // User prompt
  const prompt = process.argv[2] || 'Create a button with variants';
  console.log('User prompt:', prompt);

  // Load real components from json-components/
  console.log('\n📦 Loading real components from json-components/...');
  const loader = new ComponentLoader();
  let loadedComponents: FullComponent[] = [];

  try {
    const loaded = await loader.loadAll({ basePath: './json-components' });
    loadedComponents = loaded.map(comp => {
      const metadata = (comp.data.metadata as any) || { type: comp.id, name: comp.id };
      const ui = (comp.data.ui as any) || { template: '<div></div>' };
      return {
        metadata: { type: metadata.type || comp.id, name: metadata.name || comp.id },
        ui: { template: ui.template || '<div></div>', ...ui },
        integration: comp.data.integration,
        interactions: comp.data.interactions
      } as FullComponent;
    });
    console.log(`✅ Loaded ${loadedComponents.length} components`);
  } catch {
    console.warn('⚠️ Could not load real components, using mock data');
    loadedComponents = [
      {
        metadata: { type: 'button', name: 'Button', tags: ['primary', 'action'] },
        ui: { template: '<button>{{content}}</button>' }
      },
      {
        metadata: { type: 'button', name: 'Button', tags: ['danger'] },
        ui: { template: '<button class="danger">{{content}}</button>' }
      },
      {
        metadata: { type: 'input', name: 'Input', tags: ['form', 'text'] },
        ui: { template: '<input type="text" />' }
      }
    ];
  }

  // 1. Exact match detection
  console.log('\n[1. Exact Match Detection]');
  const discovery = new TemplateDiscoveryService();
  discovery.componentLibrary = loadedComponents.map(c => c.metadata);
  const exact = await discovery.detectExactMatch(prompt);
  console.log(JSON.stringify(exact, null, 2));

  // 2. Semantic ranking
  console.log('\n[2. Semantic Similarity Ranking]');
  const ranked = discovery.rankSimilarComponents(prompt);
  if (ranked.length === 0) {
    console.log('No similar components found');
  } else {
    ranked.forEach((r, i) => {
      console.log(`#${i + 1}: ${r.component.name} (score: ${r.score}, ${r.explanation})`);
    });
  }

  // Get full component objects for ranked results
  const rankedFullComponents = ranked
    .map(r => loadedComponents.find(c => c.metadata.name === r.component.name))
    .filter((c): c is FullComponent => c !== undefined);

  // 3. Pattern extraction
  console.log('\n[3. Pattern Extraction]');
  const extractor = new PatternExtractor();
  const patterns = await extractor.extractPatterns(rankedFullComponents.map(c => c.metadata));
  if (patterns.length === 0) {
    console.log('No patterns extracted');
  } else {
    patterns.forEach((p, i) => {
      console.log(`#${i + 1}: ${p.name}`);
      console.log(`   Description: ${p.description}`);
      console.log(`   Components: ${p.components.join(', ')}`);
      console.log(`   Frequency: ${p.frequency}`);
    });
  }

  // 4. Template synthesis with REAL component data
  console.log('\n[4. Template Synthesis (with Real Component Data)]');
  const engine = new TemplateSynthesisEngine();
  const synthesized = await engine.synthesizeComponent(prompt, rankedFullComponents);

  console.log('\n📋 Synthesized Component:');
  console.log(JSON.stringify({
    metadata: synthesized.metadata,
    ui: {
      template: synthesized.ui.template,
      styles: {
        css: synthesized.ui.styles?.css ? `${synthesized.ui.styles.css.substring(0, 100)}...` : 'N/A',
        variables: synthesized.ui.styles?.variables ? Object.keys(synthesized.ui.styles.variables).length + ' variables' : 'N/A',
        library: synthesized.ui.styles?.library ? 'Present' : 'N/A'
      }
    },
    integration: synthesized.integration ? {
      properties: synthesized.integration.properties ? 'Present' : 'N/A',
      events: synthesized.integration.events ? Object.keys(synthesized.integration.events).length + ' events' : 'N/A',
      canvasIntegration: synthesized.integration.canvasIntegration ? 'Present' : 'N/A'
    } : 'N/A',
    interactions: synthesized.interactions ? Object.keys(synthesized.interactions).length + ' interactions' : 'N/A',
    sourceComponents: synthesized.sourceComponents,
    synthesisStrategy: synthesized.synthesisStrategy,
    confidence: synthesized.confidence
  }, null, 2));

  // Show full template for inspection
  console.log('\n📝 Full Synthesized Template:');
  console.log(synthesized.ui.template);

  // Show CSS preview
  if (synthesized.ui.styles?.css) {
    console.log('\n🎨 CSS Preview (first 500 chars):');
    console.log(synthesized.ui.styles.css.substring(0, 500) + '...');
  }

  // Show properties
  if (synthesized.integration?.properties?.schema) {
    console.log('\n⚙️ Properties Schema:');
    console.log(JSON.stringify(synthesized.integration.properties.schema, null, 2));
  }

  // Show interactions
  if (synthesized.interactions && Object.keys(synthesized.interactions).length > 0) {
    console.log('\n🔌 Interactions (Plugin/Sequence Mappings):');
    console.log(JSON.stringify(synthesized.interactions, null, 2));
  }

  // Show full synthesized component JSON
  console.log('\n📦 Full Synthesized Component JSON:');
  console.log(JSON.stringify(synthesized, null, 2));
}

main().catch(err => {
  console.error('Error in playground:', err);
  process.exit(1);
});
