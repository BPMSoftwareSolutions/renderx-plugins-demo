/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@renderx-plugins/host-sdk', () => {
  const conductor = { play: vi.fn() };
  return {
    useConductor: () => conductor,
    resolveInteraction: (topic: string) => ({ pluginId: 'canvas-component', sequenceId: topic }),
    EventRouter: {
      publish: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(),
    }
  };
});

const onDropSpy = vi.fn();
vi.mock('../src/ui/CanvasDrop', () => ({
  onDropForTest: (...args: any[]) => onDropSpy(...args),
}));

import { CanvasPage } from '../src/ui/CanvasPage';

describe('CanvasPage basics', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
    onDropSpy.mockReset();
  });

  it('renders header and canvas container', async () => {
    render(<CanvasPage />);
    expect(document.querySelector('.canvas-header')).toBeTruthy();
    expect(document.getElementById('rx-canvas')).toBeTruthy();
  });

  it('delegates drop to onDropForTest with conductor', async () => {
    render(<CanvasPage />);
    const area = document.querySelector('.canvas-content') as HTMLElement;
    const evt = new Event('drop', { bubbles: true });
    area?.dispatchEvent(evt);

    expect(onDropSpy).toHaveBeenCalled();
  });
});
