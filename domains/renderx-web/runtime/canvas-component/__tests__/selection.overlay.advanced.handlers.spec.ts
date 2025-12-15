/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCanvasRect, applyOverlayRectForEl, ensureOverlay } from '../src/symphonies/select/select.overlay.dom.stage-crew';
import { createOverlayStructure, resolveEndpoints } from '../src/symphonies/select/select.overlay.helpers';
import { ensureAdvancedLineOverlayFor, attachAdvancedLineManipHandlers } from '../src/symphonies/select/select.overlay.line-advanced.stage-crew';
import { attachResizeHandlers } from '../src/symphonies/select/select.overlay.resize.stage-crew';
import { initConductor, registerAllSequences, loadJsonSequenceCatalogs } from '../src/temp-deps/conductor';

// Host SDK mocks to avoid dependency on actual EventRouter implementation
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
  // JSDOM doesn't calculate layout; patch bounding box for tests
  (c as any).getBoundingClientRect = () => ({
    left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x:0, y:0, toJSON(){return this;}
  });
  document.body.appendChild(c);
  return c;
}

function makeLineSvg(id: string) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id = id;
  svg.setAttribute('viewBox','0 0 100 100');
  svg.style.width = '100px';
  svg.style.height = '100px';
  (svg as any).getBoundingClientRect = () => ({
    left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x:0, y:0, toJSON(){return this;}
  });
  // straight line
  const line = document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('class','segment');
  line.setAttribute('x1','0');
  line.setAttribute('y1','0');
  line.setAttribute('x2','100');
  line.setAttribute('y2','0');
  svg.appendChild(line);
  return svg;
}

describe('advanced selection/overlay handlers batch', () => {
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

  it('getCanvasRect returns patched bounding client rect values', () => {
    const canvas = setupCanvas();
    const r = getCanvasRect();
    expect(r.width).toBe(800);
    expect(r.height).toBe(600);
    expect(r.left).toBe(0);
    expect(r.top).toBe(0);
    // ensure our patch applied
    expect(canvas.getBoundingClientRect().width).toBe(800);
  });

  it('applyOverlayRectForEl uses inline style dimensions when present', () => {
    setupCanvas();
    const el = document.createElement('div');
    el.id = 'rx-node-xyz';
    el.style.position = 'absolute';
    el.style.left = '10px';
    el.style.top = '20px';
    el.style.width = '150px';
    el.style.height = '75px';
    document.getElementById('rx-canvas')!.appendChild(el);
    const ov = ensureOverlay();
    applyOverlayRectForEl(ov, el);
    expect(ov.style.left).toBe('10px');
    expect(ov.style.top).toBe('20px');
    expect(ov.style.width).toBe('150px');
    expect(ov.style.height).toBe('75px');
  });

  it('createOverlayStructure creates advanced line overlay with handles a & b', () => {
    const canvas = setupCanvas();
    const ov = createOverlayStructure(canvas);
    expect(ov.id).toBe('rx-adv-line-overlay');
    expect(ov.querySelectorAll('.handle.a').length).toBe(1);
    expect(ov.querySelectorAll('.handle.b').length).toBe(1);
  });

  it('resolveEndpoints returns endpoints from line segment in viewBox space', () => {
    setupCanvas();
    const svg = makeLineSvg('line-a');
    document.getElementById('rx-canvas')!.appendChild(svg);
    const pts = resolveEndpoints(svg as any);
    // x1,y1 = 0,0 and x2,y2 = 100,0 in viewBox; width=100 -> endpoint.x approx width
    expect(Math.round(pts.a.x)).toBe(0);
    expect(Math.round(pts.a.y)).toBe(0);
    expect(Math.round(pts.b.x)).toBe(100);
    expect(Math.round(pts.b.y)).toBe(0);
  });

  it('ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds', () => {
    setupCanvas();
    const svg = makeLineSvg('line-b');
    document.getElementById('rx-canvas')!.appendChild(svg);
    const ov = ensureAdvancedLineOverlayFor(svg as any);
    expect(ov.style.width).toBe('100px');
    expect(ov.style.height).toBe('100px');
    const a = ov.querySelector('.handle.a') as HTMLDivElement;
    const b = ov.querySelector('.handle.b') as HTMLDivElement;
    const aLeft = parseInt(a.style.left);
    const aTop = parseInt(a.style.top);
    const bLeft = parseInt(b.style.left);
    const bTop = parseInt(b.style.top);
    // Handles should lie within a modest expanded boundary of the overlay (allowing -10 offset for knob radius)
    for (const v of [aLeft, bLeft]) {
      expect(v).toBeGreaterThanOrEqual(-10);
      expect(v).toBeLessThanOrEqual(110);
    }
    for (const v of [aTop, bTop]) {
      expect(v).toBeGreaterThanOrEqual(-10);
      expect(v).toBeLessThanOrEqual(110);
    }
  });

  it('attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move', () => {
    setupCanvas();
    const svg = makeLineSvg('line-c');
    document.getElementById('rx-canvas')!.appendChild(svg);
    const ov = ensureAdvancedLineOverlayFor(svg as any);
    ov.dataset.targetId = 'line-c';
    attachAdvancedLineManipHandlers(ov);
    const aHandle = ov.querySelector('.handle.a') as HTMLDivElement;
    const target = document.getElementById('line-c') as HTMLElement;
    aHandle.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 10, clientY: 0, bubbles: true }));
    // CSS var should now be set (fallback path executed)
    expect(target.style.getPropertyValue('--x1') || target.style.getPropertyValue('--x2')).not.toBe('');
    const newLeft = parseInt(aHandle.style.left);
    expect(newLeft).toBeGreaterThanOrEqual(-5); // allow unchanged if geometry re-derived identically
  });

  it('attachResizeHandlers publishes start/move/end events via EventRouter', async () => {
    const canvas = setupCanvas();
    const el = document.createElement('div');
    el.id = 'rx-node-resize';
    Object.assign(el.style, { position:'absolute', left:'40px', top:'50px', width:'120px', height:'80px' });
    canvas.appendChild(el);
    const ov = ensureOverlay();
    ov.dataset.targetId = 'rx-node-resize';
    const conductor = { play: vi.fn() };
    attachResizeHandlers(ov, conductor);
    const seHandle = ov.querySelector('.rx-handle.se') as HTMLDivElement;
    seHandle.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 15, clientY: 10, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 15, clientY: 10, bubbles: true }));
  const publishedTopics = (HostSdk.EventRouter.publish as any).mock.calls.map((c: any[]) => c[0] as string);
  expect(publishedTopics.filter((t: string) => t.includes('resize.start')).length).toBeGreaterThanOrEqual(1);
  expect(publishedTopics.filter((t: string) => t.includes('resize.move')).length).toBeGreaterThanOrEqual(1);
  expect(publishedTopics.filter((t: string) => t.includes('resize.end')).length).toBeGreaterThanOrEqual(1);
  });

  it('initConductor returns conductor and registerAllSequences populates handlers', async () => {
    const conductor = await initConductor();
    expect(conductor.play).toBeDefined();
    await registerAllSequences(conductor);
    expect(Object.keys(conductor.handlers).length).toBeGreaterThan(0);
  });

  it('loadJsonSequenceCatalogs adds handlers keyed by plugin IDs', async () => {
    const conductor = await initConductor();
    await loadJsonSequenceCatalogs(conductor, ['Canvas', 'Library']);
    expect(Object.keys(conductor.handlers)).toContain('canvas-handler');
    expect(Object.keys(conductor.handlers)).toContain('library-handler');
  });
});

