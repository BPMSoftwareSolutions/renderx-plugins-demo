import { describe, it, expect } from 'vitest';

import { ControlPanel, register } from '@renderx-plugins/control-panel';
import { handlers as selectionHandlers } from '@renderx-plugins/control-panel/symphonies/selection/selection.symphony';

describe('@renderx-plugins/control-panel package exports', () => {
  let ctx: any;
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
  it('exports ControlPanel UI component', () => {
    expect(typeof ControlPanel).toBe('function');
  });

  it('exports register() function (no-op allowed)', () => {
    expect(typeof register).toBe('function');
  });

  it('exports selection symphony handlers', () => {
    expect(selectionHandlers && typeof selectionHandlers).toBe('object');
    expect(typeof selectionHandlers.deriveSelectionModel).toBe('function');
    expect(typeof selectionHandlers.notifyUi).toBe('function');
  });
});

