/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { exportSvgToGif } from '../src/symphonies/export/export.gif.stage-crew';

// Mock gif.js and worker to avoid heavy encoding + workers
vi.mock('gif.js.optimized', () => ({
  default: class FakeGIF {
    frames: any[] = [];
    cbs: Record<string, Function> = {};
    constructor(_opts?: any) {}
    addFrame(canvas: any, opts: any){ this.frames.push({ canvas, opts }); }
    on(evt: string, cb: Function){ this.cbs[evt] = cb; }
    render(){ setTimeout(() => {
      const blob = new Blob(['gifdata'], { type: 'image/gif' });
      this.cbs['finished']?.(blob);
    }, 0); }
  }
}));
vi.mock('gif.js.optimized/dist/gif.worker.js?url', () => ({ default: 'worker.js' }));

describe('exportSvgToGif isolated', () => {
  it('success minimal export triggers download without error', async () => {
    const ctx: any = { payload: {}, logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } };
    // Mock canvas context
    (HTMLCanvasElement.prototype as any).getContext = vi.fn().mockReturnValue({
      drawImage: () => {},
      clearRect: () => {},
      fillRect: () => {},
      fillStyle: ''
    });
    // Mock URL APIs used by handler
    (globalThis as any).URL = {
      createObjectURL: vi.fn().mockReturnValue('blob:fake'),
      revokeObjectURL: vi.fn()
    };
    // Mock Image to auto-fire onload
    (globalThis as any).Image = class { onload: Function | undefined; onerror: Function | undefined; set src(_v: string){ setTimeout(()=> this.onload && this.onload(),0); } } as any;
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id='svg-gif';
    svg.style.width='12px';
    svg.style.height='18px';
    // add some inner content
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('width','10'); rect.setAttribute('height','10'); rect.setAttribute('fill','red');
    svg.appendChild(rect);
    document.body.appendChild(svg);

    await exportSvgToGif({ targetId: 'svg-gif', options: { fps: 1, durationMs: 0 } }, ctx);
    // Wait one tick for fake GIF render completion
    await new Promise(r => setTimeout(r, 5));

    expect(ctx.payload.error).toBeUndefined();
    expect(ctx.payload.downloadTriggered).toBe(true);
    expect(ctx.payload.gifSize).toBeGreaterThan(0);
  });

  it('sets error when 2D context unavailable', async () => {
    const ctx: any = { payload: {}, logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } };
    // Force getContext to return null
    (HTMLCanvasElement.prototype as any).getContext = vi.fn().mockReturnValue(null);
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id='svg-gif-missing';
    svg.style.width='10px';
    svg.style.height='10px';
    document.body.appendChild(svg);
    await exportSvgToGif({ targetId: 'svg-gif-missing', options: {} }, ctx);
    expect(ctx.payload.error).toMatch(/2D context unavailable/);
    expect(ctx.payload.downloadTriggered).toBeUndefined();
  });
});
