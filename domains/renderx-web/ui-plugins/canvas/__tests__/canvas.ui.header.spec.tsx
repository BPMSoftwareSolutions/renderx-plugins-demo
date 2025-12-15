/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

vi.mock('@renderx-plugins/host-sdk', () => {
  const publish = vi.fn().mockResolvedValue(undefined);
  let selectionHandler: ((p: any)=>void) | null = null;
  const conductor = { play: vi.fn() };
  return {
    useConductor: () => conductor,
    resolveInteraction: (topic: string) => ({ pluginId: 'canvas-component', sequenceId: topic }),
    EventRouter: {
      publish,
      subscribe: (_topic: string, cb: (payload: any)=>void) => {
        selectionHandler = cb;
        return () => { selectionHandler = null; };
      },
      // helper to trigger from test
      __triggerSelection: (payload: any) => selectionHandler?.(payload),
    }
  };
});

import * as Host from '@renderx-plugins/host-sdk';
import { CanvasHeader } from '../src/ui/CanvasHeader';

function getConductor() {
  return (Host as any).useConductor();
}

describe('CanvasHeader interactions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('exports canvas via conductor.play when clicking 💾', async () => {
    render(<CanvasHeader />);
    const exportBtn = screen.getByTitle('Export Canvas');
    fireEvent.click(exportBtn);
    const c = getConductor();
    expect(c.play).toHaveBeenCalled();
    const call = c.play.mock.calls[0];
    expect(call[1]).toBe('canvas.component.export');
  });

  it('publishes import request via EventRouter when clicking 📂', async () => {
    render(<CanvasHeader />);
    const importBtn = screen.getByTitle('Import .ui');
    fireEvent.click(importBtn);
    expect((Host.EventRouter.publish as any).mock.calls.map((c: any[])=>c[0])).toContain('canvas.component.import.requested');
  });

  it('enables and routes GIF/MP4 export after selection change', async () => {
    render(<CanvasHeader />);
    await act(async () => {
      await Promise.resolve();
      (Host.EventRouter as any).__triggerSelection({ id: 'svg-1' });
    });

    const gifBtn = await waitFor(() => screen.getByTitle('Export SVG to GIF'));
    const mp4Btn = await waitFor(() => screen.getByTitle('Export SVG to MP4'));

    fireEvent.click(gifBtn);
    fireEvent.click(mp4Btn);

    const c = getConductor();
    const seqIds = c.play.mock.calls.map((c: any[]) => c[1]);
    expect(seqIds).toContain('canvas.component.export.gif');
    expect(seqIds).toContain('canvas.component.export.mp4');
  });
});
