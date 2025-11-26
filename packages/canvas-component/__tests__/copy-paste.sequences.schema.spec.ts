/* @vitest-environment jsdom */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Beat = { dynamics?: string } & Record<string, unknown>;

describe('copy/paste sequences schema (canvas-component)', () => {
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
  const root = join(__dirname, '..', 'json-sequences', 'canvas-component');
  const files = [
    'copy.json',
    'paste.json',
  ];

  it('every beat declares dynamics', () => {
    for (const file of files) {
      const json = JSON.parse(readFileSync(join(root, file), 'utf-8')) as any;
      const beats: Beat[] = json.movements?.[0]?.beats || [];
      expect(beats.length).toBeGreaterThan(0);
      for (const beat of beats) {
        expect(typeof beat.dynamics).toBe('string');
        expect((beat.dynamics || '').length).toBeGreaterThan(0);
      }
    }
  });
});

