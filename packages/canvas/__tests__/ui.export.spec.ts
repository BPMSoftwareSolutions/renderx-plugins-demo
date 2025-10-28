import { describe, it, expect } from 'vitest';
import * as pkg from '../src/index';

describe('@renderx-plugins/canvas: UI export + register()', () => {
  it('exports CanvasPage and register()', async () => {
    expect(typeof (pkg as any).CanvasPage).toBe('function');
    expect(typeof (pkg as any).register).toBe('function');
  });
});

