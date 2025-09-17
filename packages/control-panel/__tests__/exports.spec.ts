import { describe, it, expect } from 'vitest';

import { ControlPanel, register } from '@renderx-plugins/control-panel';
import { handlers as selectionHandlers } from '@renderx-plugins/control-panel/symphonies/selection/selection.symphony';

describe('@renderx-plugins/control-panel package exports', () => {
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

