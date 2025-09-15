import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const idx = path.join(process.cwd(), 'json-sequences', 'control-panel', 'index.json');

describe('Control Panel handlersPath use bare package specifiers', () => {
  it('all control-panel handlersPath point to @renderx-plugins/control-panel subpaths', () => {
    const raw = fs.readFileSync(idx, 'utf8');
    const json = JSON.parse(raw);
    expect(Array.isArray(json.sequences)).toBe(true);
    for (const entry of json.sequences) {
      expect(typeof entry.handlersPath).toBe('string');
      expect(entry.handlersPath.startsWith('@renderx-plugins/control-panel/')).toBe(true);
    }
  });
});

