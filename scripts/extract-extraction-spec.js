/*
 Extract a minimal self-isolation extraction spec from a RenderX log.
 Usage:
   node scripts/extract-extraction-spec.js <path-to-log>

 Output:
   writes outputs/extraction-spec.json

 Notes:
   - This is intentionally heuristic and resilient. If it cannot find a concrete
     library.component.drop.requested payload in the log, it emits a sane default
     baton for the Canvas Create path so the isolation harness can still run.
*/

import fs from 'fs';
import path from 'path';

function safeParseJsonSlice(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function tryExtractDropPayload(lines) {
  // Look for common variants of drop/create request logging lines and extract a JSON object
  const patterns = [
    /library\.component\.drop\.requested[^\{]*({.*})/,
    /canvas\.component\.create\.requested[^\{]*({.*})/,
    /EventRouter\.publish\([^,]+,\s*({[\s\S]*?})/,
  ];

  for (const line of lines) {
    for (const re of patterns) {
      const m = line.match(re);
      if (m && m[1]) {
        const payload = safeParseJsonSlice(m[1]);
        if (payload && typeof payload === 'object') {
          // Normalize shape { component, position, containerId, correlationId }
          const component = payload.component || {};
          const position = payload.position || { x: 50, y: 80 };
          const containerId = payload.containerId ?? null;
          const correlationId = payload.correlationId || `corr-${Date.now()}`;
          return { component, position, containerId, correlationId };
        }
      }
    }
  }
  return null;
}

function defaultBaton() {
  return {
    component: {
      template: {
        tag: 'button',
        text: 'Click Me',
        classes: ['rx-comp', 'rx-button'],
        css: '.rx-button { padding: 8px 16px; border-radius: 4px; }',
        dimensions: { width: 120, height: 40 },
        content: { variant: 'primary', size: 'medium' }
      }
    },
    position: { x: 50, y: 80 },
    containerId: null,
    correlationId: `corr-${Date.now()}`,
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/extract-extraction-spec.js <path-to-log>');
    process.exit(1);
  }

  const logPath = path.resolve(process.cwd(), args[0]);
  if (!fs.existsSync(logPath)) {
    console.error(`Log file not found: ${logPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(logPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);

  const drop = tryExtractDropPayload(lines) || defaultBaton();

  // Build minimal extraction spec for Canvas Component Create sequence
  const spec = {
    sequence_id: 'canvas-component-create-symphony',
    movement_id: 'create',
    beats: [
      'resolveTemplate',
      'registerInstance',
      'createNode',
      'renderReact',
      'notifyUi',
      'enhanceLine'
    ],
    code_units: [
      'create.arrangement#resolveTemplate',
      'create.io#registerInstance',
      'create.stage-crew#createNode',
      'create.react.stage-crew#renderReact',
      'create.notify#notifyUi',
      'augment.line.stage-crew#enhanceLine'
    ],
    contracts_in: {
      baton: drop
    },
    dependencies: {
      io: 'stubbed kv.put',
      dom: '#rx-canvas',
      topics: ['canvas.component.created'],
      logger: 'stubbed',
    },
    env: { TZ: process.env.TZ || 'UTC' },
    seed: Math.floor(Math.random() * 1_000_000),
    privacy: { redactions: [] },
  };

  const outDir = path.resolve(process.cwd(), 'outputs');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'extraction-spec.json');
  fs.writeFileSync(outPath, JSON.stringify(spec, null, 2), 'utf8');

  console.log(`Extraction spec written to: ${outPath}`);
}

main();

