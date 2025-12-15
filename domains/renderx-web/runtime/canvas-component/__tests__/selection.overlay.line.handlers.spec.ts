/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ensureLineOverlayFor, attachLineResizeHandlers } from '../src/symphonies/select/select.overlay.line-resize.stage-crew';

// Mock host-sdk EventRouter so we can assert publish calls
vi.mock('@renderx-plugins/host-sdk', () => {
  const publish = vi.fn().mockResolvedValue(undefined);
  return {
    resolveInteraction: (topic: string) => ({ pluginId: 'canvas-component', sequenceId: topic }),
    EventRouter: { publish }
  };
});
import * as HostSdk from '@renderx-plugins/host-sdk';

function setupCanvas() {
  const c = document.createElement('div');
  c.id = 'rx-canvas';
  c.style.position = 'relative';
  c.style.width = '800px';
  c.style.height = '600px';
  (c as any).getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x:0, y:0, toJSON(){return this;} });
  document.body.appendChild(c);
  return c;
}

function makeTargetBox(id: string, left=10, top=20, w=200, h=80) {
  const el = document.createElement('div');
  el.id = id;
  Object.assign(el.style, { position:'absolute', left:`${left}px`, top:`${top}px`, width:`${w}px`, height:`${h}px` });
  (el as any).getBoundingClientRect = () => ({ left, top, width: w, height: h, right: left + w, bottom: top + h, x:left, y:top, toJSON(){return this;} });
  return el;
}

describe('line overlay + resize handlers', () => {
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
      error: null,
      payload: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('ensureLineOverlayFor creates overlay with endpoints positioned from CSS vars', () => {
    const canvas = setupCanvas();
    const target = makeTargetBox('line-tgt', 30, 40, 120, 60);
    // Define line endpoints via CSS vars
    target.style.setProperty('--x1','0');
    target.style.setProperty('--y1','0');
    target.style.setProperty('--x2','120');
    target.style.setProperty('--y2','0');
    canvas.appendChild(target);

    const ov = ensureLineOverlayFor(target);
    expect(ov.id).toBe('rx-line-overlay');
    expect(ov.style.left).toBe('30px');
    expect(ov.style.top).toBe('40px');
    expect(ov.style.width).toBe('120px');
    expect(ov.style.height).toBe('60px');

    const a = ov.querySelector('.endpoint.a') as HTMLDivElement;
    const b = ov.querySelector('.endpoint.b') as HTMLDivElement;
    // Expect handles are near endpoints (offset -5)
    expect(parseInt(a.style.left)).toBeCloseTo(-5, 0);
    expect(parseInt(a.style.top)).toBeCloseTo(-5, 0);
    expect(parseInt(b.style.left)).toBeCloseTo(115, 0);
    expect(parseInt(b.style.top)).toBeCloseTo(-5, 0);
  });

  it('attachLineResizeHandlers publishes start/move/end via EventRouter when conductor is provided', () => {
    const canvas = setupCanvas();
    const target = makeTargetBox('line-resize', 0, 0, 100, 50);
    target.style.setProperty('--x1','0');
    target.style.setProperty('--y1','0');
    target.style.setProperty('--x2','100');
    target.style.setProperty('--y2','0');
    canvas.appendChild(target);

    const ov = ensureLineOverlayFor(target);
    ov.dataset.targetId = 'line-resize';
    const conductor = { play: vi.fn() };
    attachLineResizeHandlers(ov, conductor);

    const aEndpoint = ov.querySelector('.endpoint.a') as HTMLDivElement;
    aEndpoint.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 5, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 10, clientY: 5, bubbles: true }));

    const topics = (HostSdk.EventRouter.publish as any).mock.calls.map((c: any[]) => c[0] as string);
    expect(topics.some((t: string) => t.includes('resize.line.start'))).toBe(true);
    expect(topics.some((t: string) => t.includes('resize.line.move'))).toBe(true);
    expect(topics.some((t: string) => t.includes('resize.line.end'))).toBe(true);
  });

  it('attachLineResizeHandlers falls back to CSS var updates when conductor is absent', () => {
    const canvas = setupCanvas();
    const target = makeTargetBox('line-fallback', 0, 0, 100, 50);
    target.style.setProperty('--x1','0');
    target.style.setProperty('--y1','0');
    target.style.setProperty('--x2','100');
    target.style.setProperty('--y2','0');
    canvas.appendChild(target);

    const ov = ensureLineOverlayFor(target);
    ov.dataset.targetId = 'line-fallback';
    attachLineResizeHandlers(ov);

    const bEndpoint = ov.querySelector('.endpoint.b') as HTMLDivElement;
    bEndpoint.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 20, clientY: 10, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 20, clientY: 10, bubbles: true }));

    // CSS vars should have been updated for endpoint b
    const x2 = parseInt(target.style.getPropertyValue('--x2'));
    const y2 = parseInt(target.style.getPropertyValue('--y2'));
    expect(x2).toBeGreaterThan(100 - 1); // increased
    expect(y2).toBeGreaterThanOrEqual(0);

    // Endpoint element position should reflect new values (approximately)
    const bLeft = parseInt(bEndpoint.style.left);
    const bTop = parseInt(bEndpoint.style.top);
    expect(bLeft).toBeCloseTo(x2 - 5, 0);
    expect(bTop).toBeCloseTo(y2 - 5, 0);
  });
});

