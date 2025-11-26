import { describe, it, expect } from 'vitest';
import * as pkg from '../src/index';

describe('@renderx-plugins/canvas: UI export + register()', () => {
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
  it('exports CanvasPage and register()', async () => {
    expect(typeof (pkg as any).CanvasPage).toBe('function');
    expect(typeof (pkg as any).register).toBe('function');
  });
});

