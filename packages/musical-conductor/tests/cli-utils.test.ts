import { join } from 'path';
import fs from 'fs';

// CLI utils are CommonJS; require them
const { parseArgs, parseContextString, parseContextFile } = require('../tools/cli/cli-utils.cjs');

describe('cli-utils', () => {
  test('parseArgs: combines multi-token JSON for --context', () => {
    const raw = [
      '--context',
      '{component:{template:{tag:button,text:CLI button}},position:{x:50,y:50}}',
    ];

    const parsed = parseArgs(raw);
    expect(parsed.context).toBeDefined();
    expect(typeof parsed.context).toBe('string');
    expect(parsed.context).toContain('template');
  });

  test('parseContextString: parses pure JSON', () => {
    const s = JSON.stringify({ component: { template: { tag: 'button', text: 'Hello' } }, position: { x: 1, y: 2 } });
    const out = parseContextString(s);
    expect(out).toBeDefined();
    expect(out.component.template.tag).toBe('button');
    expect(out.position.x).toBe(1);
  });

  test('parseContextString: parses JS-like object with unquoted keys and multi-word value', () => {
    const s = '{component:{template:{tag:button,text:CLI button}},position:{x:50,y:50}}';
    const out = parseContextString(s);
    expect(out).toBeDefined();
    expect(out.component.template.text).toBe('CLI button');
    expect(out.position.x).toBe(50);
  });

  test('parseContextFile: reads JSON file', () => {
    const filePath = join(__dirname, 'tmp-context.json');
    const obj = { test: 'value', n: 123 };
    fs.writeFileSync(filePath, JSON.stringify(obj), 'utf8');
    const out = parseContextFile(filePath);
    expect(out.test).toBe('value');
    expect(out.n).toBe(123);
    fs.unlinkSync(filePath);
  });
});
